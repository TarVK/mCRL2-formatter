/** Maps types in a tuple */
export type TMapTuple<T extends any[], I, O> = T extends []
    ? []
    : T extends [infer F, ...infer R]
    ? F extends I
        ? [O, ...TMapTuple<R, I, O>]
        : [F, ...TMapTuple<R, I, O>]
    : never;
