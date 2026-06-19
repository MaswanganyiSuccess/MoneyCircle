# 💰 MoneyCircle

**Peer‑to‑Peer Lending Platform** – connecting borrowers with lenders in South Africa.  
Built with Node.js + React + MongoDB.

---

## 🏷️ Badges

| CI/CD | Quality | Tech Stack |
|-------|---------|------------|
| [![CI](https://github.com/MaswanganyiSuccess/MoneyCircle/actions/workflows/ci.yml/badge.svg)](https://github.com/MaswanganyiSuccess/MoneyCircle/actions/workflows/ci.yml) | [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) | [![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/) |
| [![Deploy](https://github.com/MaswanganyiSuccess/MoneyCircle/actions/workflows/deploy.yml/badge.svg)](https://github.com/MaswanganyiSuccess/MoneyCircle/actions/workflows/deploy.yml) | [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/MaswanganyiSuccess/MoneyCircle/pulls) | [![Express](https://img.shields.io/badge/Express-4.21-blue.svg)](https://expressjs.com/) |
| [![Coverage](https://img.shields.io/badge/coverage-85%25-brightgreen.svg)](https://github.com/MaswanganyiSuccess/MoneyCircle) | [![GitHub issues](https://img.shields.io/github/issues/MaswanganyiSuccess/MoneyCircle.svg)](https://github.com/MaswanganyiSuccess/MoneyCircle/issues) | [![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green.svg)](https://www.mongodb.com/) |
| [![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/MaswanganyiSuccess/MoneyCircle/releases) | [![GitHub pull requests](https://img.shields.io/github/issues-pr/MaswanganyiSuccess/MoneyCircle.svg)](https://github.com/MaswanganyiSuccess/MoneyCircle/pulls) | [![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/) |
| [![GitHub stars](https://img.shields.io/github/stars/MaswanganyiSuccess/MoneyCircle.svg?style=social)](https://github.com/MaswanganyiSuccess/MoneyCircle/stargazers) | [![GitHub last commit](https://img.shields.io/github/last-commit/MaswanganyiSuccess/MoneyCircle.svg)](https://github.com/MaswanganyiSuccess/MoneyCircle/commits/main) | [![JWT](https://img.shields.io/badge/JWT-black?logo=JSON%20web%20tokens)](https://jwt.io/) |
| [![GitHub forks](https://img.shields.io/github/forks/MaswanganyiSuccess/MoneyCircle.svg?style=social)](https://github.com/MaswanganyiSuccess/MoneyCircle/network/members) | | |

---

## 📖 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Roadmap](#roadmap)
- [Quick Start](#quick-start)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### 👤 Borrowers
- Register & verify identity (KYC)
- Soft credit pull (TransUnion) – no impact on score
- Apply for loans (Personal, Home, Car, Student, Debt Review)
- Receive credit grade (A+ to D) and interest rate
- Track repayments and payment history

### 💰 Lenders
- Invest in fractional loans
- Choose between auto-invest or manual selection
- Monitor returns and loan performance
- Withdraw funds (standard or instant)

### 🔧 Platform
- NCA, FICA, POPIA compliant
- AES-256 encryption for data
- Real‑time notifications (email & SMS)
- Admin dashboard for platform management

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Node.js, Express, JWT, bcrypt |
| **Database** | MongoDB, Mongoose |
| **Testing** | Jest, Supertest |
| **CI/CD** | GitHub Actions |
| **Hosting** | Render / Vercel / MonsterASP.NET |
| **Frontend** | React (planned) |
| **APIs** | Stitch (KYC), TransUnion (credit) |

---

## 🗺️ Roadmap

We track development using [GitHub Projects](https://github.com/MaswanganyiSuccess/MoneyCircle/projects).  
Current milestones:

- 🗄️ **Database Schema** – MongoDB models & indexes
- 🔧 **Backend API** – REST endpoints with JWT auth
- 🎨 **Frontend UI** – React dashboard for borrowers & lenders
- 🚀 **Deployment** – CI/CD pipeline & monitoring

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x
- MongoDB 6.0 (local or Atlas)

### Installation

```bash
# Clone the repository
git clone https://github.com/MaswanganyiSuccess/MoneyCircle.git
cd MoneyCircle

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Run the development server
npm run dev

Environment Variables
Variable	Description
PORT	Server port (default: 5000)
MONGODB_URI	MongoDB connection string
JWT_SECRET	Secret key for JWT tokens
JWT_EXPIRE	Token expiration (e.g., 7d)

📡 API Endpoints
Method	Endpoint	Description
POST	/api/auth/register	Register a new user
POST	/api/auth/login	Login & get JWT token
GET	/api/users/me	Get current user profile
GET	/api/loans	Get all loans
POST	/api/loans	Apply for a loan
GET	/api/loans/:id	Get loan details
POST	/api/loans/:id/invest	Invest in a loan (lenders)
GET	/api/health	Health check endpoint
GET	/api/docs	Swagger documentation

🤝 Contributing
We welcome contributions! Please follow these steps:

Fork the repository

Create a feature branch (git checkout -b feature/amazing)

Commit your changes (git commit -m 'Add amazing feature')

Push to the branch (git push origin feature/amazing)

Open a Pull Request

Read our Contributing Guidelines for more details.

📄 License
This project is licensed under the MIT License – see the LICENSE file for details.

📬 Contact
Author: Maswanganyi Success

Project Link: https://github.com/MaswanganyiSuccess/MoneyCircle

Built with ❤️ for the South African fintech ecosystem.

