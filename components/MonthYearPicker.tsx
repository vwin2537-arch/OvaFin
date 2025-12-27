
import React, { useState, useEffect, useRef } from 'react';

const thaiMonths = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
];

interface MonthYearPickerProps {
    value: { month: number | 'all'; year: number };
    availableYears: number[];
    onChange: (value: { month: number | 'all'; year: number }) => void;
    onClose: () => void;
    selectMode: 'month' | 'year';
}

export const MonthYearPicker: React.FC<MonthYearPickerProps> = ({ value, availableYears, onChange, onClose, selectMode }) => {
    const [view, setView] = useState<'months' | 'years'>(selectMode === 'year' ? 'years' : 'months');
    const [displayYear, setDisplayYear] = useState(value.year);
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setView(selectMode === 'year' ? 'years' : 'months');
    }, [selectMode]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleMonthSelect = (monthIndex: number | 'all') => {
        onChange({ month: monthIndex, year: displayYear });
    };
    
    const handleYearSelect = (year: number) => {
        if (selectMode === 'year') {
            onChange({ month: value.month, year: year });
        } else {
            setDisplayYear(year);
            setView('months');
        }
    };

    const toggleView = () => {
        if (selectMode === 'year') return;
        setView(view === 'months' ? 'years' : 'months');
    };

    const renderMonthView = () => (
        <div className="p-2">
            <div className="grid grid-cols-4 gap-2 mb-3">
                {thaiMonths.map((month, index) => (
                    <button
                        key={month}
                        onClick={() => handleMonthSelect(index)}
                        className={`px-2 py-3 text-sm rounded-xl transition-all ${
                            value.month === index && value.year === displayYear
                                ? 'bg-minimal-primary text-white font-bold shadow-md scale-105'
                                : 'hover:bg-slate-100 text-minimal-text-secondary active:scale-95'
                        }`}
                    >
                        {month}
                    </button>
                ))}
            </div>
            {selectMode === 'month' && (
                <button
                    onClick={() => handleMonthSelect('all')}
                    className={`w-full py-3 text-sm font-bold rounded-xl border-2 transition-all ${
                        value.month === 'all' && value.year === displayYear
                        ? 'bg-minimal-primary border-minimal-primary text-white shadow-md'
                        : 'border-slate-200 text-minimal-primary hover:bg-slate-50'
                    }`}
                >
                    แสดงทุกเดือนของปี {displayYear + 543}
                </button>
            )}
        </div>
    );

    const renderYearView = () => {
        const years = [...availableYears];
        const currentYear = new Date().getFullYear();
        if (!years.includes(currentYear)) years.push(currentYear);
        years.sort((a,b) => b - a);
        if (years.length === 0) years.push(currentYear);

        return (
            <div className="grid grid-cols-3 gap-2 p-2 max-h-64 overflow-y-auto">
                {years.map(year => (
                    <button
                        key={year}
                        onClick={() => handleYearSelect(year)}
                        className={`px-2 py-3 text-sm rounded-xl transition-all ${
                            value.year === year
                                ? 'bg-minimal-primary text-white font-bold shadow-md'
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
        <div 
            ref={pickerRef} 
            className="w-[calc(100vw-2.5rem)] sm:w-80 bg-white border border-minimal-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
            style={{ maxWidth: '320px' }}
        >
            <div className="flex items-center justify-between p-3 border-b border-minimal-border bg-slate-50">
                <button 
                    onClick={() => setDisplayYear(displayYear - 1)} 
                    className={`p-2 rounded-full hover:bg-white hover:shadow-sm text-minimal-text-secondary ${view === 'years' ? 'invisible' : ''}`}
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                
                <button 
                    onClick={toggleView} 
                    className={`font-bold text-minimal-primary px-4 py-1.5 rounded-lg hover:bg-white hover:shadow-sm transition-all ${selectMode === 'year' ? 'cursor-default' : ''}`}
                >
                    {view === 'months' ? `พ.ศ. ${displayYear + 543}` : 'เลือกปี พ.ศ.'}
                </button>
                
                <button 
                    onClick={() => setDisplayYear(displayYear + 1)} 
                    className={`p-2 rounded-full hover:bg-white hover:shadow-sm text-minimal-text-secondary ${view === 'years' ? 'invisible' : ''}`}
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
            {view === 'months' ? renderMonthView() : renderYearView()}
        </div>
    );
};
