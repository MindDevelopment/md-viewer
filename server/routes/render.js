const { Router } = require('express');
const multer = require('multer');
const md = require('../config/md');

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/render', (req, res) => {
  const { text } = req.body;
  if (typeof text !== 'string') return res.status(400).json({ error: 'No text provided' });
  const html = md.render(text);
  res.json({ html });
});

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const content = req.file.buffer.toString('utf8');
  const html = md.render(content);
  res.json({ html });
});

module.exports = router;
