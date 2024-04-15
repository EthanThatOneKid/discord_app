/**
 * Promisable is a utility type that represents a type and itself wrapped in a promise.
 */
export type Promisable<T> = T | Promise<T>;
