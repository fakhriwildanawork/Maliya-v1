# Personal Finance OS - Workflow (Mermaid)

# Overall Workflow

``` mermaid
flowchart TD

A[User Login]

A --> B[Dashboard]

B --> C[Create Transaction]

C --> D{Transaction Type}

D -->|Income| E[Journal Entry]
D -->|Expense| E
D -->|Transfer| E
D -->|Adjustment| E

E --> F[Update Account Balance]

F --> G[Update Budget Realization]

F --> H[Update Saving Progress]

F --> I[Update Investment Progress]

F --> J[Update Revenue Progress]

G --> K[Recalculate Cashflow]
H --> K
I --> K
J --> K

K --> L[Recalculate Net Worth]

L --> M[Generate Reports]

M --> N[Dashboard KPI]

N --> O[AI Insight Engine]

O --> P[Notifications]
```

# Budget Workflow

``` mermaid
flowchart LR

BudgetPlan --> Transaction
Transaction --> Category
Category --> BudgetActual
BudgetActual --> BudgetProgress
BudgetProgress --> Dashboard
```

# Saving Plan Workflow

``` mermaid
flowchart LR

SavingGoal --> MonthlyContribution
MonthlyContribution --> Transaction
Transaction --> SavingProgress
SavingProgress --> Dashboard
```

# Investment Workflow

``` mermaid
flowchart LR

InvestmentPlan --> InvestmentTransaction
InvestmentTransaction --> Portfolio
Portfolio --> ROI
ROI --> Dashboard
```

# Revenue Workflow

``` mermaid
flowchart LR

RevenuePlan --> IncomeTransaction
IncomeTransaction --> RevenueActual
RevenueActual --> Achievement
Achievement --> Dashboard
```

# Net Worth Workflow

``` mermaid
flowchart TD

Accounts --> CashAsset

Assets --> TotalAsset

Liabilities --> TotalLiability

CashAsset --> NetWorth

TotalAsset --> NetWorth

TotalLiability --> NetWorth

NetWorth --> Dashboard
```

# Data Flow

``` mermaid
flowchart TD

Accounts --> Journal

Categories --> Journal

Transactions --> Journal

Journal --> Budget

Journal --> Saving

Journal --> Investment

Journal --> Revenue

Journal --> Reports

Reports --> Dashboard

Dashboard --> AIInsights

AIInsights --> Notifications
```
