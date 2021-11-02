/** Options for latex formatting */
export type ILatexFormattingConfig = {
    /** When to add brackets around expressions */
    bracketMode?: "all" | "original" | "required";
    /** The maximum length of the line */
    maxLineLength?: number;
    /** The latex to use for indentation of text*/
    indent?: string;
};
