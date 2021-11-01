import {IOpParser} from "./_types/IOpParser";
import P, {Parser} from "parsimmon";
import {IBaseOp, IInfixOp, IOp, IPrefixOp, ISuffixOp} from "./_types/operatorsSpec";

/**
 * Constructs a new operator parser which operators can be added to
 * @param recTypeName The name of the recursive type
 * @returns The constructed operator parser
 */
export const createOpParser = <B = unknown>(recTypeName: string): IOpParser<B, never> => createParser([], recTypeName);

const createParser = <B, R extends B>(rules: IOp<B, B>[], recTypeName: string): IOpParser<B, R> => ({
    a: rule =>
        createParser<any, any>(
            [
                ...rules,
                {
                    ...rule,
                    op:
                        rule.t == "i"
                            ? rule.op.map(out => (left: any, right: any) => ({...out(left, right), recType: recTypeName}))
                            : rule.t == "s"
                            ? rule.op.map(out => (left: any) => ({...out(left), recType: recTypeName}))
                            : rule.t == "p"
                            ? rule.op.map(out => (right: any) => ({...out(right), recType: recTypeName}))
                            : rule.op,
                } as any,
            ],
            recTypeName
        ),
    finish: () => {
        const p = (rule: IOp<B, B>): number => (rule.p == -1 ? Infinity : rule.p ?? Infinity);

        // Sort the rules from highest to lowest precedence
        rules.sort((a, b) => p(b) - p(a));

        const precedenceGrouped = rules
            .reduce((grouped, rule) => {
                const precedence = p(rule);
                for (let i = 0; i < grouped.length; i++) {
                    const group = grouped[i];
                    if (group.precedence == precedence)
                        return [...grouped.slice(0, i), {precedence, items: [...group.items, rule]}, ...grouped.slice(i + 1)];
                    if (group.precedence < precedence)
                        return [...grouped.slice(0, i), {precedence, items: [rule]}, ...grouped.slice(i)];
                }
                return [...grouped, {precedence, items: [rule]}];
            }, [] as {precedence: number; items: IOp<B, B>[]}[])
            .map(({items}) => items);

        const parser: Parser<B> = precedenceGrouped.reduce<Parser<B>>(
            (nextParser, rules, i) => {
                // Base rule parser (both prefix and base ops)
                const baseRules = rules
                    .filter((op): op is IBaseOp<any> | IPrefixOp<any, any> => op.t == "b" || op.t == "p")
                    .map(({op, t}) =>
                        t == "b"
                            ? op
                            : P.seq(
                                  op,
                                  P.lazy(() => baseParser)
                              ).map(([combiner, expr]) => combiner(expr))
                    );
                const baseParser: Parser<B> =
                    baseRules.length > 0
                        ? P.alt(...baseRules, ...(i == 0 ? [] : [nextParser]))
                        : i == 0
                        ? P.fail("Parser should have a base case")
                        : nextParser;

                // Right recursive infix ops parser
                const rightInfixRules = rules
                    .filter((op): op is IInfixOp<any, any> => op.t == "i" && op.ass == "right")
                    .map(({op}) => op);
                const rightRecursiveParser: Parser<B> =
                    rightInfixRules.length > 0
                        ? P.lazy(() =>
                              baseParser.chain(leftValue =>
                                  P.seq(P.alt(...rightInfixRules), rightRecursiveParser)
                                      .map(([combiner, rightValue]) => combiner(leftValue, rightValue))
                                      .or(P.of(leftValue))
                              )
                          )
                        : baseParser;

                // Left recursive infix ops and suffix ops parser
                const leftRecursiveRules = rules
                    .filter(
                        (op): op is IInfixOp<any, any> | ISuffixOp<any, any> => (op.t == "i" && op.ass != "right") || op.t == "s"
                    )
                    .map(({op, t}) => (t == "i" ? P.seq(op, rightRecursiveParser) : op.map(out => [out] as const)));
                const leftRecursiveParser =
                    leftRecursiveRules.length > 0
                        ? P.seq(
                              rightRecursiveParser,
                              P.alt<[(left: B, right: B) => R, B] | readonly [(left: B, right: B) => R]>(
                                  ...leftRecursiveRules
                              ).many()
                          ).map(([first, rest]) => rest.reduce((left, [combiner, right]) => combiner(left, right!), first))
                        : rightRecursiveParser;

                return leftRecursiveParser;
            },
            P.lazy(() => parser)
        );

        return parser as Parser<R>;
    },
});
