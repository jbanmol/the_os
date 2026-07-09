import { AppState } from "../types";
import { Plus, Minus, Sun, Moon, Zap, MoonStar, Shield } from "lucide-react";

export function BodySleepTracker({
  state,
  updateState,
}: {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
}) {
  const body = state.body;
  const sleep = state.sleep;

  const handleBodyChange = (field: keyof typeof body, value: any) => {
    updateState({
      body: {
        ...body,
        [field]: value,
      },
    });
  };

  const handleSleepChange = (field: keyof typeof sleep, value: any) => {
    updateState({
      sleep: {
        ...sleep,
        [field]: value,
      },
    });
  };

  return (
    <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Body Practice Tracker */}
      <div className="bg-white border border-neutral-200 p-6 flex flex-col justify-between">
        <div>
          <div className="border-b border-neutral-100 pb-4 mb-6 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 block">SADHANA & BODY METRICS</span>
              <h2 className="text-xl font-display font-bold text-neutral-900 mt-1 flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2" />
                Body Practice
              </h2>
            </div>
            
            <button
              onClick={() => handleBodyChange("isRecoveryDay", !body.isRecoveryDay)}
              className={`px-3 py-1 text-xs font-mono font-bold border rounded transition-all ${
                body.isRecoveryDay
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : "bg-white text-neutral-400 border-neutral-200 hover:border-neutral-900"
              }`}
            >
              {body.isRecoveryDay ? "RECOVERY DONE" : "SET RECOVERY MODE"}
            </button>
          </div>

          <div className="flex items-center justify-between bg-neutral-50 p-4 mb-4 border border-neutral-200">
            <div>
              <span className="text-[10px] font-mono text-neutral-400 block uppercase">KRIYA DURATION</span>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-4xl font-display font-bold text-neutral-900">
                  {body.kriyaDurationMinutes}
                </span>
                <span className="text-xs font-mono text-neutral-400 uppercase">MIN</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleBodyChange("kriyaDurationMinutes", Math.max(0, body.kriyaDurationMinutes - 5))}
                className="w-8 h-8 border border-neutral-200 bg-white hover:border-neutral-950 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-900 transition-all"
                title="-5 Minutes"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleBodyChange("kriyaDurationMinutes", body.kriyaDurationMinutes + 5)}
                className="w-8 h-8 border border-neutral-200 bg-white hover:border-neutral-950 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-900 transition-all"
                title="+5 Minutes"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-neutral-50/50 p-2.5 border border-neutral-200 text-center">
              <span className="text-[9px] font-mono text-neutral-400 uppercase block mb-1">STREAK</span>
              <div className="flex items-center justify-center space-x-1">
                <span className="text-lg font-display font-bold text-neutral-800">
                  {body.streakDays}
                </span>
                <span className="text-[10px] font-mono text-neutral-400 uppercase">Days</span>
              </div>
              <div className="flex justify-center space-x-1 mt-1.5 pt-1.5 border-t border-neutral-100">
                <button
                  onClick={() => handleBodyChange("streakDays", Math.max(0, body.streakDays - 1))}
                  className="w-4 h-4 bg-white border border-neutral-200 text-[10px] flex items-center justify-center"
                >
                  -
                </button>
                <button
                  onClick={() => handleBodyChange("streakDays", body.streakDays + 1)}
                  className="w-4 h-4 bg-white border border-neutral-200 text-[10px] flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            <div className="bg-neutral-50/50 p-2.5 border border-neutral-200 text-center">
              <span className="text-[9px] font-mono text-neutral-400 uppercase block mb-1">INTENSITY</span>
              <div className="text-lg font-display font-bold text-neutral-800">{body.intensity}/10</div>
              <div className="flex justify-center space-x-1 mt-1.5 pt-1.5 border-t border-neutral-100">
                <button
                  onClick={() => handleBodyChange("intensity", Math.max(1, body.intensity - 1))}
                  className="w-4 h-4 bg-white border border-neutral-200 text-[10px] flex items-center justify-center"
                >
                  -
                </button>
                <button
                  onClick={() => handleBodyChange("intensity", Math.min(10, body.intensity + 1))}
                  className="w-4 h-4 bg-white border border-neutral-200 text-[10px] flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            <div className="bg-neutral-50/50 p-2.5 border border-neutral-200 text-center">
              <span className="text-[9px] font-mono text-neutral-400 uppercase block mb-1">ENERGY</span>
              <div className="text-lg font-display font-bold text-neutral-800">{body.energy}/10</div>
              <div className="flex justify-center space-x-1 mt-1.5 pt-1.5 border-t border-neutral-100">
                <button
                  onClick={() => handleBodyChange("energy", Math.max(1, body.energy - 1))}
                  className="w-4 h-4 bg-white border border-neutral-200 text-[10px] flex items-center justify-center"
                >
                  -
                </button>
                <button
                  onClick={() => handleBodyChange("energy", Math.min(10, body.energy + 1))}
                  className="w-4 h-4 bg-white border border-neutral-200 text-[10px] flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-100">
          <button
            onClick={() => handleBodyChange("movementDone", !body.movementDone)}
            className={`w-full text-xs font-mono py-2 border transition-all text-center uppercase ${
              body.movementDone
                ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                : "bg-white text-neutral-400 border-neutral-200 hover:border-neutral-900"
            }`}
          >
            {body.movementDone ? "Intense Physical Movement Active ✓" : "Enable Physical Movement"}
          </button>
        </div>
      </div>

      {/* Sleep Recovery Tracker */}
      <div className="bg-white border border-neutral-200 p-6 flex flex-col justify-between">
        <div>
          <div className="border-b border-neutral-100 pb-4 mb-6 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 block">CIRCADIAN CYCLE METRICS</span>
              <h2 className="text-xl font-display font-bold text-neutral-900 mt-1 flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 mr-2" />
                Sleep Recovery
              </h2>
            </div>
          </div>

          <div className="flex items-center justify-between bg-neutral-50 p-4 mb-4 border border-neutral-200">
            <div>
              <span className="text-[10px] font-mono text-neutral-400 block uppercase">TOTAL SLEEP DURATION</span>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-4xl font-display font-bold text-neutral-900">
                  {sleep.totalSleepHours}
                </span>
                <span className="text-xs font-mono text-neutral-400 uppercase">HRS</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleSleepChange("totalSleepHours", Math.max(0, sleep.totalSleepHours - 0.5))}
                className="w-8 h-8 border border-neutral-200 bg-white hover:border-neutral-950 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-900 transition-all"
                title="-0.5 Hours"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleSleepChange("totalSleepHours", sleep.totalSleepHours + 0.5)}
                className="w-8 h-8 border border-neutral-200 bg-white hover:border-neutral-950 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-900 transition-all"
                title="+0.5 Hours"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-neutral-50 p-2 border border-neutral-200">
              <span className="text-[9px] font-mono text-neutral-400 uppercase block">SLEEP TIME</span>
              <input
                type="text"
                value={sleep.sleepTime}
                onChange={(e) => handleSleepChange("sleepTime", e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-neutral-800 border-b border-transparent focus:border-neutral-300 focus:outline-none mt-1"
                placeholder="e.g. 12:00 PM"
              />
            </div>
            
            <div className="bg-neutral-50 p-2 border border-neutral-200">
              <span className="text-[9px] font-mono text-neutral-400 uppercase block">WAKE TIME</span>
              <input
                type="text"
                value={sleep.wakeTime}
                onChange={(e) => handleSleepChange("wakeTime", e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-neutral-800 border-b border-transparent focus:border-neutral-300 focus:outline-none mt-1"
                placeholder="e.g. 06:00 PM"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-[9px] font-mono text-neutral-400 uppercase block">CURRENT EXPERIMENT</span>
              <input
                type="text"
                value={sleep.currentExperiment}
                onChange={(e) => handleSleepChange("currentExperiment", e.target.value)}
                className="w-full bg-white px-3 py-1.5 border border-neutral-200 text-xs text-neutral-850 focus:outline-none focus:border-neutral-900 rounded"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 bg-indigo-50 border border-indigo-200 text-indigo-900 p-3 text-xs font-mono">
          <span className="font-bold block uppercase text-[9px] text-indigo-700 mb-0.5">CIRCADIAN RECOMMENDATION</span>
          {sleep.recommendation}
        </div>
      </div>
    </div>
  );
}
export default BodySleepTracker;
