"use client";

import { useEffect, useRef } from "react";
import {
    Chart,
    ArcElement,
    Tooltip,
    Legend,
    type ChartData,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { getLanguageColor } from "@/lib/utils";

Chart.register(ArcElement, Tooltip, Legend);

interface LanguagePieProps {
    distribution: Record<string, number>;
}

export function LanguagePie({ distribution }: LanguagePieProps) {
    const entries = Object.entries(distribution);
    const total = entries.reduce((s, [, v]) => s + v, 0);

    const data: ChartData<"doughnut"> = {
        labels: entries.map(([lang]) => lang),
        datasets: [
            {
                data: entries.map(([, count]) => count),
                backgroundColor: entries.map(([lang]) => getLanguageColor(lang)),
                borderColor: "transparent",
                borderWidth: 2,
                hoverOffset: 6,
            },
        ],
    };

    return (
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-white">Languages</h2>

            <div className="flex flex-col items-center gap-6 sm:flex-row">
                {/* Chart */}
                <div className="relative h-48 w-48 shrink-0">
                    <Doughnut
                        data={data}
                        options={{
                            cutout: "72%",
                            plugins: {
                                legend: { display: false },
                                tooltip: {
                                    callbacks: {
                                        label: (ctx) => {
                                            const pct = (((ctx.raw as number) / total) * 100).toFixed(1);
                                            return ` ${ctx.label}: ${ctx.raw} repos (${pct}%)`;
                                        },
                                    },
                                    backgroundColor: "#1e293b",
                                    borderColor: "rgba(255,255,255,0.1)",
                                    borderWidth: 1,
                                    titleColor: "#e2e8f0",
                                    bodyColor: "#94a3b8",
                                    padding: 10,
                                },
                            },
                            animation: { animateScale: true, duration: 700 },
                        }}
                    />
                    {/* Center label */}
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-2xl font-bold text-white">{entries.length}</p>
                        <p className="text-xs text-slate-500">languages</p>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-2 w-full">
                    {entries.map(([lang, count]) => {
                        const pct = ((count / total) * 100).toFixed(1);
                        return (
                            <div key={lang} className="flex items-center gap-3">
                                <span
                                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                                    style={{ backgroundColor: getLanguageColor(lang) }}
                                />
                                <span className="flex-1 text-sm text-slate-300 truncate">
                                    {lang}
                                </span>
                                <div className="flex items-center gap-2">
                                    {/* Mini progress bar */}
                                    <div className="h-1.5 w-16 rounded-full bg-slate-700 overflow-hidden">
                                        <div
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${pct}%`,
                                                backgroundColor: getLanguageColor(lang),
                                            }}
                                        />
                                    </div>
                                    <span className="text-xs text-slate-500 w-8 text-right">
                                        {pct}%
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
