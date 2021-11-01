import {Parser} from "parsimmon";

/** Extracts the parsers' result types given a list of parsers */
export type TGetTypeOfParsers<T extends Parser<any>[]> = T extends []
    ? []
    : T extends [Parser<infer F>, ...infer R]
    ? R extends Parser<any>[]
        ? [F, ...TGetTypeOfParsers<R>]
        : never
    : never;
