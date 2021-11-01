import {Parser} from "parsimmon";

/** Extracts the parser's result types given a list of parsers */
export type TGetTypeOfParser<T extends Parser<any>> = T extends Parser<infer F> ? F : never;
