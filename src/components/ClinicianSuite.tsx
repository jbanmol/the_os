import React, { useState } from "react";
import { AppState, ASRSRecord, ClinicianPrescription } from "../types";
import {
  Activity,
  Check,
  X,
  FileText,
  Lock,
  Printer,
  PlusCircle,
  Calendar,
  Heart,
  Shield,
  Clock,
  ArrowRight,
  ClipboardList,
  User,
  Plus,
  Trash2,
  AlertTriangle,
  Award
} from "lucide-react";

interface ClinicianSuiteProps {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  onClose: () => void;
}

export function ClinicianSuite({ state, updateState, onClose }: ClinicianSuiteProps) {
  const [activeTab, setActiveTab] = useState<"asrs" | "portal">("asrs");
  
  // ASRS state
  const [asrsAnswers, setAsrsAnswers] = useState<Record<number, number>>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0
  });
  const [screenerSaved, setScreenerSaved] = useState(false);

  // Clinician Portal Auth State
  const [pin, setPin] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(state.role === "clinician");
  const [authError, setAuthError] = useState("");

  // Prescription Form State
  const [doctorName, setDoctorName] = useState("Dr. Dave, MD");
  const [protocolNotes, setProtocolNotes] = useState("");
  const [medicationGuideline, setMedicationGuideline] = useState("");

  const asrsQuestions = [
    {
      id: 1,
      text: "How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?",
      isQ1toQ3: true // threshold is Sometimes (2) or higher
    },
    {
      id: 2,
      text: "How often do you have difficulty getting things in order when you have to do a task that requires organization?",
      isQ1toQ3: true
    },
    {
      id: 3,
      text: "How often do you have problems remembering appointments or obligations?",
      isQ1toQ3: true
    },
    {
      id: 4,
      text: "How often when you have a task that requires a lot of thought do you avoid or delay getting started?",
      isQ1toQ3: false // threshold is Often (3) or higher
    },
    {
      id: 5,
      text: "How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?",
      isQ1toQ3: false
    },
    {
      id: 6,
      text: "How often do you feel overly active and compelled to do things, like you were driven by a motor?",
      isQ1toQ3: false
    }
  ];

  const ratingLabels = ["Never", "Rarely", "Sometimes", "Often", "Very Often"];

  // Calculate ASRS Score based on official WHO screening criteria (shaded boxes)
  const calculateAsrsScore = (answers: Record<number, number>) => {
    let positiveTriggers = 0;
    asrsQuestions.forEach((q) => {
      const val = answers[q.id] || 0;
      if (q.isQ1toQ3) {
        // Q1, Q2, Q3: shaded box matches "Sometimes", "Often", "Very Often" (values 2, 3, 4)
        if (val >= 2) positiveTriggers++;
      } else {
        // Q4, Q5, Q6: shaded box matches "Often", "Very Often" (values 3, 4)
        if (val >= 3) positiveTriggers++;
      }
    });
    return positiveTriggers;
  };

  const currentScore = calculateAsrsScore(asrsAnswers);
  const isSignificant = currentScore >= 4;

  const handleSaveScreener = () => {
    const score = calculateAsrsScore(asrsAnswers);
    const newRecord: ASRSRecord = {
      id: `asrs-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      answers: { ...asrsAnswers },
      score,
      isSignificant: score >= 4
    };

    const updatedHistory = [newRecord, ...(state.asrsHistory || [])];
    
    // Create operational log in app state
    const timestamp = new Date().toISOString();
    const newLog = {
      id: Date.now().toString(),
      timestamp,
      content: `Clinical Log: Completed WHO ASRS-v1.1 ADHD Screener. Score: ${score}/6 positive indicators. Diagnostic threshold: ${score >= 4 ? "EXCEEDED" : "NOT EXCEEDED"}.`
    };

    updateState({
      asrsHistory: updatedHistory,
      logs: [newLog, ...state.logs],
      changeLogs: [`ASRS-v1.1 Screener completed: Score ${score}/6`, ...state.changeLogs].slice(0, 10)
    });

    setScreenerSaved(true);
    setTimeout(() => setScreenerSaved(false), 3000);
  };

  const handleUnlockPortal = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "1234") {
      setIsUnlocked(true);
      setAuthError("");
      updateState({ role: "clinician" });
    } else {
      setAuthError("Invalid Provider Authorization PIN. Try '1234' for local credential simulation.");
    }
  };

  const handleLockPortal = () => {
    setIsUnlocked(false);
    setPin("");
    updateState({ role: "patient" });
  };

  const handleIssuePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!protocolNotes.trim()) return;

    const newPrescription: ClinicianPrescription = {
      id: `presc-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      doctorName: doctorName || "Authorized Clinician",
      protocolNotes: protocolNotes.trim(),
      medicationGuideline: medicationGuideline.trim() || undefined,
      active: true
    };

    // Deactivate previous active prescriptions
    const updatedPrescriptions = (state.clinicianPrescriptions || []).map((p) => ({
      ...p,
      active: false
    }));

    const finalPrescriptions = [newPrescription, ...updatedPrescriptions];

    const timestamp = new Date().toISOString();
    const newLog = {
      id: Date.now().toString(),
      timestamp,
      content: `Clinician Log: Doctor ${doctorName} issued a new therapeutic prescription. Notes: "${protocolNotes.substring(0, 50)}...".`
    };

    updateState({
      clinicianPrescriptions: finalPrescriptions,
      logs: [newLog, ...state.logs],
      changeLogs: [`New clinical prescription issued by ${doctorName}`, ...state.changeLogs].slice(0, 10)
    });

    setProtocolNotes("");
    setMedicationGuideline("");
  };

  const handleDeletePrescription = (id: string) => {
    const updated = (state.clinicianPrescriptions || []).filter((p) => p.id !== id);
    updateState({ clinicianPrescriptions: updated });
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper calculations for clinical export summary
  const totalCompletedSlices = (state.logs || []).filter(l => l.content.includes("Focus Shield completed")).length;
  const recentBedtimes = [state.sleep.sleepTime]; // default fallback
  const sleepEfficiency = Math.round(((state.sleep.totalSleepHours || 7) / 8) * 100);

  return (
    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      {/* ClinicianSuite Print Container Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #clinical-print-area, #clinical-print-area * {
            visibility: visible;
          }
          #clinical-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 24px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white border border-neutral-300 w-full max-w-5xl shadow-2xl flex flex-col my-8 h-auto max-h-[90vh]" id="clinical-print-area">
        
        {/* Header - No Print handles during browser print preview */}
        <div className="bg-neutral-950 text-white p-4 font-mono text-[10px] tracking-widest flex items-center justify-between border-b border-neutral-800 no-print">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>CLINICAL DECISION SUPPORT & DIAGNOSTICS</span>
          </div>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors cursor-pointer text-xs"
          >
            [ ESCAPE ]
          </button>
        </div>

        {/* Title Block */}
        <div className="p-6 border-b border-neutral-200 bg-neutral-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-neutral-900 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 tracking-wider uppercase">
                Dual-Role Cognitive Telemetry Suite
              </span>
              <span className="text-neutral-400 font-mono text-xs">//</span>
              <span className="font-mono text-xs text-neutral-500 uppercase tracking-tight">
                WHO ASRS-v1.1 & Practitioner Interface
              </span>
            </div>
            <h1 className="text-2xl font-display font-black text-neutral-900 tracking-tight mt-1 uppercase">
              Clinical Assessment & Telemetry Portal
            </h1>
            <p className="text-xs font-mono text-neutral-500 mt-0.5">
              Secure patient-clinician pathways for real-time objective behavioral compliance and symptom mapping.
            </p>
          </div>

          <div className="flex items-center space-x-1 border border-neutral-300 bg-white p-1 no-print">
            <button
              onClick={() => setActiveTab("asrs")}
              className={`px-3 py-1.5 font-mono text-[10px] font-bold uppercase transition-all ${
                activeTab === "asrs"
                  ? "bg-neutral-900 text-white"
                  : "hover:bg-neutral-100 text-neutral-600"
              }`}
            >
              ASRS-v1.1 Patient Screener
            </button>
            <button
              onClick={() => setActiveTab("portal")}
              className={`px-3 py-1.5 font-mono text-[10px] font-bold uppercase transition-all flex items-center space-x-1 ${
                activeTab === "portal"
                  ? "bg-neutral-900 text-white"
                  : "hover:bg-neutral-100 text-neutral-600"
              }`}
            >
              <Lock className="w-2.5 h-2.5" />
              <span>Doctor Portal</span>
            </button>
          </div>
        </div>

        {/* Content Box */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: WHO ASRS-V1.1 ADHD SCREENER */}
          {activeTab === "asrs" && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Screener Form */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="border border-neutral-200 bg-white p-5 space-y-4">
                    <div className="border-b border-neutral-100 pb-3">
                      <div className="flex items-center space-x-2 text-neutral-800">
                        <ClipboardList className="w-4 h-4 text-neutral-700" />
                        <h3 className="font-mono text-xs font-bold uppercase">WHO ASRS-v1.1 ADHD Screening Instrument</h3>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1">
                        Please select the rating that best reflects your behavioral frequency over the past 6 months. Shaded columns indicate clinical threshold values.
                      </p>
                    </div>

                    <div className="space-y-5">
                      {asrsQuestions.map((q, idx) => (
                        <div key={q.id} className="space-y-2 border-b border-neutral-100 pb-4 last:border-0 last:pb-0">
                          <div className="flex items-start space-x-2.5">
                            <span className="font-mono text-xs font-bold text-neutral-400 mt-0.5">0{idx + 1}.</span>
                            <p className="text-xs text-neutral-800 font-medium font-sans leading-relaxed">{q.text}</p>
                          </div>
                          
                          {/* Radio Matrix with shaded background indicators according to WHO scoring rules */}
                          <div className="grid grid-cols-5 gap-1 pt-1 font-mono text-[9px]">
                            {ratingLabels.map((label, rVal) => {
                              const isShaded = q.isQ1toQ3 ? rVal >= 2 : rVal >= 3;
                              const isSelected = asrsAnswers[q.id] === rVal;
                              return (
                                <button
                                  key={label}
                                  type="button"
                                  onClick={() => {
                                    setAsrsAnswers((prev) => ({ ...prev, [q.id]: rVal }));
                                  }}
                                  className={`p-2 border text-center transition-all cursor-pointer font-bold ${
                                    isSelected
                                      ? "bg-neutral-900 border-neutral-900 text-white"
                                      : isShaded
                                      ? "bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border-neutral-200/80"
                                      : "bg-white hover:bg-neutral-50 text-neutral-400 border-neutral-200"
                                  }`}
                                >
                                  <span className="block uppercase text-[8px] tracking-tight mb-1">{label}</span>
                                  <div className={`w-2 h-2 rounded-full mx-auto border ${
                                    isSelected 
                                      ? "bg-white border-white" 
                                      : isShaded 
                                      ? "border-neutral-400 bg-neutral-200" 
                                      : "border-neutral-300 bg-white"
                                  }`} />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
                      <div className="flex items-center space-x-2 text-[11px] text-neutral-500 font-mono">
                        <Award className="w-4 h-4 text-neutral-400" />
                        <span>Scores are compiled immediately according to clinical norms.</span>
                      </div>
                      <button
                        onClick={handleSaveScreener}
                        className="bg-neutral-950 hover:bg-neutral-800 text-white font-mono text-xs font-bold uppercase tracking-wider px-4 py-2 cursor-pointer transition-colors"
                      >
                        {screenerSaved ? "ASSESSMENT RECORDED ✓" : "Log Diagnostic Assessment"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Score Diagnostics & History */}
                <div className="space-y-6">
                  {/* Realtime scoring meter */}
                  <div className="border border-neutral-200 p-5 bg-neutral-50 space-y-4">
                    <h3 className="font-mono text-xs font-bold uppercase text-neutral-800 pb-2 border-b border-neutral-200">
                      Real-time Interpretation
                    </h3>

                    <div className="text-center py-4 border-b border-neutral-200">
                      <div className="text-5xl font-display font-black text-neutral-900">
                        {currentScore} <span className="text-lg text-neutral-400 font-sans font-normal">/ 6</span>
                      </div>
                      <span className="font-mono text-[9px] font-bold tracking-widest uppercase block mt-1.5 text-neutral-500">
                        ASRS POSITIVE SYMPTOM INDEX
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-1.5 font-mono text-xs font-bold">
                        {isSignificant ? (
                          <div className="flex items-center space-x-1.5 text-rose-700">
                            <AlertTriangle className="w-4 h-4 animate-bounce" />
                            <span>CLINICAL THRESHOLD MET</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1.5 text-emerald-700">
                            <Check className="w-4 h-4" />
                            <span>BELOW DIAGNOSTIC THRESHOLD</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                        {isSignificant ? (
                          <strong>Diagnostic significance detected.</strong>
                        ) : (
                          <span>Standard threshold has not been exceeded.</span>
                        )}{" "}
                        A symptom index score of 4 or higher indicates behavioral patterns highly consistent with Adult ADHD. This screener acts as an ecological trigger to prompt detailed psychiatric evaluation.
                      </p>
                    </div>
                  </div>

                  {/* History List */}
                  <div className="border border-neutral-200 p-5 bg-white space-y-3">
                    <h3 className="font-mono text-xs font-bold uppercase text-neutral-800 pb-2 border-b border-neutral-100">
                      ASRS Screener Logs ({state.asrsHistory?.length || 0})
                    </h3>
                    
                    {(!state.asrsHistory || state.asrsHistory.length === 0) ? (
                      <p className="text-xs text-neutral-500 font-mono">No previous logs found.</p>
                    ) : (
                      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                        {state.asrsHistory.map((rec) => (
                          <div key={rec.id} className="p-3 border border-neutral-100 bg-neutral-50/50 rounded flex items-center justify-between">
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-mono text-neutral-500 block flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-neutral-400" />
                                {rec.date}
                              </span>
                              <span className="text-xs font-sans font-bold text-neutral-800">
                                Score: {rec.score} / 6 Positive
                              </span>
                            </div>
                            <span className={`px-2 py-0.5 text-[8px] font-mono font-bold uppercase rounded ${
                              rec.isSignificant 
                                ? "bg-rose-50 text-rose-700 border border-rose-100" 
                                : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            }`}>
                              {rec.isSignificant ? "Positive" : "Negative"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: CLINICIAN PORTAL */}
          {activeTab === "portal" && (
            <div className="space-y-6 animate-fade-in">
              {!isUnlocked ? (
                /* Portal Authentication Lock Screen */
                <div className="max-w-md mx-auto border border-neutral-300 bg-white p-8 space-y-6 text-center shadow-lg my-12">
                  <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-700 border border-neutral-200">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-neutral-900 text-lg uppercase tracking-tight">
                      Healthcare Provider Authorization
                    </h3>
                    <p className="text-xs text-neutral-500 font-mono mt-1">
                      This area is reserved for clinical practitioners (Psychiatrists, CBT Advisors).
                    </p>
                  </div>

                  <form onSubmit={handleUnlockPortal} className="space-y-4">
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-mono font-bold uppercase text-neutral-400 tracking-wider">
                        Enter Practitioner Credentials PIN
                      </label>
                      <input
                        type="password"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="••••"
                        className="w-full border border-neutral-200 rounded p-3 text-center text-lg font-mono tracking-widest focus:outline-none focus:border-neutral-950 bg-neutral-50"
                        maxLength={6}
                      />
                      <span className="text-[9px] font-mono text-neutral-400 mt-1 block text-center bg-neutral-100 p-1.5 border border-dashed border-neutral-200">
                        Demo PIN: <strong className="text-neutral-700">1234</strong> (For clinical testing simulation)
                      </span>
                    </div>

                    {authError && (
                      <p className="text-[10px] font-mono text-rose-600 bg-rose-50 p-2 border border-rose-100 rounded">
                        {authError}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-neutral-950 hover:bg-neutral-900 text-white font-mono text-xs font-bold uppercase py-3 tracking-wider transition-colors cursor-pointer"
                    >
                      Authorize Access
                    </button>
                  </form>
                </div>
              ) : (
                /* Unlocked Clinician Portal Dashboard */
                <div className="space-y-8">
                  
                  {/* Banner bar */}
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 no-print">
                    <div className="flex items-center space-x-2.5">
                      <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block tracking-wider">
                          Provider Access Authenticated
                        </span>
                        <p className="text-xs text-neutral-700 font-sans">
                          You are currently evaluating the behavioral logs of patient <strong className="font-semibold">Anmol</strong>.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleLockPortal}
                      className="bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-700 font-mono text-[9px] font-bold uppercase px-3 py-1.5 rounded transition-all cursor-pointer"
                    >
                      Lock Practitioner Session
                    </button>
                  </div>

                  {/* Standardized Patient Clinical Report */}
                  <div className="border border-neutral-300 bg-white p-6 space-y-6" id="clinical-report">
                    {/* Official Letterhead for Print/Export */}
                    <div className="border-b-2 border-neutral-950 pb-5 flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div>
                        <h2 className="text-xl font-display font-black text-neutral-900 tracking-tight uppercase">
                          Dave OS Cognitive Telemetry Summary
                        </h2>
                        <span className="font-mono text-[9px] tracking-widest text-neutral-500 uppercase block mt-1">
                          Patient Assessment Record • EMR/EHR Compatible
                        </span>
                        <span className="font-mono text-[9px] text-neutral-400 block mt-0.5">
                          Date Generated: {new Date().toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-left sm:text-right font-mono text-[10px] text-neutral-500">
                        <strong className="text-neutral-800">COGNITIVE SYSTEMS CLINIC</strong>
                        <div className="mt-0.5">Clinical Ingress ID: {state.currentDate ? state.currentDate.split("T")[0] : "2026-07-09"}</div>
                        <div>EMR Status: COMPLIANT</div>
                      </div>
                    </div>

                    {/* Patient Vital Stats Block */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-neutral-100">
                      <div className="bg-neutral-50 p-3 border border-neutral-100">
                        <span className="text-[8px] font-mono text-neutral-400 uppercase tracking-widest block">
                          Patient Identifier
                        </span>
                        <span className="text-xs font-sans font-bold text-neutral-800 mt-0.5 block uppercase">
                          Anmol
                        </span>
                      </div>
                      <div className="bg-neutral-50 p-3 border border-neutral-100">
                        <span className="text-[8px] font-mono text-neutral-400 uppercase tracking-widest block">
                          ASRS Diagnostic Index
                        </span>
                        <span className="text-xs font-sans font-bold text-neutral-800 mt-0.5 block">
                          {state.asrsHistory && state.asrsHistory.length > 0 ? `${state.asrsHistory[0].score}/6` : "Not Screened"}
                        </span>
                      </div>
                      <div className="bg-neutral-50 p-3 border border-neutral-100">
                        <span className="text-[8px] font-mono text-neutral-400 uppercase tracking-widest block">
                          Mean Sleep Midpoint Deviation
                        </span>
                        <span className="text-xs font-sans font-bold text-neutral-800 mt-0.5 block">
                          {Math.abs(state.sleep.consistency - 10) * 15} min deviation
                        </span>
                      </div>
                      <div className="bg-neutral-50 p-3 border border-neutral-100">
                        <span className="text-[8px] font-mono text-neutral-400 uppercase tracking-widest block">
                          Active Streaks & Compliance
                        </span>
                        <span className="text-xs font-sans font-bold text-neutral-800 mt-0.5 block">
                          Sadhana: {state.body.practiceStreak || state.body.streakDays} days
                        </span>
                      </div>
                    </div>

                    {/* Clinical Analytics Breakdown */}
                    <div className="space-y-4">
                      <h3 className="font-mono text-xs font-bold uppercase text-neutral-800">
                        Clinical Telemetry Analytics
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Sleep onset chronobiology analysis */}
                        <div className="border border-neutral-100 p-4 space-y-2 rounded bg-neutral-50/50">
                          <span className="text-[9px] font-mono text-neutral-400 uppercase block font-bold">
                            I. ADHD Chronobiology Telemetry
                          </span>
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs text-neutral-700 border-b border-dashed border-neutral-200 pb-1">
                              <span>Bedtime Record:</span>
                              <strong className="font-mono text-neutral-900">{state.sleep.sleepTime || "Unlogged"}</strong>
                            </div>
                            <div className="flex justify-between text-xs text-neutral-700 border-b border-dashed border-neutral-200 pb-1">
                              <span>Wake time Record:</span>
                              <strong className="font-mono text-neutral-900">{state.sleep.wakeTime || "Unlogged"}</strong>
                            </div>
                            <div className="flex justify-between text-xs text-neutral-700 border-b border-dashed border-neutral-200 pb-1">
                              <span>Mean Sleep Duration:</span>
                              <strong className="font-mono text-neutral-900">{state.sleep.totalSleepHours} hrs ({sleepEfficiency}% efficiency)</strong>
                            </div>
                            <div className="flex justify-between text-xs text-neutral-700 pb-1">
                              <span>Sleep Consistency Index:</span>
                              <strong className="font-mono text-neutral-900">{state.sleep.consistency} / 10</strong>
                            </div>
                          </div>
                        </div>

                        {/* Focus / Slicing and Attention Leak analysis */}
                        <div className="border border-neutral-100 p-4 space-y-2 rounded bg-neutral-50/50">
                          <span className="text-[9px] font-mono text-neutral-400 uppercase block font-bold">
                            II. Executive Stability Telemetry
                          </span>
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs text-neutral-700 border-b border-dashed border-neutral-200 pb-1">
                              <span>Completed Slices (Shield Blocks):</span>
                              <strong className="font-mono text-neutral-900">{totalCompletedSlices} completed</strong>
                            </div>
                            <div className="flex justify-between text-xs text-neutral-700 border-b border-dashed border-neutral-200 pb-1">
                              <span>Total Pure Coding Hours:</span>
                              <strong className="font-mono text-neutral-900">{state.build.pureCodingHours} hrs</strong>
                            </div>
                            <div className="flex justify-between text-xs text-neutral-700 border-b border-dashed border-neutral-200 pb-1">
                              <span>Academic Completion Rate:</span>
                              <strong className="font-mono text-neutral-900">
                                {Math.round((state.courses.reduce((acc, c) => acc + Object.values(c.weekStatuses).filter(s => s === "done").length, 0) / 12) * 100)}%
                              </strong>
                            </div>
                            <div className="flex justify-between text-xs text-neutral-700 pb-1">
                              <span>Detected Attention Leaks:</span>
                              <strong className="font-mono text-neutral-900 text-rose-700">{(state.activeLeaks || []).length} active leaks</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Active Clinical Prescriptions (CBT / Pharmacological) */}
                    <div className="space-y-3">
                      <h3 className="font-mono text-xs font-bold uppercase text-neutral-800">
                        Active Clinical Guidelines & CBT Prescriptions
                      </h3>
                      
                      {(!state.clinicianPrescriptions || state.clinicianPrescriptions.length === 0) ? (
                        <p className="text-xs text-neutral-500 font-mono bg-neutral-50 p-4 border border-dashed border-neutral-200 text-center">
                          No active clinician prescriptions logged. Use the form below to prescribe guidelines.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {state.clinicianPrescriptions.map((p) => (
                            <div key={p.id} className="p-4 border border-neutral-200 bg-neutral-50 rounded relative group">
                              <div className="flex items-center justify-between pb-2 border-b border-neutral-200 mb-2">
                                <div className="flex items-center space-x-2">
                                  <User className="w-3.5 h-3.5 text-neutral-500" />
                                  <span className="text-xs font-mono font-bold text-neutral-800">{p.doctorName}</span>
                                </div>
                                <div className="flex items-center space-x-2 font-mono text-[9px] text-neutral-400">
                                  <span>{p.date}</span>
                                  {p.active && (
                                    <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold uppercase">
                                      ACTIVE PROTOCOL
                                    </span>
                                  )}
                                  <button
                                    onClick={() => handleDeletePrescription(p.id)}
                                    className="text-neutral-300 hover:text-rose-600 transition-colors ml-2 no-print"
                                    title="Delete entry"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <p className="text-xs text-neutral-700 leading-relaxed font-sans font-medium">
                                  <strong>CBT Scaffolding Plan:</strong> {p.protocolNotes}
                                </p>
                                {p.medicationGuideline && (
                                  <p className="text-xs text-neutral-800 font-mono bg-white p-2 border border-neutral-200 flex items-center space-x-1.5 rounded">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    <strong>Medication Titration/Guideline:</strong> <span>{p.medicationGuideline}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Print/Export controls */}
                    <div className="pt-4 border-t border-neutral-200 flex justify-end gap-3 no-print">
                      <button
                        onClick={handlePrint}
                        className="bg-neutral-900 hover:bg-neutral-800 text-white font-mono text-xs font-bold uppercase tracking-wider px-5 py-2.5 flex items-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Print Clinical Telemetry Report</span>
                      </button>
                    </div>

                  </div>

                  {/* Provider Prescription Addition Form */}
                  <div className="border border-neutral-200 bg-white p-6 space-y-4 no-print">
                    <div className="border-b border-neutral-100 pb-3">
                      <div className="flex items-center space-x-2 text-neutral-800">
                        <PlusCircle className="w-4 h-4 text-neutral-700" />
                        <h3 className="font-mono text-xs font-bold uppercase">Issue CBT Strategy & Pharmacological Guidance</h3>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1">
                        Remotely prescribe daily cognitive guidelines, task-slicing objectives, and stimulant timing to guide the patient's Dave OS environment.
                      </p>
                    </div>

                    <form onSubmit={handleIssuePrescription} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold uppercase text-neutral-400 tracking-wider">
                            Clinician Name
                          </label>
                          <input
                            type="text"
                            value={doctorName}
                            onChange={(e) => setDoctorName(e.target.value)}
                            className="w-full border border-neutral-200 rounded p-2 text-xs font-mono focus:outline-none focus:border-neutral-950 bg-neutral-50"
                            placeholder="Dr. Dave, MD"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold uppercase text-neutral-400 tracking-wider">
                            Medication Titration Guidelines (Optional)
                          </label>
                          <input
                            type="text"
                            value={medicationGuideline}
                            onChange={(e) => setMedicationGuideline(e.target.value)}
                            className="w-full border border-neutral-200 rounded p-2 text-xs font-mono focus:outline-none focus:border-neutral-950 bg-neutral-50"
                            placeholder="e.g. Methylphenidate ER 20mg at 8:00 AM daily"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold uppercase text-neutral-400 tracking-wider">
                          Cognitive CBT Scaffolding & Goal-Slicing Plan
                        </label>
                        <textarea
                          value={protocolNotes}
                          onChange={(e) => setProtocolNotes(e.target.value)}
                          className="w-full border border-neutral-200 rounded p-3 text-xs font-sans focus:outline-none focus:border-neutral-950 bg-neutral-50 h-24"
                          placeholder="Prescribe daily CBT strategies, focus routines, and instructions to slice academic assignments into actionable micro-tasks..."
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="bg-neutral-950 hover:bg-neutral-800 text-white font-mono text-xs font-bold uppercase tracking-wider px-5 py-2.5 cursor-pointer transition-colors"
                      >
                        Authorize & Issue CBT Protocol
                      </button>
                    </form>
                  </div>

                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between text-[10px] font-mono text-neutral-400 no-print">
          <span>EMR INTERFACE: v2.4 (COMPLIANT)</span>
          <span>DASH DAY DAVE OS CLINIC</span>
        </div>

      </div>
    </div>
  );
}
