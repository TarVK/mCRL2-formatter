import {INode} from "../parser/_types/nodeTypes";

/**
 * mapes a node recursively to a certain output
 * @param mapper The mapper that can use a recursion function
 * @returns The mapped output
 */
export function mapNode<T extends INode<string, object>, O>(mapper: (node: T, rec: (node: T) => O) => O): O {
    const map = (node: T) => {};
}

export function recMapNode<T extends INode<string, object>, O>(mapper: (node: T, rec: (node: T) => O) => O): O {}
