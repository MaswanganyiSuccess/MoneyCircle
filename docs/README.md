# MoneyCircle – Complete Development Workflow

This document outlines the complete development workflow for the MoneyCircle platform, covering everything from setting up your local environment to deploying changes to production.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Repository Structure](#repository-structure)
3. [Environment Setup](#environment-setup)
4. [Branch Strategy](#branch-strategy)
5. [Development Workflow](#development-workflow)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Deployment Process](#deployment-process)
8. [Testing](#testing)
9. [Common Commands](#common-commands)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

MoneyCircle is a peer-to-peer lending platform with:

- **Backend**: Node.js + Express + MongoDB (TypeScript)
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Hosting**: Render (backend) + Vercel (frontend)

| Component | Technology | Hosting |
|-----------|------------|---------|
| Backend API | Node.js, Express, TypeScript | Render |
| Database | MongoDB Atlas | MongoDB Cloud |
| Frontend | React, TypeScript, Vite, Tailwind | Vercel |
| CI/CD | GitHub Actions | GitHub |

---

## 📁 Repository Structure

```
MoneyCircle/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Auth, validation, etc.
│   │   ├── utils/           # Helper functions
│   │   ├── validators/      # Zod schemas
│   │   ├── scripts/         # Seed, backup, etc.
│   │   ├── app.ts           # Express app setup
│   │   └── server.ts        # Entry point
│   ├── migrations/          # Database migrations
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities (axios, etc.)
│   │   ├── stores/          # Zustand stores
│   │   └── types/           # TypeScript types
│   ├── public/              # Static assets
│   ├── package.json
│   └── vite.config.ts
├── .github/
│   └── workflows/           # GitHub Actions
│       ├── ci.yml           # Continuous Integration
│       └── deploy.yml       # Continuous Deployment
├── docs/                    # Documentation
└── README.md
```

---

## 🔧 Environment Setup

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | v20+ | Runtime |
| npm | v10+ | Package manager |
| Git | Latest | Version control |
| MongoDB Compass | Latest | Database GUI (optional) |

### Step 1 – Clone the Repository

```bash
git clone https://github.com/MaswanganyiSuccess/MoneyCircle.git
cd MoneyCircle
```

### Step 2 – Set Up the Backend

```bash
cd backend
npm install
cp .env.example .env   # Update with your credentials
npm run dev
```

The backend will run at **`http://localhost:5000`**.

### Step 3 – Set Up the Frontend

```bash
cd frontend
npm install
cp .env.example .env   # Update with API URL
npm run dev
```

The frontend will run at **`http://localhost:5173`**.

### Step 4 – Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000   # or https://moneycircle-api.onrender.com
```

---

## 🌿 Branch Strategy

We use **GitFlow** with feature branches:

| Branch | Purpose | Deploy Target |
|--------|---------|---------------|
| `main` | Production-ready code | Render + Vercel |
| `develop` | Integration branch | Staging (optional) |
| `feature/*` | New features | Preview (Vercel) |
| `fix/*` | Bug fixes | Preview (Vercel) |
| `hotfix/*` | Urgent fixes | Production |

### Branch Naming Conventions

- `feature/auth-system`
- `feature/loan-application`
- `fix/repayment-calculation`
- `hotfix/security-patch`

---

## 💻 Development Workflow

### 1. Create a New Feature Branch

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Write code following the project's style guide.
- Run `npm run lint` to check for issues.
- Run `npm run test` to ensure tests pass.

### 3. Commit Your Changes

```bash
git add .
git commit -m "feat: add loan repayment calculator"
```

### 4. Push Your Branch

```bash
git push origin feature/your-feature-name
```

### 5. Open a Pull Request

1. Go to the GitHub repository.
2. Click **"Compare & pull request"**.
3. Fill in the PR template.
4. Request a review.
5. Wait for CI to pass.

### 6. Review and Merge

- Address review comments.
- Once approved, merge the PR into `main`.
- Delete the feature branch (GitHub can do this automatically).

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

#### 1. Continuous Integration (`ci.yml`)

**Runs on:** Every push and pull request to `main`.

**What it does:**
- ✅ Checks out the code.
- ✅ Sets up Node.js.
- ✅ Installs dependencies.
- ✅ Runs linting.
- ✅ Builds TypeScript.
- ✅ Runs tests (using `MONGODB_URI_TEST` secret).
- ✅ Uploads test coverage.

#### 2. Deploy (`deploy.yml`)

**Runs on:** Pushes to `main` (optional).

**What it does:**
- ✅ Builds the backend.
- ✅ Triggers Render deployment via webhook.
- ✅ Performs a health check.

### CI Pipeline Flow

```
[Developer pushes to feature branch]
        ↓
[GitHub Actions runs ci.yml]
        ↓
[Build + Test]
        ↓
[If passes → PR can be merged]
        ↓
[PR merged to main]
        ↓
[Render auto-deploys backend]
        ↓
[Vercel auto-deploys frontend]
```

---

## 🚀 Deployment Process

### Backend – Render

Render is connected to the GitHub repository and auto-deploys from `main`.

**Deployment Settings:**

| Setting | Value |
|---------|-------|
| **Build Command** | `cd backend && npm install && npm run build` |
| **Start Command** | `cd backend && npm start` |
| **Health Check Path** | `/health` |
| **Branch** | `main` |

**To manually trigger a deploy:**

1. Go to Render Dashboard → `moneycircle-api`.
2. Click **"Manual Deploy"** → **"Deploy latest commit"**.

### Frontend – Vercel

Vercel is connected to the GitHub repository and auto-deploys from `main`.

**Deployment Settings:**

| Setting | Value |
|---------|-------|
| **Root Directory** | `frontend` |
| **Framework** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Environment Variable** | `VITE_API_URL=https://moneycircle-api.onrender.com` |

**Preview Deployments:**

Every pull request creates a preview deployment with a unique URL.

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test                # Run all tests
npm test -- --watch     # Run in watch mode
npm test -- --coverage  # Generate coverage report
```

### Frontend Tests

```bash
cd frontend
npm test                # Run all tests
npm test -- --watch     # Run in watch mode
```

### Test Structure

```
backend/
├── src/
│   └── __tests__/
│       ├── auth.test.ts      # Authentication tests
│       ├── loan.test.ts      # Loan endpoint tests
│       └── unit/             # Unit tests

frontend/
├── src/
│   └── __tests__/
│       ├── components/       # Component tests
│       └── hooks/            # Hook tests
```

---

## 📦 Common Commands

### Backend Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build TypeScript to `dist/` |
| `npm start` | Start production server |
| `npm test` | Run tests |
| `npm run lint` | Run ESLint |
| `npm run seed` | Seed database with test data |
| `npm run backup` | Create database backup |
| `npm run migrate:up` | Apply pending migrations |

### Frontend Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |

### Git Commands

| Command | Description |
|---------|-------------|
| `git checkout -b feature/name` | Create new feature branch |
| `git add .` | Stage all changes |
| `git commit -m "message"` | Commit changes |
| `git push origin branch` | Push to remote |
| `git pull origin main` | Pull latest changes |

---

## 🐛 Troubleshooting

### Backend Won't Start

1. Check that MongoDB is running (Atlas or local).
2. Verify `.env` has correct `MONGODB_URI`.
3. Run `npm install` to ensure all dependencies are installed.
4. Check for port conflicts (port 5000).

### Frontend Won't Start

1. Check that `VITE_API_URL` is set correctly.
2. Run `npm install` to ensure all dependencies are installed.
3. Check for port conflicts (port 5173).

### Build Fails on Render

1. Check Render build logs for errors.
2. Verify `@types/jest` is in `dependencies` (not `devDependencies`).
3. Ensure `tsconfig.json` is configured correctly.
4. Try `npm run build` locally to test.

### API Returns 404

1. Check that the route is registered in `routes/index.ts`.
2. Verify the endpoint URL (e.g., `/api/health` vs `/health`).
3. Check the server logs for errors.

### CORS Errors

1. Ensure `config.env.ts` has `corsOrigin: '*'` (development).
2. For production, allow your frontend origin.

---

## 📚 Useful Resources

| Resource | URL |
|----------|-----|
| **Live Frontend** | `https://money-circle.vercel.app` |
| **Live Backend API** | `https://moneycircle-api.onrender.com` |
| **Backend Health Check** | `https://moneycircle-api.onrender.com/api/health` |
| **GitHub Repository** | `https://github.com/MaswanganyiSuccess/MoneyCircle` |
| **Frontend Docs** | `/docs/frontend/README.md` |
| **API Documentation** | `/docs/frontend/README.md` (full API reference) |

---

## ✅ Checklist Before Merging

- [ ] Code runs locally (`npm run dev`)
- [ ] Build passes (`npm run build`)
- [ ] Tests pass (`npm test`)
- [ ] Lint passes (`npm run lint`)
- [ ] PR description is complete
- [ ] All review comments addressed
- [ ] CI passes (green check)
- [ ] Preview deployment works

---

## 🎯 Quick Reference

| Environment | Backend URL | Frontend URL |
|-------------|-------------|--------------|
| **Production** | `https://moneycircle-api.onrender.com` | `https://money-circle.vercel.app` |
| **Local** | `http://localhost:5000` | `http://localhost:5173` |

---

**Happy coding!** 🚀