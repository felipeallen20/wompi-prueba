/**
 * Railway-Oriented Programming result type.
 * Use case steps chain through `map`, `flatMap` and `andThen`,
 * short-circuiting on the first error.
 */
export class Result<T, E> {
  private constructor(
    private readonly kind: 'ok' | 'err',
    private readonly value?: T,
    private readonly error?: E,
  ) {}

  static ok<T, E = never>(value: T): Result<T, E> {
    return new Result<T, E>('ok', value);
  }

  static err<T = never, E = unknown>(error: E): Result<T, E> {
    return new Result<T, E>('err', undefined, error);
  }

  isOk(): boolean {
    return this.kind === 'ok';
  }

  isErr(): boolean {
    return this.kind === 'err';
  }

  getError(): E | undefined {
    return this.error;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.kind === 'err') {
      return Result.err<U, E>(this.error as E);
    }
    return Result.ok<U, E>(fn(this.value as T));
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this.kind === 'err') {
      return Result.err<U, E>(this.error as E);
    }
    return fn(this.value as T);
  }

  andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return this.flatMap(fn);
  }

  unwrapOr<U>(fallback: U): T | U {
    if (this.kind === 'err') {
      return fallback;
    }
    return this.value as T;
  }
}
