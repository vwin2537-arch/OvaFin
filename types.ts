
// Fix: Import ComponentType to resolve React namespace error.
import type { ComponentType } from 'react';

export type TransactionType = 'income' | 'expense';
export type PaymentMethod = 'cash' | 'online';
export type TransactionSource = 'erawan' | 'wildfire_station' | 'personal';

export type View = 'dashboard' | 'transactions' | 'settings';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // ISO 8601 format string
  paymentMethod: PaymentMethod;
  bank?: string; // Bank ID
  source: TransactionSource;
  isReimbursable?: boolean; // New: For tracking prepayments
  isCleared?: boolean;      // New: For tracking if prepayment is reimbursed
}

export interface Category {
    value: string;
    label: string;
    // Fix: Use ComponentType instead of React.ComponentType
    icon: ComponentType<{ className?: string }>;
}

export interface Bank {
    id: string;
    name: string;
}
