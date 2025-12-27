
import { useState, useEffect, useCallback } from 'react';
import type { Transaction } from '../types';

const STORAGE_KEY = 'finance-tracker-transactions';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const storedTransactions = window.localStorage.getItem(STORAGE_KEY);
      const parsed = storedTransactions ? JSON.parse(storedTransactions) : [];
      return parsed.sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime());
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

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      id: new Date().toISOString() + Math.random(),
      ...transaction,
    };
    setTransactions(prev => [...prev, newTransaction].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => {
        const next = prev.map(t => t.id === id ? { ...t, ...updates } : t);
        return next.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
  }, []);

  const bulkUpdateTransactions = useCallback((ids: string[], updates: Partial<Transaction>) => {
    setTransactions(prev => {
        const idSet = new Set(ids);
        const next = prev.map(t => idSet.has(t.id) ? { ...t, ...updates } : t);
        return next.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
  }, []);

  const clearTransactions = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      setTransactions([]);
    } catch (error) {
      console.error('Error clearing transactions from localStorage', error);
    }
  }, []);

  const setAllTransactions = useCallback((newTransactions: Transaction[]) => {
      setTransactions(newTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, []);

  return { 
    transactions, 
    addTransaction, 
    deleteTransaction, 
    updateTransaction, 
    bulkUpdateTransactions, 
    clearTransactions, 
    setAllTransactions 
  };
};
