// supabase/functions/delete-account/index.ts
// @ts-nocheck — Deno runtime globals (Deno.serve, Deno.env) are not known to the Node TS compiler
import { createClient } from "@supabase/supabase-js";

Deno.serve(async (req: Request) => {
  const authHeader = req.headers.get("Authorization");
  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader! } } },
  );

  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { error } = await adminClient.auth.admin.deleteUser(user.id);
  if (error) return new Response(error.message, { status: 500 });

  return new Response("Deleted", { status: 200 });
});
