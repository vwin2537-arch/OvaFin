
import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Category, Transaction, TransactionType, Bank } from '../types';
import { ClearDataConfirmationModal } from './ClearDataConfirmationModal';

interface SettingsProps {
    incomeCategories: Category[];
    expenseCategories: Category[];
    addCategory: (type: TransactionType, label: string) => void;
    deleteCategory: (type: TransactionType, value: string) => void;
    transactions: Transaction[];
    onClearAllData: () => void;
    onRestoreData: (data: any) => void;
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

// Component to display storage usage
const StorageStatus: React.FC = () => {
    const [usage, setUsage] = useState({ used: 0, percent: 0 });
    const MAX_SIZE = 5 * 1024 * 1024; // Approx 5MB for localStorage

    useEffect(() => {
        const calculateUsage = () => {
            let total = 0;
            for (let x in localStorage) {
                if (!localStorage.hasOwnProperty(x)) continue;
                total += ((localStorage[x].length + x.length) * 2);
            }
            // total is in bytes (utf-16 chars are 2 bytes)
            // But localStorage limits are usually character based (5M chars ~ 10MB) or byte based.
            // Let's assume standard 5MB limit behavior for safety.
            const usedBytes = total;
            const percent = Math.min((usedBytes / MAX_SIZE) * 100, 100);
            setUsage({ used: usedBytes, percent });
        };
        calculateUsage();
        // Recalculate periodically just in case
        const interval = setInterval(calculateUsage, 5000);
        return () => clearInterval(interval);
    }, []);

    const usedKB = (usage.used / 1024).toFixed(2);
    
    return (
        <div className="bg-minimal-card p-6 border border-minimal-border rounded-xl">
             <h2 className="text-xl font-semibold text-minimal-text-main mb-4">สถานะหน่วยความจำ</h2>
             <div className="flex justify-between text-sm text-minimal-text-secondary mb-2">
                <span>พื้นที่ใช้งานไปแล้ว</span>
                <span>{usedKB} KB ({usage.percent.toFixed(2)}%)</span>
             </div>
             <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div 
                    className="bg-minimal-primary h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${usage.percent}%` }}
                ></div>
             </div>
             <p className="text-xs text-gray-400 mt-2">
                ระบบใช้พื้นที่จัดเก็บในเบราว์เซอร์ของคุณ (Local Storage) ซึ่งรองรับรายการได้มากกว่า 10,000 รายการ
             </p>
        </div>
    );
};


export const Settings: React.FC<SettingsProps> = ({ 
    incomeCategories, expenseCategories, addCategory, deleteCategory, 
    transactions, onClearAllData, onRestoreData,
    banks, addBank, deleteBank 
}) => {
    
    const [isClearDataModalOpen, setIsClearDataModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const usedCategories = useMemo(() => {
        return new Set(transactions.map(t => t.category));
    }, [transactions]);

    const usedBanks = useMemo(() => {
        return new Set(transactions.filter(t => t.bank).map(t => t.bank!));
    }, [transactions]);

    const handleBackup = () => {
        const data = {
            transactions,
            incomeCategories,
            expenseCategories,
            banks,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ovafin-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = event.target?.result as string;
                const data = JSON.parse(json);

                if (data.transactions && Array.isArray(data.transactions)) {
                    // Update state directly through App.tsx
                    onRestoreData(data);
                } else {
                    alert('ไฟล์ไม่ถูกต้อง: ไม่พบข้อมูลธุรกรรม');
                }
            } catch (error) {
                console.error('Error parsing backup file:', error);
                alert('เกิดข้อผิดพลาดในการอ่านไฟล์สำรองข้อมูล');
            }
        };
        reader.readAsText(file);
        
        // Reset file input to allow selecting the same file again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
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

            {/* Storage Status */}
            <StorageStatus />

            {/* Data Management Section */}
            <div className="bg-minimal-card p-6 border border-minimal-border rounded-xl">
                <h2 className="text-xl font-semibold text-minimal-text-main mb-4">สำรองและกู้คืนข้อมูล</h2>
                <p className="text-sm text-minimal-text-secondary mb-4">
                    เนื่องจากข้อมูลทั้งหมดถูกเก็บไว้ในอุปกรณ์นี้ หากคุณต้องการย้ายเครื่องหรือป้องกันข้อมูลสูญหาย กรุณาสำรองข้อมูลเป็นประจำ
                </p>
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={handleBackup}
                        className="flex items-center px-5 py-2 bg-slate-100 text-minimal-primary rounded-lg hover:bg-slate-200 font-semibold border border-minimal-border"
                    >
                        <DownloadIcon className="w-5 h-5 mr-2" />
                        สำรองข้อมูล (Backup)
                    </button>
                    
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center px-5 py-2 bg-slate-100 text-minimal-primary rounded-lg hover:bg-slate-200 font-semibold border border-minimal-border"
                    >
                        <UploadIcon className="w-5 h-5 mr-2" />
                        กู้คืนข้อมูล (Restore)
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleRestore} 
                        accept=".json" 
                        className="hidden" 
                    />
                </div>
            </div>

            {/* Danger Zone */}
            <div className="border-t border-minimal-border pt-6">
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-rose-800">โซนอันตราย</h2>
                    <p className="text-rose-600 mt-1 mb-4">การดำเนินการในส่วนนี้ไม่สามารถย้อนกลับได้</p>
                    <button
                        onClick={() => setIsClearDataModalOpen(true)}
                        className="px-5 py-2 bg-minimal-expense text-white rounded-lg hover:bg-red-600 font-semibold"
                    >
                        ลบข้อมูลทั้งหมด
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
const DownloadIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const UploadIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
