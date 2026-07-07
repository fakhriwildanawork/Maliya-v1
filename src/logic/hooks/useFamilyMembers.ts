import { useState, useEffect, useCallback } from 'react';
import { FamilyMember, FamilyMemberInsert } from '../types/familyMembers';
import { FamilyMemberService } from '../services/familyMemberService';

export function useFamilyMembers() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFamilyMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await FamilyMemberService.getAll();
      setFamilyMembers(data);
    } catch (err: any) {
      setError(err);
      console.error('Failed to fetch family members', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFamilyMembers();
  }, [fetchFamilyMembers]);

  const addFamilyMember = async (member: FamilyMemberInsert) => {
    const newMember = await FamilyMemberService.create(member);
    setFamilyMembers(prev => [...prev, newMember]);
    return newMember;
  };

  const updateFamilyMember = async (id: string, updates: Partial<FamilyMemberInsert>) => {
    const updated = await FamilyMemberService.update(id, updates);
    const data = await FamilyMemberService.getAll();
    setFamilyMembers(data);
    return updated;
  };

  const deleteFamilyMember = async (id: string) => {
    await FamilyMemberService.delete(id);
    setFamilyMembers(prev => prev.filter(m => m.id !== id));
  };

  return {
    familyMembers,
    loading,
    error,
    fetchFamilyMembers,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember
  };
}
