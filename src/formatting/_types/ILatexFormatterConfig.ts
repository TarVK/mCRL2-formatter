/** Options for latex formatting */
export type ILatexFormattingConfig = {
    /** When to add brackets around expressions */
    bracketMode?: "all" | "original" | "required";
    /** The maximum length of the line */
    maxLineLength?: number;
    /** The level of indentation in front, must include unit. E.g. 2em */
    indent?: string;
};
