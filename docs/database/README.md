# MoneyCircle Database Documentation

Welcome to the database documentation for **MoneyCircle**. This folder contains all schema definitions, indexing strategies, and relationship designs for the platform.

---

## Quick Links
- [Full Database Schema](./database-schema.md) – Complete collection definitions, fields, validations, and indexes.
- [Migrations Guide](../MIGRATIONS.md) – How to manage schema changes over time.
- [Backup & Restore](../DR.md) – Disaster recovery procedures.

---

## Overview

MoneyCircle uses **MongoDB** as its primary database. The schema is designed to support:

- **Borrowers** and **Lenders** with separate profiles and KYC workflows.
- **Loan lifecycle** – from application to active, completed, or defaulted.
- **Repayments** with tracking for overdue payments and late fees.
- **Transactions** – all monetary movements (deposits, withdrawals, loan disbursements, fees).
- **Credit reporting** – integrating TransUnion data for borrower credit grades.
- **Notifications**, **disputes**, and **audit logs** for compliance and user communication.

---

## Key Collections

| Collection | Purpose |
|------------|---------|
| [Users](./database-schema.md#1-users) | Borrowers & lenders, authentication, KYC, credit grades |
| [Loans](./database-schema.md#2-loans) | Loan applications, amounts, interest rates, statuses |
| [Repayments](./database-schema.md#3-repayments) | Scheduled payments, due dates, statuses, late fees |
| [Transactions](./database-schema.md#4-transactions) | All financial events (deposits, disbursements, repayments, etc.) |
| [Notifications](./database-schema.md#5-notifications) | User alerts (email, SMS, push) |
| [CreditReports](./database-schema.md#6-creditreports) | TransUnion credit data snapshots |
| [LenderDeposits](./database-schema.md#7-lenderdeposits) | Lender fund deposits |
| [Withdrawals](./database-schema.md#8-withdrawals) | Withdrawal requests (standard, instant, idle) |
| [Disputes](./database-schema.md#9-disputes) | Loan-related disputes |
| [AuditLogs](./database-schema.md#10-auditlogs) | Activity logs for security and compliance |

---

## Field Definitions, Data Types & Validation Rules

Each collection has strict field-level validation to ensure data integrity:

### 1. Users
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | String | ✅ | Unique, lowercase, regex: `/\S+@\S+\.\S+/` |
| `passwordHash` | String | ✅ | Min length 8 (hashed) |
| `firstName` | String | ✅ | 1–50 chars |
| `lastName` | String | ✅ | 1–50 chars |
| `phoneNumber` | String | ✅ | Unique, E.164 format |
| `idNumber` | String | ✅ | Unique, SA ID format (13 digits) |
| `role` | String | ✅ | Enum: `['borrower', 'lender']` |
| `kycStatus` | String | ✅ | Enum: `['pending', 'verified', 'rejected']`, default: `'pending'` |
| `creditGrade` | String | ❌ | Enum: `['A+','A','B','C','D','E']` |
| `creditScore` | Number | ❌ | Min: 0, Max: 999 |
| `debtToIncomeRatio` | Number | ❌ | 0–1 (percentage as decimal) |
| `address` | Object | ❌ | `{ street, city, province, postalCode, country }` |

### 2. Loans
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `borrowerId` | ObjectId | ✅ | Ref: `User` |
| `lenderId` | ObjectId | ❌ | Ref: `User` |
| `amount` | Number | ✅ | Min: 100, Max: 500000 (ZAR) |
| `interestRate` | Number | ✅ | Min: 0, Max: 50 (%) |
| `termMonths` | Number | ✅ | 1–60 |
| `status` | String | ✅ | Enum: `['pending','active','completed','defaulted']` |
| `servicingFee` | Number | ✅ | Default: 0.5% of amount |
| `purpose` | String | ❌ | Max 200 chars |
| `collateral` | Array | ❌ | `[{ type: string, value: number }]` |

### 3. Repayments
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `loanId` | ObjectId | ✅ | Ref: `Loan` |
| `dueAmount` | Number | ✅ | > 0 |
| `dueDate` | Date | ✅ | Must be after loan approval |
| `status` | String | ✅ | Enum: `['pending','paid','overdue']`, default: `'pending'` |
| `lateFee` | Number | ❌ | ≥ 0 |

### 4. Transactions
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `userId` | ObjectId | ✅ | Ref: `User` |
| `type` | String | ✅ | Enum: `['deposit','withdrawal','loan_disbursement','repayment','servicing_fee','dispute_hold']` |
| `amount` | Number | ✅ | > 0 |
| `currency` | String | ✅ | Default: `'ZAR'` |
| `status` | String | ✅ | Enum: `['pending','completed','failed','reversed']` |
| `reference` | String | ✅ | Unique external reference |
| `description` | String | ❌ | Max 200 chars |

### 5. Notifications
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `userId` | ObjectId | ✅ | Ref: `User` |
| `type` | String | ✅ | Enum: `['email','sms','push']` |
| `title` | String | ✅ | Max 100 chars |
| `message` | String | ✅ | Max 1000 chars |
| `isRead` | Boolean | ✅ | Default: `false` |

### 6. CreditReports
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `userId` | ObjectId | ✅ | Ref: `User` (borrower) |
| `transUnionScore` | Number | ✅ | 0–999 |
| `numberOfAccounts` | Number | ✅ | ≥ 0 |
| `outstandingDebt` | Number | ✅ | ≥ 0 |
| `paymentHistoryPercent` | Number | ✅ | 0–100 |
| `creditGrade` | String | ✅ | Enum: `['A+','A','B','C','D','E']` |
| `rawData` | Object | ❌ | Full JSON from TransUnion |

### 7. LenderDeposits
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `userId` | ObjectId | ✅ | Ref: `User` (lender) |
| `amount` | Number | ✅ | Min: 100 |
| `status` | String | ✅ | Enum: `['pending','confirmed','failed']` |
| `paymentMethod` | String | ✅ | e.g., EFT, credit card |
| `reference` | String | ✅ | Unique |

### 8. Withdrawals
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `userId` | ObjectId | ✅ | Ref: `User` |
| `type` | String | ✅ | Enum: `['standard','instant','idle']` |
| `amount` | Number | ✅ | Min: 50 |
| `fee` | Number | ✅ | ≥ 0 |
| `netAmount` | Number | ✅ | amount - fee |
| `status` | String | ✅ | Enum: `['pending','processing','completed','failed']` |
| `bankAccount` | String | ✅ | Masked account details |

### 9. Disputes
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `userId` | ObjectId | ✅ | Ref: `User` |
| `loanId` | ObjectId | ✅ | Ref: `Loan` |
| `reason` | String | ✅ | e.g., late payment, incorrect amount |
| `description` | String | ✅ | Max 500 chars |
| `status` | String | ✅ | Enum: `['open','under_review','resolved','closed']` |
| `resolution` | String | ❌ | Max 500 chars |
| `evidenceUrls` | Array | ❌ | Array of strings (URLs) |

### 10. AuditLogs
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `userId` | ObjectId | ✅ | Ref: `User` |
| `action` | String | ✅ | e.g., 'login', 'loan_approval' |
| `ipAddress` | String | ✅ | - |
| `userAgent` | String | ❌ | - |
| `metadata` | Object | ❌ | Extra context |

---

## Indexing Strategy

Indexes are defined in Mongoose schemas and automatically created on application start:

| Collection | Indexes | Purpose |
|------------|---------|---------|
| **Users** | `email: 1` (unique), `idNumber: 1` (unique), `creditGrade: 1`, `role: 1` | Authentication, ID verification, filtering |
| **Loans** | `borrowerId: 1`, `status: 1, createdAt: -1`, `interestRate: 1`, `amount: 1, term: 1` | User loans, active loans, lender matching |
| **Repayments** | `loanId: 1, dueDate: 1`, `status: 1, dueDate: 1` | Repayment schedule, overdue detection |
| **Transactions** | `userId: 1, createdAt: -1`, `type: 1, status: 1`, `reference: 1` (unique) | History, filtering, idempotency |
| **Notifications** | `userId: 1, isRead: 1` | Unread notification count |
| **CreditReports** | `userId: 1, pulledDate: -1` | Latest credit report |
| **LenderDeposits** | `userId: 1, status: 1` | Pending deposits |
| **Withdrawals** | `userId: 1, status: 1` | Pending withdrawals |
| **Disputes** | `loanId: 1, status: 1` | Per-loan dispute lookup |
| **AuditLogs** | `userId: 1, timestamp: -1` | Audit trail queries |

---

## Relationships

**All relationships use references (ObjectId) – no embedded documents.**

| Collection | Relationship | Type |
|------------|--------------|------|
| **Users** | → Loans (as borrower/lender) | One-to-Many |
| | → Transactions | One-to-Many |
| | → Notifications | One-to-Many |
| | → AuditLogs | One-to-Many |
| | → CreditReports | One-to-Many |
| | → LenderDeposits | One-to-Many |
| | → Withdrawals | One-to-Many |
| | → Disputes | One-to-Many |
| **Loans** | → Repayments | One-to-Many |
| | → Disputes | One-to-Many |
| | → Transactions | One-to-Many |
| **Repayments** | → Transactions | One-to-One |
| **Transactions** | → Loans, Repayments, etc. (polymorphic) | Many-to-One |

**Why References Only?**
- Data changes frequently (loan status, repayment statuses) – embedding would cause stale copies.
- Collections grow large – embedding would exceed the 16MB document limit.
- Virtual fields (e.g., `remainingBalance` on `Loan`) are computed at the application level.

---

## Entity Relationship Diagram (ERD)

The full ERD is available in the [schema document](./database-schema.md#entity-relationship-diagram-erd). It visualises all relationships between collections.

---

## Version & Updates

- **Current Version:** 1.0  
- **Last Updated:** 2026-06-19  
- Maintained by the MoneyCircle engineering team.

---

## Contributing

All schema changes must be accompanied by:
1. An update to this documentation.
2. A migration script (see [Migrations Guide](../MIGRATIONS.md)).
3. Updated Mongoose models and validation tests.

---

**Database Status:** ✅ Designed & Documented  
**Next Step:** Implement Mongoose Models (Issue #2)

Happy building! 🚀