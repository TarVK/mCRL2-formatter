import {IAnyNode, INode} from "./INode";

/** Obtains a node type from its name */
export type TGetNodeByName<N extends T["type"], T extends IAnyNode> = T extends infer U
    ? U extends INode<N, any[], boolean>
        ? U
        : never
    : never;
// export type TGetNodeByName<N extends T["type"], T extends IAnyNode> = {
//     [P in T["type"]]: T extends infer U ? (U extends INode<P, any[], boolean> ? U : never) : never;
// }[N];
