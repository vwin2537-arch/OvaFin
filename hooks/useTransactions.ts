
import { useState, useEffect } from 'react';
import type { Transaction } from '../types';

const STORAGE_KEY = 'finance-tracker-transactions';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const storedTransactions = window.localStorage.getItem(STORAGE_KEY);
      return storedTransactions ? JSON.parse(storedTransactions) : [];
    } catch (error) {
      console.error('Error reading transactions from localStorage', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (error) {
      console.error('Error saving transactions to localStorage', error);
    }
  }, [transactions]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      id: new Date().toISOString() + Math.random(),
      ...transaction,
    };
    setTransactions(prev => [...prev, newTransaction].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const clearTransactions = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      setTransactions([]);
    } catch (error) {
      console.error('Error clearing transactions from localStorage', error);
    }
  };

  return { transactions, addTransaction, deleteTransaction, clearTransactions };
};
