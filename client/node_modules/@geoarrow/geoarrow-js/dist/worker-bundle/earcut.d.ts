import type { TransferDescriptor } from "threads";
import { PolygonData } from "../data";
declare function earcutWorker(polygonData: PolygonData): TransferDescriptor;
export type EarcutOnWorker = typeof earcutWorker;
export {};
