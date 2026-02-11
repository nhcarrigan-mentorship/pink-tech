import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Avoid duplicate React copies and ensure singletons
    dedupe: ["react", "react-dom"],
    alias: {
      // ensure imports resolve to the same react instance if needed
      // (adjust only if you have multiple workspaces)
      // 'react': path.resolve(__dirname, 'node_modules/react')
    },
  },
  optimizeDeps: {
    // Pre-bundle heavy deps so they aren't duplicated in multiple chunks
    include: [
      "@supabase/supabase-js",
      "@supabase/auth-js",
      "@supabase/realtime-js",
      "@supabase/storage-js",
      "framer-motion",
    ],
  },
  build: {
    rollupOptions: {
      output: {
        // Group large deps into separate chunks to avoid duplication
        manualChunks(id: string) {
          if (id.includes("node_modules/@supabase")) return "supabase-vendor";
          if (id.includes("node_modules/framer-motion"))
            return "framer-motion-vendor";
          if (id.includes("node_modules/react")) return "react-vendor";
          if (id.includes("node_modules")) return "vendor";
        },
      },
      plugins: [visualizer({ filename: "dist/stats.html", gzipSize: true })],
    },
  },
});
