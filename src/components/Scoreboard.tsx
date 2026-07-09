import { AppState } from "../types";
import { Plus, Minus, Info } from "lucide-react";

export function Scoreboard({
  state,
  updateScorePoint,
}: {
  state: AppState;
  updateScorePoint: (category: "academic" | "build" | "body" | "sleep" | "system", value: number) => void;
}) {
  const { scores } = state;

  const metrics = [
    { id: "academic" as const, label: "Academic Prep", value: scores.academic, max: 25, color: "text-blue-600 bg-blue-50 border-blue-200" },
    { id: "build" as const, label: "Build & Kidaura", value: scores.build, max: 25, color: "text-violet-600 bg-violet-50 border-violet-200" },
    { id: "body" as const, label: "Kriya Yoga", value: scores.body, max: 25, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { id: "sleep" as const, label: "Sleep Recovery", value: scores.sleep, max: 25, color: "text-cyan-600 bg-cyan-50 border-cyan-200" },
  ];

  return (
    <div className="col-span-full bg-white border border-neutral-200 p-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 block">DAILY SCOREBOARD INDEX</span>
          <h2 className="text-2xl font-display font-bold text-neutral-900 mt-1">
            System Index Rating:{" "}
            <span className="font-mono bg-neutral-100 px-3 py-1 border border-neutral-200 text-lg">
              {scores.total}/100
            </span>
          </h2>
          <div className="text-xs text-neutral-500 font-mono mt-1 uppercase flex items-center">
            <Info className="w-3.5 h-3.5 mr-1 text-neutral-400" />
            {scores.interpretation}
          </div>
        </div>
        
        {/* Giant rating circle / badge in classic Swiss typography */}
        <div className="flex items-center space-x-3">
          <div className="bg-neutral-900 text-white font-mono font-bold text-sm tracking-wider px-4 py-2 uppercase">
            {scores.total >= 85 ? "EXCELLENT STATUS" : scores.total >= 70 ? "STRONG FOCUS" : scores.total >= 55 ? "FUNCTIONAL CYCLE" : "RESCUE SHIFT REQUIRED"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const percentage = (m.value / m.max) * 100;
          return (
            <div key={m.id} className="border border-neutral-200 p-4 bg-white hover:border-neutral-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                    {m.label}
                  </span>
                  <span className="text-xs font-mono font-bold text-neutral-500">
                    MAX {m.max}
                  </span>
                </div>

                <div className="flex items-baseline space-x-1 mb-3">
                  <span className="text-3xl font-display font-bold text-neutral-900">
                    {m.value}
                  </span>
                  <span className="text-xs font-mono text-neutral-400">PTS</span>
                </div>
              </div>

              <div>
                <div className="h-1 bg-neutral-100 w-full mb-3 overflow-hidden">
                  <div
                    className="h-full bg-neutral-900 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Micro adjustments to preserve live dashboard feel */}
                <div className="flex items-center justify-between border-t border-neutral-100 pt-2.5">
                  <span className="text-[9px] font-mono text-neutral-400">CALIBRATE</span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => updateScorePoint(m.id, m.value - 1)}
                      className="w-5 h-5 rounded border border-neutral-200 hover:border-neutral-900 bg-white flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
                      title="Decrease"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={() => updateScorePoint(m.id, m.value + 1)}
                      className="w-5 h-5 rounded border border-neutral-200 hover:border-neutral-900 bg-white flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
                      title="Increase"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
