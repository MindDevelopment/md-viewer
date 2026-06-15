const { Router } = require('express');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const pool = require('../config/db');
const logger = require('../config/logger');

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerSchema = z.object({
  username: z.string().min(1).max(50),
  email: z.string().email(),
  password: z.string().min(4).max(128),
});

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

router.post('/register', authLimiter, async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return res.status(400).json({ error: first.message });
  }

  const { username, email, password } = parsed.data;

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, passwordHash]
    );
    const user = result.rows[0];
    req.session.userId = user.id;
    res.status(201).json({ user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Username or email already exists' });
    logger.error({ err }, 'Registration failed');
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Username and password required' });

  const { username, password } = parsed.data;

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid username or password' });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid username or password' });

    req.session.userId = user.id;
    res.json({ user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    logger.error({ err }, 'Login failed');
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

router.get('/me', async (req, res) => {
  if (!req.session.userId) return res.json({ user: null });
  try {
    const result = await pool.query('SELECT id, username, email FROM users WHERE id = $1', [req.session.userId]);
    if (result.rows.length === 0) return res.json({ user: null });
    res.json({ user: result.rows[0] });
  } catch (err) {
    logger.error({ err }, 'Failed to fetch user');
    res.json({ user: null });
  }
});

module.exports = router;
