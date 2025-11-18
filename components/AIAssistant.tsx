
import React, { useState, useEffect, useCallback } from 'react';
import type { Transaction } from '../types';
import { getFinancialAdvice } from '../services/geminiService';

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-minimal-primary animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-3 h-3 rounded-full bg-minimal-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-3 h-3 rounded-full bg-minimal-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        <span className="ml-3 text-minimal-text-secondary">AI กำลังวิเคราะห์...</span>
    </div>
);

export const AIAssistant: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
    const [advice, setAdvice] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const fetchAdvice = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const result = await getFinancialAdvice(transactions);
            setAdvice(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to get advice: ${errorMessage}`);
            setAdvice('');
        } finally {
            setIsLoading(false);
        }
    }, [transactions]);

    useEffect(() => {
        if (transactions.length > 0) {
            fetchAdvice();
        } else {
            setAdvice("เพิ่มข้อมูลรายรับ-รายจ่ายของคุณก่อน แล้ว AI จะช่วยวิเคราะห์และให้คำแนะนำทางการเงินแก่คุณ");
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-minimal-text-main">AI ผู้ช่วยการเงิน</h1>
                <p className="text-minimal-text-secondary">รับคำแนะนำส่วนตัวเพื่อสุขภาพทางการเงินที่ดีขึ้น</p>
            </header>

            <div className="bg-minimal-card p-6 border border-minimal-border rounded-xl min-h-[300px] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-minimal-primary">คำแนะนำจาก AI</h2>
                    <button 
                        onClick={fetchAdvice} 
                        disabled={isLoading || transactions.length === 0}
                        className="px-4 py-2 text-sm font-semibold bg-slate-100 text-minimal-primary rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'กำลังโหลด...' : 'วิเคราะห์ใหม่'}
                    </button>
                </div>

                <div className="flex-grow">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <LoadingSpinner />
                        </div>
                    ) : error ? (
                        <div className="text-red-500">{error}</div>
                    ) : (
                        <div 
                            className="prose prose-sm max-w-none text-minimal-text-main" 
                            dangerouslySetInnerHTML={{ __html: advice.replace(/\n/g, '<br />') }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};