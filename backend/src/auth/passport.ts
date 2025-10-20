import { type User } from '@prisma/client';
import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy, type VerifiedCallback } from 'passport-jwt';

import { getUserById } from '../db/queries.js';

// --- 1. Define the JWT Payload structure ---
interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

// --- 2. Validate Environment Variables ---
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in .env');
  process.exit(1);
}

// --- 3. Define Strategy Options ---
const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
};

// --- 4. Define the Strategy ---
const strategy = new JwtStrategy(options, (payload: JwtPayload, done: VerifiedCallback) => {
  void (async () => {
    try {
      const user: User | null = await getUserById(payload.id);

      if (user) {
        done(null, user, {});
        return;
      } else {
        done(null, false, {});
        return;
      }
    } catch (error) {
      done(error, false, {});
      return;
    }
  })();
});

// --- 5. Export ---
export const initializePassport = () => {
  passport.use(strategy);
};
