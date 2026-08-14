import { defineMiddleware } from "astro:middleware";



const canonicalHost = "www.techtips.fun";



export const onRequest = defineMiddleware((context, next) => {
  
  const hostname = context.url.hostname.toLowerCase();
  
  const tlsVersion = context.request.cf?.tlsVersion;
  
  const isApexHost = hostname === "techtips.fun";
  
  const isHttpRequest = !tlsVersion;
  

  
  if (isApexHost || (hostname === canonicalHost && isHttpRequest)) {
    
    const canonicalUrl = new URL(context.url);
    
    canonicalUrl.protocol = "https:";
    
    canonicalUrl.hostname = canonicalHost;
    
    canonicalUrl.port = "";
    

    
    return Response.redirect(canonicalUrl.toString(), 301);
    
  }
  

  
  return next();
  
});

















