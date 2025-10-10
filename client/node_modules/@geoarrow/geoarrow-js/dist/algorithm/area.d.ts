import * as arrow from "apache-arrow";
import { PolygonData } from "../data";
import { PolygonVector } from "../vector";
/**
 * Compute the unsigned area of the polygon input.
 */
export declare function area(input: PolygonData): arrow.Data<arrow.Float>;
export declare function area(input: PolygonVector): arrow.Vector<arrow.Float>;
/**
 * Compute the signed area of the polygon input.
 */
export declare function signedArea(input: PolygonData): arrow.Data<arrow.Float>;
export declare function signedArea(input: PolygonVector): arrow.Vector<arrow.Float>;
