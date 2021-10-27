export type INode<N, D = {}> = {
    type: N;
    precedence?: number;
    associativity?: "left" | "right";
} & D;

export type IIdNode = INode<"id", {name: string}>;
export type INumberNode = INode<"number", {value: number}>;

// Sorts
export type IBoolSortNode = INode<"s_bool">;
export type IPosSortNode = INode<"s_pos">;
export type INatSortNode = INode<"s_nat">;
export type IIntSortNode = INode<"s_int">;
export type IRealSortNode = INode<"s_real">;
export type IListSortNode = INode<"s_list", {of: ISortExpr}>;
export type ISetSortNode = INode<"s_set", {of: ISortExpr}>;
export type IBagSortNode = INode<"s_bag", {of: ISortExpr}>;
export type IFSetSortNode = INode<"s_fSet", {of: ISortExpr}>;
export type IFBagSortNode = INode<"s_fBag", {of: ISortExpr}>;
export type ISortGroupNode = INode<"s_group", {expr: ISortExpr}>;

export type IProjNode = INode<"s_proj", {name?: string; type: ISortExpr}>;
export type IConstrNode = INode<
    "s_constr",
    {name: string; args: IProjNode[]; testFunc?: string}
>;
export type IStructSortNode = INode<"s_struct", {constructors: IConstrNode[]}>;

export type IFuncSortNode = INode<"s_func", {from: ISortExpr; to: ISortExpr}>;
export type IProdSortNode = INode<"s_prod", {typeA: ISortExpr; typeB: ISortExpr}>;

export type ISortExpr =
    | IBoolSortNode
    | IPosSortNode
    | INatSortNode
    | IIntSortNode
    | IRealSortNode
    | IListSortNode
    | ISetSortNode
    | ISetSortNode
    | IBagSortNode
    | IFSetSortNode
    | IFBagSortNode
    | IIdNode
    | IStructSortNode
    | IFuncSortNode
    | IProdSortNode
    | ISortGroupNode;

// Data
export type IBoolNode = INode<"d_bool", {val: boolean}>;
export type IVarDecl = INode<"d_varsDecl", {id: string; sort: ISortExpr}>;
export type IListNode = INode<"d_list", {elements: IDataExpr[]}>;
export type ISetNode = INode<"d_set", {elements: IDataExpr[]}>;
export type ISetComprNode = INode<"d_setCompr", {variable: IVarDecl; expr: IDataExpr}>;
export type IBagNode = INode<
    "d_bag",
    {elements: {element: IDataExpr; count: IDataExpr}[]}
>;
export type IDataGroupNode = INode<"d_group", {expr: IDataExpr}>;
export type IMapNode = INode<"d_map", {func: IDataExpr; from: IDataExpr; to: IDataExpr}>;
export type IApplyNode = INode<"d_apply", {func: IDataExpr; arguments: IDataExpr[]}>;
export type INegateNode = INode<"d_negate", {expr: IDataExpr}>;
export type INegativeNode = INode<"d_negative", {expr: IDataExpr}>;
export type ISizeNode = INode<"d_size", {collection: IDataExpr}>;
export type IForallNode = INode<"d_forall", {vars: IVarDecl[]; expr: IDataExpr}>;
export type IExistNode = INode<"d_exist", {vars: IVarDecl[]; expr: IDataExpr}>;
export type ILambdaNode = INode<"d_lambda", {vars: IVarDecl[]; expr: IDataExpr}>;
export type IBinaryOpNode = INode<
    "d_binOp",
    {
        type:
            | "=>"
            | "||"
            | "&&"
            | "=="
            | "!="
            | "<"
            | "<="
            | ">="
            | ">"
            | "in"
            | "|>"
            | "<|"
            | "++"
            | "+"
            | "-"
            | "/"
            | "div"
            | "mod"
            | "*"
            | ".";
        exprA: IDataExpr;
        exprB: IDataExpr;
    }
>;
export type IAssignmentNode = INode<"d_assign", {name: string; value: IDataExpr}>;
export type IWhereNode = INode<"d_where", {expr: IDataExpr; vars: IAssignmentNode[]}>;

export type IDataExpr =
    | IIdNode
    | INumberNode
    | IBoolNode
    | IListNode
    | ISetNode
    | ISetComprNode
    | IBagNode
    | IMapNode
    | IApplyNode
    | INegateNode
    | INegativeNode
    | ISizeNode
    | IForallNode
    | IExistNode
    | ILambdaNode
    | IBinaryOpNode
    | IAssignmentNode
    | IWhereNode
    | IDataGroupNode;

// Actions
export type IActionNode = INode<"a_action", {name: string; args: IDataExpr[]}>;
export type IActionSetNode = INode<"a_set", {actions: string[]}>;
/** Not complete, but no more is needed for mu calculus */

export type IActionListNode = INode<"a_list", {actions: IActionListNode[]}>;
export type ITauAction = INode<"a_tau">;
export type IMultAct = IActionListNode | ITauAction;

// Action formulas
export type IFrmForallNode = INode<"f_forall", {vars: IVarDecl[]; expr: IActFrm}>;
export type IFrmExistsNode = INode<"f_exists", {vars: IVarDecl[]; expr: IActFrm}>;
export type IFrmBinaryOpNode = INode<
    "f_binOp",
    {type: "=>" | "||" | "&&"; exprA: IActFrm; exprB: IActFrm}
>;
export type ITimeNode = INode<"f_time", {expr: IActFrm; time: IDataExpr}>;
export type IFrmNegateNode = INode<"f_negate", {expr: IActFrm}>;
export type IActFrm =
    | IDataExpr
    | IMultAct
    | IFrmForallNode
    | IFrmExistsNode
    | IFrmBinaryOpNode
    | ITimeNode
    | IFrmNegateNode;

// Regular formulas
export type IFrmOptNode = INode<"f_opt", {exprA: IRegFrm; exprB: IRegFrm}>;
export type IFrmSeqNode = INode<"f_seq", {exprA: IRegFrm; exprB: IRegFrm}>;
export type IFrmOneOrMoreNode = INode<"f_oneOrMore", {expr: IRegFrm}>;
export type IFrmZeroOrMoreNode = INode<"f_zeroOrMore", {expr: IRegFrm}>;
export type IRegFrm =
    | IActFrm
    | IFrmOptNode
    | IFrmSeqNode
    | IFrmOneOrMoreNode
    | IFrmZeroOrMoreNode;

// State formulas
export type IStateVarsDecl = INode<
    "sf_varsDecl",
    {id: string; sort: ISortExpr; init: IDataExpr}
>;
export type IDelayNode = INode<"sf_delay", {expr: IDataExpr}>;
export type IYaledNode = INode<"sf_yaled", {expr: IDataExpr}>;
export type IMuNode = INode<"sf_mu", {vars: IStateVarsDecl[]; expr: IStateFrm}>;
export type INuNode = INode<"sf_nu", {vars: IStateVarsDecl[]; expr: IStateFrm}>;
export type IStateFrmForallNode = INode<"sf_forall", {vars: IVarDecl[]; expr: IStateFrm}>;
export type IStateFrmExistsNode = INode<"sf_exists", {vars: IVarDecl[]; expr: IStateFrm}>;
export type IStateFrmBinaryOpNode = INode<
    "sf_binOp",
    {type: "=>" | "||" | "&&"; exprA: IStateFrm; exprB: IStateFrm}
>;
export type IStateFrmForallPathsNode = INode<
    "sf_forallPaths",
    {path: IRegFrm; expr: IStateFrm}
>;
export type IStateFrmExistPathNode = INode<
    "sf_existPath",
    {path: IRegFrm; expr: IStateFrm}
>;
export type IStateFrmNegateNode = INode<"sf_negate", {expr: IStateFrm}>;
export type IStateFrm =
    | IActFrm
    | IDelayNode
    | IYaledNode
    | IMuNode
    | INuNode
    | IStateFrmForallNode
    | IStateFrmExistsNode
    | IStateFrmBinaryOpNode
    | IStateFrmForallPathsNode
    | IStateFrmExistPathNode
    | IStateFrmNegateNode;
