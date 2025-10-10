/**
 * Strongly typed accessors for children, since arrow.Data.children[] is untyped
 */
import { Data, Vector, type Float } from "apache-arrow";
import { LineStringData, MultiLineStringData, MultiPointData, MultiPolygonData, PointData, PolygonData } from "./data";
import { LineStringVector, MultiLineStringVector, MultiPointVector, MultiPolygonVector, PointVector, PolygonVector } from "./vector";
export declare function getPointChild(input: PointData): Data<Float>;
export declare function getPointChild(input: PointVector): Vector<Float>;
export declare function getLineStringChild(input: LineStringData): PointData;
export declare function getLineStringChild(input: LineStringVector): PointVector;
export declare function getPolygonChild(input: PolygonData): LineStringData;
export declare function getPolygonChild(input: PolygonVector): LineStringVector;
export declare function getMultiPointChild(input: MultiPointData): PointData;
export declare function getMultiPointChild(input: MultiPointVector): PointVector;
export declare function getMultiLineStringChild(input: MultiLineStringData): LineStringData;
export declare function getMultiLineStringChild(input: MultiLineStringVector): LineStringVector;
export declare function getMultiPolygonChild(input: MultiPolygonData): PolygonData;
export declare function getMultiPolygonChild(input: MultiPolygonVector): PolygonVector;
