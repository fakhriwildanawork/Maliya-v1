import { Activity, ChartDataPoint, CreditCard, Wallet, Budget } from '../../logic/types/finance';

export const dummyWallets: Wallet[] = [
  {
    id: 'w1',
    name: 'Main Account',
    balance: 22678.0,
    limit: 10000,
    status: 'Active',
  },
  {
    id: 'w2',
    name: 'Savings',
    balance: 18345.0,
    limit: 8000,
    status: 'Active',
  },
  {
    id: 'w3',
    name: 'Business',
    balance: 15000.0,
    limit: 7500,
    status: 'Inactive',
  },
];

export const dummyCards: CreditCard[] = [
  {
    id: 'c1',
    number: '**** **** **** 6782',
    exp: '09/29',
    cvv: '611',
    status: 'Active',
    theme: 'dark',
    balance: 5000,
  },
  {
    id: 'c2',
    number: '**** **** **** 4356',
    exp: '12/28',
    cvv: '***',
    status: 'Active',
    theme: 'green',
    balance: 12000,
  },
];

export const dummyBudgets: Budget[] = [
  { id: '1', category: 'Food & Dining', limit: 2000000, spent: 1400000, status: 'On Track', month: 6, year: 2026 },
  { id: '2', category: 'Transportation', limit: 1000000, spent: 800000, status: 'Warning', month: 6, year: 2026 },
  { id: '3', category: 'Entertainment', limit: 500000, spent: 550000, status: 'Exceeded', month: 6, year: 2026 },
  { id: '4', category: 'Food & Dining', limit: 2000000, spent: 500000, status: 'On Track', month: 5, year: 2026 },
  { id: '5', category: 'Software & Subscriptions', limit: 1500000, spent: 200000, status: 'On Track', month: 6, year: 2026 },
];

export const dummyActivities: Activity[] = [
  { id: 'a1', orderId: 'INV_000076', title: 'Mobile App Purchase', category: 'Software', price: 25500, status: 'Completed', date: '17 Apr, 2026 03:45 PM', type: 'expense' },
  { id: 'a2', orderId: 'INV_000075', title: 'Hotel Booking', category: 'Travel', price: 32750, status: 'Pending', date: '15 Apr, 2026 11:30 AM', type: 'expense' },
  { id: 'a3', orderId: 'INV_000074', title: 'Client Payment', category: 'Income', price: 150000, status: 'Completed', date: '15 Apr, 2026 12:00 PM', type: 'income' },
  { id: 'a4', orderId: 'INV_000073', title: 'Grocery Purchase', category: 'Food', price: 50200, status: 'In Progress', date: '14 Apr, 2026 09:15 PM', type: 'expense' },
  { id: 'a5', orderId: 'INV_000072', title: 'Transfer to Savings', category: 'Transfer', price: 15900, status: 'Completed', date: '10 Apr, 2026 06:00 AM', type: 'transfer', sourceAccountId: 'w1', destinationAccountId: 'w2' },
  { id: 'a6', orderId: 'INV_000071', title: 'Office Supplies', category: 'Equipment', price: 5400, status: 'Completed', date: '08 Apr, 2026 02:15 PM', type: 'expense' },
  { id: 'a7', orderId: 'INV_000070', title: 'Client Dinner', category: 'Food', price: 12500, status: 'Completed', date: '05 Apr, 2026 08:30 PM', type: 'expense' },
  { id: 'a8', orderId: 'INV_000069', title: 'Salary', category: 'Income', price: 450000, status: 'Completed', date: '01 Apr, 2026 10:00 AM', type: 'income' },
  { id: 'a9', orderId: 'INV_000068', title: 'Marketing Campaign', category: 'Marketing', price: 120500, status: 'Completed', date: '28 Mar, 2026 11:00 AM', type: 'expense' },
  { id: 'a10', orderId: 'INV_000067', title: 'Transfer to Business', category: 'Transfer', price: 85000, status: 'Completed', date: '25 Mar, 2026 04:20 PM', type: 'transfer', sourceAccountId: 'w1', destinationAccountId: 'w3' },
  { id: 'a11', orderId: 'INV_000066', title: 'Design Assets', category: 'Design', price: 3200, status: 'In Progress', date: '20 Mar, 2026 09:45 AM', type: 'expense' },
  { id: 'a12', orderId: 'INV_000065', title: 'Legal Consultation', category: 'Legal', price: 15000, status: 'Completed', date: '15 Mar, 2026 02:00 PM', type: 'expense' },
  ...Array.from({ length: 60 }).map((_, i) => ({
    id: `a${i + 13}`,
    orderId: `INV_${100000 + i}`,
    title: `Transaction ${i + 1}`,
    category: i % 2 === 0 ? 'Food' : 'Income',
    price: Math.floor(Math.random() * 100000) + 1000,
    status: 'Completed' as const,
    date: '10 Apr, 2026 06:00 AM',
    type: (i % 2 === 0 ? 'expense' : 'income') as 'expense' | 'income'
  }))
];

export const chartData: ChartDataPoint[] = [
  { month: 'Jan', profit: 30000, loss: 15000 },
  { month: 'Feb', profit: 35000, loss: 20000 },
  { month: 'Mar', profit: 40000, loss: 18000 },
  { month: 'Apr', profit: 45000, loss: 25000 },
  { month: 'May', profit: 50000, loss: 30000 },
  { month: 'Jun', profit: 55000, loss: 20000 },
  { month: 'Jul', profit: 40000, loss: 10000 },
  { month: 'Aug', profit: 35000, loss: 0 },
];
