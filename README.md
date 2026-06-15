# MD Viewer

A clean, modern Markdown previewer built with Node.js and Express. Upload `.md` files or paste Markdown text to see it rendered beautifully with syntax highlighting — no more raw `###` and `**` clutter.

![Screenshot](https://raw.githubusercontent.com/MindDevelopment/md-viewer/main/public/logo.png)

## Features

- **Upload or paste** — Upload a `.md` file or type Markdown directly in the editor
- **Live preview** — See your Markdown rendered in real-time with GitHub-style styling
- **Syntax highlighting** — Code blocks are highlighted using highlight.js
- **Responsive design** — Works on desktop (side-by-side) and mobile (tabbed view)
- **Fully client-side rendering** — Markdown is rendered on the server and sent as HTML
- **Cache-busting** — No stale CSS or JS, always serves the latest

## Tech Stack

- **Backend:** Node.js, Express, markdown-it, highlight.js
- **Frontend:** Vanilla JS, CSS (dark theme, GitHub-style preview)

## Getting Started

### Prerequisites

- Node.js >= 18
- npm

### Installation

```bash
git clone https://github.com/MindDevelopment/md-viewer.git
cd md-viewer
npm install
```

### Configuration

Copy the example environment file and set the desired port:

```bash
cp .env.example .env
```

Default `PORT` is `3000`.

### Running

```bash
npm start
```

Open `http://localhost:3000` in your browser.

For development with auto-restart on file changes:

```bash
npm run dev
```

## Usage

1. Type or paste Markdown in the left editor panel
2. Click **Render** or press `Ctrl+Enter`
3. The formatted preview appears on the right

You can also drag & drop a `.md` file anywhere on the page, or use the **Upload file** button.

## Project Structure

```
md-viewer/
├── public/           # Static assets (HTML, CSS, JS, images)
│   ├── index.html
│   ├── style.css
│   └── script.js
├── server.js         # Express server
├── package.json
├── .env              # Port configuration
└── .gitignore
```

## License

MIT