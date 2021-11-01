import {IAnyNode} from "../../parser/_types/INode";
import {TMapTuple} from "../../parser/_types/TMapTuple";

export type INodeMapper<T extends IAnyNode, O, C, I = O> = {
    /**
     * Maps the given node and its recursive result to an output
     * @param children The children with the child nodes replaced by their output
     * @param config The configuration options
     * @param node The full original node
     * @returns Some output
     */
    (children: TMapTuple<T["children"], IAnyNode, O>, config: C, node: T): I;
};
