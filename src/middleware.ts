import { defineMiddleware } from "astro:middleware";



const canonicalHost = "www.techtips.fun";



export const onRequest = defineMiddleware((context, next) => {
  
  const hostname = context.url.hostname.toLowerCase();
  
  const forwardedProto = context.request.headers.get("x-forwarded-proto")?.toLowerCase();
  
  const isApexHost = hostname === "techtips.fun";
  
  const isHttpRequest = forwardedProto === "http";
  

  
  if (isApexHost || (hostname === canonicalHost && isHttpRequest)) {
    
    const canonicalUrl = new URL(context.url);
    
    canonicalUrl.protocol = "https:";
    
    canonicalUrl.hostname = canonicalHost;
    
    canonicalUrl.port = "";
    

    
    return Response.redirect(canonicalUrl.toString(), 301);
    
  }
  

  
  return next();
  
});

















