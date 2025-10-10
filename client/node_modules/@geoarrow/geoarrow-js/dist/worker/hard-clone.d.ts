import { Data, DataType, Vector } from "apache-arrow";
/**
 * Clone an Arrow JS Data or Vector, detaching from an existing ArrayBuffer if
 * it is shared with other.
 *
 * The purpose of this function is to enable transferring a `Data` instance,
 * e.g. to a web worker, without neutering any other data.
 *
 * Any internal buffers that are a slice of a larger `ArrayBuffer` (i.e. where
 * the typed array's `byteOffset` is not `0` and where its `byteLength` does not
 * match its `array.buffer.byteLength`) are copied into new `ArrayBuffers`.
 *
 * If `force` is `true`, always clone internal buffers, even if not shared. If
 * the default, `false`, any internal buffers that are **not** a slice of a
 * larger `ArrayBuffer` will not be copied.
 */
export declare function hardClone<T extends DataType>(input: Data<T>, force?: boolean): Data<T>;
export declare function hardClone<T extends DataType>(input: Vector<T>, force?: boolean): Vector<T>;
/**
 * Test whether an Data instance is a slice of a larger `ArrayBuffer`.
 */
export declare function isShared<T extends DataType>(data: Data<T> | Vector<T>): boolean;
