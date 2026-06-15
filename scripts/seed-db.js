require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
});

const sampleFiles = [
  {
    title: 'Welcome to MD Viewer',
    content:
      '# Welcome to MD Viewer\n\nThis is a **Markdown** editor with live preview.\n\n## Features\n\n- Upload `.md` files\n- Live preview\n- Syntax highlighting\n- Block-based builder\n',
  },
  {
    title: 'Code Example',
    content:
      '# Code Example\n\nHere is a JavaScript snippet:\n\n```js\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n```\n',
  },
  {
    title: 'Checklist',
    content: '# My Checklist\n\n- [x] Learn Markdown\n- [ ] Build something great\n- [ ] Share with friends\n',
  },
];

(async () => {
  try {
    const passwordHash = await bcrypt.hash('demo1234', 10);

    const userRes = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) ON CONFLICT (username) DO UPDATE SET email = EXCLUDED.email RETURNING id',
      ['demo', 'demo@example.com', passwordHash]
    );
    const userId = userRes.rows[0].id;

    for (const file of sampleFiles) {
      await pool.query('INSERT INTO md_files (user_id, title, content) VALUES ($1, $2, $3)', [
        userId,
        file.title,
        file.content,
      ]);
    }

    console.log('Demo data seeded successfully.');
    console.log('  User: demo / demo1234');
  } catch (err) {
    console.error('Error seeding data:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
