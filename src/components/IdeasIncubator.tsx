import React, { useState } from "react";
import { AppState, Idea, Project } from "../types";
import {
  Lightbulb,
  Plus,
  Trash2,
  Archive,
  Search,
  Tag,
  Zap,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  FolderPlus,
  Layers,
  Sparkles
} from "lucide-react";

interface IdeasIncubatorProps {
  state: AppState;
  updateState: (newState: Partial<AppState>) => void;
  addBacklogItem: (category: "academic" | "projects" | "kidaura" | "build" | "health", item: string) => void;
}

export function IdeasIncubator({
  state,
  updateState,
  addBacklogItem
}: IdeasIncubatorProps) {
  const ideas = state.ideas || [];

  // Local state for adding a new idea
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium");
  const [newTagInput, setNewTagInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const handleAddIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    const parsedTags = newTagInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newIdea: Idea = {
      id: `idea-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim(),
      createdAt: new Date().toISOString().split("T")[0],
      status: "backburner",
      priority: newPriority,
      tags: parsedTags.length > 0 ? parsedTags : ["General"]
    };

    const updatedIdeas = [newIdea, ...ideas];
    updateState({
      ideas: updatedIdeas,
      changeLogs: [`Logged new random idea: "${newIdea.title}"`, ...(state.changeLogs || [])]
    });

    setNewTitle("");
    setNewDesc("");
    setNewPriority("medium");
    setNewTagInput("");
  };

  const handleUpdateStatus = (id: string, status: Idea["status"]) => {
    const updatedIdeas = ideas.map((idea) =>
      idea.id === id ? { ...idea, status } : idea
    );
    updateState({ ideas: updatedIdeas });
  };

  const handleUpdatePriority = (id: string, priority: Idea["priority"]) => {
    const updatedIdeas = ideas.map((idea) =>
      idea.id === id ? { ...idea, priority } : idea
    );
    updateState({ ideas: updatedIdeas });
  };

  const handleDeleteIdea = (id: string) => {
    const ideaToDelete = ideas.find((i) => i.id === id);
    const updatedIdeas = ideas.filter((idea) => idea.id !== id);
    updateState({
      ideas: updatedIdeas,
      changeLogs: [
        `Removed idea: "${ideaToDelete?.title || id}"`,
        ...(state.changeLogs || [])
      ]
    });
  };

  // Promote an idea to a full project
  const handlePromoteToProject = (idea: Idea) => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: idea.title,
      progress: 5,
      artifact: "Concept note & architecture",
      vivaReadiness: 0,
      codeOwnershipLevel: 0,
      nextAction: "Define initial specifications and set up repository.",
      stuckPoint: "Needs core technology selection"
    };

    const updatedProjects = [...(state.projects || []), newProject];
    // Archive or update the status of the idea to in-progress
    const updatedIdeas = ideas.map((i) =>
      i.id === idea.id ? { ...i, status: "in-progress" as const } : i
    );

    updateState({
      projects: updatedProjects,
      ideas: updatedIdeas,
      changeLogs: [
        `Promoted idea "${idea.title}" to an active project!`,
        ...(state.changeLogs || [])
      ]
    });
  };

  // Promote an idea to a system backlog item
  const handlePromoteToBacklog = (idea: Idea, category: "academic" | "projects" | "kidaura" | "build" | "health") => {
    addBacklogItem(category, `Explore: ${idea.title} - ${idea.description}`);
    
    // Set status to researching
    const updatedIdeas = ideas.map((i) =>
      i.id === idea.id ? { ...i, status: "researching" as const } : i
    );

    updateState({
      ideas: updatedIdeas,
      changeLogs: [
        `Sent idea "${idea.title}" to ${category} backlog for exploration`,
        ...(state.changeLogs || [])
      ]
    });
  };

  // Filtering logic
  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch =
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (idea.tags || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || idea.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || idea.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const activeIdeasCount = ideas.filter((i) => i.status !== "archived").length;
  const backburnerCount = ideas.filter((i) => i.status === "backburner").length;
  const researchingCount = ideas.filter((i) => i.status === "researching").length;

  return (
    <div className="space-y-6">
      {/* Overview Analytics Dashboard bar inside incubator */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-neutral-200 bg-neutral-50/50 p-4">
          <span className="text-[9px] font-mono text-neutral-400 block uppercase tracking-wider">ACTIVE INVENTIONS</span>
          <div className="text-2xl font-display font-bold text-neutral-900 mt-1">{activeIdeasCount} Ideas</div>
          <span className="text-[10px] font-mono text-neutral-500 block mt-1">Stored securely in system sandbox</span>
        </div>
        <div className="border border-neutral-200 bg-neutral-50/50 p-4">
          <span className="text-[9px] font-mono text-neutral-400 block uppercase tracking-wider">ON BACKBURNER</span>
          <div className="text-2xl font-display font-bold text-neutral-900 mt-1">{backburnerCount} Ideas</div>
          <span className="text-[10px] font-mono text-neutral-500 block mt-1">Low urgency, zero pressure logs</span>
        </div>
        <div className="border border-neutral-200 bg-neutral-50/50 p-4">
          <span className="text-[9px] font-mono text-neutral-400 block uppercase tracking-wider">UNDER ACTIVE RESEARCH</span>
          <div className="text-2xl font-display font-bold text-neutral-900 mt-1">{researchingCount} Ideas</div>
          <span className="text-[10px] font-mono text-neutral-500 block mt-1">Deep dives pending or in-progress</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left column: Add new idea form */}
        <div className="bg-neutral-50/40 border border-neutral-200 p-6 space-y-4">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 block">IDEATION PORTAL</span>
            <h3 className="font-display font-bold text-sm text-neutral-900 uppercase mt-0.5">Capture Random Thought</h3>
          </div>

          <form onSubmit={handleAddIdea} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase text-neutral-500 block">Idea Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Local OCR Search Tool"
                className="w-full bg-white border border-neutral-200 px-3 py-2 text-xs font-mono focus:border-neutral-800 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase text-neutral-500 block">Description / Concept</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="What makes this interesting? How does it solve a specific problem or fit into your stack?"
                rows={4}
                className="w-full bg-white border border-neutral-200 p-3 text-xs font-sans leading-relaxed focus:border-neutral-800 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase text-neutral-500 block">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e: any) => setNewPriority(e.target.value)}
                  className="w-full bg-white border border-neutral-200 px-2.5 py-2 text-xs font-mono focus:border-neutral-800 focus:outline-none"
                >
                  <option value="low">LOW</option>
                  <option value="medium">MEDIUM</option>
                  <option value="high">HIGH</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase text-neutral-500 block">Tags (comma sep)</label>
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="ML, Sadhana, Rust"
                  className="w-full bg-white border border-neutral-200 px-3 py-2 text-xs font-mono focus:border-neutral-800 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-850 active:bg-neutral-950 text-white text-[10px] font-mono font-bold uppercase tracking-widest flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Incubate Thought</span>
            </button>
          </form>

          <div className="pt-2 border-t border-neutral-200/50">
            <p className="text-[11px] text-neutral-500 leading-relaxed font-sans italic">
              "Your mind is for having ideas, not holding them." Capturing raw thoughts immediately unloads short-term working memory to protect core Sadhana & Quiz focus.
            </p>
          </div>
        </div>

        {/* Right column: Interactive list of ideas */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters Bar */}
          <div className="bg-white border border-neutral-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search ideas, tags, stack..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-50/50 border border-neutral-200 pl-9 pr-4 py-2 text-xs font-mono focus:bg-white focus:border-neutral-800 focus:outline-none"
              />
            </div>

            {/* Select Dropdowns */}
            <div className="flex items-center space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-neutral-200 px-3 py-2 text-xs font-mono focus:border-neutral-800 focus:outline-none"
              >
                <option value="all">ALL STATUSES</option>
                <option value="backburner">BACKBURNER</option>
                <option value="researching">RESEARCHING</option>
                <option value="in-progress">IN PROGRESS</option>
                <option value="archived">ARCHIVED</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-white border border-neutral-200 px-3 py-2 text-xs font-mono focus:border-neutral-800 focus:outline-none"
              >
                <option value="all">ALL PRIORITIES</option>
                <option value="high">HIGH PRIORITY</option>
                <option value="medium">MEDIUM PRIORITY</option>
                <option value="low">LOW PRIORITY</option>
              </select>
            </div>
          </div>

          {/* Ideas cards list */}
          <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
            {filteredIdeas.length === 0 ? (
              <div className="border border-dashed border-neutral-200 bg-white p-8 text-center space-y-2">
                <Lightbulb className="w-8 h-8 text-neutral-300 mx-auto" />
                <p className="text-xs font-mono text-neutral-400 uppercase font-bold">No Matching Ideas Captured</p>
                <p className="text-[11px] text-neutral-500 font-sans max-w-sm mx-auto">
                  Type a random idea in the side panel or log one in the main system terminal (e.g. "Idea: Build a local RSS reader")!
                </p>
              </div>
            ) : (
              filteredIdeas.map((idea) => {
                const isArchived = idea.status === "archived";
                const priorityColors = {
                  high: "border-red-200 text-red-700 bg-red-50/50",
                  medium: "border-amber-200 text-amber-700 bg-amber-50/50",
                  low: "border-neutral-200 text-neutral-600 bg-neutral-100/50"
                };

                const statusColors = {
                  backburner: "bg-blue-50 text-blue-700 border-blue-100",
                  researching: "bg-purple-50 text-purple-700 border-purple-100",
                  "in-progress": "bg-emerald-50 text-emerald-700 border-emerald-100",
                  archived: "bg-neutral-100 text-neutral-500 border-neutral-200"
                };

                return (
                  <div
                    key={idea.id}
                    className={`bg-white border border-neutral-200 p-5 shadow-xs hover:border-neutral-500 transition-all group flex flex-col justify-between ${
                      isArchived ? "opacity-60 bg-neutral-50/20" : ""
                    }`}
                  >
                    <div>
                      {/* Card Header Status Row */}
                      <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5 mb-3">
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`text-[9px] font-mono font-bold uppercase tracking-wider border px-2 py-0.5 rounded ${
                              statusColors[idea.status]
                            }`}
                          >
                            {idea.status}
                          </span>
                          <span
                            className={`text-[9px] font-mono font-bold uppercase tracking-wider border px-2 py-0.5 rounded ${
                              priorityColors[idea.priority]
                            }`}
                          >
                            {idea.priority} Priority
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-neutral-400">
                          {idea.createdAt}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h4 className="font-display font-bold text-sm text-neutral-900 group-hover:text-black transition-colors uppercase tracking-tight flex items-center justify-between">
                        <span>{idea.title}</span>
                        {!isArchived && (
                          <Sparkles className="w-3.5 h-3.5 text-neutral-300 group-hover:text-amber-500 transition-colors" />
                        )}
                      </h4>
                      <p className="text-xs text-neutral-600 mt-1.5 font-sans leading-relaxed">
                        {idea.description}
                      </p>

                      {/* Tags list */}
                      {(idea.tags || []).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3.5">
                          {(idea.tags || []).map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[9px] font-mono font-bold uppercase bg-neutral-100 text-neutral-550 border border-neutral-200/60 px-2 py-0.5 rounded-sm flex items-center"
                            >
                              <Tag className="w-2.5 h-2.5 mr-1 text-neutral-400" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions panel */}
                    <div className="border-t border-neutral-100 pt-3.5 mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                      {/* Inline Status selectors */}
                      <div className="flex items-center space-x-2">
                        <span className="text-[9px] font-mono text-neutral-400 uppercase">Status:</span>
                        <select
                          value={idea.status}
                          onChange={(e: any) => handleUpdateStatus(idea.id, e.target.value)}
                          className="bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-[10px] font-mono px-1.5 py-0.5 focus:outline-none"
                        >
                          <option value="backburner">Backburner</option>
                          <option value="researching">Researching</option>
                          <option value="in-progress">In-Progress</option>
                          <option value="archived">Archived</option>
                        </select>

                        <span className="text-[9px] font-mono text-neutral-400 uppercase ml-1.5">Priority:</span>
                        <select
                          value={idea.priority}
                          onChange={(e: any) => handleUpdatePriority(idea.id, e.target.value)}
                          className="bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-[10px] font-mono px-1.5 py-0.5 focus:outline-none"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>

                      {/* Core Promotion & Management links */}
                      <div className="flex items-center space-x-2 justify-end self-end sm:self-center">
                        {idea.status !== "archived" && (
                          <>
                            {/* Promote to Project */}
                            <button
                              onClick={() => handlePromoteToProject(idea)}
                              title="Promote this idea to a full live active project!"
                              className="px-2.5 py-1 bg-violet-50 text-violet-700 hover:bg-violet-600 hover:text-white border border-violet-200 rounded font-mono text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 transition-colors cursor-pointer"
                            >
                              <FolderPlus className="w-3 h-3" />
                              <span>Go Active</span>
                            </button>

                            {/* Send to Backlog Dropdown/Button */}
                            <button
                              onClick={() => handlePromoteToBacklog(idea, "build")}
                              title="Send this idea to the Research & Build backlog."
                              className="px-2.5 py-1 bg-cyan-50 text-cyan-750 hover:bg-cyan-600 hover:text-white border border-cyan-200 rounded font-mono text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 transition-colors cursor-pointer"
                            >
                              <Layers className="w-3 h-3" />
                              <span>Backlog (Build)</span>
                            </button>
                          </>
                        )}

                        {/* Delete permanently */}
                        <button
                          onClick={() => handleDeleteIdea(idea.id)}
                          title="Delete Idea"
                          className="p-1.5 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition-colors border border-transparent hover:border-rose-100 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
