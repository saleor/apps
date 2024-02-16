import { MapExchangeOpts, mapExchange } from "urql";

type IOnOperation = MapExchangeOpts["onOperation"];
type IOnResult = MapExchangeOpts["onResult"];

export const createExchange = (onOperation: IOnOperation, onResult: IOnResult) =>
  mapExchange({
    onOperation,
    onResult,
  });
