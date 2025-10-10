import { Data, Vector, type DataType } from "apache-arrow";
/**
 * Prepare a `Data` or `Vector` for a `postMessage` or `structuredClone`.
 */
export declare function preparePostMessage<T extends DataType>(input: Data<T>, forceClone?: boolean): [Data<T>, ArrayBuffer[]];
export declare function preparePostMessage<T extends DataType>(input: Vector<T>, forceClone?: boolean): [Vector<T>, ArrayBuffer[]];
