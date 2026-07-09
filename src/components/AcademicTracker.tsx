import { AppState } from "../types";
import { CheckCircle2, Clock, Circle, HelpCircle, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export function AcademicTracker({
  state,
  toggleCourseWeek,
  updateState,
}: {
  state: AppState;
  toggleCourseWeek: (courseId: string, weekNum: number) => void;
  updateState: (updates: Partial<AppState>) => void;
}) {
  const [newWeakTopic, setNewWeakTopic] = useState<Record<string, string>>({});

  const getStatusIcon = (status: "not-started" | "in-progress" | "done") => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-50" />;
      case "in-progress":
        return <Clock className="w-4 h-4 text-amber-500 fill-amber-50" />;
      default:
        return <Circle className="w-4 h-4 text-neutral-300" />;
    }
  };

  const getStatusBorder = (status: "not-started" | "in-progress" | "done") => {
    switch (status) {
      case "done":
        return "border-emerald-200 bg-emerald-50/40 text-emerald-900";
      case "in-progress":
        return "border-amber-200 bg-amber-50/40 text-amber-900";
      default:
        return "border-neutral-200 bg-white text-neutral-400";
    }
  };

  const addWeakTopic = (courseId: string) => {
    const topic = newWeakTopic[courseId] || "";
    if (!topic.trim()) return;

    const updatedCourses = state.courses.map((course) => {
      if (course.id === courseId) {
        return {
          ...course,
          weakTopics: [...course.weakTopics, topic.trim()],
        };
      }
      return course;
    });

    updateState({ courses: updatedCourses });
    setNewWeakTopic((prev) => ({ ...prev, [courseId]: "" }));
  };

  const removeWeakTopic = (courseId: string, topicIndex: number) => {
    const updatedCourses = state.courses.map((course) => {
      if (course.id === courseId) {
        return {
          ...course,
          weakTopics: course.weakTopics.filter((_, idx) => idx !== topicIndex),
        };
      }
      return course;
    });

    updateState({ courses: updatedCourses });
  };

  return (
    <div className="col-span-full lg:col-span-2 bg-white border border-neutral-200 p-6">
      <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-6">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 block">ACADEMIC AUDIT PATHWAY</span>
          <h2 className="text-xl font-display font-bold text-neutral-900 mt-1">Quiz 1 Prep (Weeks 1–4)</h2>
        </div>
        <div className="bg-neutral-900 text-white font-mono text-[10px] px-2.5 py-1 uppercase tracking-wider">
          TARGET CGPA: 9.2+
        </div>
      </div>

      <div className="space-y-6">
        {state.courses.map((course) => (
          <div key={course.id} className="border border-neutral-200 bg-white hover:border-neutral-300 transition-all p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <span className="font-mono text-[9px] uppercase bg-neutral-100 px-2 py-0.5 border border-neutral-200 text-neutral-600 rounded">
                  {course.shortName}
                </span>
                <h3 className="font-display font-bold text-lg text-neutral-900 mt-1">
                  {course.name}
                </h3>
              </div>
              
              {/* Interactive Week Selectors */}
              <div className="flex items-center space-x-1.5 bg-neutral-50 p-1 border border-neutral-200 rounded">
                <span className="text-[9px] font-mono text-neutral-400 uppercase px-1.5">WKS:</span>
                {[1, 2, 3, 4].map((wk) => {
                  const status = course.weekStatuses[wk] || "not-started";
                  return (
                    <button
                      key={wk}
                      onClick={() => toggleCourseWeek(course.id, wk)}
                      className={`px-2.5 py-1 text-xs font-mono font-bold border transition-all flex items-center space-x-1 hover:border-neutral-900 rounded ${getStatusBorder(
                        status
                      )}`}
                      title={`Click to cycle status for Week ${wk} (${status})`}
                    >
                      <span>WK{wk}</span>
                      {getStatusIcon(status)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pt-4 border-t border-neutral-100">
              {/* Core Deliverables */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase block">ACTIVE RECALL PARAMETERS</span>
                
                <div className="flex items-center justify-between p-2.5 border border-neutral-200 text-sm">
                  <span className="text-neutral-700 font-medium">Concept Recall Sheet</span>
                  <button
                    onClick={() => {
                      const updated = state.courses.map((c) => {
                        if (c.id === course.id) {
                          const states: ("not-started" | "in-progress" | "done")[] = ["not-started", "in-progress", "done"];
                          const currentIdx = states.indexOf(c.recallSheetStatus);
                          const next = states[(currentIdx + 1) % 3];
                          return { ...c, recallSheetStatus: next };
                        }
                        return c;
                      });
                      updateState({ courses: updated });
                    }}
                    className={`px-2 py-0.5 text-xs font-mono rounded border ${getStatusBorder(course.recallSheetStatus)}`}
                  >
                    {course.recallSheetStatus.toUpperCase()}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2.5 border border-neutral-200 text-sm">
                  <span className="text-neutral-700 font-medium">Practice & Quiz Assignment Qs</span>
                  <button
                    onClick={() => {
                      const updated = state.courses.map((c) => {
                        if (c.id === course.id) {
                          const states: ("not-started" | "in-progress" | "done")[] = ["not-started", "in-progress", "done"];
                          const currentIdx = states.indexOf(c.practiceQuestions);
                          const next = states[(currentIdx + 1) % 3];
                          return { ...c, practiceQuestions: next };
                        }
                        return c;
                      });
                      updateState({ courses: updated });
                    }}
                    className={`px-2 py-0.5 text-xs font-mono rounded border ${getStatusBorder(course.practiceQuestions)}`}
                  >
                    {course.practiceQuestions.toUpperCase()}
                  </button>
                </div>

                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded">
                  <span className="text-[9px] font-mono tracking-widest text-neutral-400 block uppercase">NEXT TASK ARTIFACT</span>
                  <input
                    type="text"
                    value={course.nextOutput}
                    onChange={(e) => {
                      const updated = state.courses.map((c) => {
                        if (c.id === course.id) {
                          return { ...c, nextOutput: e.target.value };
                        }
                        return c;
                      });
                      updateState({ courses: updated });
                    }}
                    className="w-full bg-transparent text-sm font-medium text-neutral-900 border-b border-transparent focus:border-neutral-400 focus:outline-none mt-1"
                  />
                </div>
              </div>

              {/* Weak Topics / active revision */}
              <div>
                <span className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase block mb-2">RECALL DEFICITS & WEAK TOPICS</span>
                
                <div className="space-y-1.5 max-h-[110px] overflow-y-auto mb-3">
                  {(!course.weakTopics || course.weakTopics.length === 0) ? (
                    <div className="text-xs font-mono text-neutral-400 bg-neutral-50 border border-neutral-200 p-3 rounded text-center">
                      No recall gaps identified. Perform testing!
                    </div>
                  ) : (
                    (course.weakTopics || []).map((topic, i) => (
                      <div key={i} className="flex items-center justify-between bg-rose-50/30 border border-rose-100 p-2 text-xs text-neutral-700 font-sans">
                        <span className="leading-tight flex items-start">
                          <span className="text-rose-500 mr-2 font-bold">•</span>
                          {topic}
                        </span>
                        <button
                          onClick={() => removeWeakTopic(course.id, i)}
                          className="text-neutral-400 hover:text-rose-600 transition-colors ml-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="Log weak topic/recall gap..."
                    value={newWeakTopic[course.id] || ""}
                    onChange={(e) =>
                      setNewWeakTopic((prev) => ({ ...prev, [course.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addWeakTopic(course.id);
                    }}
                    className="w-full bg-white border border-neutral-300 px-3 py-1 text-xs rounded focus:outline-none focus:border-neutral-900"
                  />
                  <button
                    onClick={() => addWeakTopic(course.id)}
                    className="bg-neutral-900 hover:bg-neutral-800 text-white p-1.5 rounded transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {course.notes && (
              <div className="bg-amber-50/50 border border-amber-200 text-amber-900 p-2.5 text-xs font-mono mt-4">
                <span className="font-bold">GENIE DIRECTION:</span> {course.notes}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
