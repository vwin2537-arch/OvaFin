
import React, { useState, useMemo, useCallback } from 'react';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { ExportDataModal } from './components/ExportDataModal';
import { AddTransactionModal } from './components/AddTransactionModal';
import { Settings } from './components/Settings';
import { useTransactions } from './hooks/useTransactions';
import { useCategories } from './hooks/useCategories';
import { useBanks } from './hooks/useBanks';
import type { Transaction, Category, View, Bank } from './types';
import { Sidebar } from './components/Sidebar';
import { SuccessModal } from './components/SuccessModal';

const App: React.FC = () => {
  const { transactions, addTransaction, deleteTransaction, clearTransactions, setAllTransactions } = useTransactions();
  const { 
    incomeCategories, expenseCategories, addCategory, deleteCategory, clearCategories,
    setAllIncomeCategories, setAllExpenseCategories 
  } = useCategories();
  const { banks, addBank, deleteBank, clearBanks, setAllBanks } = useBanks();
  
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  
  // Success Modal State
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });

  const allCategories = useMemo(() => [...incomeCategories, ...expenseCategories], [incomeCategories, expenseCategories]);

  const transactionYears = useMemo(() => {
    const years = new Set(transactions.map(t => new Date(t.date).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  const getCategoryByValue = useCallback((value: string): Category | undefined => {
    return allCategories.find(cat => cat.value === value);
  }, [allCategories]);

  const getBankById = useCallback((id: string): Bank | undefined => {
    return banks.find(b => b.id === id);
  }, [banks]);

  const handleClearAllData = () => {
    clearTransactions();
    clearCategories();
    clearBanks();
    setSuccessModal({
        isOpen: true,
        title: 'ล้างข้อมูลสำเร็จ',
        message: 'ข้อมูลทั้งหมดถูกลบออกจากระบบเรียบร้อยแล้ว'
    });
    setCurrentView('dashboard');
  };

  const handleRestoreData = (data: any) => {
    if (data.transactions && Array.isArray(data.transactions)) {
        setAllTransactions(data.transactions);
    }
    if (data.incomeCategories && Array.isArray(data.incomeCategories)) {
        setAllIncomeCategories(data.incomeCategories);
    }
    if (data.expenseCategories && Array.isArray(data.expenseCategories)) {
        setAllExpenseCategories(data.expenseCategories);
    }
    if (data.banks && Array.isArray(data.banks)) {
        setAllBanks(data.banks);
    }
    setSuccessModal({
        isOpen: true,
        title: 'กู้คืนข้อมูลสำเร็จ',
        message: 'นำเข้าข้อมูลจากไฟล์สำรองเรียบร้อยแล้ว'
    });
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard transactions={transactions} getCategoryByValue={getCategoryByValue} transactionYears={transactionYears} />;
      case 'transactions':
        return <TransactionList transactions={transactions} deleteTransaction={deleteTransaction} getCategoryByValue={getCategoryByValue} getBankById={getBankById} />;
      case 'settings':
        return <Settings 
                  incomeCategories={incomeCategories} 
                  expenseCategories={expenseCategories} 
                  addCategory={addCategory}
                  deleteCategory={deleteCategory}
                  transactions={transactions}
                  onClearAllData={handleClearAllData}
                  onRestoreData={handleRestoreData}
                  banks={banks}
                  addBank={addBank}
                  deleteBank={deleteBank}
                />;
      default:
        return <Dashboard transactions={transactions} getCategoryByValue={getCategoryByValue} transactionYears={transactionYears} />;
    }
  };

  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    addTransaction(transaction);
    setIsAddModalOpen(false);
  };
  
  return (
    <div className="bg-minimal-bg min-h-screen text-minimal-text-main font-sans flex flex-col md:flex-row">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} onExportClick={() => setIsExportModalOpen(true)} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {renderView()}
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-6 right-6 bg-minimal-primary hover:bg-minimal-primary-hover text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-colors duration-200 z-40"
        aria-label="Add Transaction"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {isAddModalOpen && (
        <AddTransactionModal
          onClose={() => setIsAddModalOpen(false)}
          onAddTransaction={handleAddTransaction}
          incomeCategories={incomeCategories}
          expenseCategories={expenseCategories}
          banks={banks}
        />
      )}
      {isExportModalOpen && (
        <ExportDataModal
          transactions={transactions}
          onClose={() => setIsExportModalOpen(false)}
          allCategories={allCategories}
          getBankById={getBankById}
          transactionYears={transactionYears}
        />
      )}
      
      <SuccessModal 
        isOpen={successModal.isOpen} 
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })} 
        title={successModal.title}
        message={successModal.message}
      />
    </div>
  );
};

export default App;
