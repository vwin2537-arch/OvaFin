
import React, { useState } from 'react';
import type { Transaction, Category } from '../types';

interface EditTransactionModalProps {
    transaction: Transaction;
    onClose: () => void;
    onSave: (updates: Partial<Transaction>) => void;
    getCategoryByValue: (value: string) => Category | undefined;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({ transaction, onClose, onSave, getCategoryByValue }) => {
    const [amount, setAmount] = useState<number>(transaction.amount);
    const [description, setDescription] = useState(transaction.description);
    
    // Format the ISO date string to YYYY-MM-DD so the HTML5 date input can display it
    const [date, setDate] = useState(() => {
        try {
            return new Date(transaction.date).toISOString().split('T')[0];
        } catch (e) {
            // Fallback for non-ISO or empty strings
            const now = new Date();
            return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        }
    });

    const [isReimbursable, setIsReimbursable] = useState<boolean>(transaction.isReimbursable || false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowConfirm(true);
    };

    const handleActualSave = () => {
        // Construct the final date while preserving the original time if only the date part was edited
        const originalFullDate = new Date(transaction.date);
        const newSelectedDate = new Date(date);
        
        // Apply original hours/mins/secs/ms to the new date selection to maintain sorting order
        newSelectedDate.setHours(
            originalFullDate.getHours(), 
            originalFullDate.getMinutes(), 
            originalFullDate.getSeconds(), 
            originalFullDate.getMilliseconds()
        );

        onSave({
            amount,
            description,
            date: newSelectedDate.toISOString(),
            isReimbursable,
            // If switched to reimbursable, default to uncleared if it wasn't already set
            isCleared: isReimbursable ? (transaction.isCleared || false) : false
        });
    };

    const inputClasses = "mt-1 block w-full px-4 py-3 bg-slate-50 border border-minimal-border rounded-xl focus:outline-none focus:ring-2 focus:ring-minimal-primary text-minimal-text-main font-semibold transition-all hover:bg-white";

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 m-4 relative overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-minimal-text-main">แก้ไขรายการ</h2>
                    {!showConfirm && (
                        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-slate-100 text-minimal-text-secondary hover:text-minimal-expense rounded-full transition-colors active:scale-90">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    )}
                </div>

                {!showConfirm ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-minimal-border">
                            <label className="block text-[10px] font-black text-minimal-text-secondary uppercase tracking-widest mb-1">ประเภทรายการ</label>
                            <p className="font-bold text-minimal-text-main">
                                {transaction.type === 'income' ? 'รายรับ' : 'รายจ่าย'} - {getCategoryByValue(transaction.category)?.label || transaction.category}
                            </p>
                        </div>

                        {transaction.type === 'expense' && (
                            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-between group cursor-pointer" onClick={() => setIsReimbursable(!isReimbursable)}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl transition-colors ${isReimbursable ? 'bg-amber-500 text-white shadow-lg' : 'bg-white text-amber-400 border border-amber-100'}`}>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-amber-900 leading-tight">เบิกคืนได้ (สำรองจ่าย)</p>
                                        <p className="text-[10px] font-bold text-amber-600 uppercase">เปิดเพื่อใช้ระบบติดตามการเคลียร์ยอด</p>
                                    </div>
                                </div>
                                <div className={`w-10 h-6 rounded-full transition-colors relative ${isReimbursable ? 'bg-amber-500' : 'bg-slate-200'}`}>
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isReimbursable ? 'left-5' : 'left-1'}`}></div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-black text-minimal-text-secondary uppercase tracking-widest mb-1 px-1">จำนวนเงิน (แก้ไขเมื่อได้รับเงินทอน)</label>
                            <input
                                type="number"
                                step="any"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                                className={`${inputClasses} text-2xl font-black text-minimal-primary`}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-minimal-text-secondary uppercase tracking-widest mb-1 px-1">รายละเอียด</label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className={inputClasses}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-minimal-text-secondary uppercase tracking-widest mb-1 px-1">วันที่</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className={inputClasses}
                                required
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={onClose} className="flex-1 py-4 text-minimal-text-secondary font-black bg-slate-50 hover:bg-slate-100 rounded-3xl transition-colors active:scale-95">ยกเลิก</button>
                            <button type="submit" className="flex-1 py-4 bg-minimal-primary text-white font-black rounded-3xl shadow-xl shadow-indigo-100 hover:bg-minimal-primary-hover transition-all active:scale-95">ตรวจสอบข้อมูล</button>
                        </div>
                    </form>
                ) : (
                    <div className="py-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 mb-8">
                            <h3 className="text-lg font-black text-indigo-900 mb-4 text-center">ยืนยันการเปลี่ยนแปลง?</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between border-b border-indigo-100 pb-2">
                                    <span className="text-indigo-600 font-bold uppercase text-[10px] tracking-wider">สถานะเบิกคืน:</span>
                                    <span className={`font-black ${isReimbursable ? 'text-amber-600' : 'text-slate-400'}`}>
                                        {isReimbursable ? 'เปิดการใช้งาน' : 'ปิดการใช้งาน'}
                                    </span>
                                </div>
                                <div className="flex justify-between border-b border-indigo-100 pb-2">
                                    <span className="text-indigo-600 font-bold uppercase text-[10px] tracking-wider">ยอดเดิม:</span>
                                    <span className="font-bold text-slate-400 line-through">฿{transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between border-b border-indigo-100 pb-2">
                                    <span className="text-indigo-600 font-bold uppercase text-[10px] tracking-wider">ยอดใหม่:</span>
                                    <span className="font-black text-minimal-primary text-xl">฿{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col space-y-3">
                            <button 
                                onClick={handleActualSave}
                                className="w-full py-4 bg-minimal-primary text-white rounded-3xl font-black shadow-xl shadow-indigo-100 hover:bg-minimal-primary-hover transition-transform active:scale-95"
                            >
                                ยืนยันและบันทึกข้อมูล
                            </button>
                            <button 
                                onClick={() => setShowConfirm(false)}
                                className="w-full py-2 text-minimal-text-secondary font-black hover:text-minimal-text-main transition-colors"
                            >
                                กลับไปแก้ไข
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
