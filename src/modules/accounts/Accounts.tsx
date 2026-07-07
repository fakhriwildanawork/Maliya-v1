import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ArrowUpRight, ArrowDownLeft, Search } from 'lucide-react';
import { Wallet, CreditCard } from '../../logic/types/accounts';
import { getCardThemeClasses, getCardThemeGlow } from '../../logic/utils/theme';
import Modal from '../../ui/components/common/Modal';
import { PrimaryButton } from '../../ui/components/elements/PrimaryButton';
import AccountForm from './components/AccountForm';
import CardForm from './components/CardForm';
import { useNavigation } from '../../logic/context/NavigationContext';
import { useFinance } from '../../logic/context/FinanceContext';
import { useModuleLoading } from '../../logic/hooks/useModuleLoading';
import * as TOKENS from '../../ui/styles/tokens';
import { cn } from '../../logic/utils/classNames';
import { InTableAction } from '../../ui/components/elements/InTableAction';
import { AccountService } from '../../logic/services/accountService';
import { PageLoadingState } from '../../ui/components/common/PageLoadingState';

export default function Accounts() {
  const { setActiveRoute, setRouteParam } = useNavigation();
  const loading = useModuleLoading();
  const { 
    wallets, 
    cards, 
    investments,
    debts,
    assets,
    addWallet: handleAddWallet,
    updateWallet: handleUpdateWallet,
    deleteWallet: handleDeleteWallet,
    addCard: handleAddCard,
    updateCard: handleUpdateCard,
    deleteCard: handleDeleteCard,
  } = useFinance();
  
  // 1. Calculations
  const walletBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
  const creditCardDebt = cards.reduce((sum, c) => sum + c.balance, 0); // Credit card balance is debt
  const investmentValue = investments?.reduce((sum, inv) => sum + inv.currentValue, 0) || 0;
  
  // Receivables (Piutang aktif: amount - paidAmount)
  const receivablesValue = debts
    ?.filter(d => d.type === 'receivable' && d.status === 'active')
    .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0) || 0;

  const totalFinancialAssets = walletBalance + investmentValue + receivablesValue;

  // Physical Assets value
  const totalPhysicalAssets = assets?.reduce((sum, as) => sum + as.currentValue, 0) || 0;

  const totalAssetsValue = totalFinancialAssets + totalPhysicalAssets;

  // Liabilities (Hutang aktif + Credit Cards)
  const debtsValue = debts
    ?.filter(d => d.type === 'payable' && d.status === 'active')
    .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0) || 0;
    
  const totalLiabilitiesValue = debtsValue + creditCardDebt;

  const netWorth = totalAssetsValue - totalLiabilitiesValue;
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isWalletFormOpen, setIsWalletFormOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);

  const [isCardFormOpen, setIsCardFormOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);

  const filteredWallets = wallets.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredCards = cards.filter(c => 
    c.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const initialLoading = false; // We can use a better logic here if needed, but for now false to avoid flickering

  // --- Wallet Handlers ---
  const handleAddWalletClick = () => {
    setSelectedWallet(null);
    setIsWalletFormOpen(true);
  };

  const handleWalletClick = (wallet: Wallet) => {
    setRouteParam(wallet.id);
    setActiveRoute('account-details');
  };

  const handleEditWalletClick = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setIsWalletFormOpen(true);
  };

  const handleDeleteWalletClick = (wallet: Wallet) => {
    import('sweetalert2').then((Swal) => {
      Swal.default.fire({
        title: 'Are you sure?',
        text: `You want to delete the account "${wallet.name}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#EF4444',
        confirmButtonText: 'Yes, delete it!',
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await handleDeleteWallet(wallet.id);
            Swal.default.fire(
              'Deleted!',
              'The account has been deleted.',
              'success'
            );
          } catch (error) {
            Swal.default.fire('Error', 'Failed to delete account.', 'error');
          }
        }
      });
    });
  };

  const handleWalletFormSubmit = async (data: Partial<Wallet>) => {
    try {
      if (selectedWallet) {
        await handleUpdateWallet({ ...selectedWallet, ...data });
      } else {
        await handleAddWallet(data);
      }
      setIsWalletFormOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  // --- Card Handlers ---
  const handleAddCardClick = () => {
    setSelectedCard(null);
    setIsCardFormOpen(true);
  };

  const handleCardClick = (card: CreditCard) => {
    setRouteParam(card.id);
    setActiveRoute('card-details');
  };

  const handleEditCardClick = (card: CreditCard) => {
    setSelectedCard(card);
    setIsCardFormOpen(true);
  };

  const handleDeleteCardClick = (card: CreditCard) => {
    import('sweetalert2').then((Swal) => {
      Swal.default.fire({
        title: 'Are you sure?',
        text: `You want to delete the card ending in ${card.number.slice(-4)}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#EF4444',
        confirmButtonText: 'Yes, delete it!',
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await handleDeleteCardClick_direct(card.id);
            Swal.default.fire(
              'Deleted!',
              'The card has been deleted.',
              'success'
            );
          } catch (error) {
            Swal.default.fire('Error', 'Failed to delete card.', 'error');
          }
        }
      });
    });
  };

  const handleDeleteCardClick_direct = async (id: string) => {
    await handleDeleteCard(id);
  };

  const handleCardFormSubmit = async (data: Partial<CreditCard>) => {
    try {
      if (selectedCard) {
        await handleUpdateCard({ ...selectedCard, ...data });
      } else {
        await handleAddCard(data);
      }
      setIsCardFormOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <PageLoadingState isLoading={loading}>
      <div className="absolute inset-0 flex flex-col bg-gray-50 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Accounts & Wallets</h1>
            <p className="text-sm md:text-base text-gray-500">Manage your connected accounts, credit cards, and limits.</p>
          </div>
          <PrimaryButton 
            onClick={handleAddWalletClick}
            icon={<Plus className="w-5 h-5" />}
            className="w-full sm:w-auto justify-center"
          >
            Add Account
          </PrimaryButton>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-50">
             <div className="flex justify-between items-start mb-2 md:mb-4">
                <span className="text-xs md:text-sm text-gray-500 font-medium">Total Assets</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 truncate">Rp {totalAssetsValue.toLocaleString('id-ID')}</h2>
              <div className="flex items-center gap-2 text-xs md:text-sm">
                <span className="text-green-500 font-medium flex items-center bg-green-50 px-2 py-0.5 rounded-md">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  12%
                </span>
              </div>
          </div>
          <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-50">
             <div className="flex justify-between items-start mb-2 md:mb-4">
                <span className="text-xs md:text-sm text-gray-500 font-medium">Total Liabilities</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 truncate">Rp {totalLiabilitiesValue.toLocaleString('id-ID')}</h2>
              <div className="flex items-center gap-2 text-xs md:text-sm">
                <span className="text-red-500 font-medium flex items-center bg-red-50 px-2 py-0.5 rounded-md">
                  <ArrowDownLeft className="w-3 h-3 mr-1" />
                  3%
                </span>
              </div>
          </div>
          <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-50 sm:col-span-2 lg:col-span-1">
             <div className="flex justify-between items-start mb-2 md:mb-4">
                <span className="text-xs md:text-sm text-gray-500 font-medium">Net Worth</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 truncate">Rp {netWorth.toLocaleString('id-ID')}</h2>
              <div className="flex items-center gap-2 text-xs md:text-sm">
                <span className="text-green-500 font-medium flex items-center bg-green-50 px-2 py-0.5 rounded-md">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  5%
                </span>
              </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          <div className="lg:col-span-8 flex flex-col gap-4 md:gap-6">
            <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
                <h3 className="font-semibold text-gray-900 text-base md:text-lg">Active Wallets</h3>
                <div className="relative w-full sm:w-auto">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search wallets" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={cn(
                      "pl-9 pr-4 py-2 min-h-[44px] border border-gray-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-full sm:w-auto",
                      TOKENS.RADIUS_PILL
                    )}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredWallets.map((wallet) => (
                  <div 
                    key={wallet.id} 
                    onClick={() => handleWalletClick(wallet)}
                    className={cn(
                      "bg-gray-50 p-4 md:p-5 border border-gray-100 flex flex-col relative hover:shadow-md transition-shadow cursor-pointer group",
                      TOKENS.RADIUS_CARD
                    )}
                  >
                    <div className="flex justify-between items-start mb-3 md:mb-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <span className="block font-bold text-gray-900 text-sm md:text-base line-clamp-1">{wallet.name}</span>
                          <span className="text-xs text-gray-500">{wallet.status}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <InTableAction
                          variant="edit"
                          icon={Edit2}
                          onClick={(e) => { e.stopPropagation(); handleEditWalletClick(wallet); }}
                          title="Edit Account"
                        />
                        <InTableAction
                          variant="delete"
                          icon={Trash2}
                          onClick={(e) => { e.stopPropagation(); handleDeleteWalletClick(wallet); }}
                          title="Delete Account"
                        />
                      </div>
                    </div>
                    <div className="mt-auto">
                      <span className="text-xl md:text-2xl font-bold text-gray-900 mb-1 block truncate">Rp {wallet.balance.toLocaleString('id-ID')}</span>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 md:mt-3 mb-1 overflow-hidden">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${Math.min((wallet.balance / (wallet.limit || 1)) * 100, 100)}%` }}></div>
                      </div>
                      <span className="text-[10px] md:text-xs text-gray-400 block truncate">Limit: Rp {wallet.limit.toLocaleString('id-ID')} / month</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-4 md:gap-6">
             <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-50 flex-1">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className="font-semibold text-gray-900 text-base md:text-lg">Connected Cards</h3>
              </div>
              <div className="flex flex-col gap-4">
                {filteredCards.map((card) => (
                  <div 
                    key={card.id} 
                    onClick={() => handleCardClick(card)}
                    className={cn(
                      "w-full h-40 md:h-44 p-4 md:p-5 flex flex-col justify-between relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow group",
                      getCardThemeClasses(card.theme),
                      TOKENS.RADIUS_CARD
                    )}
                  >
                    {card.theme !== 'dark' && (
                      <>
                        <div className={`absolute top-0 right-0 w-32 h-32 opacity-20 rounded-full blur-2xl -mr-10 -mt-10 ${getCardThemeGlow(card.theme).top}`}></div>
                        <div className={`absolute bottom-0 left-0 w-24 h-24 opacity-20 rounded-full blur-xl -ml-5 -mb-5 ${getCardThemeGlow(card.theme).bottom}`}></div>
                      </>
                    )}
                    
                    <div className="flex justify-between items-start relative z-10">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/20 flex items-center justify-center">
                           <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-white rounded-full"></div>
                        </span>
                        <span className="text-[10px] md:text-xs font-medium px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">{card.status}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <InTableAction
                          variant="custom"
                          icon={Edit2}
                          onClick={(e) => { e.stopPropagation(); handleEditCardClick(card); }}
                          className="text-white/70 hover:text-white hover:bg-white/10"
                          title="Edit Card"
                        />
                        <InTableAction
                          variant="delete"
                          icon={Trash2}
                          onClick={(e) => { e.stopPropagation(); handleDeleteCardClick(card); }}
                          className="text-red-400 hover:text-red-500 hover:bg-white/10"
                          title="Delete Card"
                        />
                      </div>
                    </div>

                    <div className="relative z-10 mt-auto">
                      <div className="flex justify-between mb-1 md:mb-2">
                        <span className="opacity-70 text-[10px] md:text-xs">Card Number</span>
                        <span className="opacity-70 text-[10px] md:text-xs">EXP</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="tracking-widest text-xs md:text-sm">{card.number || '•••• •••• •••• ••••'}</span>
                        <span className="text-xs md:text-sm">{card.exp || '••/••'}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={handleAddCardClick}
                  className={cn(
                    "w-full h-36 md:h-40 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 transition-all",
                    TOKENS.RADIUS_CARD
                  )}
                >
                  <Plus className="w-6 h-6 md:w-8 md:h-8 mb-2" />
                  <span className="font-medium text-xs md:text-sm">Add New Card</span>
                </button>
              </div>
             </div>
          </div>
        </div>
      </main>

      {/* Wallet Modals */}
      <Modal 
        isOpen={isWalletFormOpen} 
        onClose={() => setIsWalletFormOpen(false)}
        title={selectedWallet ? "Edit Account" : "Add New Account"}
      >
        <AccountForm 
          initialData={selectedWallet} 
          onSubmit={handleWalletFormSubmit} 
          onCancel={() => setIsWalletFormOpen(false)} 
        />
      </Modal>

      {/* Card Modals */}
      <Modal 
        isOpen={isCardFormOpen} 
        onClose={() => setIsCardFormOpen(false)}
        title={selectedCard ? "Edit Card" : "Add New Card"}
      >
        <CardForm 
          initialData={selectedCard} 
          onSubmit={handleCardFormSubmit} 
          onCancel={() => setIsCardFormOpen(false)} 
        />
      </Modal>
    </div>
    </PageLoadingState>
  );
}
