
import { useState, useEffect } from 'react';
import type { Bank } from '../types';

const STORAGE_KEY = 'finance-tracker-banks';

const DEFAULT_BANKS: Bank[] = [
    { id: 'kbank', name: 'ธนาคารกสิกรไทย' },
    { id: 'scb', name: 'ธนาคารไทยพาณิชย์' },
    { id: 'bbl', name: 'ธนาคารกรุงเทพ' },
    { id: 'ktb', name: 'ธนาคารกรุงไทย' },
    { id: 'bay', name: 'ธนาคารกรุงศรีอยุธยา' },
];

export const useBanks = () => {
    const [banks, setBanks] = useState<Bank[]>(() => {
        try {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : DEFAULT_BANKS;
        } catch (error) {
            console.error('Error reading banks from localStorage', error);
            return DEFAULT_BANKS;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(banks));
        } catch (error) {
            console.error('Error saving banks to localStorage', error);
        }
    }, [banks]);

    const addBank = (name: string) => {
        const newBank: Bank = {
            id: name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now(),
            name,
        };
        setBanks(prev => [...prev, newBank]);
    };

    const deleteBank = (id: string) => {
        setBanks(prev => prev.filter(b => b.id !== id));
    };

    const clearBanks = () => {
        try {
            window.localStorage.removeItem(STORAGE_KEY);
            setBanks(DEFAULT_BANKS);
        } catch (error) {
            console.error('Error clearing banks from localStorage', error);
        }
    };

    const setAllBanks = (newBanks: Bank[]) => {
        setBanks(newBanks);
    };

    return { banks, addBank, deleteBank, clearBanks, setAllBanks };
};
