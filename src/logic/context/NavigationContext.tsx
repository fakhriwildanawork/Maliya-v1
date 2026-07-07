import React, { createContext, useContext, useState, ReactNode } from 'react';

type Route = 'dashboard' | 'accounts' | 'transactions' | 'budget' | 'goals' | 'reports' | 'settings' | 'account-details' | 'card-details' | 'revenue-plan' | 'ledger' | 'categories' | 'debts' | 'investments' | 'assets' | 'family-members';

interface NavigationContextType {
  activeRoute: Route;
  setActiveRoute: (route: Route) => void;
  routeParam?: string;
  setRouteParam: (param?: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [activeRoute, setActiveRoute] = useState<Route>('dashboard');
  const [routeParam, setRouteParam] = useState<string | undefined>(undefined);

  return (
    <NavigationContext.Provider value={{ activeRoute, setActiveRoute, routeParam, setRouteParam }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
