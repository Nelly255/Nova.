"use client";

import { useState, useEffect } from "react";
import { X, Loader2, ChevronDown, Wallet, Search, PlusCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

// 🚀 FIXED: These are exactly the categories you want!
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

export default function EditTransactionModal({ transaction, onClose }: { transaction: any, onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [wallets, setWallets] = useState<any[]>([]);
  const [categorySearch, setCategorySearch] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    amount: "", 
    type: "expense",
    category: "Other",
    date: new Date().toISOString().split("T")[0],
    account_id: "", 
  });

  // 🚀 Ensures it perfectly picks up the ORIGINAL data (including category) every time you open it
  useEffect(() => {
    if (transaction) {
      setFormData({
        title: transaction.title || "",
        amount: transaction.amount?.toString() || "", 
        type: transaction.type || "expense",
        category: transaction.category || "Other",
        date: transaction.date ? new Date(transaction.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        account_id: transaction.account_id || "", 
      });
    }
  }, [transaction]);

  useEffect(() => {
    const fetchWallets = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("accounts").select("*").eq("user_id", user.id);
      if (data) setWallets(data);
    };
    fetchWallets();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newAmount = parseFloat(formData.amount) || 0;
      const oldAmount = Number(transaction.amount) || 0;
      const oldAccountId = transaction.account_id;
      const newAccountId = formData.account_id;
      const oldType = transaction.type;
      const newType = formData.type;

      // SCENARIO 1: The wallet was changed OR removed. We must fully revert the old transaction.
      if (oldAccountId && oldAccountId !== newAccountId) {
        const { data: oldWallet } = await supabase.from("accounts").select("balance").eq("id", oldAccountId).single();
        if (oldWallet) {
          let oldBal = Number(oldWallet.balance);
          if (oldType === 'income') oldBal -= oldAmount; 
          else oldBal += oldAmount; 
          await supabase.from("accounts").update({ balance: oldBal }).eq("id", oldAccountId);
        }
      }

      // SCENARIO 2: Apply the transaction to the selected wallet
      if (newAccountId) {
        const { data: newWallet } = await supabase.from("accounts").select("balance").eq("id", newAccountId).single();
        if (newWallet) {
          let newBal = Number(newWallet.balance);
          
          if (oldAccountId === newAccountId) {
            if (oldType === 'income') newBal -= oldAmount;
            else newBal += oldAmount;
          }

          if (newType === 'income') newBal += newAmount;
          else newBal -= newAmount;
          
          await supabase.from("accounts").update({ balance: newBal }).eq("id", newAccountId);
        }
      }

      const { error: txError } = await supabase
        .from("transactions")
        .update({
          title: formData.title,
          amount: newAmount, 
          type: newType,
          category: formData.category, 
          date: formData.date,
          account_id: newAccountId || null
        })
        .eq("id", transaction.id);

      if (txError) throw txError;

      window.dispatchEvent(new Event("transactionUpdated")); 
      onClose();

    } catch (error: any) {
      console.error("Error updating transaction:", error.message);
      alert(`Failed to update transaction: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = DEFAULT_CATEGORIES.filter(cat => 
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const isNewCategory = categorySearch.length > 0 && 
    !DEFAULT_CATEGORIES.some(cat => cat.toLowerCase() === categorySearch.toLowerCase());

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      
      <div 
        className="absolute inset-0 bg-slate-900/10 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md glass-card rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-visible animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-zinc-200/80 dark:border-white/5 transition-colors shrink-0">
          <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 transition-colors">Edit Transaction</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-visible custom-scrollbar">
          
          <div className="grid grid-cols-2 gap-3 mb-6 shrink-0">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "expense" })}
              className={`py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                formData.type === "expense" 
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)] backdrop-blur-md" 
                : "bg-zinc-50/50 dark:bg-black/20 text-zinc-500 dark:text-zinc-400 border border-zinc-200/80 dark:border-white/5 hover:bg-white/80 dark:hover:bg-white/10 backdrop-blur-sm"
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "income" })}
              className={`py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                formData.type === "income" 
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] backdrop-blur-md" 
                : "bg-zinc-50/50 dark:bg-black/20 text-zinc-500 dark:text-zinc-400 border border-zinc-200/80 dark:border-white/5 hover:bg-white/80 dark:hover:bg-white/10 backdrop-blur-sm"
              }`}
            >
              Income
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold tracking-wide text-zinc-700 dark:text-zinc-400 mb-1 transition-colors">What was this for?</label>
            <input 
              required
              type="text" 
              placeholder="e.g., Starbucks, Salary"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold tracking-wide text-zinc-700 dark:text-zinc-400 mb-1 transition-colors">Amount</label>
              <input 
                required
                type="text" 
                inputMode="decimal" 
                placeholder="0.00"
                value={formatAmountForDisplay(formData.amount)} 
                onChange={handleAmountChange} 
                className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold tracking-wide text-zinc-700 dark:text-zinc-400 mb-1 transition-colors">Date</label>
              <input 
                required
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Wallet Dropdown */}
            <div className={`relative ${isWalletOpen ? 'z-50' : 'z-40'}`}>
              <label className="block text-sm font-semibold tracking-wide text-zinc-700 dark:text-zinc-400 mb-1 transition-colors">Wallet</label>
              <button 
                type="button"
                onClick={() => {setIsWalletOpen(!isWalletOpen); setIsCategoryOpen(false);}}
                className="w-full flex justify-between items-center bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              >
                <span className="truncate pr-2 text-sm">
                  {wallets.find(w => w.id === formData.account_id)?.name || "Select Wallet"}
                </span>
                <ChevronDown size={14} className={`text-zinc-400 shrink-0 transition-transform duration-200 ${isWalletOpen ? 'rotate-180' : ''}`} />
              </button>

              {isWalletOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsWalletOpen(false)} />
                  <div className="absolute left-0 right-0 bottom-full mb-2 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/80 dark:border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 origin-bottom duration-200 max-h-48 overflow-y-auto custom-scrollbar">
                    <button
                      type="button"
                      onClick={() => { setFormData({ ...formData, account_id: "" }); setIsWalletOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${
                        formData.account_id === "" ? 'bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-zinc-100 font-bold' : 'hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      None (Don't update balances)
                    </button>
                    {wallets.map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => { setFormData({ ...formData, account_id: w.id }); setIsWalletOpen(false); }}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${
                          formData.account_id === w.id 
                          ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold' 
                          : 'hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        <span className="truncate">{w.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Category Dropdown */}
            <div className={`relative ${isCategoryOpen ? 'z-50' : 'z-30'}`}>
              <label className="block text-sm font-semibold tracking-wide text-zinc-700 dark:text-zinc-400 mb-1 transition-colors">Category</label>
              <button 
                type="button"
                onClick={() => {setIsCategoryOpen(!isCategoryOpen); setIsWalletOpen(false);}}
                className="w-full flex justify-between items-center bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              >
                <span className="truncate pr-2 text-sm">
                  {formData.category}
                </span>
                <ChevronDown size={14} className={`text-zinc-400 shrink-0 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCategoryOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsCategoryOpen(false)} />
                  <div className="absolute left-0 right-0 bottom-full mb-2 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/80 dark:border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 origin-bottom duration-200">
                    
                    <div className="p-2 border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-950/50">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                        <input 
                          autoFocus
                          type="text"
                          placeholder="Search or type new..."
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="max-h-48 overflow-y-auto custom-scrollbar p-1.5">
                      {isNewCategory && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, category: categorySearch });
                            setIsCategoryOpen(false);
                            setCategorySearch("");
                          }}
                          className="w-full text-left px-4 py-3 rounded-xl text-sm transition-colors flex items-center gap-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/10 font-bold mb-1"
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
                            ? 'bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-zinc-100 font-bold' 
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
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-[0_8px_20px_-6px_rgba(99,102,241,0.6)] border border-white/20 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 font-bold py-3.5 rounded-xl mt-4 flex justify-center items-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Save Changes"}
          </button>
        </form>

      </div>
    </div>
  );
}