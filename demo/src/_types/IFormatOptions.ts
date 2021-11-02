/** Source code formatting options */
export type IFormatOptions = {
    /** What to do with the brackets */
    brackets: "keep" | "all" | "required";
    /** The maximum number of characters per line */
    maxLineLength: number;
    /** Whether to reset the line breaks of the input */
    resetLineBreaks: boolean;
    /** The spaces per tab for the input of the formula */
    inputIndents: number;
    /** The spaces per tab for the output of the formula */
    outputIndents: number;
};
