import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  superadmin: {
    email: process.env.SUPERADMIN_EMAIL,
    password: process.env.SUPERADMIN_PASSWORD,
    name: process.env.SUPERADMIN_NAME ?? 'Super Admin',
  },
};
