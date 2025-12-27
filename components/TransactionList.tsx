
import React, { useState, useMemo } from 'react';
import type { Transaction, Category, Bank, TransactionSource } from '../types';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { MonthYearPicker } from './MonthYearPicker';

interface TransactionItemProps {
    transaction: Transaction;
    onRequestDelete: (id: string, description: string) => void;
    onToggleClear: (id: string, currentStatus: boolean) => void;
    getCategoryByValue: (value: string) => Category | undefined;
    getBankById: (id: string) => Bank | undefined;
}

const getSourceLabel = (source: TransactionSource | undefined): string => {
    switch (source) {
        case 'erawan': return 'เอราวัณ';
        case 'wildfire_station': return 'สถานีไฟป่า';
        case 'personal': return 'ส่วนตัว';
        default: return 'ส่วนตัว';
    }
};

const getSourceColor = (source: TransactionSource | undefined): string => {
    switch (source) {
        case 'erawan': return 'bg-blue-100 text-blue-800';
        case 'wildfire_station': return 'bg-orange-100 text-orange-800';
        case 'personal': return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onRequestDelete, onToggleClear, getCategoryByValue, getBankById }) => {
    const isIncome = transaction.type === 'income';
    const category = getCategoryByValue(transaction.category);
    const Icon = category?.icon || (() => null);
    const paymentMethodText = transaction.paymentMethod === 'online' ? 'ออนไลน์' : 'เงินสด';
    const bank = transaction.bank ? getBankById(transaction.bank) : null;
    const sourceLabel = getSourceLabel(transaction.source);
    const sourceColorClass = getSourceColor(transaction.source);

    return (
        <li className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-minimal-border last:border-b-0 gap-4">
            <div className="flex items-center flex-1">
                 <div className="p-3 bg-slate-100 rounded-full mr-4 flex-shrink-0">
                    <Icon className={`w-5 h-5 ${isIncome ? 'text-minimal-income' : 'text-minimal-expense'}`} />
                </div>
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <p className="font-semibold text-minimal-text-main truncate">{transaction.description}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${sourceColorClass}`}>
                            {sourceLabel}
                        </span>
                        {transaction.isReimbursable && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${transaction.isCleared ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                {transaction.isCleared ? '✓ เคลียร์แล้ว' : '⌛ รอเบิกคืน'}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-minimal-text-secondary flex flex-wrap items-center">
                        <span className="truncate">{category?.label || transaction.category}</span>
                        <span className="text-gray-400 mx-1.5">·</span>
                        <span className="truncate">{paymentMethodText}{bank && ` (${bank.name})`}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(transaction.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end space-x-4 pl-14 sm:pl-0">
                <div className="flex flex-col items-end">
                    <p className={`font-bold text-lg ${isIncome ? 'text-minimal-income' : 'text-minimal-expense'}`}>
                        {isIncome ? '+' : '-'}฿{transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    {transaction.isReimbursable && !transaction.isCleared && (
                        <button 
                            onClick={() => onToggleClear(transaction.id, false)}
                            className="text-[11px] text-amber-600 hover:text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded mt-1 transition-colors"
                        >
                            ยืนยันการเคลียร์ยอด
                        </button>
                    )}
                    {transaction.isReimbursable && transaction.isCleared && (
                        <button 
                            onClick={() => onToggleClear(transaction.id, true)}
                            className="text-[11px] text-gray-400 hover:text-minimal-text-secondary mt-1"
                        >
                            ยกเลิกการเคลียร์
                        </button>
                    )}
                </div>
                <button onClick={() => onRequestDelete(transaction.id, transaction.description)} className="text-gray-300 hover:text-minimal-expense p-2">
                    <TrashIcon />
                </button>
            </div>
        </li>
    );
};

interface TransactionListProps {
    transactions: Transaction[];
    deleteTransaction: (id: string) => void;
    updateTransaction: (id: string, updates: Partial<Transaction>) => void;
    getCategoryByValue: (value: string) => Category | undefined;
    getBankById: (id: string) => Bank | undefined;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, deleteTransaction, updateTransaction, getCategoryByValue, getBankById }) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<{id: string, description: string} | null>(null);
    
    // Filtering states
    const [selectedSource, setSelectedSource] = useState<TransactionSource | 'all'>('all');
    const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'cleared'>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    const transactionYears = useMemo(() => {
        const years = new Set(transactions.map(t => new Date(t.date).getFullYear()));
        return Array.from(years).sort((a, b) => b - a);
    }, [transactions]);

    // Unique categories from current transactions to populate the filter
    const availableCategories = useMemo(() => {
        const catMap = new Map<string, string>();
        transactions.forEach(t => {
            if (!catMap.has(t.category)) {
                catMap.set(t.category, getCategoryByValue(t.category)?.label || t.category);
            }
        });
        return Array.from(catMap.entries()).sort((a, b) => a[1].localeCompare(b[1]));
    }, [transactions, getCategoryByValue]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const tDate = new Date(t.date);
            
            // Filter by Date
            const yearMatch = tDate.getFullYear() === selectedYear;
            if (!yearMatch) return false;

            if (selectedMonth !== 'all') {
                const monthMatch = tDate.getMonth() === selectedMonth;
                if (!monthMatch) return false;
            }

            // Filter by Source
            const sourceMatch = selectedSource === 'all' || (t.source || 'personal') === selectedSource;
            if (!sourceMatch) return false;

            // Filter by Category
            if (selectedCategory !== 'all' && t.category !== selectedCategory) {
                return false;
            }

            // Filter by Status (Reimbursement)
            if (selectedStatus === 'pending') {
                return t.isReimbursable && !t.isCleared;
            } else if (selectedStatus === 'cleared') {
                return t.isReimbursable && t.isCleared;
            }

            return true;
        });
    }, [transactions, selectedSource, selectedStatus, selectedMonth, selectedYear, selectedCategory]);

    const totalPendingAmount = useMemo(() => {
        return filteredTransactions
            .filter(t => t.isReimbursable && !t.isCleared)
            .reduce((sum, t) => sum + t.amount, 0);
    }, [filteredTransactions]);

    const handleRequestDelete = (id: string, description: string) => {
        setTransactionToDelete({ id, description });
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (transactionToDelete) {
            deleteTransaction(transactionToDelete.id);
            handleCloseModal();
        }
    };

    const handleCloseModal = () => {
        setIsDeleteModalOpen(false);
        setTransactionToDelete(null);
    };

    const handleToggleClear = (id: string, currentStatus: boolean) => {
        updateTransaction(id, { isCleared: !currentStatus });
    };

    const thaiMonths = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

    const selectedDateLabel = selectedMonth === 'all' ? `ทั้งปี ${selectedYear + 543}` : `${thaiMonths[selectedMonth as number]} ${selectedYear + 543}`;

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-minimal-text-main">รายการทั้งหมด</h1>
                    <p className="text-minimal-text-secondary">ประวัติรายรับ-รายจ่ายของคุณ</p>
                </div>
                {totalPendingAmount > 0 && (
                    <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl">
                        <p className="text-xs text-amber-700 font-bold uppercase tracking-wider truncate">
                            ค้างเบิกคืน {selectedMonth === 'all' ? `(ทั้งปี)` : `(${thaiMonths[selectedMonth as number]})`}
                        </p>
                        <p className="text-xl font-black text-amber-600">฿{totalPendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                )}
            </header>

            {/* Filter Toolbar */}
            <div className="bg-minimal-card border border-minimal-border rounded-xl p-4 flex flex-wrap items-center gap-3">
                <div className="relative">
                    <button 
                        onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                        className="px-3 py-2 bg-slate-50 border border-minimal-border rounded-lg text-sm font-semibold text-minimal-text-main flex items-center gap-2 hover:bg-slate-100 focus:ring-2 focus:ring-minimal-primary focus:outline-none"
                    >
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <span className="truncate">{selectedDateLabel}</span>
                    </button>
                    {isDatePickerOpen && (
                        <div className="absolute top-full left-0 z-[100] mt-2">
                            <MonthYearPicker
                                value={{ month: selectedMonth, year: selectedYear }}
                                availableYears={transactionYears}
                                selectMode="month"
                                onChange={(val) => {
                                    setSelectedMonth(val.month);
                                    setSelectedYear(val.year);
                                    setIsDatePickerOpen(false);
                                }}
                                onClose={() => setIsDatePickerOpen(false)}
                            />
                        </div>
                    )}
                </div>

                <select 
                    value={selectedSource} 
                    onChange={(e) => setSelectedSource(e.target.value as TransactionSource | 'all')}
                    className="px-3 py-2 bg-slate-50 border border-minimal-border rounded-lg text-sm font-semibold text-minimal-text-main focus:outline-none focus:ring-2 focus:ring-minimal-primary"
                >
                    <option value="all">ทุกสังกัด</option>
                    <option value="erawan">เอราวัณ</option>
                    <option value="wildfire_station">สถานีไฟป่า</option>
                    <option value="personal">ส่วนตัว</option>
                </select>

                <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-minimal-border rounded-lg text-sm font-semibold text-minimal-text-main focus:outline-none focus:ring-2 focus:ring-minimal-primary"
                >
                    <option value="all">ทุกหมวดหมู่</option>
                    {availableCategories.map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                    ))}
                </select>

                <select 
                    value={selectedStatus} 
                    onChange={(e) => setSelectedStatus(e.target.value as any)}
                    className="px-3 py-2 bg-slate-50 border border-minimal-border rounded-lg text-sm font-semibold text-minimal-text-main focus:outline-none focus:ring-2 focus:ring-minimal-primary"
                >
                    <option value="all">เบิกคืน: ทั้งหมด</option>
                    <option value="pending">ยังไม่เคลียร์ยอด</option>
                    <option value="cleared">เคลียร์ยอดแล้ว</option>
                </select>
            </div>
            
            {filteredTransactions.length > 0 ? (
                <div className="bg-minimal-card border border-minimal-border rounded-xl shadow-sm overflow-hidden">
                    <ul className="divide-y divide-minimal-border px-4">
                        {filteredTransactions.map(t => (
                            <TransactionItem 
                                key={t.id} 
                                transaction={t} 
                                onRequestDelete={handleRequestDelete} 
                                onToggleClear={handleToggleClear}
                                getCategoryByValue={getCategoryByValue} 
                                getBankById={getBankById} 
                            />
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="text-center py-20 bg-minimal-card border border-minimal-border rounded-xl shadow-sm">
                    <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <SearchIcon className="h-8 w-8" />
                    </div>
                    <p className="text-minimal-text-secondary font-medium">ไม่พบรายการที่ตรงตามเงื่อนไข</p>
                    <p className="text-sm text-gray-400">ลองเปลี่ยนตัวกรองหรือเลือกเดือนอื่น</p>
                </div>
            )}
            
            {transactionToDelete && (
                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={handleCloseModal}
                    onConfirm={handleConfirmDelete}
                    transactionDescription={transactionToDelete.description}
                />
            )}
        </div>
    );
};


const TrashIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const CalendarIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const SearchIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
