import React, { useState, useEffect } from "react";
import { Calendar, Info } from "lucide-react";
import { auth } from "../lib/firebaseClient";
import { useOSStore } from "../store/useStore";

interface RatingEntry {
  id: number;
  date: string; // YYYY-MM-DD
  systemIndexRating: number;
  totalScore: number;
  mode: string;
  isRecoveryDay: boolean;
}

export function ContributionGrid() {
  const { state } = useOSStore();
  const [history, setHistory] = useState<RatingEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Calculate the start date from June 1st, 2026 and generate exactly 53 weeks (1 year range) in git style
  const { startDate, weeks } = React.useMemo(() => {
    // Start of June 2026
    const start = new Date(2026, 5, 1); // June 1, 2026
    const startOfWeekDate = new Date(start);
    startOfWeekDate.setDate(start.getDate() - start.getDay()); // Sunday of the week containing June 1st, 2026 (May 31st, 2026)
    
    const numWeeks = 53; // Fixed 53 weeks for a full git-style year timeline
    
    const list = [];
    const tempDate = new Date(startOfWeekDate);
    for (let w = 0; w < numWeeks; w++) {
      const weekDays = [];
      for (let d = 0; d < 7; d++) {
        const yearVal = tempDate.getFullYear();
        const monthVal = String(tempDate.getMonth() + 1).padStart(2, "0");
        const dateVal = String(tempDate.getDate()).padStart(2, "0");
        const dateStr = `${yearVal}-${monthVal}-${dateVal}`;
        weekDays.push({
          date: new Date(tempDate),
          dateStr,
        });
        tempDate.setDate(tempDate.getDate() + 1);
      }
      list.push(weekDays);
    }
    return { startDate: startOfWeekDate, weeks: list };
  }, []);

  // 2. Generate dynamic month labels aligned with week indices
  const monthLabels = React.useMemo(() => {
    const numWeeks = weeks.length;
    const labels: (string | null)[] = Array(numWeeks).fill(null);
    let lastMonth = -1;
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    for (let w = 0; w < numWeeks; w++) {
      const weekWednesday = new Date(startDate);
      weekWednesday.setDate(startDate.getDate() + w * 7 + 3); // Check middle of the week to determine label month
      const m = weekWednesday.getMonth();
      if (m !== lastMonth) {
        labels[w] = monthNames[m];
        lastMonth = m;
      }
    }
    return labels;
  }, [startDate, weeks]);

  // 3. Fetch history from database or fallback to mock sandbox data
  useEffect(() => {
    let active = true;

    const fetchHistory = async () => {
      const user = auth.currentUser;
      if (!user) {
        // Fallback: Populate historical simulation only for the past 14 days (2 weeks), keeping the rest empty
        const mockRatings: RatingEntry[] = [];
        const tempDate = new Date(startDate);
        const totalDays = weeks.length * 7;
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        for (let i = 0; i < totalDays; i++) {
          const y = tempDate.getFullYear();
          const m = String(tempDate.getMonth() + 1).padStart(2, "0");
          const d = String(tempDate.getDate()).padStart(2, "0");
          const dayStr = `${y}-${m}-${d}`;
          
          if (tempDate <= new Date() && tempDate >= fourteenDaysAgo) {
            // Simulate realistic logs only for the past 14 days
            const seed = (y + tempDate.getMonth() + tempDate.getDate()) % 13;
            if (seed > 3) {
              let systemIndex = 40 + (tempDate.getDate() * 4 + tempDate.getMonth() * 9) % 55;
              let mode = "Normal Mode";
              let isRecovery = false;
              
              if (systemIndex >= 85) {
                mode = "Build Mode";
              } else if (systemIndex >= 70) {
                mode = "Quiz Mode";
              } else if (systemIndex < 55) {
                isRecovery = true;
                mode = "Recovery Mode";
              }

              mockRatings.push({
                id: i,
                date: dayStr,
                systemIndexRating: systemIndex,
                totalScore: systemIndex,
                mode,
                isRecoveryDay: isRecovery,
              });
            }
          }
          tempDate.setDate(tempDate.getDate() + 1);
        }
        if (active) setHistory(mockRatings);
        return;
      }

      setLoading(true);
      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (active) setHistory(data.ratings || []);
        }
      } catch (error) {
        console.error("Failed to load ratings history:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchHistory();

    const unsubscribe = auth.onAuthStateChanged(() => {
      fetchHistory();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [startDate, weeks]);

  // Color mapping logic for individual squares
  const getCellStyles = (entry: RatingEntry | undefined, isFuture: boolean) => {
    const base = "border border-black/[0.04]";
    if (isFuture) {
      return `${base} bg-neutral-50 pointer-events-none`;
    }
    if (!entry) {
      return `${base} bg-neutral-100 hover:bg-neutral-200`;
    }

    const rating = entry.systemIndexRating;

    if (entry.isRecoveryDay) {
      return `${base} bg-amber-400 hover:bg-amber-500`;
    }

    if (rating >= 85) {
      return `${base} bg-emerald-800 hover:bg-emerald-900`;
    }
    if (rating >= 70) {
      return `${base} bg-emerald-500 hover:bg-emerald-600`;
    }
    if (rating >= 55) {
      return `${base} bg-emerald-200 hover:bg-emerald-300`;
    }
    
    return `${base} bg-amber-200 hover:bg-amber-300`;
  };

  return (
    <div id="ratings-heatmap-grid" className="bg-white border border-neutral-200 p-5 shadow-xs flex flex-col relative rounded-xs">
      {/* Top hanger accent matching the polished clipboard board format */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1.5 h-3 w-16 bg-neutral-100 border border-neutral-200 border-t-neutral-300 rounded shadow-xs flex items-center justify-center">
        <div className="w-8 h-1 bg-neutral-300 rounded-full" />
      </div>

      <div className="border-b border-neutral-150 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-neutral-700" />
          <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-neutral-850">
            System Index Yearly Timeline
          </h3>
          {loading && <span className="text-[10px] text-neutral-400 font-mono animate-pulse">(Syncing...)</span>}
        </div>
        <p className="text-[11px] text-neutral-500 mt-0.5 font-mono">
          Focus patterns, recovery cycles, and peak contribution trends mapped over the past year
        </p>
      </div>

      {/* Horizontally scrollable year-long heatmap timeline */}
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="w-fit">
          {/* Months header row */}
          <div className="flex gap-2 mb-1 select-none">
            {/* Weekday alignment margin spacer */}
            <div className="w-6 shrink-0" />
            
            {/* Dynamic Month indicator slots */}
            <div 
              style={{ gridTemplateColumns: `repeat(${weeks.length}, 10px)` }}
              className="grid gap-[2px] text-[8px] font-mono font-bold text-neutral-400"
            >
              {monthLabels.map((label, w) => (
                <div key={w} className="h-3 relative">
                  {label && (
                    <span className="absolute left-0 bottom-0 whitespace-nowrap">
                      {label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Grid structure row with side labels */}
          <div className="flex gap-2">
            {/* Left labels aligning vertically to matching day-of-week indexes */}
            <div className="grid grid-rows-7 gap-[2px] text-[8px] font-mono font-bold text-neutral-400 w-6 shrink-0 select-none">
              <span className="h-[10px] flex items-center justify-start row-start-2">Mon</span>
              <span className="h-[10px] flex items-center justify-start row-start-4">Wed</span>
              <span className="h-[10px] flex items-center justify-start row-start-6">Fri</span>
            </div>

            {/* The columns representing full weeks */}
            <div 
              style={{ gridTemplateColumns: `repeat(${weeks.length}, 10px)` }}
              className="grid gap-[2px]"
            >
              {weeks.map((week, w) => (
                <div key={w} className="flex flex-col gap-[2px]">
                  {week.map((day) => {
                    const isFuture = day.date > new Date();
                    const ratingEntry = history.find((h) => h.date === day.dateStr);
                    return (
                      <div
                        key={day.dateStr}
                        className={`w-[10px] h-[10px] rounded-[1.5px] transition-all cursor-help group relative ${getCellStyles(ratingEntry, isFuture)}`}
                      >
                        {/* Interactive Tooltip Hover Box */}
                        {!isFuture && (
                          <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-neutral-900 border border-neutral-850 text-white text-[10px] p-2.5 rounded shadow-xl font-mono text-left z-50 pointer-events-none">
                            <div className="text-neutral-400 border-b border-neutral-800 pb-1 mb-1 flex justify-between">
                              <span>{day.dateStr}</span>
                              <span className="font-bold uppercase text-[9px] text-neutral-500">
                                {ratingEntry?.mode || "Unlogged"}
                              </span>
                            </div>
                            {ratingEntry ? (
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span>System Index:</span>
                                  <span className="text-emerald-400 font-bold">{ratingEntry.systemIndexRating}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Daily Score:</span>
                                  <span className="text-white">{ratingEntry.totalScore} pts</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Type:</span>
                                  <span className={ratingEntry.isRecoveryDay ? "text-amber-400 font-bold" : "text-emerald-400"}>
                                    {ratingEntry.isRecoveryDay ? "Recovery Day" : "Production Day"}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-neutral-500 italic">No activity logged for this day.</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="border-t border-neutral-150 pt-3 flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono text-neutral-500">
        <div className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-neutral-400" />
          <span>Hover squares for diagnostic records</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1">
            <div className="w-2.5 h-2.5 bg-emerald-800 border border-black/[0.04] rounded-xs" />
            <span>Peak Focus (≥85%)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2.5 h-2.5 bg-emerald-500 border border-black/[0.04] rounded-xs" />
            <span>High Output (70-84%)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2.5 h-2.5 bg-emerald-200 border border-black/[0.04] rounded-xs" />
            <span>Consistency (55-69%)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2.5 h-2.5 bg-amber-400 border border-black/[0.04] rounded-xs" />
            <span>Recovery Day</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2.5 h-2.5 bg-amber-200 border border-black/[0.04] rounded-xs" />
            <span>Rescue (&lt;55%)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2.5 h-2.5 bg-neutral-100 border border-black/[0.04] rounded-xs" />
            <span>No Log</span>
          </div>
        </div>
      </div>
    </div>
  );
}
