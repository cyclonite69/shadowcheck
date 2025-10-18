import type { Express } from "express";
import { type Server } from "http";
export declare function registerRoutes(app: Express): Promise<Server>;
