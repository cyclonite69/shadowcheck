import { Data, Vector, type DataType } from "apache-arrow";
import { Polygon } from "../type";
import { PolygonData } from "../data";
type PostMessageDataType = Pick<DataType, "children" | "typeId">;
type PostMessageData<T extends DataType> = Pick<Data<T>, "type" | "length" | "offset" | "stride" | "children" | "dictionary" | "values" | "typeIds" | "nullBitmap" | "valueOffsets"> & {
    type: PostMessageDataType;
};
type PostMessageVector<T extends DataType> = Pick<Vector, "data" | "length" | "stride" | "numChildren"> & {
    type: PostMessageDataType;
};
/**
 * Rehydrate a `Data` object that has been `structuredClone`'d or
 * `postMessage`'d. The `Data` **must** have been prepared with
 * `preparePostMessage` to be accurately recreated.
 */
export declare function rehydrateData<T extends DataType>(data: PostMessageData<T>): Data<T>;
/**
 * Rehydrate a `Vector` object that has been `structuredClone`'d or
 * `postMessage`'d. The `Vector` **must** have been prepared with
 * `preparePostMessage` to be accurately recreated.
 */
export declare function rehydrateVector<T extends DataType>(vector: PostMessageVector<T>): Vector<T>;
export declare function rehydratePolygonData(data: PostMessageData<Polygon>): PolygonData;
export {};
