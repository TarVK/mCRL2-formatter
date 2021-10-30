import {IAllNodes, INode} from "../../parser/_types/nodeTypes";

/** Obtains a node type from its name */
export type TNodeByName<N extends IAllNodes["type"]> = {
    [P in IAllNodes["type"]]: IAllNodes extends infer T ? (T extends INode<P, object> ? T : never) : never;
}[N];
