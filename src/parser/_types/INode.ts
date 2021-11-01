/** A text range */
export type ITextRange = {
    /** The index of the first character of the range */
    start: number;
    /** The index of the end of the range, the character at this index is excluded */
    end: number;
};

/** A text node */
export type IText = {
    /** Some given text from the input */
    text: string;
    /** The character range in this text */
    range: ITextRange;
};

/** Any possible node */
export type IAnyNode = INode<string, (ITextOrNode | null)[], boolean>;

/** Either a node or parsed text */
export type ITextOrNode = IText | IAnyNode;

/** A type for syntax nodes */
export type INode<N extends string = string, C extends (ITextOrNode | null)[] = [IText], L extends boolean = false> = {
    /** The type name of this node */
    type: N;
    /** A text range */
    range: ITextRange;
    /** The children of this node type */
    children: C;
    /** Whether this node represents a right-recursive list */
    isList?: L;
    /** The precedence of the operator that created the node */
    precedence?: number;
    /** The associativity of the operator that created the node */
    associativity?: "left" | "right";
    /** The recursive type this node belongs to */
    recType?: string;
};

/** A recursive definition for a list of nodes */
export type IListNode<N extends string, C extends ITextOrNode, D extends ITextOrNode = IText> = INode<
    N,
    [C, ...([D, IAnyNode] | [null, null])],
    true
>;
