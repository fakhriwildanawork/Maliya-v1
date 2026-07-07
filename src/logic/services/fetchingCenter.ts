// Pusat Kontrol Limit Fetching (Sesuai FetchingRule.md)

export const FetchingLimits = {
  DEFAULT: 20,
  
  // Accounts Module
  Wallets: 15,
  CreditCards: 15,
  
  // Transactions Module
  TransactionsList: 25,
  
  // Modul lain di masa depan...
};

// Fungsi helper untuk mendapatkan limit
export const getFetchLimit = (moduleName: keyof typeof FetchingLimits) => {
  return FetchingLimits[moduleName] || FetchingLimits.DEFAULT;
};
