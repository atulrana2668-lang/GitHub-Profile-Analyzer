"use client";

import { useMemo } from "react";
import type { DailyActivity } from "@/types";

interface ActivityHeatmapProps {
    data: DailyActivity[];
}

const LEVEL_COLORS = [
    "bg-slate-800/80",      // 0 — no activity
    "bg-violet-900/70",     // 1 — light
    "bg-violet-700/80",     // 2 — moderate
    "bg-violet-500",        // 3 — heavy
    "bg-violet-400",        // 4 — max
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
    // Group data into weeks (columns)
    const weeks = useMemo(() => {
        const result: DailyActivity[][] = [];
        let week: DailyActivity[] = [];

        data.forEach((day, i) => {
            const dayOfWeek = new Date(day.date + "T00:00:00").getDay();
            if (i === 0) {
                // Pad start of first week with empty days
                for (let j = 0; j < dayOfWeek; j++) {
                    week.push({ date: "", count: 0, level: 0 });
                }
            }
            week.push(day);
            if (dayOfWeek === 6 || i === data.length - 1) {
                // Pad end of last week
                while (week.length < 7) {
                    week.push({ date: "", count: 0, level: 0 });
                }
                result.push(week);
                week = [];
            }
        });

        return result;
    }, [data]);

    const totalCommits = data.reduce((s, d) => s + d.count, 0);
    const activeDays = data.filter((d) => d.count > 0).length;

    return (
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h2 className="text-lg font-semibold text-white">Activity — Last 90 Days</h2>
                <div className="flex gap-4 text-xs text-slate-500">
                    <span>
                        <span className="font-semibold text-white">{totalCommits}</span>{" "}
                        events
                    </span>
                    <span>
                        <span className="font-semibold text-white">{activeDays}</span> active
                        days
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto pb-2">
                <div className="flex gap-1 min-w-max">
                    {/* Day labels column */}
                    <div className="flex flex-col gap-1 mr-1 pt-5">
                        {DAYS.map((d, i) =>
                            i % 2 === 1 ? (
                                <span
                                    key={d}
                                    className="text-[9px] text-slate-600 h-3 flex items-center"
                                >
                                    {d}
                                </span>
                            ) : (
                                <span key={d} className="h-3" />
                            )
                        )}
                    </div>

                    {/* Week columns */}
                    {weeks.map((week, wi) => (
                        <div key={wi} className="flex flex-col gap-1">
                            {/* Month label for first week of month */}
                            <div className="h-5 text-[9px] text-slate-600 flex items-center">
                                {week[0]?.date &&
                                    new Date(week[0].date + "T00:00:00").getDate() <= 7 &&
                                    new Date(week[0].date + "T00:00:00").toLocaleDateString("en-US", {
                                        month: "short",
                                    })}
                            </div>
                            {week.map((day, di) => (
                                <div
                                    key={di}
                                    title={
                                        day.date
                                            ? `${day.date}: ${day.count} events`
                                            : undefined
                                    }
                                    className={`h-3 w-3 rounded-[3px] transition-transform hover:scale-125 cursor-default ${LEVEL_COLORS[day.level]
                                        } ${!day.date ? "opacity-0" : ""}`}
                                />
                            ))}
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="mt-3 flex items-center gap-1.5 justify-end">
                    <span className="text-[10px] text-slate-600">Less</span>
                    {LEVEL_COLORS.map((cls, i) => (
                        <div key={i} className={`h-2.5 w-2.5 rounded-[3px] ${cls}`} />
                    ))}
                    <span className="text-[10px] text-slate-600">More</span>
                </div>
            </div>
        </div>
    );
}
