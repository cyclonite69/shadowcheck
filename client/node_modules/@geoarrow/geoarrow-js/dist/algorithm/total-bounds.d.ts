import * as arrow from "apache-arrow";
declare class Bbox {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    constructor();
    updateBbox(other: Bbox): void;
    updateCoord(x: number, y: number): void;
}
export declare function totalBounds(vector: arrow.Vector, field: arrow.Field): Bbox;
export {};
