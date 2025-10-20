import { type User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
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

const loginSchema = z.object({
  email: z.email('A valid email is required'),
  password: z.string().min(12, 'Password is required'),
});

const createSafeUser = ({ passwordHash: _, ...safeUser }: User) => safeUser;

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

    const safeUser = createSafeUser(newUser);
    return res.status(201).json(safeUser);
  } catch (error) {
    console.error('[registerUser] Error: ', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// 3. Login Handler
export const loginUser = async (req: Request, res: Response) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Invalid request data',
        errors: validation.error.issues,
      });
    }

    const { email, password } = validation.data;

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid User' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid Password' });
    }

    const payload = { id: user.id };
    const secret = process.env.JWT_SECRET as string;

    const token = jwt.sign(payload, secret, {
      expiresIn: '30d',
    });

    const safeUser = createSafeUser(user);

    return res.status(200).json({
      message: 'Login Successful',
      token: `Bearer ${token}`,
      user: safeUser,
    });
  } catch (error) {
    console.error('[LoginUser] Error: ', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
