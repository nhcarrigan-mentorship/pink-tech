// supabase/functions/delete-account/index.ts
// @ts-nocheck — Deno runtime globals (Deno.serve, Deno.env) are not known to the Node TS compiler
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader)
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });

  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader! } } },
  );

  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user)
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });

  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Delete profile row first, then the auth user
  const { error: profileError } = await adminClient
    .from("profiles")
    .delete()
    .eq("id", user.id);
  if (profileError)
    return new Response(profileError.message, {
      status: 500,
      headers: corsHeaders,
    });

  const { error } = await adminClient.auth.admin.deleteUser(user.id);
  if (error)
    return new Response(error.message, { status: 500, headers: corsHeaders });

  return new Response("Deleted", { status: 200, headers: corsHeaders });
});
