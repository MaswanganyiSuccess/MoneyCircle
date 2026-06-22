# MoneyCircle – Project Context

## Tech Stack
- **Backend**: Node.js, Express, TypeScript, Mongoose, MongoDB
- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Shadcn/ui
- **Authentication**: JWT (access + refresh tokens)
- **Key Features**:
  - South African ID validation (Luhn, DOB, gender extraction)
  - Borrower KYC with 4‑step onboarding (personal, banking, documents, verification)
  - Live selfie capture with face detection (browser API)
  - Loan application, approval, disbursement, repayment
  - Peer‑to‑peer lending (investors fund loans)
- **API**: RESTful with OpenAPI 3.0 (Swagger docs at /api/docs)
- **Testing**: Jest for backend, React Testing Library for frontend

## Folder Structure
- `backend/` – Node.js + Express API
- `frontend/` – React + Vite app
- `docs/` – Project documentation
- `api-docs/` – OpenAPI/Swagger specs

## Conventions
- Use `camelCase` for variables and functions.
- Use `PascalCase` for classes, interfaces, and types.
- Use `I` prefix for interfaces (e.g., `IUser`).
- Use `kebab-case` for file names (e.g., `auth.controller.ts`).
- Use `@/` alias for imports in frontend.
- Use `import type` for type imports.
- Prefer `async/await` over `.then()`.
- Validate all inputs with Zod.

## Database Models (MongoDB)
- `User` – Borrowers, lenders, admins (soft delete: `isDeleted`)
- `Loan` – Loan applications, funding status, repayments
- `Repayment` – Individual instalments (amortisation schedule)
- `Investment` – Lender investments in loans
- `Transaction` – All financial events
- `LenderBalance` – Wallet for lenders
- `CreditReport` – Credit scoring data (TransUnion mock)

## Routes
- `/api/auth` – Authentication (register, login, refresh, logout)
- `/api/users` – User profile, KYC, soft delete
- `/api/loans` – Loan CRUD, funding, repayments
- `/api/credit` – Credit scoring
- `/api/investments` – Partial funding, auto‑invest
- `/api/balance` – Lender wallet

## API Documentation
- **Live**: https://moneycircle-api.onrender.com/api/health
- **Swagger**: `/api/docs` (when implemented)
- **Postman Collection**: `api-docs/` folder

## Important Notes
- All `DELETE` endpoints use **soft delete** (`isDeleted: true`, `deletedBy` audit).
- All `GET` endpoints **exclude soft‑deleted records** by default.
- **South African ID validation**: Full Luhn check, DOB, gender, citizenship.