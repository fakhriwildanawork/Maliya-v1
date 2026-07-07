import { useFinance } from '../context/FinanceContext';

export function useFamilyMembers() {
  const { 
    familyMembers, 
    loading, 
    addFamilyMember, 
    updateFamilyMember, 
    deleteFamilyMember, 
    fetchFamilyMembers 
  } = useFinance();

  return {
    familyMembers,
    loading,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    fetchFamilyMembers
  };
}
