import { AppState } from "../types";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export function LeakageDetector({
  state,
  updateState,
}: {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
}) {
  const leaks = state.activeLeaks;
  const [newLeak, setNewLeak] = useState("");

  const addLeak = () => {
    if (!newLeak.trim()) return;
    updateState({
      activeLeaks: [...leaks, newLeak.trim()],
    });
    setNewLeak("");
  };

  const removeLeak = (idx: number) => {
    updateState({
      activeLeaks: leaks.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="bg-white border border-neutral-200 p-6 flex flex-col justify-between">
      <div>
        <div className="border-b border-neutral-100 pb-4 mb-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
            <h2 className="text-xl font-display font-bold text-neutral-900">Leakage Detector</h2>
          </div>
          <span className="font-mono text-[9px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded uppercase">
            ATTENTION SLIPPAGE
          </span>
        </div>

        {leaks.length === 0 ? (
          <div className="text-xs font-mono text-emerald-700 bg-emerald-50 p-4 border border-emerald-200 text-center rounded">
            STRICT DISCIPLINE: No active attention leaks registered today! Keep going!
          </div>
        ) : (
          <div className="space-y-2 max-h-[140px] overflow-y-auto mb-4">
            {leaks.map((leak, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-rose-50/50 p-2.5 border border-rose-100 font-sans text-xs text-neutral-800"
              >
                <span className="flex items-start leading-tight">
                  <span className="text-rose-500 font-bold mr-2">•</span>
                  {leak}
                </span>
                <button
                  onClick={() => removeLeak(i)}
                  className="text-neutral-400 hover:text-rose-600 transition-colors ml-2"
                  title="Mark as contained"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5 mb-4">
          <input
            type="text"
            placeholder="Log newly detected focus leak..."
            value={newLeak}
            onChange={(e) => setNewLeak(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addLeak();
            }}
            className="w-full bg-white border border-neutral-300 px-3 py-1.5 text-xs rounded focus:outline-none focus:border-neutral-900"
          />
          <button
            onClick={addLeak}
            className="bg-neutral-900 hover:bg-neutral-800 text-white p-2 rounded transition-colors"
            title="Register Leak"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="pt-3 border-t border-neutral-100">
        <h3 className="text-[9px] font-mono text-neutral-400 uppercase mb-2">SYSTEM WARNINGS WATCHLIST</h3>
        <div className="flex flex-wrap gap-1.5">
          {["Phone loops", "Passive video tutorials", "Over-engineering", "Context switching"].map((tag) => (
            <button
              key={tag}
              onClick={() => {
                if (!leaks.includes(tag)) {
                  updateState({ activeLeaks: [...leaks, tag] });
                }
              }}
              className="text-[9px] font-mono text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 bg-neutral-50 px-2 py-1 border border-neutral-200 transition-all rounded"
              title="Add to active leaks list"
            >
              +{tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
export default LeakageDetector;
