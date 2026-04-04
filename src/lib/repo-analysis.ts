import type {
    RepoFileInfo,
    RepoTechStack,
    RepoArchitecture,
    RepoDependencyGraph,
    RepoComponentFlow,
} from "@/types";

const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const HEADERS: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "CodeWiki/1.0",
    ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
};

interface GitHubTreeItem {
    path: string;
    mode: string;
    type: "blob" | "tree";
    sha: string;
    size?: number;
    url: string;
}

interface GitHubContent {
    name: string;
    path: string;
    type: "file" | "dir";
    size?: number;
    content?: string;
    encoding?: string;
    download_url?: string;
}

interface GitHubRepo {
    name: string;
    full_name: string;
    owner: { login: string };
    description: string | null;
    stargazers_count: number;
    forks_count: number;
    language: string | null;
    topics: string[];
    default_branch: string;
}

interface GitHubLanguages {
    [language: string]: number;
}

async function githubFetch<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
        headers: HEADERS,
        next: { revalidate: 3600 }, // Cache 1 hour for repo data
    });

    if (res.status === 404) {
        throw new Error("REPO_NOT_FOUND");
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

interface GitHubTreeResponse {
    sha: string;
    tree: GitHubTreeItem[];
    truncated: boolean;
}

// Fetch the root tree of a repository
async function fetchRepoTree(owner: string, repo: string, branch: string): Promise<GitHubTreeItem[]> {
    const response = await githubFetch<GitHubTreeResponse>(
        `/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
    );
    return response.tree;
}

// Fetch file content (for specific files like package.json, README, etc.)
async function fetchFileContent(owner: string, repo: string, path: string): Promise<string> {
    const content = await githubFetch<GitHubContent>(
        `/repos/${owner}/${repo}/contents/${path}`
    );
    if (content.content && content.encoding === "base64") {
        return Buffer.from(content.content, "base64").toString("utf-8");
    }
    return "";
}

// Fetch README content
async function fetchReadme(owner: string, repo: string): Promise<string> {
    try {
        const readme = await githubFetch<GitHubContent>(
            `/repos/${owner}/${repo}/readme`
        );
        if (readme.content && readme.encoding === "base64") {
            return Buffer.from(readme.content, "base64").toString("utf-8");
        }
    } catch {
        // README might not exist
    }
    return "";
}

// Build a simplified file tree (top 2 levels for overview)
function buildFileTree(tree: GitHubTreeItem[], maxDepth = 2): RepoFileInfo[] {
    const result: RepoFileInfo[] = [];
    const langExtensions: Record<string, string[]> = {
        TypeScript: [".ts", ".tsx"],
        JavaScript: [".js", ".jsx"],
        Python: [".py"],
        Rust: [".rs"],
        Go: [".go"],
        Java: [".java"],
        C: [".c", ".h"],
        "C++": [".cpp", ".cxx", ".cc", ".hpp"],
        CSharp: [".cs"],
        Ruby: [".rb"],
        PHP: [".php"],
        Swift: [".swift"],
        Kotlin: [".kt", ".kts"],
        Vue: [".vue"],
        Svelte: [".svelte"],
        HTML: [".html", ".htm"],
        CSS: [".css", ".scss", ".sass", ".less"],
        Shell: [".sh", ".bash", ".zsh"],
        Dockerfile: ["Dockerfile"],
    };

    for (const item of tree) {
        const depth = item.path.split("/").length;
        if (depth > maxDepth) continue;

        const isDir = item.type === "tree";
        const name = item.path.split("/").pop() || item.path;

        // Determine language from extension
        let language: string | undefined;
        const ext = "." + name.split(".").pop();
        for (const [lang, exts] of Object.entries(langExtensions)) {
            if (exts.includes(ext)) {
                language = lang;
                break;
            }
        }

        result.push({
            path: item.path,
            name,
            type: isDir ? "dir" : "file",
            language,
            size: item.size,
        });
    }

    return result.slice(0, 200); // Limit for performance
}

// Analyze tech stack from package.json and other config files
async function analyzeTechStack(
    owner: string,
    repo: string,
    tree: GitHubTreeItem[],
    languages: GitHubLanguages
): Promise<RepoTechStack> {
    const frameworks: string[] = [];
    const libraries: string[] = [];
    const tools: string[] = [];

    // Parse language data
    const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0);
    const langPercentages: Record<string, number> = {};
    for (const [lang, bytes] of Object.entries(languages)) {
        langPercentages[lang] = Math.round((bytes / totalBytes) * 100);
    }

    // Try to parse package.json for dependencies
    const packageJsonFiles = tree.filter(
        (item) => item.type === "blob" && item.path === "package.json"
    );

    if (packageJsonFiles.length > 0) {
        try {
            const pkgContent = await fetchFileContent(owner, repo, "package.json");
            if (pkgContent) {
                const pkg = JSON.parse(pkgContent);

                // Detect frameworks
                const frameworkDeps = ["next", "nuxt", "remix", "gatsby", "sveltekit", "express", "fastify", "nestjs", "django", "flask"];
                const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
                for (const dep of frameworkDeps) {
                    if (allDeps[dep]) frameworks.push(dep);
                }

                // Detect libraries
                const libDeps = ["react", "vue", "angular", "svelte", "jquery", "lodash", "axios", "zustand", "redux", "mobx"];
                for (const dep of libDeps) {
                    if (allDeps[dep]) libraries.push(dep);
                }

                // Detect tools
                const toolDeps = ["typescript", "webpack", "vite", "rollup", "eslint", "prettier", "jest", "vitest", "cypress", "tailwindcss", "postcss", "babel", "turbo", "lerna"];
                for (const dep of toolDeps) {
                    if (allDeps[dep]) tools.push(dep);
                }
            }
        } catch {
            // package.json might not be valid JSON
        }
    }

    // Check for config files in tree
    const configFiles = tree.map((item) => item.path);
    if (configFiles.includes("tailwind.config.js") || configFiles.includes("tailwind.config.ts")) tools.push("tailwindcss");
    if (configFiles.includes("tsconfig.json") && !tools.includes("typescript")) tools.push("typescript");
    if (configFiles.includes("Dockerfile")) tools.push("docker");
    if (configFiles.includes("docker-compose.yml")) tools.push("docker-compose");
    if (configFiles.some((p) => p.includes(".github/workflows"))) tools.push("github-actions");
    if (configFiles.includes("vercel.json")) tools.push("vercel");
    if (configFiles.includes("netlify.toml")) tools.push("netlify");

    // Determine primary language
    const primaryLanguage = Object.entries(langPercentages).sort(([, a], [, b]) => b - a)[0]?.[0] || "Unknown";

    return {
        languages: langPercentages,
        frameworks,
        libraries,
        tools: Array.from(new Set(tools)),
        primaryLanguage,
    };
}

// Detect architecture pattern and generate Mermaid diagram
function detectArchitecture(
    techStack: RepoTechStack,
    tree: GitHubTreeItem[]
): RepoArchitecture {
    const directories = tree
        .filter((item) => item.type === "tree")
        .map((item) => item.path);

    const pattern = detectPattern(directories, techStack);
    const layers = extractLayers(directories, pattern);
    const mermaidDiagram = generateArchitectureMermaid(pattern, layers, techStack);

    return {
        pattern,
        description: getPatternDescription(pattern),
        layers,
        mermaidDiagram,
    };
}

function detectPattern(directories: string[], techStack: RepoTechStack): string {
    const dirNames = directories.map((d) => d.toLowerCase());

    // Next.js / Nuxt / SvelteKit (file-based routing)
    if (
        techStack.frameworks.includes("next") ||
        directories.some((d) => d.includes("pages") || d.includes("app"))
    ) {
        if (techStack.libraries.includes("react")) return "Next.js App Router";
        if (techStack.libraries.includes("vue")) return "Nuxt App Structure";
    }

    // MVC Pattern
    if (
        dirNames.some((d) => d === "controllers" || d === "controller") &&
        dirNames.some((d) => d === "models" || d === "model") &&
        dirNames.some((d) => d === "views" || d === "view")
    ) {
        return "MVC (Model-View-Controller)";
    }

    // Microservices
    if (
        directories.filter((d) => d.includes("service") || d.includes("microservice")).length > 2 ||
        dirNames.filter((d) => d === "packages" || d === "apps").length > 0
    ) {
        return "Microservices / Monorepo";
    }

    // Layered / N-Tier
    if (
        dirNames.some((d) => d === "src" || d === "lib") &&
        dirNames.some((d) => d.includes("api") || d.includes("routes"))
    ) {
        return "Layered Architecture";
    }

    // Component-based (React/Vue/Angular)
    if (
        techStack.libraries.includes("react") ||
        techStack.libraries.includes("vue") ||
        techStack.libraries.includes("angular") ||
        techStack.libraries.includes("svelte")
    ) {
        return "Component-Based SPA";
    }

    // API / Backend
    if (
        techStack.frameworks.includes("express") ||
        techStack.frameworks.includes("fastify") ||
        techStack.frameworks.includes("nestjs")
    ) {
        return "REST API / Backend Service";
    }

    return "General Purpose";
}

function extractLayers(directories: string[], pattern: string): string[] {
    const topDirs = directories
        .filter((d) => !d.includes("/"))
        .map((d) => d);

    const commonLayers = ["src", "lib", "components", "pages", "app", "api", "routes", "controllers", "models", "services", "utils", "hooks", "store", "types", "styles", "public", "assets"];

    return commonLayers.filter((layer) => topDirs.includes(layer));
}

function getPatternDescription(pattern: string): string {
    const descriptions: Record<string, string> = {
        "Next.js App Router": "A modern React framework using Next.js 13+ App Router with Server Components, file-based routing, and nested layouts. Optimized for SSR/SSG with streaming support.",
        "Nuxt App Structure": "A Vue-based Nuxt application with server-side rendering, automatic code splitting, and file-based routing.",
        "MVC (Model-View-Controller)": "Classic MVC pattern separating data models, business logic controllers, and presentation views for clean separation of concerns.",
        "Microservices / Monorepo": "A monorepo structure containing multiple independent services or packages, each potentially deployable as a microservice.",
        "Layered Architecture": "Multi-tier layered architecture with clear separation between presentation, business logic, and data access layers.",
        "Component-Based SPA": "Single Page Application built with a component-based framework (React/Vue/Angular/Svelte), emphasizing reusable UI components and client-side routing.",
        "REST API / Backend Service": "Backend API service handling HTTP requests, business logic, and data persistence. Likely uses Express/Fastify/NestJS.",
        "General Purpose": "A versatile codebase with mixed patterns. Further analysis of specific modules is recommended.",
    };
    return descriptions[pattern] || descriptions["General Purpose"];
}

function generateArchitectureMermaid(pattern: string, layers: string[], techStack: RepoTechStack): string {
    const mermaidMap: Record<string, string> = {
        "Next.js App Router": `graph TD
    A["🌐 Client Browser"] -->|HTTP Request| B["▲ Next.js Server"]
    B -->|Route| C["📁 app/ Directory"]
    C -->|Server Component| D["🖥️ Server Components"]
    C -->|Client Component| E["⚛️ Client Components (React)"]
    D -->|Data Fetching| F["🗄️ API / Database"]
    E -->|State Management| G["📦 Zustand / Redux / Context"]
    E -->|Styling| H["🎨 Tailwind CSS / CSS Modules"]
    F -->|Response| D
    D -->|HTML Stream| A
    E -->|Hydration| A
    
    style A fill:#1e1b4b,stroke:#8b5cf6,color:#fff
    style B fill:#1e1b4b,stroke:#8b5cf6,color:#fff
    style C fill:#1e1b4b,stroke:#8b5cf6,color:#fff
    style D fill:#1e1b4b,stroke:#8b5cf6,color:#fff
    style E fill:#1e1b4b,stroke:#8b5cf6,color:#fff
    style F fill:#1e1b4b,stroke:#8b5cf6,color:#fff
    style G fill:#1e1b4b,stroke:#8b5cf6,color:#fff
    style H fill:#1e1b4b,stroke:#8b5cf6,color:#fff`,

        "Component-Based SPA": `graph TD
    A["🌐 Browser"] -->|Load| B["📦 Bundle (Webpack/Vite)"]
    B -->|Mount| C["⚛️ React Root Component"]
    C -->|Render| D["🧩 Layout Components"]
    C -->|Render| E["📄 Page Components"]
    D -->|Compose| F["🔧 UI Components (Button, Input, etc)"]
    E -->|Compose| F
    E -->|Fetch Data| G["🌍 API Service Layer"]
    E -->|Manage State| H["📦 State Management"]
    G -->|HTTP| I["🗄️ External API / Backend"]
    H -->|Update| E
    I -->|Response| G
    
    style A fill:#1e1b4b,stroke:#8b5cf6,color:#fff
    style B fill:#1e1b4b,stroke:#8b5cf6,color:#fff
    style C fill:#1e1b4b,stroke:#8b5cf6,color:#fff
    style D fill:#1e1b4b,stroke:#8b5cf6,color:#fff
    style E fill:#1e1b4b,stroke:#8b5cf6,color:#fff
    style F fill:#1e1b4b,stroke:#8b5cf6,color:#fff
    style G fill:#1e1b4b,stroke:#8b5cf6,color:#fff
    style H fill:#1e1b4b,stroke:#8b5cf6,color:#fff
    style I fill:#1e1b4b,stroke:#8b5cf6,color:#fff`,

        "REST API / Backend Service": `graph TD
    A["🌐 Client Request"] -->|HTTP/REST| B["🚪 Express / Fastify Server"]
    B -->|Route Handler| C["🎮 Controller Layer"]
    C -->|Business Logic| D["⚙️ Service Layer"]
    D -->|Data Access| E["🗃️ Repository / Model Layer"]
    E -->|Query| F["🗄️ Database (PostgreSQL/MongoDB)"]
    D -->|Auth Check| G["🔐 Authentication Middleware"]
    D -->|Validate| H["✅ Input Validation (Zod/Joi)"]
    D -->|Log| I["📝 Logger (Winston/Pino)"]
    F -->|Result| E
    E -->|Data| D
    D -->|Response| C
    C -->|JSON Response| A
    
    style A fill:#1e1b4b,stroke:#8b5cf6,color:#fff
    style B fill:#1e1b4b,stroke:#8b5cf6,color:#fff
    style C fill:#1e1b4b,stroke:#8b5cf6,color:#fff
    style D fill:#1e1b4b,stroke:#8b5cf6,color:#fff
    style E fill:#1e1b4b,stroke:#8b5cf6,color:#fff
    style F fill:#1e1b4b,stroke:#8b5cf6,color:#fff
    style G fill:#1e1b4b,stroke:#8b5cf6,color:#fff
    style H fill:#1e1b4b,stroke:#8b5cf6,color:#fff
    style I fill:#1e1b4b,stroke:#8b5cf6,color:#fff`,

        "Microservices / Monorepo": `graph TD
    subgraph "Monorepo (Turborepo/Lerna)"
        A["📦 Package: UI Components"]
        B["📦 Package: Shared Utils"]
        C["📦 Package: API Client"]
        D["🚀 App: Web Frontend"]
        E["🚀 App: Mobile Frontend"]
        F["🚀 App: Backend API"]
    end
    
    D -->|Import| A
    D -->|Import| B
    D -->|Import| C
    E -->|Import| A
    E -->|Import| B
    F -->|Import| B
    F -->|Import| C
    
    D -->|HTTP| F
    E -->|HTTP| F
    F -->|DB| G["🗄️ Database"]
    
    style A fill:#1e1b4b,stroke:#8b5cf6,color:#fff
    style B fill:#1e1b4b,stroke:#8b5cf6,color:#fff
    style C fill:#1e1b4b,stroke:#8b5cf6,color:#fff
    style D fill:#1e1b4b,stroke:#8b5cf6,color:#fff
    style E fill:#1e1b4b,stroke:#8b5cf6,color:#fff
    style F fill:#1e1b4b,stroke:#8b5cf6,color:#fff
    style G fill:#1e1b4b,stroke:#8b5cf6,color:#fff`,
    };

    if (mermaidMap[pattern]) return mermaidMap[pattern];

    // Generic fallback
    const layerNodes = layers
        .map((l, i) => `    L${i}["📁 ${l}"]`)
        .join("\n");
    const layerConnections = layers
        .map((l, i) => (i < layers.length - 1 ? `    L${i} --> L${i + 1}` : ""))
        .filter(Boolean)
        .join("\n");

    return `graph TD
    A["🌐 Entry Point"] --> L0["📁 ${layers[0] || "src"}"]
${layerConnections}
${layerNodes}

    style A fill:#1e1b4b,stroke:#8b5cf6,color:#fff
${layers.map((_, i) => `    style L${i} fill:#1e1b4b,stroke:#8b5cf6,color:#fff`).join("\n")}`;
}

// Generate dependency graph from package.json
async function generateDependencyGraph(
    owner: string,
    repo: string,
    tree: GitHubTreeItem[]
): Promise<RepoDependencyGraph> {
    const hasPackageJson = tree.some(
        (item) => item.type === "blob" && item.path === "package.json"
    );

    if (!hasPackageJson) {
        return {
            mermaidGraph: `graph LR
    A["No package.json found"]
    style A fill:#1e1b4b,stroke:#8b5cf6,color:#fff`,
            dependencies: [],
            devDependencies: [],
        };
    }

    try {
        const pkgContent = await fetchFileContent(owner, repo, "package.json");
        if (!pkgContent) {
            return {
                mermaidGraph: "",
                dependencies: [],
                devDependencies: [],
            };
        }

        const pkg = JSON.parse(pkgContent);
        const deps = Object.keys(pkg.dependencies || {});
        const devDeps = Object.keys(pkg.devDependencies || {});

        // Generate a simplified dependency graph (top 10 each)
        const topDeps = deps.slice(0, 10);
        const topDevDeps = devDeps.slice(0, 5);

        const depNodes = topDeps
            .map((d) => `    D_${sanitizeMermaidId(d)}["📦 ${d}"]`)
            .join("\n");
        const devDepNodes = topDevDeps
            .map((d) => `    DD_${sanitizeMermaidId(d)}["🔧 ${d}"]`)
            .join("\n");

        const connections = topDeps
            .map((d) => `    ROOT --> D_${sanitizeMermaidId(d)}`)
            .join("\n");
        const devConnections = topDevDeps
            .map((d) => `    ROOT --> DD_${sanitizeMermaidId(d)}`)
            .join("\n");

        const mermaidGraph = `graph LR
    ROOT["📋 package.json"]
${depNodes}
${devDepNodes}
${connections}
${devConnections}

    classDef dep fill:#1e1b4b,stroke:#8b5cf6,color:#fff
    classDef devDep fill:#1e1b4b,stroke:#3b82f6,color:#fff
    class ROOT dep
${topDeps.map((d) => `    class D_${sanitizeMermaidId(d)} dep`).join("\n")}
${topDevDeps.map((d) => `    class DD_${sanitizeMermaidId(d)} devDep`).join("\n")}`;

        return {
            mermaidGraph,
            dependencies: deps,
            devDependencies: devDeps,
        };
    } catch {
        return {
            mermaidGraph: "",
            dependencies: [],
            devDependencies: [],
        };
    }
}

function sanitizeMermaidId(id: string): string {
    return id.replace(/[^a-zA-Z0-9_]/g, "_");
}

// Generate component flow (entry points and main components)
function generateComponentFlow(
    tree: GitHubTreeItem[],
    techStack: RepoTechStack
): RepoComponentFlow {
    const entryPoints: string[] = [];
    const components: string[] = [];

    // Detect entry points
    if (tree.some((t) => t.path === "src/index.tsx" || t.path === "src/index.ts" || t.path === "src/main.tsx")) {
        entryPoints.push("src/index");
    }
    if (tree.some((t) => t.path === "src/app/layout.tsx" || t.path === "src/app/layout.jsx")) {
        entryPoints.push("src/app/layout");
    }
    if (tree.some((t) => t.path === "src/app/page.tsx" || t.path === "src/app/page.jsx")) {
        entryPoints.push("src/app/page");
    }
    if (tree.some((t) => t.path === "pages/index.tsx" || t.path === "pages/index.jsx" || t.path === "pages/index.ts" || t.path === "pages/index.js")) {
        entryPoints.push("pages/index");
    }
    if (tree.some((t) => t.path === "src/main.py")) {
        entryPoints.push("src/main");
    }
    if (tree.some((t) => t.path === "src/index.js")) {
        entryPoints.push("src/index.js");
    }
    if (tree.some((t) => t.path === "server.js" || t.path === "server.ts" || t.path === "index.js" || t.path === "index.ts")) {
        entryPoints.push(tree.find((t) => ["server.js", "server.ts", "index.js", "index.ts"].includes(t.path))?.path || "index");
    }

    if (entryPoints.length === 0) {
        // Fallback: look for common entry patterns
        const commonEntries = tree.filter(
            (t) =>
                t.type === "blob" &&
                (t.path.endsWith("index.tsx") ||
                    t.path.endsWith("index.ts") ||
                    t.path.endsWith("main.tsx") ||
                    t.path.endsWith("main.ts") ||
                    t.path.endsWith("app.tsx") ||
                    t.path.endsWith("app.ts"))
        );
        commonEntries.slice(0, 3).forEach((e) => entryPoints.push(e.path.replace(/\.(tsx?|jsx?)$/, "")));
    }

    // Detect component directories
    const componentDirs = tree.filter(
        (t) =>
            t.type === "tree" &&
            (t.path.includes("component") ||
                t.path.includes("pages") ||
                t.path.includes("views") ||
                t.path.includes("screens"))
    );
    componentDirs.slice(0, 5).forEach((d) => components.push(d.path));

    // If no components found, list top-level source directories
    if (components.length === 0) {
        const srcDirs = tree
            .filter((t) => t.type === "tree" && t.path.startsWith("src/"))
            .map((t) => t.path.split("/")[1])
            .filter((d, i, arr) => arr.indexOf(d) === i)
            .slice(0, 5);
        srcDirs.forEach((d) => components.push(`src/${d}`));
    }

    // Build Mermaid flowchart
    const entryNodes = entryPoints
        .map((e, i) => `    E${i}["🚪 ${e}"]`)
        .join("\n");
    const componentNodes = components
        .map((c, i) => `    C${i}["🧩 ${c}"]`)
        .join("\n");

    let connections = "";
    if (entryPoints.length > 0 && components.length > 0) {
        connections = entryPoints
            .map((_, i) => `    E${i} --> C0`)
            .join("\n");
        for (let i = 1; i < components.length; i++) {
            connections += `\n    C${i - 1} --> C${i}`;
        }
    } else if (entryPoints.length > 0) {
        connections = entryPoints
            .map((_, i) => (i < entryPoints.length - 1 ? `    E${i} --> E${i + 1}` : ""))
            .filter(Boolean)
            .join("\n");
    }

    const mermaidFlowchart = `graph TD
${entryNodes}
${componentNodes}
${connections}

    classDef entry fill:#1e1b4b,stroke:#8b5cf6,color:#fff
    classDef comp fill:#1e1b4b,stroke:#3b82f6,color:#fff
${entryPoints.map((_, i) => `    class E${i} entry`).join("\n")}
${components.map((_, i) => `    class C${i} comp`).join("\n")}`;

    return {
        mermaidFlowchart,
        components: components.length > 0 ? components : ["No distinct components detected"],
        entryPoints: entryPoints.length > 0 ? entryPoints : ["Entry point not found"],
    };
}

// Generate a structure summary
function generateStructureSummary(fileTree: RepoFileInfo[]): string {
    const dirs = fileTree.filter((f) => f.type === "dir");
    const files = fileTree.filter((f) => f.type === "file");
    const langCount = new Set(fileTree.map((f) => f.language).filter(Boolean)).size;
    const totalLines = files.reduce((acc, f) => acc + (f.size ? Math.ceil(f.size / 50) : 0), 0); // Rough estimate

    return `This repository contains approximately ${dirs.length} directories and ${files.length} tracked files across ${langCount} programming languages. Estimated size: ~${totalLines.toLocaleString()} lines of code.`;
}

// Main export function
export async function analyzeRepository(
    owner: string,
    repo: string
): Promise<{
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
}> {
    // Fetch repo metadata
    const repoMeta = await githubFetch<GitHubRepo>(`/repos/${owner}/${repo}`);

    // Fetch languages
    let languages: GitHubLanguages = {};
    try {
        languages = await githubFetch<GitHubLanguages>(`/repos/${owner}/${repo}/languages`);
    } catch {
        // Languages endpoint might fail
    }

    // Fetch tree
    const branch = repoMeta.default_branch || "main";
    const tree = await fetchRepoTree(owner, repo, branch);

    // Build file tree
    const fileTree = buildFileTree(tree);

    // Analyze tech stack
    const techStack = await analyzeTechStack(owner, repo, tree, languages);

    // Detect architecture
    const architecture = detectArchitecture(techStack, tree);

    // Generate dependency graph
    const dependencyGraph = await generateDependencyGraph(owner, repo, tree);

    // Generate component flow
    const componentFlow = generateComponentFlow(tree, techStack);

    // Fetch README
    const readme = await fetchReadme(owner, repo);

    // Generate structure summary
    const structureSummary = generateStructureSummary(fileTree);

    return {
        name: repoMeta.name,
        fullName: repoMeta.full_name,
        owner: repoMeta.owner.login,
        description: repoMeta.description || "No description provided",
        stars: repoMeta.stargazers_count,
        forks: repoMeta.forks_count,
        language: repoMeta.language,
        topics: repoMeta.topics,
        defaultBranch: branch,
        techStack,
        architecture,
        dependencyGraph,
        componentFlow,
        fileTree,
        readme,
        structureSummary,
    };
}
