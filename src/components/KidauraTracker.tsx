import React, { useState } from "react";
import { AppState, KidauraTask, KidauraLongTermTask } from "../types";
import { 
  Zap, Plus, Check, Trash2, AlertTriangle, Calendar, 
  Brain, LayoutGrid, ClipboardList, Clock, ArrowRight, CheckCircle2, Shield
} from "lucide-react";
import { getLogicalDate, getDaysDifference } from "../lib/dateUtils";

// Normalize old/new task associations to one of the 3 primary categories
function getCategoryOfTask(longTermTaskId?: string): "classification" | "iep" | "general" {
  if (!longTermTaskId) return "general";
  if (longTermTaskId === "lt-1" || longTermTaskId === "classification" || longTermTaskId === "lt-2") {
    return "classification";
  }
  if (longTermTaskId === "lt-3" || longTermTaskId === "iep") {
    return "iep";
  }
  return "general";
}

export function KidauraTracker({
  state,
  updateState,
  onActivateFocus,
}: {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  onActivateFocus?: (title: string) => void;
}) {
  const k = state.kidaura;
  const currentLogicalDate = getLogicalDate(state.currentDate);

  // Fallbacks for tasks & categories
  const tasks = k.tasks || [];

  // Active quick add input states per category
  const [quickAddTitles, setQuickAddTitles] = useState<Record<string, string>>({
    classification: "",
    iep: "",
    general: "",
  });

  const [backdates, setBackdates] = useState<Record<string, string>>({
    classification: currentLogicalDate,
    iep: currentLogicalDate,
    general: currentLogicalDate,
  });

  // State update helpers
  const handleStateChange = (field: keyof typeof k, value: any) => {
    updateState({
      kidaura: {
        ...k,
        [field]: value,
      },
    });
  };

  const handleQuickAddTask = (category: "classification" | "iep" | "general") => {
    const title = quickAddTitles[category]?.trim();
    if (!title) return;

    // Map new task with standard IDs: "lt-1" for classification, "lt-3" for IEP, and undefined for general
    let longTermTaskId: string | undefined = undefined;
    if (category === "classification") longTermTaskId = "lt-1";
    if (category === "iep") longTermTaskId = "lt-3";

    const newTask: KidauraTask = {
      id: "task-" + Date.now() + Math.random().toString(36).substr(2, 4),
      title,
      createdAt: backdates[category] || currentLogicalDate,
      completed: false,
      longTermTaskId,
    };

    updateState({
      kidaura: {
        ...k,
        tasks: [...tasks, newTask],
      },
    });

    // Reset form for this category
    setQuickAddTitles(prev => ({ ...prev, [category]: "" }));
    setBackdates(prev => ({ ...prev, [category]: currentLogicalDate }));
  };

  const handleToggleTask = (id: string) => {
    const updatedTasks = tasks.map((t) => {
      if (t.id === id) {
        const completed = !t.completed;
        return {
          ...t,
          completed,
          completedAt: completed ? currentLogicalDate : undefined,
        };
      }
      return t;
    });

    updateState({
      kidaura: {
        ...k,
        tasks: updatedTasks,
      },
    });
  };

  const handleDeleteTask = (id: string) => {
    const updatedTasks = tasks.filter((t) => t.id !== id);
    updateState({
      kidaura: {
        ...k,
        tasks: updatedTasks,
      },
    });
  };

  // Organize tasks by category
  const tasksByCategory = {
    classification: tasks.filter(t => getCategoryOfTask(t.longTermTaskId) === "classification"),
    iep: tasks.filter(t => getCategoryOfTask(t.longTermTaskId) === "iep"),
    general: tasks.filter(t => getCategoryOfTask(t.longTermTaskId) === "general"),
  };

  return (
    <div className="col-span-full lg:col-span-2 bg-neutral-50/30 border border-neutral-200 p-6 flex flex-col gap-6" id="kidaura-tracker-root">
      
      {/* MINIMALIST HEADER & HEADER STATS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-200 pb-5 gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 block font-bold">HEALTHCARE WORKSPACE</span>
          <h2 className="text-xl font-display font-bold text-neutral-900 mt-1">Kidaura & IEP Specific Work</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Streamlined around classification pipelines, IEP enhancements, and general tasks.</p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex items-center space-x-2 bg-white px-3 py-1.5 border border-neutral-200 rounded text-xs font-mono">
            <span className="text-neutral-400 font-semibold">INTEGRATION STATE:</span>
            <select
              value={k.osDashboardIntegrationStatus}
              onChange={(e) => handleStateChange("osDashboardIntegrationStatus", e.target.value)}
              className="font-bold text-neutral-900 uppercase focus:outline-none cursor-pointer bg-white"
            >
              <option value="learning">LEARNING</option>
              <option value="understood">UNDERSTOOD</option>
              <option value="integrated">INTEGRATED</option>
            </select>
          </div>
        </div>
      </div>

      {/* THREE-COLUMN DYNAMIC CUSTOMIZABLE DASHBOARD */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* --- CATEGORY 1: CLASSIFICATION TASK --- */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 flex flex-col gap-5 shadow-sm hover:shadow-md transition-shadow">
          
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Classification Task</h3>
                <span className="text-[9px] font-mono text-neutral-400 uppercase font-bold">ASD/TD & Video Pipeline</span>
              </div>
            </div>
            <div className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
              {tasksByCategory.classification.filter(t => !t.completed).length} ACTIVE
            </div>
          </div>

          {/* Flexible Scratchpads / Focus State Fields */}
          <div className="space-y-3 bg-neutral-50 p-3.5 border border-neutral-200 rounded-lg">
            <div className="text-[9px] font-mono font-bold uppercase text-neutral-400 tracking-wider">Focus & Active Problem Statements</div>
            
            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] font-semibold text-neutral-700 block mb-0.5">ASD vs TD Model Definition</label>
                <input
                  type="text"
                  value={k.asdVsTdStatus || ""}
                  onChange={(e) => handleStateChange("asdVsTdStatus", e.target.value)}
                  placeholder="e.g. defining sequence thresholds"
                  className="w-full bg-white px-2 py-1.5 border border-neutral-200 rounded text-xs text-neutral-800 focus:outline-none focus:border-neutral-900 font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-neutral-700 block mb-0.5">Sample Unit Definition</label>
                <textarea
                  value={k.sampleDefinition || ""}
                  onChange={(e) => handleStateChange("sampleDefinition", e.target.value)}
                  placeholder="Describe a single training sample..."
                  className="w-full bg-white px-2 py-1.5 border border-neutral-200 rounded text-xs text-neutral-800 focus:outline-none focus:border-neutral-900 font-sans resize-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-neutral-700 block mb-0.5">Raw-to-Video Status</label>
                <input
                  type="text"
                  value={k.rawToVideoStatus || ""}
                  onChange={(e) => handleStateChange("rawToVideoStatus", e.target.value)}
                  placeholder="e.g. generating video segments"
                  className="w-full bg-white px-2 py-1.5 border border-neutral-200 rounded text-xs text-neutral-800 focus:outline-none focus:border-neutral-900 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Sub Checklist Header */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-mono text-neutral-500 font-bold uppercase tracking-wider">SHORT-TERM ACTIONS</span>
            <span className="text-[9px] font-mono text-neutral-400">
              {tasksByCategory.classification.filter(t => t.completed).length}/{tasksByCategory.classification.length} Done
            </span>
          </div>

          {/* Sub Checklist Tasks */}
          <div className="flex-1 min-h-[140px] max-h-[220px] overflow-y-auto space-y-2 pr-1">
            {tasksByCategory.classification.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-neutral-200 rounded-lg text-xs text-neutral-400 bg-neutral-50/50">
                No active tasks here. Use the quick-adder below!
              </div>
            ) : (
              tasksByCategory.classification.map(task => {
                const daysElapsed = Math.max(0, getDaysDifference(currentLogicalDate, task.createdAt));
                let statusBg = "bg-neutral-50 border-neutral-200 text-neutral-800";
                let ageBadge = "bg-sky-50 text-sky-700 border-sky-100";
                let badgeText = "Today";

                if (task.completed) {
                  statusBg = "bg-neutral-50/30 border-neutral-200 text-neutral-400 opacity-60 line-through";
                  ageBadge = "bg-emerald-50 text-emerald-700 border-emerald-100";
                  badgeText = "Done";
                } else {
                  if (daysElapsed === 1) {
                    statusBg = "bg-yellow-50/80 border-yellow-200 text-yellow-900";
                    ageBadge = "bg-yellow-100 text-yellow-800 border-yellow-200 font-bold";
                    badgeText = "1 Day Active";
                  } else if (daysElapsed === 2) {
                    statusBg = "bg-orange-50 border-orange-200 text-orange-900";
                    ageBadge = "bg-orange-100 text-orange-800 border-orange-200 font-bold";
                    badgeText = "2 Days Active";
                  } else if (daysElapsed >= 3) {
                    statusBg = "bg-rose-50 border-rose-200 text-rose-950 animate-pulse";
                    ageBadge = "bg-rose-100 text-rose-800 border-rose-200 font-bold";
                    badgeText = `${daysElapsed} Days Active (Critical)`;
                  }
                }

                return (
                  <div key={task.id} className={`flex items-start justify-between p-2.5 border rounded-lg transition-all ${statusBg}`}>
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task.id)}
                        className={`mt-0.5 w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                          task.completed ? "bg-neutral-900 border-neutral-900 text-white" : "border-neutral-300 hover:border-neutral-950 bg-white"
                        }`}
                      >
                        {task.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-semibold block leading-tight break-words">{task.title}</span>
                        <span className="text-[9px] font-mono text-neutral-400 block mt-0.5">Created: {task.createdAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 ml-2 shrink-0">
                      <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 border rounded-full ${ageBadge}`}>{badgeText}</span>
                      {onActivateFocus && !task.completed && (
                        <button
                          type="button"
                          onClick={() => onActivateFocus(task.title)}
                          className="text-neutral-400 hover:text-emerald-500 p-0.5 rounded transition-colors cursor-pointer"
                          title="Decompose in Focus Shield"
                        >
                          <Shield className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/10" />
                        </button>
                      )}
                      <button type="button" onClick={() => handleDeleteTask(task.id)} className="text-neutral-400 hover:text-rose-600 p-0.5 rounded transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Add Form inside column */}
          <div className="pt-3 border-t border-neutral-100 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={quickAddTitles.classification}
                onChange={(e) => setQuickAddTitles(prev => ({ ...prev, classification: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter') handleQuickAddTask("classification"); }}
                placeholder="Add new classification task..."
                className="flex-1 bg-white px-2.5 py-1.5 border border-neutral-300 text-[11px] text-neutral-800 rounded focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => handleQuickAddTask("classification")}
                disabled={!quickAddTitles.classification.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white p-1.5 rounded transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {/* Optional Backdate selector to test color alert triggers */}
            <div className="flex items-center justify-between text-[9px] font-mono text-neutral-400">
              <span>Date Created:</span>
              <input
                type="date"
                value={backdates.classification}
                onChange={(e) => setBackdates(prev => ({ ...prev, classification: e.target.value }))}
                className="bg-transparent border-0 hover:underline cursor-pointer py-0 focus:outline-none text-neutral-600"
              />
            </div>
          </div>

        </div>

        {/* --- CATEGORY 2: IEP --- */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 flex flex-col gap-5 shadow-sm hover:shadow-md transition-shadow">
          
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">IEP Enhancement</h3>
                <span className="text-[9px] font-mono text-neutral-400 uppercase font-bold">IEP Platform & Analytics</span>
              </div>
            </div>
            <div className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
              {tasksByCategory.iep.filter(t => !t.completed).length} ACTIVE
            </div>
          </div>

          {/* Flexible Scratchpads / Focus State Fields */}
          <div className="space-y-3 bg-neutral-50 p-3.5 border border-neutral-200 rounded-lg">
            <div className="text-[9px] font-mono font-bold uppercase text-neutral-400 tracking-wider">Focus & Active Problem Statements</div>
            
            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] font-semibold text-neutral-700 block mb-0.5">Observability Status</label>
                <input
                  type="text"
                  value={k.observabilityStatus || ""}
                  onChange={(e) => handleStateChange("observabilityStatus", e.target.value)}
                  placeholder="e.g. integrated dashboard"
                  className="w-full bg-white px-2 py-1.5 border border-neutral-200 rounded text-xs text-neutral-800 focus:outline-none focus:border-neutral-900 font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-neutral-700 block mb-0.5">Next Critical Query / Action</label>
                <textarea
                  value={k.nextTechnicalQuestion || ""}
                  onChange={(e) => handleStateChange("nextTechnicalQuestion", e.target.value)}
                  placeholder="What is the next immediate query to resolve?"
                  className="w-full bg-white px-2 py-1.5 border border-neutral-200 rounded text-xs text-neutral-800 focus:outline-none focus:border-neutral-900 font-sans resize-none"
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Sub Checklist Header */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-mono text-neutral-500 font-bold uppercase tracking-wider">SHORT-TERM ACTIONS</span>
            <span className="text-[9px] font-mono text-neutral-400">
              {tasksByCategory.iep.filter(t => t.completed).length}/{tasksByCategory.iep.length} Done
            </span>
          </div>

          {/* Sub Checklist Tasks */}
          <div className="flex-1 min-h-[140px] max-h-[220px] overflow-y-auto space-y-2 pr-1">
            {tasksByCategory.iep.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-neutral-200 rounded-lg text-xs text-neutral-400 bg-neutral-50/50">
                No active tasks here. Use the quick-adder below!
              </div>
            ) : (
              tasksByCategory.iep.map(task => {
                const daysElapsed = Math.max(0, getDaysDifference(currentLogicalDate, task.createdAt));
                let statusBg = "bg-neutral-50 border-neutral-200 text-neutral-800";
                let ageBadge = "bg-sky-50 text-sky-700 border-sky-100";
                let badgeText = "Today";

                if (task.completed) {
                  statusBg = "bg-neutral-50/30 border-neutral-200 text-neutral-400 opacity-60 line-through";
                  ageBadge = "bg-emerald-50 text-emerald-700 border-emerald-100";
                  badgeText = "Done";
                } else {
                  if (daysElapsed === 1) {
                    statusBg = "bg-yellow-50/80 border-yellow-200 text-yellow-900";
                    ageBadge = "bg-yellow-100 text-yellow-800 border-yellow-200 font-bold";
                    badgeText = "1 Day Active";
                  } else if (daysElapsed === 2) {
                    statusBg = "bg-orange-50 border-orange-200 text-orange-900";
                    ageBadge = "bg-orange-100 text-orange-800 border-orange-200 font-bold";
                    badgeText = "2 Days Active";
                  } else if (daysElapsed >= 3) {
                    statusBg = "bg-rose-50 border-rose-200 text-rose-950 animate-pulse";
                    ageBadge = "bg-rose-100 text-rose-800 border-rose-200 font-bold";
                    badgeText = `${daysElapsed} Days Active (Critical)`;
                  }
                }

                return (
                  <div key={task.id} className={`flex items-start justify-between p-2.5 border rounded-lg transition-all ${statusBg}`}>
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task.id)}
                        className={`mt-0.5 w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                          task.completed ? "bg-neutral-900 border-neutral-900 text-white" : "border-neutral-300 hover:border-neutral-950 bg-white"
                        }`}
                      >
                        {task.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-semibold block leading-tight break-words">{task.title}</span>
                        <span className="text-[9px] font-mono text-neutral-400 block mt-0.5">Created: {task.createdAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 ml-2 shrink-0">
                      <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 border rounded-full ${ageBadge}`}>{badgeText}</span>
                      {onActivateFocus && !task.completed && (
                        <button
                          type="button"
                          onClick={() => onActivateFocus(task.title)}
                          className="text-neutral-400 hover:text-emerald-500 p-0.5 rounded transition-colors cursor-pointer"
                          title="Decompose in Focus Shield"
                        >
                          <Shield className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/10" />
                        </button>
                      )}
                      <button type="button" onClick={() => handleDeleteTask(task.id)} className="text-neutral-400 hover:text-rose-600 p-0.5 rounded transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Add Form inside column */}
          <div className="pt-3 border-t border-neutral-100 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={quickAddTitles.iep}
                onChange={(e) => setQuickAddTitles(prev => ({ ...prev, iep: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter') handleQuickAddTask("iep"); }}
                placeholder="Add new IEP task..."
                className="flex-1 bg-white px-2.5 py-1.5 border border-neutral-300 text-[11px] text-neutral-800 rounded focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => handleQuickAddTask("iep")}
                disabled={!quickAddTitles.iep.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white p-1.5 rounded transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {/* Optional Backdate selector to test color alert triggers */}
            <div className="flex items-center justify-between text-[9px] font-mono text-neutral-400">
              <span>Date Created:</span>
              <input
                type="date"
                value={backdates.iep}
                onChange={(e) => setBackdates(prev => ({ ...prev, iep: e.target.value }))}
                className="bg-transparent border-0 hover:underline cursor-pointer py-0 focus:outline-none text-neutral-600"
              />
            </div>
          </div>

        </div>

        {/* --- CATEGORY 3: GENERAL & MEETINGS --- */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 flex flex-col gap-5 shadow-sm hover:shadow-md transition-shadow">
          
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">General & Meetings</h3>
                <span className="text-[9px] font-mono text-neutral-400 uppercase font-bold">Daily Ops & Stuck Obstacles</span>
              </div>
            </div>
            <div className="text-[10px] font-mono bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-bold">
              {tasksByCategory.general.filter(t => !t.completed).length} ACTIVE
            </div>
          </div>

          {/* Flexible Scratchpads / Focus State Fields */}
          <div className="space-y-3 bg-neutral-50 p-3.5 border border-neutral-200 rounded-lg">
            <div className="text-[9px] font-mono font-bold uppercase text-neutral-400 tracking-wider">Focus & Active Problem Statements</div>
            
            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] font-semibold text-neutral-700 block mb-0.5">Active Discussion Thread</label>
                <input
                  type="text"
                  value={k.activeThread || ""}
                  onChange={(e) => handleStateChange("activeThread", e.target.value)}
                  placeholder="e.g. feedback on IEP dashboard v2"
                  className="w-full bg-white px-2 py-1.5 border border-neutral-200 rounded text-xs text-neutral-800 focus:outline-none focus:border-neutral-900 font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-neutral-700 block mb-0.5">Stuck points & obstacles</label>
                <textarea
                  value={k.stuckPoint || ""}
                  onChange={(e) => handleStateChange("stuckPoint", e.target.value)}
                  placeholder="Describe what's blocking you..."
                  className="w-full bg-white px-2 py-1.5 border border-neutral-200 rounded text-xs text-rose-800 focus:outline-none focus:border-neutral-900 font-semibold bg-rose-50/10 placeholder-neutral-400 resize-none"
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Sub Checklist Header */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-mono text-neutral-500 font-bold uppercase tracking-wider">SHORT-TERM ACTIONS</span>
            <span className="text-[9px] font-mono text-neutral-400">
              {tasksByCategory.general.filter(t => t.completed).length}/{tasksByCategory.general.length} Done
            </span>
          </div>

          {/* Sub Checklist Tasks */}
          <div className="flex-1 min-h-[140px] max-h-[220px] overflow-y-auto space-y-2 pr-1">
            {tasksByCategory.general.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-neutral-200 rounded-lg text-xs text-neutral-400 bg-neutral-50/50">
                No active tasks here. Use the quick-adder below!
              </div>
            ) : (
              tasksByCategory.general.map(task => {
                const daysElapsed = Math.max(0, getDaysDifference(currentLogicalDate, task.createdAt));
                let statusBg = "bg-neutral-50 border-neutral-200 text-neutral-800";
                let ageBadge = "bg-sky-50 text-sky-700 border-sky-100";
                let badgeText = "Today";

                if (task.completed) {
                  statusBg = "bg-neutral-50/30 border-neutral-200 text-neutral-400 opacity-60 line-through";
                  ageBadge = "bg-emerald-50 text-emerald-700 border-emerald-100";
                  badgeText = "Done";
                } else {
                  if (daysElapsed === 1) {
                    statusBg = "bg-yellow-50/80 border-yellow-200 text-yellow-900";
                    ageBadge = "bg-yellow-100 text-yellow-800 border-yellow-200 font-bold";
                    badgeText = "1 Day Active";
                  } else if (daysElapsed === 2) {
                    statusBg = "bg-orange-50 border-orange-200 text-orange-900";
                    ageBadge = "bg-orange-100 text-orange-800 border-orange-200 font-bold";
                    badgeText = "2 Days Active";
                  } else if (daysElapsed >= 3) {
                    statusBg = "bg-rose-50 border-rose-200 text-rose-950 animate-pulse";
                    ageBadge = "bg-rose-100 text-rose-800 border-rose-200 font-bold";
                    badgeText = `${daysElapsed} Days Active (Critical)`;
                  }
                }

                return (
                  <div key={task.id} className={`flex items-start justify-between p-2.5 border rounded-lg transition-all ${statusBg}`}>
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task.id)}
                        className={`mt-0.5 w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                          task.completed ? "bg-neutral-900 border-neutral-900 text-white" : "border-neutral-300 hover:border-neutral-950 bg-white"
                        }`}
                      >
                        {task.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-semibold block leading-tight break-words">{task.title}</span>
                        <span className="text-[9px] font-mono text-neutral-400 block mt-0.5">Created: {task.createdAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 ml-2 shrink-0">
                      <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 border rounded-full ${ageBadge}`}>{badgeText}</span>
                      {onActivateFocus && !task.completed && (
                        <button
                          type="button"
                          onClick={() => onActivateFocus(task.title)}
                          className="text-neutral-400 hover:text-emerald-500 p-0.5 rounded transition-colors cursor-pointer"
                          title="Decompose in Focus Shield"
                        >
                          <Shield className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/10" />
                        </button>
                      )}
                      <button type="button" onClick={() => handleDeleteTask(task.id)} className="text-neutral-400 hover:text-rose-600 p-0.5 rounded transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Add Form inside column */}
          <div className="pt-3 border-t border-neutral-100 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={quickAddTitles.general}
                onChange={(e) => setQuickAddTitles(prev => ({ ...prev, general: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter') handleQuickAddTask("general"); }}
                placeholder="Add new general task..."
                className="flex-1 bg-white px-2.5 py-1.5 border border-neutral-300 text-[11px] text-neutral-800 rounded focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={() => handleQuickAddTask("general")}
                disabled={!quickAddTitles.general.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white p-1.5 rounded transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {/* Optional Backdate selector to test color alert triggers */}
            <div className="flex items-center justify-between text-[9px] font-mono text-neutral-400">
              <span>Date Created:</span>
              <input
                type="date"
                value={backdates.general}
                onChange={(e) => setBackdates(prev => ({ ...prev, general: e.target.value }))}
                className="bg-transparent border-0 hover:underline cursor-pointer py-0 focus:outline-none text-neutral-600"
              />
            </div>
          </div>

        </div>

      </div>

      {/* FOOTER STATS INFO */}
      <div className="mt-2 bg-neutral-100/50 p-4 border border-neutral-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-neutral-400" />
          <span>Short-term action item age verification is active. Color-coding updates: 
            <span className="inline-block mx-1.5 px-2 py-0.5 rounded bg-yellow-100 border border-yellow-200 font-bold text-yellow-800 font-mono text-[9px]">1 Day</span>, 
            <span className="inline-block mx-1.5 px-2 py-0.5 rounded bg-orange-100 border border-orange-200 font-bold text-orange-800 font-mono text-[9px]">2 Days</span>, and 
            <span className="inline-block mx-1.5 px-2 py-0.5 rounded bg-rose-100 border border-rose-200 font-bold text-rose-800 font-mono text-[9px] animate-pulse">3+ Days</span> active.
          </span>
        </div>
        <div className="font-mono text-[10px] uppercase text-neutral-400 font-bold">
          Total Tasks: {tasks.length} | Completed: {tasks.filter(t => t.completed).length}
        </div>
      </div>

    </div>
  );
}
