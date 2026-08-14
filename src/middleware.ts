import { defineMiddleware } from "astro:middleware";

const canonicalHost = "www.techtips.fun";
const apexHost = "techtips.fun";

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
