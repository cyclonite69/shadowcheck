import * as arrow from "apache-arrow";
import { PolygonData } from "../data";
import { PolygonVector } from "../vector";
export declare enum Winding {
    CLOCKWISE,
    COUNTER_CLOCKWISE
}
/**
 * Compute the winding direction of the polygon input.
 *
 * The result is a boolean Data or Vector, where `true` means **Clockwise**
 * winding order and `false` means **Counter Clockwise** winding order.
 */
export declare function windingDirection(input: PolygonData): arrow.Data<arrow.Bool>;
export declare function windingDirection(input: PolygonVector): arrow.Vector<arrow.Bool>;
/**
 * **Mutate** the existing Polygon data or vector with the desired winding
 */
export declare function modifyWindingDirection(input: PolygonData, winding: Winding): void;
export declare function modifyWindingDirection(input: PolygonVector, winding: Winding): void;
