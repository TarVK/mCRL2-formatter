import {IAllNodes} from "../../parser/_types/nodeTypes";
import {INodeFormattersObject} from "./INodeFormattersObject";

/** Options for latex formatting */
export type ILatexFormattingOptions = {
    /** When to add brackets around expressions */
    bracketMode?: "all" | "original" | "required";
    /** The maximum length of the line */
    maxLineLength?: number;
    /** The level of indentation in front */
    indent?: number;
    /** How far to additionally indent when a line wrap occurs */
    indentWrapOffset?: number;
    /** The number of characters that a given node type uses (ignoring the size of sub-expressions) */
    charCount?: Record<IAllNodes["type"], number>;
    /** The formatters to use per node type */
    formatters?: Partial<INodeFormattersObject<IAllNodes>>;
};
