// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_ANON_KEY;

// Add timeout to fetch to prevent indefinite locks during token refresh
function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  return fetch(input, { ...init, signal: controller.signal }).finally(() =>
    clearTimeout(timeoutId),
  );
}

let supabaseClientPromise: Promise<any> | null = null;

// Get authenticated Supabase client with timeout
export function getSupabase() {
  if (!supabaseClientPromise) {
    supabaseClientPromise = import("@supabase/supabase-js").then((mod) =>
      mod.createClient(supabaseUrl, supabaseKey, {
        global: { fetch: fetchWithTimeout },
      }),
    );
  }
  return supabaseClientPromise;
}

// Separate client for public reads without auth locks
let publicClientPromise: Promise<any> | null = null;

export function getPublicSupabase() {
  if (!publicClientPromise) {
    publicClientPromise = import("@supabase/supabase-js").then((mod) =>
      mod.createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          storageKey: "sb-public-anon",
        },
      }),
    );
  }
  return publicClientPromise;
}

export default getSupabase;

// Start client init early to avoid blocking auth calls
getSupabase();
