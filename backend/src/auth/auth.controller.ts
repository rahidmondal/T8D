import { type User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { type Request, type Response } from 'express';
import { z } from 'zod';
import zxcvbn from 'zxcvbn';

import { createUser, getUserByEmail } from '../db/queries.js';

// 1.Validation Schema
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

// 2.Register Handler
export const registerUser = async (req: Request, res: Response) => {
  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Invalid request data',
        errors: validation.error.issues,
      });
    }

    const { email, password, name } = validation.data;

    const existingUser: User | null = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser: User = await createUser({
      email,
      passwordHash,
      name,
    });

    const { passwordHash: _, ...safeUser } = newUser;
    return res.status(201).json(safeUser);
  } catch (error) {
    console.error('[registerUser] Error: ', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
