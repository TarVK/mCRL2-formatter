import {Index} from "parsimmon";

/** The data for when a syntax error occurs */
export type ISyntaxError = {
    expected: string[];
    index: Index;
    message: string;
};
