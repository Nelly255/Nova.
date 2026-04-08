"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";
import { X, Loader2, Wallet, Smartphone, Landmark, Banknote, PlusCircle, ChevronDown, Check } from "lucide-react";

const MOBILE_PROVIDERS = [
  { id: 'm-pesa', label: 'Vodacom M-Pesa' },
  { id: 'tigo-pesa', label: 'Tigo Pesa' },
  { id: 'airtel-money', label: 'Airtel Money' },
  { id: 'halopesa', label: 'HaloPesa' },
  { id: 'selcom', label: 'Selcom Pay' },
  { id: 'other-mobile', label: 'Other Mobile Wallet' }
];

const BANK_PROVIDERS = [
  { id: 'crdb', label: 'CRDB Bank' },
  { id: 'nmb', label: 'NMB Bank' },
  { id: 'other-bank', label: 'Other Bank Account' }
];

export default function AddWalletModal({ children, onSuccess }: { children: React.ReactNode, onSuccess?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const [accountType, setAccountType] = useState<'mobile' | 'bank' | 'cash'>('mobile');
  
  const [formData, setFormData] = useState({
    name: "",
    provider: "m-pesa",
    balance: ""
  });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (accountType === 'mobile') setFormData(prev => ({ ...prev, provider: 'm-pesa' }));
    else if (accountType === 'bank') setFormData(prev => ({ ...prev, provider: 'crdb' }));
    else if (accountType === 'cash') setFormData(prev => ({ ...prev, provider: 'cash' }));
    
    setIsSelectOpen(false);
  }, [accountType]);

  const currentProviders = accountType === 'mobile' ? MOBILE_PROVIDERS : BANK_PROVIDERS;
  const activeProviderLabel = currentProviders.find(p => p.id === formData.provider)?.label || "Select Provider";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase.from('accounts').insert([{
        user_id: user.id,
        name: formData.name,
        provider: formData.provider,
        type: accountType === 'mobile' ? 'digital' : accountType,
        balance: parseFloat(formData.balance.replace(/,/g, '') || "0")
      }]);

      if (error) throw error;

      setIsOpen(false);
      setFormData({ name: "", provider: "m-pesa", balance: "" });
      setAccountType('mobile');
      if (onSuccess) onSuccess();

    } catch (error: any) {
      console.error("Error adding wallet:", error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmountForDisplay = (value: string) => {
    if (!value) return "";
    const parts = value.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value.replace(/[^0-9.]/g, "");
    const parts = rawValue.split(".");
    if (parts.length > 2) rawValue = parts[0] + "." + parts.slice(1).join("");
    setFormData({ ...formData, balance: rawValue });
  };

  const modalContent = mounted && isOpen ? createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0A0A0E] dark:border dark:border-white/10 rounded-[2rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden animate-in zoom-in-95 duration-300">
        
        <div className="overflow-y-auto custom-scrollbar p-6 md:p-10 relative">
          
          <button 
            onClick={() => setIsOpen(false)} 
            className="absolute top-6 right-6 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 p-2.5 rounded-full transition-all"
          >
            <X size={20} />
          </button>

          <div className="text-center mb-8 mt-2">
            <div className="w-14 h-14 bg-[#F3E8FF] dark:bg-[#8B5CF6]/10 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm border border-[#E9D5FF] dark:border-[#8B5CF6]/20 transition-colors">
              <Wallet size={24} className="text-[#8B5CF6] dark:text-[#A78BFA]" />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] dark:text-white mb-2 tracking-tight transition-colors">Add New Wallet</h2>
            <p className="text-[#64748B] dark:text-slate-400 font-medium text-sm transition-colors">Track your exact balances across M-Pesa, banks, and cash.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            
            {/* Step 1: Account Type */}
            <div>
              <label className="block text-xs md:text-sm font-bold text-[#0F172A] dark:text-slate-200 mb-3 transition-colors">1. Account Type</label>
              <div className="grid grid-cols-3 gap-2 md:gap-4">
                <button
                  type="button"
                  onClick={() => setAccountType('mobile')}
                  className={`py-3 md:py-6 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${
                    accountType === 'mobile' 
                    ? 'border-[#8B5CF6] dark:border-[#8B5CF6]/50 bg-[#F5F3FF] dark:bg-[#8B5CF6]/10 text-[#8B5CF6] dark:text-[#A78BFA] shadow-sm' 
                    : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/10'
                  }`}
                >
                  <Smartphone size={22} className={accountType === 'mobile' ? 'text-[#8B5CF6] dark:text-[#A78BFA]' : 'text-slate-400 dark:text-slate-500'} />
                  <span className="text-[10px] md:text-xs font-bold text-center">Mobile Money</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('bank')}
                  className={`py-3 md:py-6 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${
                    accountType === 'bank' 
                    ? 'border-[#8B5CF6] dark:border-[#8B5CF6]/50 bg-[#F5F3FF] dark:bg-[#8B5CF6]/10 text-[#8B5CF6] dark:text-[#A78BFA] shadow-sm' 
                    : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/10'
                  }`}
                >
                  <Landmark size={22} className={accountType === 'bank' ? 'text-[#8B5CF6] dark:text-[#A78BFA]' : 'text-slate-400 dark:text-slate-500'} />
                  <span className="text-[10px] md:text-xs font-bold text-center">Bank</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('cash')}
                  className={`py-3 md:py-6 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${
                    accountType === 'cash' 
                    ? 'border-[#8B5CF6] dark:border-[#8B5CF6]/50 bg-[#F5F3FF] dark:bg-[#8B5CF6]/10 text-[#8B5CF6] dark:text-[#A78BFA] shadow-sm' 
                    : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/10'
                  }`}
                >
                  <Wallet size={22} className={accountType === 'cash' ? 'text-[#8B5CF6] dark:text-[#A78BFA]' : 'text-slate-400 dark:text-slate-500'} />
                  <span className="text-[10px] md:text-xs font-bold text-center">Cash</span>
                </button>
              </div>
            </div>

            {/* Step 2: Select Provider (Only show if not Cash) */}
            {accountType !== 'cash' && (
              <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs md:text-sm font-bold text-[#0F172A] dark:text-slate-200 mb-3 transition-colors">2. Select Provider</label>
                
                <button 
                  type="button"
                  onClick={() => setIsSelectOpen(!isSelectOpen)}
                  className={`w-full flex justify-between items-center bg-white dark:bg-white/5 border rounded-xl px-4 py-3.5 text-slate-900 dark:text-white font-medium transition-all text-sm md:text-base ${
                    isSelectOpen 
                    ? 'border-[#8B5CF6] ring-1 ring-[#8B5CF6] dark:border-[#8B5CF6]/50 dark:ring-[#8B5CF6]/50' 
                    : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  <span>{activeProviderLabel}</span>
                  <ChevronDown size={18} className={`text-slate-400 transition-transform duration-200 ${isSelectOpen ? 'rotate-180' : ''}`} />
                </button>

                {isSelectOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsSelectOpen(false)} />
                    
                    <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white dark:bg-[#1A1A24] border border-slate-100 dark:border-white/10 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 origin-top duration-200">
                      <div className="max-h-60 overflow-y-auto custom-scrollbar p-1.5">
                        {currentProviders.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => { 
                              setFormData({ ...formData, provider: p.id }); 
                              setIsSelectOpen(false); 
                            }}
                            className={`w-full text-left px-4 py-3.5 rounded-xl text-sm transition-colors flex items-center justify-between ${
                              formData.provider === p.id 
                              ? 'bg-[#F5F3FF] dark:bg-[#8B5CF6]/10 text-[#8B5CF6] dark:text-[#A78BFA] font-bold' 
                              : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 font-medium'
                            }`}
                          >
                            <span>{p.label}</span>
                            {formData.provider === p.id && <Check size={18} className="text-[#8B5CF6] dark:text-[#A78BFA]" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 3: Name & Balance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-xs md:text-sm font-bold text-[#0F172A] dark:text-slate-200 mb-2 md:mb-3 transition-colors">Account Name</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Main M-Pesa"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#8B5CF6] dark:focus:border-[#8B5CF6]/80 focus:ring-1 focus:ring-[#8B5CF6] transition-all text-sm md:text-base"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-bold text-[#0F172A] dark:text-slate-200 mb-2 md:mb-3 transition-colors">Current Balance (TZS)</label>
                <input 
                  required
                  type="text" 
                  inputMode="decimal"
                  placeholder="0.00"
                  value={formatAmountForDisplay(formData.balance)}
                  onChange={handleAmountChange}
                  className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#8B5CF6] dark:focus:border-[#8B5CF6]/80 focus:ring-1 focus:ring-[#8B5CF6] transition-all text-sm md:text-base"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isLoading || !formData.name || !formData.balance}
              className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-[0_8px_20px_-6px_rgba(139,92,246,0.5)] flex justify-center items-center gap-2 mt-2"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Add Wallet <PlusCircle size={18} />
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  , document.body) : null;

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="inline-block cursor-pointer w-full sm:w-auto">
        {children}
      </div>
      {modalContent}
    </>
  );
}