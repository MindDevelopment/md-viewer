# MD Viewer

A modern Markdown editor with live preview, file management, user authentication, and a visual block-based Markdown builder.

## Features

- **Live preview** — Type Markdown and see it rendered instantly with GitHub-style theming (debounced, no page reload)
- **Syntax highlighting** — Code blocks are highlighted using highlight.js (50+ languages)
- **Visual Block Builder** — Construct documents visually with drag-and-drop blocks, each showing a live preview of its rendered content (headings, lists, code, images, blockquotes, checklists, and more)
- **File management** — Save, list, load, update, and delete Markdown files (authenticated users, PostgreSQL-backed)
- **User authentication** — Register/login/logout with session management (PostgreSQL-backed session store)
- **Upload & drag-and-drop** — Upload `.md` files or drag them onto the page
- **Dark/Light theme** — Toggle between GitHub-dark and GitHub-light themes, persisted in localStorage
- **Auto-save** — Editor content is automatically saved to localStorage and restored on reload
- **Responsive design** — Side-by-side layout on desktop, tabbed navigation on mobile
- **Toast notifications** — Non-intrusive success/error/info messages
- **Keyboard shortcuts** — `Ctrl+Enter` to render, `Ctrl+S` to save, `Escape` to close modals
- **Security** — Helmet headers, rate limiting on auth routes, input validation (Zod), bcrypt password hashing, parameterized SQL queries, session cookies with `httpOnly` + `sameSite`

## Tech Stack

| Layer | Technologies |
|---|---|---|
| **Backend** | Node.js, Express, markdown-it, highlight.js |
| **Database** | PostgreSQL (via `pg`), `connect-pg-simple` sessions |
| **Frontend** | Vanilla JS (ES modules), CSS with CSS custom properties |
| **Security** | Helmet, express-rate-limit, Zod, bcrypt |
| **Logging** | Pino with pino-pretty (development) |
| **Testing** | Vitest |
| **Code quality** | ESLint (flat config), Prettier, EditorConfig |
| **DevOps** | Docker Compose (app + postgres) |

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- npm

### Installation

```bash
git clone <repo-url>
cd md-viewer
npm install
```

### Configuration

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:

| Variable | Description |
|---|---|
| `DB_USER` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_NAME` | Database name |
| `SESSION_SECRET` | Random string for session encryption |

Generate a session secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Database Setup

```bash
npm run db:init
```

### Running

```bash
npm run dev    # Development with auto-restart
# or
npm start      # Production
```

Open http://localhost:3000

### Docker

```bash
docker compose up
```

## Scripts

| Script | Purpose |
|---|---|
| `npm start` | Start production server |
| `npm run dev` | Start with auto-restart |
| `npm test` | Run test suite |
| `npm run lint` | Lint code with ESLint |
| `npm run format` | Format code with Prettier |
| `npm run db:init` | Initialize database tables |

## Project Structure

```
md-viewer/
├── server/
│   ├── app.js              # Express application setup
│   ├── config/
│   │   ├── db.js           # Database pool
│   │   ├── logger.js       # Pino logger
│   │   └── md.js           # Markdown-It instance
│   ├── middleware/
│   │   ├── auth.js         # Authentication middleware
│   │   └── errorHandler.js # Global error handler
│   └── routes/
│       ├── render.js       # Markdown render & upload
│       ├── auth.js         # Register, login, logout, me
│       └── files.js        # File CRUD operations
├── public/
│   ├── index.html          # Single-page application
│   ├── style.css           # All styles
│   ├── js/
│   │   ├── app.js          # Application entry point
│   │   ├── editor.js       # Editor & preview
│   │   ├── auth.js         # Authentication UI
│   │   ├── files.js        # File management UI
│   │   ├── builder.js      # Markdown builder
│   │   ├── ui.js           # Theme, toasts, modals
│   │   └── utils.js        # Utilities
│   └── logo.png            # Application logo
├── tests/
│   ├── markdown.test.js    # Markdown rendering tests
│   └── auth.test.js        # Auth validation tests
├── scripts/
│   └── init-db.js          # Database initialization
├── tests/
│   ├── markdown.test.js    # Markdown rendering tests
│   └── auth.test.js        # Auth validation tests
├── server.js               # Entry point (validates env, starts app)
├── Dockerfile              # Docker image
├── docker-compose.yml      # Docker Compose (app + postgres)
├── eslint.config.mjs       # ESLint flat config
├── .prettierrc             # Prettier config
├── .editorconfig           # EditorConfig
├── vitest.config.js        # Vitest config
├── package.json
└── .env.example
```

## License

MIT
