import {IAnyNode, INode} from "../../parser/_types/INode";
import {INodeMapper} from "./INodeMapper";

/** The set of mappers fora  given collection of node types */
export type INodeMappers<T extends IAnyNode, O, C, I = O> = {
    [P in T["type"]]: T extends infer U ? (U extends INode<P, any, any> ? INodeMapper<U, O, C, I> : never) : never;
};
