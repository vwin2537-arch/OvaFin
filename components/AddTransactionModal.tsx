
import React, { useState, useEffect } from 'react';
import type { Transaction, TransactionType, Category, PaymentMethod, Bank, TransactionSource } from '../types';

interface AddTransactionModalProps {
    onClose: () => void;
    onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
    incomeCategories: Category[];
    expenseCategories: Category[];
    banks: Bank[];
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ onClose, onAddTransaction, incomeCategories, expenseCategories, banks }) => {
    const [type, setType] = useState<TransactionType>('expense');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState<number | ''>('');
    const [category, setCategory] = useState(expenseCategories[0]?.value || '');
    const [isReimbursable, setIsReimbursable] = useState(false);
    
    const [date, setDate] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    });

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
    const [bank, setBank] = useState<string>(banks[0]?.id || '');
    const [source, setSource] = useState<TransactionSource>('personal');

    // Fix: Define categories based on type to resolve missing variable error.
    const categories = type === 'expense' ? expenseCategories : incomeCategories;
    
    useEffect(() => {
        setCategory(type === 'expense' ? expenseCategories[0]?.value : incomeCategories[0]?.value);
        if (type === 'income') setIsReimbursable(false);
    }, [type, incomeCategories, expenseCategories]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (description && amount && amount > 0 && category) {
            // Logic เพื่อให้เรียงลำดับตามเวลา:
            // รวมวันที่ที่เลือก เข้ากับ "เวลาปัจจุบัน" เพื่อให้รายการเรียงกันตามลำดับที่กดจริง
            const now = new Date();
            const selectedDate = new Date(date);
            selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
            
            const transactionData: Omit<Transaction, 'id'> = {
                description,
                amount,
                type,
                category,
                date: selectedDate.toISOString(), // บันทึกเป็น ISO String ที่มีเวลาด้วย
                paymentMethod,
                source,
                isReimbursable: type === 'expense' ? isReimbursable : false,
                isCleared: false,
                bank: paymentMethod === 'online' ? bank : undefined
            };
            
            onAddTransaction(transactionData);
        }
    };

    const inputClasses = "mt-1.5 block w-full px-5 py-3.5 bg-slate-50 border border-minimal-border rounded-2xl focus:ring-2 focus:ring-minimal-primary outline-none text-minimal-text-main font-semibold transition-all hover:bg-white";

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-8 m-4 max-h-[95vh] overflow-y-auto transform transition-all animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-minimal-text-main">เพิ่มรายการใหม่</h2>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-slate-100 text-minimal-text-secondary hover:text-minimal-expense rounded-full transition-colors active:scale-90">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-3xl">
                        <button type="button" onClick={() => setType('expense')} className={`py-3 rounded-2xl font-black transition-all ${type === 'expense' ? 'bg-white shadow-md text-minimal-expense' : 'text-minimal-text-secondary hover:text-minimal-text-main'}`}>รายจ่าย</button>
                        <button type="button" onClick={() => setType('income')} className={`py-3 rounded-2xl font-black transition-all ${type === 'income' ? 'bg-white shadow-md text-minimal-income' : 'text-minimal-text-secondary hover:text-minimal-text-main'}`}>รายรับ</button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-minimal-text-secondary uppercase tracking-widest mb-1 px-1">จำนวนเงิน</label>
                            <input type="number" step="any" value={amount} onChange={e => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))} placeholder="0.00" className={`${inputClasses} text-2xl font-black text-minimal-primary`} required />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-minimal-text-secondary uppercase tracking-widest mb-1 px-1">วันที่</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClasses} required />
                        </div>
                    </div>

                    {type === 'expense' && (
                        <div className="p-4 bg-amber-50 rounded-3xl border border-amber-100 flex items-center justify-between group cursor-pointer" onClick={() => setIsReimbursable(!isReimbursable)}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl transition-colors ${isReimbursable ? 'bg-amber-500 text-white shadow-lg' : 'bg-white text-amber-400 border border-amber-100'}`}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>
                                </div>
                                <div>
                                    <p className="text-sm font-black text-amber-900 leading-tight">ยอดรอเบิกคืน (สำรองจ่าย)</p>
                                    <p className="text-[10px] font-bold text-amber-600 uppercase">ระบบจะช่วยติดตามการคืนเงิน</p>
                                </div>
                            </div>
                            <div className={`w-10 h-6 rounded-full transition-colors relative ${isReimbursable ? 'bg-amber-500' : 'bg-slate-200'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isReimbursable ? 'left-5' : 'left-1'}`}></div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-minimal-text-secondary uppercase tracking-widest mb-1 px-1">แหล่งเงิน</label>
                            <select value={source} onChange={e => setSource(e.target.value as TransactionSource)} className={inputClasses}>
                                <option value="personal">ส่วนตัว</option>
                                <option value="erawan">เอราวัณ</option>
                                <option value="wildfire_station">สถานีไฟป่า</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-minimal-text-secondary uppercase tracking-widest mb-1 px-1">หมวดหมู่</label>
                            <select value={category} onChange={e => setCategory(e.target.value)} className={inputClasses}>
                                {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-minimal-text-secondary uppercase tracking-widest mb-1 px-1">รายละเอียด</label>
                        <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="เช่น ซื้อกาแฟเช้า" className={inputClasses} required />
                    </div>

                    <div className="flex gap-4 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-4 text-minimal-text-secondary font-black bg-slate-50 hover:bg-slate-100 rounded-3xl transition-colors">ยกเลิก</button>
                        <button type="submit" className="flex-1 py-4 bg-minimal-primary text-white font-black rounded-3xl shadow-xl shadow-indigo-100 hover:bg-minimal-primary-hover transition-all active:scale-95">บันทึกรายการ</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
