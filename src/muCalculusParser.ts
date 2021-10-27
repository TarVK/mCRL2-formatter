import P, {Parser} from "parsimmon";
import {createOpParser} from "./createOpParser";
import {IDataExpr, INode, ISortExpr, IVarDecl} from "./_types/nodeTypes";

// Lang spec: https://github.com/mCRL2org/mCRL2/blob/master/libraries/core/source/mcrl2_syntax.g

// Helper functions
function N<N extends string>(type: N): INode<N, {}>;
function N<N extends string, D = {}>(type: N, data: D): INode<N, D>;
function N<N extends string, D = {}>(type: N, data: D = {} as any): INode<N, D> {
    return {type, ...data};
}

const _ = P.optWhitespace;
const S = <S extends string>(s: S) => P.string(s).trim(_);
function listParser<T>(parser: Parser<T>, sep: Parser<any> = S(",")): Parser<T[]> {
    return P.seq(parser, P.seq(sep, parser).many()).map(([first, rest]) => [first, ...rest.map(([sep, exp]) => exp)]);
}
const Opt = <T>(parser: Parser<T>) => parser.or(P.of(null));

// Literals
const idParser = P.regexp(/[A-Za-z_][A-Za-z_0-9']*/).map(name => N("id", {name}));
const numberParser = P.regexp(/0|([1-9][0-9]*)/).map(num => N("number", {value: Number(num)}));

// Sorts
const projDeclParser = P.lazy(() =>
    P.seq(Opt(P.seq(idParser, S(":"))), sortExprParser).map(([name, sort]) => N("s_proj", {name: name?.[0].name, type: sort}))
);
const constDeclParser = P.seq(idParser, Opt(P.seq(S("("), listParser(projDeclParser), S(")"))), Opt(P.seq(S("?"), idParser))).map(
    ([{name}, args, testFunc]) => N("s_constr", {name, args: args?.[1] ?? [], testFunc: testFunc?.[1].name})
);

const parameterizedSort = <N extends string, I extends string>(name: N, id: I) =>
    P.seq(P.string(name), S("("), sortExprParser, S(")")).map(([pr, l, of, r]) => N(id, {of}));
export const sortExprParser: Parser<ISortExpr> = P.lazy(() =>
    createOpParser<ISortExpr>()
        .a({t: "b", op: S("Bool").map(() => N("s_bool"))})
        .a({t: "b", op: S("Pos").map(() => N("s_pos"))})
        .a({t: "b", op: S("Nat").map(() => N("s_nat"))})
        .a({t: "b", op: S("Int").map(() => N("s_int"))})
        .a({t: "b", op: S("Real").map(() => N("s_real"))})
        .a({t: "b", op: parameterizedSort("List", "s_list")})
        .a({t: "b", op: parameterizedSort("Set", "s_set")})
        .a({t: "b", op: parameterizedSort("Bag", "s_bag")})
        .a({t: "b", op: parameterizedSort("FSet", "s_fSet")})
        .a({t: "b", op: parameterizedSort("FBag", "s_fBag")})
        .a({t: "b", op: idParser})
        .a({
            t: "b",
            op: P.seq(S("("), sortExprParser, S(")")).map(([, expr]) => N("s_group", {expr})),
        })
        .a({
            t: "b",
            op: P.seq(S("struct"), listParser(constDeclParser, S("|"))).map(([, constructors]) => N("s_struct", {constructors})),
        })
        .a({
            t: "i",
            p: 0,
            ass: "right",
            op: S("->").map(() => (from, to) => N("s_func", {from, to})),
        })
        .a({
            t: "i",
            p: 1,
            ass: "left",
            op: S("#").map(() => (typeA, typeB) => N("s_prod", {typeA, typeB})),
        })
        .finish()
);

// Data
const varDeclr: Parser<IVarDecl> = P.seq(idParser, P.string(":").trim(_), sortExprParser).map(([id, sep, sort]) =>
    N("d_varsDecl", {
        id: id.name,
        sort,
    })
);
const dataExprListParser: Parser<IDataExpr[]> = P.lazy(() => listParser(dataExprParser));
const bagEnumEltListParser: Parser<{element: IDataExpr; count: IDataExpr}[]> = P.lazy(() =>
    listParser(
        P.seq(dataExprParser, P.string(":").trim(_), dataExprParser).map(([item, sep, count]) => ({
            element: item,
            count,
        }))
    )
);
const binDataOp = <N extends string>(type: N) =>
    S(type).map(() => (exprA: IDataExpr, exprB: IDataExpr) => N("d_binOp", {type, exprA, exprB}));
export const dataExprParser: Parser<IDataExpr> = P.lazy(() =>
    createOpParser<IDataExpr>()
        .a({t: "b", op: numberParser})
        .a({t: "b", p: 19, op: idParser})
        .a({t: "b", p: 20, op: S("true").map(() => N("d_bool", {val: true}))})
        .a({t: "b", p: 20, op: S("false").map(() => N("d_bool", {val: false}))})
        .a({t: "b", p: 20, op: S("[]").map(() => N("d_list", {elements: []}))})
        .a({t: "b", p: 20, op: S("{}").map(() => N("d_set", {elements: []}))})
        .a({t: "b", p: 20, op: S("{:}").map(() => N("d_bag", {elements: []}))})
        .a({t: "b", p: 20, op: S("{").map(() => N("d_bag", {elements: []}))})
        .a({
            t: "b",
            p: 20,
            op: P.seq(S("["), dataExprListParser, S("]")).map(([l, elements, r]) => N("d_list", {elements})),
        })
        .a({
            t: "b",
            p: 20,
            op: P.seq(S("{"), bagEnumEltListParser, S("}")).map(([l, elements, r]) => N("d_bag", {elements})),
        })
        .a({
            t: "b",
            p: 20,
            op: P.seq(S("{"), varDeclr, S("|"), dataExprParser).map(([l, variable, r, expr]) =>
                N("d_setCompr", {variable, expr})
            ),
        })
        .a({
            t: "b",
            p: 20,
            op: P.seq(S("{"), dataExprListParser, S("}")).map(([l, elements, r]) => N("d_set", {elements})),
        })
        .a({
            t: "b",
            p: 50,
            op: P.seq(S("("), dataExprParser, S(")")).map(([l, data, r]) => N("d_group", {expr: data})),
        })
        .a({
            t: "s",
            p: 13,
            op: P.seq(S("["), dataExprParser, S("->"), dataExprParser, S("]")).map(
                ([, from, , to]) =>
                    func =>
                        N("d_map", {func, from, to})
            ),
        })
        .a({
            t: "s",
            p: 13,
            op: P.seq(S("("), dataExprListParser, S(")")).map(
                ([, args]) =>
                    func =>
                        N("d_apply", {func, arguments: args})
            ),
        })
        .a({t: "p", p: 12, op: S("!").map(() => expr => N("d_negate", {expr}))})
        .a({t: "p", p: 12, op: S("-").map(() => expr => N("d_negative", {expr}))})
        .a({t: "p", p: 12, op: S("#").map(() => collection => N("d_size", {collection}))})
        .a({t: "i", p: 2, ass: "left", op: binDataOp("=>")})

        // TODO:
        .finish()
);

// const actionDecl = P.
// const actionListParser
// const multActParser =
