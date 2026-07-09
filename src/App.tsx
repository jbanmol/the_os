import { useOSStore, getRecommendedMode } from "./store/useStore";
import { CommandCenter } from "./components/CommandCenter";
import { Scoreboard } from "./components/Scoreboard";
import { FlowTuner } from "./components/FlowTuner";
import { ContributionGrid } from "./components/ContributionGrid";
import { auth, googleProvider, signInWithPopup, signOut } from "./lib/firebaseClient";
import { AcademicTracker } from "./components/AcademicTracker";
import { ProjectTracker } from "./components/ProjectTracker";
import { KidauraTracker } from "./components/KidauraTracker";
import { BuildTracker } from "./components/BuildTracker";
import { BodySleepTracker } from "./components/BodySleepTracker";
import { HealthTracker } from "./components/HealthTracker";
import { LeakageDetector } from "./components/LeakageDetector";
import { LogsAndBacklog } from "./components/LogsAndBacklog";
import { IdeasIncubator } from "./components/IdeasIncubator";
import { FocusShield } from "./components/FocusShield";
import { ClinicianSuite } from "./components/ClinicianSuite";
import {
  Terminal,
  Layers,
  ArrowLeft,
  BookOpen,
  Code,
  Brain,
  Activity,
  Flame,
  Moon,
  Coffee,
  AlertTriangle,
  ClipboardList,
  RefreshCw,
  Clock,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  GripVertical,
  ShieldAlert,
  Check,
  X,
  Sparkles,
  Zap,
  Mic,
  MessageSquare,
  HelpCircle,
  Shield,
  Lightbulb
} from "lucide-react";
import React, { useState } from "react";

export default function App() {
  const {
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
  } = useOSStore();

  const handleGoogleSignIn = async () => {
    try {
      setApiError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Sign-in failed:", error);
      setApiError("Google Sign-In failed: " + (error.message || error));
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error("Sign-out failed:", error);
    }
  };

  const [logInput, setLogInput] = useState("");
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [modeRecommendation, setModeRecommendation] = useState<{ recommendedMode: string; reason: string } | null>(null);
  const [uncertainties, setUncertainties] = useState<string[]>([]);
  const [ignoredFacts, setIgnoredFacts] = useState<string[]>([]);
  const [activeFocusTask, setActiveFocusTask] = useState<string | null>(null);
  const [showClinicianSuite, setShowClinicianSuite] = useState(false);

  const quickLogs = [
    { text: "🧘 Completed 60m Kriya Yoga & early sunlight", label: "Yoga/Sadhana" },
    { text: "📖 MLF week 3 done, resolved weak topics", label: "MLF Week" },
    { text: "😴 Slept 11:30 PM, woke 6:30 AM, got 7.5 hrs sleep", label: "Sleep logs" },
    { text: "💻 Completed 3 hrs of pure coding on ML project", label: "Pure Coding" },
    { text: "🛡️ Blocked attention leaks: closed YouTube & chat", label: "Clear leaks" },
    { text: "❓ How should I optimize my prep schedule for Quiz 1?", label: "Ask Quiz Prep" },
    { text: "❓ What is a good way to stabilize my circadian cycle?", label: "Ask Sleep Advice" },
  ];

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setApiError("Speech recognition is not supported in this browser. Try Chrome or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setApiError(null);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setApiError(`Speech recognition failed: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setLogInput((prev) => (prev ? prev + " " + transcript : transcript));
    };

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logInput.trim()) return;
    setIsProcessing(true);
    setApiError(null);
    setAiResponse(null);
    setModeRecommendation(null);
    setUncertainties([]);
    setIgnoredFacts([]);
    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          logInput,
          currentState: state,
          currentDate: new Date().toISOString().split("T")[0],
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to extract data using Gemini AI");
      }

      const updates = await response.json();

      const timestamp = new Date().toISOString();
      const newLog = {
        id: Date.now().toString(),
        timestamp,
        content: `AI Update: ${updates.explanation || "Integrated daily activity."} | Raw: "${logInput}"`,
      };

      const newStateUpdates: any = {
        logs: [newLog, ...state.logs],
        changeLogs: [updates.explanation || "Integrated daily activity.", ...state.changeLogs].slice(0, 10),
      };

      if (updates.mode) newStateUpdates.mode = updates.mode;
      if (updates.nextBestAction) newStateUpdates.nextBestAction = updates.nextBestAction;
      if (updates.currentRisk) newStateUpdates.currentRisk = updates.currentRisk;
      if (updates.topPriorities) newStateUpdates.topPriorities = updates.topPriorities;
      if (updates.courses) newStateUpdates.courses = updates.courses;
      if (updates.projects) newStateUpdates.projects = updates.projects;
      if (updates.kidaura) newStateUpdates.kidaura = updates.kidaura;
      if (updates.build) newStateUpdates.build = updates.build;
      if (updates.body) newStateUpdates.body = updates.body;
      if (updates.sleep) newStateUpdates.sleep = updates.sleep;
      if (updates.health) newStateUpdates.health = updates.health;
      if (updates.activeLeaks) newStateUpdates.activeLeaks = updates.activeLeaks;
      if (updates.backlog) newStateUpdates.backlog = updates.backlog;

      updateState(newStateUpdates);
      
      // Update local interactive co-pilot views
      if (updates.modeRecommendation) setModeRecommendation(updates.modeRecommendation);
      if (updates.uncertainties) setUncertainties(updates.uncertainties);
      if (updates.ignored) setIgnoredFacts(updates.ignored);

      setAiResponse(updates.explanation || "Successfully updated system ledger.");
      setLogInput("");
    } catch (err: any) {
      console.error("AI extraction error, falling back to local parsing:", err);
      setApiError(err.message || "Failed to process with Gemini. Applied local parsing fallback.");
      // Fallback: use local parsing so user state still updates offline/without API key
      addLog(logInput);
      setAiResponse(`Local processing fallback: Logged raw input. State updated locally.`);
      setLogInput("");
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper calculation for course progress
  const getCourseProgress = (courseId: string) => {
    const course = state.courses?.find((c) => c.id === courseId);
    if (!course) return 0;
    const weeks = [1, 2, 3, 4];
    const completedWeeks = weeks.filter((w) => course.weekStatuses?.[w] === "done").length;
    return Math.round((completedWeeks / weeks.length) * 100);
  };

  // Aggregated metrics for clipboard cards
  const totalCompletedWeeks = (state.courses || []).reduce(
    (acc, c) => acc + Object.values(c?.weekStatuses || {}).filter((s) => s === "done").length,
    0
  );
  const totalRecallSheets = (state.courses || []).filter((c) => c?.recallSheetStatus === "done").length;
  const totalPracticeQs = (state.courses || []).filter((c) => c?.practiceQuestions === "done").length;

  const avgProjectProgress = Math.round(
    (state.projects || []).reduce((acc, p) => acc + (p?.progress || 0), 0) / ((state.projects || []).length || 1)
  );
  const totalVivaScore = (state.projects || []).reduce((acc, p) => acc + (p?.vivaReadiness || 0), 0);
  const totalOwnershipScore = (state.projects || []).reduce((acc, p) => acc + (p?.codeOwnershipLevel || 0), 0);

  const pendingBacklogsCount = (Object.values(state.backlog || {}) as string[][]).reduce((acc, list) => acc + (Array.isArray(list) ? list.length : 0), 0);

  const recommendation = getRecommendedMode(state);
  const isRecommendationDiff = recommendation && recommendation.recommended !== state.mode;

  // Drag & Drop / Reordering state
  const [draggedBoardId, setDraggedBoardId] = useState<string | null>(null);
  const [dragOverBoardId, setDragOverBoardId] = useState<string | null>(null);

  // Compute actual reordered board order
  const currentBoardOrder = React.useMemo(() => {
    const defaultOrder = ["academic", "projects", "kidaura", "build", "body", "sleep", "health", "leaks", "logs", "ideas"];
    const savedOrder = state.boardOrder || [];
    const validSaved = savedOrder.filter((id) => defaultOrder.includes(id));
    const missing = defaultOrder.filter((id) => !validSaved.includes(id));
    return [...validSaved, ...missing];
  }, [state.boardOrder]);

  const moveBoard = (boardId: string, direction: "left" | "right") => {
    const idx = currentBoardOrder.indexOf(boardId);
    if (idx === -1) return;

    const newOrder = [...currentBoardOrder];
    if (direction === "left" && idx > 0) {
      const temp = newOrder[idx - 1];
      newOrder[idx - 1] = boardId;
      newOrder[idx] = temp;
    } else if (direction === "right" && idx < newOrder.length - 1) {
      const temp = newOrder[idx + 1];
      newOrder[idx + 1] = boardId;
      newOrder[idx] = temp;
    }

    updateState({ boardOrder: newOrder });
  };

  const handleDropSwap = (draggedId: string, targetId: string) => {
    if (draggedId === targetId) return;
    const dragIdx = currentBoardOrder.indexOf(draggedId);
    const targetIdx = currentBoardOrder.indexOf(targetId);
    if (dragIdx === -1 || targetIdx === -1) return;

    const newOrder = [...currentBoardOrder];
    // Remove from old position and insert at new position
    newOrder.splice(dragIdx, 1);
    newOrder.splice(targetIdx, 0, draggedId);

    updateState({ boardOrder: newOrder });
  };

  // Board Specifications mapping
  const boards = [
    {
      id: "academic",
      num: "BOARD 01",
      title: "Academic Prep",
      subtitle: "MLF, DL Genie & BDM Weeks 1-4",
      icon: BookOpen,
      iconColor: "text-blue-600 bg-blue-50",
      primaryStat: `${totalCompletedWeeks}/12 Weeks Done`,
      secondaryStat: `Recall sheets: ${totalRecallSheets}/3 | Questions: ${totalPracticeQs}/3`,
      score: `${state.scores.academic} / 25 PTS`,
      status: state.scores.academic >= 18 ? "OPTIMAL" : "NEEDS REVISION",
      statusColor: state.scores.academic >= 18 ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-blue-100 text-blue-800 border-blue-200",
    },
    {
      id: "projects",
      num: "BOARD 02",
      title: "Projects & Viva",
      subtitle: "ML, DL & MAD 2 Placement Portal",
      icon: Code,
      iconColor: "text-violet-600 bg-violet-50",
      primaryStat: `${avgProjectProgress}% Avg Progress`,
      secondaryStat: `Viva: ${totalVivaScore}/15 | Code Own: ${totalOwnershipScore}/15`,
      score: `${state.scores.build} / 25 PTS`,
      status: avgProjectProgress >= 40 ? "ON TRACK" : "STUCK POINTS",
      statusColor: avgProjectProgress >= 40 ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-amber-100 text-amber-800 border-amber-200",
    },
    {
      id: "kidaura",
      num: "BOARD 03",
      title: "Kidaura Work",
      subtitle: "IEP Platform & Observability",
      icon: Brain,
      iconColor: "text-rose-600 bg-rose-50",
      primaryStat: `${state.kidaura.osDashboardIntegrationStatus.toUpperCase()} INTEGRATION`,
      secondaryStat: `Active: ${state.kidaura.activeThread}`,
      score: "5.0 / 5.0 PTS",
      status: state.kidaura.osDashboardIntegrationStatus === "integrated" ? "COMPLETED" : "EXPLORING",
      statusColor: state.kidaura.osDashboardIntegrationStatus === "integrated" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-rose-100 text-rose-800 border-rose-200",
    },
    {
      id: "build",
      num: "BOARD 04",
      title: "Build & Research",
      subtitle: "Coding hours, Open Source & Papers",
      icon: Activity,
      iconColor: "text-cyan-600 bg-cyan-50",
      primaryStat: `${state.build.pureCodingHours} Hrs Coding Today`,
      secondaryStat: `Research: ${state.build.researchPaperWork}`,
      score: `${state.scores.build} / 25 PTS`,
      status: state.build.pureCodingHours > 0 ? "BUILDING" : "ZERO DAYS RISK",
      statusColor: state.build.pureCodingHours > 0 ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-rose-100 text-rose-800 border-rose-200",
    },
    {
      id: "body",
      num: "BOARD 05",
      title: "Kriya Sadhana",
      subtitle: "Morning Practice, Pranayama & Streaks",
      icon: Flame,
      iconColor: "text-emerald-600 bg-emerald-50",
      primaryStat: `Practice Streak: ${state.body.practiceStreak || state.body.streakDays}d | Logging: ${state.body.loggingStreak || 0}d`,
      secondaryStat: `${state.body.kriyaDurationMinutes} mins kriya completed today`,
      score: `${state.scores.body} / 20 PTS`,
      status: state.body.kriyaDurationMinutes >= 60 ? "MASTER STREAK" : "RECOVERY DAY",
      statusColor: state.body.kriyaDurationMinutes >= 60 ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-neutral-100 text-neutral-800 border-neutral-200",
    },
    {
      id: "sleep",
      num: "BOARD 06",
      title: "Sleep Recovery",
      subtitle: "Circadian sync, Sunlight & Caffeine",
      icon: Moon,
      iconColor: "text-amber-500 bg-amber-50",
      primaryStat: `${state.sleep.sleepTime} — ${state.sleep.wakeTime}`,
      secondaryStat: `${state.sleep.totalSleepHours}h sleep | Consistency: ${state.sleep.consistency}/10`,
      score: `${state.scores.sleep} / 20 PTS`,
      status: state.sleep.sleepTime.includes("PM") ? "INVERTED PHASE" : "SYNCED CYCLE",
      statusColor: state.sleep.sleepTime.includes("PM") ? "bg-rose-100 text-rose-800 border-rose-200" : "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    {
      id: "health",
      num: "BOARD 07",
      title: "Health & Vitality",
      subtitle: "Mood, Hydration & Energy logs",
      icon: Coffee,
      iconColor: "text-orange-600 bg-orange-50",
      primaryStat: `Energy: ${state.health.energy}/10 | Mood: ${state.health.mood}/10`,
      secondaryStat: `Fatigue: ${state.health.fatigue} | Hydration: ${state.health.hydration}`,
      score: `${Math.round(((state.health.energy || 5) + (state.health.mood || 5)) * 5)}% VITAL`,
      status: state.health.energy >= 6 ? "HIGH FOCUS" : "LOW VITALITY",
      statusColor: state.health.energy >= 6 ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-amber-100 text-amber-800 border-amber-200",
    },
    {
      id: "leaks",
      num: "BOARD 08",
      title: "Attention Leaks",
      subtitle: "Context switching & commitments blocker",
      icon: AlertTriangle,
      iconColor: "text-red-600 bg-red-50",
      primaryStat: `${(state.activeLeaks || []).length} Active Attention Leaks`,
      secondaryStat: `${(state.activeLeaks || []).join(", ") || "No leaks identified"}`,
      score: "INDEX MINUS",
      status: (state.activeLeaks || []).length === 0 ? "STABILIZED" : "ATTENTION DRAIN",
      statusColor: (state.activeLeaks || []).length === 0 ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-red-100 text-red-800 border-red-200",
    },
    {
      id: "logs",
      num: "BOARD 09",
      title: "Journal & Backlog",
      subtitle: "Time logs history and pending schedules",
      icon: ClipboardList,
      iconColor: "text-neutral-700 bg-neutral-100",
      primaryStat: `${pendingBacklogsCount} Total Backlog Items`,
      secondaryStat: `${(state.logs || []).length} operations logged in ledger`,
      score: "SYSTEM LEDGER",
      status: "SYNCHRONIZED",
      statusColor: "bg-neutral-950 text-white border-neutral-850",
    },
    {
      id: "ideas",
      num: "BOARD 10",
      title: "Ideas Sandbox",
      subtitle: "Random thoughts, research & product drafts",
      icon: Lightbulb,
      iconColor: "text-amber-600 bg-amber-50",
      primaryStat: `${(state.ideas || []).length} Saved Thoughts`,
      secondaryStat: `${(state.ideas || []).filter((i) => i.status === "backburner").length} backburner | ${(state.ideas || []).filter((i) => i.status === "researching").length} researching`,
      score: "SANDBOX ENGINE",
      status: (state.ideas || []).length > 0 ? "IDEATION ACTIVE" : "EMPTY POOL",
      statusColor: (state.ideas || []).length > 0 ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-neutral-100 text-neutral-500 border-neutral-200",
    },
  ];

  const sortedBoards = React.useMemo(() => {
    return [...boards].sort((a, b) => {
      return currentBoardOrder.indexOf(a.id) - currentBoardOrder.indexOf(b.id);
    });
  }, [boards, currentBoardOrder]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 pb-28 selection:bg-neutral-900 selection:text-white">
      {/* Top Swiss Laboratory Diagnostic Line */}
      <div className="bg-neutral-950 text-neutral-400 font-mono text-[9px] uppercase tracking-widest px-4 md:px-8 py-2.5 flex items-center justify-between border-b border-neutral-800">
        <div className="flex items-center space-x-4">
          <span className="font-bold text-white">ANMOL OS // SYSTEM OPERATIONS HUB</span>
          <span className="text-neutral-700">|</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-neutral-500" />
            LOC: {state.currentDate ? new Date(state.currentDate).toLocaleDateString() : "TODAY"}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-white">CORE STATUS: {state.mode.toUpperCase()}</span>
        </div>
      </div>

      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Main Header / Title */}
        <header className="pb-6 border-b border-neutral-200 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="bg-neutral-900 text-white font-mono text-[10px] uppercase font-bold px-2 py-0.5 tracking-widest">
                SWISS LAB PRESCRIPTION
              </span>
              <span className="text-neutral-300 font-mono text-xs">//</span>
              <span className="font-mono text-xs uppercase tracking-tight text-neutral-500">
                OFFLINE-FIRST CORE v2.0
              </span>
            </div>
            <h1 className="text-4xl font-display font-black text-neutral-900 tracking-tighter uppercase">
              Dave OS
            </h1>
            <p className="text-xs text-neutral-500 font-mono mt-1 uppercase">
              Academics • Kidaura • Deep Work • Sadhana • Circadian Rectification
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Clinical Diagnostics Trigger Block */}
            <button
              onClick={() => setShowClinicianSuite(true)}
              className="flex items-center space-x-2.5 bg-rose-50 hover:bg-rose-100/80 text-rose-900 font-mono text-[10px] font-bold uppercase tracking-wider p-3 border border-rose-200 transition-all cursor-pointer shadow-xs text-left"
            >
              <Activity className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <div>
                <span className="block font-black text-rose-950">⚕ CLINICAL SUITE</span>
                <span className="block text-[8px] text-rose-500 font-normal normal-case">ASRS-v1.1 Screener & Doctor Portal</span>
              </div>
            </button>

            {/* Google Cloud Sync Status Widget */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-neutral-100 p-3 border border-neutral-200">
              <div className="font-mono text-xs">
                {user ? (
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>CLOUD SYNC ACTIVE</span>
                    </div>
                    <div className="text-[10px] text-neutral-500">{user.email}</div>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5 text-amber-800 font-bold">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>OFFLINE LOCAL SANDBOX</span>
                    </div>
                    <div className="text-[10px] text-neutral-500">Data saved locally in cache</div>
                  </div>
                )}
              </div>
              
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="bg-white hover:bg-neutral-50 text-neutral-800 font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 border border-neutral-300 transition-all cursor-pointer shadow-xs"
                >
                  Disconnect Sync
                </button>
              ) : (
                <button
                  onClick={handleGoogleSignIn}
                  className="bg-neutral-950 hover:bg-neutral-900 text-white font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingDb ? 'animate-spin' : ''}`} />
                  <span>Connect Google Sync</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick return / Overview Switch */}
          {selectedBoard !== null && (
            <button
              onClick={() => setSelectedBoard(null)}
              className="flex items-center space-x-2 bg-neutral-900 hover:bg-neutral-800 text-white font-mono text-xs font-bold uppercase tracking-wider px-4 py-2 border border-neutral-800 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Back to Clipboard Wall</span>
            </button>
          )}
        </header>

        {/* System Alerts & Recommendations */}
        {state.body.isPracticeStatusUnverified && (
          <div className="bg-amber-50 border border-amber-300 p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <Flame className="w-5 h-5 text-amber-600 mt-0.5 md:mt-0 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold font-mono text-amber-900 uppercase tracking-tight">
                  Log missing. Practice status unknown. Please verify.
                </p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  No entry was logged for yesterday. To preserve your {state.body.practiceStreak || state.body.streakDays}-day practice streak, verify whether you completed Sadhana.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
              <button
                onClick={verifyPracticeCompleted}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Check className="w-3 h-3" />
                <span>Yes, Completed Sadhana</span>
              </button>
              <button
                onClick={verifyPracticeMissed}
                className="border border-amber-400 text-amber-800 hover:bg-amber-100 font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>No, Missed Practice</span>
              </button>
            </div>
          </div>
        )}

        {isRecommendationDiff && recommendation && (
          <div className="bg-indigo-50 border border-indigo-200 p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <Zap className="w-5 h-5 text-indigo-600 mt-0.5 md:mt-0 flex-shrink-0 animate-pulse" />
              <div>
                <p className="text-xs font-bold font-mono text-indigo-900 uppercase tracking-tight">
                  System Recommendation: {recommendation.recommended}
                </p>
                <p className="text-[11px] text-indigo-700 mt-0.5">
                  <strong>Risk/Threshold Trigger:</strong> {recommendation.reason}
                  <br />
                  <span className="text-indigo-650"><strong>Action:</strong> {recommendation.suggestedAction}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
              <button
                onClick={() => setMode(recommendation.recommended)}
                className="bg-indigo-950 hover:bg-indigo-900 text-white font-mono text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 flex items-center space-x-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Check className="w-3 h-3" />
                <span>Switch to {recommendation.recommended}</span>
              </button>
            </div>
          </div>
        )}

        {/* 1. Global System Status: CommandCenter and Scoreboard. Visible on main wall for supreme immediate context, and collapsible or smaller on details view. */}
        {selectedBoard === null ? (
          <div className="space-y-6">
            {/* Primary Core Directive Box */}
            <CommandCenter state={state} setMode={setMode} updateState={updateState} onActivateFocus={setActiveFocusTask} />

            {/* Scoreboard showing the dynamically calculated System Index */}
            <Scoreboard state={state} updateScorePoint={updateScorePoint} />

            {/* SPACE Cognitive Reserves & Flow State Tuner */}
            <FlowTuner state={state} updateState={updateState} />

            {/* Historical System Index Heatmap */}
            <ContributionGrid />

            {/* The Clipboard Wall: Beautifully divided categories */}
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-neutral-600" />
                  <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-neutral-700">
                    Tactile Board Clipboards
                  </h2>
                </div>
                <span className="text-xs font-mono text-neutral-400">
                  Select a board to drill down into logs, sliders & controls
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedBoards.map((b) => {
                  const Icon = b.icon;
                  return (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBoard(b.id)}
                      draggable={true}
                      onDragStart={(e) => {
                        setDraggedBoardId(b.id);
                        e.dataTransfer.setData("text/plain", b.id);
                      }}
                      onDragEnd={() => {
                        setDraggedBoardId(null);
                        setDragOverBoardId(null);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (draggedBoardId !== b.id) {
                          setDragOverBoardId(b.id);
                        }
                      }}
                      onDragLeave={() => {
                        if (dragOverBoardId === b.id) {
                          setDragOverBoardId(null);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const draggedId = e.dataTransfer.getData("text/plain");
                        handleDropSwap(draggedId, b.id);
                        setDraggedBoardId(null);
                        setDragOverBoardId(null);
                      }}
                      className={`group relative bg-white border transition-all duration-300 p-6 flex flex-col justify-between cursor-pointer hover:shadow-md pt-8 ${
                        draggedBoardId === b.id
                          ? "opacity-30 border-dashed border-neutral-450 bg-neutral-100 scale-95"
                          : dragOverBoardId === b.id
                          ? "border-indigo-600 border-2 bg-indigo-50/20 scale-[1.01] shadow-sm"
                          : "border-neutral-200 hover:border-neutral-800"
                      }`}
                    >
                      {/* Literal Metal Clip accent on top of clipboard card */}
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1.5 h-3 w-16 bg-neutral-100 border border-neutral-200 border-t-neutral-300 rounded shadow-xs flex items-center justify-center">
                        <div className="w-8 h-1 bg-neutral-300 rounded-full" />
                      </div>

                      <div>
                        {/* Board Header Info */}
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
                          <div className="flex items-center space-x-1.5">
                            {/* Grip handle for drag and drop indication */}
                            <div className="cursor-grab text-neutral-300 hover:text-neutral-500 p-0.5 active:cursor-grabbing transition-colors" title="Drag card to reorder">
                              <GripVertical className="w-3 h-3" />
                            </div>
                            <span className="text-[9px] font-mono font-bold tracking-widest text-neutral-400 uppercase select-none">
                              {b.num}
                            </span>
                            {/* Reordering micro controls (tactile clicks) */}
                            <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation(); // prevent opening detailed board
                                  moveBoard(b.id, "left");
                                }}
                                className="p-0.5 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-800 rounded transition-colors cursor-pointer border border-transparent hover:border-neutral-200"
                                title="Move Left"
                              >
                                <ChevronLeft className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation(); // prevent opening detailed board
                                  moveBoard(b.id, "right");
                                }}
                                className="p-0.5 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-800 rounded transition-colors cursor-pointer border border-transparent hover:border-neutral-200"
                                title="Move Right"
                              >
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <span
                            className={`text-[9px] font-mono font-bold uppercase tracking-wider border px-2 py-0.5 ${b.statusColor}`}
                          >
                            {b.status}
                          </span>
                        </div>

                        {/* Title and Icon */}
                        <div className="flex items-start space-x-3 mb-4">
                          <div className={`p-2 rounded ${b.iconColor} transition-transform group-hover:scale-105`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-display font-bold text-base text-neutral-900 group-hover:text-neutral-950 transition-colors uppercase tracking-tight">
                              {b.title}
                            </h3>
                            <p className="text-xs text-neutral-500 leading-tight">
                              {b.subtitle}
                            </p>
                          </div>
                        </div>

                        {/* Large Primary Stat display */}
                        <div className="py-2.5">
                          <span className="text-[10px] font-mono text-neutral-400 block uppercase tracking-wider">
                            CURRENT EFFICIENCY STAT
                          </span>
                          <div className="text-lg font-display font-black text-neutral-850 mt-0.5 truncate tracking-tight">
                            {b.primaryStat}
                          </div>
                          <div className="text-[10px] font-mono text-neutral-500 mt-1 truncate">
                            {b.secondaryStat}
                          </div>
                        </div>
                      </div>

                      {/* Board Footer Score and Navigation */}
                      <div className="border-t border-neutral-100 pt-3.5 mt-4 flex items-center justify-between">
                        <div className="flex items-baseline space-x-1">
                          <span className="text-[10px] font-mono text-neutral-400 uppercase">
                            INDEX:
                          </span>
                          <span className="text-xs font-mono font-bold text-neutral-800">
                            {b.score}
                          </span>
                        </div>

                        <div className="flex items-center text-xs font-mono text-neutral-400 group-hover:text-neutral-900 transition-colors uppercase font-bold">
                          <span>INSPECT</span>
                          <ChevronRight className="w-3.5 h-3.5 ml-0.5 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Quick Micro Protocols and Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              <div className="bg-white border border-neutral-200 p-6">
                <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 block mb-2">
                  OPERATING CHARTER PROTOCOLS
                </span>
                <h3 className="font-display font-bold text-sm text-neutral-900 uppercase mb-3">
                  System Guardrails
                </h3>
                <ul className="space-y-2 text-xs text-neutral-600 font-mono uppercase">
                  <li className="flex items-start">
                    <span className="text-neutral-400 mr-2">1.</span>
                    <span>Zero academic zero-days until Quiz 1 completed.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-neutral-400 mr-2">2.</span>
                    <span>Kriya Yoga is compulsory (60m) to preserve cognitive bandwidth.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-neutral-400 mr-2">3.</span>
                    <span>Solve MLF subspaces questions daily to build mathematical intuition.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white border border-neutral-200 p-6 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 block mb-2">
                    HARDWARE UTILITIES
                  </span>
                  <h3 className="font-display font-bold text-sm text-neutral-900 uppercase mb-3">
                    System Control & Simulation
                  </h3>
                  <p className="text-xs text-neutral-500 leading-normal">
                    Reset today's tracking progress to clean slate (zero metrics), or simulate a calendar drift to test the offline streak recovery logic and verification alerts.
                  </p>
                </div>
                <div className="mt-4 space-y-2">
                  <button
                    onClick={simulateMissedDay}
                    className="w-full py-2 bg-amber-50 hover:bg-amber-100 border border-dashed border-amber-300 hover:border-amber-800 text-[10px] font-mono uppercase text-amber-700 hover:text-amber-900 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Simulate Missed Day (Trigger Verification)</span>
                  </button>
                  <button
                    onClick={resetCurrentDay}
                    className="w-full py-2 border border-dashed border-neutral-300 hover:border-neutral-800 text-[10px] font-mono uppercase text-neutral-500 hover:text-neutral-900 bg-white transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Current Day</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 2. Detailed Expanded Board View */
          <div className="space-y-6">
            {/* Quick Switch Ribbon at the top to jump between clipboards in 1 click! */}
            <div className="bg-white border border-neutral-200 p-2 overflow-x-auto flex items-center space-x-1.5 scrollbar-thin">
              <span className="text-[9px] font-mono text-neutral-400 uppercase font-bold px-2 whitespace-nowrap">
                CLIPBOARDS:
              </span>
              {sortedBoards.map((b) => {
                const Icon = b.icon;
                const isSelected = selectedBoard === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBoard(b.id)}
                    className={`flex items-center space-x-1 px-3 py-1.5 font-mono text-[10px] font-bold uppercase transition-colors whitespace-nowrap ${
                      isSelected
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-50 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-950 border border-neutral-200"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{b.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Main Container of Selected Board */}
            <div className="bg-white border border-neutral-200 p-6 relative">
              {/* Back Link & Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 pb-4 mb-6 gap-3">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedBoard(null)}
                    className="p-1.5 hover:bg-neutral-100 rounded text-neutral-500 hover:text-neutral-900 transition-colors"
                    title="Back to Wall"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase">
                        {boards.find((b) => b.id === selectedBoard)?.num} // IN-DEPTH TRACKER
                      </span>
                    </div>
                    <h2 className="text-xl font-display font-black text-neutral-900 uppercase">
                      {boards.find((b) => b.id === selectedBoard)?.title} Specifications
                    </h2>
                  </div>
                </div>

                {/* Score context */}
                <div className="flex items-center space-x-3 self-start sm:self-center">
                  <div className="bg-neutral-50 border border-neutral-200 px-3 py-1 rounded">
                    <span className="text-[9px] font-mono text-neutral-400 block uppercase">
                      BOARD EFFICIENCY
                    </span>
                    <span className="text-xs font-mono font-bold text-neutral-800">
                      {boards.find((b) => b.id === selectedBoard)?.score}
                    </span>
                  </div>
                </div>
              </div>

              {/* Conditionally Render the matching Detailed Tracker Component */}
              {selectedBoard === "academic" && (
                <div className="space-y-6">
                  <AcademicTracker
                    state={state}
                    toggleCourseWeek={toggleCourseWeek}
                    updateState={updateState}
                    onActivateFocus={setActiveFocusTask}
                  />
                  {/* Category Backlog integration */}
                  <div className="border border-neutral-200 p-4 bg-neutral-50">
                    <h3 className="font-mono text-xs font-bold uppercase mb-2">Academic Backlogs</h3>
                    {(state.backlog?.academic || []).length === 0 ? (
                      <p className="text-xs text-neutral-500">No active academic backlogs pending.</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {(state.backlog?.academic || []).map((item, idx) => (
                          <li key={idx} className="text-xs text-neutral-700 flex items-center justify-between bg-white p-2 border border-neutral-200">
                            <span>{item}</span>
                            <button
                              onClick={() => removeBacklogItem("academic", idx)}
                              className="text-[10px] font-mono text-rose-600 hover:text-rose-800 font-bold uppercase"
                            >
                              Resolve
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {selectedBoard === "projects" && (
                <div className="space-y-6">
                  <ProjectTracker
                    state={state}
                    updateProjectProgress={updateProjectProgress}
                    updateProjectViva={updateProjectViva}
                    updateProjectOwnership={updateProjectOwnership}
                    updateState={updateState}
                    onActivateFocus={setActiveFocusTask}
                  />
                  {/* Category Backlog integration */}
                  <div className="border border-neutral-200 p-4 bg-neutral-50">
                    <h3 className="font-mono text-xs font-bold uppercase mb-2">Projects Backlogs</h3>
                    {(state.backlog?.projects || []).length === 0 ? (
                      <p className="text-xs text-neutral-500">No active project backlogs pending.</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {(state.backlog?.projects || []).map((item, idx) => (
                          <li key={idx} className="text-xs text-neutral-700 flex items-center justify-between bg-white p-2 border border-neutral-200">
                            <span>{item}</span>
                            <button
                              onClick={() => removeBacklogItem("projects", idx)}
                              className="text-[10px] font-mono text-rose-600 hover:text-rose-800 font-bold uppercase"
                            >
                              Resolve
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {selectedBoard === "kidaura" && (
                <div className="space-y-6">
                  <KidauraTracker state={state} updateState={updateState} onActivateFocus={setActiveFocusTask} />
                  {/* Category Backlog integration */}
                  <div className="border border-neutral-200 p-4 bg-neutral-50">
                    <h3 className="font-mono text-xs font-bold uppercase mb-2">Kidaura Backlogs</h3>
                    {(state.backlog?.kidaura || []).length === 0 ? (
                      <p className="text-xs text-neutral-500">No active Kidaura backlogs pending.</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {(state.backlog?.kidaura || []).map((item, idx) => (
                          <li key={idx} className="text-xs text-neutral-700 flex items-center justify-between bg-white p-2 border border-neutral-200">
                            <span>{item}</span>
                            <button
                              onClick={() => removeBacklogItem("kidaura", idx)}
                              className="text-[10px] font-mono text-rose-600 hover:text-rose-800 font-bold uppercase"
                            >
                              Resolve
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {selectedBoard === "build" && (
                <div className="space-y-6">
                  <BuildTracker state={state} updateState={updateState} onActivateFocus={setActiveFocusTask} />
                  {/* Category Backlog integration */}
                  <div className="border border-neutral-200 p-4 bg-neutral-50">
                    <h3 className="font-mono text-xs font-bold uppercase mb-2">Build Backlogs</h3>
                    {(state.backlog?.build || []).length === 0 ? (
                      <p className="text-xs text-neutral-500">No active build backlogs pending.</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {(state.backlog?.build || []).map((item, idx) => (
                          <li key={idx} className="text-xs text-neutral-700 flex items-center justify-between bg-white p-2 border border-neutral-200">
                            <span>{item}</span>
                            <button
                              onClick={() => removeBacklogItem("build", idx)}
                              className="text-[10px] font-mono text-rose-600 hover:text-rose-800 font-bold uppercase"
                            >
                              Resolve
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {selectedBoard === "body" && (
                <div className="space-y-6">
                  <BodySleepTracker state={state} updateState={updateState} />
                </div>
              )}

              {selectedBoard === "sleep" && (
                <div className="space-y-6">
                  <BodySleepTracker state={state} updateState={updateState} />
                </div>
              )}

              {selectedBoard === "health" && (
                <div className="space-y-6">
                  <HealthTracker state={state} updateState={updateState} />
                  {/* Category Backlog integration */}
                  <div className="border border-neutral-200 p-4 bg-neutral-50">
                    <h3 className="font-mono text-xs font-bold uppercase mb-2">Health & General Backlogs</h3>
                    {(state.backlog?.health || []).length === 0 ? (
                      <p className="text-xs text-neutral-500">No active general backlogs pending.</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {(state.backlog?.health || []).map((item, idx) => (
                          <li key={idx} className="text-xs text-neutral-700 flex items-center justify-between bg-white p-2 border border-neutral-200">
                            <span>{item}</span>
                            <button
                              onClick={() => removeBacklogItem("health", idx)}
                              className="text-[10px] font-mono text-rose-600 hover:text-rose-800 font-bold uppercase"
                            >
                              Resolve
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {selectedBoard === "leaks" && (
                <div className="space-y-6">
                  <LeakageDetector state={state} updateState={updateState} />
                </div>
              )}

              {selectedBoard === "logs" && (
                <div className="space-y-6">
                  <LogsAndBacklog
                    state={state}
                    addBacklogItem={addBacklogItem}
                    removeBacklogItem={removeBacklogItem}
                    onActivateFocus={setActiveFocusTask}
                  />
                </div>
              )}

              {selectedBoard === "ideas" && (
                <div className="space-y-6">
                  <IdeasIncubator
                    state={state}
                    updateState={updateState}
                    addBacklogItem={addBacklogItem}
                  />
                </div>
              )}

              {/* Close Button at bottom of board detail */}
              <div className="border-t border-neutral-100 pt-6 mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedBoard(null)}
                  className="bg-neutral-50 hover:bg-neutral-100 text-neutral-800 font-mono text-xs font-bold uppercase tracking-wider px-5 py-2 border border-neutral-300 transition-colors"
                >
                  Close & Return to Wall
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Laboratory Input Terminal */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-neutral-200 flex flex-col items-center justify-center z-50 shadow-lg">
        {apiError && (
          <div className="w-full max-w-4xl mb-2 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono rounded flex justify-between items-center">
            <span>{apiError}</span>
            <button onClick={() => setApiError(null)} className="font-bold hover:text-rose-900 ml-2">×</button>
          </div>
        )}

        {/* AI Co-Pilot Response dialogue box */}
        {aiResponse && (
          <div className="w-full max-w-4xl mb-3 bg-indigo-50/95 border border-indigo-200 p-4 rounded-lg shadow-md relative animate-fade-in text-neutral-800 backdrop-blur-sm">
            <div className="flex items-start space-x-3 pr-24">
              <MessageSquare className="w-4 h-4 text-indigo-600 mt-1 flex-shrink-0 animate-pulse" />
              <div className="w-full space-y-3">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-indigo-500 uppercase block font-bold mb-1">
                    Dave OS Laboratory Co-Pilot Advice
                  </span>
                  <p className="text-xs font-sans font-medium leading-relaxed">
                    {aiResponse}
                  </p>
                </div>

                {/* Mode Switch Recommendation Safeguard */}
                {modeRecommendation && (
                  <div className="mt-2.5 pt-2.5 border-t border-indigo-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-100/40 p-2.5 rounded border border-indigo-200/30 animate-fade-in">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-1.5">
                        <Zap className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                        <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-wider">
                          Advisory: Mode Shift Recommended
                        </span>
                      </div>
                      <p className="text-xs text-neutral-800">
                        Recommend switching to <strong className="font-semibold text-indigo-700">{modeRecommendation.recommendedMode}</strong>: <span className="text-neutral-600 text-[11px] font-mono">{modeRecommendation.reason}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        updateState({ mode: modeRecommendation.recommendedMode as any });
                        setModeRecommendation(null);
                      }}
                      className="self-start sm:self-center bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-3 py-1 text-[10px] font-mono font-bold uppercase rounded-md shadow transition-all cursor-pointer"
                    >
                      Apply Mode Switch
                    </button>
                  </div>
                )}

                {/* Uncertainties Safeguard */}
                {uncertainties && uncertainties.length > 0 && (
                  <div className="mt-2.5 pt-2.5 border-t border-indigo-200/50 animate-fade-in">
                    <div className="flex items-center space-x-1.5 mb-1 text-amber-600">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                        Uncertainties Detected (No state actions taken)
                      </span>
                    </div>
                    <ul className="list-disc pl-5 space-y-0.5">
                      {uncertainties.map((unc, i) => (
                        <li key={i} className="text-xs text-neutral-600 font-mono">
                          {unc}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Ignored Factual Metrics Protected Safeguard */}
                {ignoredFacts && ignoredFacts.length > 0 && (
                  <div className="mt-2.5 pt-2.5 border-t border-indigo-200/50 animate-fade-in">
                    <div className="flex items-center space-x-1.5 mb-1 text-neutral-500">
                      <Shield className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                        Metrics Protected (Ignored to prevent state corruption/hallucinations)
                      </span>
                    </div>
                    <ul className="list-disc pl-5 space-y-0.5">
                      {ignoredFacts.map((fact, i) => (
                        <li key={i} className="text-xs text-neutral-500 italic">
                          "{fact}"
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                setAiResponse(null);
                setModeRecommendation(null);
                setUncertainties([]);
                setIgnoredFacts([]);
              }}
              className="absolute top-3 right-3 px-2 py-1 bg-white hover:bg-neutral-100 border border-neutral-200 hover:border-neutral-400 rounded transition-all text-[10px] font-bold font-mono text-neutral-600 uppercase cursor-pointer"
              title="Acknowledge response"
            >
              Acknowledge
            </button>
          </div>
        )}

        {/* Suggested log / query pills */}
        <div className="w-full max-w-4xl mb-2 flex items-center space-x-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-neutral-200">
          <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-widest flex-shrink-0">
            SUGGESTED LOGS:
          </span>
          <div className="flex space-x-1.5">
            {quickLogs.map((log, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setLogInput(log.text)}
                className="bg-neutral-50 hover:bg-neutral-800 hover:text-white border border-neutral-200 px-2.5 py-1 text-[10px] font-mono font-semibold uppercase text-neutral-600 rounded-full transition-all whitespace-nowrap cursor-pointer"
                title={log.text}
              >
                {log.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleLogSubmit} className="w-full max-w-4xl relative">
          <div className="absolute left-4 top-3.5 text-neutral-400 flex items-center space-x-1.5">
            <Terminal className={`w-4 h-4 ${isProcessing ? "text-indigo-600 animate-pulse" : "text-neutral-600"}`} />
          </div>
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`absolute left-10 top-2.5 p-1 rounded transition-colors ${
              isListening ? "bg-rose-500 text-white animate-pulse" : "text-neutral-400 hover:text-neutral-700"
            }`}
            title="Speech-to-Text Voice Log"
          >
            <Mic className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={logInput}
            onChange={(e) => setLogInput(e.target.value)}
            disabled={isProcessing}
            placeholder={isProcessing ? "AI is processing and updating your dashboard..." : "Type daily log (e.g. 'MLF week 3 done, slept at 12 AM') or ask a question..."}
            className={`w-full border rounded py-3 pl-[72px] pr-44 text-xs text-neutral-800 font-mono focus:outline-none focus:border-neutral-900 shadow-inner transition-all ${
              isProcessing 
                ? "bg-indigo-50/40 border-indigo-200 cursor-not-allowed text-indigo-900" 
                : "bg-neutral-50 border-neutral-200 focus:bg-white"
            }`}
          />
          <button
            type="submit"
            disabled={isProcessing || !logInput.trim()}
            className={`absolute right-2 top-2 bottom-2 px-4 rounded text-xs font-mono font-bold transition-colors uppercase tracking-wider flex items-center justify-center ${
              isProcessing
                ? "bg-indigo-600 text-white cursor-not-allowed animate-pulse"
                : !logInput.trim()
                ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                : "bg-neutral-900 hover:bg-neutral-800 text-white"
            }`}
          >
            {isProcessing ? "PROCESSING" : "EXECUTE LEDGER"}
          </button>
        </form>
      </div>

      {activeFocusTask && (
        <FocusShield
          taskTitle={activeFocusTask}
          onClose={() => setActiveFocusTask(null)}
        />
      )}

      {showClinicianSuite && (
        <ClinicianSuite
          state={state}
          updateState={updateState}
          onClose={() => setShowClinicianSuite(false)}
        />
      )}
    </div>
  );
}
