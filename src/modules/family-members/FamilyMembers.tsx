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
        text: 'Nama anggota wajib diisi!',
        confirmButtonColor: '#22c55e'
      });
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Email tidak valid!',
        confirmButtonColor: '#22c55e'
      });
      return;
    }

    if (editingMember) {
      updateFamilyMember({
        ...editingMember,
        name,
        email,
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
        title: 'Berhasil',
        text: 'Data anggota keluarga berhasil diperbarui.',
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      addFamilyMember({
        name,
        email,
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
        title: 'Berhasil',
        text: 'Anggota keluarga baru berhasil didaftarkan.',
        timer: 1500,
        showConfirmButton: false
      });
    }

    setIsModalOpen(false);
  };

  // Handle Delete
  const handleDelete = (member: FamilyMember) => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: `Menghapus ${member.name} dari daftar akses keluarga?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteFamilyMember(member.id);
        Swal.fire({
          title: 'Berhasil!',
          text: 'Anggota keluarga berhasil dihapus.',
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
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Family Members</h1>
            <p className="text-sm text-gray-500 mt-1">
              Daftarkan dan kelola hak akses anggota keluarga Anda ke dalam dashboard keuangan Maliya.
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <PrimaryButton 
              onClick={openAddModal}
              icon={<Plus className="w-4 h-4" />}
              className="w-full sm:w-auto justify-center"
            >
              Tambah Anggota
            </PrimaryButton>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm mb-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama, email, atau telepon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 min-h-[44px] border border-gray-100 rounded-full text-base sm:text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-gray-900"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <span className="text-xs font-semibold text-gray-400 whitespace-nowrap uppercase tracking-wider hidden sm:inline">Peran:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="flex-1 sm:flex-none px-4 py-2 min-h-[44px] border border-gray-100 rounded-full text-base sm:text-sm bg-gray-50 focus:bg-white focus:outline-none transition-all text-gray-900"
            >
              <option value="All">Semua Peran</option>
              <option value="Owner">Owner</option>
              <option value="Admin">Admin</option>
              <option value="Member">Member</option>
              <option value="Viewer">Viewer</option>
            </select>
            <button
              onClick={() => setIsInfoModalOpen(true)}
              className="p-2 min-h-[44px] min-w-[44px] text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors flex items-center justify-center flex-shrink-0"
              title="Informasi Hak Akses & Peran"
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
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-gray-400">Profil Anggota</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-gray-400">Hubungan</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-gray-400">Hak Akses</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-gray-400">Kredensial</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-gray-400">Kontak</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-gray-400">Status</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-gray-400">Tgl Bergabung</th>
                  <th className="py-4 px-6 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400 text-sm">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="w-12 h-12 text-gray-200 mb-2" />
                        <span>Tidak ada anggota keluarga ditemukan.</span>
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
                      <td className="py-4 px-6 text-sm">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span className="font-semibold text-gray-400 whitespace-nowrap">Kode:</span>
                            <span className="font-mono bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded-lg">{member.accessCode || '-'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span className="font-semibold text-gray-400 whitespace-nowrap">Sandi:</span>
                            <span className="font-mono bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded-lg">{member.password || '-'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500">
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1 text-xs">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {member.email}
                          </span>
                          {member.phone && (
                            <span className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              {member.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={cn(
                          "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
                          member.status === 'Active' 
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-amber-50 text-amber-700'
                        )}>
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            member.status === 'Active' ? 'bg-green-500' : 'bg-amber-500'
                          )}></span>
                          {member.status === 'Active' ? 'Aktif' : 'Tertunda'}
                        </span>
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
                            title="Edit Anggota"
                          />
                          <InTableAction
                            variant="delete"
                            icon={Trash2}
                            onClick={() => handleDelete(member)}
                            title="Hapus Anggota"
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
        title="Informasi Hak Akses & Peran Keluarga"
        width="32rem"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            Maliya mendukung pembagian hak akses dalam keluarga untuk memudahkan pengelolaan keuangan bersama secara aman:
          </p>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="font-bold text-gray-900 text-sm block">Owner (Pemilik Utama)</span>
              <span className="text-xs text-gray-500 mt-1 block">Pemilik utama akun, memiliki kontrol mutlak atas seluruh data keuangan dan tidak bisa dihapus dari sistem.</span>
            </div>
            <div className="p-3 bg-red-50/50 rounded-xl border border-red-100">
              <span className="font-bold text-red-900 text-sm block">Admin</span>
              <span className="text-xs text-red-600 mt-1 block font-medium">Memiliki akses penuh untuk mencatat transaksi, mengelola rekening, anggaran, serta menambahkan anggota keluarga lainnya.</span>
            </div>
            <div className="p-3 bg-green-50/50 rounded-xl border border-green-100">
              <span className="font-bold text-green-900 text-sm block">Member</span>
              <span className="text-xs text-green-600 mt-1 block font-medium">Dapat menambahkan transaksi baru, merencanakan target keuangan, dan melihat laporan rangkuman keuangan harian.</span>
            </div>
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
              <span className="font-bold text-blue-900 text-sm block">Viewer</span>
              <span className="text-xs text-blue-600 mt-1 block font-medium">Hanya memiliki hak baca (Read-only). Bisa melihat dasbor, laporan, dan rekening tanpa bisa melakukan perubahan apa pun.</span>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setIsInfoModalOpen(false)}
              className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-sm font-medium transition-colors"
            >
              Mengerti
            </button>
          </div>
        </div>
      </Modal>

      {/* Add / Edit Member Modal using Modal.tsx */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMember ? 'Edit Anggota Keluarga' : 'Daftarkan Anggota Keluarga'}
        width="32rem"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Siti Rahma"
              className="w-full px-4 py-2 min-h-[44px] border border-gray-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white text-gray-900"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email Akses</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Contoh: sitirahma@family.com"
              className="w-full px-4 py-2 min-h-[44px] border border-gray-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white text-gray-900"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">No. Telepon / WhatsApp (Opsional)</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contoh: 081298765432"
              className="w-full px-4 py-2 min-h-[44px] border border-gray-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white text-gray-900"
            />
          </div>

          {/* Grid for credentials (Access Code & Password) */}
          <div className="grid grid-cols-2 gap-4">
            {/* Access Code */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Kode Akses</label>
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Contoh: ACC_123"
                className="w-full px-4 py-2 min-h-11 border border-gray-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white text-gray-900"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Kata Sandi</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kata sandi akses"
                className="w-full px-4 py-2 min-h-11 border border-gray-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white text-gray-900"
              />
            </div>
          </div>

          {/* Grid for relationship & role */}
          <div className="grid grid-cols-2 gap-4">
            {/* Relationship */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Hubungan Keluarga</label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value as any)}
                className="w-full px-4 py-2 min-h-[44px] border border-gray-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white text-gray-900"
              >
                <option value="Parent">Orang Tua</option>
                <option value="Spouse">Pasangan</option>
                <option value="Child">Anak</option>
                <option value="Sibling">Saudara</option>
                <option value="Grandparent">Kakek/Nenek</option>
                <option value="Other">Lainnya</option>
              </select>
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Hak Akses</label>
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

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Status Akses</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-4 py-2 min-h-[44px] border border-gray-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white text-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="Active">Aktif (Bisa Login)</option>
              <option value="Pending">Tertunda (Undangan Dikirim)</option>
            </select>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 bg-gray-50/50 -mx-6 -mb-6 p-6 mt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2 min-h-[44px] text-sm font-medium text-gray-500 hover:text-gray-950 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 min-h-[44px] bg-green-500 hover:bg-green-600 text-white rounded-full text-sm font-medium shadow-sm transition-colors flex items-center gap-1.5"
            >
              <UserCheck2 className="w-4 h-4" />
              Simpan Anggota
            </button>
          </div>
        </form>
      </Modal>
    </div>
    </PageLoadingState>
  );
}
