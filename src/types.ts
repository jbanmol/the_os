export type OperatingMode = "Quiz Mode" | "Build Mode" | "Recovery Mode" | "Rescue Mode" | "Normal Mode";

export interface Course {
  id: string;
  name: string;
  shortName: string;
  weekStatuses: Record<number, "not-started" | "in-progress" | "done">;
  recallSheetStatus: "not-started" | "in-progress" | "done";
  practiceQuestions: "not-started" | "in-progress" | "done";
  mistakeLog: string[];
  weakTopics: string[];
  nextOutput: string;
  notes?: string;
}

export interface Project {
  id: string;
  name: string;
  progress: number; // 0-100
  artifact: string;
  vivaReadiness: number; // 0-5
  codeOwnershipLevel: number; // 0-5
  nextAction: string;
  stuckPoint: string;
}

export interface KidauraTask {
  id: string;
  title: string;
  createdAt: string; // YYYY-MM-DD logical date
  completed: boolean;
  completedAt?: string;
  longTermTaskId?: string; // Optional association
}

export interface KidauraLongTermTask {
  id: string;
  title: string;
  description?: string;
  status: "active" | "completed" | "paused";
}

export interface KidauraState {
  activeThread: string;
  artifacts: string[];
  osDashboardIntegrationStatus: "learning" | "understood" | "integrated";
  asdVsTdStatus: string;
  rawToVideoStatus: string;
  sampleDefinition: string;
  observabilityStatus: string;
  nextTechnicalQuestion: string;
  stuckPoint: string;
  tasks?: KidauraTask[];
  longTermTasks?: KidauraLongTermTask[];
}

export interface BuildState {
  pureCodingHours: number;
  conceptLearning: string;
  researchPaperWork: string;
  openSourceContribution: string;
  opportunityWork: string;
  artifactsCreated: string[];
  nextAction: string;
}

export interface BodyState {
  kriyaDurationMinutes: number;
  movementDone: boolean;
  intensity: number; // 1-10
  soreness: number; // 1-10
  energy: number; // 1-10
  weeklyAverageMinutes: number;
  streakDays: number;
  isRecoveryDay: boolean;
  practiceStreak: number;
  loggingStreak: number;
  lastLoggedDate: string; // YYYY-MM-DD
  isPracticeStatusUnverified: boolean;
}

export interface SleepState {
  sleepTime: string;
  wakeTime: string;
  totalSleepHours: number;
  consistency: number; // 1-10
  energy: number; // 1-10
  sunlight: boolean;
  caffeine: string;
  currentExperiment: string;
  recommendation: string;
}

export interface HealthState {
  mood: number; // 1-10
  energy: number; // 1-10
  hydration: string;
  caffeine: string;
  foodDiscipline: string;
  fatigue: string;
  sunlight: boolean;
}

export interface DailyScores {
  academic: number; // max 25
  build: number; // max 25
  body: number; // max 20
  sleep: number; // max 20
  system: number; // max 10
  total: number;
  interpretation: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  content: string;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  status: "backburner" | "researching" | "in-progress" | "archived";
  priority: "low" | "medium" | "high";
  tags?: string[];
}

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description?: string;
  type?: "exam" | "task" | "milestone" | "personal" | "other";
}

export interface AppState {
  currentDate: string;
  mode: OperatingMode;
  topPriorities: string[];
  nextBestAction: string;
  currentRisk: string;
  minimumViableDay: string;
  scores: DailyScores;
  courses: Course[];
  projects: Project[];
  kidaura: KidauraState;
  build: BuildState;
  body: BodyState;
  sleep: SleepState;
  health: HealthState;
  activeLeaks: string[];
  backlog: {
    academic: string[];
    projects: string[];
    kidaura: string[];
    build: string[];
    health: string[];
  };
  logs: LogEntry[];
  changeLogs: string[];
  ideas?: Idea[];
  calendarEvents?: CalendarEvent[];
  boardOrder?: string[];
  scoreOffsets?: {
    academic: number;
    build: number;
    body: number;
    sleep: number;
    system: number;
  };
  role?: "patient" | "clinician";
  asrsHistory?: ASRSRecord[];
  clinicianPrescriptions?: ClinicianPrescription[];
}

export interface ASRSRecord {
  id: string;
  date: string;
  answers: Record<number, number>; // 1-indexed questions (1 to 6) -> rating 0 (Never) to 4 (Very Often)
  score: number; // calculated score (0-6) based on threshold shaded boxes
  isSignificant: boolean; // whether 4 or more answers fall in the shaded frequency range
}

export interface ClinicianPrescription {
  id: string;
  date: string;
  doctorName: string;
  protocolNotes: string; // CBT guidance, cognitive pacing
  medicationGuideline?: string; // active pharmacological protocol
  active: boolean;
}

