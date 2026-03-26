// vite.config.mts
import { defineConfig } from "file:///C:/Users/eyadg/Documents/p-stream-1/node_modules/vitest/dist/config.js";
import react from "file:///C:/Users/eyadg/Documents/p-stream-1/node_modules/@vitejs/plugin-react/dist/index.js";
import loadVersion from "file:///C:/Users/eyadg/Documents/p-stream-1/node_modules/vite-plugin-package-version/dist/index.mjs";
import { VitePWA } from "file:///C:/Users/eyadg/Documents/p-stream-1/node_modules/vite-plugin-pwa/dist/index.js";
import checker from "file:///C:/Users/eyadg/Documents/p-stream-1/node_modules/vite-plugin-checker/dist/esm/main.js";
import path2 from "path";

// plugins/handlebars.ts
import { globSync } from "file:///C:/Users/eyadg/Documents/p-stream-1/node_modules/glob/dist/esm/index.js";
import { viteStaticCopy } from "file:///C:/Users/eyadg/Documents/p-stream-1/node_modules/vite-plugin-static-copy/dist/index.js";
import Handlebars from "file:///C:/Users/eyadg/Documents/p-stream-1/node_modules/handlebars/lib/index.js";
import path from "path";
var handlebars = (options = {}) => {
  const files = globSync("src/assets/**/**.hbs");
  function render(content) {
    const template = Handlebars.compile(content);
    return template(options?.vars ?? {});
  }
  return [
    {
      name: "hbs-templating",
      enforce: "pre",
      transformIndexHtml: {
        order: "pre",
        handler(html) {
          return render(html);
        }
      }
    },
    viteStaticCopy({
      silent: true,
      targets: files.map((file) => ({
        src: file,
        dest: "",
        rename: path.basename(file).slice(0, -4),
        // remove .hbs file extension
        transform: {
          encoding: "utf8",
          handler(content) {
            return render(content);
          }
        }
      }))
    })
  ];
};

// vite.config.mts
import { loadEnv, splitVendorChunkPlugin } from "file:///C:/Users/eyadg/Documents/p-stream-1/node_modules/vite/dist/node/index.js";
import { visualizer } from "file:///C:/Users/eyadg/Documents/p-stream-1/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import tailwind from "file:///C:/Users/eyadg/Documents/p-stream-1/node_modules/tailwindcss/lib/index.js";
import rtl from "file:///C:/Users/eyadg/Documents/p-stream-1/node_modules/postcss-rtlcss/esm/index.js";
var __vite_injected_original_dirname = "C:\\Users\\eyadg\\Documents\\p-stream-1";
var captioningPackages = [
  "dompurify",
  "htmlparser2",
  "subsrt-ts",
  "parse5",
  "entities",
  "fuse"
];
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    base: env.VITE_BASE_URL || "/",
    plugins: [
      handlebars({
        vars: {
          opensearchEnabled: env.VITE_OPENSEARCH_ENABLED === "true",
          routeDomain: env.VITE_APP_DOMAIN + (env.VITE_NORMAL_ROUTER !== "true" ? "/#" : ""),
          domain: env.VITE_APP_DOMAIN,
          env
        }
      }),
      react({
        babel: {
          presets: [
            "@babel/preset-typescript",
            [
              "@babel/preset-env",
              {
                modules: false,
                useBuiltIns: "entry",
                corejs: {
                  version: "3.34"
                }
              }
            ]
          ]
        }
      }),
      VitePWA({
        disable: env.VITE_PWA_ENABLED !== "true",
        registerType: "autoUpdate",
        workbox: {
          maximumFileSizeToCacheInBytes: 4e6,
          // 4mb
          globIgnores: ["!assets/**/*"]
        },
        includeAssets: [
          "favicon.ico",
          "apple-touch-icon.png",
          "safari-pinned-tab.svg"
        ],
        manifest: {
          name: "Basement",
          short_name: "Basement",
          description: "Watch your favorite shows and movies for free with no ads ever! (\u3063'\u30EE'c)",
          theme_color: "#000000",
          background_color: "#000000",
          display: "standalone",
          start_url: "/",
          icons: [
            {
              src: "android-chrome-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any"
            },
            {
              src: "android-chrome-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any"
            },
            {
              src: "android-chrome-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "maskable"
            },
            {
              src: "android-chrome-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable"
            }
          ]
        }
      }),
      loadVersion(),
      checker({
        overlay: {
          position: "tr"
        },
        typescript: true,
        // check typescript build errors in dev server
        eslint: {
          // check lint errors in dev server
          lintCommand: "eslint --ext .tsx,.ts src",
          dev: {
            logLevel: ["error"]
          }
        }
      }),
      splitVendorChunkPlugin(),
      visualizer()
    ],
    build: {
      sourcemap: mode !== "production",
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("@sozialhelden+ietf-language-tags") || id.includes("country-language")) {
              return "language-db";
            }
            if (id.includes("hls.js")) {
              return "hls";
            }
            if (id.includes("node-forge") || id.includes("crypto-js")) {
              return "auth";
            }
            if (id.includes("locales") && !id.includes("en.json")) {
              return "locales";
            }
            if (id.includes("react-dom")) {
              return "react-dom";
            }
            if (id.includes("Icon.tsx")) {
              return "Icons";
            }
            const isCaptioningPackage = captioningPackages.some(
              (packageName) => id.includes(packageName)
            );
            if (isCaptioningPackage) {
              return "caption-parsing";
            }
          }
        }
      }
    },
    css: {
      postcss: {
        plugins: [tailwind(), rtl()]
      }
    },
    resolve: {
      alias: {
        "@": path2.resolve(__vite_injected_original_dirname, "./src"),
        "@themes": path2.resolve(__vite_injected_original_dirname, "./themes"),
        "@sozialhelden/ietf-language-tags": path2.resolve(
          __vite_injected_original_dirname,
          "./node_modules/@sozialhelden/ietf-language-tags/dist/cjs"
        )
      }
    },
    test: {
      environment: "jsdom"
    },
    preview: {
      host: true,
      port: 80,
      allowedHosts: ["pstream.net", "pstream-test.vercel.app"]
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubXRzIiwgInBsdWdpbnMvaGFuZGxlYmFycy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGV5YWRnXFxcXERvY3VtZW50c1xcXFxwLXN0cmVhbS0xXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxleWFkZ1xcXFxEb2N1bWVudHNcXFxccC1zdHJlYW0tMVxcXFx2aXRlLmNvbmZpZy5tdHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL2V5YWRnL0RvY3VtZW50cy9wLXN0cmVhbS0xL3ZpdGUuY29uZmlnLm10c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlc3QvY29uZmlnXCI7XG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI7XG5pbXBvcnQgbG9hZFZlcnNpb24gZnJvbSBcInZpdGUtcGx1Z2luLXBhY2thZ2UtdmVyc2lvblwiO1xuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gXCJ2aXRlLXBsdWdpbi1wd2FcIjtcbmltcG9ydCBjaGVja2VyIGZyb20gXCJ2aXRlLXBsdWdpbi1jaGVja2VyXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgaGFuZGxlYmFycyB9IGZyb20gXCIuL3BsdWdpbnMvaGFuZGxlYmFyc1wiO1xuaW1wb3J0IHsgUGx1Z2luT3B0aW9uLCBsb2FkRW52LCBzcGxpdFZlbmRvckNodW5rUGx1Z2luIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCB7IHZpc3VhbGl6ZXIgfSBmcm9tIFwicm9sbHVwLXBsdWdpbi12aXN1YWxpemVyXCI7XG5cbmltcG9ydCB0YWlsd2luZCBmcm9tIFwidGFpbHdpbmRjc3NcIjtcbmltcG9ydCBydGwgZnJvbSBcInBvc3Rjc3MtcnRsY3NzXCI7XG5cbmNvbnN0IGNhcHRpb25pbmdQYWNrYWdlcyA9IFtcbiAgXCJkb21wdXJpZnlcIixcbiAgXCJodG1scGFyc2VyMlwiLFxuICBcInN1YnNydC10c1wiLFxuICBcInBhcnNlNVwiLFxuICBcImVudGl0aWVzXCIsXG4gIFwiZnVzZVwiLFxuXTtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCkpO1xuICByZXR1cm4ge1xuICAgIGJhc2U6IGVudi5WSVRFX0JBU0VfVVJMIHx8IFwiL1wiLFxuICAgIHBsdWdpbnM6IFtcbiAgICAgIGhhbmRsZWJhcnMoe1xuICAgICAgICB2YXJzOiB7XG4gICAgICAgICAgb3BlbnNlYXJjaEVuYWJsZWQ6IGVudi5WSVRFX09QRU5TRUFSQ0hfRU5BQkxFRCA9PT0gXCJ0cnVlXCIsXG4gICAgICAgICAgcm91dGVEb21haW46XG4gICAgICAgICAgICBlbnYuVklURV9BUFBfRE9NQUlOICtcbiAgICAgICAgICAgIChlbnYuVklURV9OT1JNQUxfUk9VVEVSICE9PSBcInRydWVcIiA/IFwiLyNcIiA6IFwiXCIpLFxuICAgICAgICAgIGRvbWFpbjogZW52LlZJVEVfQVBQX0RPTUFJTixcbiAgICAgICAgICBlbnYsXG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICAgIHJlYWN0KHtcbiAgICAgICAgYmFiZWw6IHtcbiAgICAgICAgICBwcmVzZXRzOiBbXG4gICAgICAgICAgICBcIkBiYWJlbC9wcmVzZXQtdHlwZXNjcmlwdFwiLFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICBcIkBiYWJlbC9wcmVzZXQtZW52XCIsXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBtb2R1bGVzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB1c2VCdWlsdEluczogXCJlbnRyeVwiLFxuICAgICAgICAgICAgICAgIGNvcmVqczoge1xuICAgICAgICAgICAgICAgICAgdmVyc2lvbjogXCIzLjM0XCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgICAgVml0ZVBXQSh7XG4gICAgICAgIGRpc2FibGU6IGVudi5WSVRFX1BXQV9FTkFCTEVEICE9PSBcInRydWVcIixcbiAgICAgICAgcmVnaXN0ZXJUeXBlOiBcImF1dG9VcGRhdGVcIixcbiAgICAgICAgd29ya2JveDoge1xuICAgICAgICAgIG1heGltdW1GaWxlU2l6ZVRvQ2FjaGVJbkJ5dGVzOiA0MDAwMDAwLCAvLyA0bWJcbiAgICAgICAgICBnbG9iSWdub3JlczogW1wiIWFzc2V0cy8qKi8qXCJdLFxuICAgICAgICB9LFxuICAgICAgICBpbmNsdWRlQXNzZXRzOiBbXG4gICAgICAgICAgXCJmYXZpY29uLmljb1wiLFxuICAgICAgICAgIFwiYXBwbGUtdG91Y2gtaWNvbi5wbmdcIixcbiAgICAgICAgICBcInNhZmFyaS1waW5uZWQtdGFiLnN2Z1wiLFxuICAgICAgICBdLFxuICAgICAgICBtYW5pZmVzdDoge1xuICAgICAgICAgIG5hbWU6IFwiQmFzZW1lbnRcIixcbiAgICAgICAgICBzaG9ydF9uYW1lOiBcIkJhc2VtZW50XCIsXG4gICAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgICBcIldhdGNoIHlvdXIgZmF2b3JpdGUgc2hvd3MgYW5kIG1vdmllcyBmb3IgZnJlZSB3aXRoIG5vIGFkcyBldmVyISAoXHUzMDYzJ1x1MzBFRSdjKVwiLFxuICAgICAgICAgIHRoZW1lX2NvbG9yOiBcIiMwMDAwMDBcIixcbiAgICAgICAgICBiYWNrZ3JvdW5kX2NvbG9yOiBcIiMwMDAwMDBcIixcbiAgICAgICAgICBkaXNwbGF5OiBcInN0YW5kYWxvbmVcIixcbiAgICAgICAgICBzdGFydF91cmw6IFwiL1wiLFxuICAgICAgICAgIGljb25zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHNyYzogXCJhbmRyb2lkLWNocm9tZS0xOTJ4MTkyLnBuZ1wiLFxuICAgICAgICAgICAgICBzaXplczogXCIxOTJ4MTkyXCIsXG4gICAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvcG5nXCIsXG4gICAgICAgICAgICAgIHB1cnBvc2U6IFwiYW55XCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBzcmM6IFwiYW5kcm9pZC1jaHJvbWUtNTEyeDUxMi5wbmdcIixcbiAgICAgICAgICAgICAgc2l6ZXM6IFwiNTEyeDUxMlwiLFxuICAgICAgICAgICAgICB0eXBlOiBcImltYWdlL3BuZ1wiLFxuICAgICAgICAgICAgICBwdXJwb3NlOiBcImFueVwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgc3JjOiBcImFuZHJvaWQtY2hyb21lLTE5MngxOTIucG5nXCIsXG4gICAgICAgICAgICAgIHNpemVzOiBcIjE5MngxOTJcIixcbiAgICAgICAgICAgICAgdHlwZTogXCJpbWFnZS9wbmdcIixcbiAgICAgICAgICAgICAgcHVycG9zZTogXCJtYXNrYWJsZVwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgc3JjOiBcImFuZHJvaWQtY2hyb21lLTUxMng1MTIucG5nXCIsXG4gICAgICAgICAgICAgIHNpemVzOiBcIjUxMng1MTJcIixcbiAgICAgICAgICAgICAgdHlwZTogXCJpbWFnZS9wbmdcIixcbiAgICAgICAgICAgICAgcHVycG9zZTogXCJtYXNrYWJsZVwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgICBsb2FkVmVyc2lvbigpLFxuICAgICAgY2hlY2tlcih7XG4gICAgICAgIG92ZXJsYXk6IHtcbiAgICAgICAgICBwb3NpdGlvbjogXCJ0clwiLFxuICAgICAgICB9LFxuICAgICAgICB0eXBlc2NyaXB0OiB0cnVlLCAvLyBjaGVjayB0eXBlc2NyaXB0IGJ1aWxkIGVycm9ycyBpbiBkZXYgc2VydmVyXG4gICAgICAgIGVzbGludDoge1xuICAgICAgICAgIC8vIGNoZWNrIGxpbnQgZXJyb3JzIGluIGRldiBzZXJ2ZXJcbiAgICAgICAgICBsaW50Q29tbWFuZDogXCJlc2xpbnQgLS1leHQgLnRzeCwudHMgc3JjXCIsXG4gICAgICAgICAgZGV2OiB7XG4gICAgICAgICAgICBsb2dMZXZlbDogW1wiZXJyb3JcIl0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgICAgc3BsaXRWZW5kb3JDaHVua1BsdWdpbigpLFxuICAgICAgdmlzdWFsaXplcigpIGFzIFBsdWdpbk9wdGlvbixcbiAgICBdLFxuXG4gICAgYnVpbGQ6IHtcbiAgICAgIHNvdXJjZW1hcDogbW9kZSAhPT0gXCJwcm9kdWN0aW9uXCIsXG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIG91dHB1dDoge1xuICAgICAgICAgIG1hbnVhbENodW5rcyhpZDogc3RyaW5nKSB7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwiQHNvemlhbGhlbGRlbitpZXRmLWxhbmd1YWdlLXRhZ3NcIikgfHxcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoXCJjb3VudHJ5LWxhbmd1YWdlXCIpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwibGFuZ3VhZ2UtZGJcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcImhscy5qc1wiKSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCJobHNcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcIm5vZGUtZm9yZ2VcIikgfHwgaWQuaW5jbHVkZXMoXCJjcnlwdG8tanNcIikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwiYXV0aFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwibG9jYWxlc1wiKSAmJiAhaWQuaW5jbHVkZXMoXCJlbi5qc29uXCIpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBcImxvY2FsZXNcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcInJlYWN0LWRvbVwiKSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCJyZWFjdC1kb21cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcIkljb24udHN4XCIpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBcIkljb25zXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBpc0NhcHRpb25pbmdQYWNrYWdlID0gY2FwdGlvbmluZ1BhY2thZ2VzLnNvbWUoKHBhY2thZ2VOYW1lKSA9PlxuICAgICAgICAgICAgICBpZC5pbmNsdWRlcyhwYWNrYWdlTmFtZSksXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKGlzQ2FwdGlvbmluZ1BhY2thZ2UpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwiY2FwdGlvbi1wYXJzaW5nXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBjc3M6IHtcbiAgICAgIHBvc3Rjc3M6IHtcbiAgICAgICAgcGx1Z2luczogW3RhaWx3aW5kKCksIHJ0bCgpXSxcbiAgICAgIH0sXG4gICAgfSxcblxuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzOiB7XG4gICAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgICAgICBcIkB0aGVtZXNcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3RoZW1lc1wiKSxcbiAgICAgICAgXCJAc296aWFsaGVsZGVuL2lldGYtbGFuZ3VhZ2UtdGFnc1wiOiBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgX19kaXJuYW1lLFxuICAgICAgICAgIFwiLi9ub2RlX21vZHVsZXMvQHNvemlhbGhlbGRlbi9pZXRmLWxhbmd1YWdlLXRhZ3MvZGlzdC9janNcIixcbiAgICAgICAgKSxcbiAgICAgIH0sXG4gICAgfSxcblxuICAgIHRlc3Q6IHtcbiAgICAgIGVudmlyb25tZW50OiBcImpzZG9tXCIsXG4gICAgfSxcbiAgICBwcmV2aWV3OiB7XG4gICAgICBob3N0OiB0cnVlLFxuICAgICAgcG9ydDogODAsXG4gICAgICBhbGxvd2VkSG9zdHM6IFtcInBzdHJlYW0ubmV0XCIsIFwicHN0cmVhbS10ZXN0LnZlcmNlbC5hcHBcIl0sXG4gICAgfSxcbiAgfTtcbn0pO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxleWFkZ1xcXFxEb2N1bWVudHNcXFxccC1zdHJlYW0tMVxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxleWFkZ1xcXFxEb2N1bWVudHNcXFxccC1zdHJlYW0tMVxcXFxwbHVnaW5zXFxcXGhhbmRsZWJhcnMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL2V5YWRnL0RvY3VtZW50cy9wLXN0cmVhbS0xL3BsdWdpbnMvaGFuZGxlYmFycy50c1wiO2ltcG9ydCB7IGdsb2JTeW5jIH0gZnJvbSBcImdsb2JcIjtcbmltcG9ydCB7IHZpdGVTdGF0aWNDb3B5IH0gZnJvbSBcInZpdGUtcGx1Z2luLXN0YXRpYy1jb3B5XCI7XG5pbXBvcnQgeyBQbHVnaW5PcHRpb24gfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IEhhbmRsZWJhcnMgZnJvbSBcImhhbmRsZWJhcnNcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5cbmV4cG9ydCBjb25zdCBoYW5kbGViYXJzID0gKFxuICBvcHRpb25zOiB7IHZhcnM/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+IH0gPSB7fSxcbik6IFBsdWdpbk9wdGlvbltdID0+IHtcbiAgY29uc3QgZmlsZXMgPSBnbG9iU3luYyhcInNyYy9hc3NldHMvKiovKiouaGJzXCIpO1xuXG4gIGZ1bmN0aW9uIHJlbmRlcihjb250ZW50OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IHRlbXBsYXRlID0gSGFuZGxlYmFycy5jb21waWxlKGNvbnRlbnQpO1xuICAgIHJldHVybiB0ZW1wbGF0ZShvcHRpb25zPy52YXJzID8/IHt9KTtcbiAgfVxuXG4gIHJldHVybiBbXG4gICAge1xuICAgICAgbmFtZTogXCJoYnMtdGVtcGxhdGluZ1wiLFxuICAgICAgZW5mb3JjZTogXCJwcmVcIixcbiAgICAgIHRyYW5zZm9ybUluZGV4SHRtbDoge1xuICAgICAgICBvcmRlcjogXCJwcmVcIixcbiAgICAgICAgaGFuZGxlcihodG1sKSB7XG4gICAgICAgICAgcmV0dXJuIHJlbmRlcihodG1sKTtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICB2aXRlU3RhdGljQ29weSh7XG4gICAgICBzaWxlbnQ6IHRydWUsXG4gICAgICB0YXJnZXRzOiBmaWxlcy5tYXAoKGZpbGUpID0+ICh7XG4gICAgICAgIHNyYzogZmlsZSxcbiAgICAgICAgZGVzdDogXCJcIixcbiAgICAgICAgcmVuYW1lOiBwYXRoLmJhc2VuYW1lKGZpbGUpLnNsaWNlKDAsIC00KSwgLy8gcmVtb3ZlIC5oYnMgZmlsZSBleHRlbnNpb25cbiAgICAgICAgdHJhbnNmb3JtOiB7XG4gICAgICAgICAgZW5jb2Rpbmc6IFwidXRmOFwiLFxuICAgICAgICAgIGhhbmRsZXIoY29udGVudDogc3RyaW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVuZGVyKGNvbnRlbnQpO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9KSks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
