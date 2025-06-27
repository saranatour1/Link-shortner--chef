import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Handle short link redirects
http.route({
  path: "/r/{shortCode}",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const shortCode = url.pathname.split('/').pop();
    
    if (!shortCode) {
      return new Response("Invalid short code", { status: 400 });
    }

    const link = await ctx.runQuery(api.links.getLinkByShortCode, {
      shortCode,
    });

    if (!link) {
      return new Response("Link not found", { status: 404 });
    }

    // Increment click count
    await ctx.runMutation(api.links.incrementClicks, {
      linkId: link._id,
    });

    // Redirect to original URL
    return new Response(null, {
      status: 302,
      headers: {
        Location: link.originalUrl,
      },
    });
  }),
});

export default http;
