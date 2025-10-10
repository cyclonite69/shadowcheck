import * as arrow from "apache-arrow";
import { GeoArrowType } from "../type";
/**
 * Reproject using proj4
 */
export declare function reproject<T extends GeoArrowType>(input: arrow.Data<T>, fromProjection: string, toProjection: string): arrow.Data<T>;
export declare function reproject<T extends GeoArrowType>(input: arrow.Vector<T>, fromProjection: string, toProjection: string): arrow.Vector<T>;
