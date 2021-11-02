import {INode, ITextOrNode} from "./INode";

/** Prefixes the children of a node with a given other node */
export type TPrefixNode<N extends INode<string, any>, P extends ITextOrNode> = INode<
    N extends INode<infer T, any> ? T : never,
    N extends INode<string, infer C> ? [P, ...C] : never
>;
