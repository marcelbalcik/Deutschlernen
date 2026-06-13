/** @type {import('next').NextConfig} */

// Static export is enabled only when BUILD_TARGET=pages so that local
// `next dev` / `next start` keep working normally. The GitHub Pages workflow
// sets BUILD_TARGET=pages and NEXT_PUBLIC_BASE_PATH=/<repo>.
const isPages = process.env.BUILD_TARGET === "pages";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig = {
  reactStrictMode: true,
  // We use plain <img>, so unoptimized is harmless and required for export.
  images: { unoptimized: true },
  ...(isPages
    ? {
        output: "export",
        basePath: basePath || undefined,
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
