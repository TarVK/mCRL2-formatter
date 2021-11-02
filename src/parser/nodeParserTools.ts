import P, {Parser} from "parsimmon";
import {IAnyNode, INode, IText, ITextOrNode} from "./_types/INode";
import {TGetTypeOfParsers} from "./_types/TGetTypeOfParsers";
import {TFlattenTuple} from "./_types/TFlattenTuple";
import {TMapTuple} from "./_types/TMapTuple";
import {TSuffixNode} from "./_types/TSuffixNode";
import {TPrefixNode} from "./_types/TPrefixNode";
import {TGetTypeOfParser} from "./_types/TGetTypeOfParser";

/**
 * Creates a text parser for the given text
 * @param text The text to be parsed
 * @returns The text parser
 */
export const Text = (text: string | RegExp): Parser<IText> =>
    P.seq(P.regex(/\s*/), text instanceof RegExp ? P.regexp(text) : P.string(text), P.regex(/\s*/), P.index).map(
        ([p, t, s, d]) => {
            const text = `${p}${t}${s}`;
            return {
                text,
                range: {
                    start: d.offset - text.length,
                    end: d.offset,
                },
            };
        }
    );

/**
 * Creates a node parser from the given name and syntax parsers
 * @param name The type name of the node parser to construct
 * @param parsers The parsers for this node types
 * @returns The created parser
 */
export const Node = <N extends string, C extends Parser<ITextOrNode | (ITextOrNode | null)[]>[]>(
    name: N,
    ...parsers: C
): Parser<INode<N, TFlattenTuple<TGetTypeOfParsers<C>>>> =>
    P.seq(...parsers).map(children => {
        const flattened = children.flat();
        const nonNull = flattened.filter((n): n is ITextOrNode => !!n);
        const node: INode<string, any> = {
            type: name,
            children: flattened,
            range: {
                start: nonNull.reduce((min, {range: {start}}) => Math.min(min, start), Infinity),
                end: nonNull.reduce((max, {range: {end}}) => Math.max(max, end), 0),
            },
        };
        return node;
    }) as Parser<INode<N, TFlattenTuple<TGetTypeOfParsers<C>>>>;

/**
 * Creates an optional parser for the given parsers
 * @param parsers The parsers that should be optional
 * @returns The created optional parsers
 */
export const Opt = <C extends Parser<ITextOrNode>[]>(
    ...parsers: C
): Parser<TGetTypeOfParsers<C> | TMapTuple<TGetTypeOfParsers<C>, any, null>> =>
    P.seq(...parsers).or(P.of(new Array(parsers.length).fill(null))) as Parser<
        TGetTypeOfParsers<C> | TMapTuple<TGetTypeOfParsers<C>, any, null>
    >;

/**
 * Creates a list node parser
 * @param name The name of the node type
 * @param nodeParser The parser of the node to be in the list
 * @param sep The parser for the separators
 * @returns The created parser
 */
export const ListNode = <N extends string, C extends ITextOrNode, D extends ITextOrNode = IText>(
    name: N,
    nodeParser: Parser<C>,
    sep: Parser<D> = Text(",") as any
): Parser<INode<N, [C, ...([D, IAnyNode] | [null, null])]>> => {
    const parser: Parser<IAnyNode> = P.lazy(() => Node(name, nodeParser, Opt(sep, parser))) as any;
    return parser as any;
};

/**
 * Strips type annotations from a parser in order to allow it to be used in a recursive definition
 * @param parser The parser to strip the specific type data from
 * @returns The same parser with generalized type data
 */
export const Rec = (parser: Parser<IAnyNode>): Parser<IAnyNode> => parser;

/**
 * Creates an infix operator from the given configuration
 * @param config The operator's configuration
 * @returns The operator that can be added to an `opParser`
 */
export const Inf = <E extends Parser<IAnyNode>>({
    p,
    ass,
    op,
}: {
    /** The precedence of the */
    p: number;
    /** Associativity */
    ass?: "left" | "right";
    /** The operator parser */
    op: E;
}): {
    /** The operator type */
    t: "i";
    /** The precedence of the */
    p: number;
    /** Associativity */
    ass: "left" | "right";
    /** The operator parser */
    op: Parser<(left: IAnyNode, right: IAnyNode) => TSuffixNode<TPrefixNode<TGetTypeOfParser<E>, IAnyNode>, IAnyNode>>;
} => ({
    t: "i",
    p,
    ass: ass ?? "left",
    op: op.map(res => (left: IAnyNode, right: IAnyNode) => ({
        ...res,
        precedence: p,
        associativity: ass ?? "left",
        children: [left, ...res.children, right],
    })) as any,
});

/**
 * Creates a prefix operator from the given configuration
 * @param config The operator's configuration
 * @returns The operator that can be added to an `opParser`
 */
export const Pref = <E extends Parser<IAnyNode>>({
    p,
    op,
}: {
    /** The precedence of the */
    p: number;
    /** The operator parser */
    op: E;
}): {
    /** The operator type */
    t: "p";
    /** The precedence of the */
    p: number;
    /** The operator parser */
    op: Parser<(right: IAnyNode) => TSuffixNode<TGetTypeOfParser<E>, IAnyNode>>;
} => ({
    t: "p",
    p,
    op: op.map(res => (right: IAnyNode) => ({
        ...res,
        precedence: p,
        children: [...res.children, right],
    })) as any,
});

/**
 * Creates a suffix operator from the given configuration
 * @param config The operator's configuration
 * @returns The operator that can be added to an `opParser`
 */
export const Suf = <E extends Parser<IAnyNode>>({
    p,
    op,
}: {
    /** The precedence of the */
    p: number;
    /** The operator parser */
    op: E;
}): {
    /** The operator type */
    t: "s";
    /** The precedence of the */
    p: number;
    /** The operator parser */
    op: Parser<(left: IAnyNode) => TPrefixNode<TGetTypeOfParser<E>, IAnyNode>>;
} => ({
    t: "s",
    p,
    op: op.map(res => (left: IAnyNode) => ({
        ...res,
        precedence: p,
        children: [left, ...res.children],
    })) as any,
});

/**
 * Creates a base operator from the given configuration
 * @param config The operator's configuration
 * @returns The operator that can be added to an `opParser`
 */
export const Base = <E extends Parser<IAnyNode>>({
    p,
    op,
}: {
    /** The precedence of the */
    p?: number;
    /** The operator parser */
    op: E;
}): {
    /** The operator type */
    t: "b";
    /** The precedence of the */
    p: number;
    /** The operator parser */
    op: E;
} => ({
    t: "b",
    p: p ?? Infinity,
    op: op.map(res => ({
        ...res,
        precedence: p ?? Infinity,
        children: res.children,
    })) as any,
});
