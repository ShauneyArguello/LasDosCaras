import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { signToken } from '../../lib/jwt';
import { ApiError } from '../../utils/apiError';

const SALT_ROUNDS = 10;

export async function registerUser(input: { email: string; password: string; name: string }) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw ApiError.conflict('Email is already registered');
  }

  const hashed = await bcrypt.hash(input.password, SALT_ROUNDS);
  const activationToken = crypto.randomBytes(32).toString('hex');
  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashed,
      name: input.name,
      status: 'PENDING',
      activationToken,
    },
  });

  return { user: sanitizeUser(user), activationToken };
}

export async function activateUser(token: string) {
  const user = await prisma.user.findUnique({ where: { activationToken: token } });
  if (!user) {
    throw ApiError.badRequest('Invalid activation token');
  }
  if (user.status !== 'PENDING') {
    throw ApiError.badRequest('Account is already active');
  }

  const activated = await prisma.user.update({
    where: { id: user.id },
    data: { status: 'ACTIVE', activationToken: null },
  });

  return sanitizeUser(activated);
}

export async function loginUser(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const valid = await bcrypt.compare(input.password, user.password);
  if (!valid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (user.status === 'PENDING') {
    throw ApiError.forbidden('Account is pending activation');
  }
  if (user.status === 'SUSPENDED') {
    throw ApiError.forbidden('Account is suspended');
  }

  const token = signToken({ sub: user.id, role: user.role });
  return { token, user: sanitizeUser(user) };
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return sanitizeUser(user);
}

function sanitizeUser<T extends { password: string; activationToken?: string | null }>(user: T) {
  const { password: _password, activationToken: _activationToken, ...rest } = user;
  return rest;
}
