# Database Schema - Personal Finance OS

## Core Principle

General Ledger menjadi Single Source of Truth.

## Tables

### users

-   id (PK)
-   name
-   email

### accounts

-   id (PK)
-   user_id (FK)
-   name
-   type
-   currency
-   opening_balance
-   current_balance
-   status

### categories

-   id
-   parent_id
-   type (income/expense/transfer)
-   name

### transactions

-   id
-   transaction_date
-   reference_no
-   description
-   created_by

### journal_entries

-   id
-   transaction_id (FK)
-   account_id (FK)
-   category_id (FK)
-   debit
-   credit

### budgets

-   id
-   period
-   category_id
-   planned_amount
-   actual_amount

### saving_goals

-   id
-   name
-   target_amount
-   current_amount
-   deadline

### investment_plans

-   id
-   investment_type
-   target_amount
-   actual_amount

### revenue_plans

-   id
-   source
-   planned_amount
-   actual_amount

### assets

-   id
-   category
-   value

### liabilities

-   id
-   balance
-   installment

## Relationships

users 1--\* accounts transactions 1--\* journal_entries accounts 1--\*
journal_entries categories 1--\* journal_entries categories 1--\*
budgets
