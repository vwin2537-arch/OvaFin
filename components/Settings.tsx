import React, { useState, useMemo } from 'react';
import type { Category, Transaction, TransactionType, Bank } from '../types';
import { ClearDataConfirmationModal } from './ClearDataConfirmationModal';

interface SettingsProps {
    incomeCategories: Category[];
    expenseCategories: Category[];
    addCategory: (type: TransactionType, label: string) => void;
    deleteCategory: (type: TransactionType, value: string) => void;
    transactions: Transaction[];
    onClearAllData: () => void;
    banks: Bank[];
    addBank: (name: string) => void;
    deleteBank: (id: string) => void;
}

const CategoryManager: React.FC<{
    title: string;
    type: TransactionType;
    categories: Category[];
    addCategory: (type: TransactionType, label: string) => void;
    deleteCategory: (type: TransactionType, value: string) => void;
    usedCategories: Set<string>;
}> = ({ title, type, categories, addCategory, deleteCategory, usedCategories }) => {
    const [newCategoryLabel, setNewCategoryLabel] = useState('');

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategoryLabel.trim()) {
            addCategory(type, newCategoryLabel.trim());
            setNewCategoryLabel('');
        }
    };

    return (
        <div className="bg-minimal-card p-6 border border-minimal-border rounded-xl">
            <h2 className="text-xl font-semibold text-minimal-text-main mb-4">{title}</h2>
            
            <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newCategoryLabel}
                    onChange={(e) => setNewCategoryLabel(e.target.value)}
                    placeholder="เพิ่มหมวดหมู่ใหม่"
                    className="flex-grow mt-1 block w-full px-4 py-2 bg-slate-50 border border-minimal-border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-minimal-primary text-minimal-text-main"
                />
                <button type="submit" className="px-5 py-2 mt-1 bg-minimal-primary text-white rounded-lg hover:bg-minimal-primary-hover font-semibold">เพิ่ม</button>
            </form>

            <ul className="space-y-2">
                {categories.map(cat => {
                    const isUsed = usedCategories.has(cat.value);
                    return (
                        <li key={cat.value} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <span className="text-minimal-text-secondary">{cat.label}</span>
                            <button 
                                onClick={() => deleteCategory(type, cat.value)} 
                                disabled={isUsed}
                                className="text-gray-400 hover:text-minimal-expense disabled:text-gray-300 disabled:cursor-not-allowed"
                                title={isUsed ? 'ไม่สามารถลบได้เนื่องจากมีการใช้งานอยู่' : 'ลบหมวดหมู่'}
                            >
                                <TrashIcon />
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

const BankManager: React.FC<{
    banks: Bank[];
    addBank: (name: string) => void;
    deleteBank: (id: string) => void;
    usedBanks: Set<string>;
}> = ({ banks, addBank, deleteBank, usedBanks }) => {
    const [newBankName, setNewBankName] = useState('');

    const handleAddBank = (e: React.FormEvent) => {
        e.preventDefault();
        if (newBankName.trim()) {
            addBank(newBankName.trim());
            setNewBankName('');
        }
    };

    return (
        <div className="bg-minimal-card p-6 border border-minimal-border rounded-xl">
            <h2 className="text-xl font-semibold text-minimal-text-main mb-4">จัดการธนาคาร</h2>
            
            <form onSubmit={handleAddBank} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                    placeholder="เพิ่มธนาคารใหม่"
                    className="flex-grow mt-1 block w-full px-4 py-2 bg-slate-50 border border-minimal-border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-minimal-primary text-minimal-text-main"
                />
                <button type="submit" className="px-5 py-2 mt-1 bg-minimal-primary text-white rounded-lg hover:bg-minimal-primary-hover font-semibold">เพิ่ม</button>
            </form>

            <ul className="space-y-2">
                {banks.map(bank => {
                    const isUsed = usedBanks.has(bank.id);
                    return (
                        <li key={bank.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <span className="text-minimal-text-secondary">{bank.name}</span>
                            <button 
                                onClick={() => deleteBank(bank.id)} 
                                disabled={isUsed}
                                className="text-gray-400 hover:text-minimal-expense disabled:text-gray-300 disabled:cursor-not-allowed"
                                title={isUsed ? 'ไม่สามารถลบได้เนื่องจากมีการใช้งานอยู่' : 'ลบธนาคาร'}
                            >
                                <TrashIcon />
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};


export const Settings: React.FC<SettingsProps> = ({ 
    incomeCategories, expenseCategories, addCategory, deleteCategory, 
    transactions, onClearAllData, 
    banks, addBank, deleteBank 
}) => {
    
    const [isClearDataModalOpen, setIsClearDataModalOpen] = useState(false);

    const usedCategories = useMemo(() => {
        return new Set(transactions.map(t => t.category));
    }, [transactions]);

    const usedBanks = useMemo(() => {
        return new Set(transactions.filter(t => t.bank).map(t => t.bank!));
    }, [transactions]);
    
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-minimal-text-main">ตั้งค่า</h1>
                <p className="text-minimal-text-secondary">จัดการข้อมูลแอปพลิเคชัน</p>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CategoryManager
                    title="หมวดหมู่รายรับ"
                    type="income"
                    categories={incomeCategories}
                    addCategory={addCategory}
                    deleteCategory={deleteCategory}
                    usedCategories={usedCategories}
                />
                <CategoryManager
                    title="หมวดหมู่รายจ่าย"
                    type="expense"
                    categories={expenseCategories}
                    addCategory={addCategory}
                    deleteCategory={deleteCategory}
                    usedCategories={usedCategories}
                />
            </div>

            <BankManager
                banks={banks}
                addBank={addBank}
                deleteBank={deleteBank}
                usedBanks={usedBanks}
            />

            {/* Danger Zone */}
            <div className="border-t border-minimal-border pt-6">
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-rose-800">โซนอันตราย</h2>
                    <p className="text-rose-600 mt-1 mb-4">การดำเนินการในส่วนนี้ไม่สามารถย้อนกลับได้</p>
                    <button
                        onClick={() => setIsClearDataModalOpen(true)}
                        className="px-5 py-2 bg-minimal-expense text-white rounded-lg hover:bg-red-600 font-semibold"
                    >
                        ลบข้อมูลทั้งหมดและรีเซ็ตแอป
                    </button>
                </div>
            </div>
            
            {isClearDataModalOpen && (
                <ClearDataConfirmationModal
                    isOpen={isClearDataModalOpen}
                    onClose={() => setIsClearDataModalOpen(false)}
                    onConfirm={onClearAllData}
                />
            )}

        </div>
    );
};

const TrashIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
