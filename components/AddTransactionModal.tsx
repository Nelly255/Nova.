"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // <-- The Magic Teleporter!
import { Plus, X, Loader2, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";

const CATEGORIES = [
  { label: "Groceries", value: "Groceries" },
  { label: "Dining Out", value: "Dining Out" },
  { label: "Transport", value: "Transport" },
  { label: "Entertainment", value: "Entertainment" },
  { label: "Bills & Utilities", value: "Bills" },
  { label: "Income / Salary", value: "Income" },
  { label: "Other", value: "Other" }
];

export default function AddTransactionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  
  // Need to check if we are on the client-side so Next.js SSR doesn't crash with Portals
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [formData, setFormData] = useState({
    title: "",
    amount: "", 
    type: "expense",
    category: "Groceries",
    date: new Date().toISOString().split("T")[0], 
  });

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

    const { error } = await supabase.from("transactions").insert([
      {
        title: formData.title,
        amount: parseFloat(formData.amount), 
        type: formData.type,
        category: formData.category,
        date: formData.date,
      },
    ]);

    setIsLoading(false);

    if (error) {
      console.error("Error saving transaction:", error.message);
      alert("Failed to save transaction. Check the console.");
    } else {
      setIsOpen(false);
      setFormData({ ...formData, title: "", amount: "", type: "expense", category: "Groceries" });
      window.dispatchEvent(new Event("transactionUpdated")); 
    }
  };

  // 1. The button stays exactly where you put it in the layout
  const modalButton = (
    <button 
      onClick={() => setIsOpen(true)}
      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-[0_8px_20px_-6px_rgba(99,102,241,0.6)] border border-white/20 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 text-xs md:text-sm w-full"
    >
      <Plus size={16} /> <span className="hidden sm:inline">Add Transaction</span><span className="sm:hidden">Add</span>
    </button>
  );

  // 2. The Modal Content (Centered, beautiful, and portal-ready)
  const modalContent = isOpen && mounted ? createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-0">
      
      {/* Heavy Backdrop Blur to block everything else out */}
      <div 
        className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={() => { setIsOpen(false); setIsCategoryOpen(false); }}
      />

      {/* Centered Modal Card */}
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-[#0A0A0E] rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-slate-200 dark:border-white/10 overflow-visible animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 md:p-8 border-b border-zinc-200/80 dark:border-white/5 transition-colors shrink-0">
          <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 transition-colors">New Transaction</h3>
          <button onClick={() => { setIsOpen(false); setIsCategoryOpen(false); }} className="text-zinc-500 hover:text-rose-500 dark:text-zinc-400 dark:hover:text-rose-400 transition-colors p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          
          <div className="grid grid-cols-2 gap-3 mb-2 shrink-0">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "expense" })}
              className={`py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
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
              className={`py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
                formData.type === "income" 
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] backdrop-blur-md" 
                : "bg-zinc-50/50 dark:bg-black/20 text-zinc-500 dark:text-zinc-400 border border-zinc-200/80 dark:border-white/5 hover:bg-white/80 dark:hover:bg-white/10 backdrop-blur-sm"
              }`}
            >
              Income
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 transition-colors">What was this for?</label>
            <input 
              required
              type="text" 
              placeholder="e.g., Starbucks, Salary"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-white/10 rounded-xl px-4 py-3.5 text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 transition-colors">Amount</label>
              <input 
                required
                type="text" 
                inputMode="decimal" 
                placeholder="0.00"
                value={formatAmountForDisplay(formData.amount)} 
                onChange={handleAmountChange} 
                className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-white/10 rounded-xl px-4 py-3.5 text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 transition-colors">Date</label>
              <input 
                required
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-white/10 rounded-xl px-4 py-3.5 text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 transition-colors">Category</label>
            <button 
              type="button"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="w-full flex justify-between items-center bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-white/10 rounded-xl px-4 py-3.5 text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            >
              <span className="truncate">
                {CATEGORIES.find(c => c.value === formData.category)?.label || formData.category}
              </span>
              <ChevronDown size={18} className={`text-zinc-400 shrink-0 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCategoryOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsCategoryOpen(false)} />
                <div className="absolute left-0 right-0 bottom-full mb-2 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-zinc-200/80 dark:border-white/10 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 origin-bottom duration-200">
                  <div className="max-h-60 overflow-y-auto custom-scrollbar p-1.5">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, category: cat.value });
                          setIsCategoryOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors flex items-center justify-between ${
                          formData.category === cat.value 
                          ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold' 
                          : 'hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 font-medium'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-[0_8px_20px_-6px_rgba(99,102,241,0.6)] border border-white/20 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 font-bold py-4 rounded-xl mt-6 flex justify-center items-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Save Transaction"}
          </button>
        </form>

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