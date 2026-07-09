import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Play, Pause, RotateCcw, Check, Plus, Trash2, 
  Sparkles, Volume2, VolumeX, Shield, Layout, Eye, EyeOff
} from "lucide-react";

interface FocusShieldProps {
  taskTitle: string;
  onClose: () => void;
  onTaskComplete?: () => void;
}

interface MicroStep {
  id: string;
  title: string;
  completed: boolean;
}

interface RippleEffect {
  id: string;
  x: number;
  y: number;
}

// Web Audio API Pentatonic Chime for Dopaminergic Micro-Rebounds
function playSuccessChime() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Warm Pentatonic Major Arpeggio (C4, E4, G4, C5)
    const notes = [261.63, 329.63, 392.00, 523.25];
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
      
      // Gentle linear attack and exponential decay to prevent clicks and sound professional
      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + idx * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.12 + 0.6);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + idx * 0.12);
      osc.stop(ctx.currentTime + idx * 0.12 + 0.65);
    });
  } catch (err) {
    console.error("Failed to play synthesized chime:", err);
  }
}

// Low-frequency acoustic focus pacer pulse (a subtle, non-jarring check-in tone)
function playAcousticPulse() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Soft low-frequency wooden block-like tone (150Hz) to ground attention
    osc.type = "triangle";
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  } catch (err) {
    console.error("Failed to play acoustic pulse:", err);
  }
}

export function FocusShield({ taskTitle, onClose, onTaskComplete }: FocusShieldProps) {
  // State 1: Micro Steps (Task Slicing)
  const [microSteps, setMicroSteps] = useState<MicroStep[]>(() => {
    const saved = localStorage.getItem(`focus-steps-${taskTitle}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [
      { id: "step-1", title: "Clarify the immediate objective", completed: false },
      { id: "step-2", title: "Draft a 10-minute micro-sliver", completed: false },
      { id: "step-3", title: "Complete execution & verify results", completed: false },
    ];
  });

  const [newStepInput, setNewStepInput] = useState("");

  // State 2: Analog Temporal Arc Timer
  const [sessionDuration, setSessionDuration] = useState(25 * 60); // Default: 25 mins
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  // State 3: Acoustic Pacer
  const [pacerActive, setPacerActive] = useState(false);
  const [pacerInterval, setPacerInterval] = useState(5); // in minutes
  const [lastPacerTrigger, setLastPacerTrigger] = useState(0);

  // State 4: Neuro-Calm Theme Modifiers (Phase 4)
  const [neuroCalm, setNeuroCalm] = useState(() => {
    return localStorage.getItem("focus-neuro-calm") === "true";
  });

  // State 5: Dopaminergic Ripples
  const [ripples, setRipples] = useState<RippleEffect[]>([]);

  // State 6: Box Breathing (TPN Activation) Transition Mode
  const [showBreathing, setShowBreathing] = useState(true);
  const [breathingPhase, setBreathingPhase] = useState<"inhale" | "hold1" | "exhale" | "hold2">("inhale");
  const [breathingSecsLeft, setBreathingSecsLeft] = useState(4);
  const [breathingCycleCount, setBreathingCycleCount] = useState(1);
  const [breathingTotalCycles] = useState(4); // 4 cycles = 64 seconds total

  // Persistent storage for single-state retention (Pillar A)
  useEffect(() => {
    localStorage.setItem(`focus-steps-${taskTitle}`, JSON.stringify(microSteps));
  }, [microSteps, taskTitle]);

  useEffect(() => {
    localStorage.setItem("focus-neuro-calm", String(neuroCalm));
  }, [neuroCalm]);

  // Box Breathing Tick Hook
  useEffect(() => {
    let timerId: any;
    if (showBreathing) {
      timerId = setInterval(() => {
        setBreathingSecsLeft((prev) => {
          if (prev <= 1) {
            setBreathingPhase((curr) => {
              switch (curr) {
                case "inhale":
                  return "hold1";
                case "hold1":
                  return "exhale";
                case "exhale":
                  return "hold2";
                case "hold2":
                  setBreathingCycleCount((c) => {
                    if (c >= breathingTotalCycles) {
                      setShowBreathing(false);
                      setTimerRunning(true); // Auto-start the timer
                      return 1;
                    }
                    return c + 1;
                  });
                  return "inhale";
                default:
                  return "inhale";
              }
            });
            return 4; // reset phase to 4s
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [showBreathing, breathingTotalCycles]);

  // Timer Tick Hook
  useEffect(() => {
    let intervalId: any;
    if (timerRunning && timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimeLeft((prev) => {
          const next = prev - 1;
          
          // Acoustic Pacer logic (suppress DMN)
          if (pacerActive) {
            const elapsed = sessionDuration - next;
            const intervalSecs = pacerInterval * 60;
            if (elapsed > 0 && elapsed % intervalSecs === 0) {
              playAcousticPulse();
            }
          }
          
          if (next <= 0) {
            setTimerRunning(false);
            playSuccessChime();
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [timerRunning, timeLeft, pacerActive, pacerInterval, sessionDuration]);

  // Handle click coordinates for micro-celebration ripple
  const triggerRipple = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple: RippleEffect = {
      id: "ripple-" + Date.now() + Math.random().toString(36).substring(2, 5),
      x,
      y
    };
    setRipples((prev) => [...prev, newRipple]);
    // Clean up ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 1000);
  };

  // Micro Step actions
  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepInput.trim()) return;
    const step: MicroStep = {
      id: "step-" + Date.now(),
      title: newStepInput.trim(),
      completed: false
    };
    setMicroSteps((prev) => [...prev, step]);
    setNewStepInput("");
  };

  const handleToggleStep = (id: string, e: React.MouseEvent) => {
    triggerRipple(e);
    
    setMicroSteps((prev) => {
      const updated = prev.map((step) => {
        if (step.id === id) {
          const nextCompleted = !step.completed;
          if (nextCompleted) {
            playSuccessChime();
          }
          return { ...step, completed: nextCompleted };
        }
        return step;
      });
      return updated;
    });
  };

  const handleDeleteStep = (id: string) => {
    setMicroSteps((prev) => prev.filter((step) => step.id !== id));
  };

  const handleDurationPreset = (minutes: number) => {
    const secs = minutes * 60;
    setSessionDuration(secs);
    setTimeLeft(secs);
    setTimerRunning(false);
  };

  // Math for Analog Temporal Arc SVG Dash
  const completedStepsCount = microSteps.filter((s) => s.completed).length;
  const progressPercent = microSteps.length > 0 ? Math.round((completedStepsCount / microSteps.length) * 100) : 0;

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const timerRatio = timeLeft / sessionDuration;
  const strokeDashoffset = circumference * (1 - timerRatio);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remains = secs % 60;
    return `${mins}:${remains < 10 ? "0" : ""}${remains}`;
  };

  return (
    <AnimatePresence>
      <motion.div 
        id="focus-shield-root"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 flex flex-col justify-between p-6 md:p-12 transition-colors duration-500 overflow-y-auto ${
          neuroCalm 
            ? "bg-neutral-950 text-neutral-100" 
            : "bg-neutral-900/98 text-white backdrop-blur-xl"
        }`}
      >
        {/* Subtle grid backdrop for tech aesthetic, removed in clean Neuro-Calm mode */}
        {!neuroCalm && (
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />
        )}

        {/* 1. Header Area */}
        <div className="relative z-10 flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${neuroCalm ? "bg-neutral-800 text-white" : "bg-emerald-500/10 text-emerald-400"}`}>
              <Shield className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className={`text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-bold block`}>
                COGNITIVE DISTRACTION SHIELD
              </span>
              <span className="text-[10px] font-mono text-neutral-500">ACTIVE EXCLUSION ZONE</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Neuro-Calm Accessiblity Toggle (Pillar E/Phase 4) */}
            <button
              onClick={() => setNeuroCalm(!neuroCalm)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 font-mono text-[10px] font-bold border uppercase transition-all rounded cursor-pointer ${
                neuroCalm 
                  ? "bg-white text-neutral-950 border-white hover:bg-neutral-100" 
                  : "bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border-neutral-700"
              }`}
              title="Toggle Neuro-Calm Profile (High-contrast, literal spacing, flat layouts)"
            >
              {neuroCalm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{neuroCalm ? "Neuro-Calm Active" : "Neuro-Calm Mode"}</span>
            </button>

            {/* Back to Dashboard Close */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer border border-neutral-800"
              title="Minimize & Close Focus Shield"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Primary Body Section (Analog Temporal Arc + Micro Steps Checklist) */}
        {showBreathing ? (
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full text-center space-y-8 my-8">
            <div className="space-y-2">
              <span className={`text-[10px] font-mono tracking-[0.2em] font-bold block uppercase ${neuroCalm ? "text-white" : "text-emerald-400"}`}>
                TPN ACTIVATION ROUTINE
              </span>
              <h2 className="text-2xl md:text-3xl font-display font-black tracking-tight uppercase">
                Box-Breathing Transition
              </h2>
              <p className="text-xs text-neutral-400 font-medium max-w-md mx-auto leading-relaxed">
                ADHD self-regulation is enhanced by suppressing Default Mode Network hyper-arousal. 
                Settle your heart rate to shift cognitive load to the Task-Positive Network.
              </p>
            </div>

            {/* Visual Box-Breathing Circle */}
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Outer soft ring */}
              <div className="absolute inset-0 rounded-full border border-neutral-800/50" />
              
              {/* Expanding/shrinking circle representing breathing instruction */}
              <motion.div
                animate={{
                  scale: breathingPhase === "inhale" || breathingPhase === "hold1" ? 1.4 : 0.9,
                  backgroundColor: breathingPhase === "inhale" || breathingPhase === "hold1"
                    ? "rgba(16, 185, 129, 0.12)"
                    : "rgba(16, 185, 129, 0.04)",
                  borderColor: breathingPhase === "inhale" || breathingPhase === "hold1"
                    ? "rgba(52, 211, 153, 0.8)"
                    : "rgba(52, 211, 153, 0.3)"
                }}
                transition={{
                  duration: 4,
                  ease: "easeInOut"
                }}
                className="absolute w-40 h-40 rounded-full border-2 flex flex-col items-center justify-center"
              >
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-mono text-neutral-400 tracking-wider block uppercase">
                    {breathingPhase === "inhale" && "INHALE"}
                    {breathingPhase === "hold1" && "HOLD BREATH"}
                    {breathingPhase === "exhale" && "EXHALE"}
                    {breathingPhase === "hold2" && "HOLD BREATH"}
                  </span>
                  <span className="font-display font-black text-4xl block text-white">
                    {breathingSecsLeft}s
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Progress indicators */}
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-[10px] font-mono text-neutral-500 uppercase">
                <span>Vagus Nerve Reset</span>
                <span>Cycle {breathingCycleCount} of {breathingTotalCycles}</span>
              </div>
              <div className="flex space-x-1.5 justify-center">
                {Array.from({ length: breathingTotalCycles }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                      idx < breathingCycleCount - 1
                        ? "bg-emerald-500"
                        : idx === breathingCycleCount - 1
                        ? "bg-emerald-400 animate-pulse"
                        : "bg-neutral-800"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowBreathing(false);
                  setTimerRunning(true); // Auto-start focus
                }}
                className="text-[10px] font-mono font-bold tracking-wider text-neutral-400 hover:text-white uppercase py-2 px-6 border border-neutral-800 hover:border-neutral-600 rounded bg-neutral-900/40 transition-all cursor-pointer"
              >
                Skip Transition
              </button>
            </div>
          </div>
        ) : (
          <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center justify-center max-w-5xl mx-auto w-full my-8">
            
            {/* LEFT PANEL: Analog Temporal Arc Timer (Pillar B) */}
            <div className="flex flex-col items-center justify-center space-y-6">
              <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 font-bold block text-center">
                TEMPORAL PROGRESSION ARC
              </span>

              {/* Dynamic Circular Hourglass Arc */}
              <div className="relative w-52 h-52 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-95">
                  {/* Background Ring */}
                  <circle
                    cx="104"
                    cy="104"
                    r={radius}
                    className="stroke-neutral-800 fill-none"
                    strokeWidth="10"
                  />
                  {/* Active Shrinking Arc representing time ticking away */}
                  <circle
                    cx="104"
                    cy="104"
                    r={radius}
                    className={`fill-none transition-all duration-1000 ${
                      timeLeft <= 60 
                        ? "stroke-rose-500 animate-pulse" 
                        : neuroCalm 
                        ? "stroke-white" 
                        : "stroke-emerald-400"
                    }`}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Central Time Indicator (Clean display typography) */}
                <div className="absolute text-center">
                  <span className={`font-display font-black tracking-tighter text-4xl block ${neuroCalm ? "text-white" : "text-emerald-300"}`}>
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest font-bold">
                    {timerRunning ? "Ticking" : "Paused"}
                  </span>
                </div>
              </div>

              {/* Timer Presets & Controls */}
              <div className="space-y-4 w-full max-w-xs">
                <div className="flex justify-between gap-1.5">
                  {[15, 25, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => handleDurationPreset(mins)}
                      className={`flex-1 py-1 font-mono text-[10px] font-bold border transition-colors cursor-pointer rounded ${
                        sessionDuration === mins * 60
                          ? "bg-neutral-100 text-neutral-900 border-white"
                          : "bg-neutral-800/40 hover:bg-neutral-800 text-neutral-400 border-neutral-800"
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-center space-x-3">
                  <button
                    onClick={() => setTimerRunning(!timerRunning)}
                    className={`flex-1 py-2 px-4 font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer rounded ${
                      timerRunning 
                        ? "bg-amber-600 hover:bg-amber-500 text-white" 
                        : neuroCalm 
                        ? "bg-white hover:bg-neutral-100 text-neutral-950" 
                        : "bg-emerald-500 hover:bg-emerald-400 text-neutral-950"
                    }`}
                  >
                    {timerRunning ? (
                      <>
                        <Pause className="w-4 h-4 fill-white" />
                        <span>Pause Focus</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-neutral-950" />
                        <span>Sustain Focus</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDurationPreset(sessionDuration / 60)}
                    className="p-2.5 bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer rounded"
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                {/* Acoustic Metronome Pacer Controls (suppress DMN) */}
                <div className={`p-3 border border-neutral-800 bg-neutral-900/40 rounded flex flex-col gap-2 ${neuroCalm ? "border-neutral-850" : ""}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase font-bold text-neutral-400 flex items-center space-x-1">
                      <Volume2 className="w-3 h-3 text-emerald-400 mr-1" />
                      <span>Acoustic Pacer</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={pacerActive}
                      onChange={(e) => setPacerActive(e.target.checked)}
                      className="w-3.5 h-3.5 accent-emerald-400 cursor-pointer"
                    />
                  </div>
                  {pacerActive && (
                    <div className="flex items-center justify-between text-[9px] font-mono text-neutral-500 border-t border-neutral-800/60 pt-1.5">
                      <span>Tone Interval:</span>
                      <select
                        value={pacerInterval}
                        onChange={(e) => setPacerInterval(parseInt(e.target.value))}
                        className="bg-neutral-950 text-neutral-300 border border-neutral-800 text-[9px] font-mono rounded px-1"
                      >
                        <option value="1">Every 1 min</option>
                        <option value="2">Every 2 mins</option>
                        <option value="5">Every 5 mins</option>
                        <option value="10">Every 10 mins</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: Micro-Steps Decomposer (Pillar A) */}
            <div className="flex flex-col justify-between h-full space-y-6">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 font-bold block mb-1">
                  ACTIVE FOCUS OBJECTIVE
                </span>
                <h2 className={`font-display font-black text-2xl md:text-3xl tracking-tight leading-snug break-words uppercase ${
                  neuroCalm ? "text-white" : "text-emerald-300"
                }`}>
                  {taskTitle}
                </h2>

                {/* Slicing Progress bar */}
                <div className="mt-4 mb-6">
                  <div className="flex justify-between text-[10px] font-mono text-neutral-400 mb-1.5">
                    <span>MICRO-SLIVERS DISCHARGED</span>
                    <span>{progressPercent}% Complete</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        neuroCalm ? "bg-white" : "bg-emerald-400"
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Checklist containing micro-steps */}
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-2 relative">
                  {microSteps.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-neutral-800 rounded bg-neutral-900/10 text-xs text-neutral-400">
                      No micro-slivers left! Break down your task below.
                    </div>
                  ) : (
                    microSteps.map((step) => {
                      const isDone = step.completed;
                      return (
                        <div
                          key={step.id}
                          className={`group relative flex items-center justify-between p-3.5 border transition-all rounded-lg overflow-hidden ${
                            isDone 
                              ? "bg-neutral-950/30 border-neutral-850/80 text-neutral-500 opacity-60 line-through"
                              : neuroCalm 
                              ? "bg-neutral-900 border-neutral-800 text-neutral-200" 
                              : "bg-neutral-800/40 border-neutral-800/80 text-neutral-200 hover:border-neutral-700"
                          }`}
                        >
                          {/* Interactive Ripple Canvas inside cell for dopaminergic micro-chimes */}
                          <div 
                            className="absolute inset-0 z-0 cursor-pointer" 
                            onClick={(e) => handleToggleStep(step.id, e)} 
                          />

                          {/* Ripple rendering */}
                          <AnimatePresence>
                            {ripples.map((rip) => (
                              <motion.span
                                key={rip.id}
                                initial={{ scale: 0, opacity: 0.6 }}
                                animate={{ scale: 5, opacity: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                style={{
                                  position: "absolute",
                                  left: rip.x,
                                  top: rip.y,
                                  width: "40px",
                                  height: "40px",
                                  margin: "-20px 0 0 -20px",
                                  borderRadius: "50%",
                                  backgroundColor: neuroCalm ? "rgba(255, 255, 255, 0.2)" : "rgba(52, 211, 153, 0.3)",
                                  pointerEvents: "none",
                                  zIndex: 0
                                }}
                              />
                            ))}
                          </AnimatePresence>

                          <div className="flex items-center space-x-3 z-10 pointer-events-none">
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                isDone
                                  ? "bg-white border-white text-neutral-950"
                                  : "border-neutral-600 bg-neutral-900"
                              }`}
                            >
                              {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className={`text-xs font-semibold tracking-wide ${neuroCalm ? "tracking-widest" : ""}`}>
                              {step.title}
                            </span>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteStep(step.id);
                            }}
                            className="text-neutral-500 hover:text-rose-400 transition-colors z-10 p-1 rounded hover:bg-neutral-800 cursor-pointer opacity-0 group-hover:opacity-100"
                            title="Delete micro-step"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Micro Step quick adder */}
              <form onSubmit={handleAddStep} className="pt-4 border-t border-neutral-800 relative z-10">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newStepInput}
                    onChange={(e) => setNewStepInput(e.target.value)}
                    placeholder="Decompose task into a bite-sized micro-step..."
                    className="flex-1 bg-neutral-950 border border-neutral-800 text-xs px-3.5 py-2 text-white rounded focus:outline-none focus:border-emerald-400 placeholder-neutral-500 font-sans font-medium"
                  />
                  <button
                    type="submit"
                    disabled={!newStepInput.trim()}
                    className={`px-3 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-200 hover:text-white border border-neutral-700 rounded transition-colors flex items-center justify-center cursor-pointer`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 3. Footer Safeguards Area */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between text-xs text-neutral-500 pt-4 border-t border-neutral-800 gap-3">
          <div className="flex items-center space-x-1.5 font-mono text-[9px] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
            <span>EXTERNALIZED PREFRONTAL SENSORY SHIELD</span>
          </div>

          <div className="flex items-center space-x-4">
            {onTaskComplete && (
              <button
                onClick={() => {
                  playSuccessChime();
                  onTaskComplete();
                  onClose();
                }}
                className="bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 border border-neutral-700 rounded cursor-pointer"
                title="Mark full task completed on OS system ledger"
              >
                ✓ Task Fully Completed
              </button>
            )}
            <span className="font-mono text-[9px] text-neutral-500 select-none">
              DAVE OS NEURO-DIVERSE SUITE // v2.0
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
