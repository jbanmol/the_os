import { AppState } from "../types";
import { Plus, Minus, BookOpen, Share2 } from "lucide-react";

export function BuildTracker({
  state,
  updateState,
}: {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
}) {
  const b = state.build;

  const handleFieldChange = (field: keyof typeof b, value: any) => {
    updateState({
      build: {
        ...b,
        [field]: value,
      },
    });
  };

  const incrementHours = (amount: number) => {
    const current = b.pureCodingHours || 0;
    handleFieldChange("pureCodingHours", Math.max(0, parseFloat((current + amount).toFixed(1))));
  };

  return (
    <div className="col-span-full lg:col-span-1 bg-white border border-neutral-200 p-6 flex flex-col justify-between">
      <div>
        <div className="border-b border-neutral-100 pb-4 mb-6">
          <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 block">DL ARTIFACT ENGINE</span>
          <h2 className="text-xl font-display font-bold text-neutral-900 mt-1">Build / Research</h2>
        </div>

        {/* Big Code Hour Counter */}
        <div className="flex items-center justify-between bg-neutral-900 text-white p-4 mb-6">
          <div>
            <span className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase block">CODING DURATION</span>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-4xl font-display font-bold text-white">
                {b.pureCodingHours}
              </span>
              <span className="text-xs font-mono text-neutral-400 uppercase">HRS</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => incrementHours(-0.5)}
              className="w-8 h-8 border border-neutral-700 bg-neutral-850 hover:bg-neutral-800 flex items-center justify-center text-neutral-300 hover:text-white transition-colors"
              title="-0.5 Hours"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => incrementHours(0.5)}
              className="w-8 h-8 border border-neutral-700 bg-neutral-850 hover:bg-neutral-800 flex items-center justify-center text-neutral-300 hover:text-white transition-colors"
              title="+0.5 Hours"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider block">CONCEPTS STUDIED</span>
            <input
              type="text"
              value={b.conceptLearning}
              onChange={(e) => handleFieldChange("conceptLearning", e.target.value)}
              className="w-full bg-white px-3 py-1.5 border border-neutral-200 text-xs text-neutral-800 mt-1 focus:outline-none focus:border-neutral-900 rounded"
            />
          </div>

          <div>
            <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider block">OPEN SOURCE / INTEGRATIONS</span>
            <input
              type="text"
              value={b.openSourceContribution}
              onChange={(e) => handleFieldChange("openSourceContribution", e.target.value)}
              className="w-full bg-white px-3 py-1.5 border border-neutral-200 text-xs text-neutral-800 mt-1 focus:outline-none focus:border-neutral-900 rounded"
            />
          </div>

          <div>
            <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider block">RESEARCH PAPER WORK</span>
            <input
              type="text"
              value={b.researchPaperWork}
              onChange={(e) => handleFieldChange("researchPaperWork", e.target.value)}
              className="w-full bg-white px-3 py-1.5 border border-neutral-200 text-xs text-neutral-800 mt-1 focus:outline-none focus:border-neutral-900 rounded"
              placeholder="e.g. read CNN vs sequential model approaches..."
            />
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-neutral-100">
        <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">BUILD TARGET ACTION</span>
        <input
          type="text"
          value={b.nextAction}
          onChange={(e) => handleFieldChange("nextAction", e.target.value)}
          className="w-full bg-neutral-50 px-2.5 py-2 border border-neutral-200 text-xs text-indigo-700 font-semibold focus:outline-none focus:border-neutral-900 rounded"
        />
      </div>
    </div>
  );
}
