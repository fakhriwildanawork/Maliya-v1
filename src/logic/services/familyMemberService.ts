import { supabase } from '../libs/supabase';
import { FamilyMember, FamilyMemberInsert } from '../types/familyMembers';

export const FamilyMemberService = {
  async getAll(): Promise<FamilyMember[]> {
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      relationship: item.relationship,
      role: item.role,
      email: item.email,
      phone: item.phone || undefined,
      avatarUrl: item.avatar_url || undefined,
      joinedDate: item.joined_date,
      status: item.status,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      accessCode: item.access_code || undefined,
      password: item.password || undefined
    })) as FamilyMember[];
  },

  async create(member: FamilyMemberInsert): Promise<FamilyMember> {
    const dbPayload = {
      name: member.name,
      relationship: member.relationship,
      role: member.role,
      email: member.email,
      phone: member.phone,
      avatar_url: member.avatarUrl,
      joined_date: member.joinedDate || new Date().toISOString().split('T')[0],
      status: member.status,
      access_code: member.accessCode,
      password: member.password
    };

    const { data, error } = await supabase
      .from('family_members')
      .insert([dbPayload])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      relationship: data.relationship,
      role: data.role,
      email: data.email,
      phone: data.phone || undefined,
      avatarUrl: data.avatar_url || undefined,
      joinedDate: data.joined_date,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      accessCode: data.access_code || undefined,
      password: data.password || undefined
    } as FamilyMember;
  },

  async update(id: string, member: Partial<FamilyMemberInsert>): Promise<FamilyMember> {
    const dbPayload: any = {};
    if (member.name !== undefined) dbPayload.name = member.name;
    if (member.relationship !== undefined) dbPayload.relationship = member.relationship;
    if (member.role !== undefined) dbPayload.role = member.role;
    if (member.email !== undefined) dbPayload.email = member.email;
    if (member.phone !== undefined) dbPayload.phone = member.phone;
    if (member.avatarUrl !== undefined) dbPayload.avatar_url = member.avatarUrl;
    if (member.joinedDate !== undefined) dbPayload.joined_date = member.joinedDate;
    if (member.status !== undefined) dbPayload.status = member.status;
    if (member.accessCode !== undefined) dbPayload.access_code = member.accessCode;
    if (member.password !== undefined) dbPayload.password = member.password;

    const { data, error } = await supabase
      .from('family_members')
      .update(dbPayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      relationship: data.relationship,
      role: data.role,
      email: data.email,
      phone: data.phone || undefined,
      avatarUrl: data.avatar_url || undefined,
      joinedDate: data.joined_date,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      accessCode: data.access_code || undefined,
      password: data.password || undefined
    } as FamilyMember;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};
