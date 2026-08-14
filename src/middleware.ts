import { defineMiddleware } from "astro:middleware";

const canonicalHost = "www.techtips.fun";

export const onRequest = defineMiddleware((context, next) => {
  const hostname = context.url.hostname.toLowerCase();
  const protocol = context.request.headers.get("cf-visitor")
    ? JSON.parse(context.request.headers.get("cf-visitor") || "{}").scheme
    : context.url.protocol.replace(":", "");

  const isApexHost = hostname === "techtips.fun";
  const isWwwHost = hostname === canonicalHost;
  const isHttpRequest = protocol === "http";

  // Redirect all HTTP requests to HTTPS
  // Redirect apex domain (techtips.fun) to www (www.techtips.fun)
  if (isHttpRequest || isApexHost) {
    const canonicalUrl = new URL(context.url);
    canonicalUrl.protocol = "https:";
    canonicalUrl.hostname = canonicalHost;
    canonicalUrl.port = "";

    return Response.redirect(canonicalUrl.toString(), 301);
  }

  return next();
});
