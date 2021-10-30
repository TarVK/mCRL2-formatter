import P, {Parser} from "parsimmon";
import {createOpParser} from "./createOpParser";
import {
    IActFrm,
    IActionNode,
    IAssignmentNode,
    IDataExpr,
    IMultAct,
    INode,
    IRegFrm,
    ISortExpr,
    IStateFrm,
    IStateVarDecl,
    IVarDecl,
} from "./_types/nodeTypes";

// Lang spec: https://github.com/mCRL2org/mCRL2/blob/master/libraries/core/source/mcrl2_syntax.g

// Helper functions
function N<N extends string>(type: N): INode<N, {}>;
function N<N extends string, D = {}>(type: N, data: D): INode<N, D>;
function N<N extends string, D = {}>(type: N, data: D = {} as any): INode<N, D> {
    return {type, ...data};
}

const S = <S extends string>(s: S) => P.string(s).trim(P.optWhitespace);
function listParser<T>(parser: Parser<T>, sep: Parser<any> = S(",")): Parser<T[]> {
    return P.seq(parser, P.seq(sep, parser).many()).map(([first, rest]) => [first, ...rest.map(([sep, exp]) => exp)]);
}
const Opt = <T>(parser: Parser<T>) => parser.or(P.of(null));

// Literals
const idParser = P.regexp(/[A-Za-z_][A-Za-z_0-9']*/).map(name => N("id", {name}));
const numberParser = P.regexp(/0|([1-9][0-9]*)/).map(num => N("number", {value: Number(num)}));

// Sorts
const projDeclParser = P.lazy(() =>
    P.seq(Opt(P.seq(idParser, S(":"))), sortExprParser).map(([name, sort]) => N("s_proj", {name: name?.[0].name, sort}))
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
        .a({t: "b", op: idParser.map(({name}) => N("s_name", {name}))})
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
            op: S("#").map(() => (sortA, sortB) => N("s_prod", {sortA, sortB})),
        })
        .finish()
);

// Data
const varDeclr: Parser<IVarDecl> = P.seq(idParser, S(":"), sortExprParser).map(([id, sep, sort]) =>
    N("d_varsDecl", {
        name: id.name,
        sort,
    })
);
const dataExprListParser: Parser<IDataExpr[]> = P.lazy(() => listParser(dataExprParser));
const bagEnumEltListParser: Parser<{element: IDataExpr; count: IDataExpr}[]> = P.lazy(() =>
    listParser(
        P.seq(dataExprParser, S(":"), dataExprParser).map(([item, sep, count]) => ({
            element: item,
            count,
        }))
    )
);
const assignmentListParser: Parser<IAssignmentNode[]> = listParser(
    P.lazy(() => P.seq(idParser, S("="), dataExprParser).map(([id, , expr]) => N("d_assign", {name: id.name, value: expr})))
);

const binDataOp = <N extends string>(kind: N) =>
    S(kind).map(() => (exprA: IDataExpr, exprB: IDataExpr) => N("d_binOp", {kind, exprA, exprB}));
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
        .a({t: "i", p: 2, ass: "right", op: binDataOp("=>")})
        .a({t: "i", p: 3, ass: "right", op: binDataOp("||")})
        .a({t: "i", p: 4, ass: "right", op: binDataOp("&&")})
        .a({t: "i", p: 5, ass: "left", op: binDataOp("==")})
        .a({t: "i", p: 5, ass: "left", op: binDataOp("!=")})
        .a({t: "i", p: 6, ass: "left", op: binDataOp("<=")})
        .a({t: "i", p: 6, ass: "left", op: binDataOp("<")})
        .a({t: "i", p: 6, ass: "left", op: binDataOp(">=")})
        .a({t: "i", p: 6, ass: "left", op: binDataOp(">")})
        .a({t: "i", p: 6, ass: "left", op: binDataOp("in")})
        .a({t: "i", p: 7, ass: "right", op: binDataOp("|>")})
        .a({t: "i", p: 8, ass: "left", op: binDataOp("<|")})
        .a({t: "i", p: 9, ass: "left", op: binDataOp("++")})
        .a({t: "i", p: 10, ass: "left", op: binDataOp("+")})
        .a({t: "i", p: 10, ass: "left", op: binDataOp("-")})
        .a({t: "i", p: 11, ass: "left", op: binDataOp("/")})
        .a({t: "i", p: 11, ass: "left", op: binDataOp("div")})
        .a({t: "i", p: 11, ass: "left", op: binDataOp("mod")})
        .a({t: "i", p: 12, ass: "left", op: binDataOp("*")})
        .a({t: "i", p: 12, ass: "left", op: binDataOp(".")})
        .a({
            t: "s",
            p: 0,
            op: P.seq(S("whr"), assignmentListParser, S("end")).map(
                ([, vars]) =>
                    expr =>
                        N("d_where", {expr, vars})
            ),
        })
        .finish()
);

// Actions
const actionParser: Parser<IActionNode> = P.seq(idParser, Opt(P.seq(S("("), dataExprListParser, S(")")))).map(([{name}, data]) =>
    N("a_action", {name, args: data?.[1] ?? []})
);
export const multiActParser: Parser<IMultAct> = S("tau")
    .map(() => N("a_tau"))
    .or(listParser(actionParser, S("|")).map(actions => N("a_list", {actions})));

// Action formulas

const binFrmOp = <N extends string>(kind: N) =>
    S(kind).map(() => (exprA: IActFrm, exprB: IActFrm) => N("f_binOp", {kind, exprA, exprB}));
export const actFrmParser: Parser<IActFrm> = P.lazy(() =>
    createOpParser<IActFrm>()
        .a({t: "b", p: 30, op: multiActParser})
        .a({t: "b", p: 50, op: P.seq(S("val"), S("("), dataExprParser, S(")")).map(([, , expr]) => expr)})
        .a({t: "b", p: 50, op: P.seq(S("("), actFrmParser, S(")")).map(([, expr]) => N("f_group", {expr}))})
        .a({t: "b", p: 40, op: S("true").map(() => N("f_bool", {val: true}))})
        .a({t: "b", p: 40, op: S("false").map(() => N("f_bool", {val: false}))})
        .a({
            t: "p",
            p: 21,
            op: P.seq(S("forall"), listParser(varDeclr), S(".")).map(
                ([, vars]) =>
                    expr =>
                        N("f_forall", {vars, expr})
            ),
        })
        .a({
            t: "p",
            p: 21,
            op: P.seq(S("exists"), listParser(varDeclr), S(".")).map(
                ([, vars]) =>
                    expr =>
                        N("f_exists", {vars, expr})
            ),
        })
        .a({t: "i", p: 22, ass: "right", op: binFrmOp("=>")})
        .a({t: "i", p: 23, ass: "right", op: binFrmOp("||")})
        .a({t: "i", p: 24, ass: "right", op: binFrmOp("&&")})
        .a({
            t: "s",
            p: 25,
            op: P.seq(S("@"), dataExprParser).map(
                ([, time]) =>
                    expr =>
                        N("f_time", {time, expr})
            ),
        })
        .a({t: "p", p: 26, op: S("!").map(() => expr => N("f_negate", {expr}))})
        .finish()
);

// Regular formula
export const regFrmParser: Parser<IRegFrm> = P.lazy(() =>
    createOpParser<IRegFrm>()
        .a({t: "b", p: 50 /* 30 */, op: actFrmParser})
        .a({t: "b", p: 50, op: P.seq(S("("), regFrmParser, S(")")).map(([, expr]) => N("rf_group", {expr}))})
        .a({t: "i", p: 31, op: S("+").map(() => (exprA, exprB) => N("rf_opt", {exprA, exprB}))})
        .a({t: "i", p: 32, op: S(".").map(() => (exprA, exprB) => N("rf_seq", {exprA, exprB}))})
        .a({t: "s", p: 33, op: S("*").map(() => expr => N("rf_zeroOrMore", {expr}))})
        .a({t: "s", p: 33, op: S("+").map(() => expr => N("rf_oneOrMore", {expr}))})
        .finish()
);

// State formula
const stateDeclParser: Parser<IStateVarDecl[]> = listParser(
    P.seq(idParser, S(":"), sortExprParser, S("="), dataExprParser).map(([{name}, , sort, , init]) =>
        N("sf_varDecl", {name, sort, init})
    )
);

const binStateFrmOp = <N extends string>(kind: N) =>
    S(kind).map(() => (exprA: IStateFrm, exprB: IStateFrm) => N("sf_binOp", {kind, exprA, exprB}));
export const stateFrmParser: Parser<IStateFrm> = P.lazy(() =>
    createOpParser<IStateFrm>()
        .a({t: "b", p: 50, op: P.seq(S("val"), S("("), dataExprParser, S(")")).map(([, , expr]) => expr)})
        .a({t: "b", p: 50, op: P.seq(S("("), stateFrmParser, S(")")).map(([, expr]) => N("sf_group", {expr}))})
        .a({t: "b", p: 50, op: S("true").map(() => N("sf_bool", {val: true}))})
        .a({t: "b", p: 50, op: S("false").map(() => N("sf_bool", {val: false}))})
        .a({t: "b", p: 50, op: P.seq(S("delay"), S("@"), dataExprParser).map(([, , expr]) => N("sf_delay", {expr}))})
        .a({t: "b", p: 50, op: P.seq(S("yaled"), S("@"), dataExprParser).map(([, , expr]) => N("sf_yaled", {expr}))})
        .a({
            t: "p",
            p: 50, // 41,
            op: P.seq(S("mu"), idParser, Opt(P.seq(S("("), stateDeclParser, S(")"))), S(".")).map(
                ([, {name}, vars]) =>
                    expr =>
                        N("sf_mu", {name, vars: vars?.[1] ?? [], expr})
            ),
        })
        .a({
            t: "p",
            p: 50, // 41,
            op: P.seq(S("nu"), idParser, Opt(P.seq(S("("), stateDeclParser, S(")"))), S(".")).map(
                ([, {name}, vars]) =>
                    expr =>
                        N("sf_nu", {name, vars: vars?.[1] ?? [], expr})
            ),
        })
        .a({
            t: "p",
            p: 50, // 42,
            op: P.seq(S("forall"), listParser(varDeclr), S(".")).map(
                ([, vars]) =>
                    expr =>
                        N("sf_forall", {vars, expr})
            ),
        })
        .a({
            t: "p",
            p: 50, // 42,
            op: P.seq(S("exists"), listParser(varDeclr), S(".")).map(
                ([, vars]) =>
                    expr =>
                        N("sf_exists", {vars, expr})
            ),
        })
        .a({t: "i", p: 43, ass: "right", op: binStateFrmOp("=>")})
        .a({t: "i", p: 44, ass: "right", op: binStateFrmOp("||")})
        .a({t: "i", p: 45, ass: "right", op: binStateFrmOp("&&")})
        .a({
            t: "p",
            p: 50, // 46,
            op: P.seq(S("["), regFrmParser, S("]")).map(
                ([, path]) =>
                    expr =>
                        N("sf_forallPaths", {path, expr})
            ),
        })
        .a({
            t: "p",
            p: 50, // 46,
            op: P.seq(S("<"), regFrmParser, S(">")).map(
                ([, path]) =>
                    expr =>
                        N("sf_existsPath", {path, expr})
            ),
        })
        .a({
            t: "p",
            p: 50, // 47,
            op: S("!").map(() => expr => N("sf_negate", {expr})),
        })
        .a({
            t: "b",
            p: 50,
            op: P.seq(idParser, Opt(P.seq(S("("), dataExprListParser, S(")")))).map(([{name}, data]) =>
                N("sf_varInst", {name, args: data?.[1] ?? []})
            ),
        })
        .finish()
);
