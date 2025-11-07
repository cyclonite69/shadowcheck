import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import * as vite from "vite";
import { type Server } from "http";
import { nanoid } from "nanoid";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const viteServer = await vite.createServer({
    server: {
      middlewareMode: true,
      hmr: { server },
    },
    appType: "custom",
    root: path.resolve(process.cwd(), "client"),
  });

  app.use(viteServer.middlewares);

  // SPA fallback - serve index.html ONLY for HTML page requests
  // Vite middleware above already handled all assets, modules, and HMR
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    // If response was already sent by Vite middleware or API routes, skip
    if (res.headersSent) {
      return next();
    }

    // Only serve index.html for requests that look like page navigations
    // (not assets, not API calls)
    const isAssetRequest = /\.[a-z0-9]+$/i.test(url) && !url.endsWith('.html');
    const isApiRequest = url.startsWith('/api/');
    const isViteInternal = url.startsWith('/@');

    if (isAssetRequest || isApiRequest || isViteInternal) {
      return next();
    }

    try {
      const clientPath = path.resolve(process.cwd(), "client", "index.html");
      let template = fs.readFileSync(clientPath, "utf-8");
      template = await viteServer.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      viteServer.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "client", "dist");

  if (!fs.existsSync(distPath)) {
    log(`Warning: Client build directory not found at ${distPath}. API endpoints will work, but frontend will not be served.`, "express");
    return;
  }

  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
