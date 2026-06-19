# MoneyCircle - Peer-to-Peer Lending Frontend

The modern frontend application for the MoneyCircle Peer-to-Peer (P2P) Lending Platform, built using React, TypeScript, Vite, and Tailwind CSS v4.

## 🛠️ Tech Stack

*   **Framework**: React 19 + TypeScript + Vite
*   **Styling**: Tailwind CSS v4 + Shadcn UI
*   **State Management**: Zustand
*   **Routing**: React Router DOM v6
*   **Forms & Validation**: React Hook Form + Zod
*   **HTTP Client**: Axios

## 📂 Project Structure

```text
src/
├── api/          # Axios instances and API services
├── components/   # Reusable UI elements (common, layout)
├── pages/        # View components (auth, borrower, lender, admin)
├── hooks/        # Custom React hooks
├── store/        # Zustand global state slices
├── types/        # TypeScript interfaces and types
├── utils/        # Shared helper functions
├── routes/       # Router configurations
├── App.tsx       # Main application routing layer
└── main.tsx      # Application mount entrypoint
```

## 🚀 Available Scripts

Run these commands inside the `frontend/` directory:

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the local development server |
| `npm run build` | Compiles production-ready bundle |
| `npm run preview` | Previews locally generated production build |
| `npm run lint` | Code linting validation checks |

## ⚙️ Environment Configuration

Copy `.env.example` to `.env` and adjust the API base URLs to connect to your backend environment:

```bash
cp .env.example .env
```
