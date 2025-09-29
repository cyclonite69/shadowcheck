import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function setupVite(app: express.Application, isProduction: boolean) {
  if (!isProduction) {
    // Development mode with Vite dev server
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root: path.resolve(__dirname, '../client'),
      configFile: path.resolve(__dirname, '../client/vite.config.ts'),
    });

    app.use(vite.ssrFixStacktrace);
    app.use(vite.middlewares);
    
    // Handle SPA routing - only catch non-API routes
    app.get(/^\/(?!api).*/, async (req, res, next) => {
      const url = req.originalUrl;

      try {
        // Always serve the index.html for SPA routes
        const template = await vite.transformIndexHtml(url, `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ShadowCheck</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
        `);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        if (e instanceof Error) {
          vite?.ssrFixStacktrace(e);
          console.error(e.stack);
          res.status(500).end(e.message);
        }
      }
    });
  } else {
    // Production mode
    const distPath = path.resolve(__dirname, '../client/dist');
    
    app.use(express.static(distPath));

    // Handle SPA routing in production - only catch non-API routes
    app.get(/^\/(?!api).*/, (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }
}
