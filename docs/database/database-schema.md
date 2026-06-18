# MoneyCircle Database Schema

## Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    User ||--o{ Loan : "borrows"
    User ||--o{ LenderDeposit : "makes"
    User ||--o{ Withdrawal : "requests"
    User ||--o{ Transaction : "participates"
    User ||--o{ Notification : "receives"
    User ||--o{ AuditLog : "generates"
    User ||--o{ CreditReport : "has"
    User ||--o{ Dispute : "files"
    Loan ||--o{ Repayment : "has"
    Loan ||--o{ Dispute : "may have"
    Loan ||--o{ Transaction : "includes"

    User {
        ObjectId _id
        string email
        string passwordHash
        string firstName
        string lastName
        string phoneNumber
        string idNumber
        string role "borrower | lender"
        string kycStatus "pending | verified | rejected"
        string creditGrade "A+ | A | B | C | D | E"
        number creditScore
        number debtToIncomeRatio
        address address
        date createdAt
        date updatedAt
    }

    Loan {
        ObjectId _id
        ObjectId borrowerId
        ObjectId lenderId "nullable"
        number amount
        number interestRate
        number termMonths
        string status "pending | active | completed | defaulted"
        date applicationDate
        date approvalDate
        date firstRepaymentDate
        number servicingFee
        string purpose
        array collateral
        date createdAt
        date updatedAt
    }

    Repayment {
        ObjectId _id
        ObjectId loanId
        number dueAmount
        date dueDate
        date paidDate
        string status "pending | paid | overdue"
        number lateFee
        ObjectId transactionId
        date createdAt
        date updatedAt
    }

    Transaction {
        ObjectId _id
        ObjectId userId
        string type "deposit | withdrawal | loan_disbursement | repayment | servicing_fee | dispute_hold"
        number amount
        string currency "ZAR"
        string status "pending | completed | failed | reversed"
        string reference
        date transactionDate
        ObjectId relatedEntityId "loanId, repaymentId, etc."
        string description
        date createdAt
    }

    Notification {
        ObjectId _id
        ObjectId userId
        string type "email | sms | push"
        string title
        string message
        boolean isRead
        date sentAt
        date readAt
        ObjectId relatedEntityId
    }

    CreditReport {
        ObjectId _id
        ObjectId userId
        date pulledDate
        number transUnionScore
        number numberOfAccounts
        number outstandingDebt
        number paymentHistoryPercent
        string creditGrade
        object rawData "full TransUnion response"
        date createdAt
    }

    LenderDeposit {
        ObjectId _id
        ObjectId userId
        number amount
        string status "pending | confirmed | failed"
        date depositDate
        string paymentMethod
        string reference
        date createdAt
    }

    Withdrawal {
        ObjectId _id
        ObjectId userId
        string type "standard | instant | idle"
        number amount
        number fee
        number netAmount
        string status "pending | processing | completed | failed"
        date requestedAt
        date completedAt
        string bankAccount
        date createdAt
    }

    Dispute {
        ObjectId _id
        ObjectId userId
        ObjectId loanId
        string reason
        string description
        string status "open | under_review | resolved | closed"
        date filedAt
        date resolvedAt
        string resolution
        array evidenceUrls
        date createdAt
        date updatedAt
    }

    AuditLog {
        ObjectId _id
        ObjectId userId
        string action
        string ipAddress
        string userAgent
        date timestamp
        object metadata
    }