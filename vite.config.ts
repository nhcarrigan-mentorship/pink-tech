import { defineConfig } from "vitest/config";
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
      "react-markdown",
      "remark-gfm",
      "framer-motion",
    ],
  },
  build: {
    rollupOptions: {
      output: {
        // Group large deps into separate chunks to avoid duplication and
        // prevent a single huge `vendor` chunk (avoids circular chunk edges).
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return undefined;
          // Use the last occurrence of `node_modules/` to support pnpm's
          // nested layout (node_modules/.pnpm/*/node_modules/<pkg>/...).
          const nm = "node_modules/";
          const idx = id.lastIndexOf(nm);
          if (idx === -1) return undefined;
          const parts = id.slice(idx + nm.length).split("/");
          const pkgName = parts[0].startsWith("@")
            ? `${parts[0]}/${parts[1]}`
            : parts[0];

          if (pkgName === "react" || pkgName === "react-dom")
            return "react-vendor";
          if (pkgName.startsWith("@supabase")) return "supabase-vendor";
          if (pkgName === "framer-motion") return "framer-motion-vendor";
          if (pkgName === "lucide-react") return "icons-vendor";

          return `vendor-${pkgName.replace("@", "").replace("/", "-")}`;
        },
      },
      plugins: [visualizer({ filename: "dist/stats.html", gzipSize: true })],
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
