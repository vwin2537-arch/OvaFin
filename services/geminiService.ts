// import { GoogleGenAI } from "@google/genai";
import type { Transaction } from '../types';

export const getFinancialAdvice = async (transactions: Transaction[]): Promise<string> => {
    // AI Feature disabled
    return "ฟีเจอร์ AI ถูกปิดการใช้งานแล้ว";

    /* 
    // Original Code preserved for reference if needed later
    if (!process.env.API_KEY) {
        return "API Key is not configured. Please set up your API_KEY environment variable.";
    }

    if (transactions.length === 0) {
        return "ยังไม่มีข้อมูลเพียงพอสำหรับวิเคราะห์ กรุณาเพิ่มรายการธุรกรรมของคุณก่อน";
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // ... rest of logic ...
    */
};