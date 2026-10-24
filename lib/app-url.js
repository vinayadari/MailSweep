/**
 * Resolve the canonical app URL for OAuth callbacks and app redirects.
 * A local .env value should never send a Vercel production deployment to localhost.
 */
export function getAppBaseUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "");
  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const isProductionDeployment =
    process.env.VERCEL_ENV === "production" ||
    (process.env.NODE_ENV === "production" && Boolean(productionHost));

  if (isProductionDeployment && productionHost) {
    let configuredIsLocal = false;
    if (configuredUrl) {
      try {
        const hostname = new URL(configuredUrl).hostname.toLowerCase();
        configuredIsLocal = hostname === "localhost" || hostname === "127.0.0.1";
      } catch {
        // An invalid configured URL falls through to Vercel's production domain.
        configuredIsLocal = true;
      }
    }

    if (!configuredUrl || configuredIsLocal) {
      return `https://${productionHost}`;
    }
  }

  if (configuredUrl) return configuredUrl;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
