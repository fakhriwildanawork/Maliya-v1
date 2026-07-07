import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  Settings,
  Target,
  Users,
  BookOpen,
  FolderOpen,
  LineChart,
  Briefcase,
  BarChart2,
  Receipt,
  PieChart,
  TrendingUp,
  Landmark,
  X
} from 'lucide-react';
import React from 'react';
import { useNavigation } from '../../../logic/context/NavigationContext';
import { useAuth } from '../../../logic/context/AuthContext';
import { cn } from '../../../logic/utils/classNames';
import { MALIYA_LOGO_URL } from '../../../assets';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { activeRoute, setActiveRoute } = useNavigation();
  const { currentUser, logout } = useAuth();

  const navGroups = [
    {
      label: 'Overview',
      items: [
        { id: 'dashboard', icon: LayoutDashboard, title: 'Dashboard' },
        { id: 'reports', icon: BarChart2, title: 'Reports' },
      ]
    },
    {
      label: 'Daily & Tracking',
      items: [
        { id: 'accounts', icon: CreditCard, title: 'Accounts' },
        { id: 'transactions', icon: Receipt, title: 'Transactions' },
        { id: 'ledger', icon: BookOpen, title: 'Ledger' },
        { id: 'categories', icon: FolderOpen, title: 'Categories' },
      ]
    },
    {
      label: 'Planning & Debts',
      items: [
        { id: 'budget', icon: PieChart, title: 'Budget' },
        { id: 'revenue-plan', icon: TrendingUp, title: 'Revenue Plan' },
        { id: 'debts', icon: Landmark, title: 'Debt Loans' },
        { id: 'goals', icon: Target, title: 'Goals' },
      ]
    },
    {
      label: 'Wealth & Assets',
      items: [
        { id: 'investments', icon: LineChart, title: 'Investments' },
        { id: 'assets', icon: Briefcase, title: 'Assets' },
      ]
    },
    {
      label: 'Management',
      items: [
        { id: 'family-members', icon: Users, title: 'Family Members' },
        { id: 'settings', icon: Settings, title: 'Settings' },
      ]
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 bg-bg-sidebar flex flex-col pt-[calc(1.5rem+env(safe-area-inset-top))] pb-6 border-r border-border-light w-64 lg:w-60 flex-shrink-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        
        {/* App Logo & Title Header */}
        <div className="flex items-center justify-between px-6 pb-5 border-b border-border-light w-full mb-4">
          <div className="flex items-center gap-3">
            <img
              src={MALIYA_LOGO_URL}
              alt="Maliya Logo"
              className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
              referrerPolicy="no-referrer"
            />
            <span className="text-xl font-bold text-gray-900 font-nunito tracking-normal">Maliya</span>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List with Internal Vertical Scrolling */}
        <nav className="w-full flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex flex-col px-4 gap-6">
          {navGroups.map((group, idx) => (
            <div key={idx} className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-1">{group.label}</span>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveRoute(item.id as any);
                    if (window.innerWidth < 768) {
                      onClose();
                    }
                  }}
                  title={item.title}
                  className={cn(
                    "transition-all duration-200 flex items-center rounded-full h-11 px-4 gap-3.5 w-full overflow-hidden flex-shrink-0",
                    activeRoute === item.id
                      ? "bg-text-primary text-white shadow-md"
                      : "text-text-muted hover:text-text-primary hover:bg-gray-100"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium text-sm whitespace-nowrap">
                    {item.title}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer Profile & Logout */}
        <div className="w-full px-4 mt-auto pt-4 border-t border-border-light">
          <div className="flex items-center justify-between p-1.5 bg-gray-50 hover:bg-gray-100/60 rounded-2xl transition-colors border border-border-light/40">
            <div className="flex items-center gap-2.5 min-w-0 pl-1">
              <img
                src={currentUser?.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                alt="User"
                className="w-9 h-9 rounded-full bg-gray-100 flex-shrink-0 object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="text-sm font-semibold text-text-primary truncate">{currentUser?.name || "Oripio Studio"}</span>
            </div>
            <button 
              onClick={() => logout()}
              title="Logout"
              className="w-11 h-11 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0 flex items-center justify-center cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
