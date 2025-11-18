

import React, { useState } from 'react';
import type { View } from '../types';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  onExportClick: () => void;
}

const NavItem: React.FC<{
  label: string;
  // Fix: Replaced JSX.Element with React.ReactElement to resolve namespace error.
  // Fix: Specify props for the icon element to allow cloning with className.
  icon: React.ReactElement<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-left transition-colors duration-200 rounded-lg ${
      isActive
        ? 'bg-slate-100 text-minimal-primary font-semibold'
        : 'text-minimal-text-secondary hover:bg-slate-100 hover:text-minimal-primary'
    }`}
  >
    {React.cloneElement(icon, { className: "h-5 w-5" })}
    <span className="ml-4 font-medium text-sm md:text-base">{label}</span>
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, onExportClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = (
    <nav className="flex-1 space-y-2">
      <NavItem
        label="แดชบอร์ด"
        icon={<DashboardIcon />}
        isActive={currentView === 'dashboard'}
        onClick={() => {
            setCurrentView('dashboard');
            setIsMobileMenuOpen(false);
        }}
      />
      <NavItem
        label="รายการทั้งหมด"
        icon={<TransactionsIcon />}
        isActive={currentView === 'transactions'}
        onClick={() => {
            setCurrentView('transactions');
            setIsMobileMenuOpen(false);
        }}
      />
       <NavItem
        label="AI ผู้ช่วยการเงิน"
        icon={<AIAssistantIcon />}
        isActive={currentView === 'ai_assistant'}
        onClick={() => {
            setCurrentView('ai_assistant');
            setIsMobileMenuOpen(false);
        }}
      />
      <NavItem
        label="ตั้งค่า"
        icon={<SettingsIcon />}
        isActive={currentView === 'settings'}
        onClick={() => {
            setCurrentView('settings');
            setIsMobileMenuOpen(false);
        }}
      />
      <button
        onClick={() => {
            onExportClick();
            setIsMobileMenuOpen(false);
        }}
        className="flex items-center w-full px-4 py-3 text-left transition-colors duration-200 rounded-lg text-minimal-text-secondary hover:bg-slate-100 hover:text-minimal-primary"
      >
        {/* Fix: Add className for consistent icon sizing. */}
        <ExportIcon className="h-5 w-5" />
        <span className="ml-4 font-medium text-sm md:text-base">Export ข้อมูล</span>
      </button>
    </nav>
  );

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 bg-minimal-card border-b border-minimal-border z-20 flex items-center justify-between p-4">
        <h1 className="text-lg font-bold text-minimal-primary">OvaFin Finance</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-minimal-text-main">
          <MenuIcon />
        </button>
      </header>

      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-minimal-card p-4 border-r border-minimal-border">
        <div className="flex items-center mb-8">
          <div className="bg-minimal-primary p-2 rounded-lg">
            <LogoIcon />
          </div>
          <h1 className="ml-3 text-xl font-bold text-minimal-primary">OvaFin</h1>
        </div>
        {navItems}
      </aside>

      {/* Mobile Menu (Drawer) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed top-0 left-0 h-full w-64 bg-minimal-card p-4 shadow-xl z-40" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-lg font-bold text-minimal-primary">OvaFin Finance</h1>
                <button onClick={() => setIsMobileMenuOpen(false)}><CloseIcon /></button>
            </div>
            {navItems}
          </div>
        </div>
      )}
    </>
  );
};


// --- Icons ---
const DashboardIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-4m-2 2h4m-2-5a2 2 0 100-4 2 2 0 000 4zm-2 11a2 2 0 110-4 2 2 0 010 4zm10-4a2 2 0 100-4 2 2 0 000 4zm-2-7a2 2 0 110-4 2 2 0 010 4z" /></svg>;
const TransactionsIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>;
const AIAssistantIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const ExportIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const SettingsIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const LogoIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>;
const MenuIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>;
const CloseIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>;