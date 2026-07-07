export interface FamilyMember {
  id: string;
  name: string;
  relationship: 'Parent' | 'Spouse' | 'Child' | 'Sibling' | 'Grandparent' | 'Other';
  role: 'Owner' | 'Admin' | 'Member' | 'Viewer';
  email: string;
  phone?: string;
  avatarUrl?: string;
  joinedDate: string;
  status: 'Active' | 'Pending';
  createdAt?: string;
  updatedAt?: string;
  accessCode?: string;
  password?: string;
}

export type FamilyMemberInsert = Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>;
