import {IAllNodes} from "../parser/muCalculusParser";
import {IAnyNode, IText} from "../parser/_types/INode";
import {INodeMappers} from "./_types/INodeMappers";

/**
 * Creates a new recursive node mapper
 * @param postProcess Performs some general post-processing
 * @param mappers The mappers for each of the node types
 * @returns The recursive mapper
 */
export const createRecursiveNodeMapper = <A extends IAnyNode, O, C, I = O>(
    postProcess: (result: I, parent: A, config: C) => O,
    mappers: INodeMappers<A, O, C, I>
): ((node: A, config: C) => O) => {
    const rec = (node: A, config: C) => {
        const type = node.type;
        const mapper = mappers[type as keyof typeof mappers];
        const children = node.children.map(child => (child && "type" in child ? rec(child as any, config) : child));
        const result = (mapper as any)(children, config, node);
        const final = postProcess(result, node, config);
        return final;
    };
    return rec;
};
