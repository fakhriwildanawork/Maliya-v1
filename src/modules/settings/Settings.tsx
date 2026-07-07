import React, { useState } from 'react';
import { Database, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PageLoadingState } from '../../ui/components/common/PageLoadingState';
import { useModuleLoading } from '../../logic/hooks/useModuleLoading';

export default function Settings() {
  const loading = useModuleLoading();
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');

  const handleSyncDatabase = async () => {
    setSyncing(true);
    setSyncStatus('idle');
    setSyncMessage('');

    try {
      const response = await fetch('/api/sync-database', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSyncStatus('success');
        setSyncMessage(data.message || 'Database synchronized successfully.');
      } else {
        setSyncStatus('error');
        setSyncMessage(data.error || 'Failed to synchronize database.');
      }
    } catch (error: any) {
      setSyncStatus('error');
      setSyncMessage(error.message || 'An unexpected error occurred.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <PageLoadingState isLoading={syncing || loading}>
      <div className="flex-1 flex flex-col min-h-0 bg-white relative">
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
            <p className="text-sm text-gray-500 mt-2">Manage your application preferences and system settings.</p>
          </div>

          <div className="space-y-6">
            {/* Database Sync Section */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
                  <Database className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Database Synchronization</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Automatically synchronize all SQL files to your Supabase database. This will create new tables or update existing ones (idempotent setup).
                  </p>
                  
                  <div className="mt-4">
                    <button
                      onClick={handleSyncDatabase}
                      disabled={syncing}
                      className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-full font-medium transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                      {syncing ? 'Synchronizing...' : 'Sync Database Now'}
                    </button>
                  </div>

                  {syncStatus === 'success' && (
                    <div className="mt-4 flex items-start gap-2 text-green-600 bg-green-50 p-3 rounded-xl border border-green-100">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">{syncMessage}</span>
                    </div>
                  )}

                  {syncStatus === 'error' && (
                    <div className="mt-4 flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">{syncMessage}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Other settings can be added here */}
          </div>
        </div>
      </div>
    </div>
    </PageLoadingState>
  );
}
