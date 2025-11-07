import { type User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import zxcvbn from 'zxcvbn';

import { createUser, getUserByEmail, updateUser } from '../db/queries.js';
import { AppError } from '../utils/AppError.js';

const registerSchema = z.object({
  email: z.email('Invalid email address'),

  password: z
    .string()
    .min(12, 'Password must be at least 12 characters long')
    .refine(
      value => {
        const result = zxcvbn(value);
        return result.score >= 3;
      },
      {
        message: 'Password is too weak. Try a longer or more complex passphrase.',
      },
    ),

  name: z
    .string()
    .min(1, 'Name is required')
    .transform(value => {
      return value.replace(/<[^>]*>?/gm, '');
    })
    .optional(),
});

const loginSchema = z.object({
  email: z.email('A valid email is required'),
  password: z.string().min(12, 'Password is required'),
});

const editUserSchema = z
  .object({
    password: z
      .string()
      .min(12, 'Password must be at least 12 characters long')
      .refine(
        value => {
          const result = zxcvbn(value);
          return result.score >= 3;
        },
        {
          message: 'Password is too weak. Try adding more variety or randomness.',
        },
      )
      .optional(),
    name: z
      .string()
      .min(1, 'Name is required')
      .transform(value => value.replace(/<[^>]*>?/gm, ''))
      .optional(),
  })
  .refine(data => data.name || data.password, {
    message: 'At least one field (name or password) must be provided',
    path: ['name', 'password'],
  });

const createSafeUser = ({ passwordHash: _, ...safeUser }: User) => safeUser;

export const registerUser = async (req: Request, res: Response) => {
  const validation = registerSchema.safeParse(req.body);
  if (!validation.success) {
    throw validation.error;
  }

  const { email, password, name } = validation.data;

  const existingUser: User | null = await getUserByEmail(email);
  if (existingUser) {
    throw new AppError(409, 'User already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser: User = await createUser({
    email,
    passwordHash,
    name,
  });

  const safeUser = createSafeUser(newUser);
  res.status(201).json(safeUser);
};

// --- 3. Login Handler  ---
export const loginUser = async (req: Request, res: Response) => {
  const validation = loginSchema.safeParse(req.body);
  if (!validation.success) {
    throw validation.error;
  }

  const { email, password } = validation.data;

  const user = await getUserByEmail(email);
  if (!user) {
    throw new AppError(401, 'Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError(401, 'Invalid credentials');
  }

  const payload = { id: user.id };
  const secret = process.env.JWT_SECRET as string;

  const token = jwt.sign(payload, secret, {
    expiresIn: '30d',
  });

  const safeUser = createSafeUser(user);

  res.status(200).json({
    message: 'Login Successful',
    token: token,
    user: safeUser,
  });
};

// --- 4. Edit User ---
export const editUser = async (req: Request, res: Response) => {
  const userFromToken = req.user as User;

  const validation = editUserSchema.safeParse(req.body);
  if (!validation.success) {
    throw validation.error;
  }

  const { name, password } = validation.data;

  const updateData: { name?: string; passwordHash?: string } = {};

  if (name) {
    updateData.name = name;
  }

  if (password) {
    const salt = await bcrypt.genSalt(10);
    updateData.passwordHash = await bcrypt.hash(password, salt);
  }

  const updatedUser = await updateUser(userFromToken.id, updateData);

  const safeUser = createSafeUser(updatedUser);
  res.status(200).json(safeUser);
};
