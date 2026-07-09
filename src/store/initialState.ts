import { AppState } from "../types";

export const initialAppState: AppState = {
  currentDate: new Date().toISOString(),
  mode: "Rescue Mode",
  topPriorities: [
    "Quiz 1 prep for Weeks 1-4",
    "Sadhana Streak Maintenance",
    "Projects/viva readiness"
  ],
  nextBestAction: "Resume Quiz 1 prep (BDM Week 1 or DL Genie practice questions) immediately to avoid a zero-day.",
  currentRisk: "Zero quiz progress today due to other commitments. Risk of falling behind on Quiz 1.",
  minimumViableDay: "1 hr Quiz prep, 45 min Kriya, Sleep by 6 AM.",
  scores: {
    academic: 0,
    build: 5,
    body: 12,
    sleep: 9,
    system: 8,
    total: 34,
    interpretation: "Rescue day - low output due to commitments, but honest logging saved the streak."
  },
  courses: [
    {
      id: "mlf",
      name: "Machine Learning Foundations",
      shortName: "ML Foundations",
      weekStatuses: { 1: "done", 2: "in-progress", 3: "done", 4: "not-started" },
      recallSheetStatus: "in-progress",
      practiceQuestions: "in-progress",
      mistakeLog: [],
      weakTopics: ["Four fundamental subspaces (Row, Col, Null, Left Null)"],
      nextOutput: "Review MLF Week 3 questions and update recall sheet."
    },
    {
      id: "dl-genai",
      name: "Intro to DL & GenAI",
      shortName: "DL Genie",
      weekStatuses: { 1: "done", 2: "done", 3: "done", 4: "done" },
      recallSheetStatus: "in-progress",
      practiceQuestions: "in-progress",
      mistakeLog: [],
      weakTopics: [],
      nextOutput: "Solve daily practice questions until Quiz 1.",
      notes: "Weeks 1-4 theory done. Weeks 7-10 important later (Autoencoders, GANs, Diffusion, Transformers)."
    },
    {
      id: "bdm",
      name: "Business Data Management",
      shortName: "BDM",
      weekStatuses: { 1: "not-started", 2: "not-started", 3: "not-started", 4: "not-started" },
      recallSheetStatus: "not-started",
      practiceQuestions: "not-started",
      mistakeLog: [],
      weakTopics: [],
      nextOutput: "Complete Week 1 concepts."
    }
  ],
  projects: [
    {
      id: "ml-proj",
      name: "ML Project",
      progress: 20,
      artifact: "Initial proposal",
      vivaReadiness: 1,
      codeOwnershipLevel: 1,
      nextAction: "Define dataset.",
      stuckPoint: "None"
    },
    {
      id: "dl-proj",
      name: "DL Project",
      progress: 10,
      artifact: "Topic selection",
      vivaReadiness: 0,
      codeOwnershipLevel: 0,
      nextAction: "Read baseline papers.",
      stuckPoint: "None"
    },
    {
      id: "mad2",
      name: "MAD 2 Placement Portal",
      progress: 40,
      artifact: "Login route",
      vivaReadiness: 2,
      codeOwnershipLevel: 2,
      nextAction: "Trace data flow for student profile.",
      stuckPoint: "Understanding the exact route data flow"
    }
  ],
  kidaura: {
    activeThread: "Coordination / Meetings",
    artifacts: ["Raw data parsing script", "OS dashboard integrated into IEP app"],
    osDashboardIntegrationStatus: "integrated",
    asdVsTdStatus: "Defining what exactly one training sample is",
    rawToVideoStatus: "Creating videos from raw data",
    sampleDefinition: "Unknown - needs definition (e.g. one child/session?)",
    observabilityStatus: "Need to learn IEP dashboard integration",
    nextTechnicalQuestion: "How to use the integrated open-source dashboard with the IEP platform?",
    stuckPoint: "Learning the newly integrated open-source project.",
    tasks: [
      {
        id: "task-1",
        title: "Integrate custom visualization dashboard in IEP app",
        createdAt: "2026-07-04", // 1 day ago (will be yellow)
        completed: false,
        longTermTaskId: "lt-3"
      },
      {
        id: "task-2",
        title: "Define concrete boundaries for ASD/TD sample session windows",
        createdAt: "2026-07-03", // 2 days ago (will be orange)
        completed: false,
        longTermTaskId: "lt-1"
      },
      {
        id: "task-3",
        title: "Patent/IP enhance outline for raw video parser",
        createdAt: "2026-07-02", // 3 days ago (will be red)
        completed: false,
        longTermTaskId: "lt-2"
      },
      {
        id: "task-4",
        title: "Draft raw-to-video parser technical architecture draft",
        createdAt: "2026-07-05", // Today
        completed: true,
        completedAt: "2026-07-05",
        longTermTaskId: "lt-1"
      }
    ],
    longTermTasks: [
      {
        id: "lt-1",
        title: "ASD/TD Classification Model",
        description: "Develop a robust temporal/spatial classification pipeline for diagnostic aid.",
        status: "active"
      },
      {
        id: "lt-2",
        title: "IP Enhancing & Patenting",
        description: "Draft, protect, and document novel pipelines and proprietary methodologies.",
        status: "active"
      },
      {
        id: "lt-3",
        title: "General Kidaura Work & IEP Integration",
        description: "Daily engineering tasks, dashboard connections, meeting actions, and core integrations.",
        status: "active"
      }
    ]
  },
  build: {
    pureCodingHours: 0,
    conceptLearning: "None today",
    researchPaperWork: "None",
    openSourceContribution: "None today",
    opportunityWork: "None",
    artifactsCreated: ["Two Kidaura meetings (Coordination)"],
    nextAction: "Prepare for projects viva and trace data flow."
  },
  body: {
    kriyaDurationMinutes: 60,
    movementDone: true,
    intensity: 6,
    soreness: 4,
    energy: 5,
    weeklyAverageMinutes: 56,
    streakDays: 5,
    isRecoveryDay: false,
    practiceStreak: 5,
    loggingStreak: 12,
    lastLoggedDate: "2026-07-04",
    isPracticeStatusUnverified: false
  },
  sleep: {
    sleepTime: "12:00 PM",
    wakeTime: "06:00 PM",
    totalSleepHours: 6.0,
    consistency: 3,
    energy: 5,
    sunlight: false,
    caffeine: "Unknown",
    currentExperiment: "Track energy with 12pm-6pm sleep",
    recommendation: "Sleep cycle is heavily inverted. Continue Quiz Mode but monitor morning alertness for Quiz 1."
  },
  health: {
    mood: 5,
    energy: 4,
    hydration: "Unknown",
    caffeine: "Unknown",
    foodDiscipline: "Unknown",
    fatigue: "Mild",
    sunlight: false
  },
  activeLeaks: ["Context switching", "Other commitments"],
  backlog: {
    academic: ["BDM Week 2", "MLF Assignment 2"],
    projects: ["MAD 2 DB Models Review", "DL baseline implementation"],
    kidaura: ["Talk to Shiv about observability"],
    build: ["Read Diffusion paper"],
    health: ["Buy magnesium"]
  },
  logs: [
    {
      id: "3",
      timestamp: new Date().toISOString(),
      content: "Due to other commitments, did not make any progress on the quiz today. Had 2 Kidaura coordination meetings. Completed practice for 1 hour."
    },
    {
      id: "2",
      timestamp: "2026-07-02T13:24:17-07:00",
      content: "Woke up at 6pm. Slept at 12 noon. Did practices for 1h 10m. MLF week 3 lecture attended (4 fundamental subspaces) and solved 4 questions. Kidaura OS integration into IEP app is done, need to learn it. DL Gen AI Weeks 1-4 theory done, solving questions daily."
    },
    {
      id: "1",
      timestamp: "2026-07-02T13:18:06-07:00",
      content: "System Initialized. Loaded v1.0 state."
    }
  ],
  changeLogs: [
    "Logged 60 min practice",
    "Logged 2 Kidaura coordination meetings",
    "Flagged zero quiz progress as current risk",
    "Shifted to Rescue Mode to stop leakage"
  ],
  ideas: [
    {
      id: "idea-1",
      title: "Kriya Breathing Pacemaker Visualizer",
      description: "An audio-visual guide/sound generator that syncs up with 1:1 or custom Kriya breathing ratios, dynamically adjusting frequencies based on user-entered sadhana pacing.",
      createdAt: "2026-07-05",
      status: "researching",
      priority: "high",
      tags: ["Sadhana", "Audio Synth"]
    },
    {
      id: "idea-2",
      title: "Continuous Blood Glucose ML Predictor",
      description: "Train a lightweight regression or LSTM model to predict postprandial glucose dips using continuous glucose logs and food logging timestamps to optimize afternoon high-focus blocks.",
      createdAt: "2026-07-03",
      status: "backburner",
      priority: "medium",
      tags: ["ML", "Biohacking"]
    },
    {
      id: "idea-3",
      title: "Local-First Vector Database in Rust",
      description: "Experiment with building a small memory-mapped local vector index in Rust for semantic search across my markdown notes archive, compiling it to WebAssembly for browser speed.",
      createdAt: "2026-07-01",
      status: "backburner",
      priority: "low",
      tags: ["Systems", "Rust", "AI"]
    }
  ],
  calendarEvents: [
    {
      id: "event-1",
      date: "2026-07-06",
      title: "Quiz 1 Prep Milestone",
      description: "Review machine learning linear algebra and Business Data Management Week 1.",
      type: "exam"
    },
    {
      id: "event-2",
      date: "2026-07-10",
      title: "Kidaura Integration Review",
      description: "Demo the open-source dashboard integration with the IEP app platform.",
      type: "milestone"
    },
    {
      id: "event-3",
      date: "2026-07-15",
      title: "BDM Assignment 2 Due",
      description: "Submit Business Data Management assignment on database normalization.",
      type: "task"
    }
  ],
  role: "patient",
  asrsHistory: [
    {
      id: "asrs-initial",
      date: "2026-06-25",
      answers: { 1: 3, 2: 2, 3: 3, 4: 4, 5: 2, 6: 3 }, // 3=Often, 2=Sometimes, 4=Very Often
      score: 5,
      isSignificant: true
    }
  ],
  clinicianPrescriptions: [
    {
      id: "presc-1",
      date: "2026-06-25",
      doctorName: "Dr. Dave, MD (ADHD Specialist)",
      protocolNotes: "Focus primarily on advancing the circadian phase: strict light-therapy at 7:30 AM to advance sleep onset. Leverage short Task-Positive Network (TPN) breathing warm-ups before coding sessions to override default hyper-arousal.",
      medicationGuideline: "Methylphenidate ER 20mg at 8:00 AM daily",
      active: true
    }
  ]
};
