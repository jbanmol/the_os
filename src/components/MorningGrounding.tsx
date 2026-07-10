import React, { useState } from "react";
import { AppState } from "../types";
import {
  Sun,
  Moon,
  Clock,
  Check,
  Calendar,
  Compass,
  ArrowRight,
  Sparkles,
  BookOpen,
  Brain,
  Shield,
  Award,
  AlertCircle
} from "lucide-react";

interface MorningGroundingProps {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  onClose: () => void;
}

export function MorningGrounding({ state, updateState, onClose }: MorningGroundingProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Intentions form state
  const [academicsTarget, setAcademicsTarget] = useState(state.morningIntentions?.academicsTarget || "");
  const [academicsBox, setAcademicsBox] = useState(state.morningIntentions?.academicsBox || "");

  const [kidauraTarget, setKidauraTarget] = useState(state.morningIntentions?.kidauraTarget || "");
  const [kidauraBox, setKidauraBox] = useState(state.morningIntentions?.kidauraBox || "");

  const [buildTarget, setBuildTarget] = useState(state.morningIntentions?.buildTarget || "");
  const [buildBox, setBuildBox] = useState(state.morningIntentions?.buildBox || "");

  const [bodyTarget, setBodyTarget] = useState(state.morningIntentions?.bodyTarget || "60m Kriya Sadhana & sunlight");
  const [bodyBox, setBodyBox] = useState(state.morningIntentions?.bodyBox || "07:00 AM - 08:30 AM");

  const [sleepTarget, setSleepTarget] = useState(state.morningIntentions?.sleepTarget || "In bed by 11:00 PM, strict screen off");
  const [sleepBox, setSleepBox] = useState(state.morningIntentions?.sleepBox || "10:30 PM - 11:15 PM");

  const [agreeCommitment, setAgreeCommitment] = useState(false);

  // Time-box presets
  const timeBoxPresets = [
    "07:00 AM - 08:30 AM",
    "09:00 AM - 11:30 AM",
    "01:00 PM - 03:00 PM",
    "04:00 PM - 06:00 PM",
    "09:00 PM - 10:30 PM",
    "Custom Slot"
  ];

  // Helper stats for "Yesterday Review"
  const yesterdaySleep = state.sleep.totalSleepHours || 7.5;
  const yesterdaySleepOnset = state.sleep.sleepTime || "11:30 PM";
  const yesterdaySadhana = state.body.kriyaDurationMinutes || 0;
  const yesterdayCoding = state.build.pureCodingHours || 0;

  const currentLogicalDate = state.currentDate ? state.currentDate.split("T")[0] : new Date().toISOString().split("T")[0];

  const handleCompleteGrounding = () => {
    const intentions = {
      academicsTarget: academicsTarget.trim(),
      academicsBox: academicsBox,
      kidauraTarget: kidauraTarget.trim(),
      kidauraBox: kidauraBox,
      buildTarget: buildTarget.trim(),
      buildBox: buildBox,
      bodyTarget: bodyTarget.trim(),
      bodyBox: bodyBox,
      sleepTarget: sleepTarget.trim(),
      sleepBox: sleepBox
    };

    const timestamp = new Date().toISOString();
    const logContent = `Morning Grounding completed. Targets locked: Academics="${intentions.academicsTarget}" (${intentions.academicsBox}), Kidaura="${intentions.kidauraTarget}" (${intentions.kidauraBox}), Build="${intentions.buildTarget}" (${intentions.buildBox}). Default Mode Network inhibited. Ready for focused execution.`;
    
    const newLog = {
      id: Date.now().toString(),
      timestamp,
      content: logContent
    };

    updateState({
      morningGroundingCompletedDate: currentLogicalDate,
      morningIntentions: intentions,
      logs: [newLog, ...state.logs],
      changeLogs: [`Morning grounding completed: Goals set for today`, ...state.changeLogs].slice(0, 10)
    });

    onClose();
  };

  // Clinical ADHD quote of the day
  const groundingTips = [
    "The first hour sets the pace. Avoid scrolling or checking notifications. Give your frontal cortex a clean runway.",
    "People with ADHD perceive time on a macro-scale as 'NOW' or 'NOT NOW'. Time-boxing turns abstract intentions into physical anchors.",
    "Goal-slicing means reducing your ambition to a single, hyper-specific action. If the step feels hard, slice it in half again.",
    "Your brain is naturally seeking novelty to boost dopamine. Override this by binding a visual timer to your workspace."
  ];

  const randomTip = groundingTips[parseInt(currentLogicalDate.replace(/-/g, "")) % groundingTips.length];

  return (
    <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white border border-neutral-200 w-full max-w-4xl shadow-2xl flex flex-col my-8 overflow-hidden rounded-lg">
        
        {/* Banner */}
        <div className="bg-neutral-900 text-white px-5 py-3 font-mono text-[10px] tracking-widest flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center space-x-2">
            <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
            <span>CIRCADIAN GROUNDING & TIME PERCEPTION SUITE</span>
          </div>
          <span className="text-neutral-400">STATUS: CALIBRATING INTENTION</span>
        </div>

        {/* Content Box */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
          
          {/* STEP 1: TIME PERCEPTION & RECOLLECTION */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <span className="font-mono text-[9px] font-bold bg-neutral-100 text-neutral-600 px-2.5 py-1 uppercase tracking-wider rounded-full">
                  Phase I: Reflective Recollection
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-black text-neutral-900 uppercase tracking-tight">
                  Good Morning, Anmol
                </h2>
                <p className="text-xs font-mono text-neutral-500">
                  Today is <span className="text-neutral-800 font-bold">{currentLogicalDate}</span>. Let's calibrate your attention before the outside world fragments it.
                </p>
              </div>

              {/* Research Quote card */}
              <div className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-lg text-center max-w-2xl mx-auto space-y-2">
                <div className="flex items-center justify-center space-x-1.5 text-indigo-800 font-mono text-[10px] font-bold uppercase">
                  <Brain className="w-4 h-4" />
                  <span>Clinical Attention Anchoring Tip</span>
                </div>
                <p className="text-xs text-indigo-950 italic leading-relaxed font-medium">
                  "{randomTip}"
                </p>
              </div>

              {/* Yesterday Review Block */}
              <div className="space-y-3 max-w-2xl mx-auto">
                <h3 className="font-mono text-xs font-bold uppercase text-neutral-800 tracking-wide border-b border-neutral-100 pb-2 flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-neutral-500" />
                  <span>Yesterday's Telemetry Review</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="border border-neutral-150 p-4 rounded bg-neutral-50 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider">Sleep Recovery</span>
                      <div className="text-2xl font-display font-black text-neutral-900 mt-1">
                        {yesterdaySleep} <span className="text-xs text-neutral-400 font-sans font-normal">hrs</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500 mt-2 block">
                      Onset: {yesterdaySleepOnset}
                    </span>
                  </div>

                  <div className="border border-neutral-150 p-4 rounded bg-neutral-50 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider">Sadhana Duration</span>
                      <div className="text-2xl font-display font-black text-neutral-900 mt-1">
                        {yesterdaySadhana} <span className="text-xs text-neutral-400 font-sans font-normal">mins</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500 mt-2 block">
                      {yesterdaySadhana >= 60 ? "🎯 Target achieved" : "⚠️ Behind target"}
                    </span>
                  </div>

                  <div className="border border-neutral-150 p-4 rounded bg-neutral-50 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider">Focused Execution</span>
                      <div className="text-2xl font-display font-black text-neutral-900 mt-1">
                        {yesterdayCoding} <span className="text-xs text-neutral-400 font-sans font-normal">hrs</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500 mt-2 block">
                      Pure coding blocks
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="bg-neutral-950 hover:bg-neutral-800 text-white font-mono text-xs font-bold uppercase tracking-wider px-6 py-3 rounded flex items-center space-x-2 cursor-pointer transition-colors"
                >
                  <span>Advance to Focus Alignment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: EXTERNALIZED GOAL VISUALIZATION & TIME BOXING */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <span className="font-mono text-[9px] font-bold bg-neutral-100 text-neutral-600 px-2.5 py-1 uppercase tracking-wider rounded-full">
                  Phase II: Goal Externalization & Time-Boxing
                </span>
                <h2 className="text-xl font-display font-black text-neutral-900 uppercase tracking-tight">
                  Define Your Single Targets Today
                </h2>
                <p className="text-xs text-neutral-500">
                  Research confirms that ADHD minds thrive when complex plans are externalized into a singular daily action per category, bound to a specific timeframe.
                </p>
              </div>

              <div className="space-y-4 max-w-2xl mx-auto">
                
                {/* 1. Academics */}
                <div className="border border-neutral-200 p-4 rounded-lg space-y-3 bg-white hover:border-neutral-300 transition-colors">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-1.5">
                    <span className="text-[11px] font-mono font-bold uppercase text-indigo-700 tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      01. Academics Target
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">BDM / Quiz prep</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={academicsTarget}
                      onChange={(e) => setAcademicsTarget(e.target.value)}
                      placeholder="e.g. BDM Assignment 2: Schema Normalization Questions"
                      className="sm:col-span-2 border border-neutral-200 rounded p-2 text-xs focus:outline-none focus:border-indigo-500 bg-neutral-55"
                      required
                    />
                    <select
                      value={academicsBox}
                      onChange={(e) => setAcademicsBox(e.target.value)}
                      className="border border-neutral-200 rounded p-2 text-xs focus:outline-none focus:border-indigo-500 bg-neutral-55 font-mono"
                    >
                      <option value="">-- Choose Time-Box --</option>
                      {timeBoxPresets.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 2. KIDAURA */}
                <div className="border border-neutral-200 p-4 rounded-lg space-y-3 bg-white hover:border-neutral-300 transition-colors">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-1.5">
                    <span className="text-[11px] font-mono font-bold uppercase text-indigo-700 tracking-wider flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5" />
                      02. Kidaura Target
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">IEP Platform Integration</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={kidauraTarget}
                      onChange={(e) => setKidauraTarget(e.target.value)}
                      placeholder="e.g. Build raw video pipeline or resolve ASD vs TD model"
                      className="sm:col-span-2 border border-neutral-200 rounded p-2 text-xs focus:outline-none focus:border-indigo-500 bg-neutral-55"
                      required
                    />
                    <select
                      value={kidauraBox}
                      onChange={(e) => setKidauraBox(e.target.value)}
                      className="border border-neutral-200 rounded p-2 text-xs focus:outline-none focus:border-indigo-500 bg-neutral-55 font-mono"
                    >
                      <option value="">-- Choose Time-Box --</option>
                      {timeBoxPresets.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3. Deep work */}
                <div className="border border-neutral-200 p-4 rounded-lg space-y-3 bg-white hover:border-neutral-300 transition-colors">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-1.5">
                    <span className="text-[11px] font-mono font-bold uppercase text-indigo-700 tracking-wider flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      03. Deep Work Target
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">Pure Code / Build</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={buildTarget}
                      onChange={(e) => setBuildTarget(e.target.value)}
                      placeholder="e.g. Code 2.5 hours on Dave OS UI or thesis draft"
                      className="sm:col-span-2 border border-neutral-200 rounded p-2 text-xs focus:outline-none focus:border-indigo-500 bg-neutral-55"
                      required
                    />
                    <select
                      value={buildBox}
                      onChange={(e) => setBuildBox(e.target.value)}
                      className="border border-neutral-200 rounded p-2 text-xs focus:outline-none focus:border-indigo-500 bg-neutral-55 font-mono"
                    >
                      <option value="">-- Choose Time-Box --</option>
                      {timeBoxPresets.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 4. Sadhana */}
                <div className="border border-neutral-200 p-4 rounded-lg space-y-3 bg-white hover:border-neutral-300 transition-colors opacity-90">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-1.5">
                    <span className="text-[11px] font-mono font-bold uppercase text-neutral-600 tracking-wider flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5" />
                      04. Sadhana Protocol
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">Spiritual & Sunlight</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={bodyTarget}
                      onChange={(e) => setBodyTarget(e.target.value)}
                      className="sm:col-span-2 border border-neutral-200 rounded p-2 text-xs focus:outline-none focus:border-indigo-500 bg-neutral-50"
                      required
                    />
                    <input
                      type="text"
                      value={bodyBox}
                      onChange={(e) => setBodyBox(e.target.value)}
                      className="border border-neutral-200 rounded p-2 text-xs focus:outline-none focus:border-indigo-500 bg-neutral-50 font-mono"
                    />
                  </div>
                </div>

                {/* 5. Circadian Reflection */}
                <div className="border border-neutral-200 p-4 rounded-lg space-y-3 bg-white hover:border-neutral-300 transition-colors opacity-90">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-1.5">
                    <span className="text-[11px] font-mono font-bold uppercase text-neutral-600 tracking-wider flex items-center gap-1.5">
                      <Moon className="w-3.5 h-3.5" />
                      05. Circadian Reflection Target
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">Sleep Phase Alignment</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={sleepTarget}
                      onChange={(e) => setSleepTarget(e.target.value)}
                      className="sm:col-span-2 border border-neutral-200 rounded p-2 text-xs focus:outline-none focus:border-indigo-500 bg-neutral-50"
                      required
                    />
                    <input
                      type="text"
                      value={sleepBox}
                      onChange={(e) => setSleepBox(e.target.value)}
                      className="border border-neutral-200 rounded p-2 text-xs focus:outline-none focus:border-indigo-500 bg-neutral-50 font-mono"
                    />
                  </div>
                </div>

              </div>

              <div className="flex justify-between pt-4 max-w-2xl mx-auto">
                <button
                  onClick={() => setStep(1)}
                  className="bg-white hover:bg-neutral-50 text-neutral-700 font-mono text-xs font-bold uppercase px-4 py-2 border border-neutral-300 cursor-pointer rounded"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!academicsTarget || !kidauraTarget || !buildTarget}
                  className={`font-mono text-xs font-bold uppercase tracking-wider px-6 py-3 rounded flex items-center space-x-2 cursor-pointer transition-colors ${
                    academicsTarget && kidauraTarget && buildTarget
                      ? "bg-neutral-950 text-white hover:bg-neutral-800"
                      : "bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed"
                  }`}
                >
                  <span>Advance to Commitment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: COMMITMENT & INGRESS */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in max-w-xl mx-auto text-center py-6">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-800 border border-neutral-200">
                <Shield className="w-8 h-8 text-indigo-700 animate-pulse" />
              </div>

              <div className="space-y-2">
                <span className="font-mono text-[9px] font-bold bg-neutral-100 text-neutral-600 px-2.5 py-1 uppercase tracking-wider rounded-full">
                  Phase III: Attentional Protection Protocol
                </span>
                <h2 className="text-2xl font-display font-black text-neutral-900 uppercase tracking-tight">
                  Seal Your Intentions
                </h2>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  By sealing your morning grounding sequence, you commit to blocking task-switching, avoiding digital distractions, and treating these 5 categories as the exclusive domain of your cognitive energy today.
                </p>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 p-5 text-left rounded space-y-3">
                <h4 className="text-xs font-mono font-bold text-neutral-800 uppercase border-b border-neutral-200 pb-1.5 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-neutral-600" />
                  Today's Grounding Focus Card
                </h4>
                <div className="space-y-2 text-xs text-neutral-700 font-sans">
                  <p>📚 <strong>Academics:</strong> {academicsTarget} <span className="font-mono text-neutral-400">({academicsBox})</span></p>
                  <p>🧬 <strong>Kidaura:</strong> {kidauraTarget} <span className="font-mono text-neutral-400">({kidauraBox})</span></p>
                  <p>💻 <strong>Deep Work:</strong> {buildTarget} <span className="font-mono text-neutral-400">({buildBox})</span></p>
                  <p>🧘 <strong>Sadhana:</strong> {bodyTarget} <span className="font-mono text-neutral-400">({bodyBox})</span></p>
                  <p>🌙 <strong>Circadian:</strong> {sleepTarget} <span className="font-mono text-neutral-400">({sleepBox})</span></p>
                </div>
              </div>

              <div className="p-4 border border-dashed border-neutral-200 rounded flex items-start space-x-3 text-left">
                <input
                  type="checkbox"
                  id="commit-checkbox"
                  checked={agreeCommitment}
                  onChange={(e) => setAgreeCommitment(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-neutral-300"
                />
                <label htmlFor="commit-checkbox" className="text-xs text-neutral-600 leading-normal font-sans cursor-pointer">
                  <strong>Inhibit Default Mode Network:</strong> I agree to start the day with intention, avoiding early phone scrolling, and committing fully to the single action paths defined above.
                </label>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="bg-white hover:bg-neutral-50 text-neutral-700 font-mono text-xs font-bold uppercase px-4 py-2 border border-neutral-300 cursor-pointer rounded"
                >
                  Back
                </button>
                <button
                  onClick={handleCompleteGrounding}
                  disabled={!agreeCommitment}
                  className={`font-mono text-xs font-bold uppercase tracking-wider px-6 py-3 rounded flex items-center space-x-2 cursor-pointer transition-colors ${
                    agreeCommitment
                      ? "bg-neutral-950 text-white hover:bg-neutral-800"
                      : "bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed"
                  }`}
                >
                  <span>Seal Intentions & Enter OS</span>
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between text-[10px] font-mono text-neutral-400">
          <span>COGNITIVE PERFORMANCE RITUAL • ADH-1</span>
          <span>DASH DAY CORP</span>
        </div>

      </div>
    </div>
  );
}
