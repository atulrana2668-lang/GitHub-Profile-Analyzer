import type {
    GitHubUser,
    GitHubRepo,
    GitHubEvent,
    GitHubData,
    DailyActivity,
    WeeklyContribution,
} from "@/types";
import { generateHeatmapData } from "@/lib/utils";

const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const HEADERS: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "GitHubProfileAnalyzer/1.0",
    ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
};

async function githubFetch<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
        headers: HEADERS,
        next: { revalidate: 900 }, // Cache 15 minutes
    });

    if (res.status === 404) {
        throw new Error("USER_NOT_FOUND");
    }
    if (res.status === 403) {
        const rateLimitRemaining = res.headers.get("X-RateLimit-Remaining");
        if (rateLimitRemaining === "0") throw new Error("RATE_LIMITED");
        throw new Error("FORBIDDEN");
    }
    if (!res.ok) {
        throw new Error(`GITHUB_API_ERROR:${res.status}`);
    }

    return res.json() as Promise<T>;
}

export async function fetchGitHubProfile(username: string): Promise<GitHubUser> {
    return githubFetch<GitHubUser>(`/users/${username}`);
}

export async function fetchUserRepos(username: string): Promise<GitHubRepo[]> {
    const repos = await githubFetch<GitHubRepo[]>(
        `/users/${username}/repos?per_page=100&sort=updated`
    );
    return repos.filter((r) => !r.fork); // Exclude forks for own analysis
}

export async function fetchUserEvents(username: string): Promise<GitHubEvent[]> {
    try {
        return await githubFetch<GitHubEvent[]>(
            `/users/${username}/events/public?per_page=100`
        );
    } catch {
        return [];
    }
}

function computeLanguageDistribution(repos: GitHubRepo[]): Record<string, number> {
    const langs: Record<string, number> = {};
    repos.forEach((repo) => {
        if (repo.language) {
            langs[repo.language] = (langs[repo.language] ?? 0) + 1;
        }
    });
    // Sort by count descending, take top 8
    return Object.fromEntries(
        Object.entries(langs)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 8)
    );
}

function computeActivityStats(events: GitHubEvent[]): {
    commits_30d: number;
    prs_merged_30d: number;
    issues_closed_30d: number;
    weekly_contributions: WeeklyContribution[];
} {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    let commits_30d = 0;
    let prs_merged_30d = 0;
    let issues_closed_30d = 0;

    const weeklyMap: Record<string, WeeklyContribution> = {};

    events.forEach((event) => {
        const date = new Date(event.created_at);
        const weekStart = new Date(date);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekKey = weekStart.toISOString().split("T")[0];

        if (!weeklyMap[weekKey]) {
            weeklyMap[weekKey] = { week: weekKey, commits: 0, prs: 0, issues: 0 };
        }

        if (event.type === "PushEvent" && event.payload.commits) {
            const commitCount = event.payload.commits.length;
            weeklyMap[weekKey].commits += commitCount;
            if (date >= thirtyDaysAgo) commits_30d += commitCount;
        }

        if (event.type === "PullRequestEvent") {
            weeklyMap[weekKey].prs += 1;
            if (
                date >= thirtyDaysAgo &&
                event.payload.action === "closed" &&
                event.payload.pull_request?.merged
            ) {
                prs_merged_30d += 1;
            }
        }

        if (event.type === "IssuesEvent" && event.payload.action === "closed") {
            weeklyMap[weekKey].issues += 1;
            if (date >= thirtyDaysAgo) issues_closed_30d += 1;
        }
    });

    const weekly_contributions = Object.values(weeklyMap)
        .sort((a, b) => a.week.localeCompare(b.week))
        .slice(-13); // Last 13 weeks

    return { commits_30d, prs_merged_30d, issues_closed_30d, weekly_contributions };
}

export async function fetchCompleteProfile(username: string): Promise<GitHubData> {
    // Parallel fetch: profile + repos + events (max 3 API calls)
    const [user, repos, events] = await Promise.all([
        fetchGitHubProfile(username),
        fetchUserRepos(username),
        fetchUserEvents(username),
    ]);

    const total_stars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
    const total_forks = repos.reduce((sum, r) => sum + r.forks_count, 0);

    const { commits_30d, prs_merged_30d, issues_closed_30d, weekly_contributions } =
        computeActivityStats(events);

    const language_distribution = computeLanguageDistribution(repos);

    const rawHeatmap = events.map((e) => ({
        created_at: e.created_at,
        type: e.type,
    }));
    const activity_heatmap: DailyActivity[] = generateHeatmapData(rawHeatmap);

    return {
        user,
        repos,
        events,
        total_stars,
        total_forks,
        commits_30d,
        prs_merged_30d,
        issues_closed_30d,
        language_distribution,
        activity_heatmap,
        weekly_contributions,
    };
}
