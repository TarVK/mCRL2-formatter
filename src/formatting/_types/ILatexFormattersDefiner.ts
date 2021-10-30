import {IAllNodes, INode} from "../../parser/_types/nodeTypes";
import {ILatexNodeFormatter} from "./ILatexNodeFormatter";
import {INodeFormattersObject} from "./INodeFormattersObject";
import {TNodeByName} from "./TNodeByName";

export type ILatexFormattersDefiner<O extends IAllNodes = IAllNodes, D extends IAllNodes = never> = {
    /**
     * Define a latex formatter, checking its type
     * @param type The name oft he node type to handle
     * @param format The formatting function itself
     * @returns The type checked and combined data
     */
    a<N extends O["type"], K extends IAllNodes = TNodeByName<N>>(
        type: N,
        format: ILatexNodeFormatter<K>
    ): ILatexFormattersDefiner<Exclude<O, K>, D | K>;

    /**
     * Finishes the formatters object
     * @returns The formatters object
     */
    finish(): INodeFormattersObject<D>;
};
