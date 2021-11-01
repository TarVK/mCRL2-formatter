import {IAnyNode, IListNode, INode} from "./INode";

/**
 * Recursively extracts all descendants from a node.
 * This works fully, but seems to stress the TS server a fair bit.
 */
export type TGetDescendantNodes<S extends IAnyNode> = TGetChildNodes<S> extends infer D
    ? S | D | (D extends IAnyNode ? TGetDescendantNodes<D> : never)
    : never;

/** Retrieves all child nodes from a given node */
export type TGetChildNodes<S extends IAnyNode> = IAnyNode extends S
    ? never
    :
          | (S extends INode<string, infer C>
                ? C extends infer K
                    ? K extends any[]
                        ? TGetNodesFromTuple<K>
                        : never
                    : never
                : never)
          | (S extends IListNode<string, infer C, infer D>
                ?
                      | (C extends IAnyNode ? (IAnyNode extends C ? never : TGetDescendantNodes<C>) : never)
                      | (D extends IAnyNode ? (IAnyNode extends D ? never : TGetDescendantNodes<D>) : never)
                : never);

/** Extracts all (non-'IAnyNode') nodes from a tuple */
export type TGetNodesFromTuple<T extends IAnyNode[]> = T extends [infer F, ...infer R]
    ? (F extends IAnyNode ? (IAnyNode extends F ? never : F) : never) | (R extends any[] ? TGetNodesFromTuple<R> : never)
    : never;
