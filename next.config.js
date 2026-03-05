/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "avatars.githubusercontent.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "github.com",
                pathname: "/**",
            },
        ],
    },
    async headers() {
        return [
            {
                source: "/api/trpc/:path*",
                headers: [
                    { key: "Cache-Control", value: "public, s-maxage=900, stale-while-revalidate=1800" },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
