import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientTemplate = path.resolve(__dirname, '..', 'client', 'index.html');
const distPath = path.resolve(__dirname, 'public');

// ... rest of your vite.ts code ...
