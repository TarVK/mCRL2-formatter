/** Flattens a tuple structure by 1 level */
export type TFlattenTuple<T extends any[]> = T extends []
    ? []
    : T extends [infer F, ...infer R]
    ? F extends any[]
        ? [...F, ...TFlattenTuple<R>]
        : [F, ...TFlattenTuple<R>]
    : never;
