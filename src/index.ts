import { serve } from "bun";
import index from "./index.html";

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/config": {
      GET() {
        return Response.json({
          supabaseUrl: process.env.SUPABASE_URL,
          supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
        });
      },
    },
  },

  development: process.env.VERCEL_ENV !== "" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
