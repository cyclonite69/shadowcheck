import { PolygonData } from "../data";
import { PolygonVector } from "../vector";
/**
 * Run earcut on polygon input
 */
export declare function earcut(input: PolygonData): Uint32Array;
export declare function earcut(input: PolygonVector): Uint32Array[];
