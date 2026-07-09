import { AppState } from "../types";
import { formatDistanceToNow } from "date-fns";
import { Check, Plus, Trash2, BookOpen, Layers, Clipboard, Calendar, TrendingUp, BarChart2, Activity } from "lucide-react";
import { useState } from "react";

export function LogsAndBacklog({
  state,
  addBacklogItem,
  removeBacklogItem,
}: {
  state: AppState;
  addBacklogItem: (category: "academic" | "projects" | "kidaura" | "build" | "health", item: string) => void;
  removeBacklogItem: (category: "academic" | "projects" | "kidaura" | "build" | "health", index: number) => void;
}) {
  const [inputs, setInputs] = useState({
    academic: "",
    projects: "",
    kidaura: "",
    build: "",
    health: "",
  });

  const handleAdd = (category: "academic" | "projects" | "kidaura" | "build" | "health") => {
    const text = inputs[category];
    if (!text.trim()) return;
    addBacklogItem(category, text.trim());
    setInputs((prev) => ({ ...prev, [category]: "" }));
  };

  const backlogCategories = [
    { id: "academic" as const, label: "Academic Prep", items: state.backlog.academic },
    { id: "projects" as const, label: "Term Projects", items: state.backlog.projects },
    { id: "kidaura" as const, label: "Kidaura Dev", items: state.backlog.kidaura },
    { id: "build" as const, label: "Research & Build", items: state.backlog.build },
  ];

  const [activeTab, setActiveTab] = useState<"logs" | "reports">("logs");

  const completedWeeks = state.courses.reduce(
    (acc, c) => acc + Object.values(c.weekStatuses).filter((s) => s === "done").length,
    0
  );
  const totalWeeks = 12;
  const academicCompletionRate = Math.round((completedWeeks / totalWeeks) * 100);
  const projectedCgpa = (8.91 + (completedWeeks * 0.024)).toFixed(2);

  return (
    <div className="col-span-full grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Backlog */}
      <div className="bg-white border border-neutral-200 p-6 flex flex-col justify-between">
        <div>
          <div className="border-b border-neutral-100 pb-4 mb-6">
            <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 block">SYSTEM BACKLOGS</span>
            <h2 className="text-xl font-display font-bold text-neutral-900 mt-1 flex items-center">
              <Layers className="w-4 h-4 mr-1.5 text-neutral-700" /> Backlog Repositories
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {backlogCategories.map((cat) => (
              <div key={cat.id} className="border border-neutral-200 p-3.5 bg-neutral-50/30 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider block mb-2 font-bold">
                    {cat.label} ({cat.items.length})
                  </span>

                  <ul className="space-y-1.5 max-h-[110px] overflow-y-auto mb-3">
                    {cat.items.length === 0 ? (
                      <li className="text-[10px] font-mono text-neutral-400 py-1 italic">
                        No backlog items logged.
                      </li>
                    ) : (
                      cat.items.map((item, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-neutral-700 flex items-start justify-between group py-0.5"
                        >
                          <span className="flex items-start">
                            <span className="text-neutral-400 mr-1.5">□</span>
                            <span className="leading-tight">{item}</span>
                          </span>
                          <button
                            onClick={() => removeBacklogItem(cat.id, idx)}
                            className="text-neutral-300 hover:text-neutral-800 transition-colors"
                            title="Resolve item"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                <div className="flex gap-1 border-t border-neutral-200/50 pt-2">
                  <input
                    type="text"
                    placeholder="Add task..."
                    value={inputs[cat.id]}
                    onChange={(e) => setInputs((prev) => ({ ...prev, [cat.id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAdd(cat.id);
                    }}
                    className="w-full bg-white border border-neutral-200 px-2 py-1 text-[11px] rounded focus:outline-none focus:border-neutral-900"
                  />
                  <button
                    onClick={() => handleAdd(cat.id)}
                    className="bg-neutral-900 hover:bg-neutral-850 text-white p-1 rounded"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Logs / Audits / Summaries */}
      <div className="bg-white border border-neutral-200 p-6 flex flex-col justify-between max-h-[480px]">
        <div>
          <div className="border-b border-neutral-100 pb-4 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 block">SYSTEM TIME JOURNAL</span>
              <h2 className="text-xl font-display font-bold text-neutral-900 mt-1 flex items-center">
                {activeTab === "logs" ? (
                  <>
                    <Clipboard className="w-4 h-4 mr-1.5 text-neutral-700" /> Operations Logs
                  </>
                ) : (
                  <>
                    <BarChart2 className="w-4 h-4 mr-1.5 text-indigo-600" /> Synthesis Reports
                  </>
                )}
              </h2>
            </div>

            {/* Tab Toggles */}
            <div className="flex bg-neutral-100 p-0.5 rounded border border-neutral-200 text-[10px] font-mono uppercase font-bold">
              <button
                onClick={() => setActiveTab("logs")}
                className={`px-2.5 py-1 transition-all cursor-pointer ${
                  activeTab === "logs"
                    ? "bg-white text-neutral-950 shadow-xs"
                    : "text-neutral-500 hover:text-neutral-950"
                }`}
              >
                Journal Logs
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={`px-2.5 py-1 transition-all flex items-center space-x-1 cursor-pointer ${
                  activeTab === "reports"
                    ? "bg-white text-indigo-950 shadow-xs"
                    : "text-neutral-500 hover:text-indigo-950"
                }`}
              >
                <span>Weekly & Monthly</span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
              </button>
            </div>
          </div>

          {activeTab === "logs" ? (
            <div className="overflow-y-auto h-[220px] space-y-4 pr-1">
              {(state.logs || []).map((log) => {
                let parsedDistance = "Just now";
                try {
                  parsedDistance = formatDistanceToNow(new Date(log.timestamp), { addSuffix: true });
                } catch (e) {
                  // Ignore parsing issues
                }
                return (
                  <div key={log.id} className="relative pl-4 border-l-2 border-neutral-200 text-neutral-800">
                    <div className="absolute w-2 h-2 rounded-full bg-neutral-400 -left-[5px] top-1.5" />
                    <div className="text-[10px] font-mono text-neutral-400 mb-0.5">
                      {parsedDistance}
                    </div>
                    <div className="text-xs leading-snug font-medium">
                      {log.content}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-[220px] overflow-y-auto space-y-3.5 pr-1 py-1">
              {/* Core metrics overview */}
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-neutral-200 bg-neutral-50/50 p-2.5">
                  <span className="text-[8px] font-mono uppercase text-neutral-400 block font-bold">Weekly Sadhana Index</span>
                  <div className="flex items-baseline space-x-1 mt-1">
                    <span className="text-sm font-bold font-display text-emerald-700">
                      {state.body.practiceStreak >= 7 ? "100%" : `${Math.round((state.body.practiceStreak / 7) * 100)}%`}
                    </span>
                    <span className="text-[9px] font-mono text-neutral-400">consistency</span>
                  </div>
                  <div className="w-full bg-neutral-200 h-1 mt-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, Math.round((state.body.practiceStreak / 7) * 100))}%` }}
                    />
                  </div>
                </div>

                <div className="border border-neutral-200 bg-neutral-50/50 p-2.5">
                  <span className="text-[8px] font-mono uppercase text-neutral-400 block font-bold">Academic Velocity</span>
                  <div className="flex items-baseline space-x-1 mt-1">
                    <span className="text-sm font-bold font-display text-blue-700">
                      {academicCompletionRate}%
                    </span>
                    <span className="text-[9px] font-mono text-neutral-400">completed</span>
                  </div>
                  <div className="w-full bg-neutral-200 h-1 mt-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${academicCompletionRate}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic report content based on state variables */}
              <div className="border border-neutral-200 p-3 bg-neutral-50/40 space-y-2.5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase font-bold text-neutral-600 flex items-center">
                      <TrendingUp className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Projected CGPA Target
                    </span>
                    <span className="text-xs font-mono font-bold text-indigo-700">
                      {projectedCgpa} / 10.0
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-1 leading-normal">
                    Gradual acceleration toward <strong>9.2+ CGPA</strong> objective. Ticking off weekly course chapters and maintaining high mock/viva preparation.
                  </p>
                </div>

                <div className="border-t border-neutral-200/50 pt-2.5">
                  <span className="text-[9px] font-mono uppercase font-bold text-neutral-600 block">
                    Monthly Milestones Accomplished
                  </span>
                  <div className="mt-1.5 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-neutral-700 font-medium">✓ MLF Weeks 1-3 Theory</span>
                      <span className="text-emerald-600 font-mono text-[9px] font-bold">100%</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-neutral-700 font-medium">✓ DL Genie Weeks 1-4 Complete</span>
                      <span className="text-emerald-600 font-mono text-[9px] font-bold">100%</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-neutral-700 font-medium">✓ Kidaura Open-Source IEP Code</span>
                      <span className="text-emerald-600 font-mono text-[9px] font-bold">INTEGRATED</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 p-2 text-[10px] text-indigo-800 rounded">
                <strong>Intelligence Insight:</strong> Operating in <strong>{state.mode}</strong>. Priority metrics are continuously logged in the background to sustain your {state.body.practiceStreak || 0}-day Sadhana streak and {state.body.loggingStreak || 0}-day logging streak. Keep going!
              </div>
            </div>
          )}
        </div>

        {/* Change History audit trail typical of a lab template */}
        <div className="bg-neutral-50 p-3 border border-neutral-200 text-[10px] font-mono text-neutral-500 mt-4 overflow-hidden">
          <span className="font-bold block text-neutral-700 uppercase mb-1">SYSTEM CONFIG CHANGE TRAIL</span>
          <div className="space-y-1 max-h-[50px] overflow-y-auto">
            {state.changeLogs.map((change, i) => (
              <div key={i} className="flex justify-between">
                <span>• {change}</span>
                <span className="text-neutral-400">✓ SUCCESS</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export default LogsAndBacklog;
