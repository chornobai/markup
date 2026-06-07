// vite.config.js
import { defineConfig } from "vite";
import handlebars from "vite-plugin-handlebars";
import { resolve } from "path";
import fs from "fs";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";

function getHtmlInputs() {
  const inputs = { index: resolve(__dirname, "index.html") };
  const pagesDir = resolve(__dirname, "src/pages");
  if (fs.existsSync(pagesDir)) {
    for (const file of fs.readdirSync(pagesDir)) {
      if (file.endsWith(".html")) {
        const name = file.replace(/\.html$/, "");
        inputs[name] = resolve(pagesDir, file);
      }
    }
  }
  return inputs;
}

export default defineConfig(() => {
  return {
    root: ".",
    base: "/", // ← важливо для Vercel

    plugins: [
      handlebars({
        partialDirectory: resolve(__dirname, "src/partials"),
      }),

      {
        name: "multi-page-dev",
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const urlPath = req.url.split("?")[0];
            if (!urlPath.endsWith(".html") && urlPath !== "/") {
              return next();
            }

            let filePath;
            if (urlPath === "/" || urlPath === "/index.html") {
              filePath = resolve(__dirname, "index.html");
            } else {
              filePath = resolve(__dirname, "src/pages", urlPath.slice(1));
            }

            if (fs.existsSync(filePath)) {
              try {
                let html = fs.readFileSync(filePath, "utf-8");
                html = await server.transformIndexHtml(req.url, html);
                res.setHeader("Content-Type", "text/html; charset=utf-8");
                res.statusCode = 200;
                res.end(html);
              } catch (error) {
                console.error("Ошибка при рендере Handlebars:", error.message);
                res.statusCode = 500;
                res.setHeader("Content-Type", "text/html; charset=utf-8");
                res.end(`
                  <h1>Ошибка в шаблоне</h1>
                  <pre style="color:red; white-space:pre-wrap">${error.message}</pre>
                `);
              }
              return;
            }

            next();
          });
        },
      },

      createSvgIconsPlugin({
        iconDirs: [resolve(__dirname, "public/icons")],
        symbolId: "[name]",
      }),

      {
        name: "watch-html-and-partials",
        handleHotUpdate({ file, server }) {
          if (
            file.endsWith(".html") &&
            (file.includes("/src/pages/") ||
              file.includes("/src/partials/") ||
              file.endsWith("index.html"))
          ) {
            server.ws.send({ type: "full-reload" });
          }
        },
      },
    ],

    server: {
      fs: { allow: ["."] },
      watch: { usePolling: true },
    },

    build: {
      outDir: "dist",
      emptyOutDir: true,
      rollupOptions: {
        input: getHtmlInputs(),
        output: {
          entryFileNames: "assets/[name].js",
          chunkFileNames: "assets/[name].js",
          assetFileNames: ({ name }) =>
            name && name.endsWith(".css")
              ? "assets/[name][extname]"
              : "[name][extname]",
        },
      },
    },

    css: {
      preprocessorOptions: {
        scss: {},
      },
      // postcssUrl видалено — він ламав шляхи
    },

    resolve: {
      alias: {
        "@styles": resolve(__dirname, "src/styles"),
        "@scripts": resolve(__dirname, "src/scripts"),
        "@partials": resolve(__dirname, "src/partials"),
      },
    },
  };
});
