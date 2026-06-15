require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
});

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

async function ensureMigrationTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP DEFAULT NOW()
    );
  `);
}

async function getAppliedMigrations() {
  const result = await pool.query('SELECT name FROM migrations ORDER BY id');
  return new Set(result.rows.map((r) => r.name));
}

async function applyMigration(filename) {
  const filePath = path.join(MIGRATIONS_DIR, filename);
  const sql = fs.readFileSync(filePath, 'utf8');

  console.log(`  Applying ${filename}...`);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('INSERT INTO migrations (name) VALUES ($1)', [filename]);
    await client.query('COMMIT');
    console.log(`  ✓ ${filename} applied`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`  ✗ ${filename} failed: ${err.message}`);
    throw err;
  } finally {
    client.release();
  }
}

(async () => {
  try {
    await ensureMigrationTable();

    if (!fs.existsSync(MIGRATIONS_DIR)) {
      console.log('No migrations directory found.');
      await pool.end();
      return;
    }

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('No migration files found.');
      await pool.end();
      return;
    }

    const applied = await getAppliedMigrations();
    const pending = files.filter((f) => !applied.has(f));

    if (pending.length === 0) {
      console.log('All migrations are up to date.');
    } else {
      console.log(`Found ${pending.length} pending migration(s):`);
      for (const filename of pending) {
        await applyMigration(filename);
      }
      console.log('Migrations complete.');
    }
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
