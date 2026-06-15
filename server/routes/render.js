const { Router } = require('express');
const multer = require('multer');
const { z } = require('zod');
const md = require('../config/md');

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const renderSchema = z.object({
  text: z.string(),
});

router.post('/render', (req, res) => {
  const parsed = renderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'No text provided' });

  const html = md.render(parsed.data.text);
  res.json({ html });
});

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const content = req.file.buffer.toString('utf8');
  const html = md.render(content);
  res.json({ html });
});

module.exports = router;
