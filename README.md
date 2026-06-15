# MD Viewer

A modern web-based Markdown editor with live preview, file management (CRUD), user authentication, and a block-based Markdown builder.

![Logo](public/logo.png)

## Features

- **Live preview** — Markdown rendered server-side in real-time with GitHub-style styling
- **File management** — Save, load, update, and delete Markdown files (requires login)
- **User authentication** — Register and login with bcrypt password hashing and session management
- **Block-based builder** — Build Markdown visually with drag-and-drop blocks (headings, paragraphs, lists, code, images, links, and more)
- **Syntax highlighting** — Code blocks highlighted with highlight.js
- **File upload** — Upload `.md` files via button or drag-and-drop
- **Dark/Light theme** — Toggle between dark and light mode, persisted in localStorage
- **Auto-save draft** — Editor content saved to localStorage, restored on reload
- **Responsive design** — Side-by-side on desktop, tabbed view on mobile
- **Keyboard shortcuts** — Ctrl+Enter to render, Ctrl+S to save, Escape to close modals

## Tech Stack

| Layer                | Technology                                       |
| -------------------- | ------------------------------------------------ |
| **Backend**          | Node.js, Express, markdown-it, highlight.js      |
| **Frontend**         | Vanilla JS (ES modules), CSS custom properties   |
| **Database**         | PostgreSQL 16 (via `pg` driver)                  |
| **Session Store**    | `connect-pg-simple` (PostgreSQL-backed sessions) |
| **Auth**             | `bcrypt` for password hashing                    |
| **Validation**       | `zod` schemas                                    |
| **Logging**          | `pino`                                           |
| **Security**         | `helmet`, `express-rate-limit`                   |
| **Testing**          | `vitest`, `supertest`                            |
| **Containerization** | Docker, docker-compose                           |

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL 16 (or Docker)
- npm

### Installation

```bash
git clone https://github.com/MindDevelopment/md-viewer.git
cd md-viewer
npm install
```

### Configuration

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:

| Variable         | Description                                        |
| ---------------- | -------------------------------------------------- |
| `DB_USER`        | PostgreSQL username                                |
| `DB_PASSWORD`    | PostgreSQL password                                |
| `DB_NAME`        | PostgreSQL database name                           |
| `DB_HOST`        | PostgreSQL host (default: `localhost`)             |
| `DB_PORT`        | PostgreSQL port (default: `5432`)                  |
| `SESSION_SECRET` | Secret for session cookies                         |
| `PORT`           | Server port (default: `3000`)                      |
| `NODE_ENV`       | Set to `production` for production mode            |
| `LOG_LEVEL`      | Log level (default: `info` in dev, `warn` in prod) |

### Database Setup

Initialize the database tables:

```bash
npm run db:init
```

Optionally seed demo data (user: `demo`, password: `demo1234`):

```bash
npm run db:seed
```

### Running

```bash
npm start
```

Open `http://localhost:3000` in your browser.

For development with auto-restart on file changes:

```bash
npm run dev
```

### Docker

```bash
docker compose up --build
```

## Usage

1. Type or paste Markdown in the left editor panel — preview updates automatically
2. Press **Ctrl+Enter** to force render, or **Ctrl+S** to save
3. Use the **Block Builder** tab to compose documents visually
4. Upload a `.md` file via drag-and-drop or the upload button
5. Login to save files to your account

## API

Base URL: `/api/v1`

| Method   | Endpoint     | Auth    | Description                      |
| -------- | ------------ | ------- | -------------------------------- |
| `POST`   | `/render`    | No      | Render Markdown to HTML          |
| `POST`   | `/upload`    | No      | Upload and render a `.md` file   |
| `POST`   | `/register`  | No      | Create a new user account        |
| `POST`   | `/login`     | No      | Login with username and password |
| `POST`   | `/logout`    | No      | Destroy session                  |
| `GET`    | `/me`        | Session | Get current authenticated user   |
| `GET`    | `/files`     | Session | List user's files                |
| `POST`   | `/files`     | Session | Create a new file                |
| `GET`    | `/files/:id` | Session | Get a file by ID                 |
| `PUT`    | `/files/:id` | Session | Update a file                    |
| `DELETE` | `/files/:id` | Session | Delete a file                    |

Health check: `GET /api/health`

## Scripts

| Command                | Description                |
| ---------------------- | -------------------------- |
| `npm start`            | Start the server           |
| `npm run dev`          | Start with auto-restart    |
| `npm test`             | Run tests                  |
| `npm run test:watch`   | Run tests in watch mode    |
| `npm run lint`         | Run ESLint                 |
| `npm run format`       | Format with Prettier       |
| `npm run format:check` | Check formatting           |
| `npm run db:init`      | Initialize database tables |
| `npm run db:seed`      | Seed demo data             |

## Project Structure

```
md-viewer/
├── .github/workflows/ # CI pipeline
│   └── ci.yml
├── public/            # Static assets
│   ├── css/
│   │   └── highlight.css
│   ├── js/
│   │   ├── app.js        # Entry point
│   │   ├── auth.js       # Auth UI and state
│   │   ├── builder.js    # Block-based Markdown builder
│   │   ├── editor.js     # Editor and server-side rendering
│   │   ├── files.js      # File list and CRUD
│   │   ├── ui.js         # Theme, toasts, modals, shortcuts
│   │   └── utils.js      # Helpers
│   ├── index.html
│   ├── style.css
│   └── logo.png
├── scripts/
│   ├── init-db.js        # Database table creation
│   ├── seed-db.js        # Demo data seeder
│   └── github.js         # Git sync helper
├── server/
│   ├── app.js            # Express app setup
│   ├── config/
│   │   ├── db.js         # PostgreSQL pool
│   │   ├── logger.js     # Pino logger
│   │   └── md.js         # markdown-it instance
│   ├── middleware/
│   │   ├── auth.js       # Auth middleware
│   │   └── errorHandler.js
│   └── routes/
│       ├── auth.js       # Auth endpoints
│       ├── files.js      # File CRUD endpoints
│       └── render.js     # Markdown render endpoints
├── tests/
│   ├── api.test.js       # Integration tests
│   ├── auth.test.js      # Auth schema tests
│   └── markdown.test.js  # Markdown rendering tests
├── server.js             # Entry point
├── Dockerfile
├── docker-compose.yml
├── package.json
├── LICENSE
└── README.md
```

## License

MIT
