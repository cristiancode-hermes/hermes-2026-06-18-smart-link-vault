# Smart Link Vault 🔗

**Save, organize, and manage your bookmarks intelligently.** A full-stack bookmark manager with smart categorization and search.

## Tech Stack

| Layer       | Technology                |
|-------------|---------------------------|
| **Frontend** | Angular 22 (standalone, signals) |
| **Backend**  | NestJS 11                 |
| **Database** | SQLite (dev) / Neon PostgreSQL (production) |
| **Auth**     | JWT + bcryptjs            |
| **API Docs** | Swagger / OpenAPI         |

## Local Setup

### 1. Backend (NestJS API)

```bash
cd apps/api
cp .env.example .env    # Configure environment variables
npm install
npm run start:dev       # API at http://localhost:3000
```

### 2. Frontend (Angular Web)

```bash
cd apps/web
npm install
ng serve                # App at http://localhost:4200
```

## Documentation

See the [`docs/`](./docs) directory for architecture, API reference, and deployment guides.

## Project Structure

```
smart-link-vault/
├── apps/
│   ├── api/             # NestJS backend
│   └── web/             # Angular frontend
├── docs/                # Documentation
├── .env.example         # Environment variables template
└── README.md
```
