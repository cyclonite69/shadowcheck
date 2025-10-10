import * as arrow from "apache-arrow";
import { LineString, MultiLineString, MultiPoint, MultiPolygon, Point, Polygon } from "../type";
import { LineStringData, MultiLineStringData, MultiPointData, MultiPolygonData, PointData, PolygonData } from "../data";
type MapCoordsCallback = (x: number, y: number) => [number, number];
export declare function mapCoords(input: PointData, callback: MapCoordsCallback): PointData;
export declare function mapCoords(input: LineStringData, callback: MapCoordsCallback): LineStringData;
export declare function mapCoords(input: PolygonData, callback: MapCoordsCallback): PolygonData;
export declare function mapCoords(input: MultiPointData, callback: MapCoordsCallback): MultiPointData;
export declare function mapCoords(input: MultiLineStringData, callback: MapCoordsCallback): MultiLineStringData;
export declare function mapCoords(input: MultiPolygonData, callback: MapCoordsCallback): MultiPolygonData;
export declare function mapCoords0<T extends Point>(input: arrow.Data<T>, callback: MapCoordsCallback): arrow.Data<T>;
/**
 * NOTE: the callback must be infallible as this does not take geometry validity
 * into effect for operating on coords
 */
export declare function mapCoords1<T extends LineString | MultiPoint>(input: arrow.Data<T>, callback: MapCoordsCallback): arrow.Data<T>;
/**
 * NOTE: the callback must be infallible as this does not take geometry validity
 * into effect for operating on coords
 */
export declare function mapCoords2<T extends Polygon | MultiLineString>(input: arrow.Data<T>, callback: MapCoordsCallback): arrow.Data<T>;
/**
 * NOTE: the callback must be infallible as this does not take geometry validity
 * into effect for operating on coords
 */
export declare function mapCoords3<T extends MultiPolygon>(input: arrow.Data<T>, callback: MapCoordsCallback): arrow.Data<T>;
export {};
