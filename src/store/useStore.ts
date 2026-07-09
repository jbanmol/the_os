import { useState, useEffect } from "react";
import { AppState, OperatingMode, DailyScores, Course } from "../types";
import { initialAppState } from "./initialState";
import { getLogicalDate } from "../lib/dateUtils";
import { auth } from "../lib/firebaseClient";

/**
 * Mathematically calculates exact scores based on actual state metrics to ensure 100% accuracy.
 */
export function calculateScores(state: AppState) {
  // 1. Academic Prep (Max 25)
  let academicBase = 0;
  state.courses.forEach((course) => {
    // 4 weeks per course
    [1, 2, 3, 4].forEach((wk) => {
      const status = course.weekStatuses[wk] || "not-started";
      if (status === "done") {
        academicBase += 1.5;
      } else if (status === "in-progress") {
        academicBase += 0.5;
      }
    });
    // recall sheet
    if (course.recallSheetStatus === "done") academicBase += 1.5;
    else if (course.recallSheetStatus === "in-progress") academicBase += 0.5;

    // practice questions
    if (course.practiceQuestions === "done") academicBase += 1.5;
    else if (course.practiceQuestions === "in-progress") academicBase += 0.5;

    // bonus if no weak topics and we have completed at least something
    if (course.weakTopics.length === 0 && Object.values(course.weekStatuses).some((s) => s === "done")) {
      academicBase += 0.5;
    }
  });
  academicBase = Math.min(25, Math.round(academicBase * 10) / 10);

  // 2. Build & Kidaura (Max 25)
  const codingHrs = state.build.pureCodingHours || 0;
  const codingPoints = Math.min(10, codingHrs * 2.5); // 4 hours = max 10 points

  let avgProgress = 0;
  let vivaSum = 0;
  if (state.projects.length > 0) {
    const progSum = state.projects.reduce((acc, p) => acc + (p.progress || 0), 0);
    avgProgress = progSum / state.projects.length;
    vivaSum = state.projects.reduce((acc, p) => acc + (p.vivaReadiness || 0) + (p.codeOwnershipLevel || 0), 0);
  }
  const progressPoints = Math.min(5, (avgProgress / 100) * 5);
  const vivaPoints = Math.min(5, (vivaSum / 30) * 5); // Max possible is 30 across 3 projects

  let kidauraPoints = 0;
  if (state.kidaura.osDashboardIntegrationStatus === "integrated") kidauraPoints = 5;
  else if (state.kidaura.osDashboardIntegrationStatus === "understood") kidauraPoints = 3.5;
  else if (state.kidaura.osDashboardIntegrationStatus === "learning") kidauraPoints = 1.5;

  const buildBase = Math.min(25, Math.round((codingPoints + progressPoints + vivaPoints + kidauraPoints) * 10) / 10);

  // 3. Body Practice (Max 20)
  let bodyBase = 0;
  const kriyaMin = state.body.kriyaDurationMinutes || 0;
  if (kriyaMin >= 60) bodyBase += 10;
  else if (kriyaMin >= 45) bodyBase += 8;
  else if (kriyaMin >= 30) bodyBase += 5;
  else if (kriyaMin > 0) bodyBase += 3;

  if (state.body.movementDone) bodyBase += 4;
  bodyBase += Math.min(6, state.body.streakDays || 0);
  const bodyBaseClamped = Math.min(25, bodyBase * 1.25);

  // 4. Sleep Recovery (Max 20 baseline, scaled to 25)
  let sleepBase = 0;
  const sleepHrs = state.sleep.totalSleepHours || 0;
  if (sleepHrs >= 7 && sleepHrs <= 8.5) sleepBase += 10;
  else if (sleepHrs >= 6 && sleepHrs < 7) sleepBase += 7;
  else if (sleepHrs >= 5 && sleepHrs < 6) sleepBase += 5;
  else if (sleepHrs > 0) sleepBase += 2;

  // Inverted cycle penalty
  const sTime = (state.sleep.sleepTime || "").toLowerCase();
  if (
    (sTime.includes("am") && !sTime.includes("12") && !sTime.includes("5") && !sTime.includes("6") && !sTime.includes("7") && !sTime.includes("8")) ||
    sTime.includes("11") ||
    sTime.includes("10") ||
    sTime.includes("12:00 pm") ||
    sTime.includes("1:00 pm") ||
    sTime.includes("2:00 pm") ||
    sTime.includes("3:00 pm")
  ) {
    sleepBase -= 2; // Slept too late in the morning/afternoon
  }

  const consistencyVal = state.sleep.consistency || 3;
  sleepBase += (consistencyVal / 10) * 6;

  if (state.sleep.sunlight || state.health.sunlight) {
    sleepBase += 4;
  }
  const sleepBaseClamped = Math.max(0, Math.min(25, Math.round(sleepBase * 1.25 * 10) / 10));

  // 5. System Use (Max 10 baseline, retained but excluded from rating weighting)
  let leakPoints = 0;
  const numLeaks = state.activeLeaks ? state.activeLeaks.length : 0;
  if (numLeaks === 0) leakPoints = 5;
  else if (numLeaks === 1) leakPoints = 4;
  else if (numLeaks === 2) leakPoints = 2.5;
  else if (numLeaks === 3) leakPoints = 1;
  else leakPoints = 0;

  let logPoints = 0;
  const numLogs = state.logs ? state.logs.length : 0;
  if (numLogs >= 2) logPoints = 5;
  else if (numLogs === 1) logPoints = 3;
  else logPoints = 0;

  const systemBase = Math.min(10, leakPoints + logPoints);

  // Apply Offsets
  const offsets = state.scoreOffsets || { academic: 0, build: 0, body: 0, sleep: 0, system: 0 };

  const academic = Math.max(0, Math.min(25, Math.round((academicBase + (offsets.academic || 0)) * 10) / 10));
  const build = Math.max(0, Math.min(25, Math.round((buildBase + (offsets.build || 0)) * 10) / 10));
  const body = Math.max(0, Math.min(25, Math.round((bodyBaseClamped + (offsets.body || 0)) * 10) / 10));
  const sleep = Math.max(0, Math.min(25, Math.round((sleepBaseClamped + (offsets.sleep || 0)) * 10) / 10));
  const system = Math.max(0, Math.min(10, Math.round((systemBase + (offsets.system || 0)) * 10) / 10));

  // Compute category efficiencies (0 to 1)
  const academicEff = academic / 25;
  const buildEff = build / 25;
  const bodyEff = body / 25;
  const sleepEff = sleep / 25;
  const systemEff = system / 10;
  
  // Reallocated: average of physical Sadhana & Sleep (both out of 25)
  const sadhanaHealthSleepEff = (bodyEff + sleepEff) / 2;

  // Compute Research & Career efficiency (0 to 1) based on state values
  const hasResearch = state.build?.researchPaperWork && state.build.researchPaperWork !== "None" && state.build.researchPaperWork !== "None today";
  const hasOpportunity = state.build?.opportunityWork && state.build.opportunityWork !== "None";
  const researchPaperScore = hasResearch ? 1.0 : 0.6;
  const opportunityScore = hasOpportunity ? 1.0 : 0.6;
  const careerResearchEff = (researchPaperScore + opportunityScore) / 2;

  let totalWeightedEff = 0;
  const mode = state.mode || "Normal Mode";

  if (mode === "Quiz Mode") {
    totalWeightedEff = (academicEff * 0.45) + (sadhanaHealthSleepEff * 0.25) + (buildEff * 0.20) + (careerResearchEff * 0.10);
  } else if (mode === "Build Mode") {
    totalWeightedEff = (buildEff * 0.45) + (sadhanaHealthSleepEff * 0.25) + (academicEff * 0.15) + (careerResearchEff * 0.15);
  } else if (mode === "Recovery Mode") {
    totalWeightedEff = (sadhanaHealthSleepEff * 0.60) + (academicEff * 0.20) + (buildEff * 0.20);
  } else if (mode === "Rescue Mode") {
    totalWeightedEff = (sadhanaHealthSleepEff * 0.60) + (academicEff * 0.20) + (buildEff * 0.20);
  } else { // Normal Mode
    totalWeightedEff = (sadhanaHealthSleepEff * 0.25) + (academicEff * 0.30) + (buildEff * 0.30) + (careerResearchEff * 0.15);
  }

  const total = Math.round(totalWeightedEff * 100);

  let interpretation = "";
  if (total >= 85) interpretation = "Excellent day - peak focus!";
  else if (total >= 70) interpretation = "Strong day - high output.";
  else if (total >= 55) interpretation = "Functional day - good consistency.";
  else interpretation = "Recovery or Rescue day. Keep showing up!";

  return {
    academic,
    build,
    body,
    sleep,
    system,
    total,
    interpretation,
    bases: {
      academic: academicBase,
      build: buildBase,
      body: bodyBaseClamped,
      sleep: sleepBaseClamped,
      system: systemBase,
    },
  };
}

export function getRecommendedMode(state: AppState): { recommended: OperatingMode; reason: string; suggestedAction: string } | null {
  const today = new Date();
  const quiz1Date = new Date("2026-07-26T00:00:00");
  const diffTime = quiz1Date.getTime() - today.getTime();
  const daysToQuiz1 = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Threshold checks
  const lowSleepConsistency = (state.sleep?.consistency || 10) < 4;
  const lowEnergy = (state.health?.energy || state.sleep?.energy || 10) < 4;
  const noSleepHours = (state.sleep?.totalSleepHours || 0) === 0;
  
  // Quiz within 7 days
  const quizNear = daysToQuiz1 > 0 && daysToQuiz1 <= 7;
  
  // Heavy attention leaks / drift
  const highLeaks = (state.activeLeaks || []).length >= 2;

  if (lowSleepConsistency) {
    return {
      recommended: "Recovery Mode",
      reason: "Sleep consistency is dangerously low (< 4/10). Physical and neurological recovery must be prioritized.",
      suggestedAction: "Switch to Recovery Mode to focus on sleep hygiene, early morning sunlight, and Sadhana foundation."
    };
  }

  if (lowEnergy && noSleepHours) {
    return {
      recommended: "Recovery Mode",
      reason: "Low energy (< 4/10) with no sleep logged yet. The foundation layer is unstable.",
      suggestedAction: "Switch to Recovery Mode to restore sleep balance and physical vitality."
    };
  }

  if (highLeaks || (state.currentRisk && state.currentRisk.toLowerCase().includes("drift"))) {
    return {
      recommended: "Rescue Mode",
      reason: "High number of active attention leaks or cognitive drift detected.",
      suggestedAction: "Switch to Rescue Mode to run an immediate focus reset, eliminate leaks, and build a minimal viable output."
    };
  }

  if (quizNear) {
    return {
      recommended: "Quiz Mode",
      reason: `Quiz 1 is coming up in ${daysToQuiz1} days. Academics must take a 45% priority weight.`,
      suggestedAction: "Switch to Quiz Mode to focus 45% of cognitive energy on IITM BS preparations, practice questions, and viva readiness."
    };
  }

  if (state.mode !== "Normal Mode" && (state.scores?.total || 0) > 65 && !lowEnergy && !lowSleepConsistency && !quizNear) {
    return {
      recommended: "Normal Mode",
      reason: "All bio-metrics are stable, energy is optimal, and no immediate exams are within 7 days.",
      suggestedAction: "Switch back to Normal Mode for balanced progress across Sadhana, Academics, and Build."
    };
  }

  return null;
}

/**
 * Computes scores dynamically and attaches them to state before returning.
 */
function computeAppStateWithScores(currentState: AppState): AppState {
  const calculated = calculateScores(currentState);
  return {
    ...currentState,
    scores: {
      academic: calculated.academic,
      build: calculated.build,
      body: calculated.body,
      sleep: calculated.sleep,
      system: calculated.system,
      total: calculated.total,
      interpretation: calculated.interpretation,
    },
  };
}

function mergeWithInitialState(saved: any): AppState {
  const base = { ...initialAppState };
  if (!saved || typeof saved !== "object") return base;

  return {
    ...base,
    ...saved,
    scores: { ...base.scores, ...(saved.scores || {}) },
    kidaura: { ...base.kidaura, ...(saved.kidaura || {}) },
    build: { ...base.build, ...(saved.build || {}) },
    body: { ...base.body, ...(saved.body || {}) },
    sleep: { ...base.sleep, ...(saved.sleep || {}) },
    health: { ...base.health, ...(saved.health || {}) },
    backlog: {
      academic: Array.isArray(saved.backlog?.academic) ? saved.backlog.academic : base.backlog.academic,
      projects: Array.isArray(saved.backlog?.projects) ? saved.backlog.projects : base.backlog.projects,
      kidaura: Array.isArray(saved.backlog?.kidaura) ? saved.backlog.kidaura : base.backlog.kidaura,
      build: Array.isArray(saved.backlog?.build) ? saved.backlog.build : base.backlog.build,
      health: Array.isArray(saved.backlog?.health) ? saved.backlog.health : base.backlog.health,
    },
    courses: Array.isArray(saved.courses) ? saved.courses.map((c: any, index: number) => {
      const baseCourse = base.courses[index] || base.courses[0];
      return {
        ...baseCourse,
        ...c,
        weekStatuses: { ...(baseCourse?.weekStatuses || {}), ...(c.weekStatuses || {}) },
        mistakeLog: Array.isArray(c.mistakeLog) ? c.mistakeLog : (baseCourse?.mistakeLog || []),
        weakTopics: Array.isArray(c.weakTopics) ? c.weakTopics : (baseCourse?.weakTopics || []),
      };
    }) : base.courses,
    projects: Array.isArray(saved.projects) ? saved.projects.map((p: any, index: number) => {
      const baseProject = base.projects[index] || base.projects[0];
      return {
        ...baseProject,
        ...p,
      };
    }) : base.projects,
    topPriorities: Array.isArray(saved.topPriorities) ? saved.topPriorities : base.topPriorities,
    activeLeaks: Array.isArray(saved.activeLeaks) ? saved.activeLeaks : base.activeLeaks,
    logs: Array.isArray(saved.logs) ? saved.logs : base.logs,
    changeLogs: Array.isArray(saved.changeLogs) ? saved.changeLogs : base.changeLogs,
    calendarEvents: Array.isArray(saved.calendarEvents) ? saved.calendarEvents : (base.calendarEvents || []),
    boardOrder: Array.isArray(saved.boardOrder) ? saved.boardOrder : (base.boardOrder || []),
    scoreOffsets: saved.scoreOffsets ? { ...(base.scoreOffsets || {}), ...saved.scoreOffsets } : base.scoreOffsets,
  };
}

export function useOSStore() {
  const [user, setUser] = useState<any>(null);
  const [loadingDb, setLoadingDb] = useState(false);

  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem("anmol-os-state-v2");
    let baseState = initialAppState;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        baseState = mergeWithInitialState(parsed);
      } catch (e) {
        console.error("Failed to parse state", e);
      }
    }
    return computeAppStateWithScores(baseState);
  });

  // Track Firebase Auth State
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setLoadingDb(true);
        try {
          const token = await firebaseUser.getIdToken();
          const response = await fetch("/api/state", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            if (data.state) {
              setState(computeAppStateWithScores(data.state));
            }
          }
        } catch (error) {
          console.error("Failed to load state from database:", error);
        } finally {
          setLoadingDb(false);
        }
      } else {
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);

  // Sync to localStorage always
  useEffect(() => {
    localStorage.setItem("anmol-os-state-v2", JSON.stringify(state));
  }, [state]);

  // Debounced cloud save
  useEffect(() => {
    if (!user) return;

    const saveTimeout = setTimeout(async () => {
      try {
        const token = await user.getIdToken();
        await fetch("/api/state", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ state }),
        });
      } catch (error) {
        console.error("Failed to save state to database:", error);
      }
    }, 2000);

    return () => clearTimeout(saveTimeout);
  }, [state, user]);

  useEffect(() => {
    const todayStr = getLogicalDate();
    const lastDate = state.body.lastLoggedDate;

    if (lastDate && lastDate !== todayStr) {
      const d1 = new Date(lastDate);
      const d2 = new Date(todayStr);
      const diffDays = Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays >= 1) {
        setState((prev) => {
          if (prev.body.isPracticeStatusUnverified) return prev;
          
          return computeAppStateWithScores({
            ...prev,
            body: {
              ...prev.body,
              isPracticeStatusUnverified: true,
              loggingStreak: diffDays > 1 ? 0 : prev.body.loggingStreak,
            },
            changeLogs: ["System detected calendar shift. Sadhana verification requested.", ...prev.changeLogs].slice(0, 10),
          });
        });
      }
    }
  }, [state.body.lastLoggedDate]);

  const updateState = (updates: Partial<AppState>) => {
    setState((prev) => {
      const merged = { ...prev };

      // Explicitly merge nested objects if they are present in updates
      if (updates.body) {
        merged.body = { ...prev.body, ...updates.body };
      }
      if (updates.sleep) {
        merged.sleep = { ...prev.sleep, ...updates.sleep };
      }
      if (updates.health) {
        merged.health = { ...prev.health, ...updates.health };
      }
      if (updates.kidaura) {
        merged.kidaura = { ...prev.kidaura, ...updates.kidaura };
      }
      if (updates.build) {
        merged.build = { ...prev.build, ...updates.build };
      }
      if (updates.scoreOffsets) {
        merged.scoreOffsets = { ...prev.scoreOffsets, ...updates.scoreOffsets };
      }
      if (updates.backlog) {
        merged.backlog = {
          academic: updates.backlog.academic || prev.backlog.academic,
          projects: updates.backlog.projects || prev.backlog.projects,
          kidaura: updates.backlog.kidaura || prev.backlog.kidaura,
          build: updates.backlog.build || prev.backlog.build,
          health: updates.backlog.health || prev.backlog.health,
        };
      }

      // For all other fields, perform regular shallow copy
      Object.keys(updates).forEach((key) => {
        if (!["body", "sleep", "health", "kidaura", "build", "scoreOffsets", "backlog"].includes(key)) {
          (merged as any)[key] = (updates as any)[key];
        }
      });

      return computeAppStateWithScores(merged);
    });
  };

  const setMode = (mode: OperatingMode) => {
    setState((prev) => computeAppStateWithScores({ ...prev, mode }));
  };

  const addLog = (content: string) => {
    setState((prev) => {
      const timestamp = new Date().toISOString();
      const newLog = { id: Date.now().toString(), timestamp, content };

      // Clone deeply to run smart natural-language parsing
      const updatedState = {
        ...prev,
        body: { ...prev.body },
        sleep: { ...prev.sleep },
        health: { ...prev.health },
        build: { ...prev.build },
        courses: prev.courses.map((c) => ({ ...c, weekStatuses: { ...c.weekStatuses } })),
        projects: prev.projects.map((p) => ({ ...p })),
        kidaura: { ...prev.kidaura },
        logs: [newLog, ...prev.logs],
        changeLogs: [...prev.changeLogs],
      };

      const lowerContent = content.toLowerCase();
      const changeFlags: string[] = [];
      const todayStr = getLogicalDate();
      const lastDate = prev.body.lastLoggedDate || todayStr;

      // 1. Process calendar day shift for Logging Streak
      if (lastDate !== todayStr) {
        const d1 = new Date(lastDate);
        const d2 = new Date(todayStr);
        const diffDays = Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          updatedState.body.loggingStreak = (prev.body.loggingStreak || 0) + 1;
          changeFlags.push(`Logging streak continues (${updatedState.body.loggingStreak} days)`);
        } else {
          updatedState.body.loggingStreak = 1; // start fresh logging streak since they missed a calendar day
          changeFlags.push("Logging streak reset due to missed day");
        }
        updatedState.body.lastLoggedDate = todayStr;
      }

      // 2. Parse Kriya/Sadhana minutes and calculate Practice Streak
      let practiceCompletedToday = false;
      const kriyaMatch =
        lowerContent.match(/(?:kriya|practice|sadhana)\s*(?:done\s*for)?\s*(\d+)\s*(?:min|minute|h|m)/) ||
        lowerContent.match(/(\d+)\s*(?:min|minute|hr|hour|h|m)\s*(?:of)?\s*(?:kriya|practice|sadhana)/);
      
      const isExplicitSadhana = 
        lowerContent.includes("kriya done") || 
        lowerContent.includes("practice done") || 
        lowerContent.includes("sadhana done") || 
        lowerContent.includes("did kriya") || 
        lowerContent.includes("did sadhana") || 
        lowerContent.includes("completed kriya") ||
        lowerContent.includes("did practice") ||
        lowerContent.includes("practice completed");

      if (kriyaMatch) {
        const val = parseInt(kriyaMatch[1]);
        if (val > 0) {
          updatedState.body.kriyaDurationMinutes = val;
          updatedState.body.movementDone = true;
          practiceCompletedToday = true;
          changeFlags.push(`Logged ${val}m Kriya/Sadhana`);
        }
      } else if (isExplicitSadhana) {
        updatedState.body.kriyaDurationMinutes = 60;
        updatedState.body.movementDone = true;
        practiceCompletedToday = true;
        changeFlags.push("Logged 60m Kriya/Sadhana");
      }

      // If they logged practice completed today
      if (practiceCompletedToday) {
        // Clear unverified status
        updatedState.body.isPracticeStatusUnverified = false;
        
        // Ensure we only increment practice streak once per calendar day
        const alreadyCountedToday = prev.body.lastLoggedDate === todayStr && prev.body.kriyaDurationMinutes > 0;
        if (!alreadyCountedToday) {
          updatedState.body.practiceStreak = (prev.body.practiceStreak || 0) + 1;
          updatedState.body.streakDays = updatedState.body.practiceStreak; // keep old streakDays in sync
          changeFlags.push(`Practice streak: ${updatedState.body.practiceStreak} days`);
        }
        updatedState.body.lastLoggedDate = todayStr;
      }

      // 2. Parse Physical Movement
      if (lowerContent.includes("movement done") || lowerContent.includes("workout done") || lowerContent.includes("exercise done") || lowerContent.includes("walked")) {
        updatedState.body.movementDone = true;
        changeFlags.push("Logged movement done");
      }

      // 3. Parse Pure Coding Hours
      const codingMatch =
        lowerContent.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)\s*(?:of)?\s*(?:coding|building|pure coding)/) ||
        lowerContent.match(/(?:coding|built|coded)\s*(?:for)?\s*(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)/);
      if (codingMatch) {
        const val = parseFloat(codingMatch[1]);
        updatedState.build.pureCodingHours = val;
        changeFlags.push(`Logged ${val}h pure coding`);
      }

      // 4. Parse Sleep Hours
      const sleepMatch =
        lowerContent.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)\s*(?:of)?\s*sleep/) ||
        lowerContent.match(/slept\s*(?:for)?\s*(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)/);
      if (sleepMatch) {
        const val = parseFloat(sleepMatch[1]);
        updatedState.sleep.totalSleepHours = val;
        changeFlags.push(`Logged ${val}h sleep`);
      }

      // 5. Parse Sleep Window
      const sleepTimeMatch = lowerContent.match(/slept\s*(?:at|around)?\s*(\d+(?::\d+)?\s*(?:am|pm|noon|midnight))/);
      if (sleepTimeMatch) {
        updatedState.sleep.sleepTime = sleepTimeMatch[1].toUpperCase();
        changeFlags.push(`Slept window start: ${sleepTimeMatch[1]}`);
      }
      const wakeTimeMatch = lowerContent.match(/(?:woke|wake|woken)\s*(?:up)?\s*(?:at|around)?\s*(\d+(?::\d+)?\s*(?:am|pm|noon|midnight))/);
      if (wakeTimeMatch) {
        updatedState.sleep.wakeTime = wakeTimeMatch[1].toUpperCase();
        changeFlags.push(`Slept window wake: ${wakeTimeMatch[1]}`);
      }

      // 6. Parse Sunlight
      if (lowerContent.includes("sunlight") || lowerContent.includes("sun exposure")) {
        updatedState.sleep.sunlight = true;
        updatedState.health.sunlight = true;
        changeFlags.push("Logged sunlight exposure");
      }

      // 7. Parse Course completions (e.g. "MLF week 3 done")
      const courseMatch = lowerContent.match(/(mlf|dl genie|bdm|dl-genai)\s*week\s*(\d+)\s*(done|in-progress|not-started)/);
      if (courseMatch) {
        const rawCourse = courseMatch[1];
        const weekNum = parseInt(courseMatch[2]);
        const status = courseMatch[3] as "done" | "in-progress" | "not-started";

        let matchedCourseId = "";
        if (rawCourse === "mlf") matchedCourseId = "mlf";
        else if (rawCourse === "dl genie" || rawCourse === "dl-genai") matchedCourseId = "dl-genai";
        else if (rawCourse === "bdm") matchedCourseId = "bdm";

        if (matchedCourseId) {
          updatedState.courses = updatedState.courses.map((course) => {
            if (course.id === matchedCourseId) {
              return {
                ...course,
                weekStatuses: {
                  ...course.weekStatuses,
                  [weekNum]: status,
                },
              };
            }
            return course;
          });
          changeFlags.push(`Set ${matchedCourseId} WK ${weekNum} to ${status}`);
        }
      }

      // 8. Hydration and Caffeine
      if (lowerContent.includes("water") || lowerContent.includes("hydration")) {
        updatedState.health.hydration = "Optimal";
        changeFlags.push("Hydration: Optimal");
      }
      if (lowerContent.includes("coffee") || lowerContent.includes("caffeine") || lowerContent.includes("tea")) {
        updatedState.health.caffeine = "1-2 cups";
        updatedState.sleep.caffeine = "1-2 cups";
        changeFlags.push("Caffeine logged");
      }

      // Automatically synthesize next best action and critical risk factor based on state dynamics
      if (!updatedState.body.kriyaDurationMinutes || updatedState.body.kriyaDurationMinutes === 0) {
        updatedState.currentRisk = "Zero Sadhana practice logged today. Risk of breaking the core discipline layer.";
        updatedState.nextBestAction = "Carve out 60 minutes for Kriya Sadhana now to sustain the practice streak.";
      } else if (updatedState.activeLeaks && updatedState.activeLeaks.length > 0) {
        updatedState.currentRisk = `Active attention leaks detected: ${updatedState.activeLeaks.join(", ")}. Risk of mental drift and cognitive exhaustion.`;
        updatedState.nextBestAction = "Implement immediate focus block. Close all unproductive browser tabs and review weak topics.";
      } else {
        const mlfCourse = updatedState.courses.find(c => c.id === "mlf");
        const bdmCourse = updatedState.courses.find(c => c.id === "bdm");
        const mlfPending = mlfCourse ? Object.values(mlfCourse.weekStatuses).some(s => s !== "done") : false;
        const bdmPending = bdmCourse ? Object.values(bdmCourse.weekStatuses).some(s => s !== "done") : false;

        if (mlfPending || bdmPending) {
          updatedState.currentRisk = "Quiz 1 countdown. Weeks lagging or in-progress in key academic courses.";
          updatedState.nextBestAction = "Prioritize MLF fundamental subspaces review and practice questions immediately.";
        } else {
          updatedState.currentRisk = "System calibrated and running at high efficiency. No immediate risks flagged.";
          updatedState.nextBestAction = "Maintain momentum. Solve advanced practice questions or build out DL project.";
        }
      }

      // Build status logs
      const logMsg = changeFlags.length > 0 ? changeFlags.join(" | ") : `Logged: "${content.substring(0, 35)}..."`;
      updatedState.changeLogs = [logMsg, ...prev.changeLogs].slice(0, 10);

      return computeAppStateWithScores(updatedState);
    });
  };

  const toggleCourseWeek = (courseId: string, weekNum: number) => {
    setState((prev) => {
      const updatedCourses = prev.courses.map((course) => {
        if (course.id === courseId) {
          const current = course.weekStatuses[weekNum] || "not-started";
          let nextStatus: "not-started" | "in-progress" | "done" = "not-started";
          if (current === "not-started") nextStatus = "in-progress";
          else if (current === "in-progress") nextStatus = "done";

          return {
            ...course,
            weekStatuses: {
              ...course.weekStatuses,
              [weekNum]: nextStatus,
            },
          };
        }
        return course;
      });

      return computeAppStateWithScores({
        ...prev,
        courses: updatedCourses,
        changeLogs: [`Updated WK ${weekNum} status for ${courseId}`, ...prev.changeLogs].slice(0, 10),
      });
    });
  };

  const updateProjectProgress = (projId: string, progress: number) => {
    setState((prev) => {
      const updatedProjects = prev.projects.map((p) => {
        if (p.id === projId) {
          return { ...p, progress: Math.max(0, Math.min(100, progress)) };
        }
        return p;
      });
      return computeAppStateWithScores({ ...prev, projects: updatedProjects });
    });
  };

  const updateProjectViva = (projId: string, value: number) => {
    setState((prev) => {
      const updatedProjects = prev.projects.map((p) => {
        if (p.id === projId) {
          return { ...p, vivaReadiness: Math.max(0, Math.min(5, value)) };
        }
        return p;
      });
      return computeAppStateWithScores({ ...prev, projects: updatedProjects });
    });
  };

  const updateProjectOwnership = (projId: string, value: number) => {
    setState((prev) => {
      const updatedProjects = prev.projects.map((p) => {
        if (p.id === projId) {
          return { ...p, codeOwnershipLevel: Math.max(0, Math.min(5, value)) };
        }
        return p;
      });
      return computeAppStateWithScores({ ...prev, projects: updatedProjects });
    });
  };

  const addBacklogItem = (category: "academic" | "projects" | "kidaura" | "build" | "health", item: string) => {
    if (!item.trim()) return;
    setState((prev) => {
      const updatedCategory = [...prev.backlog[category], item];
      return computeAppStateWithScores({
        ...prev,
        backlog: {
          ...prev.backlog,
          [category]: updatedCategory,
        },
        changeLogs: [`Added backlog item: ${item}`, ...prev.changeLogs].slice(0, 10),
      });
    });
  };

  const removeBacklogItem = (category: "academic" | "projects" | "kidaura" | "build" | "health", index: number) => {
    setState((prev) => {
      const updatedCategory = prev.backlog[category].filter((_, i) => i !== index);
      return computeAppStateWithScores({
        ...prev,
        backlog: {
          ...prev.backlog,
          [category]: updatedCategory,
        },
      });
    });
  };

  /**
   * Adjusts the offset instead of directly overwriting scores, preserving baseline mathematical calculations.
   */
  const updateScorePoint = (category: "academic" | "build" | "body" | "sleep" | "system", value: number) => {
    setState((prev) => {
      const baseScores = calculateScores({
        ...prev,
        scoreOffsets: { academic: 0, build: 0, body: 0, sleep: 0, system: 0 },
      });

      let currentBaseVal = 0;
      if (category === "academic") currentBaseVal = baseScores.bases.academic;
      else if (category === "build") currentBaseVal = baseScores.bases.build;
      else if (category === "body") currentBaseVal = baseScores.bases.body;
      else if (category === "sleep") currentBaseVal = baseScores.bases.sleep;
      else if (category === "system") currentBaseVal = baseScores.bases.system;

      const maxScores = { academic: 25, build: 25, body: 25, sleep: 25, system: 10 };
      const maxVal = maxScores[category];
      const clampedValue = Math.max(0, Math.min(maxVal, value));

      const newOffset = clampedValue - currentBaseVal;

      const offsets = prev.scoreOffsets || { academic: 0, build: 0, body: 0, sleep: 0, system: 0 };
      const updatedOffsets = {
        ...offsets,
        [category]: newOffset,
      };

      const newState = {
        ...prev,
        scoreOffsets: updatedOffsets,
      };

      return computeAppStateWithScores(newState);
    });
  };

  const verifyPracticeCompleted = () => {
    setState((prev) => {
      const todayStr = new Date().toISOString().split("T")[0];
      const newStreak = (prev.body.practiceStreak || 0) + 1;
      return computeAppStateWithScores({
        ...prev,
        body: {
          ...prev.body,
          practiceStreak: newStreak,
          streakDays: newStreak,
          isPracticeStatusUnverified: false,
          lastLoggedDate: todayStr,
        },
        changeLogs: ["Verified Sadhana completed yesterday! (+1 practice streak)", ...prev.changeLogs].slice(0, 10),
      });
    });
  };

  const verifyPracticeMissed = () => {
    setState((prev) => {
      const todayStr = new Date().toISOString().split("T")[0];
      return computeAppStateWithScores({
        ...prev,
        body: {
          ...prev.body,
          practiceStreak: 0,
          streakDays: 0,
          isPracticeStatusUnverified: false,
          lastLoggedDate: todayStr,
        },
        changeLogs: ["Verified Sadhana missed yesterday. Streak reset to 0.", ...prev.changeLogs].slice(0, 10),
      });
    });
  };

  const simulateMissedDay = () => {
    setState((prev) => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const pastStr = twoDaysAgo.toISOString().split("T")[0];

      return computeAppStateWithScores({
        ...prev,
        body: {
          ...prev.body,
          isPracticeStatusUnverified: true,
          lastLoggedDate: pastStr,
        },
        changeLogs: ["Simulated missed day of logging. Verification trigger active.", ...prev.changeLogs].slice(0, 10),
      });
    });
  };

  const resetCurrentDay = () => {
    if (confirm("Are you sure you want to reset today's metrics to zero? (Your streaks and long-term settings will remain intact)")) {
      setState((prev) => {
        const resetState = {
          ...prev,
          build: {
            ...prev.build,
            pureCodingHours: 0,
            conceptLearning: "None today",
            researchPaperWork: "None",
            openSourceContribution: "None today",
            opportunityWork: "None",
            artifactsCreated: [],
          },
          body: {
            ...prev.body,
            kriyaDurationMinutes: 0,
            movementDone: false,
          },
          sleep: {
            ...prev.sleep,
            totalSleepHours: 0,
            sunlight: false,
          },
          health: {
            ...prev.health,
            mood: 5,
            energy: 5,
            fatigue: "Mild",
            sunlight: false,
          },
          scoreOffsets: {},
          changeLogs: ["Reset today's progress to a clean slate.", ...prev.changeLogs].slice(0, 10),
        };
        return computeAppStateWithScores(resetState);
      });
    }
  };

  return {
    state,
    updateState,
    setMode,
    addLog,
    toggleCourseWeek,
    updateProjectProgress,
    updateProjectViva,
    updateProjectOwnership,
    addBacklogItem,
    removeBacklogItem,
    updateScorePoint,
    verifyPracticeCompleted,
    verifyPracticeMissed,
    simulateMissedDay,
    resetCurrentDay,
    user,
    loadingDb,
  };
}
