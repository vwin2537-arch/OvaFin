import React, { useState, useEffect, useRef } from 'react';

const thaiMonths = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
];

interface MonthYearPickerProps {
    value: { month: number; year: number };
    availableYears: number[];
    onChange: (value: { month: number; year: number }) => void;
    onClose: () => void;
    selectMode: 'month' | 'year';
}

export const MonthYearPicker: React.FC<MonthYearPickerProps> = ({ value, availableYears, onChange, onClose, selectMode }) => {
    const [view, setView] = useState<'months' | 'years'>('months');
    const [displayYear, setDisplayYear] = useState(value.year);
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const handleMonthSelect = (monthIndex: number) => {
        onChange({ month: monthIndex, year: displayYear });
    };
    
    const handleYearSelect = (year: number) => {
        if (selectMode === 'year') {
            // When only selecting a year, finalize the selection immediately.
            onChange({ month: value.month, year: year });
        } else {
            // When selecting a month, just change the year and go back to month view.
            setDisplayYear(year);
            setView('months');
        }
    };

    const renderMonthView = () => (
        <div className="grid grid-cols-4 gap-2 p-2">
            {thaiMonths.map((month, index) => (
                <button
                    key={month}
                    onClick={() => handleMonthSelect(index)}
                    className={`px-2 py-3 text-sm rounded-lg transition-colors ${
                        value.month === index && value.year === displayYear
                            ? 'bg-minimal-primary text-white font-semibold'
                            : 'hover:bg-slate-100 text-minimal-text-secondary'
                    }`}
                >
                    {month}
                </button>
            ))}
        </div>
    );

    const renderYearView = () => {
        const years = [...availableYears];
        const currentYear = new Date().getFullYear();
        if (!years.includes(currentYear)) {
            years.push(currentYear);
        }
        years.sort((a,b) => b - a);

        return (
            <div className="grid grid-cols-4 gap-2 p-2 max-h-48 overflow-y-auto">
                {years.map(year => (
                    <button
                        key={year}
                        onClick={() => handleYearSelect(year)}
                        className={`px-2 py-3 text-sm rounded-lg transition-colors ${
                            value.year === year
                                ? 'bg-minimal-primary text-white font-semibold'
                                : 'hover:bg-slate-100 text-minimal-text-secondary'
                        }`}
                    >
                        {year + 543}
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div ref={pickerRef} className="absolute top-full right-0 mt-2 w-72 bg-minimal-card border border-minimal-border rounded-xl shadow-lg z-50">
            <div className="flex items-center justify-between p-2 border-b border-minimal-border">
                <button onClick={() => setDisplayYear(displayYear - 1)} className="p-2 rounded-full hover:bg-slate-100 text-minimal-text-secondary">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={() => setView(view === 'months' ? 'years' : 'months')} className="font-semibold text-minimal-primary hover:bg-slate-100 px-3 py-1 rounded-md">
                    {view === 'months' ? `พ.ศ. ${displayYear + 543}` : 'เลือกปี'}
                </button>
                <button onClick={() => setDisplayYear(displayYear + 1)} className="p-2 rounded-full hover:bg-slate-100 text-minimal-text-secondary">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
            {view === 'months' ? renderMonthView() : renderYearView()}
        </div>
    );
};