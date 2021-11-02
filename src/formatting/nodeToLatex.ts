import {IAllNodes} from "../parser/muCalculusParser";
import {createRecursiveNodeMapper} from "./createRecursiveNodeMapper";
import {ILatexFormattingConfig} from "./_types/ILatexFormatterConfig";

/**
 * Translates a node to a latex string
 * @param node The node to be converted to latex
 * @param config Additional configuration
 * @returns The latex string
 */
export const nodeToLatex = (node: IAllNodes, config?: ILatexFormattingConfig) => format(node, {...config});

const format = createRecursiveNodeMapper<IAllNodes, string, ILatexFormattingConfig, string[]>(
    (result, parent, {indent = "\\text{\\hspace{2em}}"}) => {
        const original = parent.children;
        if (result.length != original.length)
            throw new Error(`Result of type ${parent.type} had unexpected shape: ${JSON.stringify(result)}`);

        // Add latex whitespaces in output
        const tab = indent;
        const prefix = (text: string) =>
            text
                .match(/^\s*/)![0]
                .replace(/\t|    /g, tab)
                .replace(/\n/g, "\\\\\n");
        const suffix = (text: string) =>
            text
                .match(/\s*$/)![0]
                .replace(/\t|    /g, tab)
                .replace(/\n/g, "\\\\\n");
        const withWhiteSpaces = result.map((val, i) => {
            const or = original[i];
            const orVal = or && "text" in or && or.text;
            return orVal ? prefix(orVal) + val + suffix(orVal) : val;
        });

        // const
        return withWhiteSpaces.join("");
    },
    {
        id: ([lit]) => [` ${lit.text.trim()}`],
        number: ([lit]) => [` ${lit.text.trim()}`],
        "s:bool": ([lit]) => [" Bool"],
        "s:pos": ([lit]) => [" Pos"],
        "s:nat": ([lit]) => [" Nat"],
        "s:int": ([lit]) => [" Int"],
        "s:real": ([lit]) => [" Real"],
        "s:list": ([lit, l, sort, r]) => [" List", "(", sort, ")"],
        "s:set": ([lit, l, sort, r]) => [" Set", "(", sort, ")"],
        "s:bag": ([lit, l, sort, r]) => [" Bag", "(", sort, ")"],
        "s:fSet": ([lit, l, sort, r]) => [" FSet", "(", sort, ")"],
        "s:fBag": ([lit, l, sort, r]) => [" FBag", "(", sort, ")"],
        "s:group": ([l, sort, r]) => [" (", sort, ")"],
        "s:constr": ([lit, constr]) => [" struct", constr],
        "s:constrDecl": ([id, l, args, r, p, proj]) => [id, l ? "(" : "", args ?? "", r ? ")" : "", p ? "?" : "", proj ?? ""],
        "s:constrDeclList": ([item, sep, rest]) => [item, sep ? "," : "", rest ?? ""],
        "s:projDeclList": ([item, sep, rest]) => [item, sep ? "," : "", rest ?? ""],
        "s:projDecl": ([id, c, sort]) => [id ?? "", c ? ":" : "", sort],
        "s:func": ([from, lit, to]) => [from, "\\rightarrow", to],
        "s:prod": ([sortA, lit, sortB]) => [sortA, "\\times", sortB],
        "d:bool": ([val]) => [val.text.match(/true/) ? " true" : " false"],
        "d:list": ([l, items, r]) => ["[", items ?? "", "]"],
        "d:set": ([l, items, r]) => ["\\{", items ?? "", "\\}"],
        "d:bag": ([l, items, r]) => ["\\{", typeof items == "string" ? items : "", "\\}"],
        "d:setCompr": ([l, variable, sep, cond, r]) => ["\\{", variable, "|", cond, "\\}"],
        "d:group": ([l, expr, r]) => ["(", expr, ")"],
        "d:map": ([expr, l, from, arrow, to, r]) => [expr, "[", from, "\\rightarrow", to, "]"],
        "d:apply": ([expr, l, args, r]) => [expr, "(", args, ")"],
        "d:negate": ([neg, expr]) => ["\\neg", expr],
        "d:negative": ([neg, expr]) => ["-", expr],
        "d:size": ([lit, expr]) => ["#", expr],
        "d:forall": ([forall, vars, sep, expr]) => ["\\forall", vars, ".", expr],
        "d:exists": ([exists, vars, sep, expr]) => ["\\exists", vars, ".", expr],
        "d:lambda": ([lambda, vars, sep, expr]) => ["\\lambda", vars, ".", expr],
        "d:implies": ([exprA, implies, exprB]) => [exprA, "\\Rightarrow", exprB],
        "d:or": ([exprA, or, exprB]) => [exprA, "\\lor", exprB],
        "d:and": ([exprA, and, exprB]) => [exprA, "\\land", exprB],
        "d:equals": ([exprA, equals, exprB]) => [exprA, "\\approx", exprB],
        "d:notEquals": ([exprA, notEquals, exprB]) => [exprA, "\\not\\approx", exprB],
        "d:smallerEquals": ([exprA, smallerEquals, exprB]) => [exprA, "\\leq", exprB],
        "d:smaller": ([exprA, smaller, exprB]) => [exprA, "<", exprB],
        "d:biggerEquals": ([exprA, biggerEquals, exprB]) => [exprA, "\\geq", exprB],
        "d:bigger": ([exprA, smaller, exprB]) => [exprA, ">", exprB],
        "d:in": ([exprA, lit, exprB]) => [exprA, "\\in", exprB],
        "d:cons": ([exprA, insert, exprB]) => [exprA, "\\triangleright", exprB],
        "d:snoc": ([exprA, append, exprB]) => [exprA, "\\triangleleft", exprB],
        "d:concat": ([exprA, concat, exprB]) => [exprA, " +kern-1.3ex+kern0.8ex"],
        "d:add": ([exprA, add, exprB]) => [exprA, "+", exprB],
        "d:subtract": ([exprA, subtract, exprB]) => [exprA, "-", exprB],
        "d:divide": ([exprA, divide, exprB]) => [exprA, "/", exprB],
        "d:div": ([exprA, div, exprB]) => [exprA, "\\text{ div }", exprB],
        "d:mod": ([exprA, mod, exprB]) => [exprA, "|", `_{${exprB}}`],
        "d:multiply": ([exprA, mult, exprB]) => [exprA, "\\cdot", exprB],
        "d:index": ([exprA, index, exprB]) => [exprA, ".", exprB],
        "d:where": ([expr, where, block, end]) => [expr, "\\text{ whr }", block, "\\text{ end }"],
        "d:dataExprList": ([element, sep, elements]) => [element, sep ? "," : "", elements ? elements : ""],
        "d:bagEnumElt": ([el, sep, count]) => [el, ":", count],
        "d:bagEnumEltList": ([element, sep, elements]) => [element, sep ? "," : "", elements ? elements : ""],
        "d:idList": ([element, sep, elements]) => [element, sep ? "," : "", elements ? elements : ""],
        "d:varDecl": ([id, sep, sort]) => [id, ":", sort],
        "d:varsDecl": ([idList, sep, sort]) => [idList, ":", sort],
        "d:varsDeclList": ([element, sep, elements]) => [element, sep ? "," : "", elements ? elements : ""],
        "d:assignment": ([id, equals, val]) => [id, "=", val],
        "d:assignmentList": ([element, sep, elements]) => [element, sep ? "," : "", elements ? elements : ""],
        "a:action": ([id, l, data, r]) => [id, l ? "(" : "", data ?? "", r ? ")" : ""],
        "a:actions": ([action, sep, actions]) => [action, sep ? "|" : "", actions ?? ""],
        "a:tau": ([tau]) => ["\\tau"],
        "a:multAct": ([acts]) => [acts],
        "af:data": ([val, l, expr, r]) => ["", "", expr, ""],
        "af:group": ([l, expr, r]) => ["(", expr, ")"],
        "af:bool": ([val]) => [val.text.match(/true/) ? " true" : " false"],
        "af:forall": ([forall, vars, sep, expr]) => ["\\forall", vars, ".", expr],
        "af:exists": ([exists, vars, sep, expr]) => ["\\exists", vars, ".", expr],
        "af:implies": ([exprA, implies, exprB]) => [exprA, "\\Rightarrow", exprB],
        "af:or": ([exprA, or, exprB]) => [exprA, "\\cup", exprB],
        "af:and": ([exprA, and, exprB]) => [exprA, "\\cap", exprB],
        "af:time": ([exprA, time, exprB]) => [exprA, "@", exprB],
        "af:negate": ([neg, expr]) => ["\\overline{", `${expr}}`],
        "rf:group": ([l, expr, r]) => ["(", expr, ")"],
        "rf:opt": ([exprA, opt, exprB]) => [exprA, "+", exprB],
        "rf:seq": ([exprA, seq, exprB]) => [exprA, "\\cdot", exprB],
        "rf:zeroOrMore": ([expr, zeroOrMore]) => [expr, "^{*}"],
        "rf:oneOrMore": ([expr, oneOrMore]) => [expr, "^{+}"],
        "sf:data": ([val, l, expr, r]) => ["", "", expr, ""],
        "sf:group": ([l, expr, r]) => ["(", expr, ")"],
        "sf:bool": ([val]) => [val.text.match(/true/) ? " true" : " false"],
        "sf:delay": ([delay, sep, expr]) => ["\\triangle", sep ? "\\textdegree" : "", expr ?? ""],
        "sf:yaled": ([yaled, sep, expr]) => ["\\triangledown", sep ? "\\textdegree" : "", expr ?? ""],
        "sf:mu": ([mu, vars, sep, expr]) => ["\\mu", vars, ".", expr],
        "sf:nu": ([nu, vars, sep, expr]) => ["\\nu", vars, ".", expr],
        "sf:forall": ([forall, vars, sep, expr]) => ["\\forall", vars, ".", expr],
        "sf:exists": ([exists, vars, sep, expr]) => ["\\exists", vars, ".", expr],
        "sf:implies": ([exprA, implies, exprB]) => [exprA, "\\Rightarrow", exprB],
        "sf:or": ([exprA, or, exprB]) => [exprA, "\\lor", exprB],
        "sf:and": ([exprA, and, exprB]) => [exprA, "\\land", exprB],
        "sf:forallPaths": ([l, path, r, expr]) => ["[", path, "]", expr],
        "sf:existsPath": ([l, path, r, expr]) => ["\\langle", path, "\\rangle", expr],
        "sf:negate": ([not, expr]) => ["\\neg", expr],
        "sf:simpleData": ([id, l, exprList, r]) => [id, l ? "(" : "", exprList ?? "", r ? ")" : ""],
        "sf:stateVarAssignment": ([id, sep, sort, equals, val]) => [id, ":", sort, "=", val],
        "sf:stateVarAssignmentList": ([element, sep, elements]) => [element, sep ? "," : "", elements ?? ""],
        "sf:stateVarDecl": ([id, l, vars, r]) => [id, l ? "(" : "", vars ?? "", r ? ")" : ""],
    }
);
