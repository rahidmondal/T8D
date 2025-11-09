import { AppError } from '@src/utils/AppError.js';
import { describe, expect, it } from 'vitest';

describe('AppError Utility', () => {
  it('should correctly store the message', () => {
    const errorMessage = 'User not found';
    const statusCode = 404;

    const error = new AppError(statusCode, errorMessage);

    expect(error.message).toBe(errorMessage);
  });

  it('should correctly store the statusCode', () => {
    const errorMessage = 'Test error';
    const statusCode = 401;

    const error = new AppError(statusCode, errorMessage);

    expect(error.statusCode).toBe(statusCode);
  });

  it('should be an instance of the built-in Error class', () => {
    const error = new AppError(500, 'Server error');

    expect(error).toBeInstanceOf(Error);
  });
});
