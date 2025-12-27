
import React from 'react';
import type { Transaction } from '../types';

interface ClearTransactionConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    transaction: Transaction;
}

export const ClearTransactionConfirmationModal: React.FC<ClearTransactionConfirmationModalProps> = ({ isOpen, onClose, onConfirm, transaction }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[70] p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-4">
                    <svg className="h-10 w-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                
                <h2 className="text-xl font-bold text-minimal-text-main text-center mb-2">ยืนยันการเคลียร์ยอด</h2>
                <p className="text-minimal-text-secondary text-center mb-4">
                    คุณได้รับเงินเบิกคืนสำหรับรายการ <br/>
                    <span className="font-bold text-minimal-text-main">"{transaction.description}"</span> <br/>
                    จำนวน <span className="font-bold text-amber-600 text-lg">฿{transaction.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span> แล้วใช่หรือไม่?
                </p>

                <div className="flex flex-col gap-2 mt-6">
                    <button 
                        onClick={onConfirm}
                        className="w-full py-3 bg-minimal-primary text-white rounded-xl font-bold shadow-lg hover:bg-minimal-primary-hover transition-all active:scale-95"
                    >
                        ใช่, ได้รับเงินคืนแล้ว
                    </button>
                    <button 
                        onClick={onClose}
                        className="w-full py-2 text-minimal-text-secondary font-semibold hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        ยังไม่ได้คืน (ยกเลิก)
                    </button>
                </div>
            </div>
        </div>
    );
};
