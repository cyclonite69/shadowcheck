import express from "express";
import fs from "fs";
import path from "path";
import * as vite from "vite";
const viteLogger = vite.createLogger();
export function log(message, source = "express") {
    const formattedTime = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
    console.log(`${formattedTime} [${source}] ${message}`);
}
export async function setupVite(app, server) {
    const viteServer = await vite.createServer({
        server: {
            middlewareMode: true,
            hmr: { server },
        },
        appType: "custom",
        root: path.resolve(process.cwd(), "client"),
    });
    app.use(viteServer.middlewares);
    app.use("*", async (req, res, next) => {
        const url = req.originalUrl;
        try {
            const clientPath = path.resolve(process.cwd(), "client", "index.html");
            let template = fs.readFileSync(clientPath, "utf-8");
            template = await viteServer.transformIndexHtml(url, template);
            res.status(200).set({ "Content-Type": "text/html" }).end(template);
        }
        catch (e) {
            viteServer.ssrFixStacktrace(e);
            next(e);
        }
    });
}
export function serveStatic(app) {
    const distPath = path.resolve(process.cwd(), "client", "dist");
    if (!fs.existsSync(distPath)) {
        throw new Error(`Could not find the build directory: ${distPath}, make sure to build the client first`);
    }
    app.use(express.static(distPath));
    app.use("*", (_req, res) => {
        res.sendFile(path.resolve(distPath, "index.html"));
    });
}
