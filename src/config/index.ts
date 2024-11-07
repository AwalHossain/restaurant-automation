/* eslint-disable no-undef */
import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';
dotenv.config({ path: path.join(process.cwd(), '.env') });

const NODE_ENV = process.env.NODE_ENV || "development";

// export default {
//   env: process.env.NODE_ENV,
//   port: process.env.PORT,
//   database_url: process.env.DATABASE_URL,
//   default_student_pass: process.env.DEFAULT_STUDENT_PASS,
//   default_faculty_pass: process.env.DEFAULT_FACULTY_PASS,
//   default_admin_pass: process.env.DEFAULT_ADMIN_PASS,
//   bycrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
//   jwt: {
//     secret: process.env.JWT_SECRET,
//     refresh_secret: process.env.JWT_REFRESH_SECRET,
//     expires_in: process.env.JWT_EXPIRES_IN,
//     refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
//   },
// };

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_REFRESH_EXPIRES_IN: z.string(),
  SALT_ROUNDS: z.coerce.number().default(10),
  MFA_SECRET_LENGTH: z.coerce.number().default(16),
  MFA_ISSUER: z.string(),
  MFA_ALGORITHM: z.string(),
  MFA_WINDOW: z.coerce.number().default(0),
});

const env = envSchema.parse(process.env);

export default env;
