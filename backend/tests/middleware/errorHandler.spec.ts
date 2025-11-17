import { errorHandler } from '@src/middleware/errorHandler.js';
import { AppError } from '@src/utils/AppError.js';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

type ErrorHandlerParams = Parameters<typeof errorHandler>;

const createMockResponse = () => {
  const status = vi.fn().mockReturnThis();
  const json = vi.fn<(payload: Record<string, unknown>) => void>();
  const res = { status, json } as unknown as ErrorHandlerParams[2];
  return { res, status, json };
};

describe('errorHandler middleware', () => {
  const mockRequest = {} as ErrorHandlerParams[1];
  const mockNext = vi.fn() as ErrorHandlerParams[3];

  it('returns the AppError status and message when AppError is thrown', () => {
    const error = new AppError(418, 'teapot');
    const { res, status, json } = createMockResponse();

    errorHandler(error, mockRequest, res, mockNext);

    expect(status).toHaveBeenCalledWith(418);
    expect(json).toHaveBeenCalledWith({ message: 'teapot' });
  });

  it('returns validation feedback when a ZodError bubbles up', () => {
    const validationSchema = z.object({ name: z.string().min(1) });
    const result = validationSchema.safeParse({ name: '' });
    if (result.success) {
      throw new Error('Expected validation to fail');
    }
    const zodError = result.error;
    const { res, status, json } = createMockResponse();

    errorHandler(zodError, mockRequest, res, mockNext);

    expect(status).toHaveBeenCalledWith(400);
    const payload = json.mock.calls.at(-1)?.[0];
    expect(payload).toBeDefined();
    const body = payload as { message?: string; errors?: unknown };
    expect(body.message).toBe('Invalid request data');
    expect(Array.isArray(body.errors)).toBe(true);
  });

  it('falls back to a 500 response for unknown errors', () => {
    const error = new Error('Boom');
    const { res, status, json } = createMockResponse();

    errorHandler(error, mockRequest, res, mockNext);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});
