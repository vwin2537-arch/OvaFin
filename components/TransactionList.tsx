
import React, { useState, useMemo } from 'react';
import type { Transaction, Category, Bank, TransactionSource, TransactionType } from '../types';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { MonthYearPicker } from './MonthYearPicker';
import { EditTransactionModal } from './EditTransactionModal';
import { ClearTransactionConfirmationModal } from './ClearTransactionConfirmationModal';

interface TransactionItemProps {
    transaction: Transaction;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onRequestDelete: (id: string, description: string) => void;
    onRequestEdit: (transaction: Transaction) => void;
    onRequestClear: (transaction: Transaction) => void;
    onCancelClear: (id: string) => void;
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

const TransactionItem: React.FC<TransactionItemProps> = ({ 
    transaction, isSelected, onSelect, onRequestDelete, onRequestEdit, onRequestClear, onCancelClear, getCategoryByValue, getBankById 
}) => {
    const isIncome = transaction.type === 'income';
    const category = getCategoryByValue(transaction.category);
    const Icon = category?.icon || (() => null);
    const paymentMethodText = transaction.paymentMethod === 'online' ? 'ออนไลน์' : 'เงินสด';
    const bank = transaction.bank ? getBankById(transaction.bank) : null;
    const sourceLabel = getSourceLabel(transaction.source);
    const sourceColorClass = getSourceColor(transaction.source);

    // ตรวจสอบสถานะเบิกคืน (รองรับข้อมูลเก่าที่ไม่มีฟิลด์นี้)
    const canBeCleared = transaction.isReimbursable === true && transaction.isCleared !== true;
    const isAlreadyCleared = transaction.isReimbursable === true && transaction.isCleared === true;

    return (
        <li className={`flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-minimal-border last:border-b-0 gap-4 transition-colors ${isSelected ? 'bg-amber-50/50' : ''}`}>
            <div className="flex items-center flex-1">
                {canBeCleared && (
                    <div className="mr-3 pl-2">
                        <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => onSelect(transaction.id)}
                            className="w-5 h-5 rounded border-gray-300 text-minimal-primary focus:ring-minimal-primary cursor-pointer"
                        />
                    </div>
                )}
                 <div className="p-3 bg-slate-100 rounded-full mr-4 flex-shrink-0">
                    <Icon className={`w-5 h-5 ${isIncome ? 'text-minimal-income' : 'text-minimal-expense'}`} />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <p className="font-semibold text-minimal-text-main truncate">{transaction.description}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${sourceColorClass}`}>
                            {sourceLabel}
                        </span>
                        {transaction.isReimbursable === true && (
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
            
            <div className="flex items-center justify-between sm:justify-end space-x-2 pl-14 sm:pl-0">
                <div className="flex flex-col items-end mr-2">
                    <p className={`font-bold text-lg ${isIncome ? 'text-minimal-income' : 'text-minimal-expense'}`}>
                        {isIncome ? '+' : '-'}฿{transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    {canBeCleared && (
                        <button 
                            onClick={() => onRequestClear(transaction)}
                            className="text-[11px] text-amber-600 hover:text-amber-700 font-bold bg-amber-100 px-2 py-1 rounded mt-1 transition-all active:scale-95 whitespace-nowrap"
                        >
                            เคลียร์ยอดนี้
                        </button>
                    )}
                    {isAlreadyCleared && (
                        <button 
                            onClick={() => onCancelClear(transaction.id)}
                            className="text-[11px] text-gray-400 hover:text-minimal-text-secondary mt-1 whitespace-nowrap"
                        >
                            ยกเลิกเคลียร์
                        </button>
                    )}
                </div>
                <div className="flex items-center">
                    <button onClick={() => onRequestEdit(transaction)} className="text-gray-300 hover:text-minimal-primary p-2" title="แก้ไขรายการ">
                        <EditIcon />
                    </button>
                    <button onClick={() => onRequestDelete(transaction.id, transaction.description)} className="text-gray-300 hover:text-minimal-expense p-2" title="ลบรายการ">
                        <TrashIcon />
                    </button>
                </div>
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
    // Modal states
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<{id: string, description: string} | null>(null);
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

    const [isClearModalOpen, setIsClearModalOpen] = useState(false);
    const [transactionToClear, setTransactionToClear] = useState<Transaction | null>(null);

    // Filtering states
    const [selectedSource, setSelectedSource] = useState<TransactionSource | 'all'>('all');
    const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'cleared'>('all');
    const [selectedType, setSelectedType] = useState<TransactionType | 'all'>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    
    // Selection state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const transactionYears = useMemo(() => {
        const years = new Set(transactions.map(t => new Date(t.date).getFullYear()));
        return Array.from(years).sort((a, b) => b - a);
    }, [transactions]);

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
            const yearMatch = tDate.getFullYear() === selectedYear;
            if (!yearMatch) return false;
            if (selectedMonth !== 'all' && tDate.getMonth() !== selectedMonth) return false;
            if (selectedSource !== 'all' && (t.source || 'personal') !== selectedSource) return false;
            if (selectedType !== 'all' && t.type !== selectedType) return false;
            if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
            
            // ปรับปรุงการกรองสถานะให้รองรับข้อมูลเก่า
            if (selectedStatus === 'pending') return t.isReimbursable === true && t.isCleared !== true;
            if (selectedStatus === 'cleared') return t.isReimbursable === true && t.isCleared === true;
            
            return true;
        });
    }, [transactions, selectedSource, selectedStatus, selectedType, selectedMonth, selectedYear, selectedCategory]);

    const totalPendingAmount = useMemo(() => {
        return filteredTransactions
            .filter(t => t.isReimbursable === true && t.isCleared !== true)
            .reduce((sum, t) => sum + t.amount, 0);
    }, [filteredTransactions]);

    const handleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const handleSelectAll = () => {
        const reimbursableOnPage = filteredTransactions.filter(t => t.isReimbursable === true && t.isCleared !== true);
        if (selectedIds.size === reimbursableOnPage.length && reimbursableOnPage.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(reimbursableOnPage.map(t => t.id)));
        }
    };

    const handleBulkClear = () => {
        if (selectedIds.size === 0) {
            const pending = filteredTransactions.filter(t => t.isReimbursable === true && t.isCleared !== true);
            if (pending.length > 0 && confirm(`คุณต้องการยืนยันการเคลียร์ยอดทั้งหมด ${pending.length} รายการที่แสดงอยู่ใช่หรือไม่?`)) {
                pending.forEach(t => updateTransaction(t.id, { isCleared: true }));
            }
        } else {
            if (confirm(`ยืนยันการเคลียร์ยอด ${selectedIds.size} รายการที่เลือก?`)) {
                selectedIds.forEach(id => updateTransaction(id, { isCleared: true }));
                setSelectedIds(new Set());
            }
        }
    };

    const handleRequestDelete = (id: string, description: string) => {
        setTransactionToDelete({ id, description });
        setIsDeleteModalOpen(true);
    };

    const handleRequestEdit = (transaction: Transaction) => {
        setTransactionToEdit(transaction);
        setIsEditModalOpen(true);
    };

    const handleRequestClear = (transaction: Transaction) => {
        setTransactionToClear(transaction);
        setIsClearModalOpen(true);
    };

    const handleConfirmClear = () => {
        if (transactionToClear) {
            updateTransaction(transactionToClear.id, { isCleared: true });
            setIsClearModalOpen(false);
            setTransactionToClear(null);
        }
    };

    const handleCancelClear = (id: string) => {
        updateTransaction(id, { isCleared: false });
    };

    const thaiMonths = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
    const selectedDateLabel = selectedMonth === 'all' ? `ทั้งปี ${selectedYear + 543}` : `${thaiMonths[selectedMonth as number]} ${selectedYear + 543}`;

    const selectClasses = "px-3 py-2 bg-white border border-minimal-border rounded-lg text-sm font-semibold text-minimal-text-main focus:outline-none focus:ring-2 focus:ring-minimal-primary shadow-sm hover:border-minimal-text-secondary transition-colors cursor-pointer";

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-minimal-text-main">รายการทั้งหมด</h1>
                    <p className="text-minimal-text-secondary">ประวัติรายรับ-รายจ่ายของคุณ</p>
                </div>
                {totalPendingAmount > 0 && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                        <div className="text-center sm:text-left">
                            <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">
                                ยอดค้างเบิกคืน {selectedMonth === 'all' ? `(ทั้งปี)` : `(${thaiMonths[selectedMonth as number]})`}
                            </p>
                            <p className="text-2xl font-black text-amber-600">฿{totalPendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                        {selectedStatus === 'pending' && (
                            <button 
                                onClick={handleBulkClear}
                                className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircleIcon className="w-5 h-5" />
                                {selectedIds.size > 0 ? `เคลียร์ ${selectedIds.size} รายการ` : 'ยืนยันเคลียร์ทุกรายการ'}
                            </button>
                        )}
                    </div>
                )}
            </header>

            {/* Filter Toolbar */}
            <div className="bg-minimal-card border border-minimal-border rounded-xl p-4 flex flex-wrap items-center gap-2 shadow-sm">
                <div className="relative">
                    <button 
                        onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                        className="px-3 py-2 bg-white border border-minimal-border rounded-lg text-sm font-semibold text-minimal-text-main flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <span className="truncate">{selectedDateLabel}</span>
                    </button>
                    {isDatePickerOpen && (
                        <div className="fixed inset-0 z-[100] md:absolute md:inset-auto md:top-full md:left-0 flex items-center justify-center md:block p-4 md:p-0 bg-black/20 md:bg-transparent">
                            <MonthYearPicker
                                value={{ month: selectedMonth, year: selectedYear }}
                                availableYears={transactionYears}
                                selectMode="month"
                                onChange={(val) => {
                                    setSelectedMonth(val.month);
                                    setSelectedYear(val.year);
                                    setIsDatePickerOpen(false);
                                    setSelectedIds(new Set());
                                }}
                                onClose={() => setIsDatePickerOpen(false)}
                            />
                        </div>
                    )}
                </div>

                <select value={selectedType} onChange={(e) => { setSelectedType(e.target.value as any); setSelectedIds(new Set()); }} className={selectClasses}>
                    <option value="all">ทุกประเภทรายการ</option>
                    <option value="income">รายรับ</option>
                    <option value="expense">รายจ่าย</option>
                </select>

                <select value={selectedSource} onChange={(e) => { setSelectedSource(e.target.value as any); setSelectedIds(new Set()); }} className={selectClasses}>
                    <option value="all">ทุกสังกัด</option>
                    <option value="erawan">เอราวัณ</option>
                    <option value="wildfire_station">สถานีไฟป่า</option>
                    <option value="personal">ส่วนตัว</option>
                </select>

                <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setSelectedIds(new Set()); }} className={selectClasses}>
                    <option value="all">ทุกหมวดหมู่</option>
                    {availableCategories.map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                    ))}
                </select>

                <select value={selectedStatus} onChange={(e) => { setSelectedStatus(e.target.value as any); setSelectedIds(new Set()); }} className={selectClasses}>
                    <option value="all">เบิกคืน: ทั้งหมด</option>
                    <option value="pending">รอเบิกคืน</option>
                    <option value="cleared">เบิกคืนแล้ว</option>
                </select>
            </div>
            
            {filteredTransactions.length > 0 ? (
                <div className="bg-minimal-card border border-minimal-border rounded-xl shadow-sm overflow-hidden">
                    {selectedStatus === 'pending' && (
                        <div className="bg-slate-50 px-4 py-2 border-b border-minimal-border flex items-center">
                            <input 
                                type="checkbox" 
                                checked={selectedIds.size > 0 && selectedIds.size === filteredTransactions.filter(t => t.isReimbursable === true && t.isCleared !== true).length}
                                onChange={handleSelectAll}
                                className="w-5 h-5 rounded border-gray-300 text-minimal-primary focus:ring-minimal-primary mr-3 cursor-pointer"
                            />
                            <span className="text-xs font-bold text-minimal-text-secondary uppercase">เลือกทั้งหมดในหน้านี้</span>
                        </div>
                    )}
                    <ul className="divide-y divide-minimal-border px-4">
                        {filteredTransactions.map(t => (
                            <TransactionItem 
                                key={t.id} 
                                transaction={t} 
                                isSelected={selectedIds.has(t.id)}
                                onSelect={handleSelect}
                                onRequestDelete={handleRequestDelete} 
                                onRequestEdit={handleRequestEdit}
                                onRequestClear={handleRequestClear}
                                onCancelClear={handleCancelClear}
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
                </div>
            )}
            
            {/* Confirmation Modals */}
            {isDeleteModalOpen && transactionToDelete && (
                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={() => {
                        deleteTransaction(transactionToDelete.id);
                        setIsDeleteModalOpen(false);
                    }}
                    transactionDescription={transactionToDelete.description}
                />
            )}

            {isEditModalOpen && transactionToEdit && (
                <EditTransactionModal
                    transaction={transactionToEdit}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={(updates) => {
                        updateTransaction(transactionToEdit.id, updates);
                        setIsEditModalOpen(false);
                    }}
                    getCategoryByValue={getCategoryByValue}
                />
            )}

            {isClearModalOpen && transactionToClear && (
                <ClearTransactionConfirmationModal
                    isOpen={isClearModalOpen}
                    onClose={() => setIsClearModalOpen(false)}
                    onConfirm={handleConfirmClear}
                    transaction={transactionToClear}
                />
            )}
        </div>
    );
};


const TrashIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const EditIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const CalendarIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const SearchIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const CheckCircleIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
