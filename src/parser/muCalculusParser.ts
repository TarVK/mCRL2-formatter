import P from "parsimmon";
import {IAnyNode} from "./_types/INode";
import {Base, Inf, ListNode, Node, Opt, Pref, Rec, Suf, Text} from "./nodeParserTools";
import {createOpParser} from "./createOpParser";
import {TGetTypeOfParser} from "./_types/TGetTypeOfParser";
import {TGetDescendantNodes} from "./_types/TGetDescendantNodes";

// Lang spec: https://github.com/mCRL2org/mCRL2/blob/master/libraries/core/source/mcrl2_syntax.g

// Base parsers
const idParser = Node("id", Text(/[A-Za-z_][A-Za-z_0-9']*/)).desc("identifier");
const numberParser = Node("number", Text(/0|([1-9][0-9]*)/)).desc("number");

// Sort parser
export const sortExprParser = P.lazy(() =>
    createOpParser<IAnyNode>("sortExpr")
        .a(Base({op: Node("s:bool", Text("Bool"))}))
        .a(Base({op: Node("s:pos", Text("Pos"))}))
        .a(Base({op: Node("s:nat", Text("Nat"))}))
        .a(Base({op: Node("s:int", Text("Int"))}))
        .a(Base({op: Node("s:real", Text("Real"))}))
        .a(Base({op: Node("s:list", Text("List"), Text("("), sortExprRecParser, Text(")"))}))
        .a(Base({op: Node("s:set", Text("Set"), Text("("), sortExprRecParser, Text(")"))}))
        .a(Base({op: Node("s:bag", Text("Bag"), Text("("), sortExprRecParser, Text(")"))}))
        .a(Base({op: Node("s:fSet", Text("FSet"), Text("("), sortExprRecParser, Text(")"))}))
        .a(Base({op: Node("s:fBag", Text("FBag"), Text("("), sortExprRecParser, Text(")"))}))
        .a(Base({op: idParser}))
        .a(Base({op: Node("s:group", Text("("), sortExprRecParser, Text(")"))}))
        .a(Base({op: Node("s:constr", Text("struct"), constrDeclListParser)}))
        .a(Inf({p: 0, ass: "right", op: Node("s:func", Text("->"))}))
        .a(Inf({p: 1, ass: "right", op: Node("s:prod", Text("#"))}))
        .finish()
);
const sortExprRecParser = Rec(sortExprParser);
const projDeclParser = Node("s:projDecl", Opt(idParser, Text(":")), sortExprRecParser);
const projDeclListParser = ListNode("s:projDeclList", projDeclParser);
const constrDeclParser = Node("s:constrDecl", idParser, Opt(Text("("), projDeclListParser, Text(")")), Opt(Text("?"), idParser));
const constrDeclListParser = ListNode("s:constrDeclList", constrDeclParser, Text("|"));

export type ISortExprNodes = TGetTypeOfParser<
    | typeof sortExprParser
    | typeof projDeclParser
    | typeof projDeclListParser
    | typeof constrDeclParser
    | typeof constrDeclListParser
    | typeof idParser
>;

// Data parser
export const dataExprParser = P.lazy(() =>
    createOpParser<IAnyNode>("dataExpr")
        .a(Base({op: numberParser}))
        .a(Base({p: 19, op: idParser}))
        .a(Base({p: 20, op: Node("d:bool", Text("true").or(Text("false")))}))
        .a(Base({p: 20, op: Node("d:list", Text("["), Opt(dataExprListParser), Text("]"))}))
        .a(Base({p: 20, op: Node("d:set", Text("{"), Opt(dataExprListParser), Text("}"))}))
        .a(Base({p: 20, op: Node("d:bag", Text("{"), Opt(bagEnumEltListParser).or(Text(":")), Text("}"))}))
        .a(Base({p: 20, op: Node("d:setCompr", Text("{"), varDeclParser, Text("|"), dataExprRecParser, Text("}"))}))
        .a(Base({p: 50, op: Node("d:group", Text("("), dataExprRecParser, Text(")"))}))
        .a(Suf({p: 13, op: Node("d:map", Text("["), dataExprRecParser, Text("->"), dataExprRecParser, Text("]"))}))
        .a(Suf({p: 13, op: Node("d:apply", Text("("), dataExprListParser, Text(")"))}))
        .a(Pref({p: 12, op: Node("d:negate", Text("!"))}))
        .a(Pref({p: 12, op: Node("d:negative", Text("-"))}))
        .a(Pref({p: 12, op: Node("d:size", Text("#"))}))
        .a(Pref({p: 1, op: Node("d:forall", Text("forall"), varsDeclListParser, Text("."))}))
        .a(Pref({p: 1, op: Node("d:exists", Text("exists"), varsDeclListParser, Text("."))}))
        .a(Pref({p: 1, op: Node("d:lambda", Text("lambda"), varsDeclListParser, Text("."))}))
        .a(Inf({p: 2, ass: "right", op: Node("d:implies", Text("=>"))}))
        .a(Inf({p: 3, ass: "right", op: Node("d:or", Text("||"))}))
        .a(Inf({p: 4, ass: "right", op: Node("d:and", Text("&&"))}))
        .a(Inf({p: 5, ass: "left", op: Node("d:equals", Text("=="))}))
        .a(Inf({p: 5, ass: "left", op: Node("d:notEquals", Text("!="))}))
        .a(Inf({p: 6, ass: "left", op: Node("d:smallerEquals", Text("<="))}))
        .a(Inf({p: 6, ass: "left", op: Node("d:smaller", Text("<"))}))
        .a(Inf({p: 6, ass: "left", op: Node("d:biggerEquals", Text(">="))}))
        .a(Inf({p: 6, ass: "left", op: Node("d:bigger", Text(">"))}))
        .a(Inf({p: 6, ass: "left", op: Node("d:in", Text("in"))}))
        .a(Inf({p: 7, ass: "right", op: Node("d:cons", Text("|>"))}))
        .a(Inf({p: 8, ass: "left", op: Node("d:snoc", Text("<|"))}))
        .a(Inf({p: 9, ass: "left", op: Node("d:concat", Text("++"))}))
        .a(Inf({p: 10, ass: "left", op: Node("d:add", Text("+"))}))
        .a(Inf({p: 10, ass: "left", op: Node("d:subtract", Text("-"))}))
        .a(Inf({p: 11, ass: "left", op: Node("d:divide", Text("/"))}))
        .a(Inf({p: 11, ass: "left", op: Node("d:div", Text("div"))}))
        .a(Inf({p: 11, ass: "left", op: Node("d:mod", Text("mod"))}))
        .a(Inf({p: 12, ass: "left", op: Node("d:multiply", Text("*"))}))
        .a(Inf({p: 12, ass: "left", op: Node("d:index", Text("."))}))
        .a(Suf({p: 0, op: Node("d:where", Text("whr"), assignmentListParser, Text("end"))}))
        .finish()
);
const dataExprRecParser = Rec(dataExprParser);
const dataExprListParser = ListNode("d:dataExprList", dataExprRecParser);
const bagEnumEltParser = Node("d:bagEnumElt", dataExprRecParser, Text(":"), dataExprRecParser);
const bagEnumEltListParser = ListNode("d:bagEnumEltList", bagEnumEltParser);
const idListParser = ListNode("d:idList", idParser);
const varDeclParser = Node("d:varDecl", idParser, Text(":"), sortExprParser);
const varsDeclParser = Node("d:varsDecl", idListParser, Text(":"), sortExprRecParser);
const varsDeclListParser = ListNode("d:varsDeclList", varsDeclParser);
const assignmentParser = Node("d:assignment", idParser, Text("="), dataExprRecParser);
const assignmentListParser = ListNode("d:assignmentList", assignmentParser);

export type IDataExprNodes = TGetTypeOfParser<
    | typeof dataExprParser
    | typeof dataExprListParser
    | typeof bagEnumEltParser
    | typeof bagEnumEltListParser
    | typeof idListParser
    | typeof varDeclParser
    | typeof varsDeclParser
    | typeof varsDeclListParser
    | typeof assignmentParser
    | typeof assignmentListParser
    | typeof numberParser
>;

// Action parsers
const actionParser = Node("a:action", idParser, Opt(Text("("), dataExprListParser, Text(")")));
const actionListParser = ListNode("a:actions", actionParser, Text("|"));
const tauParser = Node("a:tau", Text("tau"));
const multActParser = Node("a:multAct", tauParser.or(actionListParser));

export type IActionNodes = TGetTypeOfParser<
    typeof actionParser | typeof actionListParser | typeof tauParser | typeof multActParser
>;

// Action formula parser
export const actFrmParser = P.lazy(() =>
    createOpParser<IAnyNode>("actFrm")
        .a(Base({p: 50, op: Node("af:data", Text("val"), Text("("), dataExprParser, Text(")"))}))
        .a(Base({p: 50, op: multActParser}))
        .a(Base({p: 50, op: Node("af:group", Text("("), actFrmRecParser, Text(")"))}))
        .a(Base({p: 40, op: Node("af:bool", Text("true").or(Text("false")))}))
        .a(Pref({p: 21, op: Node("af:forall", Text("forall"), varsDeclListParser, Text("."))}))
        .a(Pref({p: 21, op: Node("af:exists", Text("exists"), varsDeclListParser, Text("."))}))
        .a(Inf({p: 22, op: Node("af:implies", Text("=>"))}))
        .a(Inf({p: 23, op: Node("af:or", Text("||"))}))
        .a(Inf({p: 24, op: Node("af:and", Text("&&"))}))
        .a(Suf({p: 25, op: Node("af:time", Text("@"), dataExprParser)}))
        .a(Pref({p: 26, op: Node("af:negate", Text("!"))}))
        .finish()
);
const actFrmRecParser = Rec(actFrmParser);

export type IActFrmNodes = TGetTypeOfParser<typeof actFrmParser>;

// Regular formula parser
export const regFrmParser = P.lazy(() =>
    createOpParser<IAnyNode>("regFrm")
        .a(Base({p: 50 /* 30 */, op: actFrmParser}))
        .a(Base({p: 50, op: Node("rf:group", Text("("), regFrmRecParser, Text(")"))}))
        .a(Inf({p: 31, op: Node("rf:opt", Text("+"))}))
        .a(Inf({p: 32, op: Node("rf:seq", Text("."))}))
        .a(Suf({p: 33, op: Node("rf:zeroOrMore", Text("*"))}))
        .a(Suf({p: 33, op: Node("rf:oneOrMore", Text("+").notFollowedBy(regFrmRecParser))}))
        .finish()
);
const regFrmRecParser = Rec(regFrmParser);

export type IRegFrmNodes = TGetTypeOfParser<typeof regFrmParser>;

// State formula parser
export const stateFrmParser = P.lazy(() =>
    createOpParser<IAnyNode>("stateFrm")
        .a(Base({p: 50, op: Node("sf:data", Text("val"), Text("("), dataExprParser, Text(")"))}))
        .a(Base({p: 50, op: Node("sf:group", Text("("), stateFrmRecParser, Text(")"))}))
        .a(Base({p: 50, op: Node("sf:bool", Text("true").or(Text("false")))}))
        .a(Base({p: 50, op: Node("sf:delay", Text("delay"), Opt(Text("@"), dataExprParser))}))
        .a(Base({p: 50, op: Node("sf:yaled", Text("yaled"), Opt(Text("@"), dataExprParser))}))
        .a(Pref({p: 50, op: Node("sf:mu", Text("mu"), stateVarDeclParser, Text("."))}))
        .a(Pref({p: 50, op: Node("sf:nu", Text("nu"), stateVarDeclParser, Text("."))}))
        .a(Pref({p: 50, op: Node("sf:forall", Text("forall"), varsDeclListParser, Text("."))}))
        .a(Pref({p: 50, op: Node("sf:exists", Text("exists"), varsDeclListParser, Text("."))}))
        .a(Inf({p: 43, ass: "right", op: Node("sf:implies", Text("=>"))}))
        .a(Inf({p: 44, ass: "right", op: Node("sf:or", Text("||"))}))
        .a(Inf({p: 45, ass: "right", op: Node("sf:and", Text("&&"))}))
        .a(Pref({p: 50, op: Node("sf:forallPaths", Text("["), regFrmParser, Text("]"))}))
        .a(Pref({p: 50, op: Node("sf:existsPath", Text("<"), regFrmParser, Text(">"))}))
        .a(Pref({p: 50, op: Node("sf:negate", Text("!"))}))
        .a(Base({p: 50, op: Node("sf:simpleData", idParser, Opt(Text("("), dataExprListParser, Text(")")))}))
        .finish()
);
const stateFrmRecParser = Rec(stateFrmParser);
const stateVarAssignmentParser = Node("sf:stateVarAssignment", idParser, Text(":"), sortExprParser, Text("="), dataExprRecParser);
const stateVarAssignmentListParser = ListNode("sf:stateVarAssignmentList", stateVarAssignmentParser);
const stateVarDeclParser = Node("sf:stateVarDecl", idParser, Opt(Text("("), stateVarAssignmentListParser, Text(")")));

export type IStateFrmNodes = TGetTypeOfParser<
    typeof stateFrmParser | typeof stateVarAssignmentParser | typeof stateVarAssignmentListParser | typeof stateVarDeclParser
>;

export type IAllNodes = IStateFrmNodes | IRegFrmNodes | IActFrmNodes | IActionNodes | IDataExprNodes | ISortExprNodes;
