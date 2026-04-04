import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { DeveloperScore } from "@/types";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
    return num.toString();
}

export function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export function formatRelativeTime(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "today";
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
}

export function parseGitHubUrl(input: string): string | null {
    // Handle: github.com/username, https://github.com/username, @username, username
    const cleaned = input.trim();

    // Match full URL
    const urlMatch = cleaned.match(
        /^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38})(?:\/.*)?$/
    );
    if (urlMatch) return urlMatch[1];

    // Match @username
    const atMatch = cleaned.match(/^@([a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38})$/);
    if (atMatch) return atMatch[1];

    // Match plain username
    const plainMatch = cleaned.match(/^([a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38})$/);
    if (plainMatch) return plainMatch[1];

    return null;
}

export function parseGitHubRepoUrl(input: string): { owner: string; repo: string } | null {
    const cleaned = input.trim();
    const urlMatch = cleaned.match(/^(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)\/?$/);
    if (urlMatch) return { owner: urlMatch[1].replace('.git', ''), repo: urlMatch[2].replace('.git', '') };

    const plainMatch = cleaned.match(/^([^\/]+)\/([^\/]+)$/);
    if (plainMatch) return { owner: plainMatch[1].replace('.git', ''), repo: plainMatch[2].replace('.git', '') };

    return null;
}

export function getGradeColor(grade: DeveloperScore["grade"]): string {
    const colors: Record<DeveloperScore["grade"], string> = {
        S: "text-yellow-400",
        A: "text-green-400",
        B: "text-blue-400",
        C: "text-orange-400",
        D: "text-red-400",
        F: "text-red-600",
    };
    return colors[grade];
}

export function getGradeGlow(grade: DeveloperScore["grade"]): string {
    const glows: Record<DeveloperScore["grade"], string> = {
        S: "shadow-yellow-500/30",
        A: "shadow-green-500/30",
        B: "shadow-blue-500/30",
        C: "shadow-orange-500/30",
        D: "shadow-red-500/30",
        F: "shadow-red-600/30",
    };
    return glows[grade];
}

export function getLanguageColor(language: string): string {
    const colors: Record<string, string> = {
        JavaScript: "#f7df1e",
        TypeScript: "#3178c6",
        Python: "#3572a5",
        Java: "#b07219",
        "C++": "#f34b7d",
        C: "#555555",
        "C#": "#178600",
        Ruby: "#701516",
        Go: "#00add8",
        Rust: "#dea584",
        Swift: "#f05138",
        Kotlin: "#a97bff",
        PHP: "#4f5d95",
        Scala: "#c22d40",
        Dart: "#00b4ab",
        Elixir: "#6e4a7e",
        Vue: "#41b883",
        Shell: "#89e051",
        HTML: "#e34c26",
        CSS: "#563d7c",
        SCSS: "#c6538c",
        Jupyter: "#da5b0b",
        R: "#198ce7",
        Haskell: "#5e5086",
        Lua: "#000080",
        Perl: "#0298c3",
        Vim: "#199f4b",
        Nix: "#7e7eff",
    };
    return colors[language] ?? "#8b8b8b";
}

export function generateHeatmapData(
    events: Array<{ created_at: string; type: string }>
): Array<{ date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }> {
    const counts: Record<string, number> = {};
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    events.forEach((event) => {
        const date = new Date(event.created_at);
        if (date >= ninetyDaysAgo) {
            const key = date.toISOString().split("T")[0];
            counts[key] = (counts[key] ?? 0) + 1;
        }
    });

    // Fill all 90 days
    const result = [];
    for (let i = 90; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = d.toISOString().split("T")[0];
        const count = counts[key] ?? 0;
        const level: 0 | 1 | 2 | 3 | 4 =
            count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 10 ? 3 : 4;
        result.push({ date: key, count, level });
    }
    return result;
}
