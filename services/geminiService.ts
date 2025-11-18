import { GoogleGenAI } from "@google/genai";
import type { Transaction } from '../types';

export const getFinancialAdvice = async (transactions: Transaction[]): Promise<string> => {
    if (!process.env.API_KEY) {
        return "API Key is not configured. Please set up your API_KEY environment variable.";
    }

    if (transactions.length === 0) {
        return "ยังไม่มีข้อมูลเพียงพอสำหรับวิเคราะห์ กรุณาเพิ่มรายการธุรกรรมของคุณก่อน";
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const summary = transactions.reduce((acc, t) => {
        if (t.type === 'income') {
            acc.totalIncome += t.amount;
        } else {
            acc.totalExpense += t.amount;
            acc.expensesByCategory[t.category] = (acc.expensesByCategory[t.category] || 0) + t.amount;
        }
        return acc;
    }, {
        totalIncome: 0,
        totalExpense: 0,
        expensesByCategory: {} as Record<string, number>
    });

    const topExpenses = Object.entries(summary.expensesByCategory)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([category, amount]) => `- ${category}: ${amount.toFixed(2)} THB`)
        .join('\n');

    const prompt = `
        You are a friendly and insightful financial assistant. Your user's primary language is Thai.
        Analyze the following financial summary and provide three actionable, personalized tips for saving money or improving financial health.
        Present the tips in a clear, encouraging, and easy-to-understand format in Thai. Use markdown for formatting if needed.

        Financial Summary:
        - Total Income: ${summary.totalIncome.toFixed(2)} THB
        - Total Expenses: ${summary.totalExpense.toFixed(2)} THB
        - Top Spending Categories:
        ${topExpenses || 'No expenses recorded.'}

        Please provide your advice now.
    `;

    try {
        // Fix: Updated to use the correct model name and request format.
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }],
        });
        return response.text;
    } catch (error) {
        console.error("Error fetching advice from Gemini API:", error);
        return "ขออภัย, ไม่สามารถติดต่อ AI ผู้ช่วยได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง";
    }
};