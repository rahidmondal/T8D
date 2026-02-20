// --- 1. Imports ---
// Group 1: Internal @src imports
import { type User } from '@prisma/client';
import { initializePassport } from '@src/auth/passport.js';
import { createUser, getUserByEmail } from '@src/db/queries.js';
import { errorHandler } from '@src/middleware/errorHandler.js';
import apiRouter from '@src/routes/index.js';
// Group 2: External libraries
import bcrypt from 'bcryptjs';
import express from 'express';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import zxcvbn, { type ZXCVBNResult } from 'zxcvbn';

// --- 2. Mock Dependencies ---
vi.mock('@src/db/queries.js', () => ({
  getUserByEmail: vi.fn(),
  createUser: vi.fn(),
}));

vi.mock('bcryptjs', () => ({
  default: {
    genSalt: vi.fn(() => Promise.resolve('mocked_salt')),
    hash: vi.fn(() => Promise.resolve('mocked_hashed_password')),
    compare: vi.fn(),
  },
}));

vi.mock('zxcvbn', () => ({
  default: vi.fn(() => ({ score: 4 }) as ZXCVBNResult),
}));

// --- 3. Test Setup ---
const mockedGetUserByEmail = vi.mocked(getUserByEmail);
const mockedCreateUser = vi.mocked(createUser);
// This explicit type is necessary to fix the TS/ESLint errors
const mockedCompare = vi.mocked(bcrypt.compare) as vi.Mock<[string | Buffer, string], Promise<boolean>>;
const mockedZxcvbn = vi.mocked(zxcvbn);

const app = express();

beforeAll(() => {
  initializePassport();
  app.use(express.json());
  app.use(apiRouter);
  app.use(errorHandler);
});

beforeEach(() => {
  vi.resetAllMocks();
  mockedZxcvbn.mockReturnValue({ score: 4 } as ZXCVBNResult);
});

afterAll(() => {
  vi.restoreAllMocks();
});

// --- 5. The Tests ---
describe('Auth Routes', () => {
  // ... (POST /register tests - no changes) ...
  describe('POST /register', () => {
    it('should create a new user and return 201', async () => {
      // Arrange
      const newUser = {
        email: 'test@example.com',
        password: 'a-very-strong-password-123',
        name: 'Test User',
      };
      const createdUser: User = {
        id: '12345',
        email: newUser.email,
        name: newUser.name,
        passwordHash: 'mocked_hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockedGetUserByEmail.mockResolvedValue(null);
      mockedCreateUser.mockResolvedValue(createdUser);

      // Act
      const response = await request(app).post('/auth/register').send(newUser);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toEqual(expect.objectContaining({ email: newUser.email }));
    });

    it('should return 409 if user already exists', async () => {
      // Arrange
      const newUser = { email: 'test@example.com', password: 'password123456' };
      mockedGetUserByEmail.mockResolvedValue({ id: '123' } as Partial<User> as User);

      // Act
      const response = await request(app).post('/auth/register').send(newUser);

      // Assert
      expect(response.status).toBe(409);
      expect(response.body).toEqual({ message: 'User already exists' });
    });

    it('should return 400 for a weak password', async () => {
      // Arrange
      const weakUser = { email: 'test@example.com', password: '123' };
      mockedZxcvbn.mockReturnValue({ score: 1 } as ZXCVBNResult);

      // Act
      const response = await request(app).post('/auth/register').send(weakUser);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid request data');
    });
  });

  // -- Tests for POST /login ---
  describe('POST /login', () => {
    it('should log in a user and return 200 with a token', async () => {
      // Arrange
      const credentials = {
        email: 'user@example.com',
        password: 'password123456',
      };
      const dbUser: User = {
        id: 'user-id-123',
        email: credentials.email,
        passwordHash: 'hashed_password_from_db',
        name: 'User Name',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockedGetUserByEmail.mockResolvedValue(dbUser);
      mockedCompare.mockResolvedValue(true);

      // Act
      const response = await request(app).post('/auth/login').send(credentials);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Login Successful');
      expect(response.body).toHaveProperty('token');
      // This is the type-safe way to check nested properties
      expect(response.body).toEqual(
        expect.objectContaining({
          user: expect.objectContaining({ id: dbUser.id }),
        }),
      );
    });

    it('should return 401 if user is not found', async () => {
      // Arrange
      const credentials = {
        email: 'ghost@example.com',
        password: 'password123456',
      };
      mockedGetUserByEmail.mockResolvedValue(null);

      // Act
      const response = await request(app).post('/auth/login').send(credentials);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Invalid credentials' });
    });

    it('should return 401 if password does not match', async () => {
      // Arrange
      const credentials = {
        email: 'user@example.com',
        password: 'wrong-password',
      };
      const dbUser = {
        id: 'user-id-123',
        passwordHash: 'hashed_password_from_db',
      };
      mockedGetUserByEmail.mockResolvedValue(dbUser as Partial<User> as User);
      mockedCompare.mockResolvedValue(false);

      // Act
      const response = await request(app).post('/auth/login').send(credentials);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Invalid credentials' });
    });
  });

  // -- Tests for POST /logout ---
  describe('POST /logout', () => {
    it('should return 200 OK and a success message', async () => {
      // Act
      const response = await request(app).post('/auth/logout');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Logout successful' });
    });
  });
});
