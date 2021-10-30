// src: https://stackoverflow.com/a/55128956/8521718

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export type TOneOfUnion<T> = UnionToIntersection<T extends any ? () => T : never> extends () => infer R ? R : never;
