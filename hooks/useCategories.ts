
import { useState, useEffect } from 'react';
import type { Category, TransactionType } from '../types';
import { DEFAULT_INCOME_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES, OtherIcon } from '../constants';

const INCOME_KEY = 'finance-tracker-income-categories';
const EXPENSE_KEY = 'finance-tracker-expense-categories';

export const useCategories = () => {
    const [incomeCategories, setIncomeCategories] = useState<Category[]>(() => {
        try {
            const stored = window.localStorage.getItem(INCOME_KEY);
            return stored ? JSON.parse(stored) : DEFAULT_INCOME_CATEGORIES;
        } catch (error) {
            console.error('Error reading income categories from localStorage', error);
            return DEFAULT_INCOME_CATEGORIES;
        }
    });

    const [expenseCategories, setExpenseCategories] = useState<Category[]>(() => {
        try {
            const stored = window.localStorage.getItem(EXPENSE_KEY);
            return stored ? JSON.parse(stored) : DEFAULT_EXPENSE_CATEGORIES;
        } catch (error) {
            console.error('Error reading expense categories from localStorage', error);
            return DEFAULT_EXPENSE_CATEGORIES;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(INCOME_KEY, JSON.stringify(incomeCategories));
        } catch (error) {
            console.error('Error saving income categories to localStorage', error);
        }
    }, [incomeCategories]);

    useEffect(() => {
        try {
            window.localStorage.setItem(EXPENSE_KEY, JSON.stringify(expenseCategories));
        } catch (error) {
            console.error('Error saving expense categories to localStorage', error);
        }
    }, [expenseCategories]);

    const addCategory = (type: TransactionType, label: string) => {
        const value = label.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
        const newCategory: Category = {
            value,
            label,
            icon: OtherIcon, // All custom categories get a default icon
        };

        if (type === 'income') {
            setIncomeCategories(prev => [...prev, newCategory]);
        } else {
            setExpenseCategories(prev => [...prev, newCategory]);
        }
    };

    const deleteCategory = (type: TransactionType, value: string) => {
        if (type === 'income') {
            setIncomeCategories(prev => prev.filter(c => c.value !== value));
        } else {
            setExpenseCategories(prev => prev.filter(c => c.value !== value));
        }
    };
    
    const clearCategories = () => {
        try {
            window.localStorage.removeItem(INCOME_KEY);
            window.localStorage.removeItem(EXPENSE_KEY);
            setIncomeCategories(DEFAULT_INCOME_CATEGORIES);
            setExpenseCategories(DEFAULT_EXPENSE_CATEGORIES);
        } catch (error) {
            console.error('Error clearing categories from localStorage', error);
        }
    };

    return { incomeCategories, expenseCategories, addCategory, deleteCategory, clearCategories };
};
