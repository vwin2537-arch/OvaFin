import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import type { Transaction, Category } from '../types';
import { MonthYearPicker } from './MonthYearPicker';

type Period = 'week' | 'month' | 'year';

const COLORS = ['#64748B', '#94A3B8', '#CBD5E1', '#E2E8F0'];

const StatCard: React.FC<{ title: string; amount: number; icon: React.ReactElement }> = ({ title, amount, icon }) => (
    <div className="bg-minimal-card p-5 border border-minimal-border rounded-xl flex items-center space-x-4">
        <div className="p-3 bg-slate-100 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm text-minimal-text-secondary font-medium">{title}</p>
            <p className="text-2xl font-bold text-minimal-text-main">฿{amount.toLocaleString()}</p>
        </div>
    </div>
);

interface DashboardProps {
    transactions: Transaction[];
    getCategoryByValue: (value: string) => Category | undefined;
    transactionYears: number[];
}

const fullThaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

export const Dashboard: React.FC<DashboardProps> = ({ transactions, getCategoryByValue, transactionYears }) => {
    const [period, setPeriod] = useState<Period>('month');
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
    const [isMonthYearPickerOpen, setIsMonthYearPickerOpen] = useState(false);

    useEffect(() => {
        const currentYear = new Date().getFullYear();
        if (transactionYears.length > 0 && !transactionYears.includes(currentYear)) {
            setSelectedYear(transactionYears[0]);
        }
    }, [transactionYears]);

    const filteredTransactions = useMemo(() => {
        // Fix: Create a new Date object to avoid mutating the original 'now' date.
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        return transactions.filter(t => {
            const tDate = new Date(t.date);
            if (period === 'week') {
                return tDate >= startOfWeek;
            }
            if (period === 'month') {
                return tDate.getMonth() === selectedMonth && tDate.getFullYear() === selectedYear;
            }
            if (period === 'year') {
                return tDate.getFullYear() === selectedYear;
            }
            return true;
        });
    }, [transactions, period, selectedMonth, selectedYear]);

    const { totalIncome, totalExpense, balance, expenseByCategory } = useMemo(() => {
        // Fix: Ensure t.amount is treated as a number to prevent arithmetic errors.
        const data = filteredTransactions.reduce((acc, t) => {
            const amount = Number(t.amount) || 0;
            if (t.type === 'income') {
                acc.totalIncome += amount;
            } else {
                acc.totalExpense += amount;
                acc.expenseByCategory[t.category] = (acc.expenseByCategory[t.category] || 0) + amount;
            }
            return acc;
        }, {
            totalIncome: 0,
            totalExpense: 0,
            balance: 0,
            expenseByCategory: {} as Record<string, number>,
        });
        data.balance = data.totalIncome - data.totalExpense;
        return data;
    }, [filteredTransactions]);

    const chartData = useMemo(() => {
        return Object.entries(expenseByCategory)
            .map(([value, amount]) => ({ 
                name: getCategoryByValue(value)?.label || value, 
                amount 
            }))
            .sort((a, b) => b.amount - a.amount);
    }, [expenseByCategory, getCategoryByValue]);
    
    const pickerButtonClasses = "px-3 py-1.5 bg-white border border-minimal-border rounded-md text-sm font-semibold text-minimal-text-secondary focus:outline-none focus:ring-1 focus:ring-minimal-primary flex items-center gap-2";

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-minimal-text-main">แดชบอร์ด</h1>
                    <p className="text-minimal-text-secondary">สรุปภาพรวมทางการเงินของคุณ</p>
                </div>
                <div className="flex items-center space-x-2 flex-wrap">
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        {(['week', 'month', 'year'] as Period[]).map(p => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors ${
                                    period === p ? 'bg-white shadow-sm text-minimal-primary' : 'text-minimal-text-secondary hover:bg-slate-200'
                                }`}
                            >
                                {p === 'week' ? 'สัปดาห์' : p === 'month' ? 'เดือน' : 'ปี'}
                            </button>
                        ))}
                    </div>
                     <div className="relative">
                        {(period === 'month' || period === 'year') && (
                            <button onClick={() => setIsMonthYearPickerOpen(true)} className={pickerButtonClasses}>
                                <CalendarIcon />
                                {period === 'month' ? `${fullThaiMonths[selectedMonth]} ${selectedYear + 543}` : `พ.ศ. ${selectedYear + 543}`}
                            </button>
                        )}
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
                </div>
            </header>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="รายรับทั้งหมด" amount={totalIncome} icon={<IncomeIcon />} />
                <StatCard title="รายจ่ายทั้งหมด" amount={totalExpense} icon={<ExpenseIcon />} />
                <StatCard title="ยอดคงเหลือ" amount={balance} icon={<BalanceIcon />} />
            </div>

            <div className="bg-minimal-card p-6 border border-minimal-border rounded-xl">
                <h2 className="text-xl font-semibold mb-4 text-minimal-text-main">สรุปรายจ่ายตามหมวดหมู่</h2>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={COLORS[3]}/>
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12, fill: '#64748B' }} stroke={COLORS[2]}/>
                            <Tooltip formatter={(value: number) => `฿${value.toLocaleString()}`} cursor={{fill: 'rgba(71, 85, 105, 0.05)'}} contentStyle={{backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '0.5rem'}}/>
                            <Bar dataKey="amount" fill="#475569" barSize={20} radius={[0, 4, 4, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-[300px] flex items-center justify-center text-minimal-text-secondary">ไม่มีข้อมูลรายจ่ายสำหรับช่วงเวลานี้</div>
                )}
            </div>
        </div>
    );
};

// --- Icons ---
const IncomeIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-minimal-income" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const ExpenseIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-minimal-expense" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" /></svg>;
const BalanceIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-minimal-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>;
const CalendarIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;