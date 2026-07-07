# Personal Finance OS (PFOS) PRD

## Vision

Membangun Financial Operating System untuk mengelola keuangan pribadi
dan keluarga.

## Goals

-   Mengetahui posisi uang
-   Mengelola cashflow
-   Budgeting
-   Saving Plan
-   Investment Plan
-   Revenue Plan
-   Net Worth
-   Financial Insight

## Sitemap

``` text
Dashboard
Finance
├── Accounts
├── Transactions
├── Categories
├── Transfers
Planning
├── Budget
├── Revenue Plan
├── Saving Plan
├── Investment Plan
├── Goals
Assets
├── Assets
├── Liabilities
├── Net Worth
Reports
├── Cash Flow
├── Income
├── Expense
├── Budget
├── Saving
├── Investment
Automation
├── Recurring Transaction
├── Bills Reminder
Settings
├── Users
├── Family Members
├── Currency
├── Categories
├── Account Types
```

## Core Modules

-   Accounts
-   Journal (Double Entry Ledger)
-   Transactions
-   Categories
-   Budget
-   Saving Goals
-   Investment Plan
-   Revenue Plan
-   Assets
-   Liabilities
-   Reports
-   Dashboard
-   Notifications
-   Smart Insights

## Dashboard KPI

-   Total Assets
-   Total Liabilities
-   Net Worth
-   Cash Available
-   Income This Month
-   Expense This Month
-   Saving This Month
-   Investment This Month

## Roadmap

### MVP

-   Dashboard
-   Accounts
-   Transactions
-   Categories
-   Budget
-   Saving Plan
-   Revenue Plan
-   Basic Reports

### v1.5

-   Investment
-   Assets
-   Liabilities
-   Net Worth
-   Recurring Transactions
-   Bills Reminder

### v2.0

-   Family Finance
-   AI Insights
-   OCR Receipt
-   Bank Import
-   Cashflow Forecast

## Architecture

Feature-based Clean Architecture:

-   Dashboard
-   Accounts
-   Ledger
-   Transactions
-   Budgeting
-   Revenue Planning
-   Saving Planning
-   Investment
-   Assets
-   Liabilities
-   Reports
-   Insights
-   Notifications
-   Settings

Semua modul terhubung melalui General Ledger sebagai Single Source of
Truth.
