import { useState, useMemo } from "react";
import { AppState } from "../types";
import { 
  Zap, 
  Droplet, 
  Sun, 
  Flame, 
  ShieldAlert, 
  Check, 
  RefreshCw, 
  Bot, 
  Sparkles, 
  BrainCircuit,
  MessageSquare,
  VolumeX,
  Volume2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function FlowTuner({
  state,
  updateState,
}: {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
}) {
  const [isConsulting, setIsConsulting] = useState(false);
  const [coPilotReport, setCoPilotReport] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [typingText, setTypingText] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const leaksCount = (state.activeLeaks || []).length;

  // Play subtle haptic browser tick sound (for peak tactile feel)
  const playTick = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, audioCtx.currentTime); // High pitched clean tick
      gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {
      // Audio context block safeguard
    }
  };

  // Play a successful chime when an attention leak is blocked
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;
      
      // Multi-note chime (arpeggio)
      const playNote = (freq: number, start: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.02, start);
        gain.gain.exponentialRampToValueAtTime(0.00001, start + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };

      playNote(523.25, now, 0.15); // C5
      playNote(659.25, now + 0.08, 0.15); // E5
      playNote(783.99, now + 0.16, 0.25); // G5
    } catch (e) {}
  };

  // Compute SPACE Cognitive Battery & Focus Capacity
  const cognitiveBattery = useMemo(() => {
    let base = 50; // Starting baseline

    // 1. Sleep Metrics (Max +30%, min -20%)
    const sleepHrs = state.sleep.totalSleepHours || 0;
    if (sleepHrs >= 7 && sleepHrs <= 8.5) {
      base += 20;
    } else if (sleepHrs > 0 && sleepHrs < 6) {
      base -= 15;
    }

    const sleepConsistency = state.sleep.consistency || 5;
    base += (sleepConsistency - 5) * 2; // -10% to +10%

    if (state.sleep.sunlight || state.health.sunlight) {
      base += 5;
    }

    // 2. Sadhana Energy (Max +25%)
    const kriyaMin = state.body.kriyaDurationMinutes || 0;
    if (kriyaMin >= 60) {
      base += 15;
    } else if (kriyaMin > 0) {
      base += 8;
    }
    base += Math.min(10, state.body.practiceStreak || 0); // Streak bonus (+1% per day up to 10%)

    // 3. Attention Leaks Penalty (Heavy -15% per active leak)
    const leaksCount = (state.activeLeaks || []).length;
    base -= leaksCount * 15;

    // 4. Hydration & Vitality
    const energyLevel = state.health.energy || 5;
    base += (energyLevel - 5) * 2; // -10% to +10%

    if (state.health.hydration.toLowerCase() === "optimal") {
      base += 5;
    }

    // Clamp between 5% and 100%
    return Math.max(5, Math.min(100, base));
  }, [state.sleep, state.body, state.activeLeaks, state.health]);

  // Determine battery aesthetic state
  const batteryState = useMemo(() => {
    if (cognitiveBattery >= 80) {
      return {
        color: "text-emerald-500",
        bgGlow: "rgba(16, 185, 129, 0.12)",
        label: "SUPERCHARGED FLOW",
        desc: "Optimal neural capacity. Ideal for solving complex ML challenges or deep programming.",
        gradient: "from-emerald-500 to-teal-500"
      };
    } else if (cognitiveBattery >= 55) {
      return {
        color: "text-indigo-500",
        bgGlow: "rgba(99, 102, 241, 0.12)",
        label: "STABLE COGNITIVE ZONE",
        desc: "Good functional charge. Suitable for quiz preparation, lecture audits, or feature building.",
        gradient: "from-indigo-500 to-blue-500"
      };
    } else if (cognitiveBattery >= 35) {
      return {
        color: "text-amber-500",
        bgGlow: "rgba(245, 158, 11, 0.12)",
        label: "COGNITIVE DRAIN DETECTED",
        desc: "Energy is moderately depleted. Eliminate attention leaks, practice movement, and keep tasks short.",
        gradient: "from-amber-500 to-orange-500"
      };
    } else {
      return {
        color: "text-rose-500",
        bgGlow: "rgba(239, 68, 68, 0.12)",
        label: "SURVIVAL DEEP RESERVE",
        desc: "DANGER: Critical energy deficit. Enter Recovery Mode immediately. Prioritize 8h sleep & Sadhana.",
        gradient: "from-rose-500 to-red-500"
      };
    }
  }, [cognitiveBattery]);

  // Quick Action Calibrations (instant update to store)
  const triggerSunlight = () => {
    playTick();
    updateState({
      sleep: { ...state.sleep, sunlight: true },
      health: { ...state.health, sunlight: true }
    });
  };

  const triggerHydrate = () => {
    playTick();
    updateState({
      health: { ...state.health, hydration: "Optimal" }
    });
  };

  const trigger60mSadhana = () => {
    playTick();
    const todayStr = new Date().toISOString().split("T")[0];
    const isNewPractice = state.body.lastLoggedDate !== todayStr || state.body.kriyaDurationMinutes === 0;
    const newStreak = isNewPractice ? (state.body.practiceStreak || 0) + 1 : (state.body.practiceStreak || 0);
    
    updateState({
      body: { 
        ...state.body, 
        kriyaDurationMinutes: 60, 
        movementDone: true,
        practiceStreak: newStreak,
        streakDays: newStreak,
        isPracticeStatusUnverified: false,
        lastLoggedDate: todayStr
      },
      changeLogs: ["Completed 60m Kriya Yoga Calibration directly from Flow Tuner!", ...state.changeLogs].slice(0, 10)
    });
  };

  const triggerBlockLeak = () => {
    if (state.activeLeaks && state.activeLeaks.length > 0) {
      playChime();
      const removedLeak = state.activeLeaks[0];
      const remaining = state.activeLeaks.slice(1);
      updateState({
        activeLeaks: remaining,
        changeLogs: [`Blocked Attention Leak: "${removedLeak}" directly from Tuner.`, ...state.changeLogs].slice(0, 10)
      });
    }
  };

  // Co-Pilot preset queries linking directly to Gemini API backend
  const coPilotPresets = [
    {
      id: "circadian",
      title: "Circadian Strategy",
      prompt: "Synthesize a personalized circadian hygiene protocol based on my current sleep consistency, mood, and fatigue level."
    },
    {
      id: "leaks",
      title: "Audit Active Leaks",
      prompt: "Analyze my active attention leaks and formulate a scientific counter-strategy using the SPACE framework to reclaim focus."
    },
    {
      id: "quiz",
      title: "Quiz Prep Deficit",
      prompt: "Calculate my academic prep level and provide an optimal revision roadmap for Quiz 1 given my current week completion rates."
    }
  ];

  const handleConsultCoPilot = async (preset: typeof coPilotPresets[0]) => {
    playTick();
    setIsConsulting(true);
    setCoPilotReport(null);
    setSelectedPreset(preset.id);
    setTypingText("");

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          logInput: `Question: ${preset.prompt}`,
          currentState: state,
          currentDate: new Date().toISOString().split("T")[0],
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
        }),
      });

      if (!response.ok) {
        throw new Error("Co-Pilot offline");
      }

      const result = await response.json();
      const textResponse = result.explanation || "System calibrated. Maintain active flow protocols.";
      setCoPilotReport(textResponse);
      
      // Simulate premium typing effect for maximum aesthetic pleasure
      let currentIdx = 0;
      const interval = setInterval(() => {
        if (currentIdx < textResponse.length) {
          setTypingText((prev) => prev + textResponse.substring(currentIdx, currentIdx + 2));
          currentIdx += 2; // Append 2 chars at a time for speed
        } else {
          clearInterval(interval);
        }
      }, 10);

    } catch (e) {
      setCoPilotReport("Co-Pilot Offline: Please check your internet connection or Google Sync state.");
      setTypingText("Failed to retrieve intelligence report from server. Please verify your API keys.");
    } finally {
      setIsConsulting(false);
    }
  };

  return (
    <div className="bg-white border border-neutral-200 p-6 relative overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Subtle top branding line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      
      {/* 1. Visual Gauge Column */}
      <div className="flex flex-col items-center justify-center p-2 border-b md:border-b-0 md:border-r border-neutral-100">
        <div className="text-center mb-3">
          <span className="text-[9px] font-mono tracking-widest text-neutral-400 uppercase font-bold">
            SPACE COGNITIVE METRIC
          </span>
          <h3 className="text-xs font-display font-bold text-neutral-800 uppercase mt-0.5">
            Flow Capacity Index
          </h3>
        </div>

        <div className="relative w-36 h-36 flex items-center justify-center">
          {/* Dynamic Glow Aura */}
          <div 
            className="absolute inset-0 rounded-full blur-xl transition-all duration-700" 
            style={{ backgroundColor: batteryState.bgGlow }}
          />
          
          {/* Circular SVG Gauge */}
          <svg className="w-full h-full transform -rotate-90">
            {/* Background track circle */}
            <circle
              cx="72"
              cy="72"
              r="62"
              className="stroke-neutral-100 fill-none"
              strokeWidth="6"
            />
            {/* Active filled circle */}
            <motion.circle
              cx="72"
              cy="72"
              r="62"
              className={`fill-none ${batteryState.color}`}
              strokeWidth="6"
              strokeDasharray={2 * Math.PI * 62}
              initial={{ strokeDashoffset: 2 * Math.PI * 62 }}
              animate={{ 
                strokeDashoffset: 2 * Math.PI * 62 * (1 - cognitiveBattery / 100) 
              }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>

          {/* Absolute Centered Content */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <motion.div 
              key={cognitiveBattery}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-4xl font-display font-black text-neutral-900 tracking-tighter"
            >
              {cognitiveBattery}
              <span className="text-lg font-normal text-neutral-400">%</span>
            </motion.div>
            <span className="text-[8px] font-mono font-bold tracking-wider text-neutral-500 uppercase mt-0.5">
              RESERVE
            </span>
          </div>
        </div>

        <div className="text-center mt-3 max-w-xs">
          <span className={`text-[10px] font-mono font-bold tracking-wider border px-2 py-0.5 bg-neutral-50 ${batteryState.color}`}>
            {batteryState.label}
          </span>
          <p className="text-[11px] text-neutral-500 mt-2 leading-relaxed">
            {batteryState.desc}
          </p>
        </div>
      </div>

      {/* 2. Interactive Tactile Calibrator Column */}
      <div className="flex flex-col justify-between p-1 border-b md:border-b-0 md:border-r border-neutral-100">
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[9px] font-mono tracking-widest text-neutral-400 uppercase font-bold">
              TACTILE CALIBRATOR
            </span>
            {/* Sound toggle button for physical feedback */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1 hover:bg-neutral-50 rounded transition-colors text-neutral-400 hover:text-neutral-700"
              title={soundEnabled ? "Mute interface feedback" : "Enable tactile haptic sound"}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Sunlight Exposure */}
            <button
              onClick={triggerSunlight}
              disabled={state.health.sunlight}
              className={`flex flex-col items-center justify-center p-3 border transition-all duration-200 cursor-pointer ${
                state.health.sunlight 
                  ? "bg-amber-50/50 border-amber-200 text-amber-700" 
                  : "bg-white border-neutral-200 hover:border-amber-400 hover:shadow-xs hover:scale-[1.02]"
              }`}
            >
              <Sun className={`w-5 h-5 mb-1.5 ${state.health.sunlight ? "text-amber-500 fill-amber-300" : "text-neutral-400"}`} />
              <span className="text-[10px] font-mono uppercase font-bold tracking-wide">Sunlight</span>
              <span className="text-[8px] text-neutral-400 mt-0.5">{state.health.sunlight ? "Logged Today" : "Absorb 20m"}</span>
            </button>

            {/* Hydrate */}
            <button
              onClick={triggerHydrate}
              disabled={state.health.hydration.toLowerCase() === "optimal"}
              className={`flex flex-col items-center justify-center p-3 border transition-all duration-200 cursor-pointer ${
                state.health.hydration.toLowerCase() === "optimal"
                  ? "bg-blue-50/50 border-blue-200 text-blue-700"
                  : "bg-white border-neutral-200 hover:border-blue-400 hover:shadow-xs hover:scale-[1.02]"
              }`}
            >
              <Droplet className={`w-5 h-5 mb-1.5 ${state.health.hydration.toLowerCase() === "optimal" ? "text-blue-500 fill-blue-300" : "text-neutral-400"}`} />
              <span className="text-[10px] font-mono uppercase font-bold tracking-wide">Hydration</span>
              <span className="text-[8px] text-neutral-400 mt-0.5">{state.health.hydration.toLowerCase() === "optimal" ? "Optimal Level" : "Log +500ml"}</span>
            </button>

            {/* Sadhana 60m */}
            <button
              onClick={trigger60mSadhana}
              disabled={state.body.kriyaDurationMinutes >= 60}
              className={`flex flex-col items-center justify-center p-3 border transition-all duration-200 cursor-pointer ${
                state.body.kriyaDurationMinutes >= 60
                  ? "bg-emerald-50/50 border-emerald-200 text-emerald-700"
                  : "bg-white border-neutral-200 hover:border-emerald-400 hover:shadow-xs hover:scale-[1.02]"
              }`}
            >
              <Flame className={`w-5 h-5 mb-1.5 ${state.body.kriyaDurationMinutes >= 60 ? "text-emerald-500 fill-emerald-300 animate-pulse" : "text-neutral-400"}`} />
              <span className="text-[10px] font-mono uppercase font-bold tracking-wide">Sadhana</span>
              <span className="text-[8px] text-neutral-400 mt-0.5">{state.body.kriyaDurationMinutes >= 60 ? "60m Complete" : "Launch Kriya"}</span>
            </button>

            {/* Block Active attention leak */}
            <button
              onClick={triggerBlockLeak}
              disabled={!state.activeLeaks || state.activeLeaks.length === 0}
              className={`flex flex-col items-center justify-center p-3 border transition-all duration-200 relative ${
                !state.activeLeaks || state.activeLeaks.length === 0
                  ? "bg-neutral-50 border-neutral-200 text-neutral-400 cursor-not-allowed"
                  : "bg-white border-rose-200 text-rose-700 hover:border-rose-400 hover:shadow-xs hover:scale-[1.02] cursor-pointer"
              }`}
            >
              {state.activeLeaks && state.activeLeaks.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
              )}
              <ShieldAlert className={`w-5 h-5 mb-1.5 ${(!state.activeLeaks || state.activeLeaks.length === 0) ? "text-neutral-300" : "text-rose-500"}`} />
              <span className="text-[10px] font-mono uppercase font-bold tracking-wide">Block Leak</span>
              <span className="text-[8px] text-neutral-400 mt-0.5">
                {(!state.activeLeaks || state.activeLeaks.length === 0) ? "Leaks Clean" : `Block: ${state.activeLeaks[0].substring(0, 8)}...`}
              </span>
            </button>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-100 font-mono text-[9px] text-neutral-400 flex items-center justify-between">
          <span>COGNITIVE FLOW DECAY:</span>
          <span className="font-bold text-neutral-600">-{leaksCount * 15}% LEAK OVERLOAD</span>
        </div>
      </div>

      {/* 3. Dave OS Laboratory Co-Pilot Advice Column */}
      <div className="flex flex-col justify-between p-1">
        <div>
          <div className="flex items-center space-x-1.5 mb-3">
            <BrainCircuit className="w-4 h-4 text-indigo-600" />
            <span className="text-[9px] font-mono tracking-widest text-neutral-400 uppercase font-bold">
              LAB CO-PILOT CONSULTANT
            </span>
          </div>

          <p className="text-[11px] text-neutral-500 leading-relaxed mb-4">
            Activate high-fidelity intelligence diagnostics based on real-time metrics.
          </p>

          <div className="space-y-2">
            {coPilotPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleConsultCoPilot(preset)}
                disabled={isConsulting}
                className={`w-full text-left p-2.5 border text-xs font-mono transition-all flex items-center justify-between ${
                  selectedPreset === preset.id
                    ? "bg-indigo-50 border-indigo-300 text-indigo-950 font-bold"
                    : "bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700 hover:text-neutral-900 cursor-pointer"
                }`}
              >
                <span>{preset.title}</span>
                <div className="flex items-center space-x-1">
                  {isConsulting && selectedPreset === preset.id ? (
                    <RefreshCw className="w-3 h-3 text-indigo-600 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Intelligence Dialog response area */}
        <div className="mt-4">
          <AnimatePresence mode="wait">
            {typingText ? (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-neutral-950 text-neutral-300 font-mono text-[10px] p-3 border border-neutral-800 h-24 overflow-y-auto custom-scrollbar leading-relaxed"
              >
                <div className="flex items-center space-x-1 text-emerald-400 text-[8px] tracking-widest font-bold uppercase mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>DAVE OS LIVE DIAGNOSTICS</span>
                </div>
                {typingText}
                <span className="animate-pulse bg-neutral-400 w-1.5 h-3.5 inline-block ml-0.5 align-middle" />
              </motion.div>
            ) : (
              <div className="bg-neutral-50 border border-neutral-200 border-dashed p-3 text-center text-[10px] font-mono text-neutral-400 h-24 flex items-center justify-center">
                Select an intelligence preset above to synthesize real-time advice
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
