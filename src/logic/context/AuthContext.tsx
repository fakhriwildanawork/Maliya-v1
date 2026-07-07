import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FamilyMember } from '../types/familyMembers';
import { FamilyMemberService } from '../services/familyMemberService';

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: FamilyMember | null;
  loading: boolean;
  login: (accessCode: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FamilyMember | null>(null);
  const [loading, setLoading] = useState(true);

  // Check existing session
  useEffect(() => {
    const checkSession = () => {
      try {
        const stored = localStorage.getItem('maliya_session');
        if (stored) {
          setCurrentUser(JSON.parse(stored));
        }
      } catch (err) {
        console.error('Failed to parse stored session', err);
        localStorage.removeItem('maliya_session');
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = useCallback(async (accessCode: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // 0. Superadmin hardcoded bypass
      if (accessCode.trim().toLowerCase() === 'spadmin' && password === 'aamiin') {
        const superadmin: FamilyMember = {
          id: '00000000-0000-4000-8000-000000000000',
          name: 'Super Admin',
          relationship: 'Other',
          role: 'Owner',
          email: 'superadmin@maliya.app',
          phone: '',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SuperAdmin',
          joinedDate: new Date().toISOString().split('T')[0],
          status: 'Active',
          accessCode: 'spadmin',
          password: 'aamiin'
        };
        setCurrentUser(superadmin);
        localStorage.setItem('maliya_session', JSON.stringify(superadmin));
        return { success: true };
      }

      // 1. Fetch all family members
      const members = await FamilyMemberService.getAll();
      
      // 2. Find the member with matching access code
      const member = members.find(m => m.accessCode?.trim().toLowerCase() === accessCode.trim().toLowerCase());
      
      if (!member) {
        return { success: false, error: 'KODE_NOT_FOUND' };
      }

      // 3. Verify password
      if (member.password !== password) {
        return { success: false, error: 'WRONG_PASSWORD' };
      }

      // 4. Success! Save to state and localStorage
      setCurrentUser(member);
      localStorage.setItem('maliya_session', JSON.stringify(member));
      return { success: true };
    } catch (err: any) {
      console.error('Authentication error:', err);
      return { success: false, error: 'SERVER_ERROR' };
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('maliya_session');
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!currentUser, currentUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
