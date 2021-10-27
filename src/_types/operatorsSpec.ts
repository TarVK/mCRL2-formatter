import {Parser} from "parsimmon";

/** A prefix operator parser spec */
export type IPrefixOp<R, O> = {
    /** The type of the operator, prefix */
    t: "p";
    /**
     * The parser of the operator,
     * which specifies how to get an output value given an expression
     */
    op: Parser<(expr: R) => O>;
    /** The precedence of the operator */
    p: number;
};

/** A binary operator parser spec */
export type IInfixOp<R, O> = {
    /** The type of the operator, infix */
    t: "i";
    /** Whether the operator is left or right associative */
    ass?: "left" | "right";
    /**
     * The parser of the operator,
     * which specifies how to get an output value given a left and right expression
     */
    op: Parser<(left: R, right: R) => O>;
    /** The precedence of the operator */
    p: number;
};

/** A suffix operator parser spec */
export type ISuffixOp<R, O> = {
    /** The type of the operator, suffix */
    t: "s";
    /**
     * The parser of the operator,
     * which specifies how to get an output value given an expression
     */
    op: Parser<(expr: R) => O>;
    /** The precedence of the operator */
    p: number;
};

/** A non recursive parser spec */
export type IBaseOp<O> = {
    /** The type of the operator, base */
    t: "b";
    /**
     * The parser of the operator,
     * which specifies how to get an output value given an expression
     */
    op: Parser<O>;
    /** The precedence of the operator */
    p?: number;
};

/** A operator parser spec */
export type IOp<R, O> = IInfixOp<R, O> | ISuffixOp<R, O> | IPrefixOp<R, O> | IBaseOp<O>;
