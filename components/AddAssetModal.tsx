"use client";

import { useState, useEffect } from "react";
import { Plus, X, Loader2, ChevronDown, Wallet, BookOpen } from "lucide-react";
import { supabase } from "@/lib/supabase";

const ASSET_CATEGORIES = [
  { label: "Computers & Data Equipment (37.5%)", value: "37.5" },
  { label: "Light Vehicles & Construction Equip (25%)", value: "25" },
  { label: "Heavy Vehicles, Machinery & Plant (12.5%)", value: "12.5" },
  { label: "Electrical, Furniture & Fittings (12.5%)", value: "12.5" },
  { label: "Buildings & Structures (5%)", value: "5" }
];

export default function AddAssetModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  
  // 🚀 NEW: State for wallets and acquisition type
  const [wallets, setWallets] = useState<any[]>([]);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [acquisitionType, setAcquisitionType] = useState<'wallet' | 'open_balance'>('open_balance');
  const [currencySymbol, setCurrencySymbol] = useState("TSh ");

  const [formData, setFormData] = useState({
    name: "",
    purchase_price: "", 
    purchase_date: "",
    depreciation_rate: "25", 
    salvage_value: "0",
    wallet_id: "" 
  });

  // Fetch wallets when modal opens
  useEffect(() => {
    const fetchWallets = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('accounts').select('*').eq('user_id', user.id);
      if (data) {
        setWallets(data);
        if (data.length > 0 && !formData.wallet_id) {
          setFormData(prev => ({ ...prev, wallet_id: data[0].id }));
        }
      }
    };

    if (isOpen) {
      fetchWallets();
      const savedCurrency = localStorage.getItem("app_currency");
      setCurrencySymbol(savedCurrency === "USD" ? "$" : "TSh ");
    }
  }, [isOpen]);

  const formatAmountForDisplay = (value: string) => {
    if (!value) return "";
    const parts = value.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    let rawValue = e.target.value.replace(/[^0-9.]/g, "");
    const parts = rawValue.split(".");
    if (parts.length > 2) rawValue = parts[0] + "." + parts.slice(1).join("");
    setFormData({ ...formData, [field]: rawValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to save an asset.");

      const price = parseFloat(formData.purchase_price);

      // 🚀 NEW: Handle Wallet Deduction if chosen
      if (acquisitionType === 'wallet') {
        if (!formData.wallet_id) throw new Error("Please select a wallet to pay from.");
        
        const selectedWallet = wallets.find(w => w.id === formData.wallet_id);
        if (!selectedWallet) throw new Error("Wallet not found.");
        
        if (Number(selectedWallet.balance) < price) {
          throw new Error(`Insufficient funds in ${selectedWallet.name}.`);
        }

        // 1. Deduct from wallet balance
        const { error: walletError } = await supabase
          .from("accounts")
          .update({ balance: Number(selectedWallet.balance) - price })
          .eq("id", formData.wallet_id);
          
        if (walletError) throw walletError;

        // 2. Log Expense Transaction
        const { error: txError } = await supabase
          .from("transactions")
          .insert([{
            title: `Purchased Asset: ${formData.name}`,
            amount: price,
            date: formData.purchase_date || new Date().toISOString().split("T")[0],
            type: 'expense',
            category: 'Asset Purchase',
            account_id: formData.wallet_id
          }]);
          
        if (txError) throw txError;
      }

      // 3. Insert the Asset
      const { error } = await supabase.from("assets").insert([
        {
          user_id: user.id,
          name: formData.name,
          purchase_price: price,
          purchase_date: formData.purchase_date,
          depreciation_rate: parseFloat(formData.depreciation_rate),
          salvage_value: parseFloat(formData.salvage_value || "0"),
        },
      ]);

      if (error) throw error;

      // Success!
      setIsOpen(false);
      setFormData({
        name: "",
        purchase_price: "", 
        purchase_date: "",
        depreciation_rate: "25", 
        salvage_value: "0",
        wallet_id: wallets.length > 0 ? wallets[0].id : ""
      });
      setAcquisitionType('open_balance');
      
      // Dispatch events to refresh parent components
      window.dispatchEvent(new Event("assetUpdated")); 
      if (acquisitionType === 'wallet') {
        window.dispatchEvent(new Event("transactionUpdated")); 
      }
      
    } catch (error: any) {
      console.error("EXACT DATABASE ERROR:", error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedWalletObj = wallets.find(w => w.id === formData.wallet_id);
  const purchaseAmount = parseFloat(formData.purchase_price) || 0;
  const isInsufficient = acquisitionType === 'wallet' && selectedWalletObj && Number(selectedWalletObj.balance) < purchaseAmount;

  return (
    <div className="relative">
      
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-brand-600 hover:bg-brand-500 text-white shadow-[0_8px_20px_-6px_rgb(var(--brand-500)/0.6)] border border-white/20 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 text-xs md:text-sm"
      >
        <Plus size={16} /> <span className="hidden sm:inline">Add Asset</span><span className="sm:hidden">Add</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-slate-900/10 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => { setIsOpen(false); setIsCategoryOpen(false); setIsWalletOpen(false); }}
          />

          <div className="fixed left-4 right-4 top-24 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 z-50 sm:w-96 glass-card rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-visible animate-in fade-in zoom-in-95 origin-top sm:origin-top-right duration-200 flex flex-col max-h-[85vh]">
            
            <div className="flex justify-between items-center p-6 border-b border-zinc-200/80 dark:border-white/5 transition-colors shrink-0">
              <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 transition-colors">Add Depreciating Asset</h3>
              <button onClick={() => { setIsOpen(false); setIsCategoryOpen(false); setIsWalletOpen(false); }} className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5">
                <X size={20} />
              </button>
            </div>

            <form 
              onSubmit={handleSubmit} 
              className="p-6 space-y-4 overflow-y-auto custom-scrollbar pb-10"
            >
              <div>
                <label className="block text-sm font-semibold tracking-wide text-zinc-700 dark:text-zinc-400 mb-1 transition-colors">Asset Name</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g., MacBook Pro, Toyota Harrier"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                />
              </div>

              {/* 🚀 NEW: Acquisition Type Toggle */}
              <div>
                <label className="block text-sm font-semibold tracking-wide text-zinc-700 dark:text-zinc-400 mb-1 transition-colors">How was this acquired?</label>
                <div className="flex bg-zinc-100 dark:bg-zinc-900/50 p-1 rounded-xl border border-zinc-200/50 dark:border-white/5">
                  <button 
                    type="button"
                    onClick={() => setAcquisitionType('open_balance')} 
                    className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-lg transition-all ${acquisitionType === 'open_balance' ? 'bg-white dark:bg-zinc-800 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'}`}
                  >
                    <BookOpen size={14}/> Historical / Open
                  </button>
                  <button 
                    type="button"
                    onClick={() => setAcquisitionType('wallet')} 
                    className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-lg transition-all ${acquisitionType === 'wallet' ? 'bg-white dark:bg-zinc-800 shadow-sm text-brand-600 dark:text-brand-400' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'}`}
                  >
                    <Wallet size={14}/> Pay via Wallet
                  </button>
                </div>
              </div>

              {/* 🚀 NEW: Wallet Selector (Shows only if paid via Wallet) */}
              {acquisitionType === 'wallet' && (
                <div className={`relative ${isWalletOpen ? 'z-50' : 'z-40'}`}>
                  <label className="block text-sm font-semibold tracking-wide text-zinc-700 dark:text-zinc-400 mb-1 transition-colors">Pay From Wallet</label>
                  <button 
                    type="button"
                    onClick={() => setIsWalletOpen(!isWalletOpen)}
                    className="w-full flex justify-between items-center bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-left focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                  >
                    <span className={`truncate pr-2 ${!selectedWalletObj ? 'text-zinc-400' : 'text-zinc-900 dark:text-zinc-200'}`}>
                      {selectedWalletObj ? `${selectedWalletObj.name} (${currencySymbol}${Number(selectedWalletObj.balance).toLocaleString()})` : 'Select a wallet...'}
                    </span>
                    <ChevronDown size={16} className={`text-zinc-400 shrink-0 transition-transform duration-200 ${isWalletOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isWalletOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsWalletOpen(false)} />
                      <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/80 dark:border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-48 overflow-y-auto custom-scrollbar">
                        {wallets.length === 0 ? <div className="px-4 py-3 text-sm text-zinc-500 text-center">No wallets found.</div> : wallets.map((w) => (
                            <button key={w.id} type="button" onClick={() => { setFormData({ ...formData, wallet_id: w.id }); setIsWalletOpen(false); }} className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${formData.wallet_id === w.id ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold' : 'hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300'}`}>
                              <span className="truncate pr-2">{w.name}</span>
                              <span className="text-xs font-medium opacity-70 shrink-0">{currencySymbol}{Number(w.balance).toLocaleString()}</span>
                            </button>
                        ))}
                      </div>
                    </>
                  )}
                  {wallets.length === 0 && <p className="text-xs text-rose-500 mt-1">You need to add a Wallet first to log a purchase!</p>}
                </div>
              )}

              <div className={`relative ${isCategoryOpen ? 'z-50' : 'z-30'}`}>
                <label className="block text-sm font-semibold tracking-wide text-zinc-700 dark:text-zinc-400 mb-1 transition-colors">Asset Category (TRA Rate)</label>
                <button 
                  type="button"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="w-full flex justify-between items-center bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                >
                  <span className="truncate pr-2">
                    {ASSET_CATEGORIES.find(c => c.value === formData.depreciation_rate)?.label || "Select Category"}
                  </span>
                  <ChevronDown size={16} className={`text-zinc-400 shrink-0 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCategoryOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsCategoryOpen(false)} />
                    <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/80 dark:border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      {ASSET_CATEGORIES.map((cat) => (
                        <button
                          key={cat.label} 
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, depreciation_rate: cat.value });
                            setIsCategoryOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${
                            formData.depreciation_rate === cat.value && ASSET_CATEGORIES.find(c => c.value === formData.depreciation_rate)?.label === cat.label
                            ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold' 
                            : 'hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          <span className="truncate">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-semibold tracking-wide text-zinc-700 dark:text-zinc-400 mb-1 transition-colors">Purchase Price</label>
                  <input 
                    required
                    type="text" 
                    inputMode="decimal"
                    placeholder="e.g. 15,000,000"
                    value={formatAmountForDisplay(formData.purchase_price)}
                    onChange={(e) => handleNumberChange(e, "purchase_price")}
                    className={`w-full bg-zinc-50 dark:bg-zinc-950/50 border rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-1 transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600 ${isInsufficient ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500 text-rose-600 dark:text-rose-400' : 'border-zinc-200/80 dark:border-white/10 focus:border-brand-500 focus:ring-brand-500'}`}
                  />
                  {isInsufficient && (
                    <p className="absolute -bottom-5 left-0 text-[10px] text-rose-500 font-bold animate-in fade-in">
                      Insufficient funds!
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold tracking-wide text-zinc-700 dark:text-zinc-400 mb-1 transition-colors">Purchase Date</label>
                  <input 
                    required
                    type="date" 
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-sm font-semibold tracking-wide text-zinc-700 dark:text-zinc-400 mb-1 transition-colors">End Salvage Value</label>
                <input 
                  required
                  type="text" 
                  inputMode="decimal"
                  placeholder="e.g., 0"
                  value={formatAmountForDisplay(formData.salvage_value)}
                  onChange={(e) => handleNumberChange(e, "salvage_value")}
                  className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading || isInsufficient || (acquisitionType === 'wallet' && !formData.wallet_id)}
                className="w-full shrink-0 bg-brand-600 hover:bg-brand-500 text-white shadow-[0_8px_20px_-6px_rgb(var(--brand-500)/0.6)] border border-white/20 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 font-bold py-3.5 rounded-xl mt-6 flex justify-center items-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Save Asset"}
              </button>
            </form>

          </div>
        </>
      )}
    </div>
  );
}