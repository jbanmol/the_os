import { useState } from "react";
import { AppState, OperatingMode } from "../types";
import { cn } from "../lib/utils";
import { Shield, AlertTriangle, Play, HelpCircle, Activity, Edit2, Check, RefreshCw } from "lucide-react";

export function CommandCenter({
  state,
  setMode,
  updateState,
  onActivateFocus,
}: {
  state: AppState;
  setMode: (mode: OperatingMode) => void;
  updateState: (updates: Partial<AppState>) => void;
  onActivateFocus?: (title: string) => void;
}) {
  const quiz1Date = new Date("2026-07-19");
  const quiz2Date = new Date("2026-08-16");
  const finalDate = new Date("2026-09-13");
  const today = new Date();

  const [isEditingAction, setIsEditingAction] = useState(false);
  const [nextActionInput, setNextActionInput] = useState(state.nextBestAction);

  const [isEditingRisk, setIsEditingRisk] = useState(false);
  const [riskInput, setRiskInput] = useState(state.currentRisk);

  const [isEditingPriorities, setIsEditingPriorities] = useState(false);
  const [prioritiesInput, setPrioritiesInput] = useState<string[]>(state.topPriorities);
  const [mvdInput, setMvdInput] = useState(state.minimumViableDay);

  const handleStartEditPriorities = () => {
    setPrioritiesInput([...state.topPriorities]);
    setMvdInput(state.minimumViableDay);
    setIsEditingPriorities(true);
  };

  const handleSavePriorities = () => {
    updateState({ 
      topPriorities: prioritiesInput,
      minimumViableDay: mvdInput 
    });
    setIsEditingPriorities(false);
  };

  const handlePriorityChange = (index: number, val: string) => {
    const updated = [...prioritiesInput];
    updated[index] = val;
    setPrioritiesInput(updated);
  };

  const getDays = (date: Date) => {
    const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const handleSaveAction = () => {
    updateState({ nextBestAction: nextActionInput });
    setIsEditingAction(false);
  };

  const handleSaveRisk = () => {
    updateState({ currentRisk: riskInput });
    setIsEditingRisk(false);
  };

  const modesList: OperatingMode[] = [
    "Quiz Mode",
    "Build Mode",
    "Recovery Mode",
    "Rescue Mode",
    "Normal Mode",
  ];

  const getModeColor = (m: OperatingMode) => {
    switch (m) {
      case "Quiz Mode":
        return "border-amber-500 bg-amber-50 text-amber-800";
      case "Build Mode":
        return "border-indigo-600 bg-indigo-50/50 text-indigo-900";
      case "Recovery Mode":
        return "border-emerald-500 bg-emerald-50 text-emerald-800";
      case "Rescue Mode":
        return "border-rose-500 bg-rose-50 text-rose-800";
      default:
        return "border-neutral-300 bg-neutral-100 text-neutral-800";
    }
  };

  return (
    <div className="col-span-full grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Active Directive Block */}
      <div className="lg:col-span-2 bg-white border border-neutral-200 p-6 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle grid accent typical of Swiss technical layouts */}
        <div className="absolute top-0 right-0 w-24 h-24 border-b border-l border-neutral-100 opacity-50 pointer-events-none" />
        
        <div>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-neutral-100">
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 block">SYSTEM STATUS</span>
              <div className="flex items-center space-x-2 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute" />
                <span className="font-mono text-xs font-semibold text-neutral-700 tracking-wider">ACTIVE FEEDBACK LOOP</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono text-neutral-400 uppercase">MODE:</span>
              <select
                value={state.mode}
                onChange={(e) => setMode(e.target.value as OperatingMode)}
                className={cn(
                  "text-xs font-mono font-bold px-3 py-1.5 border uppercase cursor-pointer rounded focus:outline-none transition-all",
                  getModeColor(state.mode)
                )}
              >
                {modesList.map((m) => (
                  <option key={m} value={m} className="bg-white text-neutral-900">
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Today's Grounded Focus Card & Time-Boxing (Externalized Goal Visualizations) */}
          {state.morningIntentions && (state.morningIntentions.academicsTarget || state.morningIntentions.kidauraTarget || state.morningIntentions.buildTarget) && (
            <div className="mb-6 bg-neutral-900 text-white border border-neutral-800 p-4 rounded-lg space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[10px] font-mono tracking-widest text-neutral-300 uppercase font-black">
                    TODAY'S GROUNDED TARGETS & TIME-BOXES
                  </span>
                </div>
                <span className="font-mono text-[9px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded uppercase">
                  ADHD-Safe Single Thread Active
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {/* Academics */}
                {state.morningIntentions.academicsTarget && (
                  <div className="bg-neutral-950 p-2.5 border border-neutral-850 rounded flex flex-col justify-between">
                    <div>
                      <span className="text-[8px] font-mono text-neutral-400 uppercase tracking-wider block">📚 Academics</span>
                      <p className="text-xs font-semibold text-neutral-200 mt-1 line-clamp-2 leading-tight">
                        {state.morningIntentions.academicsTarget}
                      </p>
                    </div>
                    {state.morningIntentions.academicsBox && (
                      <span className="text-[9px] font-mono text-amber-300 bg-amber-950/40 border border-amber-900/30 px-1.5 py-0.5 mt-2 block rounded text-center">
                        {state.morningIntentions.academicsBox}
                      </span>
                    )}
                  </div>
                )}

                {/* Kidaura */}
                {state.morningIntentions.kidauraTarget && (
                  <div className="bg-neutral-950 p-2.5 border border-neutral-850 rounded flex flex-col justify-between">
                    <div>
                      <span className="text-[8px] font-mono text-neutral-400 uppercase tracking-wider block">🧬 Kidaura</span>
                      <p className="text-xs font-semibold text-neutral-200 mt-1 line-clamp-2 leading-tight">
                        {state.morningIntentions.kidauraTarget}
                      </p>
                    </div>
                    {state.morningIntentions.kidauraBox && (
                      <span className="text-[9px] font-mono text-amber-300 bg-amber-950/40 border border-amber-900/30 px-1.5 py-0.5 mt-2 block rounded text-center">
                        {state.morningIntentions.kidauraBox}
                      </span>
                    )}
                  </div>
                )}

                {/* Deep Work */}
                {state.morningIntentions.buildTarget && (
                  <div className="bg-neutral-950 p-2.5 border border-neutral-850 rounded flex flex-col justify-between">
                    <div>
                      <span className="text-[8px] font-mono text-neutral-400 uppercase tracking-wider block">💻 Deep Work</span>
                      <p className="text-xs font-semibold text-neutral-200 mt-1 line-clamp-2 leading-tight">
                        {state.morningIntentions.buildTarget}
                      </p>
                    </div>
                    {state.morningIntentions.buildBox && (
                      <span className="text-[9px] font-mono text-amber-300 bg-amber-950/40 border border-amber-900/30 px-1.5 py-0.5 mt-2 block rounded text-center">
                        {state.morningIntentions.buildBox}
                      </span>
                    )}
                  </div>
                )}

                {/* Sadhana */}
                {state.morningIntentions.bodyTarget && (
                  <div className="bg-neutral-950 p-2.5 border border-neutral-850 rounded flex flex-col justify-between">
                    <div>
                      <span className="text-[8px] font-mono text-neutral-400 uppercase tracking-wider block">🧘 Sadhana</span>
                      <p className="text-xs font-semibold text-neutral-200 mt-1 line-clamp-2 leading-tight">
                        {state.morningIntentions.bodyTarget}
                      </p>
                    </div>
                    {state.morningIntentions.bodyBox && (
                      <span className="text-[9px] font-mono text-neutral-400 bg-neutral-900 px-1.5 py-0.5 mt-2 block rounded text-center">
                        {state.morningIntentions.bodyBox}
                      </span>
                    )}
                  </div>
                )}

                {/* Circadian */}
                {state.morningIntentions.sleepTarget && (
                  <div className="bg-neutral-950 p-2.5 border border-neutral-850 rounded flex flex-col justify-between">
                    <div>
                      <span className="text-[8px] font-mono text-neutral-400 uppercase tracking-wider block">🌙 Circadian</span>
                      <p className="text-xs font-semibold text-neutral-200 mt-1 line-clamp-2 leading-tight">
                        {state.morningIntentions.sleepTarget}
                      </p>
                    </div>
                    {state.morningIntentions.sleepBox && (
                      <span className="text-[9px] font-mono text-neutral-400 bg-neutral-900 px-1.5 py-0.5 mt-2 block rounded text-center">
                        {state.morningIntentions.sleepBox}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Priorities */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-neutral-900 flex items-center">
                  <Shield className="w-3.5 h-3.5 mr-1.5 text-neutral-700" />
                  Primary Directives
                </h3>
                <button
                  onClick={isEditingPriorities ? handleSavePriorities : handleStartEditPriorities}
                  className="text-neutral-400 hover:text-neutral-900 transition-colors"
                  title="Edit Primary Directives"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
              
              {isEditingPriorities ? (
                <div className="space-y-3 p-3 bg-neutral-50 border border-neutral-200 rounded">
                  {[0, 1, 2].map((idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-neutral-400 bg-neutral-200 w-5 h-5 flex items-center justify-center rounded">
                        0{idx + 1}
                      </span>
                      <input
                        type="text"
                        value={prioritiesInput[idx] || ""}
                        onChange={(e) => handlePriorityChange(idx, e.target.value)}
                        className="flex-1 bg-white border border-neutral-300 rounded px-2.5 py-1 text-xs text-neutral-800 font-sans focus:outline-none focus:border-neutral-900"
                        placeholder={`Directive 0${idx + 1}`}
                      />
                    </div>
                  ))}
                  <div className="mt-2 pt-2 border-t border-neutral-200">
                    <label className="block text-[9px] font-mono font-bold text-neutral-500 uppercase mb-1">MVD TARGET</label>
                    <input
                      type="text"
                      value={mvdInput}
                      onChange={(e) => setMvdInput(e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded px-2.5 py-1 text-xs text-neutral-800 font-mono focus:outline-none focus:border-neutral-900"
                      placeholder="Minimum Viable Day target"
                    />
                  </div>
                  <div className="flex justify-end space-x-1.5 pt-1">
                    <button
                      onClick={() => setIsEditingPriorities(false)}
                      className="px-2 py-1 text-[10px] font-mono text-neutral-500 hover:text-neutral-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSavePriorities}
                      className="bg-neutral-900 hover:bg-neutral-800 text-white px-2.5 py-1 text-[10px] font-mono font-bold rounded flex items-center space-x-1"
                    >
                      <Check className="w-2.5 h-2.5" /> <span>Save</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <ul className="space-y-2.5 font-sans text-sm">
                    {state.topPriorities.map((p, i) => (
                      <li key={i} className="flex items-center justify-between text-neutral-700 bg-neutral-50/50 hover:bg-neutral-50 p-2 border border-neutral-100 rounded-lg group transition-colors">
                        <div className="flex items-start mr-2 flex-1">
                          <span className="font-mono text-xs font-bold text-neutral-400 mr-2.5 bg-neutral-100 w-5 h-5 flex-shrink-0 flex items-center justify-center rounded">
                            0{i + 1}
                          </span>
                          <span className="leading-tight font-medium text-xs text-neutral-850">{p}</span>
                        </div>
                        {onActivateFocus && (
                          <button
                            onClick={() => onActivateFocus(p)}
                            className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity bg-neutral-900 hover:bg-neutral-800 text-white text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-1 rounded flex items-center space-x-1 shadow-sm cursor-pointer"
                            title="Activate Focus Shield overlay for this priority"
                          >
                            <Shield className="w-2.5 h-2.5 text-emerald-400 fill-emerald-400/20" />
                            <span>Focus</span>
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 p-3 bg-neutral-50 border border-neutral-200/60 rounded font-mono text-xs text-neutral-500">
                    <span className="font-bold text-neutral-700">MVD TARGET:</span> {state.minimumViableDay}
                  </div>
                </>
              )}
            </div>

            {/* Directive Controls */}
            <div className="space-y-4">
              {/* Next Best Action Card */}
              <div className="bg-neutral-900 text-white p-4 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-mono tracking-widest text-neutral-400 uppercase flex items-center">
                    <Play className="w-2.5 h-2.5 mr-1 text-emerald-400 fill-emerald-400" />
                    NEXT BEST ACTION
                  </span>
                  <button
                    onClick={() => setIsEditingAction(!isEditingAction)}
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
                
                {isEditingAction ? (
                  <div className="space-y-2 mt-1">
                    <textarea
                      value={nextActionInput}
                      onChange={(e) => setNextActionInput(e.target.value)}
                      className="w-full bg-neutral-800 border border-neutral-700 text-xs text-white p-2 focus:outline-none focus:border-emerald-500 rounded font-sans resize-none"
                      rows={2}
                    />
                    <div className="flex justify-end space-x-1.5">
                      <button
                        onClick={() => setIsEditingAction(false)}
                        className="px-2 py-1 text-[10px] font-mono text-neutral-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveAction}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 text-[10px] font-mono font-bold rounded flex items-center space-x-1"
                      >
                        <Check className="w-2.5 h-2.5" /> <span>Save</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <p className="text-sm font-medium tracking-tight text-emerald-300 leading-snug">
                      {state.nextBestAction}
                    </p>
                    {onActivateFocus && (
                      <button
                        onClick={() => onActivateFocus(state.nextBestAction)}
                        className="self-start bg-emerald-600 hover:bg-emerald-500 text-neutral-950 hover:text-neutral-950 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md flex items-center space-x-1.5 transition-colors cursor-pointer shadow-sm"
                        title="Focus on Next Best Action"
                      >
                        <Shield className="w-3 h-3 fill-neutral-950/20" />
                        <span>Focus Shield</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Current Risk Card */}
              <div className="bg-rose-50/50 border border-rose-200/70 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-mono tracking-widest text-rose-600 uppercase flex items-center font-bold">
                    <AlertTriangle className="w-3 h-3 mr-1 text-rose-500" />
                    CRITICAL RISK FACTOR
                  </span>
                  <button
                    onClick={() => setIsEditingRisk(!isEditingRisk)}
                    className="text-rose-400 hover:text-rose-700 transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>

                {isEditingRisk ? (
                  <div className="space-y-2 mt-1">
                    <textarea
                      value={riskInput}
                      onChange={(e) => setRiskInput(e.target.value)}
                      className="w-full bg-white border border-rose-200 text-xs text-neutral-900 p-2 focus:outline-none focus:border-rose-500 rounded font-sans resize-none"
                      rows={2}
                    />
                    <div className="flex justify-end space-x-1.5">
                      <button
                        onClick={() => setIsEditingRisk(false)}
                        className="px-2 py-1 text-[10px] font-mono text-neutral-500 hover:text-neutral-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveRisk}
                        className="bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 text-[10px] font-mono font-bold rounded flex items-center space-x-1"
                      >
                        <Check className="w-2.5 h-2.5" /> <span>Save</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-800 font-medium leading-snug">
                    {state.currentRisk}
                  </p>
                )}
              </div>

              {/* Clinician Advisory Scaffolding if active */}
              {state.clinicianPrescriptions && state.clinicianPrescriptions.some(p => p.active) && (
                <div className="bg-emerald-50/55 border border-emerald-200/80 p-3.5 text-xs rounded">
                  <div className="flex items-center space-x-1.5 mb-1.5 text-emerald-800 font-mono font-bold tracking-wider text-[9px] uppercase">
                    <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                    <span>⚕ Prescribed CBT Protocol</span>
                  </div>
                  {state.clinicianPrescriptions.filter(p => p.active).map(p => (
                    <div key={p.id} className="space-y-1.5">
                      <p className="text-[11px] text-neutral-800 leading-relaxed font-sans">
                        {p.protocolNotes}
                      </p>
                      {p.medicationGuideline && (
                        <p className="text-[10px] text-emerald-900 font-mono font-bold pt-1 bg-white/60 px-1.5 py-0.5 border border-emerald-100 rounded flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>RX: {p.medicationGuideline}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Swiss Lab Milestone Clock */}
      <div className="bg-white border border-neutral-200 p-6 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 block mb-4">MILESTONE DEADLINES</span>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-neutral-800 block">QUIZ 1</span>
                <span className="text-[10px] font-mono text-neutral-400">Weeks 1–4 Prep Scope</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-display font-bold text-neutral-900 tracking-tighter">
                  {getDays(quiz1Date)}
                </span>
                <span className="text-xs font-mono text-neutral-400 ml-1">DAYS</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-neutral-800 block">QUIZ 2</span>
                <span className="text-[10px] font-mono text-neutral-400">Mid-term Evaluation</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-display font-bold text-neutral-500 tracking-tighter">
                  {getDays(quiz2Date)}
                </span>
                <span className="text-xs font-mono text-neutral-400 ml-1">DAYS</span>
              </div>
            </div>

            <div className="flex items-center justify-between pb-1">
              <div>
                <span className="text-xs font-mono font-bold text-neutral-800 block">FINAL EXAMS</span>
                <span className="text-[10px] font-mono text-neutral-400">IITM Diploma Completion</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-display font-bold text-neutral-500 tracking-tighter">
                  {getDays(finalDate)}
                </span>
                <span className="text-xs font-mono text-neutral-400 ml-1">DAYS</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-neutral-50 p-2.5 border border-neutral-200 text-[10px] font-mono text-neutral-500 mt-4 flex items-center justify-between">
          <span>TERM EXAM SYSTEM</span>
          <span>ONLINE ✓</span>
        </div>
      </div>
    </div>
  );
}
