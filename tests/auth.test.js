import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const registerSchema = z.object({
  username: z.string().min(1).max(50),
  email: z.string().email(),
  password: z.string().min(4).max(128),
});

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

describe('Auth validation schemas', () => {
  describe('register', () => {
    it('accepts valid input', () => {
      const result = registerSchema.safeParse({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects short password', () => {
      const result = registerSchema.safeParse({
        username: 'testuser',
        email: 'test@example.com',
        password: 'ab',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid email', () => {
      const result = registerSchema.safeParse({
        username: 'testuser',
        email: 'not-an-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty username', () => {
      const result = registerSchema.safeParse({
        username: '',
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('login', () => {
    it('accepts valid input', () => {
      const result = loginSchema.safeParse({
        username: 'testuser',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty username', () => {
      const result = loginSchema.safeParse({
        username: '',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });
  });
});
