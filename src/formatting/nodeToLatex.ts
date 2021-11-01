import {IAllNodes, ISortExprNodes} from "../parser/muCalculusParser";
import {INode, IText} from "../parser/_types/INode";
import {createRecursiveNodeMapper} from "./createRecursiveNodeMapper";
import {ILatexFormattingConfig} from "./_types/ILatexFormatterConfig";
import {INodeMapper} from "./_types/INodeMapper";

const format = createRecursiveNodeMapper<ISortExprNodes, string, ILatexFormattingConfig, string[]>(
    (result, parent, {indent = "2em"}) => {
        const original = parent.children;
        if (result.length != original.length) throw new Error("Result had unexpected shape");

        // Add latex whitespaces in output
        const tab = ` \\text{\\hspace{${indent}}}  `;
        const prefix = (text: string) =>
            text
                .match(/^\s*/)![0]
                .replace(/\t|    /, tab)
                .replace(/\n/, "\\\\\n");
        const suffix = (text: string) =>
            text
                .match(/\s*$/)![0]
                .replace(/\t|    /, tab)
                .replace(/\n/, "\\\\\n");
        const withWhiteSpaces = result.map((val, i) => {
            const or = original[i];
            const orVal = or && "text" in or && or.text;
            return orVal ? prefix(orVal) + val + suffix(orVal) : val;
        });

        // const
        return withWhiteSpaces.join("");
    },
    {
        id: ([lit]) => [lit.text],
        "s:bool": ([lit]) => ["Bool"],
        "s:pos": ([lit]) => ["Pos"],
        "s:nat": ([lit]) => ["Nat"],
        "s:int": ([lit]) => ["Int"],
        "s:real": ([lit]) => ["Real"],
        "s:list": ([lit, l, sort, r]) => ["List", "(", sort, ")"],
        "s:set": ([lit, l, sort, r]) => ["Set", "(", sort, ")"],
        "s:bag": ([lit, l, sort, r]) => ["Bag", "(", sort, ")"],
        "s:fSet": ([lit, l, sort, r]) => ["FSet", "(", sort, ")"],
        "s:fBag": ([lit, l, sort, r]) => ["FBag", "(", sort, ")"],
        "s:group": ([l, sort, r]) => ["(", sort, ")"],
        "s:constr": ([lit, constr]) => ["struct", constr],
        "s:constrDecl": ([id, l, args, r, p, proj]) => [id, l ? "(" : "", args ?? "", r ? ")" : "", p ? "?" : "", proj ?? ""],
        "s:constrDeclList": ([item, sep, rest]) => [item, sep ? "," : "", rest ?? ""],
        "s:projDeclList": ([item, sep, rest]) => [item, sep ? "," : "", rest ?? ""],
        "s:projDecl": ([id, c, sort]) => [id ?? "", c ? ":" : "", sort],
        "s:func": ([from, lit, to]) => [from, " \\rightarrow ", to],
        "s:prod": ([sortA, lit, sortB]) => [sortA, " \\times ", sortB],
    }
);

/**
 * Translates a node to a latex string
 * @param node The node to be converted to latex
 * @param config Additional configuration
 * @returns The latex string
 */
export const nodeToLatex = (node: ISortExprNodes, config?: ILatexFormattingConfig) => format(node, {...config});
