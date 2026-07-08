import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Mail, 
  Phone, 
  Shield, 
  Calendar, 
  UserCheck, 
  Plus, 
  X, 
  Edit2, 
  Trash2, 
  ShieldAlert,
  UserCheck2,
  Info
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useFinance } from '../../logic/context/FinanceContext';
import { useModuleLoading } from '../../logic/hooks/useModuleLoading';
import { FamilyMember } from '../../logic/types/finance';
import { PrimaryButton } from '../../ui/components/elements/PrimaryButton';
import { InTableAction } from '../../ui/components/elements/InTableAction';
import Modal from '../../ui/components/common/Modal';
import { PageLoadingState } from '../../ui/components/common/PageLoadingState';
import { cn } from '../../logic/utils/classNames';

export default function FamilyMembers() {
  const loading = useModuleLoading();
  const { familyMembers, addFamilyMember, updateFamilyMember, deleteFamilyMember, fetchFamilyMembers } = useFinance();
  
  useEffect(() => {
    fetchFamilyMembers();
  }, [fetchFamilyMembers]);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState<FamilyMember['relationship']>('Other');
  const [role, setRole] = useState<FamilyMember['role']>('Member');
  const [status, setStatus] = useState<FamilyMember['status']>('Active');
  const [accessCode, setAccessCode] = useState('');
  const [password, setPassword] = useState('');

  // Filter & Search
  const filteredMembers = useMemo(() => {
    return familyMembers.filter((m) => {
      const matchesSearch = 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.phone && m.phone.includes(searchQuery));
      const matchesRole = roleFilter === 'All' || m.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [familyMembers, searchQuery, roleFilter]);

  // Handle Open Modal
  const openAddModal = () => {
    setEditingMember(null);
    setName('');
    setEmail('');
    setPhone('');
    setRelationship('Other');
    setRole('Member');
    setStatus('Active');
    setAccessCode('');
    setPassword('');
    setIsModalOpen(true);
  };

  const openEditModal = (member: FamilyMember) => {
    setEditingMember(member);
    setName(member.name);
    setEmail(member.email);
    setPhone(member.phone || '');
    setRelationship(member.relationship);
    setRole(member.role);
    setStatus(member.status);
    setAccessCode(member.accessCode || '');
    setPassword(member.password || '');
    setIsModalOpen(true);
  };

  // Handle Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Member name is required!',
        confirmButtonColor: '#22c55e'
      });
      return;
    }

    const finalEmail = email.trim() ? email : `${name.replace(/\s+/g, '').toLowerCase()}_${Date.now()}@family.com`;

    if (editingMember) {
      updateFamilyMember({
        ...editingMember,
        name,
        email: finalEmail,
        phone,
        relationship,
        role,
        status,
        accessCode,
        password,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
      });
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Family member data successfully updated.',
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      addFamilyMember({
        name,
        email: finalEmail,
        phone,
        relationship,
        role,
        status,
        accessCode,
        password,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
      });
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'New family member successfully registered.',
        timer: 1500,
        showConfirmButton: false
      });
    }

    setIsModalOpen(false);
  };

  // Handle Delete
  const handleDelete = (member: FamilyMember) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Remove ${member.name} from family access list?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, remove!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteFamilyMember(member.id);
        Swal.fire({
          title: 'Success!',
          text: 'Family member successfully removed.',
          icon: 'success',
          confirmButtonColor: '#22c55e'
        });
      }
    });
  };

  // Helper styles for UI elements using REM and Tailwind utility
  const getRelationshipColor = (rel: FamilyMember['relationship']) => {
    switch (rel) {
      case 'Parent': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Spouse': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Child': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Sibling': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'Grandparent': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const getRoleBadge = (role: FamilyMember['role']) => {
    switch (role) {
      case 'Owner': return 'bg-gray-900 text-white border-transparent';
      case 'Admin': return 'bg-red-50 text-red-700 border-red-100';
      case 'Member': return 'bg-green-50 text-green-700 border-green-100';
      case 'Viewer': return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  return (
    <PageLoadingState isLoading={loading}>
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-gray-50">
      <div className="flex-1 p-4 md:p-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-gray-500 mt-1">
              Register and manage your family members' access rights to the financial dashboard.
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <PrimaryButton 
              onClick={openAddModal}
              icon={<Plus className="w-4 h-4" />}
              className="w-full sm:w-auto justify-center"
            >
              Add Member
            </PrimaryButton>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm mb-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 min-h-[44px] border border-gray-100 rounded-full text-base sm:text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-gray-900"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <span className="text-xs font-semibold text-gray-400 whitespace-nowrap uppercase tracking-wider hidden sm:inline">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="flex-1 sm:flex-none px-4 py-2 min-h-[44px] border border-gray-100 rounded-full text-base sm:text-sm bg-gray-50 focus:bg-white focus:outline-none transition-all text-gray-900"
            >
              <option value="All">All Roles</option>
              <option value="Owner">Owner</option>
              <option value="Admin">Admin</option>
              <option value="Member">Member</option>
              <option value="Viewer">Viewer</option>
            </select>
            <button
              onClick={() => setIsInfoModalOpen(true)}
              className="p-2 min-h-[44px] min-w-[44px] text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors flex items-center justify-center flex-shrink-0"
              title="Access Rights & Roles Information"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table List */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-gray-400">Member Profile</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-gray-400">Relationship</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-gray-400">Access Right</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-gray-400">Date Joined</th>
                  <th className="py-4 px-6 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400 text-sm">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="w-12 h-12 text-gray-200 mb-2" />
                        <span>No family members found.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img 
                            src={member.avatarUrl} 
                            alt={member.name} 
                            className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="font-semibold text-gray-900 block leading-tight">{member.name}</span>
                            <span className="text-xs text-gray-400 mt-1 block leading-none">{member.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={cn(
                          "px-2.5 py-1 text-xs font-semibold rounded-full border",
                          getRelationshipColor(member.relationship)
                        )}>
                          {member.relationship}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            "px-2.5 py-1 text-xs font-semibold rounded-full border flex items-center gap-1",
                            getRoleBadge(member.role)
                          )}>
                            <Shield className="w-3 h-3" />
                            {member.role}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-500">
                        {member.joinedDate}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <InTableAction
                            variant="edit"
                            icon={Edit2}
                            onClick={() => openEditModal(member)}
                            title="Edit Member"
                          />
                          <InTableAction
                            variant="delete"
                            icon={Trash2}
                            onClick={() => handleDelete(member)}
                            title="Remove Member"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Info Modal for Role Descriptions */}
      <Modal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title="Access Rights & Roles Information"
        width="32rem"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            Maliya supports dividing access rights within the family to facilitate secure joint financial management:
          </p>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="font-bold text-gray-900 text-sm block">Owner (Main Owner)</span>
              <span className="text-xs text-gray-500 mt-1 block">Main account owner, has absolute control over all financial data and cannot be removed from the system.</span>
            </div>
            <div className="p-3 bg-red-50/50 rounded-xl border border-red-100">
              <span className="font-bold text-red-900 text-sm block">Admin</span>
              <span className="text-xs text-red-600 mt-1 block font-medium">Has full access to record transactions, manage accounts, budgets, and add other family members.</span>
            </div>
            <div className="p-3 bg-green-50/50 rounded-xl border border-green-100">
              <span className="font-bold text-green-900 text-sm block">Member</span>
              <span className="text-xs text-green-600 mt-1 block font-medium">Can add new transactions, plan financial goals, and view daily financial summary reports.</span>
            </div>
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
              <span className="font-bold text-blue-900 text-sm block">Viewer</span>
              <span className="text-xs text-blue-600 mt-1 block font-medium">Read-only access. Can view the dashboard, reports, and accounts without making any changes.</span>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setIsInfoModalOpen(false)}
              className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-sm font-medium transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </Modal>

      {/* Add / Edit Member Modal using Modal.tsx */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMember ? 'Edit Family Member' : 'Register Family Member'}
        width="32rem"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Siti Rahma"
              className="w-full px-4 py-2 min-h-[44px] border border-gray-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white text-gray-900"
            />
          </div>

          {/* Grid for credentials (Access Code & Password) */}
          <div className="grid grid-cols-2 gap-4">
            {/* Access Code */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Access Code</label>
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="e.g. ACC_123"
                className="w-full px-4 py-2 min-h-11 border border-gray-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white text-gray-900"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Access password"
                className="w-full px-4 py-2 min-h-11 border border-gray-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white text-gray-900"
              />
            </div>
          </div>

          {/* Grid for relationship & role */}
          <div className="grid grid-cols-2 gap-4">
            {/* Relationship */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Family Relationship</label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value as any)}
                className="w-full px-4 py-2 min-h-[44px] border border-gray-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white text-gray-900"
              >
                <option value="Parent">Parent</option>
                <option value="Spouse">Spouse</option>
                <option value="Child">Child</option>
                <option value="Sibling">Sibling</option>
                <option value="Grandparent">Grandparent</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Access Right</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-4 py-2 min-h-[44px] border border-gray-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white text-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="Owner">Owner</option>
                <option value="Admin">Admin</option>
                <option value="Member">Member</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 bg-gray-50/50 -mx-6 -mb-6 p-6 mt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2 min-h-[44px] text-sm font-medium text-gray-500 hover:text-gray-950 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 min-h-[44px] bg-green-500 hover:bg-green-600 text-white rounded-full text-sm font-medium shadow-sm transition-colors flex items-center gap-1.5"
            >
              <UserCheck2 className="w-4 h-4" />
              Save Member
            </button>
          </div>
        </form>
      </Modal>
    </div>
    </PageLoadingState>
  );
}
