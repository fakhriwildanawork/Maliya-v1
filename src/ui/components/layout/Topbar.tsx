import { Menu } from 'lucide-react';
import React from 'react';
import { cn } from '../../../logic/utils/classNames';
import { useNavigation } from '../../../logic/context/NavigationContext';
import { MALIYA_LOGO_URL } from '../../../assets';

interface TopbarProps {
  onToggleSidebar?: () => void;
}

export default function Topbar({ onToggleSidebar }: TopbarProps) {
  const { activeRoute } = useNavigation();

  const getRouteTitle = () => {
    switch (activeRoute) {
      case 'dashboard': return 'Dashboard';
      case 'accounts': return 'Accounts & Wallets';
      case 'account-details': return 'Account Details';
      case 'card-details': return 'Card Details';
      case 'transactions': return 'Transactions';
      case 'ledger': return 'Ledger';
      case 'categories': return 'Categories';
      case 'debts': return 'Debt Loans';
      case 'budget': return 'Budget';
      case 'revenue-plan': return 'Revenue Plan';
      case 'goals': return 'Goals';
      case 'investments': return 'Investments';
      case 'assets': return 'Assets';
      case 'reports': return 'Reports';
      case 'family-members': return 'Family Members';
      case 'settings': return 'Settings';
      default: return 'Maliya';
    }
  };

  return (
    <header className="relative flex items-center justify-between pt-[calc(1rem+env(safe-area-inset-top))] pb-4 px-4 md:px-8 bg-gray-50 border-b border-border-light flex-shrink-0 min-h-[calc(4.5rem+env(safe-area-inset-top))]">
      {/* Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg md:text-xl font-bold text-gray-900">{getRouteTitle()}</h1>
      </div>

      {/* Right side icons */}
      <div className="flex items-center gap-4">
        <button className="p-1 hover:bg-gray-100 rounded-full transition-colors relative">
          <img
            src={MALIYA_LOGO_URL}
            alt="Maliya Logo"
            className="w-8 h-8 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        </button>
      </div>
    </header>
  );
}
