
import React, { useState } from 'react';
import type { Transaction, Category, Bank, TransactionSource, TransactionType } from '../types';
import { MonthYearPicker } from './MonthYearPicker';

interface ExportDataModalProps {
    transactions: Transaction[];
    onClose: () => void;
    allCategories: Category[];
    getBankById: (id: string) => Bank | undefined;
    transactionYears: number[];
}

type Period = 'all' | 'week' | 'month' | 'year';

const fullThaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

const getSourceLabel = (source: TransactionSource | undefined): string => {
    switch (source) {
        case 'erawan': return 'เอราวัณ';
        case 'wildfire_station': return 'สถานีไฟป่า';
        case 'personal': return 'ส่วนตัว';
        default: return 'ส่วนตัว';
    }
};

export const ExportDataModal: React.FC<ExportDataModalProps> = ({ transactions, onClose, allCategories, getBankById, transactionYears }) => {
    const [category, setCategory] = useState<string>('all');
    const [exportType, setExportType] = useState<TransactionType | 'all'>('all');
    const [exportSource, setExportSource] = useState<TransactionSource | 'all'>('all');
    const [period, setPeriod] = useState<Period>('month');
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    // Fix: Updated state to allow 'all' to fix TypeScript assignment error.
    const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(new Date().getMonth());
    const [isMonthYearPickerOpen, setIsMonthYearPickerOpen] = useState(false);
    
    const inputClasses = "mt-1 block w-full px-4 py-2 bg-slate-50 border border-minimal-border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-minimal-primary text-minimal-text-main";
    const pickerButtonClasses = "mt-1 block w-full px-4 py-2 bg-slate-50 border border-minimal-border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-minimal-primary text-minimal-text-main text-left flex items-center gap-2";


    const handleExport = () => {
        const now = new Date();
        const filtered = transactions.filter(t => {
            const tDate = new Date(t.date);
            
            // Filter by Category
            const isCategoryMatch = category === 'all' || t.category === category;
            
            // Filter by Type (Income/Expense)
            const isTypeMatch = exportType === 'all' || t.type === exportType;

            // Filter by Source (Erawan/Wildfire/Personal)
            // Default undefined source to 'personal' for filtering consistency
            const tSource = t.source || 'personal';
            const isSourceMatch = exportSource === 'all' || tSource === exportSource;
            
            if (!isCategoryMatch || !isTypeMatch || !isSourceMatch) return false;

            // Filter by Period
            switch (period) {
                case 'week':
                    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
                    weekStart.setHours(0,0,0,0);
                    return tDate >= weekStart;
                case 'month':
                    // Fix: Updated logic to handle 'all' months within a year.
                    const monthMatch = selectedMonth === 'all' || tDate.getMonth() === selectedMonth;
                    return monthMatch && tDate.getFullYear() === selectedYear;
                case 'year':
                    return tDate.getFullYear() === selectedYear;
                case 'all':
                default:
                    return true;
            }
        });

        if (filtered.length === 0) {
            alert('ไม่มีข้อมูลที่ตรงกับเงื่อนไขที่เลือก');
            return;
        }

        const headers = ['Date', 'Description', 'Category', 'Source', 'Type', 'Amount', 'Payment Method', 'Bank'];
        const csvContent = [
            headers.join(','),
            ...filtered.map(t => {
                const categoryLabel = allCategories.find(c => c.value === t.category)?.label || t.category;
                const bankName = t.bank ? (getBankById(t.bank)?.name || '') : '';
                return [
                    t.date,
                    `"${t.description.replace(/"/g, '""')}"`,
                    categoryLabel,
                    getSourceLabel(t.source),
                    t.type === 'income' ? 'รายรับ' : 'รายจ่าย',
                    t.amount,
                    t.paymentMethod === 'online' ? 'Online' : 'Cash',
                    bankName
                ].join(',');
            })
        ].join('\n');

        // Add UTF-8 BOM for Excel compatibility with Thai characters
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `ovafin-export-${new Date().toISOString().slice(0,10)}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-minimal-card rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-minimal-text-main mb-4">Export ข้อมูลเป็น CSV</h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-minimal-text-secondary">ประเภทรายการ</label>
                            <select value={exportType} onChange={e => setExportType(e.target.value as TransactionType | 'all')} className={inputClasses}>
                                <option value="all">ทั้งหมด</option>
                                <option value="income">รายรับ</option>
                                <option value="expense">รายจ่าย</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-minimal-text-secondary">แหล่งที่มา/สังกัด</label>
                            <select value={exportSource} onChange={e => setExportSource(e.target.value as TransactionSource | 'all')} className={inputClasses}>
                                <option value="all">ทั้งหมด</option>
                                <option value="erawan">เอราวัณ</option>
                                <option value="wildfire_station">สถานีไฟป่า</option>
                                <option value="personal">ส่วนตัว</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-minimal-text-secondary">เลือกหมวดหมู่</label>
                        <select value={category} onChange={e => setCategory(e.target.value)} className={inputClasses}>
                            <option value="all">ทุกหมวดหมู่</option>
                            {allCategories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                        </select>
                    </div>

                     <div>
                        <label className="block text-sm font-medium text-minimal-text-secondary">เลือกช่วงเวลา</label>
                        <select value={period} onChange={e => setPeriod(e.target.value as Period)} className={inputClasses}>
                            <option value="week">สัปดาห์นี้</option>
                            <option value="month">เลือกเดือน</option>
                            <option value="year">เลือกปี</option>
                            <option value="all">ทั้งหมด</option>
                        </select>
                    </div>

                    {(period === 'month' || period === 'year') && (
                         <div className="relative">
                             <label className="block text-sm font-medium text-minimal-text-secondary">
                                {period === 'month' ? 'เลือกเดือนและปี' : 'เลือกปี'}
                            </label>
                             <button type="button" onClick={() => setIsMonthYearPickerOpen(true)} className={pickerButtonClasses}>
                                <CalendarIcon />
                                {/* Fix: Updated label to handle 'all' months selection. */}
                                {period === 'month' ? (selectedMonth === 'all' ? `ทั้งปี ${selectedYear + 543}` : `${fullThaiMonths[selectedMonth as number]} ${selectedYear + 543}`) : `พ.ศ. ${selectedYear + 543}`}
                            </button>
                             {isMonthYearPickerOpen && (
                                <MonthYearPicker
                                    value={{ month: selectedMonth, year: selectedYear }}
                                    availableYears={transactionYears}
                                    selectMode={period === 'year' ? 'year' : 'month'}
                                    onChange={(date) => {
                                        if (period === 'year') {
                                            setSelectedYear(date.year);
                                        } else {
                                            setSelectedMonth(date.month);
                                            setSelectedYear(date.year);
                                        }
                                        setIsMonthYearPickerOpen(false);
                                    }}
                                    onClose={() => setIsMonthYearPickerOpen(false)}
                                />
                             )}
                        </div>
                    )}
                </div>
                <div className="flex justify-end pt-6 space-x-3">
                    <button type="button" onClick={onClose} className="px-5 py-2 bg-slate-100 text-minimal-text-secondary rounded-lg hover:bg-slate-200 font-semibold">ยกเลิก</button>
                    <button type="button" onClick={handleExport} className="px-5 py-2 bg-minimal-primary text-white rounded-lg hover:bg-minimal-primary-hover font-semibold">Export</button>
                </div>
            </div>
        </div>
    );
};

const CalendarIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
