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

export default getSupabase;
