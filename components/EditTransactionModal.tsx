
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
    const [date, setDate] = useState(transaction.date);
    const [isReimbursable, setIsReimbursable] = useState<boolean>(transaction.isReimbursable || false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowConfirm(true);
    };

    const handleActualSave = () => {
        onSave({
            amount,
            description,
            date,
            isReimbursable,
            // ถ้าเปลี่ยนจาก ไม่เบิกคืน เป็น เบิกคืน ให้ตั้งค่าเริ่มต้นเป็น ยังไม่เคลียร์
            isCleared: isReimbursable ? (transaction.isCleared || false) : false
        });
    };

    const inputClasses = "mt-1 block w-full px-4 py-2 bg-slate-50 border border-minimal-border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-minimal-primary text-minimal-text-main";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-minimal-text-main">แก้ไขรายการ</h2>
                    {!showConfirm && (
                        <button onClick={onClose} className="text-minimal-text-secondary hover:text-minimal-text-main text-2xl font-bold">&times;</button>
                    )}
                </div>

                {!showConfirm ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-minimal-border mb-4">
                            <p className="text-xs text-minimal-text-secondary uppercase font-bold tracking-wider mb-1">ประเภทรายการ</p>
                            <p className="font-semibold text-minimal-text-main">
                                {transaction.type === 'income' ? 'รายรับ' : 'รายจ่าย'} - {getCategoryByValue(transaction.category)?.label || transaction.category}
                            </p>
                        </div>

                        {transaction.type === 'expense' && (
                            <div className="flex items-center justify-between bg-amber-50 p-3 rounded-lg border border-amber-100 mb-4">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-amber-900">เบิกคืนได้ (สำรองจ่าย)</span>
                                    <span className="text-xs text-amber-700">เปิดเพื่อใช้ระบบติดตามการเคลียร์ยอด</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={isReimbursable} 
                                        onChange={(e) => setIsReimbursable(e.target.checked)}
                                        className="sr-only peer" 
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                </label>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-minimal-text-secondary">จำนวนเงิน (แก้ไขเมื่อได้รับเงินทอน)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(parseFloat(e.target.value))}
                                className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-minimal-border rounded-lg focus:outline-none focus:ring-2 focus:ring-minimal-primary text-2xl font-bold text-minimal-text-main"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-minimal-text-secondary">รายละเอียด</label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className={inputClasses}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-minimal-text-secondary">วันที่</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className={inputClasses}
                                required
                            />
                        </div>

                        <div className="flex justify-end pt-6 space-x-3">
                            <button type="button" onClick={onClose} className="px-5 py-2 bg-slate-100 text-minimal-text-secondary rounded-lg hover:bg-slate-200 font-semibold transition-colors">ยกเลิก</button>
                            <button type="submit" className="px-5 py-2 bg-minimal-primary text-white rounded-lg hover:bg-minimal-primary-hover font-semibold shadow-md transition-colors">ตรวจสอบข้อมูล</button>
                        </div>
                    </form>
                ) : (
                    <div className="py-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                            <h3 className="text-lg font-bold text-blue-800 mb-3 text-center">ยืนยันการเปลี่ยนแปลง?</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between border-b border-blue-100 pb-1">
                                    <span className="text-blue-600">สถานะเบิกคืน:</span>
                                    <span className={`font-bold ${isReimbursable ? 'text-amber-600' : 'text-gray-400'}`}>
                                        {isReimbursable ? 'เปิดการใช้งาน' : 'ปิดการใช้งาน'}
                                    </span>
                                </div>
                                <div className="flex justify-between border-b border-blue-100 pb-1">
                                    <span className="text-blue-600">ยอดเดิม:</span>
                                    <span className="font-bold text-gray-400 line-through">฿{transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between border-b border-blue-100 pb-1">
                                    <span className="text-blue-600">ยอดใหม่:</span>
                                    <span className="font-bold text-minimal-primary text-lg">฿{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                            <button 
                                onClick={handleActualSave}
                                className="w-full py-3 bg-minimal-primary text-white rounded-xl font-bold shadow-lg hover:bg-minimal-primary-hover transition-transform active:scale-95"
                            >
                                ยืนยันและบันทึกข้อมูล
                            </button>
                            <button 
                                onClick={() => setShowConfirm(false)}
                                className="w-full py-2 text-minimal-text-secondary font-semibold hover:bg-slate-50 rounded-lg transition-colors"
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
