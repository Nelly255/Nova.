"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import CreateBudgetModal from "@/components/CreateBudgetModal";
import EditBudgetModal from "@/components/EditBudgetModal"; 
import { Target, ShoppingBag, Utensils, Car, Tv, Zap, AlertCircle, TrendingUp, Wallet, Trash2, Pencil, X } from "lucide-react";

const iconMap: Record<string, any> = {
  "Groceries": ShoppingBag,
  "Dining Out": Utensils,
  "Transport": Car,
  "Entertainment": Tv,
  "Bills": Zap,
  "Default": Target
};

export default function BudgetsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState("$");

  const [budgetToEdit, setBudgetToEdit] = useState<any>(null);
  const [budgetToDelete, setBudgetToDelete] = useState<any>(null);

  useEffect(() => {
    const savedCurrency = localStorage.getItem("app_currency");
    if (savedCurrency === "TZS") {
      setCurrencySymbol("TSh ");
    } else {
      setCurrencySymbol("$");
    }

    const fetchData = async () => {
      const [txRes, bgRes] = await Promise.all([
        supabase.from("transactions").select("*").eq("type", "expense"),
        supabase.from("budgets").select("*")
      ]);

      if (txRes.data) setTransactions(txRes.data);
      if (bgRes.data) setBudgets(bgRes.data);
      
      setLoading(false);
    };

    fetchData();

    window.addEventListener("budgetUpdated", fetchData);
    return () => window.removeEventListener("budgetUpdated", fetchData);
  }, []);

  const confirmDelete = async () => {
    if (!budgetToDelete) return;
    
    const { error } = await supabase.from("budgets").delete().eq("id", budgetToDelete.id);
    if (!error) {
      setBudgets((prev) => prev.filter((b) => b.id !== budgetToDelete.id));
    }
    setBudgetToDelete(null);
  };

  const activeBudgets = budgets.map(b => {
    const spent = transactions
      .filter(t => t.category === b.name)
      .reduce((acc, t) => acc + Number(t.amount), 0);
      
    return {
      ...b,
      spent: spent,
      icon: iconMap[b.name] || iconMap["Default"]
    };
  });

  const totalBudgeted = activeBudgets.reduce((acc, b) => acc + Number(b.limit_amount), 0);
  const totalSpent = activeBudgets.reduce((acc, b) => acc + b.spent, 0);
  const totalRemaining = Math.max(totalBudgeted - totalSpent, 0);
  
  const overallPercentage = totalBudgeted > 0 ? Math.min((totalSpent / totalBudgeted) * 100, 100) : 0;
  const circleRadius = 45;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference - (overallPercentage / 100) * circleCircumference;

  return (
    // UPGRADED: Added pb-32 so the mobile bottom nav doesn't cover your cards
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6 md:space-y-8 pb-32 bg-transparent min-h-screen relative transition-colors duration-300">
      
      {/* UPGRADED: Flex-col on mobile so the header stacks cleanly */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative z-50">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 transition-colors">Budgets</h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Keep your spending in check this month.</p>
        </div>
        <div className="w-full md:w-auto">
          <CreateBudgetModal />
        </div>
      </header>

      {loading ? (
        <div className="text-slate-500 py-10 transition-colors">Loading your budgets...</div>
      ) : activeBudgets.length === 0 ? (
        <div className="glass-card p-12 md:p-16 rounded-[2rem] text-center flex flex-col items-center justify-center transition-colors">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-50/80 dark:bg-white/5 text-indigo-500 dark:text-indigo-400 rounded-full flex items-center justify-center mb-6 border border-indigo-100/50 dark:border-white/5 backdrop-blur-sm transition-colors">
            <Wallet size={32} className="md:w-10 md:h-10" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2 transition-colors">No Budgets Set</h2>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 transition-colors">
            You haven't allocated any funds yet. Create your first budget to start tracking your remaining balances here.
          </p>
          <CreateBudgetModal />
        </div>
      ) : (
        <>
          <div className="glass-card p-6 md:p-8 rounded-[2rem] relative overflow-hidden flex flex-col md:flex-row justify-between md:items-center gap-6 md:gap-8 animate-in fade-in duration-500 transition-colors">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400"></div>
            
            {/* UPGRADED: Flex-row on mobile! Text on the left, Circle on the right! */}
            <div className="flex flex-row items-center justify-between md:justify-start w-full md:w-auto gap-4 md:gap-8">
              
              <div className="text-left flex-1">
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-1 text-sm md:text-base transition-colors">Total Remaining</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-50 transition-colors break-words leading-tight">
                  {currencySymbol}{totalRemaining.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </h2>
                <div className="flex items-center gap-2 mt-3 text-xs md:text-sm text-emerald-600 bg-emerald-100/80 dark:text-emerald-400 dark:bg-emerald-400/10 px-3 py-1.5 rounded-full w-fit backdrop-blur-sm transition-colors border border-transparent dark:border-emerald-500/20">
                  <TrendingUp size={14} /> On track
                </div>
              </div>

              <div className="relative w-24 h-24 md:w-32 md:h-32 shrink-0 flex items-center justify-center">
                {/* UPGRADED: Added viewBox="0 0 128 128" so the SVG shrinks perfectly on mobile */}
                <svg viewBox="0 0 128 128" className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r={circleRadius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-slate-800/50 transition-colors" />
                  <circle 
                    cx="64" cy="64" r={circleRadius} 
                    stroke="url(#gradient)" strokeWidth="8" fill="transparent" 
                    strokeDasharray={circleCircumference} strokeDashoffset={strokeDashoffset} 
                    strokeLinecap="round" className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#c084fc" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-lg md:text-2xl font-bold text-slate-900 dark:text-slate-100 transition-colors">{overallPercentage.toFixed(0)}%</span>
                  <span className="text-[8px] md:text-[10px] text-slate-500 uppercase tracking-wider transition-colors">Spent</span>
                </div>
              </div>

            </div>

            <div className="flex gap-4 sm:gap-8 md:border-l border-slate-200 dark:border-slate-700/50 pt-4 md:pt-0 md:pl-8 border-t md:border-t-0 transition-colors w-full md:w-auto">
              <div className="flex-1 md:flex-none">
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-1 transition-colors">Total Budgeted</p>
                <p className="text-lg md:text-2xl font-semibold text-slate-900 dark:text-slate-200 transition-colors break-words">{currencySymbol}{totalBudgeted.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
              <div className="flex-1 md:flex-none">
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-1 transition-colors">Total Spent</p>
                <p className="text-lg md:text-2xl font-semibold text-slate-900 dark:text-slate-200 transition-colors break-words">{currencySymbol}{totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeBudgets.map((budget) => (
              <DetailedBudgetCard 
                key={budget.id} 
                budget={budget} 
                currencySymbol={currencySymbol} 
                onEdit={() => setBudgetToEdit(budget)} 
                onDelete={() => setBudgetToDelete(budget)}
              />
            ))}
          </div>
        </>
      )}

      {/* The Edit Modal */}
      {budgetToEdit && (
        <EditBudgetModal 
          budget={budgetToEdit} 
          onClose={() => setBudgetToEdit(null)} 
        />
      )}

      {/* The Beautiful Danger Modal */}
      {budgetToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-slate-900/10 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={() => setBudgetToDelete(null)} 
          />
          <div className="relative z-10 w-full max-w-sm glass-card rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="p-6 text-center pt-8">
              <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-500/30">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Delete Budget?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                Are you sure you want to delete the <span className="font-bold text-slate-700 dark:text-slate-300">{budgetToDelete.name}</span> budget? This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setBudgetToDelete(null)} 
                  className="flex-1 py-3.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-white/5 dark:hover:bg-white/10 transition-colors active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete} 
                  className="flex-1 py-3.5 rounded-xl font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-[0_4px_14px_rgba(244,63,94,0.4)] transition-all hover:-translate-y-0.5 active:scale-95"
                >
                  Yes, Delete
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Sub-component
function DetailedBudgetCard({ budget, currencySymbol, onEdit, onDelete }: any) {
  const Icon = budget.icon;
  const percentage = budget.limit_amount > 0 ? (budget.spent / budget.limit_amount) * 100 : 0;
  const isOver = percentage >= 100;
  
  let colorTheme = { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500", glow: "shadow-emerald-500/20" };
  if (percentage > 60) colorTheme = { text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-400", glow: "shadow-amber-500/20" };
  if (percentage > 90) colorTheme = { text: "text-rose-600 dark:text-rose-500", bg: "bg-rose-500", glow: "shadow-rose-500/20" };

  return (
    <div className="glass-card p-6 rounded-[2rem] hover:bg-white/40 dark:hover:bg-white/5 transition duration-300 group flex flex-col justify-between h-48 relative">
      
      <div className="absolute top-4 right-4 flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all z-10">
        <button 
          onClick={onEdit}
          className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100/80 dark:bg-black/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/10 p-2 rounded-lg backdrop-blur-md transition-colors"
          title="Edit Budget Limit"
        >
          <Pencil size={16} />
        </button>
        <button 
          onClick={onDelete}
          className="text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-100/80 dark:bg-black/20 hover:bg-rose-100 dark:hover:bg-rose-500/10 p-2 rounded-lg backdrop-blur-md transition-colors"
          title="Delete Budget"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex justify-between items-start pr-16">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 shrink-0 rounded-2xl bg-indigo-50/80 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:scale-110 transition-all duration-300 shadow-sm backdrop-blur-sm">
            <Icon size={20} />
          </div>
          <div className="truncate">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-200 transition-colors truncate">{budget.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 transition-colors">
              {currencySymbol}{Number(budget.limit_amount).toLocaleString(undefined, { maximumFractionDigits: 0 })} Limit
            </p>
          </div>
        </div>
        {isOver && <AlertCircle className="text-rose-500 animate-pulse shrink-0" size={20} />}
      </div>

      <div className="mt-4">
        <div className="flex justify-between items-end mb-2">
          <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 transition-colors truncate">
            {currencySymbol}{Number(budget.spent).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span className={`text-sm font-medium shrink-0 ${colorTheme.text} transition-colors`}>
            {percentage.toFixed(0)}%
          </span>
        </div>
        
        <div className="h-2 w-full bg-slate-100/80 dark:bg-slate-800/50 rounded-full overflow-hidden transition-colors shadow-inner backdrop-blur-sm border border-transparent dark:border-white/5">
          <div 
            className={`h-full ${colorTheme.bg} transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0)] shadow-${colorTheme.bg}/50`} 
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-right transition-colors">
          {isOver ? "Over budget" : `${currencySymbol}${Number(budget.limit_amount - budget.spent).toLocaleString(undefined, { maximumFractionDigits: 0 })} left`}
        </p>
      </div>
    </div>
  );
}