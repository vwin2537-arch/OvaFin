import React, { useState } from 'react';
import type { Transaction, Category, Bank } from '../types';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

interface TransactionItemProps {
    transaction: Transaction;
    onRequestDelete: (id: string, description: string) => void;
    getCategoryByValue: (value: string) => Category | undefined;
    getBankById: (id: string) => Bank | undefined;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onRequestDelete, getCategoryByValue, getBankById }) => {
    const isIncome = transaction.type === 'income';
    const category = getCategoryByValue(transaction.category);
    const Icon = category?.icon || (() => null);
    const paymentMethodText = transaction.paymentMethod === 'online' ? 'ออนไลน์' : 'เงินสด';
    const bank = transaction.bank ? getBankById(transaction.bank) : null;

    return (
        <li className="flex items-center justify-between py-4 border-b border-minimal-border last:border-b-0">
            <div className="flex items-center">
                 <div className="p-3 bg-slate-100 rounded-full mr-4">
                    <Icon className={`w-5 h-5 ${isIncome ? 'text-minimal-income' : 'text-minimal-expense'}`} />
                </div>
                <div>
                    <p className="font-semibold text-minimal-text-main">{transaction.description}</p>
                    <p className="text-sm text-minimal-text-secondary">
                        {category?.label || transaction.category}
                        <span className="text-gray-400 mx-1.5">·</span>
                        {paymentMethodText}
                        {bank && ` (${bank.name})`}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(transaction.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <p className={`font-semibold ${isIncome ? 'text-minimal-income' : 'text-minimal-expense'}`}>
                    {isIncome ? '+' : '-'}฿{transaction.amount.toLocaleString()}
                </p>
                <button onClick={() => onRequestDelete(transaction.id, transaction.description)} className="text-gray-400 hover:text-minimal-expense">
                    <TrashIcon />
                </button>
            </div>
        </li>
    );
};

interface TransactionListProps {
    transactions: Transaction[];
    deleteTransaction: (id: string) => void;
    getCategoryByValue: (value: string) => Category | undefined;
    getBankById: (id: string) => Bank | undefined;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, deleteTransaction, getCategoryByValue, getBankById }) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<{id: string, description: string} | null>(null);

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

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-minimal-text-main">รายการทั้งหมด</h1>
                <p className="text-minimal-text-secondary">ประวัติรายรับ-รายจ่ายทั้งหมดของคุณ</p>
            </header>
            
            {transactions.length > 0 ? (
                <div className="bg-minimal-card border border-minimal-border rounded-xl">
                    <ul className="px-4">
                        {transactions.map(t => (
                            <TransactionItem key={t.id} transaction={t} onRequestDelete={handleRequestDelete} getCategoryByValue={getCategoryByValue} getBankById={getBankById} />
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="text-center py-16 bg-minimal-card border border-minimal-border rounded-xl">
                    <p className="text-minimal-text-secondary">ยังไม่มีรายการธุรกรรม</p>
                    <p className="text-sm text-gray-400">กดปุ่ม + เพื่อเพิ่มรายการแรกของคุณ</p>
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
