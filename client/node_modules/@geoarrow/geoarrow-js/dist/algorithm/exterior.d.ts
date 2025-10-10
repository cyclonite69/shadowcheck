import { LineStringVector, MultiLineStringVector, MultiPolygonVector, PolygonVector } from "../vector";
import { LineStringData, MultiLineStringData, MultiPolygonData, PolygonData } from "../data";
/**
 * Get the exterior of a PolygonVector or PolygonData
 */
export declare function getPolygonExterior(input: PolygonVector): LineStringVector;
export declare function getPolygonExterior(input: PolygonData): LineStringData;
/**
 * Get the exterior of a MultiPolygonVector or MultiPolygonData
 */
export declare function getMultiPolygonExterior(input: MultiPolygonVector): MultiLineStringVector;
export declare function getMultiPolygonExterior(input: MultiPolygonData): MultiLineStringData;
