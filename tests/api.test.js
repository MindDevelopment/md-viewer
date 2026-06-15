import { describe, it, expect, beforeAll, vi } from 'vitest';

process.env.SESSION_SECRET = 'test-secret';

vi.mock('../server/config/db', async () => {
  const pool = {
    query: vi.fn().mockResolvedValue({ rows: [] }),
    connect: vi.fn().mockResolvedValue({
      query: vi.fn().mockResolvedValue({ rows: [{ '?column?': 1 }] }),
      release: vi.fn(),
    }),
  };
  pool.testConnection = vi.fn().mockResolvedValue(true);
  return pool;
});

import request from 'supertest';
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

const renderSchema = z.object({
  text: z.string(),
});

const createFileSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().default(''),
});

const updateFileSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().optional(),
});

describe('Schema validation', () => {
  describe('register schema', () => {
    it('accepts valid input', () => {
      const result = registerSchema.safeParse({ username: 'alice', email: 'alice@test.com', password: 'secret1' });
      expect(result.success).toBe(true);
    });

    it('rejects short password', () => {
      const result = registerSchema.safeParse({ username: 'alice', email: 'alice@test.com', password: 'ab' });
      expect(result.success).toBe(false);
    });

    it('rejects invalid email', () => {
      const result = registerSchema.safeParse({ username: 'alice', email: 'not-email', password: 'secret1' });
      expect(result.success).toBe(false);
    });

    it('rejects empty username', () => {
      const result = registerSchema.safeParse({ username: '', email: 'alice@test.com', password: 'secret1' });
      expect(result.success).toBe(false);
    });

    it('rejects long username', () => {
      const result = registerSchema.safeParse({
        username: 'a'.repeat(51),
        email: 'alice@test.com',
        password: 'secret1',
      });
      expect(result.success).toBe(false);
    });

    it('rejects long password', () => {
      const result = registerSchema.safeParse({
        username: 'alice',
        email: 'alice@test.com',
        password: 'a'.repeat(129),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('login schema', () => {
    it('accepts valid input', () => {
      const result = loginSchema.safeParse({ username: 'alice', password: 'secret1' });
      expect(result.success).toBe(true);
    });

    it('rejects empty username', () => {
      const result = loginSchema.safeParse({ username: '', password: 'secret1' });
      expect(result.success).toBe(false);
    });

    it('rejects empty password', () => {
      const result = loginSchema.safeParse({ username: 'alice', password: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('render schema', () => {
    it('accepts string text', () => {
      const result = renderSchema.safeParse({ text: '# Hello' });
      expect(result.success).toBe(true);
    });

    it('rejects non-string text', () => {
      const result = renderSchema.safeParse({ text: 123 });
      expect(result.success).toBe(false);
    });

    it('rejects missing text', () => {
      const result = renderSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('create file schema', () => {
    it('accepts valid input', () => {
      const result = createFileSchema.safeParse({ title: 'My File', content: '# Hello' });
      expect(result.success).toBe(true);
    });

    it('uses default empty content', () => {
      const result = createFileSchema.safeParse({ title: 'My File' });
      expect(result.success).toBe(true);
      expect(result.data.content).toBe('');
    });

    it('rejects empty title', () => {
      const result = createFileSchema.safeParse({ title: '' });
      expect(result.success).toBe(false);
    });

    it('rejects long title', () => {
      const result = createFileSchema.safeParse({ title: 'a'.repeat(256) });
      expect(result.success).toBe(false);
    });
  });

  describe('update file schema', () => {
    it('accepts partial update', () => {
      const result = updateFileSchema.safeParse({ title: 'Updated' });
      expect(result.success).toBe(true);
    });

    it('accepts content only', () => {
      const result = updateFileSchema.safeParse({ content: '# New' });
      expect(result.success).toBe(true);
    });

    it('accepts empty body', () => {
      const result = updateFileSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });
});

describe('Markdown rendering', () => {
  let app;

  beforeAll(async () => {
    const mod = await import('../server/app.js');
    app = mod.default || mod;
  });

  it('renders headings', async () => {
    const res = await request(app).post('/api/v1/render').send({ text: '# Hello' }).expect(200);

    expect(res.body.html).toContain('<h1>');
    expect(res.body.html).toContain('Hello');
  });

  it('renders bold text', async () => {
    const res = await request(app).post('/api/v1/render').send({ text: '**bold**' }).expect(200);

    expect(res.body.html).toContain('<strong>bold</strong>');
  });

  it('escapes HTML when html is disabled', async () => {
    const res = await request(app).post('/api/v1/render').send({ text: '<script>alert("xss")</script>' }).expect(200);

    expect(res.body.html).not.toContain('<script>');
  });

  it('rejects missing text field', async () => {
    const res = await request(app).post('/api/v1/render').send({}).expect(400);

    expect(res.body.error).toBeDefined();
  });

  it('rejects non-string text', async () => {
    const res = await request(app).post('/api/v1/render').send({ text: 42 }).expect(400);

    expect(res.body.error).toBeDefined();
  });

  it('renders empty string', async () => {
    const res = await request(app).post('/api/v1/render').send({ text: '' }).expect(200);

    expect(res.body.html).toBe('');
  });
});

describe('Health check', () => {
  let app;

  beforeAll(async () => {
    const mod = await import('../server/app.js');
    app = mod.default || mod;
  });

  it('returns ok status', async () => {
    const res = await request(app).get('/api/health').expect(200);

    expect(res.body.status).toBe('ok');
    expect(res.body.uptime).toBeGreaterThan(0);
  });
});
