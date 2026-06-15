require('dotenv').config();

const requiredEnvVars = ['DB_USER', 'DB_PASSWORD', 'DB_NAME', 'SESSION_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const app = require('./server/app');
const logger = require('./server/config/logger');

const port = process.env.PORT || 3000;

app.listen(port, () => {
  logger.info(`MD Viewer running at http://localhost:${port}`);
});
