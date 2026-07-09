import { AppState } from "../types";
import { Award, BookOpen, AlertCircle, Sparkles, Check, Play, Shield } from "lucide-react";

export function ProjectTracker({
  state,
  updateProjectProgress,
  updateProjectViva,
  updateProjectOwnership,
  updateState,
  onActivateFocus,
}: {
  state: AppState;
  updateProjectProgress: (projId: string, progress: number) => void;
  updateProjectViva: (projId: string, value: number) => void;
  updateProjectOwnership: (projId: string, value: number) => void;
  updateState: (updates: Partial<AppState>) => void;
  onActivateFocus?: (title: string) => void;
}) {
  const getOwnershipText = (level: number) => {
    switch (level) {
      case 5:
        return "viva-ready: full explanation + edge cases";
      case 4:
        return "can explain implementation flow thoroughly";
      case 3:
        return "can explain basic flow of most files";
      case 2:
        return "runs perfectly, but explanation is weak";
      case 1:
        return "AI-generated / mostly unverified";
      default:
        return "not touched / unowned";
    }
  };

  const getOwnershipColor = (level: number) => {
    if (level >= 4) return "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (level >= 2) return "text-amber-700 bg-amber-50 border-amber-200";
    return "text-rose-700 bg-rose-50 border-rose-200";
  };

  return (
    <div className="col-span-full bg-white border border-neutral-200 p-6">
      <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-6">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 block">VIVA & CODEBASE INTEGRITY LOCK</span>
          <h2 className="text-xl font-display font-bold text-neutral-900 mt-1">Project & Viva Tracker</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {state.projects.map((proj) => (
          <div
            key={proj.id}
            className="border border-neutral-200 hover:border-neutral-300 transition-all p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-mono uppercase bg-neutral-100 border border-neutral-200 px-2 py-0.5 text-neutral-600 rounded">
                  {proj.id === "mad2" ? "CORE VIVA TARGET" : "TERM WORK"}
                </span>
                <span className="text-xs font-mono font-bold text-neutral-500">
                  {proj.progress}% DONE
                </span>
              </div>
              
              <h3 className="font-display font-bold text-lg text-neutral-900 mb-3">
                {proj.name}
              </h3>

              {/* Progress slider */}
              <div className="mb-4 bg-neutral-50 p-2.5 border border-neutral-200 rounded">
                <label className="text-[9px] font-mono text-neutral-400 uppercase block mb-1">
                  CALIBRATE PROGRESS:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={proj.progress}
                    onChange={(e) => updateProjectProgress(proj.id, parseInt(e.target.value))}
                    className="w-full accent-neutral-900 cursor-pointer h-1 bg-neutral-200 rounded-lg appearance-none"
                  />
                </div>
              </div>

              {/* Interactive viva and ownership */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-neutral-50/50 p-2.5 border border-neutral-200 text-center">
                  <span className="text-[9px] font-mono text-neutral-400 uppercase block mb-1">
                    VIVA READINESS
                  </span>
                  <div className="flex items-center justify-center space-x-1 mt-1">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        onClick={() => updateProjectViva(proj.id, val)}
                        className={`w-5 h-5 text-xs font-mono font-bold border flex items-center justify-center rounded-sm transition-all ${
                          proj.vivaReadiness >= val
                            ? "bg-neutral-900 text-white border-neutral-900"
                            : "bg-white text-neutral-400 border-neutral-200 hover:border-neutral-400"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-neutral-50/50 p-2.5 border border-neutral-200 text-center">
                  <span className="text-[9px] font-mono text-neutral-400 uppercase block mb-1">
                    OWNERSHIP LEVEL
                  </span>
                  <div className="flex items-center justify-center space-x-1 mt-1">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        onClick={() => updateProjectOwnership(proj.id, val)}
                        className={`w-5 h-5 text-xs font-mono font-bold border flex items-center justify-center rounded-sm transition-all ${
                          proj.codeOwnershipLevel >= val
                            ? "bg-neutral-900 text-white border-neutral-900"
                            : "bg-white text-neutral-400 border-neutral-200 hover:border-neutral-400"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Code Ownership Descriptor Box */}
              <div className={`p-2.5 border rounded text-xs font-mono mb-4 text-center ${getOwnershipColor(proj.codeOwnershipLevel)}`}>
                <span className="font-bold block uppercase text-[9px] mb-0.5">OWNERSHIP EXPLANATION</span>
                {getOwnershipText(proj.codeOwnershipLevel)}
              </div>

              {/* Editable inputs */}
              <div className="space-y-3 pt-3 border-t border-neutral-100">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-neutral-400 uppercase block">LATEST ARTIFACT:</span>
                    {onActivateFocus && proj.artifact && (
                      <button
                        type="button"
                        onClick={() => onActivateFocus(`${proj.name} - Build Artifact: ${proj.artifact}`)}
                        className="text-neutral-400 hover:text-emerald-500 p-0.5 rounded transition-colors cursor-pointer"
                        title="Focus on Building Artifact"
                      >
                        <Shield className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/10" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={proj.artifact}
                    onChange={(e) => {
                      const updated = state.projects.map((p) => (p.id === proj.id ? { ...p, artifact: e.target.value } : p));
                      updateState({ projects: updated });
                    }}
                    className="w-full bg-transparent text-xs text-neutral-800 font-medium border-b border-transparent focus:border-neutral-300 focus:outline-none mt-0.5"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-neutral-400 uppercase block">STUCK POINT:</span>
                    {onActivateFocus && proj.stuckPoint && (
                      <button
                        type="button"
                        onClick={() => onActivateFocus(`Resolve Stuck Point: ${proj.name} - ${proj.stuckPoint}`)}
                        className="text-neutral-400 hover:text-emerald-500 p-0.5 rounded transition-colors cursor-pointer"
                        title="Focus on Resolving Stuck Point"
                      >
                        <Shield className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/10" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={proj.stuckPoint}
                    onChange={(e) => {
                      const updated = state.projects.map((p) => (p.id === proj.id ? { ...p, stuckPoint: e.target.value } : p));
                      updateState({ projects: updated });
                    }}
                    className="w-full bg-transparent text-xs text-rose-600 font-medium border-b border-transparent focus:border-rose-300 focus:outline-none mt-0.5"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-mono text-neutral-400 uppercase block">NEXT CRITICAL ACTION:</span>
                {onActivateFocus && proj.nextAction && (
                  <button
                    type="button"
                    onClick={() => onActivateFocus(`Project Action: ${proj.name} - ${proj.nextAction}`)}
                    className="text-neutral-400 hover:text-emerald-500 p-0.5 rounded transition-colors cursor-pointer"
                    title="Focus on Next Critical Action"
                  >
                    <Shield className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/10" />
                  </button>
                )}
              </div>
              <input
                type="text"
                value={proj.nextAction}
                onChange={(e) => {
                  const updated = state.projects.map((p) => (p.id === proj.id ? { ...p, nextAction: e.target.value } : p));
                  updateState({ projects: updated });
                }}
                className="w-full bg-neutral-50 px-2 py-1.5 border border-neutral-200 text-xs text-emerald-700 font-medium focus:outline-none focus:border-neutral-900 rounded"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
