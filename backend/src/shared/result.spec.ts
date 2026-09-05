import { jest } from '@jest/globals';
import { Result } from './result.js';

describe('Result', () => {
  describe('ok', () => {
    it('creates a result in the ok state', () => {
      const result = Result.ok<number, string>(42);

      expect(result.isOk()).toBe(true);
      expect(result.isErr()).toBe(false);
    });
  });

  describe('err', () => {
    it('creates a result in the err state', () => {
      const result = Result.err<number, string>('something went wrong');

      expect(result.isOk()).toBe(false);
      expect(result.isErr()).toBe(true);
    });
  });

  describe('map', () => {
    it('transforms the value of an ok result', () => {
      const result = Result.ok<number, string>(2);

      expect(result.map((value) => value * 10)).toEqual(Result.ok(20));
    });

    it('short-circuits and keeps the error of an err result', () => {
      const fn = jest.fn();
      const result = Result.err<number, string>('declined');

      const mapped = result.map(fn);

      expect(fn).not.toHaveBeenCalled();
      expect(mapped).toEqual(Result.err('declined'));
    });
  });

  describe('flatMap', () => {
    it('chains the value of an ok result', () => {
      const result = Result.ok<number, string>(2);

      const chained = result.flatMap((value) =>
        Result.ok<number, string>(value + 1),
      );

      expect(chained).toEqual(Result.ok(3));
    });

    it('short-circuits and keeps the error of an err result', () => {
      const fn = jest.fn();
      const result = Result.err<number, string>('insufficient stock');

      const chained = result.flatMap(fn);

      expect(fn).not.toHaveBeenCalled();
      expect(chained).toEqual(Result.err('insufficient stock'));
    });
  });

  describe('andThen', () => {
    it('is an alias of flatMap', () => {
      const result = Result.ok<number, string>(2);

      const chained = result.andThen((value) =>
        Result.ok<number, string>(value * 5),
      );

      expect(chained).toEqual(Result.ok(10));
    });
  });

  describe('unwrapOr', () => {
    it('returns the value of an ok result', () => {
      const result = Result.ok<number, string>(42);

      expect(result.unwrapOr(-1)).toBe(42);
    });

    it('returns the fallback for an err result', () => {
      const result = Result.err<number, string>('error');

      expect(result.unwrapOr(-1)).toBe(-1);
    });
  });
});
