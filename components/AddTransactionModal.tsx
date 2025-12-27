
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
    
    // Fix: Initialize date using Local Time to prevent UTC offset issues
    const [date, setDate] = useState(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
    const [bank, setBank] = useState<string>(banks[0]?.id || '');
    const [source, setSource] = useState<TransactionSource>('personal');
    
    useEffect(() => {
        setCategory(type === 'expense' ? expenseCategories[0]?.value : incomeCategories[0]?.value);
        if (type === 'income') setIsReimbursable(false);
    }, [type, incomeCategories, expenseCategories]);

    useEffect(() => {
        if (paymentMethod === 'online' && !bank && banks.length > 0) {
            setBank(banks[0].id);
        }
    }, [paymentMethod, bank, banks]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (description && amount && amount > 0 && category) {
            const transactionData: Omit<Transaction, 'id'> = {
                description,
                amount,
                type,
                category,
                date,
                paymentMethod,
                source,
                isReimbursable: type === 'expense' ? isReimbursable : false,
                isCleared: false
            };
            if (paymentMethod === 'online') {
                if (!bank) {
                    alert('กรุณาเลือกธนาคาร');
                    return;
                }
                transactionData.bank = bank;
            }
            onAddTransaction(transactionData);
        }
    };

    const handleTypeChange = (newType: TransactionType) => {
        setType(newType);
    }

    const categories = type === 'expense' ? expenseCategories : incomeCategories;
    const inputClasses = "mt-1 block w-full px-4 py-2 bg-slate-50 border border-minimal-border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-minimal-primary text-minimal-text-main";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-minimal-card rounded-2xl shadow-xl w-full max-w-md p-6 m-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-minimal-text-main">เพิ่มรายการใหม่</h2>
                    <button onClick={onClose} className="text-minimal-text-secondary hover:text-minimal-text-main text-2xl font-bold">&times;</button>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-6 bg-slate-100 p-1 rounded-full">
                    <button onClick={() => handleTypeChange('expense')} className={`py-2 rounded-full font-semibold transition-colors ${type === 'expense' ? 'bg-minimal-expense text-white' : 'text-minimal-text-secondary'}`}>รายจ่าย</button>
                    <button onClick={() => handleTypeChange('income')} className={`py-2 rounded-full font-semibold transition-colors ${type === 'income' ? 'bg-minimal-income text-white' : 'text-minimal-text-secondary'}`}>รายรับ</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-minimal-text-secondary mb-1">สังกัด/ประเภท</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button type="button" onClick={() => setSource('erawan')} className={`py-2 px-1 rounded-lg text-xs md:text-sm font-semibold transition-colors ${source === 'erawan' ? 'bg-minimal-primary text-white' : 'bg-slate-50 text-minimal-text-secondary border border-minimal-border'}`}>เอราวัณ</button>
                            <button type="button" onClick={() => setSource('wildfire_station')} className={`py-2 px-1 rounded-lg text-xs md:text-sm font-semibold transition-colors ${source === 'wildfire_station' ? 'bg-minimal-primary text-white' : 'bg-slate-50 text-minimal-text-secondary border border-minimal-border'}`}>สถานีไฟป่า</button>
                            <button type="button" onClick={() => setSource('personal')} className={`py-2 px-1 rounded-lg text-xs md:text-sm font-semibold transition-colors ${source === 'personal' ? 'bg-minimal-primary text-white' : 'bg-slate-50 text-minimal-text-secondary border border-minimal-border'}`}>ส่วนตัว</button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-amber-50 p-3 rounded-lg border border-amber-100">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-amber-900">เบิกคืนได้ (สำรองจ่าย)</span>
                            <span className="text-xs text-amber-700">รายการนี้จะถูกติดตามเพื่อรอเบิกคืน</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={isReimbursable} 
                                onChange={(e) => setIsReimbursable(e.target.checked)}
                                disabled={type === 'income'}
                                className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-minimal-text-secondary">จำนวนเงิน</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                            placeholder="0.00"
                            className={inputClasses}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-minimal-text-secondary">หมวดหมู่</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className={inputClasses}
                        >
                            {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-minimal-text-secondary">ช่องทางการชำระเงิน</label>
                        <div className="grid grid-cols-2 gap-2 mt-1 bg-slate-100 p-1 rounded-lg">
                            <button type="button" onClick={() => setPaymentMethod('cash')} className={`py-2 rounded-lg text-sm font-semibold transition-colors ${paymentMethod === 'cash' ? 'bg-white shadow-sm' : 'text-minimal-text-secondary'}`}>เงินสด</button>
                            <button type="button" onClick={() => setPaymentMethod('online')} className={`py-2 rounded-lg text-sm font-semibold transition-colors ${paymentMethod === 'online' ? 'bg-white shadow-sm' : 'text-minimal-text-secondary'}`}>ออนไลน์</button>
                        </div>
                    </div>
                    {paymentMethod === 'online' && (
                        <div>
                            <label className="block text-sm font-medium text-minimal-text-secondary">ธนาคาร</label>
                            <select value={bank} onChange={(e) => setBank(e.target.value)} className={inputClasses} required>
                                {banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-minimal-text-secondary">รายละเอียด</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="เช่น ค่ากาแฟ, เงินเดือน"
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
                    <div className="flex justify-end pt-4 space-x-3">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-slate-100 text-minimal-text-secondary rounded-lg hover:bg-slate-200 font-semibold">ยกเลิก</button>
                        <button type="submit" className="px-5 py-2 bg-minimal-primary text-white rounded-lg hover:bg-minimal-primary-hover font-semibold">บันทึก</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
