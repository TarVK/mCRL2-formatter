import {IAllNodes} from "../../parser/_types/nodeTypes";
import {ILatexNodeFormatter} from "./ILatexNodeFormatter";
import {TNodeByName} from "./TNodeByName";

/** Specifies the node formatter object for a given set of nodes */
export type INodeFormattersObject<T extends IAllNodes> = {
    [N in T["type"]]: ILatexNodeFormatter<TNodeByName<N>>;
};
