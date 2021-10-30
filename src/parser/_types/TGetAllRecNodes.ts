import {IFuncSortNode, IBoolSortNode, INode, IStateFrm, IConstrNode, ISortExpr, IDataExpr} from "./nodeTypes";
import {TOneOfUnion} from "./TOneOfUnion";

export type TGetAllRecNodes<
    N extends INode<string, object>,
    E extends INode<string, object>,
    /** Get a single element of the union of nodes N */
    K = TOneOfUnion<N>,
    /** Whether no nodes are left in the union */
    L = [N] extends [never] ? true : false,
    /** The extracted recursive nodes from N */
    R = K extends INode<string, infer C> ? (C extends Object ? TGetTypesOfObject<Omit<C, "type">, E> : never) : never
> = L extends true
    ? never
    : K extends INode<string, infer C>
    ? K | R | TGetAllRecNodes<Exclude<N, K>, E | (R extends INode<string, object> ? R : never)>
    : never;

export type TGetTypesOfObject<C extends object, E extends INode<string, object>> = [C[keyof C]] extends [infer K]
    ? TGetRecNodes<K, E>
    : never;

export type TGetRecNodes<C, E extends INode<string, object>> = C extends INode<string, object>
    ? C extends E
        ? never
        : TGetAllRecNodes<C, E | C>
    : C extends object
    ? TGetTypesOfObject<C, E>
    : C extends Array<any>
    ? TGetTypesOfArray<C, E>
    : never;

export type TGetTypesOfArray<C extends Array<any>, E extends INode<string, object>> = [C[number]] extends [infer K]
    ? TGetRecNodes<K, E>
    : never;

type K<C extends Object> = C[keyof C] extends infer K ? K : never;
type S = K<{shit: 3; stuff: "yes"}>;

type A = INode<"shit", {a: B}>;
type B = INode<"stuff", {b1: A[]; b2: A[]; b3: A[]; b4: A[]; b5: A[]; b6: A[]; b7: A[]; b8: A[]; b9: A[]}>;
type T = TGetAllRecNodes<ISortExpr, ISortExpr>;
const p: T = {type: "s_proj"};

type P = "test" extends Object ? true : false;
