import { AppState } from "../types";
import { Plus, Minus, Sun, Coffee } from "lucide-react";

export function HealthTracker({
  state,
  updateState,
}: {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
}) {
  const h = state.health;

  const handleHealthChange = (field: keyof typeof h, value: any) => {
    updateState({
      health: {
        ...h,
        [field]: value,
      },
    });
  };

  return (
    <div className="bg-white border border-neutral-200 p-6 flex flex-col justify-between">
      <div>
        <div className="border-b border-neutral-100 pb-4 mb-5">
          <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 block">BIOCHEMICAL AUDIT</span>
          <h2 className="text-xl font-display font-bold text-neutral-900 mt-1">Health / Energy</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-neutral-50/50 p-2.5 border border-neutral-200 text-center">
            <span className="text-[9px] font-mono text-neutral-400 uppercase block mb-1">MOOD CYCLE</span>
            <div className="text-lg font-display font-bold text-neutral-800">{h.mood}/10</div>
            <div className="flex justify-center space-x-1 mt-1">
              <button
                onClick={() => handleHealthChange("mood", Math.max(1, h.mood - 1))}
                className="w-4 h-4 bg-white border border-neutral-200 text-[10px] flex items-center justify-center rounded"
              >
                -
              </button>
              <button
                onClick={() => handleHealthChange("mood", Math.min(10, h.mood + 1))}
                className="w-4 h-4 bg-white border border-neutral-200 text-[10px] flex items-center justify-center rounded"
              >
                +
              </button>
            </div>
          </div>

          <div className="bg-neutral-50/50 p-2.5 border border-neutral-200 text-center">
            <span className="text-[9px] font-mono text-neutral-400 uppercase block mb-1">ENERGY BAR</span>
            <div className="text-lg font-display font-bold text-neutral-800">{h.energy}/10</div>
            <div className="flex justify-center space-x-1 mt-1">
              <button
                onClick={() => handleHealthChange("energy", Math.max(1, h.energy - 1))}
                className="w-4 h-4 bg-white border border-neutral-200 text-[10px] flex items-center justify-center rounded"
              >
                -
              </button>
              <button
                onClick={() => handleHealthChange("energy", Math.min(10, h.energy + 1))}
                className="w-4 h-4 bg-white border border-neutral-200 text-[10px] flex items-center justify-center rounded"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3.5 pt-1">
          {/* Hydration */}
          <div className="flex justify-between items-center text-xs font-mono border-b border-neutral-100 pb-2">
            <span className="text-neutral-400 uppercase">Hydration Volume</span>
            <input
              type="text"
              value={h.hydration}
              onChange={(e) => handleHealthChange("hydration", e.target.value)}
              className="bg-transparent text-right text-neutral-800 font-bold max-w-[120px] focus:outline-none focus:border-neutral-300"
            />
          </div>

          {/* Caffeine */}
          <div className="flex justify-between items-center text-xs font-mono border-b border-neutral-100 pb-2">
            <span className="text-neutral-400 uppercase flex items-center">
              <Coffee className="w-3 h-3 mr-1 text-amber-800" /> Caffeine Dosage
            </span>
            <input
              type="text"
              value={h.caffeine}
              onChange={(e) => handleHealthChange("caffeine", e.target.value)}
              className="bg-transparent text-right text-neutral-800 font-bold max-w-[120px] focus:outline-none focus:border-neutral-300"
            />
          </div>

          {/* Food Discipline */}
          <div className="flex justify-between items-center text-xs font-mono border-b border-neutral-100 pb-2">
            <span className="text-neutral-400 uppercase">Food Discipline</span>
            <input
              type="text"
              value={h.foodDiscipline}
              onChange={(e) => handleHealthChange("foodDiscipline", e.target.value)}
              className="bg-transparent text-right text-neutral-800 font-bold max-w-[120px] focus:outline-none focus:border-neutral-300"
            />
          </div>

          {/* Fatigue */}
          <div className="flex justify-between items-center text-xs font-mono border-b border-neutral-100 pb-2">
            <span className="text-neutral-400 uppercase">Fatigue / Brain Fog</span>
            <input
              type="text"
              value={h.fatigue}
              onChange={(e) => handleHealthChange("fatigue", e.target.value)}
              className="bg-transparent text-right text-neutral-800 font-bold max-w-[120px] focus:outline-none focus:border-neutral-300"
            />
          </div>

          {/* Sunlight */}
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-neutral-400 uppercase flex items-center">
              <Sun className="w-3 h-3 mr-1 text-amber-500 animate-spin" style={{ animationDuration: '20s' }} /> Morning Sunlight
            </span>
            <button
              onClick={() => handleHealthChange("sunlight", !h.sunlight)}
              className={`px-2 py-0.5 border text-[10px] font-bold rounded ${
                h.sunlight
                  ? "bg-amber-50 border-amber-300 text-amber-800"
                  : "bg-white border-neutral-200 text-neutral-400 hover:border-neutral-900"
              }`}
            >
              {h.sunlight ? "OBTAINED ✓" : "PENDING"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
