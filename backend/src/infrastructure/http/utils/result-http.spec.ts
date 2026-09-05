import { Result } from '../../../shared/result.js';
import { ApiError, unwrapOrThrow } from './result-http.js';

describe('unwrapOrThrow', () => {
  it('returns the value of an ok result', () => {
    const result = Result.ok<number, never>(7);

    expect(unwrapOrThrow(result)).toBe(7);
  });

  it('throws an ApiError carrying the mapped status for an err result', () => {
    const result = Result.err<
      number,
      { code: 'INVALID_INPUT'; message: string }
    >({
      code: 'INVALID_INPUT',
      message: 'bad input',
    });

    try {
      unwrapOrThrow(result);
      throw new Error('should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).getStatus()).toBe(400);
      expect((error as ApiError).getResponse()).toMatchObject({
        code: 'INVALID_INPUT',
        message: 'bad input',
      });
    }
  });
});
