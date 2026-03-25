"use client";

import { useState } from "react";
import { Plus, X, Loader2, AlertCircle, ChevronDown, Search, PlusCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

const DEFAULT_BUDGET_CATEGORIES = [
  "Groceries", 
  "Dining Out", 
  "Transport", 
  "Entertainment", 
  "Bills & Utilities", 
  "Shopping", 
  "Other"
];

export default function CreateBudgetModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  const [formData, setFormData] = useState({
    name: "Groceries",
    limit_amount: "", 
  });

  // SMART LOGIC: Filter defaults or allow creating new
  const filteredCategories = DEFAULT_BUDGET_CATEGORIES.filter(cat => 
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const isNewCategory = categorySearch.length > 0 && 
    !DEFAULT_BUDGET_CATEGORIES.some(cat => cat.toLowerCase() === categorySearch.toLowerCase());

  const formatAmountForDisplay = (value: string) => {
    if (!value) return "";
    const parts = value.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(""); 
    let rawValue = e.target.value.replace(/[^0-9.]/g, "");
    
    const parts = rawValue.split(".");
    if (parts.length > 2) {
      rawValue = parts[0] + "." + parts.slice(1).join("");
    }

    setFormData({ ...formData, limit_amount: rawValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(""); 

    const { data: existingBudgets, error: checkError } = await supabase
      .from("budgets")
      .select("id")
      .eq("name", formData.name);

    if (checkError) {
      setErrorMsg("Error checking data. Please try again.");
      setIsLoading(false);
      return;
    }

    if (existingBudgets && existingBudgets.length > 0) {
      setErrorMsg(`You already have an active budget for "${formData.name}".`);
      setIsLoading(false);
      return; 
    }

    const { error } = await supabase.from("budgets").insert([
      {
        name: formData.name,
        limit_amount: parseFloat(formData.limit_amount), 
      },
    ]);

    setIsLoading(false);

    if (error) {
      setErrorMsg("Failed to save budget. Please try again.");
    } else {
      setIsOpen(false);
      setCategorySearch("");
      setFormData({ name: "Groceries", limit_amount: "" });
      window.dispatchEvent(new Event("budgetUpdated")); 
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-[0_8px_20px_-6px_rgba(99,102,241,0.6)] border border-white/20 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm"
      >
        <Plus size={18} /> Create Budget
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/10 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => { setIsOpen(false); setErrorMsg(""); setIsCategoryOpen(false); }} />

          <div className="fixed left-4 right-4 top-24 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 z-50 sm:w-96 glass-card rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-visible animate-in fade-in zoom-in-95 origin-top sm:origin-top-right duration-200 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center p-6 border-b border-zinc-200/80 dark:border-white/5 transition-colors shrink-0">
              <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 transition-colors">Set New Budget</h3>
              <button onClick={() => { setIsOpen(false); setErrorMsg(""); setIsCategoryOpen(false); }} className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-visible custom-scrollbar">
              
              {errorMsg && (
                <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 p-3.5 rounded-xl animate-in fade-in zoom-in-95 duration-200">
                  <AlertCircle size={18} className="shrink-0" />
                  <p className="text-sm font-medium">{errorMsg}</p>
                </div>
              )}

              {/* SMART CATEGORY SELECTOR */}
              <div className="relative">
                <label className="block text-sm font-semibold tracking-wide text-zinc-700 dark:text-zinc-400 mb-1 transition-colors">Budget Category</label>
                <button 
                  type="button"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="w-full flex justify-between items-center bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                >
                  <span className="truncate">{formData.name}</span>
                  <ChevronDown size={16} className={`text-zinc-400 shrink-0 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCategoryOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsCategoryOpen(false)} />
                    <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/80 dark:border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      
                      {/* Search / Create Input */}
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

                      <div className="max-h-52 overflow-y-auto custom-scrollbar p-1.5">
                        {/* Option to create new if it doesn't exist */}
                        {isNewCategory && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, name: categorySearch });
                              setIsCategoryOpen(false);
                              setCategorySearch("");
                            }}
                            className="w-full text-left px-4 py-3 rounded-xl text-sm transition-colors flex items-center gap-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/10 font-bold mb-1"
                          >
                            <PlusCircle size={16} />
                            Track "{categorySearch}"
                          </button>
                        )}

                        {filteredCategories.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, name: cat });
                              setIsCategoryOpen(false);
                              setCategorySearch("");
                            }}
                            className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors ${
                              formData.name === cat 
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

              <div>
                <label className="block text-sm font-semibold tracking-wide text-zinc-700 dark:text-zinc-400 mb-1 transition-colors">Monthly Limit</label>
                <input 
                  required
                  type="text" 
                  inputMode="decimal"
                  placeholder="0.00"
                  value={formatAmountForDisplay(formData.limit_amount)}
                  onChange={handleAmountChange}
                  className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600 font-bold"
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-[0_8px_20px_-6px_rgba(99,102,241,0.6)] border border-white/20 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 font-bold py-3.5 rounded-xl mt-4 flex justify-center items-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Save Budget"}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}