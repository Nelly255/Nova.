"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, X, Loader2, ChevronDown, Search, PlusCircle, AlertCircle, Wallet, ReceiptText } from "lucide-react";
import { supabase } from "@/lib/supabase";

const DEFAULT_CATEGORIES = [
  "Groceries",
  "Dining Out",
  "Transport",
  "Entertainment",
  "Bills & Utilities",
  "Income / Salary",
  "Bank Charges",
  "Other"
];

export default function AddTransactionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false); 
  const [categorySearch, setCategorySearch] = useState("");
  
  const [accounts, setAccounts] = useState<any[]>([]); 
  // 🚀 DEFAULT SET TO TSh
  const [currencySymbol, setCurrencySymbol] = useState("TSh ");
  
  const [mounted, setMounted] = useState(false);
  
  // 🚀 DEFAULT FALLBACK SET TO TZS
  useEffect(() => {
    setMounted(true);
    const savedCurrency = localStorage.getItem("app_currency") || "TZS"; 
    
    const currencyMap: Record<string, string> = {
      "TZS": "TSh ",
      "KES": "KSh ",
      "UGX": "USh ",
      "RWF": "FRw ",
      "NGN": "₦",
      "ZAR": "R ",
      "EUR": "€",
      "GBP": "£",
      "INR": "₹",
      "USD": "$"
    };
    
    setCurrencySymbol(currencyMap[savedCurrency] || `${savedCurrency} `);
  }, []);

  const [formData, setFormData] = useState({
    title: "",
    amount: "", 
    type: "expense",
    category: "Groceries",
    account_id: "", 
    date: new Date().toISOString().split("T")[0], 
  });

  const [transactionFee, setTransactionFee] = useState("");

  useEffect(() => {
    if (isOpen) {
      const fetchAccounts = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("accounts")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        if (data && data.length > 0) {
          setAccounts(data);
          if (!formData.account_id) {
            setFormData(prev => ({ ...prev, account_id: data[0].id }));
          }
        }
      };
      fetchAccounts();
    }
  }, [isOpen]);

  const selectedAccount = accounts.find(a => a.id === formData.account_id);
  const availableBalance = selectedAccount ? Number(selectedAccount.balance) : 0;

  const isDigitalWallet = selectedAccount && !(
    selectedAccount.type?.toLowerCase() === 'cash' || 
    selectedAccount.name?.toLowerCase().includes('cash') || 
    selectedAccount.name?.toLowerCase().includes('hand')
  );

  const txAmountNum = parseFloat(formData.amount || "0");
  const feeAmountNum = parseFloat(transactionFee || "0");
  const totalDeduction = (formData.type === "expense" ? txAmountNum : 0) + feeAmountNum;
  
  const isInsufficient = totalDeduction > availableBalance;

  const filteredCategories = DEFAULT_CATEGORIES.filter(cat => 
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const isNewCategory = categorySearch.length > 0 && 
    !DEFAULT_CATEGORIES.some(cat => cat.toLowerCase() === categorySearch.toLowerCase());

  const formatAmountForDisplay = (value: string) => {
    if (!value) return "";
    const parts = value.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value.replace(/[^0-9.]/g, "");
    const parts = rawValue.split(".");
    if (parts.length > 2) {
      rawValue = parts[0] + "." + parts.slice(1).join("");
    }
    setFormData({ ...formData, amount: rawValue });
  };

  const handleFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value.replace(/[^0-9.]/g, "");
    const parts = rawValue.split(".");
    if (parts.length > 2) {
      rawValue = parts[0] + "." + parts.slice(1).join("");
    }
    setTransactionFee(rawValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isInsufficient || !formData.account_id) return; 

    setIsLoading(true);
    const txAmount = parseFloat(formData.amount);
    const feeAmount = parseFloat(transactionFee || "0");

    const walletType = selectedAccount?.type || "cash"; 

    const transactionsToInsert = [
      {
        title: formData.title,
        amount: txAmount, 
        type: formData.type,
        category: formData.category,
        account_id: formData.account_id, 
        account_type: walletType, 
        date: formData.date,
      }
    ];

    if (feeAmount > 0 && isDigitalWallet) {
      transactionsToInsert.push({
        title: `${formData.title} (Fee)`,
        amount: feeAmount,
        type: "expense",
        category: "Bank Charges",
        account_id: formData.account_id,
        account_type: walletType, 
        date: formData.date,
      });
    }

    const { error: txError } = await supabase.from("transactions").insert(transactionsToInsert);

    if (txError) {
      console.error("Error saving transaction:", txError.message);
      setIsLoading(false);
      return;
    }

    const newBalance = formData.type === "income" 
      ? availableBalance + txAmount - feeAmount
      : availableBalance - txAmount - feeAmount;

    await supabase
      .from("accounts")
      .update({ balance: newBalance })
      .eq("id", formData.account_id);

    setIsLoading(false);
    setIsOpen(false);
    setIsCategoryOpen(false);
    setIsWalletOpen(false);
    setCategorySearch("");
    setTransactionFee(""); 
    setFormData({ ...formData, title: "", amount: "", type: "expense", category: "Groceries" });
    
    window.dispatchEvent(new Event("transactionUpdated")); 
  };

  const modalButton = (
    <button 
      onClick={() => setIsOpen(true)}
      className="bg-brand-600 hover:bg-brand-500 text-white shadow-[0_8px_20px_-6px_rgb(var(--brand-500)/0.6)] border border-white/20 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 text-xs md:text-sm w-full"
    >
      <Plus size={16} /> <span className="hidden sm:inline">Add Transaction</span><span className="sm:hidden">Add</span>
    </button>
  );

  const modalContent = isOpen && mounted ? createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-0">
      <div 
        className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={() => { setIsOpen(false); setIsCategoryOpen(false); setIsWalletOpen(false); }}
      />

      <div className="relative z-10 w-full max-w-md bg-white dark:bg-[#0A0A0E] rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-slate-200 dark:border-white/10 overflow-visible animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 md:p-8 border-b border-zinc-200/80 dark:border-white/5 shrink-0">
          <div>
            <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">New Entry</h3>
            {selectedAccount ? (
              <p className="text-[10px] uppercase tracking-widest font-bold mt-1 text-zinc-500">
                {selectedAccount.name}: <span className={availableBalance < 0 ? "text-rose-500" : "text-emerald-500"}>{currencySymbol}{availableBalance.toLocaleString()}</span>
              </p>
            ) : (
              <p className="text-[10px] uppercase tracking-widest font-bold text-rose-500 mt-1">No Wallet Found</p>
            )}
          </div>
          <button onClick={() => { setIsOpen(false); setIsCategoryOpen(false); setIsWalletOpen(false); }} className="text-zinc-500 hover:text-rose-500 dark:text-zinc-400 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
          {accounts.length === 0 ? (
             <div className="text-center py-10">
               <Wallet size={40} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
               <p className="text-zinc-500 dark:text-zinc-400 font-bold mb-2">No wallets available</p>
               <p className="text-sm text-zinc-400 dark:text-zinc-500">You need to add a Wallet or Bank Account before you can track transactions.</p>
             </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-3 mb-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "expense" })}
                  className={`py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
                    formData.type === "expense" 
                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]" 
                    : "bg-zinc-50/50 dark:bg-black/20 text-zinc-500 dark:text-zinc-400 border border-zinc-200/80 dark:border-white/5"
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "income" })}
                  className={`py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
                    formData.type === "income" 
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]" 
                    : "bg-zinc-50/50 dark:bg-black/20 text-zinc-500 dark:text-zinc-400 border border-zinc-200/80 dark:border-white/5"
                  }`}
                >
                  Income
                </button>
              </div>

              {/* WALLET DROPDOWN */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">Wallet / Account</label>
                <button 
                  type="button"
                  onClick={() => { setIsWalletOpen(!isWalletOpen); setIsCategoryOpen(false); }}
                  className="w-full flex justify-between items-center bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-white/10 rounded-xl px-4 py-3.5 text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none focus:border-brand-500 transition-colors"
                >
                  <span className="truncate">{selectedAccount?.name || "Select a Wallet"}</span>
                  <ChevronDown size={18} className={`text-zinc-400 shrink-0 transition-transform duration-200 ${isWalletOpen ? 'rotate-180' : ''}`} />
                </button>

                {isWalletOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsWalletOpen(false)} />
                    <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-white/10 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 origin-top duration-200">
                      <div className="max-h-52 overflow-y-auto custom-scrollbar p-1.5">
                        {accounts.map((acc) => (
                          <button
                            key={acc.id}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, account_id: acc.id });
                              setIsWalletOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors flex justify-between items-center ${
                              formData.account_id === acc.id 
                              ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 font-bold' 
                              : 'hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300 font-medium'
                            }`}
                          >
                            <span>{acc.name}</span>
                            <span className="text-xs opacity-60">{currencySymbol}{Number(acc.balance).toLocaleString()}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">Description</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g., Starbucks Coffee"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-white/10 rounded-xl px-4 py-3.5 text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">Amount</label>
                  <input 
                    required
                    type="text" 
                    inputMode="decimal" 
                    placeholder={`${currencySymbol}0.00`}
                    value={formatAmountForDisplay(formData.amount)} 
                    onChange={handleAmountChange} 
                    className={`w-full bg-zinc-50 dark:bg-zinc-950/50 border rounded-xl px-4 py-3.5 text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none transition-colors ${isInsufficient ? 'border-rose-500 ring-1 ring-rose-500' : 'border-zinc-200/80 dark:border-white/10 focus:border-brand-500'}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">Date</label>
                  <input 
                    required
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-white/10 rounded-xl px-4 py-3.5 text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none focus:border-brand-500 [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
              </div>

              {/* TRANSACTION FEE INPUT */}
              {isDigitalWallet && (
                <div className="relative animate-in slide-in-from-top-2 fade-in duration-300">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1">
                    <ReceiptText size={12} /> Bank / M-Pesa Fee <span className="opacity-60 lowercase">(Optional)</span>
                  </label>
                  <input 
                    type="text" 
                    inputMode="decimal" 
                    placeholder={`${currencySymbol}0.00`}
                    value={formatAmountForDisplay(transactionFee)} 
                    onChange={handleFeeChange} 
                    className={`w-full bg-zinc-50 dark:bg-zinc-950/50 border rounded-xl px-4 py-3.5 text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none transition-colors ${isInsufficient ? 'border-rose-500 ring-1 ring-rose-500' : 'border-zinc-200/80 dark:border-white/10 focus:border-brand-500'}`}
                  />
                </div>
              )}

              {/* ERROR MESSAGE FOR INSUFFICIENT FUNDS */}
              {isInsufficient && (
                <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl animate-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="text-rose-500 shrink-0" size={16} />
                  <p className="text-[11px] font-bold text-rose-500 uppercase leading-tight">
                    Insufficient funds! Your {selectedAccount?.name} only has {currencySymbol}{availableBalance.toLocaleString()}.
                  </p>
                </div>
              )}

              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">Category</label>
                <button 
                  type="button"
                  onClick={() => { setIsCategoryOpen(!isCategoryOpen); setIsWalletOpen(false); }}
                  className="w-full flex justify-between items-center bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-white/10 rounded-xl px-4 py-3.5 text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none focus:border-brand-500 transition-colors"
                >
                  <span className="truncate">{formData.category}</span>
                  <ChevronDown size={18} className={`text-zinc-400 shrink-0 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCategoryOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsCategoryOpen(false)} />
                    <div className="absolute left-0 right-0 bottom-full mb-2 z-50 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-white/10 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 origin-bottom duration-200">
                      <div className="p-2 border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-950/50">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                          <input 
                            autoFocus
                            type="text"
                            placeholder="Search or type new..."
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                          />
                        </div>
                      </div>
                      <div className="max-h-52 overflow-y-auto custom-scrollbar p-1.5">
                        {isNewCategory && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, category: categorySearch });
                              setIsCategoryOpen(false);
                              setCategorySearch("");
                            }}
                            className="w-full text-left px-4 py-3 rounded-xl text-sm transition-colors flex items-center gap-2 text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-500/10 font-bold mb-1"
                          >
                            <PlusCircle size={16} /> Create "{categorySearch}"
                          </button>
                        )}
                        {filteredCategories.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, category: cat });
                              setIsCategoryOpen(false);
                              setCategorySearch("");
                            }}
                            className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors ${
                              formData.category === cat 
                              ? 'bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white font-bold' 
                              : 'hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300 font-medium'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button 
                type="submit" 
                disabled={isLoading || isInsufficient || !formData.account_id}
                className={`w-full shrink-0 text-white border border-white/20 transition-all duration-300 font-bold py-4 rounded-xl mt-6 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
                  isInsufficient || !formData.account_id
                  ? 'bg-rose-600 shadow-[0_4px_14px_rgba(244,63,94,0.4)] grayscale-[0.5]' 
                  : 'bg-brand-600 hover:bg-brand-500 hover:-translate-y-0.5 active:scale-95 shadow-[0_4px_14px_rgb(var(--brand-500)/0.4)]'
                }`}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : isInsufficient ? (
                  "Insufficient Funds"
                ) : !formData.account_id ? (
                  "Select a Wallet"
                ) : (
                  "Save Transaction"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  , document.body) : null;

  return (
    <>
      {modalButton}
      {modalContent}
    </>
  );
}