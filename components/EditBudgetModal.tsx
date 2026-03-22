"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function EditBudgetModal({ budget, onClose }: { budget: any, onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [limitAmount, setLimitAmount] = useState(budget.limit_amount.toString());

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
    setLimitAmount(rawValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase
      .from("budgets")
      .update({ limit_amount: parseFloat(limitAmount) })
      .eq("id", budget.id);

    setIsLoading(false);

    if (error) {
      console.error("Error updating budget:", error.message);
      alert("Failed to update budget. Check console.");
    } else {
      window.dispatchEvent(new Event("budgetUpdated")); 
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      
      {/* Blur Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/10 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Centered Glass Modal */}
      <div className="relative z-10 w-full max-w-sm glass-card rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center p-6 border-b border-zinc-200/80 dark:border-white/5 transition-colors">
          <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 transition-colors">Edit Budget Limit</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-sm font-semibold tracking-wide text-zinc-500 dark:text-zinc-500 mb-1 transition-colors">Category</label>
            <input 
              disabled
              type="text" 
              value={budget.name}
              className="w-full bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-white/5 rounded-xl px-4 py-3 text-zinc-500 dark:text-zinc-500 cursor-not-allowed transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold tracking-wide text-zinc-700 dark:text-zinc-400 mb-1 transition-colors">New Monthly Limit</label>
            <input 
              required
              autoFocus
              type="text" 
              inputMode="decimal"
              value={formatAmountForDisplay(limitAmount)}
              onChange={handleAmountChange}
              className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-lg font-bold"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading || !limitAmount}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-[0_8px_20px_-6px_rgba(99,102,241,0.6)] border border-white/20 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 font-bold py-3.5 rounded-xl mt-4 flex justify-center items-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Save Changes"}
          </button>
        </form>

      </div>
    </div>
  );
}