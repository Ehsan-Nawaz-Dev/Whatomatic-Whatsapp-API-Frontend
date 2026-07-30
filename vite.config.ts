import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * Injects the Shopify API key into index.html at build time.
 *
 * App Bridge reads it from the <meta name="shopify-api-key"> tag, so it has to be
 * present in the HTML itself. Vite's built-in %VAR% substitution leaves the literal
 * placeholder in place when the variable is missing, which would ship a broken
 * embedded app - so this fails the build instead.
 */
const shopifyApiKeyPlugin = (apiKey: string, mode: string): Plugin => ({
  name: "inject-shopify-api-key",
  transformIndexHtml(html) {
    const key = apiKey || process.env.VITE_SHOPIFY_API_KEY || "";
    if (!key) {
      console.warn(
        "[vite] VITE_SHOPIFY_API_KEY is not set in build environment. App Bridge will read key at runtime."
      );
    }
    return html.replace("%VITE_SHOPIFY_API_KEY%", key);
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      shopifyApiKeyPlugin(env.VITE_SHOPIFY_API_KEY || "", mode),
      mode === "development" && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
