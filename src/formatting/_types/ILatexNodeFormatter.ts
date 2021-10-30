import {IAllNodes} from "../../parser/_types/nodeTypes";

/**
 * A function to format a mCRL2 node
 */
export type ILatexNodeFormatter<K extends IAllNodes> = {
    /**
     * Given a node and a recursion function, outputs the string for th enode
     * @param node The node to format
     * @returns 
     */
    (node: K, rec: {(node: IAllNodes, right: boolean): string}): string;
