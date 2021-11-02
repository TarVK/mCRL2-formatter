import {INode, ITextOrNode} from "./INode";

/** Suffixes the children of a node with a given other node */
export type TSuffixNode<N extends INode<string, any>, P extends ITextOrNode> = INode<
    N extends INode<infer T, any> ? T : never,
    N extends INode<string, infer C> ? [...C, P] : never
>;
