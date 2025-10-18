import { type Express } from "express";
import { type Server } from "http";
export declare function log(message: string, source?: string): void;
export declare function setupVite(app: Express, server: Server): Promise<void>;
export declare function serveStatic(app: Express): void;
