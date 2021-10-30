import {Parser} from "parsimmon";
import {IBaseOp, IInfixOp, IPrefixOp, ISuffixOp} from "./operatorsSpec";

/**
 * A operator parser that can be constructed step by step
 * @param B The base structure that all nodes share, and can be used in mapping
 * @param R The accumulated output structure
 */
export type IOpParser<B, R> = {
    /**
     * Adds an infix rule to the parser
     * @param rule The rule to be added
     * @returns The new op parser
     */
    a<O extends B>(rule: IInfixOp<B, O>): IOpParser<B, R | O>;

    /**
     * Adds a prefix rule to the parser
     * @param rule The rule to be added
     * @returns The new op parser
     */
    a<O extends B>(rule: IPrefixOp<B, O>): IOpParser<B, R | O>;

    /**
     * Adds a suffix rule to the parser
     * @param rule The rule to be added
     * @returns The new op parser
     */
    a<O extends B>(rule: ISuffixOp<B, O>): IOpParser<B, R | O>;

    /**
     * Adds a base rule to the parser
     * @param rule The rule to be added
     * @returns The new op parser
     */
    a<O extends B>(rule: IBaseOp<O>): IOpParser<B, R | O>;

    /**
     * Creates the parser from the specified rules
     * @returns The parser
     */
    finish(): Parser<R>;
};
