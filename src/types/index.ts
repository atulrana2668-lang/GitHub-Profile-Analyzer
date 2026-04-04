// ============================================================
// GitHub Profile Analyzer - TypeScript Type Definitions
// ============================================================

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  language: string | null;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  default_branch: string;
}

export interface GitHubEvent {
  id: string;
  type: string;
  created_at: string;
  repo: {
    id: number;
    name: string;
    url: string;
  };
  payload: {
    commits?: Array<{ sha: string; message: string }>;
    pull_request?: {
      merged: boolean;
      state: string;
    };
    action?: string;
    issue?: { state: string };
  };
}

export interface GitHubData {
  user: GitHubUser;
  repos: GitHubRepo[];
  events: GitHubEvent[];
  total_stars: number;
  total_forks: number;
  commits_30d: number;
  prs_merged_30d: number;
  issues_closed_30d: number;
  language_distribution: Record<string, number>;
  activity_heatmap: DailyActivity[];
  weekly_contributions: WeeklyContribution[];
}

export interface DailyActivity {
  date: string; // ISO date string YYYY-MM-DD
  count: number;
  level: 0 | 1 | 2 | 3 | 4; // heatmap intensity
}

export interface WeeklyContribution {
  week: string; // ISO date string
  commits: number;
  prs: number;
  issues: number;
}

export interface DeveloperScore {
  total: number;
  breakdown: {
    influence: number;
    popularity: number;
    quality: number;
    productivity: number;
    velocity: number;
    impact: number;
    networking: number;
  };
  grade: "S" | "A" | "B" | "C" | "D" | "F";
  percentile: number;
}

export interface ProfileAnalysis {
  user: GitHubUser;
  repos: GitHubRepo[];
  topRepos: GitHubRepo[];
  languageDistribution: Record<string, number>;
  activityHeatmap: DailyActivity[];
  weeklyContributions: WeeklyContribution[];
  developerScore: DeveloperScore;
  totalStars: number;
  totalForks: number;
  commits30d: number;
  prsMerged30d: number;
  issuesClosed30d: number;
}

export interface CompareProfiles {
  left: ProfileAnalysis;
  right: ProfileAnalysis;
}

export type ApiError = {
  message: string;
  code: "NOT_FOUND" | "RATE_LIMITED" | "SERVER_ERROR" | "INVALID_USERNAME";
};

// ============================================================
// Code Wiki / Repository Analysis Types
// ============================================================

export interface RepoFileInfo {
  path: string;
  name: string;
  type: "file" | "dir";
  language?: string;
  size?: number;
}

export interface RepoTechStack {
  languages: Record<string, number>;
  frameworks: string[];
  libraries: string[];
  tools: string[];
  primaryLanguage: string;
}

export interface RepoArchitecture {
  pattern: string;
  description: string;
  layers: string[];
  mermaidDiagram: string;
}

export interface RepoDependencyGraph {
  mermaidGraph: string;
  dependencies: string[];
  devDependencies: string[];
}

export interface RepoComponentFlow {
  mermaidFlowchart: string;
  components: string[];
  entryPoints: string[];
}

export interface RepoAnalysis {
  name: string;
  fullName: string;
  owner: string;
  description: string;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
  defaultBranch: string;
  techStack: RepoTechStack;
  architecture: RepoArchitecture;
  dependencyGraph: RepoDependencyGraph;
  componentFlow: RepoComponentFlow;
  fileTree: RepoFileInfo[];
  readme: string;
  structureSummary: string;
}
