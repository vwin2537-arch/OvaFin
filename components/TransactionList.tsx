
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
        case 'erawan': return 'bg-blue-50 text-blue-600 border-blue-100';
        case 'wildfire_station': return 'bg-orange-50 text-orange-600 border-orange-100';
        case 'personal': return 'bg-purple-50 text-purple-600 border-purple-100';
        default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
};

const TransactionItem: React.FC<TransactionItemProps> = ({ 
    transaction, isSelected, onSelect, onRequestDelete, onRequestEdit, onRequestClear, onCancelClear, getCategoryByValue, getBankById 
}) => {
    const isIncome = transaction.type === 'income';
    const category = getCategoryByValue(transaction.category);
    const Icon = category?.icon || (() => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>);
    const bank = transaction.bank ? getBankById(transaction.bank) : null;
    const sourceLabel = getSourceLabel(transaction.source);
    const sourceColorClass = getSourceColor(transaction.source);

    const canBeCleared = transaction.isReimbursable === true && transaction.isCleared !== true;

    // Format time for interesting sorting view
    const timeStr = new Date(transaction.date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className={`group flex items-center p-4 sm:p-5 rounded-3xl border transition-all duration-300 ${isSelected ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-minimal-border hover:border-indigo-100 hover:shadow-sm'}`}>
            {transaction.isReimbursable === true && (
                <div className="mr-4">
                    <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => onSelect(transaction.id)}
                        className="w-6 h-6 rounded-lg border-slate-300 text-minimal-primary focus:ring-minimal-primary cursor-pointer transition-transform active:scale-90"
                    />
                </div>
            )}
            
            <div className={`p-3.5 rounded-2xl mr-4 flex-shrink-0 transition-transform group-hover:scale-110 ${isIncome ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                <Icon className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4 className="font-bold text-minimal-text-main truncate text-base">{transaction.description}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-lg font-black border uppercase tracking-wider ${sourceColorClass}`}>
                        {sourceLabel}
                    </span>
                    {transaction.isReimbursable === true && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-lg font-black border uppercase tracking-wider ${transaction.isCleared ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                            {transaction.isCleared ? '✓ เคลียร์แล้ว' : '⌛ รอคืน'}
                        </span>
                    )}
                </div>
                <div className="flex items-center text-xs font-semibold text-minimal-text-secondary gap-2">
                    <span className="text-minimal-primary font-black bg-indigo-50 px-1.5 py-0.5 rounded-md">{timeStr} น.</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span>{category?.label || transaction.category}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span className="text-slate-400 font-medium">{new Date(transaction.date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}</span>
                </div>
            </div>

            <div className="flex flex-col items-end space-y-2">
                <p className={`font-black text-lg sm:text-xl ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {isIncome ? '+' : '-'}฿{transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {canBeCleared && (
                        <button 
                            onClick={() => onRequestClear(transaction)}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                            title="เคลียร์ยอดเงิน"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                        </button>
                    )}
                    <button onClick={() => onRequestEdit(transaction)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => onRequestDelete(transaction.id, transaction.description)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            </div>
        </div>
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
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);
    const [transactionToClear, setTransactionToClear] = useState<Transaction | null>(null);

    const [selectedSource, setSelectedSource] = useState<TransactionSource | 'all'>('all');
    const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'cleared'>('all');
    const [selectedType, setSelectedType] = useState<TransactionType | 'all'>('all');
    const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const transactionYears = useMemo(() => {
        const years = new Set(transactions.map(t => new Date(t.date).getFullYear()));
        // Fix: Explicitly type sort parameters to resolve arithmetic operation error.
        return Array.from(years).sort((a: number, b: number) => b - a);
    }, [transactions]);

    const filteredTransactions = useMemo(() => {
        // Sorting logic: Sort by Date AND Time (using getTime())
        return transactions
            .filter(t => {
                const tDate = new Date(t.date);
                if (tDate.getFullYear() !== selectedYear) return false;
                if (selectedMonth !== 'all' && tDate.getMonth() !== selectedMonth) return false;
                if (selectedSource !== 'all' && (t.source || 'personal') !== selectedSource) return false;
                if (selectedType !== 'all' && t.type !== selectedType) return false;
                if (selectedStatus === 'pending') return t.isReimbursable === true && t.isCleared !== true;
                if (selectedStatus === 'cleared') return t.isReimbursable === true && t.isCleared === true;
                return true;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, selectedSource, selectedStatus, selectedType, selectedMonth, selectedYear]);

    const handleSelect = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id); else next.add(id);
        setSelectedIds(next);
    };

    const handleBulkClear = () => {
        if (selectedIds.size > 0 && confirm(`เคลียร์ยอด ${selectedIds.size} รายการที่เลือก?`)) {
            selectedIds.forEach(id => updateTransaction(id, { isCleared: true }));
            setSelectedIds(new Set());
        }
    };

    const selectClasses = "px-4 py-2.5 bg-white border border-minimal-border rounded-2xl text-xs sm:text-sm font-bold text-minimal-text-main shadow-sm focus:ring-2 focus:ring-minimal-primary outline-none transition-all hover:border-indigo-200 cursor-pointer";

    return (
        <div className="space-y-8 pb-24">
            <header className="flex flex-col md:flex-row justify-between md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-black text-minimal-text-main tracking-tight">รายการเงิน</h1>
                    <p className="text-minimal-text-secondary font-medium">จัดการทุกการเคลื่อนไหวตามลำดับเวลา</p>
                </div>
                {selectedIds.size > 0 && (
                    <button onClick={handleBulkClear} className="bg-minimal-primary text-white px-6 py-3 rounded-2xl text-sm font-black hover:bg-minimal-primary-hover shadow-lg shadow-indigo-100 transition-all active:scale-95">
                        เคลียร์ที่เลือก ({selectedIds.size})
                    </button>
                )}
            </header>

            <div className="flex flex-wrap items-center gap-3 bg-slate-100/50 p-2 rounded-[2rem]">
                <div className="relative">
                    <button onClick={() => setIsDatePickerOpen(!isDatePickerOpen)} className={`${selectClasses} flex items-center gap-2`}>
                        <svg className="w-4 h-4 text-minimal-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {selectedMonth === 'all' ? `ปี ${selectedYear + 543}` : `${["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."][selectedMonth as number]} ${selectedYear + 543}`}
                    </button>
                    {isDatePickerOpen && (
                        <div className="absolute top-full mt-2 left-0 z-50">
                            <MonthYearPicker value={{ month: selectedMonth, year: selectedYear }} availableYears={transactionYears} selectMode="month" onChange={(v) => { setSelectedMonth(v.month); setSelectedYear(v.year); setIsDatePickerOpen(false); }} onClose={() => setIsDatePickerOpen(false)} />
                        </div>
                    )}
                </div>
                <select value={selectedType} onChange={e => setSelectedType(e.target.value as any)} className={selectClasses}>
                    <option value="all">ทุกประเภท</option>
                    <option value="income">รายรับ</option>
                    <option value="expense">รายจ่าย</option>
                </select>
                <select value={selectedSource} onChange={e => setSelectedSource(e.target.value as any)} className={selectClasses}>
                    <option value="all">ทุกสังกัด</option>
                    <option value="personal">ส่วนตัว</option>
                    <option value="erawan">เอราวัณ</option>
                    <option value="wildfire_station">ไฟป่า</option>
                </select>
                <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value as any)} className={selectClasses}>
                    <option value="all">เบิกคืน: ทั้งหมด</option>
                    <option value="pending">ยังไม่เคลียร์</option>
                    <option value="cleared">เคลียร์แล้ว</option>
                </select>
            </div>

            {filteredTransactions.length > 0 ? (
                <div className="space-y-4">
                    {filteredTransactions.map(t => (
                        <TransactionItem 
                            key={t.id} 
                            transaction={t} 
                            isSelected={selectedIds.has(t.id)} 
                            onSelect={handleSelect} 
                            onRequestDelete={(id, d) => { setTransactionToDelete({id, description: d}); setIsDeleteModalOpen(true); }}
                            onRequestEdit={t => { setTransactionToEdit(t); setIsEditModalOpen(true); }}
                            onRequestClear={t => { setTransactionToClear(t); setIsClearModalOpen(true); }}
                            onCancelClear={id => updateTransaction(id, { isCleared: false })}
                            getCategoryByValue={getCategoryByValue} 
                            getBankById={getBankById} 
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-4xl border border-minimal-border">
                    <p className="text-minimal-text-secondary font-bold text-lg">ไม่พบรายการ</p>
                </div>
            )}

            {isDeleteModalOpen && transactionToDelete && <DeleteConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={() => { deleteTransaction(transactionToDelete.id); setIsDeleteModalOpen(false); }} transactionDescription={transactionToDelete.description} />}
            {isEditModalOpen && transactionToEdit && <EditTransactionModal transaction={transactionToEdit} onClose={() => setIsEditModalOpen(false)} onSave={u => { updateTransaction(transactionToEdit.id, u); setIsEditModalOpen(false); }} getCategoryByValue={getCategoryByValue} />}
            {isClearModalOpen && transactionToClear && <ClearTransactionConfirmationModal isOpen={isClearModalOpen} onClose={() => setIsClearModalOpen(false)} onConfirm={() => { updateTransaction(transactionToClear.id, { isCleared: true }); setIsClearModalOpen(false); }} transaction={transactionToClear} />}
        </div>
    );
};
