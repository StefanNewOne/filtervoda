import type { mk } from './mk';

/** The reference dictionary shape — `mk` defines every valid key. */
export type Dict = Record<keyof typeof mk, string>;
/** Union of all translation keys (compile-time checked at call sites). */
export type TKey = keyof typeof mk;
