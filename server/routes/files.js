const { Router } = require('express');
const { z } = require('zod');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const logger = require('../config/logger');

const router = Router();

const createFileSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().default(''),
});

const updateFileSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().optional(),
});

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, created_at, updated_at FROM md_files WHERE user_id = $1 ORDER BY updated_at DESC',
      [req.session.userId]
    );
    res.json({ files: result.rows });
  } catch (err) {
    logger.error({ err }, 'Failed to fetch files');
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

router.post('/', async (req, res) => {
  const parsed = createFileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Title is required' });

  const { title, content } = parsed.data;

  try {
    const result = await pool.query(
      'INSERT INTO md_files (user_id, title, content) VALUES ($1, $2, $3) RETURNING id, title, created_at, updated_at',
      [req.session.userId, title, content]
    );
    res.status(201).json({ file: result.rows[0] });
  } catch (err) {
    logger.error({ err }, 'Failed to save file');
    res.status(500).json({ error: 'Failed to save file' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, content, created_at, updated_at FROM md_files WHERE id = $1 AND user_id = $2',
      [req.params.id, req.session.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'File not found' });
    res.json({ file: result.rows[0] });
  } catch (err) {
    logger.error({ err }, 'Failed to fetch file');
    res.status(500).json({ error: 'Failed to fetch file' });
  }
});

router.put('/:id', async (req, res) => {
  const parsed = updateFileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid request body' });

  const { title, content } = parsed.data;

  try {
    const result = await pool.query(
      'UPDATE md_files SET title = COALESCE($1, title), content = COALESCE($2, content), updated_at = NOW() WHERE id = $3 AND user_id = $4 RETURNING id, title, updated_at',
      [title, content, req.params.id, req.session.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'File not found' });
    res.json({ file: result.rows[0] });
  } catch (err) {
    logger.error({ err }, 'Failed to update file');
    res.status(500).json({ error: 'Failed to update file' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM md_files WHERE id = $1 AND user_id = $2 RETURNING id', [
      req.params.id,
      req.session.userId,
    ]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'File not found' });
    res.json({ ok: true });
  } catch (err) {
    logger.error({ err }, 'Failed to delete file');
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

module.exports = router;
