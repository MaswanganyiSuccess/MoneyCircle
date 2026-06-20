MoneyCircle API Documentation – Frontend Guide
Welcome to the MoneyCircle API! This documentation covers all the endpoints your frontend application will need to interact with the backend. Everything is ready for you to start building the React frontend.

📌 Quick Links
Resource	URL
Production API	https://moneycircle-api.onrender.com
Local API	http://localhost:5000
Health Check	GET /api/health
Repository	https://github.com/MaswanganyiSuccess/MoneyCircle
🚀 Getting Started
Environment Variables
Create a .env file in your frontend project:

env
VITE_API_URL=https://moneycircle-api.onrender.com
# or for local development:
# VITE_API_URL=http://localhost:5000
Axios Configuration
Set up Axios with authentication interceptor:

typescript
// src/lib/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor – attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor – handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await api.post('/api/auth/refresh', { refreshToken });
          localStorage.setItem('accessToken', data.data.accessToken);
          error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(error.config);
        } catch {
          // Refresh failed – logout
          localStorage.clear();
          window.location.href = '/login';
        }
      } else {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
🔐 Authentication Endpoints
Base URL: /api/auth
1. Register
POST /api/auth/register

Request Body:

json
{
  "email": "user@example.com",
  "password": "Pass@1234",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+27721234567",
  "idNumber": "8001015001080",
  "monthlyIncome": 12000,
  "role": "borrower"  // or "lender"
}
Validation Rules:

Field	Rules
email	Valid email format
password	Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
firstName	1–50 chars
lastName	1–50 chars
phoneNumber	E.164 format (e.g., +27721234567)
idNumber	13-digit South African ID
monthlyIncome	≥ 0 (number)
role	borrower or lender
Success Response (201):

json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+27721234567",
    "idNumber": "8001015001080",
    "monthlyIncome": 12000,
    "role": "borrower",
    "status": "pending",
    "kycStatus": "pending",
    "createdAt": "2026-06-20T10:00:00.000Z"
  },
  "message": "User registered successfully"
}
Error Responses:

409: Email or ID number already registered

400: Validation error

2. Login
POST /api/auth/login

Request Body:

json
{
  "email": "user@example.com",
  "password": "Pass@1234"
}
Success Response (200):

json
{
  "success": true,
  "data": {
    "user": {
      "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "borrower",
      "creditGrade": "C",
      "creditScore": 650
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  },
  "message": "Login successful"
}
Error Responses:

401: Invalid credentials

403: Account locked (too many failed attempts)

3. Refresh Token
POST /api/auth/refresh

Request Body:

json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
Success Response (200):

json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Tokens refreshed successfully"
}
4. Logout
POST /api/auth/logout

Headers: Authorization: Bearer <accessToken>

Success Response (200):

json
{
  "success": true,
  "data": null,
  "message": "Logged out successfully"
}
5. Get Current User (Me)
GET /api/auth/me

Headers: Authorization: Bearer <accessToken>

Success Response (200):

json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+27721234567",
    "idNumber": "8001015001080",
    "monthlyIncome": 12000,
    "role": "borrower",
    "status": "pending",
    "kycStatus": "pending",
    "creditGrade": "C",
    "creditScore": 650,
    "address": {
      "street": "123 Main St",
      "city": "Johannesburg",
      "province": "Gauteng",
      "postalCode": "2000",
      "country": "South Africa"
    }
  },
  "message": "User profile retrieved"
}
6. Forgot Password
POST /api/auth/forgot-password

Request Body:

json
{
  "email": "user@example.com"
}
Success Response (200):

json
{
  "success": true,
  "data": { "resetToken": "abc123..." },
  "message": "Password reset link sent"
}
7. Reset Password
POST /api/auth/reset-password/:token

Request Body:

json
{
  "password": "NewPass@1234"
}
Success Response (200):

json
{
  "success": true,
  "data": null,
  "message": "Password reset successfully"
}
👤 User Profile Endpoints
Base URL: /api/users
1. Get My Profile
GET /api/users/me

Headers: Authorization: Bearer <accessToken>

Response: Same as GET /api/auth/me

2. Update Profile
PUT /api/users/me

Headers: Authorization: Bearer <accessToken>

Request Body:

json
{
  "firstName": "Johnathan",
  "lastName": "Smith",
  "phoneNumber": "+27729876543",
  "address": {
    "street": "456 Oak Ave",
    "city": "Cape Town",
    "province": "Western Cape",
    "postalCode": "8000",
    "country": "South Africa"
  }
}
Success Response (200):

json
{
  "success": true,
  "data": { /* updated user */ },
  "message": "Profile updated successfully"
}
3. Change Password
PUT /api/users/change-password

Headers: Authorization: Bearer <accessToken>

Request Body:

json
{
  "currentPassword": "OldPass@1234",
  "newPassword": "NewPass@1234"
}
Success Response (200):

json
{
  "success": true,
  "data": null,
  "message": "Password changed successfully"
}
4. Upload Avatar
POST /api/users/upload-avatar

Headers: Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

Request Body: Form data with key avatar (file, max 5MB, jpg/png)

Success Response (200):

json
{
  "success": true,
  "data": { "avatar": "/uploads/1234567890-avatar.jpg" },
  "message": "Avatar uploaded successfully"
}
5. Submit KYC Documents
POST /api/users/kyc

Headers: Authorization: Bearer <accessToken>

Request Body:

json
{
  "idDocument": "https://storage.com/id.pdf",
  "proofOfAddress": "https://storage.com/address.pdf",
  "selfie": "https://storage.com/selfie.jpg"
}
Success Response (200):

json
{
  "success": true,
  "data": { "kycStatus": "pending" },
  "message": "KYC submitted successfully"
}
6. Get KYC Status
GET /api/users/kyc/status

Headers: Authorization: Bearer <accessToken>

Success Response (200):

json
{
  "success": true,
  "data": {
    "kycStatus": "pending",  // or "verified", "rejected"
    "kycDocuments": {
      "idDocument": "https://storage.com/id.pdf",
      "proofOfAddress": "https://storage.com/address.pdf",
      "selfie": "https://storage.com/selfie.jpg"
    }
  },
  "message": "KYC status retrieved"
}
7. Delete Account (Soft Delete)
DELETE /api/users/me

Headers: Authorization: Bearer <accessToken>

Success Response (200):

json
{
  "success": true,
  "data": null,
  "message": "Account deleted successfully"
}
8. List All Users (Admin Only)
GET /api/users?page=1&limit=10&role=borrower&status=pending&search=john

Headers: Authorization: Bearer <adminAccessToken>

Query Parameters:

Param	Type	Description
page	number	Page number (default: 1)
limit	number	Items per page (default: 10, max: 100)
sort	string	Sort field (default: createdAt)
role	string	Filter by role (borrower, lender, admin)
status	string	Filter by status (pending, verified, rejected)
search	string	Search by email, firstName, lastName
Success Response (200):

json
{
  "success": true,
  "data": {
    "users": [ /* array of users */ ],
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  },
  "message": "Users retrieved successfully"
}
9. Get User by ID (Admin Only)
GET /api/users/:id

Headers: Authorization: Bearer <adminAccessToken>

Success Response (200): Full user object.

💰 Loan Endpoints
Base URL: /api/loans
1. Apply for a Loan
POST /api/loans

Headers: Authorization: Bearer <accessToken>

Request Body:

json
{
  "amount": 50000,
  "termMonths": 24,
  "purpose": "Home renovation",
  "loanType": "personal",  // "personal", "secured", "business", "student"
  "collateral": [
    { "type": "vehicle", "value": 150000 }
  ]
}
Validation Rules:

Field	Rules
amount	R5,000 – R500,000
termMonths	3 – 84 months
purpose	Min 3 chars, max 200
loanType	personal, secured, business, student
collateral	Optional array of { type, value }
Success Response (201):

json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6a7b8c9d0e2",
    "borrowerId": "65a1b2c3d4e5f6a7b8c9d0e1",
    "amount": 50000,
    "interestRate": 19,
    "termMonths": 24,
    "status": "pending",
    "applicationDate": "2026-06-20T10:00:00.000Z",
    "purpose": "Home renovation",
    "loanType": "personal",
    "affordabilityCheckPassed": true,
    "dtiAtApplication": 0.25,
    "creditGradeAtApplication": "C"
  },
  "message": "Loan application submitted successfully"
}
Error Responses:

400: Eligibility failed, already has active loan, or validation error

401: Unauthorized

2. Get My Loans
GET /api/loans/my?status=pending

Headers: Authorization: Bearer <accessToken>

Query Parameters:

Param	Description
status	Filter by status: pending, active, completed, defaulted, rejected
Success Response (200):

json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6a7b8c9d0e2",
      "amount": 50000,
      "interestRate": 19,
      "termMonths": 24,
      "status": "active",
      "lenderId": "65a1b2c3d4e5f6a7b8c9d0e3",
      "createdAt": "2026-06-20T10:00:00.000Z"
    }
  ],
  "message": "Loans retrieved"
}
3. Get Available Loans (for Lenders)
GET /api/loans/available?page=1&limit=10&sort=-createdAt

Headers: Authorization: Bearer <lenderAccessToken>

Query Parameters:

Param	Description
page	Page number (default: 1)
limit	Items per page (default: 10)
sort	Sort field (default: -createdAt)
Success Response (200):

json
{
  "success": true,
  "data": {
    "loans": [
      {
        "_id": "65a1b2c3d4e5f6a7b8c9d0e2",
        "borrowerId": "65a1b2c3d4e5f6a7b8c9d0e1",
        "amount": 50000,
        "interestRate": 19,
        "termMonths": 24,
        "purpose": "Home renovation",
        "loanType": "personal",
        "creditGradeAtApplication": "C"
      }
    ],
    "total": 1
  },
  "message": "Available loans retrieved"
}
4. Get Loan Details
GET /api/loans/:id

Headers: Authorization: Bearer <accessToken>

Success Response (200):

json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6a7b8c9d0e2",
    "borrowerId": {
      "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "user@example.com"
    },
    "lenderId": {
      "_id": "65a1b2c3d4e5f6a7b8c9d0e3",
      "firstName": "Jane",
      "lastName": "Lender"
    },
    "amount": 50000,
    "interestRate": 19,
    "termMonths": 24,
    "status": "active",
    "applicationDate": "2026-06-20T10:00:00.000Z",
    "approvalDate": "2026-06-20T10:05:00.000Z",
    "firstRepaymentDate": "2026-07-20T10:00:00.000Z",
    "servicingFee": 250,
    "purpose": "Home renovation",
    "loanType": "personal",
    "repayments": [
      {
        "_id": "65a1b2c3d4e5f6a7b8c9d0e4",
        "dueDate": "2026-07-20T10:00:00.000Z",
        "dueAmount": 2520.43,
        "status": "pending",
        "interestPortion": 791.67,
        "principalPortion": 1728.76,
        "remainingBalance": 48271.24
      }
      // ... more repayments
    ]
  },
  "message": "Loan details retrieved"
}
5. Fund a Loan (Lender)
POST /api/loans/:id/fund

Headers: Authorization: Bearer <lenderAccessToken>

Success Response (200):

json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6a7b8c9d0e2",
    "status": "active",
    "lenderId": "65a1b2c3d4e5f6a7b8c9d0e3"
  },
  "message": "Loan funded successfully"
}
6. Get Repayment Schedule
GET /api/loans/:id/repayments

Headers: Authorization: Bearer <accessToken>

Success Response (200):

json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6a7b8c9d0e4",
      "dueDate": "2026-07-20T10:00:00.000Z",
      "dueAmount": 2520.43,
      "status": "pending",
      "interestPortion": 791.67,
      "principalPortion": 1728.76,
      "remainingBalance": 48271.24
    }
    // ... 24 repayments total
  ],
  "message": "Repayment schedule retrieved"
}
7. Make a Repayment
POST /api/loans/:id/repay

Headers: Authorization: Bearer <borrowerAccessToken>

Request Body:

json
{
  "amount": 2520.43
}
⚠️ Must be exactly the dueAmount of the next pending repayment.

Success Response (200):

json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6a7b8c9d0e4",
    "status": "paid",
    "paidDate": "2026-06-20T10:10:00.000Z"
  },
  "message": "Repayment successful"
}
8. Early Settlement
GET /api/loans/:id/settlement

Headers: Authorization: Bearer <borrowerAccessToken>

Success Response (200):

json
{
  "success": true,
  "data": {
    "settlementAmount": 28500.50,
    "fee": 285.00,
    "remainingPrincipal": 28215.50
  },
  "message": "Early settlement amount calculated"
}
9. Update Loan Status (Admin Only)
PUT /api/loans/:id/status

Headers: Authorization: Bearer <adminAccessToken>

Request Body:

json
{
  "status": "active",  // "active", "completed", "defaulted", "rejected"
  "reason": "Approved by admin"
}
Success Response (200):

json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6a7b8c9d0e2",
    "status": "active"
  },
  "message": "Loan status updated"
}
📊 Credit Score Endpoints
Base URL: /api/credit
1. Pull Credit Report (Soft Pull)
POST /api/credit/check

Headers: Authorization: Bearer <accessToken>

Success Response (200):

json
{
  "success": true,
  "data": {
    "userId": "65a1b2c3d4e5f6a7b8c9d0e1",
    "pulledDate": "2026-06-20T10:00:00.000Z",
    "transUnionScore": 680,
    "creditGrade": "B",
    "numberOfAccounts": 5,
    "outstandingDebt": 25000,
    "paymentHistoryPercent": 95
  },
  "message": "Credit report pulled successfully"
}
2. Get Current Credit Score
GET /api/credit/score

Headers: Authorization: Bearer <accessToken>

Success Response (200):

json
{
  "success": true,
  "data": {
    "score": 650,
    "grade": "C"
  },
  "message": "Credit score retrieved"
}
3. Get Improvement Suggestions
GET /api/credit/improvement

Headers: Authorization: Bearer <accessToken>

Success Response (200):

json
{
  "success": true,
  "data": [
    "Reduce your debt-to-income ratio by paying down existing debt.",
    "Upload your bank statements to improve your score.",
    "Maintain stable employment for at least 12 months to boost your score.",
    "Make more on-time payments to build a positive repayment history."
  ],
  "message": "Improvement suggestions retrieved"
}
4. Refresh Credit Score (Monthly Limit)
POST /api/credit/refresh

Headers: Authorization: Bearer <accessToken>

Success Response (200):

json
{
  "success": true,
  "data": {
    "userId": "65a1b2c3d4e5f6a7b8c9d0e1",
    "creditGrade": "B",
    "creditScore": 720
  },
  "message": "Credit score refreshed successfully"
}
Error Response (429):

json
{
  "success": false,
  "error": "Credit score can only be refreshed once per month."
}
🔧 Admin Endpoints
Base URL: /api/users
1. List All Users (Admin Only)
GET /api/users?page=1&limit=10&role=borrower

Headers: Authorization: Bearer <adminAccessToken>

2. Get User by ID (Admin Only)
GET /api/users/:id

Headers: Authorization: Bearer <adminAccessToken>

🏥 Health Check
GET /api/health
Response:

json
{
  "status": "ok",
  "environment": "production",
  "timestamp": "2026-06-20T10:00:00.000Z"
}
GET /api/health/db
Response:

json
{
  "status": "healthy",
  "database": {
    "status": "connected",
    "readyState": 1,
    "host": "cluster0.7crtqho.mongodb.net",
    "dbName": "moneycircle"
  }
}
📦 Data Models (TypeScript Types)
User
typescript
interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  idNumber: string;
  monthlyIncome?: number;
  role: 'borrower' | 'lender' | 'admin';
  avatar?: string;
  status: 'pending' | 'verified' | 'rejected';
  kycStatus: 'pending' | 'verified' | 'rejected';
  creditGrade?: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E';
  creditScore?: number;
  debtToIncomeRatio?: number;
  address?: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}
Loan
typescript
interface Loan {
  _id: string;
  borrowerId: string | User;
  lenderId?: string | User;
  amount: number;
  interestRate: number;
  termMonths: number;
  status: 'pending' | 'active' | 'completed' | 'defaulted' | 'rejected';
  applicationDate: string;
  approvalDate?: string;
  firstRepaymentDate?: string;
  servicingFee: number;
  purpose: string;
  loanType: 'personal' | 'secured' | 'business' | 'student';
  collateral?: Array<{ type: string; value: number }>;
  affordabilityCheckPassed: boolean;
  dtiAtApplication?: number;
  creditGradeAtApplication?: string;
  createdAt: string;
  updatedAt: string;
}
Repayment
typescript
interface Repayment {
  _id: string;
  loanId: string;
  dueDate: string;
  dueAmount: number;
  status: 'pending' | 'paid' | 'overdue';
  paidDate?: string;
  lateFee?: number;
  interestPortion: number;
  principalPortion: number;
  remainingBalance: number;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}
Transaction
typescript
interface Transaction {
  _id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'loan_disbursement' | 'repayment' | 'servicing_fee' | 'dispute_hold';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  reference: string;
  transactionDate: string;
  relatedEntityId?: string;
  description?: string;
  createdAt: string;
}
CreditReport
typescript
interface CreditReport {
  _id: string;
  userId: string;
  pulledDate: string;
  transUnionScore: number;
  numberOfAccounts: number;
  outstandingDebt: number;
  paymentHistoryPercent: number;
  creditGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E';
  bankStatementUploaded: boolean;
  employmentMonths: number;
  onTimePayments: number;
  earlySettlements: number;
  creditUtilization: number;
  recentHardInquiries: number;
  hasDefaultsOrJudgments: boolean;
  createdAt: string;
}
📝 Frontend Setup Quick Start
1. Create Vite React + TypeScript project
bash
npm create vite@latest moneycircle-frontend -- --template react-ts
cd moneycircle-frontend
npm install
2. Install dependencies
bash
npm install axios react-router-dom zustand react-hook-form zod @hookform/resolvers
npm install -D tailwindcss postcss autoprefixer @types/node
npx tailwindcss init -p
3. Configure Tailwind
Update tailwind.config.js:

javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
};
4. Set up React Router
typescript
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LoanApplication from './pages/LoanApplication';
import MyLoans from './pages/MyLoans';

function App() {
  const { user } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/apply-loan" element={user ? <LoanApplication /> : <Navigate to="/login" />} />
        <Route path="/my-loans" element={user ? <MyLoans /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}
5. Set up Zustand Store
typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import api from '../lib/axios';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken') || null,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('accessToken', data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
      set({ user: data.data.user, accessToken: data.data.tokens.accessToken });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (userData: any) => {
    set({ isLoading: true });
    try {
      await api.post('/api/auth/register', userData);
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await api.post('/api/auth/logout');
    localStorage.clear();
    set({ user: null, accessToken: null });
  },

  loadUser: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const { data } = await api.get('/api/auth/me');
      set({ user: data.data });
    } catch {
      localStorage.clear();
      set({ user: null, accessToken: null });
    }
  },
}));
📚 Summary
Feature	Endpoints
Auth	Register, Login, Refresh, Logout, Me
Profile	Get, Update, Change Password, Upload Avatar, KYC
Loans	Apply, My Loans, Available, Details, Fund, Status Update
Repayments	Schedule, Make Repayment, Early Settlement
Credit	Pull Report, Get Score, Suggestions, Refresh
Admin	List Users, Get User by ID
✅ Ready to Build!
The MoneyCircle backend is fully functional and deployed at https://moneycircle-api.onrender.com. You have everything you need to build a complete frontend application:

✅ Authentication with access/refresh tokens

✅ User profile management

✅ Full loan lifecycle (apply → fund → repay)

✅ Credit scoring

✅ Admin controls

Happy coding! 