const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_ANON_KEY;

let supabaseClientPromise: Promise<any> | null = null;

export function getSupabase() {
  if (!supabaseClientPromise) {
    supabaseClientPromise = import("@supabase/supabase-js").then((mod) =>
      mod.createClient(supabaseUrl, supabaseKey),
    );
  }
  return supabaseClientPromise;
}

// A separate client for unauthenticated public reads (e.g. the profiles list).
// The standard client attaches an Authorization header to every PostgREST
// request by calling auth.getSession() internally, which acquires GoTrue's
// internal token-refresh lock. While that lock is held (on every page load
// with an existing session), ALL DB queries block behind it. This client has
// autoRefreshToken and persistSession disabled so it never touches the lock
// and can query public tables immediately with just the anon key.
let publicClientPromise: Promise<any> | null = null;

export function getPublicSupabase() {
  if (!publicClientPromise) {
    publicClientPromise = import("@supabase/supabase-js").then((mod) =>
      mod.createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }),
    );
  }
  return publicClientPromise;
}

export default getSupabase;
