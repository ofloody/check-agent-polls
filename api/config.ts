export default function handler(req: Request): Response {
  return Response.json({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    turnstileSiteKey: process.env.TURNSTILE_SITE_KEY,
  });
}

export const config = {
  runtime: "edge",
};
