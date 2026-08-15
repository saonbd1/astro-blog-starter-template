import { defineMiddleware } from "astro:middleware";

const canonicalHost = "www.techtips.fun";
const apexHost = "techtips.fun";
const legacyArticleRedirects = new Map([
  ["/2026/07/get-rid-of-all-kinds-of-pre-installed.html", "/blog/simple-tips-to-solve-your-pc-startup-and-shutdown-problems/"],
  ["/2026/07/self-hosting-your-first-web-app-no.html", "/blog/self-hosting-your-first-web-app-no/"],
  ["/2026/07/i-tested-6-ai-coding-assistants-so-you.html", "/blog/i-tested-6-ai-coding-assistants-so-you/"],
]);

function getRequestProtocol(request: Request, fallback: string) {
  const visitorHeader = request.headers.get("cf-visitor");
  if (visitorHeader) {
    try {
      const visitor = JSON.parse(visitorHeader) as { scheme?: string };
      if (visitor.scheme === "http" || visitor.scheme === "https") {
        return visitor.scheme;
      }
    } catch {
      // Fall back to the URL protocol when the Cloudflare header is invalid.
    }
  }
  return fallback.replace(":", "");
}

export const onRequest = defineMiddleware((context, next) => {
  const legacyTarget = legacyArticleRedirects.get(context.url.pathname);
  if (legacyTarget) {
    const targetUrl = new URL(legacyTarget, context.url.origin);
    return Response.redirect(targetUrl.toString(), 301);
  }

  const hostname = context.url.hostname.toLowerCase();
  const protocol = getRequestProtocol(context.request, context.url.protocol);
  const shouldRedirect = protocol === "http" || hostname === apexHost;
  if (shouldRedirect) {
    const canonicalUrl = new URL(context.url);
    canonicalUrl.protocol = "https:";
    canonicalUrl.hostname = canonicalHost;
    canonicalUrl.port = "";
    return Response.redirect(canonicalUrl.toString(), 301);
  }
  return next();
});
