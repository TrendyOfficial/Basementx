// vite.config.mts
import { defineConfig } from "file:///D:/Basement%20Project/Basement/node_modules/vitest/dist/config.js";
import react from "file:///D:/Basement%20Project/Basement/node_modules/@vitejs/plugin-react/dist/index.js";
import loadVersion from "file:///D:/Basement%20Project/Basement/node_modules/vite-plugin-package-version/dist/index.mjs";
import { VitePWA } from "file:///D:/Basement%20Project/Basement/node_modules/vite-plugin-pwa/dist/index.js";
import checker from "file:///D:/Basement%20Project/Basement/node_modules/vite-plugin-checker/dist/esm/main.js";
import path2 from "path";

// plugins/handlebars.ts
import { globSync } from "file:///D:/Basement%20Project/Basement/node_modules/glob/dist/esm/index.js";
import { viteStaticCopy } from "file:///D:/Basement%20Project/Basement/node_modules/vite-plugin-static-copy/dist/index.js";
import Handlebars from "file:///D:/Basement%20Project/Basement/node_modules/handlebars/lib/index.js";
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
import { loadEnv, splitVendorChunkPlugin } from "file:///D:/Basement%20Project/Basement/node_modules/vite/dist/node/index.js";
import { visualizer } from "file:///D:/Basement%20Project/Basement/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import tailwind from "file:///D:/Basement%20Project/Basement/node_modules/tailwindcss/lib/index.js";
import rtl from "file:///D:/Basement%20Project/Basement/node_modules/postcss-rtlcss/esm/index.js";
var __vite_injected_original_dirname = "D:\\Basement Project\\Basement";
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
          description: "Watch anything you want \u2014 totally free, no ads forever! (\u2267\u25E1\u2266)",
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
      allowedHosts: ["basementx.vercel.app, basementx.me"]
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubXRzIiwgInBsdWdpbnMvaGFuZGxlYmFycy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXEJhc2VtZW50IFByb2plY3RcXFxcQmFzZW1lbnRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXEJhc2VtZW50IFByb2plY3RcXFxcQmFzZW1lbnRcXFxcdml0ZS5jb25maWcubXRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9CYXNlbWVudCUyMFByb2plY3QvQmFzZW1lbnQvdml0ZS5jb25maWcubXRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVzdC9jb25maWdcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCBsb2FkVmVyc2lvbiBmcm9tIFwidml0ZS1wbHVnaW4tcGFja2FnZS12ZXJzaW9uXCI7XG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSBcInZpdGUtcGx1Z2luLXB3YVwiO1xuaW1wb3J0IGNoZWNrZXIgZnJvbSBcInZpdGUtcGx1Z2luLWNoZWNrZXJcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBoYW5kbGViYXJzIH0gZnJvbSBcIi4vcGx1Z2lucy9oYW5kbGViYXJzXCI7XG5pbXBvcnQgeyBQbHVnaW5PcHRpb24sIGxvYWRFbnYsIHNwbGl0VmVuZG9yQ2h1bmtQbHVnaW4gfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHsgdmlzdWFsaXplciB9IGZyb20gXCJyb2xsdXAtcGx1Z2luLXZpc3VhbGl6ZXJcIjtcblxuaW1wb3J0IHRhaWx3aW5kIGZyb20gXCJ0YWlsd2luZGNzc1wiO1xuaW1wb3J0IHJ0bCBmcm9tIFwicG9zdGNzcy1ydGxjc3NcIjtcblxuY29uc3QgY2FwdGlvbmluZ1BhY2thZ2VzID0gW1xuICBcImRvbXB1cmlmeVwiLFxuICBcImh0bWxwYXJzZXIyXCIsXG4gIFwic3Vic3J0LXRzXCIsXG4gIFwicGFyc2U1XCIsXG4gIFwiZW50aXRpZXNcIixcbiAgXCJmdXNlXCIsXG5dO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSk7XG4gIHJldHVybiB7XG4gICAgYmFzZTogZW52LlZJVEVfQkFTRV9VUkwgfHwgXCIvXCIsXG4gICAgcGx1Z2luczogW1xuICAgICAgaGFuZGxlYmFycyh7XG4gICAgICAgIHZhcnM6IHtcbiAgICAgICAgICBvcGVuc2VhcmNoRW5hYmxlZDogZW52LlZJVEVfT1BFTlNFQVJDSF9FTkFCTEVEID09PSBcInRydWVcIixcbiAgICAgICAgICByb3V0ZURvbWFpbjpcbiAgICAgICAgICAgIGVudi5WSVRFX0FQUF9ET01BSU4gK1xuICAgICAgICAgICAgKGVudi5WSVRFX05PUk1BTF9ST1VURVIgIT09IFwidHJ1ZVwiID8gXCIvI1wiIDogXCJcIiksXG4gICAgICAgICAgZG9tYWluOiBlbnYuVklURV9BUFBfRE9NQUlOLFxuICAgICAgICAgIGVudixcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgICAgcmVhY3Qoe1xuICAgICAgICBiYWJlbDoge1xuICAgICAgICAgIHByZXNldHM6IFtcbiAgICAgICAgICAgIFwiQGJhYmVsL3ByZXNldC10eXBlc2NyaXB0XCIsXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgIFwiQGJhYmVsL3ByZXNldC1lbnZcIixcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG1vZHVsZXM6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHVzZUJ1aWx0SW5zOiBcImVudHJ5XCIsXG4gICAgICAgICAgICAgICAgY29yZWpzOiB7XG4gICAgICAgICAgICAgICAgICB2ZXJzaW9uOiBcIjMuMzRcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgICBWaXRlUFdBKHtcbiAgICAgICAgZGlzYWJsZTogZW52LlZJVEVfUFdBX0VOQUJMRUQgIT09IFwidHJ1ZVwiLFxuICAgICAgICByZWdpc3RlclR5cGU6IFwiYXV0b1VwZGF0ZVwiLFxuICAgICAgICB3b3JrYm94OiB7XG4gICAgICAgICAgbWF4aW11bUZpbGVTaXplVG9DYWNoZUluQnl0ZXM6IDQwMDAwMDAsIC8vIDRtYlxuICAgICAgICAgIGdsb2JJZ25vcmVzOiBbXCIhYXNzZXRzLyoqLypcIl0sXG4gICAgICAgIH0sXG4gICAgICAgIGluY2x1ZGVBc3NldHM6IFtcbiAgICAgICAgICBcImZhdmljb24uaWNvXCIsXG4gICAgICAgICAgXCJhcHBsZS10b3VjaC1pY29uLnBuZ1wiLFxuICAgICAgICAgIFwic2FmYXJpLXBpbm5lZC10YWIuc3ZnXCIsXG4gICAgICAgIF0sXG4gICAgICAgIG1hbmlmZXN0OiB7XG4gICAgICAgICAgbmFtZTogXCJCYXNlbWVudFwiLFxuICAgICAgICAgIHNob3J0X25hbWU6IFwiQmFzZW1lbnRcIixcbiAgICAgICAgICBkZXNjcmlwdGlvbjogXCJXYXRjaCBhbnl0aGluZyB5b3Ugd2FudCBcdTIwMTQgdG90YWxseSBmcmVlLCBubyBhZHMgZm9yZXZlciEgKFx1MjI2N1x1MjVFMVx1MjI2NilcIixcbiAgICAgICAgICB0aGVtZV9jb2xvcjogXCIjMDAwMDAwXCIsXG4gICAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogXCIjMDAwMDAwXCIsXG4gICAgICAgICAgZGlzcGxheTogXCJzdGFuZGFsb25lXCIsXG4gICAgICAgICAgc3RhcnRfdXJsOiBcIi9cIixcbiAgICAgICAgICBpY29uczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBzcmM6IFwiYW5kcm9pZC1jaHJvbWUtMTkyeDE5Mi5wbmdcIixcbiAgICAgICAgICAgICAgc2l6ZXM6IFwiMTkyeDE5MlwiLFxuICAgICAgICAgICAgICB0eXBlOiBcImltYWdlL3BuZ1wiLFxuICAgICAgICAgICAgICBwdXJwb3NlOiBcImFueVwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgc3JjOiBcImFuZHJvaWQtY2hyb21lLTUxMng1MTIucG5nXCIsXG4gICAgICAgICAgICAgIHNpemVzOiBcIjUxMng1MTJcIixcbiAgICAgICAgICAgICAgdHlwZTogXCJpbWFnZS9wbmdcIixcbiAgICAgICAgICAgICAgcHVycG9zZTogXCJhbnlcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHNyYzogXCJhbmRyb2lkLWNocm9tZS0xOTJ4MTkyLnBuZ1wiLFxuICAgICAgICAgICAgICBzaXplczogXCIxOTJ4MTkyXCIsXG4gICAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvcG5nXCIsXG4gICAgICAgICAgICAgIHB1cnBvc2U6IFwibWFza2FibGVcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHNyYzogXCJhbmRyb2lkLWNocm9tZS01MTJ4NTEyLnBuZ1wiLFxuICAgICAgICAgICAgICBzaXplczogXCI1MTJ4NTEyXCIsXG4gICAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvcG5nXCIsXG4gICAgICAgICAgICAgIHB1cnBvc2U6IFwibWFza2FibGVcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgICAgbG9hZFZlcnNpb24oKSxcbiAgICAgIGNoZWNrZXIoe1xuICAgICAgICBvdmVybGF5OiB7XG4gICAgICAgICAgcG9zaXRpb246IFwidHJcIixcbiAgICAgICAgfSxcbiAgICAgICAgdHlwZXNjcmlwdDogdHJ1ZSwgLy8gY2hlY2sgdHlwZXNjcmlwdCBidWlsZCBlcnJvcnMgaW4gZGV2IHNlcnZlclxuICAgICAgICBlc2xpbnQ6IHtcbiAgICAgICAgICAvLyBjaGVjayBsaW50IGVycm9ycyBpbiBkZXYgc2VydmVyXG4gICAgICAgICAgbGludENvbW1hbmQ6IFwiZXNsaW50IC0tZXh0IC50c3gsLnRzIHNyY1wiLFxuICAgICAgICAgIGRldjoge1xuICAgICAgICAgICAgbG9nTGV2ZWw6IFtcImVycm9yXCJdLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICAgIHNwbGl0VmVuZG9yQ2h1bmtQbHVnaW4oKSxcbiAgICAgIHZpc3VhbGl6ZXIoKSBhcyBQbHVnaW5PcHRpb24sXG4gICAgXSxcblxuICAgIGJ1aWxkOiB7XG4gICAgICBzb3VyY2VtYXA6IG1vZGUgIT09IFwicHJvZHVjdGlvblwiLFxuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICBvdXRwdXQ6IHtcbiAgICAgICAgICBtYW51YWxDaHVua3MoaWQ6IHN0cmluZykge1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICBpZC5pbmNsdWRlcyhcIkBzb3ppYWxoZWxkZW4raWV0Zi1sYW5ndWFnZS10YWdzXCIpIHx8XG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwiY291bnRyeS1sYW5ndWFnZVwiKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIHJldHVybiBcImxhbmd1YWdlLWRiXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJobHMuanNcIikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwiaGxzXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJub2RlLWZvcmdlXCIpIHx8IGlkLmluY2x1ZGVzKFwiY3J5cHRvLWpzXCIpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBcImF1dGhcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcImxvY2FsZXNcIikgJiYgIWlkLmluY2x1ZGVzKFwiZW4uanNvblwiKSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCJsb2NhbGVzXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJyZWFjdC1kb21cIikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFwicmVhY3QtZG9tXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJJY29uLnRzeFwiKSkge1xuICAgICAgICAgICAgICByZXR1cm4gXCJJY29uc1wiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgaXNDYXB0aW9uaW5nUGFja2FnZSA9IGNhcHRpb25pbmdQYWNrYWdlcy5zb21lKChwYWNrYWdlTmFtZSkgPT5cbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMocGFja2FnZU5hbWUpLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGlmIChpc0NhcHRpb25pbmdQYWNrYWdlKSB7XG4gICAgICAgICAgICAgIHJldHVybiBcImNhcHRpb24tcGFyc2luZ1wiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgY3NzOiB7XG4gICAgICBwb3N0Y3NzOiB7XG4gICAgICAgIHBsdWdpbnM6IFt0YWlsd2luZCgpLCBydGwoKV0sXG4gICAgICB9LFxuICAgIH0sXG5cbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczoge1xuICAgICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICAgICAgXCJAdGhlbWVzXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi90aGVtZXNcIiksXG4gICAgICAgIFwiQHNvemlhbGhlbGRlbi9pZXRmLWxhbmd1YWdlLXRhZ3NcIjogcGF0aC5yZXNvbHZlKFxuICAgICAgICAgIF9fZGlybmFtZSxcbiAgICAgICAgICBcIi4vbm9kZV9tb2R1bGVzL0Bzb3ppYWxoZWxkZW4vaWV0Zi1sYW5ndWFnZS10YWdzL2Rpc3QvY2pzXCIsXG4gICAgICAgICksXG4gICAgICB9LFxuICAgIH0sXG5cbiAgICB0ZXN0OiB7XG4gICAgICBlbnZpcm9ubWVudDogXCJqc2RvbVwiLFxuICAgIH0sXG4gICAgcHJldmlldzoge1xuICAgICAgaG9zdDogdHJ1ZSxcbiAgICAgIHBvcnQ6IDgwLFxuICAgICAgYWxsb3dlZEhvc3RzOiBbXCJiYXNlbWVudHgudmVyY2VsLmFwcCwgYmFzZW1lbnR4Lm1lXCJdLFxuICAgIH0sXG4gIH07XG59KTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcQmFzZW1lbnQgUHJvamVjdFxcXFxCYXNlbWVudFxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxCYXNlbWVudCBQcm9qZWN0XFxcXEJhc2VtZW50XFxcXHBsdWdpbnNcXFxcaGFuZGxlYmFycy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovQmFzZW1lbnQlMjBQcm9qZWN0L0Jhc2VtZW50L3BsdWdpbnMvaGFuZGxlYmFycy50c1wiO2ltcG9ydCB7IGdsb2JTeW5jIH0gZnJvbSBcImdsb2JcIjtcbmltcG9ydCB7IHZpdGVTdGF0aWNDb3B5IH0gZnJvbSBcInZpdGUtcGx1Z2luLXN0YXRpYy1jb3B5XCI7XG5pbXBvcnQgeyBQbHVnaW5PcHRpb24gfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IEhhbmRsZWJhcnMgZnJvbSBcImhhbmRsZWJhcnNcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5cbmV4cG9ydCBjb25zdCBoYW5kbGViYXJzID0gKFxuICBvcHRpb25zOiB7IHZhcnM/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+IH0gPSB7fSxcbik6IFBsdWdpbk9wdGlvbltdID0+IHtcbiAgY29uc3QgZmlsZXMgPSBnbG9iU3luYyhcInNyYy9hc3NldHMvKiovKiouaGJzXCIpO1xuXG4gIGZ1bmN0aW9uIHJlbmRlcihjb250ZW50OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IHRlbXBsYXRlID0gSGFuZGxlYmFycy5jb21waWxlKGNvbnRlbnQpO1xuICAgIHJldHVybiB0ZW1wbGF0ZShvcHRpb25zPy52YXJzID8/IHt9KTtcbiAgfVxuXG4gIHJldHVybiBbXG4gICAge1xuICAgICAgbmFtZTogXCJoYnMtdGVtcGxhdGluZ1wiLFxuICAgICAgZW5mb3JjZTogXCJwcmVcIixcbiAgICAgIHRyYW5zZm9ybUluZGV4SHRtbDoge1xuICAgICAgICBvcmRlcjogXCJwcmVcIixcbiAgICAgICAgaGFuZGxlcihodG1sKSB7XG4gICAgICAgICAgcmV0dXJuIHJlbmRlcihodG1sKTtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICB2aXRlU3RhdGljQ29weSh7XG4gICAgICBzaWxlbnQ6IHRydWUsXG4gICAgICB0YXJnZXRzOiBmaWxlcy5tYXAoKGZpbGUpID0+ICh7XG4gICAgICAgIHNyYzogZmlsZSxcbiAgICAgICAgZGVzdDogXCJcIixcbiAgICAgICAgcmVuYW1lOiBwYXRoLmJhc2VuYW1lKGZpbGUpLnNsaWNlKDAsIC00KSwgLy8gcmVtb3ZlIC5oYnMgZmlsZSBleHRlbnNpb25cbiAgICAgICAgdHJhbnNmb3JtOiB7XG4gICAgICAgICAgZW5jb2Rpbmc6IFwidXRmOFwiLFxuICAgICAgICAgIGhhbmRsZXIoY29udGVudDogc3RyaW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVuZGVyKGNvbnRlbnQpO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9KSksXG4gICAgfSksXG4gIF07XG59O1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFnUixTQUFTLG9CQUFvQjtBQUM3UyxPQUFPLFdBQVc7QUFDbEIs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
