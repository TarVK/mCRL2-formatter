import {IAllNodes} from "../parser/_types/nodeTypes";
import {ILatexFormattingOptions} from "./_types/ILatexFormattingOptions";
import {latexFormatters} from "./latexFormatters";

/**
 * Transforms the given mCRL2 formula node to a latex formatted string
 * @param node The node to be formatted
 * @param opts The options for the formatting
 * @returns The formatted latex string
 */
export function nodeToLatex(node: IAllNodes, opts: ILatexFormattingOptions = {}): string {
    const {bracketMode = "required", indent = 0, indentWrapOffset = 0, maxLineLength = 120, charCount, formatters} = opts;

    const type = node.type;
    const nodeCharCount = charCount && type in charCount && charCount[type];
    const formatter =
        (formatters && type in formatters && formatters[type]) ??
        (type in latexFormatters && latexFormatters[type as keyof typeof latexFormatters]) ??
        (() => "");

    const rec = (child: IAllNodes, right: boolean) => {
        if ("ass" in child && "ass" in node) {
        }
    };
}
