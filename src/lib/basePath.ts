// When deployed to GitHub Pages under a project subpath (e.g. /Deutschlernen),
// the app lives at https://user.github.io/<repo>/. Next.js auto-prefixes
// next/link and the framework's own assets with `basePath`, but NOT plain
// <img src> / new Audio(url) / fetch() to files in /public. This helper prefixes
// those absolute paths so they resolve under the subpath. When BASE_PATH is
// empty (local dev, Vercel/Netlify at root) it's a no-op.

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix an absolute ("/...") public path with the deployment base path. */
export function withBasePath(path: string): string {
  if (!path.startsWith("/")) return path; // already absolute URL or relative
  return `${BASE_PATH}${path}`;
}
