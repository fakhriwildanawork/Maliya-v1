/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Dashboard from './modules/dashboard/Dashboard';
import Accounts from './modules/accounts/Accounts';
import AccountDetailsPage from './modules/accounts/AccountDetailsPage';
import CardDetailsPage from './modules/accounts/CardDetailsPage';
import Transactions from './modules/transactions/Transactions';
import Budgets from './modules/budgets/Budgets';
import RevenuePlan from './modules/revenue-plan/RevenuePlan';
import Goals from './modules/goals/Goals';
import Ledger from './modules/ledger/Ledger';
import Categories from './modules/categories/Categories';
import Debts from './modules/debts/Debts';
import Investments from './modules/investments/Investments';
import Assets from './modules/assets/Assets';
import Reports from './modules/reports/Reports';
import FamilyMembers from './modules/family-members/FamilyMembers';
import Sidebar from './ui/components/layout/Sidebar';
import Topbar from './ui/components/layout/Topbar';
import { NavigationProvider, useNavigation } from './logic/context/NavigationContext';
import { FinanceProvider, useFinance } from './logic/context/FinanceContext';
import { ViewportProvider } from './logic/context/ViewportContext';
import { AuthProvider, useAuth } from './logic/context/AuthContext';
import Login from './modules/auth/Login';
import { Loader2 } from 'lucide-react';
import { MALIYA_LOGO_URL } from './assets';
import Modal from './ui/components/common/Modal';
import TransactionForm from './modules/transactions/components/TransactionForm';
import { TransactionInsert } from './logic/types/transactions';

import Settings from './modules/settings/Settings';

function AppContent() {
  const { activeRoute } = useNavigation();
  const { addActivity } = useFinance();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGlobalFormOpen, setIsGlobalFormOpen] = useState(false);

  const handleGlobalFormSubmit = async (data: Partial<TransactionInsert>) => {
    try {
      await addActivity(data as TransactionInsert);
      setIsGlobalFormOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex w-full h-screen font-sans bg-gray-50 text-gray-900 overflow-hidden relative">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Topbar onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} />
        <div className="flex-1 min-h-0 relative flex flex-col">
          {activeRoute === 'dashboard' && <Dashboard />}
          {activeRoute === 'accounts' && <Accounts />}
          {activeRoute === 'account-details' && <AccountDetailsPage />}
          {activeRoute === 'card-details' && <CardDetailsPage />}
          {activeRoute === 'transactions' && <Transactions />}
          {activeRoute === 'ledger' && <Ledger />}
          {activeRoute === 'categories' && <Categories />}
          {activeRoute === 'debts' && <Debts />}
          {activeRoute === 'budget' && <Budgets />}
          {activeRoute === 'revenue-plan' && <RevenuePlan />}
          {activeRoute === 'goals' && <Goals />}
          {activeRoute === 'investments' && <Investments />}
          {activeRoute === 'assets' && <Assets />}
          {activeRoute === 'reports' && <Reports />}
          {activeRoute === 'family-members' && <FamilyMembers />}
          {activeRoute === 'settings' && <Settings />}
          
          {/* Fallback for routes that don't match exactly */}
          {!['dashboard', 'accounts', 'account-details', 'card-details', 'transactions', 'ledger', 'categories', 'debts', 'budget', 'revenue-plan', 'goals', 'investments', 'assets', 'reports', 'family-members', 'settings'].includes(activeRoute) && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              {activeRoute.charAt(0).toUpperCase() + activeRoute.slice(1)} Module - Under Construction
            </div>
          )}
        </div>
      </div>
      
      <button
        onClick={() => setIsGlobalFormOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-105 active:scale-95 transition-transform overflow-hidden flex items-center justify-center bg-white"
        title="Add Transaction"
      >
        <img src={MALIYA_LOGO_URL} alt="Add Transaction" className="w-full h-full object-cover" />
      </button>

      <Modal 
        isOpen={isGlobalFormOpen} 
        onClose={() => setIsGlobalFormOpen(false)}
        title="New Transaction"
      >
        <TransactionForm 
          onSubmit={handleGlobalFormSubmit} 
          onCancel={() => setIsGlobalFormOpen(false)} 
        />
      </Modal>
    </div>
  );
}

function AppWithAuth() {
  const { isAuthenticated, loading } = useAuth();

  React.useEffect(() => {
    if (!loading) {
      (window as any).removeSplashScreen?.();
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-white">
        <div className="relative mb-4">
          <img
            src={MALIYA_LOGO_URL}
            alt="Maliya Logo"
            className="w-16 h-16 rounded-2xl object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return <AppContent />;
}

export default function App() {
  return (
    <ViewportProvider>
      <NavigationProvider>
        <AuthProvider>
          <FinanceProvider>
            <AppWithAuth />
          </FinanceProvider>
        </AuthProvider>
      </NavigationProvider>
    </ViewportProvider>
  );
}
