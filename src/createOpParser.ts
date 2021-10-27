import {IOpParser} from "./_types/IOpParser";
import P, {Parser} from "parsimmon";
import {IBaseOp, IInfixOp, IOp, IPrefixOp, ISuffixOp} from "./_types/operatorsSpec";
import {INode} from "./_types/nodeTypes";

/**
 * Constructs a new operator parser which operators can be added to
 * @returns The constructed operator parser
 */
export const createOpParser = <B = unknown>(): IOpParser<B, never> => createParser([]);

const createParser = <B, R extends B>(rules: IOp<B, B>[]): IOpParser<B, R> => ({
    a: rule => createParser([...rules, rule]),
    finish: () => {
        const p = (rule: IOp<B, B>): number =>
            rule.p == -1 ? Infinity : rule.p ?? Infinity;
        const augment = <T>(
            node: T,
            {p, t, ass}: {p?: number; t: string; ass?: "left" | "right"}
        ) => ({
            ...node,
            ...(p != undefined && {precedence: p}),
            ...(t == "i" && {associativity: ass ?? "left"}),
        });

        // Sort the rules from highest to lowest precedence
        rules.sort((a, b) => p(b) - p(a));

        const precedenceGrouped = rules
            .reduce((grouped, rule) => {
                const precedence = p(rule);
                for (let i = 0; i < grouped.length; i++) {
                    const group = grouped[i];
                    if (group.precedence == precedence)
                        return [
                            ...grouped.slice(0, i),
                            {precedence, items: [...group.items, rule]},
                            ...grouped.slice(i + 1),
                        ];
                    if (group.precedence < precedence)
                        return [
                            ...grouped.slice(0, i),
                            {precedence, items: [rule]},
                            ...grouped.slice(i),
                        ];
                }
                return [...grouped, {precedence, items: [rule]}];
            }, [] as {precedence: number; items: IOp<B, B>[]}[])
            .map(({items}) => items);

        const typeGrouped = precedenceGrouped.map(rules => {
            const infix = rules.filter((op): op is IInfixOp<B, R> => op.t == "i");
            const ops = <P extends IInfixOp<B, B> | ISuffixOp<B, B> | IPrefixOp<B, B>>(
                rules: P[]
            ): Parser<P extends {op: Parser<infer X>} ? X : never>[] =>
                rules.map(({op, ...data}) =>
                    op.map(
                        out =>
                            (...args: [any, any]) =>
                                augment(out(...args), data)
                    )
                ) as any;

            return {
                prefix: ops(rules.filter((op): op is IPrefixOp<B, R> => op.t == "p")),
                suffix: ops(rules.filter((op): op is ISuffixOp<B, R> => op.t == "s")),
                rightInfix: ops(infix.filter(({ass: as}) => as == "right")),
                leftInfix: ops(infix.filter(({ass: as}) => as != "right")),
                base: rules
                    .filter((op): op is IBaseOp<R> => op.t == "b")
                    .map(({op, ...data}) => op.map(out => augment(out, data))),
            };
        });

        const parser: Parser<B> = typeGrouped.reduce<Parser<B>>(
            (nextParser, {prefix, suffix, leftInfix, rightInfix, base}, i) => {
                const baseParser: Parser<B> =
                    base.length > 0 || prefix.length > 0
                        ? P.lazy(() =>
                              P.alt(
                                  ...base,
                                  ...prefix.map(parser =>
                                      P.seq(parser, baseParser).map(([combiner, expr]) =>
                                          combiner(expr)
                                      )
                                  ),
                                  ...(i == 0 ? [] : [nextParser])
                              )
                          )
                        : i == 0
                        ? P.fail("Parser should have a base case")
                        : nextParser;

                const rightRecursiveParser: Parser<B> =
                    rightInfix.length > 0
                        ? P.lazy(() =>
                              baseParser.chain(leftValue =>
                                  P.seq(P.alt(...rightInfix), rightRecursiveParser)
                                      .map(([combiner, rightValue]) =>
                                          combiner(leftValue, rightValue)
                                      )
                                      .or(P.of(leftValue))
                              )
                          )
                        : baseParser;
                const leftRecursiveParser =
                    leftInfix.length > 0 || suffix.length > 0
                        ? P.seq(
                              rightRecursiveParser,
                              P.alt<
                                  | [(left: B, right: B) => R, B]
                                  | readonly [(left: B) => R]
                              >(
                                  ...leftInfix.map(op => P.seq(op, rightRecursiveParser)),
                                  ...suffix.map(op =>
                                      op.map(combiner => [combiner] as const)
                                  )
                              ).many()
                          ).map(([first, rest]) =>
                              rest.reduce(
                                  (formula, [combiner, nextValue]) =>
                                      combiner(formula, nextValue!),
                                  first
                              )
                          )
                        : rightRecursiveParser;

                return leftRecursiveParser;
            },
            P.lazy(() => parser)
        );

        return parser as Parser<R>;
    },
});
