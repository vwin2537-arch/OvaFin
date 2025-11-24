
import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import type { Transaction, Category, TransactionSource } from '../types';
import { MonthYearPicker } from './MonthYearPicker';

type Period = 'week' | 'month' | 'year';

const COLORS = ['#64748B', '#94A3B8', '#CBD5E1', '#E2E8F0'];
const PIE_COLORS = {
    erawan: '#60A5FA', // Blue-400
    wildfire_station: '#FB923C', // Orange-400
    personal: '#A78BFA' // Purple-400
};

const StatCard: React.FC<{ title: string; amount: number; icon: React.ReactElement; colorClass?: string }> = ({ title, amount, icon, colorClass }) => (
    <div className="bg-minimal-card p-5 border border-minimal-border rounded-xl flex items-center space-x-4">
        <div className={`p-3 rounded-full ${colorClass || 'bg-slate-100'}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-minimal-text-secondary font-medium">{title}</p>
            <p className="text-2xl font-bold text-minimal-text-main">฿{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
    </div>
);

const getSourceLabel = (source: TransactionSource | undefined): string => {
    switch (source) {
        case 'erawan': return 'เอราวัณ';
        case 'wildfire_station': return 'สถานีไฟป่า';
        case 'personal': return 'ส่วนตัว';
        default: return 'ส่วนตัว';
    }
};

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

    const { totalIncome, totalExpense, balance, expenseByCategory, expenseBySource, incomeBySource } = useMemo(() => {
        const data = filteredTransactions.reduce((acc, t) => {
            const amount = Number(t.amount) || 0;
            const source = t.source || 'personal';

            if (t.type === 'income') {
                acc.totalIncome += amount;
                acc.incomeBySource[source] = (acc.incomeBySource[source] || 0) + amount;
            } else {
                acc.totalExpense += amount;
                acc.expenseByCategory[t.category] = (acc.expenseByCategory[t.category] || 0) + amount;
                acc.expenseBySource[source] = (acc.expenseBySource[source] || 0) + amount;
            }
            return acc;
        }, {
            totalIncome: 0,
            totalExpense: 0,
            balance: 0,
            expenseByCategory: {} as Record<string, number>,
            expenseBySource: {} as Record<string, number>,
            incomeBySource: {} as Record<string, number>,
        });
        data.balance = data.totalIncome - data.totalExpense;
        return data;
    }, [filteredTransactions]);

    const expenseChartData = useMemo(() => {
        return Object.entries(expenseByCategory)
            .map(([value, amount]) => ({ 
                name: getCategoryByValue(value)?.label || value, 
                amount 
            }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 10); // Top 10 categories
    }, [expenseByCategory, getCategoryByValue]);

    const expenseSourceChartData = useMemo(() => {
        return Object.entries(expenseBySource)
            .map(([key, value]) => ({
                name: getSourceLabel(key as TransactionSource),
                value: value,
                key: key
            }))
            .filter(item => item.value > 0);
    }, [expenseBySource]);

    const incomeSourceChartData = useMemo(() => {
        return Object.entries(incomeBySource)
            .map(([key, value]) => ({
                name: getSourceLabel(key as TransactionSource),
                value: value,
                key: key
            }))
            .filter(item => item.value > 0);
    }, [incomeBySource]);

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
    
    // Recent transactions (Top 5)
    const recentTransactions = filteredTransactions.slice(0, 5);

    const pickerButtonClasses = "px-3 py-1.5 bg-white border border-minimal-border rounded-md text-sm font-semibold text-minimal-text-secondary focus:outline-none focus:ring-1 focus:ring-minimal-primary flex items-center gap-2";

    const renderPieChart = (data: any[], title: string, emptyMessage: string) => (
        <div className="bg-minimal-card p-6 border border-minimal-border rounded-xl flex flex-col h-full">
            <h2 className="text-lg font-bold text-minimal-text-main mb-4">{title}</h2>
            {data.length > 0 ? (
                <div className="flex-grow h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    // @ts-ignore
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.key as keyof typeof PIE_COLORS] || '#CBD5E1'} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => `฿${value.toLocaleString()}`} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="h-[250px] flex items-center justify-center text-minimal-text-secondary bg-slate-50 rounded-lg">{emptyMessage}</div>
            )}
        </div>
    );

    return (
        <div className="space-y-6 pb-20">
            <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-minimal-text-main">แดชบอร์ด</h1>
                    <p className="text-minimal-text-secondary">สรุปภาพรวมการเงินของคุณ</p>
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

            {/* Stat Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="รายรับ" amount={totalIncome} icon={<IncomeIcon />} colorClass="bg-emerald-50 text-emerald-600" />
                <StatCard title="รายจ่าย" amount={totalExpense} icon={<ExpenseIcon />} colorClass="bg-rose-50 text-rose-600" />
                <StatCard title="คงเหลือ" amount={balance} icon={<BalanceIcon />} colorClass="bg-indigo-50 text-indigo-600" />
                <div className="bg-minimal-card p-5 border border-minimal-border rounded-xl flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${savingsRate >= 20 ? 'bg-teal-50 text-teal-600' : 'bg-orange-50 text-orange-600'}`}>
                        <SavingsIcon />
                    </div>
                    <div>
                        <p className="text-sm text-minimal-text-secondary font-medium">อัตราการออม</p>
                        <p className="text-2xl font-bold text-minimal-text-main">{savingsRate.toFixed(1)}%</p>
                    </div>
                </div>
            </div>

            {/* Source Analysis Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderPieChart(incomeSourceChartData, 'ที่มาของรายรับ (Income Source)', 'ไม่มีข้อมูลรายรับ')}
                {renderPieChart(expenseSourceChartData, 'แหล่งที่ใช้จ่าย (Expense Source)', 'ไม่มีข้อมูลรายจ่าย')}
            </div>

            {/* Expense By Category Row */}
            <div className="bg-minimal-card p-6 border border-minimal-border rounded-xl">
                <h2 className="text-lg font-bold text-minimal-text-main mb-4">รายจ่ายแยกตามหมวดหมู่ (Top 10)</h2>
                {expenseChartData.length > 0 ? (
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={expenseChartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12, fill: '#64748B' }} stroke="#CBD5E1" />
                                <Tooltip 
                                    formatter={(value: number) => `฿${value.toLocaleString()}`} 
                                    cursor={{fill: 'rgba(71, 85, 105, 0.05)'}} 
                                    contentStyle={{backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                                />
                                <Bar dataKey="amount" barSize={24} radius={[0, 4, 4, 0]}>
                                    {expenseChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-[300px] flex items-center justify-center text-minimal-text-secondary bg-slate-50 rounded-lg">ไม่มีข้อมูลรายจ่าย</div>
                )}
            </div>

            {/* Recent Transactions List */}
            <div className="bg-minimal-card border border-minimal-border rounded-xl overflow-hidden">
                <div className="p-6 border-b border-minimal-border flex justify-between items-center">
                    <h2 className="text-lg font-bold text-minimal-text-main">รายการล่าสุด</h2>
                    <span className="text-xs font-medium text-minimal-text-secondary bg-slate-100 px-2 py-1 rounded">5 รายการล่าสุดในช่วงนี้</span>
                </div>
                {recentTransactions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-minimal-text-secondary">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 font-medium">วันที่</th>
                                    <th className="px-6 py-3 font-medium">รายการ</th>
                                    <th className="px-6 py-3 font-medium">หมวดหมู่</th>
                                    <th className="px-6 py-3 font-medium">สังกัด</th>
                                    <th className="px-6 py-3 font-medium text-right">จำนวน</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-minimal-border">
                                {recentTransactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {new Date(t.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-minimal-text-main">{t.description}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                                                {getCategoryByValue(t.category)?.label || t.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {t.source === 'erawan' && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">เอราวัณ</span>}
                                            {t.source === 'wildfire_station' && <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">ไฟป่า</span>}
                                            {(!t.source || t.source === 'personal') && <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">ส่วนตัว</span>}
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {t.type === 'income' ? '+' : '-'}฿{t.amount.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center text-minimal-text-secondary">ไม่มีรายการเคลื่อนไหวในช่วงเวลานี้</div>
                )}
            </div>
        </div>
    );
};

// --- Icons ---
const IncomeIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>; // Up arrowish
const ExpenseIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>; // Down arrow
const BalanceIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>;
const SavingsIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CalendarIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
