export type TupleOf<T, N extends number, R extends T[] = []> = R['length'] extends N
	? R
	: TupleOf<T, N, [...R, T]>;

export type Vec4<T> = TupleOf<T, 4>;
