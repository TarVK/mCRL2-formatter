import {IAllNodes} from "../parser/_types/nodeTypes";
import {ILatexFormattersDefiner} from "./_types/ILatexFormattersDefiner";
import {INodeFormattersObject} from "./_types/INodeFormattersObject";

/**
 * Creates a object that can be used to create a formatters object while providing nice intellisense to check whether the list is exhaustive
 * @returns A latex formatter definer
 */
export function createFormatters(): ILatexFormattersDefiner {
    return createFormattersInner({});
}

function createFormattersInner<O extends IAllNodes = IAllNodes, D extends IAllNodes = never>(
    obj: INodeFormattersObject<D>
): ILatexFormattersDefiner<O, D> {
    return {
        a: (type, format) => createFormattersInner({...obj, [type]: format}),
        finish: () => obj,
    };
}
