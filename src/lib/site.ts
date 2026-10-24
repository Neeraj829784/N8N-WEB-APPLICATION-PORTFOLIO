export function getSiteConfiguration(env: NodeJS.ProcessEnv = process.env) {
  let url: URL | null = null;
  if (env.SITE_URL?.trim()) {
    try {
      const candidate = new URL(env.SITE_URL.trim());
      if (candidate.protocol === "https:" && !candidate.username && !candidate.password && candidate.pathname === "/" && !candidate.search && !candidate.hash) url = candidate;
    } catch { /* A preview never advertises a guessed production address. */ }
  }
  return { url, indexable: Boolean(url && env.SITE_INDEXABLE === "true") };
}
