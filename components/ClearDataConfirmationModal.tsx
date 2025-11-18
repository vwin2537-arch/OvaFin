
import React, { useState } from 'react';

interface ClearDataConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const ClearDataConfirmationModal: React.FC<ClearDataConfirmationModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) {
        return null;
    }

    const handleConfirmClick = () => {
        if (password === '123457') {
            onConfirm();
        } else {
            setError('รหัสผ่านไม่ถูกต้อง');
        }
    };
    
    const handleClose = () => {
        setPassword('');
        setError('');
        onClose();
    }

    const inputClasses = "mt-1 block w-full px-4 py-2 bg-slate-50 border border-minimal-border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-minimal-primary text-minimal-text-main";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-minimal-card rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-minimal-text-main mb-2">ยืนยันการล้างข้อมูลทั้งหมด</h2>
                <p className="text-minimal-text-secondary mb-4">
                    การดำเนินการนี้จะลบข้อมูลทั้งหมดในแอปพลิเคชันอย่างถาวรและไม่สามารถย้อนกลับได้
                </p>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="clear-data-password" className="block text-sm font-medium text-minimal-text-secondary">กรุณาใส่รหัสผ่านเพื่อยืนยัน</label>
                        <input
                            id="clear-data-password"
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (error) setError('');
                            }}
                            className={inputClasses}
                            placeholder="รหัสผ่าน"
                            autoComplete="off"
                        />
                         {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                    </div>
                </div>
                <div className="flex justify-end pt-6 space-x-3">
                    <button type="button" onClick={handleClose} className="px-5 py-2 bg-slate-100 text-minimal-text-secondary rounded-lg hover:bg-slate-200 font-semibold">ยกเลิก</button>
                    <button type="button" onClick={handleConfirmClick} className="px-5 py-2 bg-minimal-expense text-white rounded-lg hover:bg-red-600 font-semibold">ยืนยันการล้างข้อมูล</button>
                </div>
            </div>
        </div>
    );
};
