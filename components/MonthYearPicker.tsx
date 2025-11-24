
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
    // Explicitly set initial state based on selectMode
    const [view, setView] = useState<'months' | 'years'>(selectMode === 'year' ? 'years' : 'months');
    const [displayYear, setDisplayYear] = useState(value.year);
    const pickerRef = useRef<HTMLDivElement>(null);

    // Force view update if selectMode changes while component is mounted
    useEffect(() => {
        if (selectMode === 'year') {
            setView('years');
        } else {
            setView('months');
        }
    }, [selectMode]);

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
            // If in year mode, selecting a year is the final action
            onChange({ month: value.month, year: year });
        } else {
            // If in month mode, selecting a year drills down to months
            setDisplayYear(year);
            setView('months');
        }
    };

    const toggleView = () => {
        // Prevent switching to months view if we are in year-only mode
        if (selectMode === 'year') return;
        setView(view === 'months' ? 'years' : 'months');
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

        // Ensure at least some years are shown even if no data
        if (years.length === 0) {
            years.push(currentYear);
        }

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
                {/* Hide navigation arrows if in year-only mode or inside year view */}
                <button 
                    onClick={() => setDisplayYear(displayYear - 1)} 
                    className={`p-2 rounded-full hover:bg-slate-100 text-minimal-text-secondary ${selectMode === 'year' || view === 'years' ? 'invisible' : ''}`}
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                
                <button 
                    onClick={toggleView} 
                    className={`font-semibold text-minimal-primary px-3 py-1 rounded-md ${selectMode === 'year' ? 'cursor-default' : 'hover:bg-slate-100'}`}
                >
                    {selectMode === 'year' ? 'เลือกปี พ.ศ.' : (view === 'months' ? `พ.ศ. ${displayYear + 543}` : 'เลือกปี')}
                </button>
                
                <button 
                    onClick={() => setDisplayYear(displayYear + 1)} 
                    className={`p-2 rounded-full hover:bg-slate-100 text-minimal-text-secondary ${selectMode === 'year' || view === 'years' ? 'invisible' : ''}`}
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
            {view === 'months' ? renderMonthView() : renderYearView()}
        </div>
    );
};
