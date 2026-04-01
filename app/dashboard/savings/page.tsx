"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AddSavingsGoalModal from "@/components/AddSavingsGoalModal";
import { PiggyBank, Target, Trash2, PlusCircle, TrendingUp, X, Loader2, Pencil } from "lucide-react";

export default function SavingsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // 🚀 UPDATED: Default initial state to TSh
  const [currencySymbol, setCurrencySymbol] = useState("TSh ");

  // Custom Deposit Modal State
  const [depositModal, setDepositModal] = useState({ isOpen: false, goalId: "", goalName: "", currentAmount: 0 });
  const [depositInput, setDepositInput] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);

  // UPGRADED: Custom Delete Modal State
  const [goalToDelete, setGoalToDelete] = useState<any>(null);

  // UPGRADED: Custom Edit Modal State
  const [editModal, setEditModal] = useState({ isOpen: false, goalId: "", name: "", targetAmount: "", targetDate: "" });
  const [isEditing, setIsEditing] = useState(false);

  const fetchGoals = async () => {
    const { data, error } = await supabase.from("savings_goals").select("*").order("created_at", { ascending: false });
    if (!error && data) setGoals(data);
    setLoading(false);
  };

  useEffect(() => {
    const savedCurrency = localStorage.getItem("app_currency");
    // 🚀 UPDATED: Default to TSh unless USD is explicitly saved
    setCurrencySymbol(savedCurrency === "USD" ? "$" : "TSh ");
    
    fetchGoals();

    window.addEventListener("goalUpdated", fetchGoals);
    return () => window.removeEventListener("goalUpdated", fetchGoals);
  }, []);

  // UPGRADED: The function called by the Danger Modal
  const confirmDelete = async () => {
    if (!goalToDelete) return;
    const { error } = await supabase.from("savings_goals").delete().eq("id", goalToDelete.id);
    if (!error) {
      setGoals((prev) => prev.filter((g) => g.id !== goalToDelete.id));
    }
    setGoalToDelete(null);
  };

  const formatAmountForDisplay = (value: string) => {
    if (!value) return "";
    const parts = value.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  const cleanNumber = (val: string) => val.replace(/[^0-9.]/g, "");

  // PATCHED: This is the missing function that was crashing the app!
  const handleDepositInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value.replace(/[^0-9.]/g, "");
    const parts = rawValue.split(".");
    if (parts.length > 2) {
      rawValue = parts[0] + "." + parts.slice(1).join("");
    }
    setDepositInput(rawValue);
  };

  const submitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const depositAmount = parseFloat(depositInput);
    
    if (isNaN(depositAmount) || depositAmount <= 0) {
      alert("Please enter a valid amount!");
      return;
    }

    setIsDepositing(true);
    const newAmount = depositModal.currentAmount + depositAmount;

    const { error: goalError } = await supabase.from("savings_goals").update({ current_amount: newAmount }).eq("id", depositModal.goalId);

    const { error: txError } = await supabase.from("transactions").insert([{
      title: `Transfer to ${depositModal.goalName}`,
      amount: depositAmount,
      type: "expense",
      category: "Savings", 
      date: new Date().toISOString().split("T")[0], 
    }]);

    setIsDepositing(false);

    if (!goalError && !txError) {
      setDepositModal({ ...depositModal, isOpen: false });
      fetchGoals(); 
      window.dispatchEvent(new Event("transactionUpdated")); 
    } else {
      alert("There was an error processing your deposit.");
    }
  };

  // UPGRADED: Handle Editing a Goal
  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(true);

    const { error } = await supabase.from("savings_goals").update({
      name: editModal.name,
      target_amount: parseFloat(editModal.targetAmount),
      target_date: editModal.targetDate
    }).eq("id", editModal.goalId);

    setIsEditing(false);

    if (!error) {
      setEditModal({ ...editModal, isOpen: false });
      fetchGoals();
    } else {
      alert("Failed to update the savings goal.");
    }
  };

  const totalSaved = goals.reduce((acc, goal) => acc + Number(goal.current_amount), 0);
  const totalTarget = goals.reduce((acc, goal) => acc + Number(goal.target_amount), 0);

  return (
    // UPGRADED: Added pb-32 so bottom nav bar doesn't cover content
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6 md:space-y-8 pb-32 bg-transparent min-h-screen relative">
      
      {/* UPGRADED: Stack header beautifully on mobile */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative z-50">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 transition-colors">Savings Goals</h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Track your progress towards your dreams.</p>
        </div>
        <div className="w-full md:w-auto">
          <AddSavingsGoalModal />
        </div>
      </header>

      {/* Hero Banner */}
      <div className="glass-card p-6 md:p-8 rounded-[2rem] flex flex-col md:flex-row justify-between md:items-center relative overflow-hidden transition-colors">
        <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/5 dark:to-purple-500/5 pointer-events-none rounded-[2rem]"></div>
        
        <div className="absolute -right-10 -bottom-10 text-indigo-500/10 dark:text-indigo-500/10 transition-colors">
          <PiggyBank size={150} className="md:w-[200px] md:h-[200px]" />
        </div>
        <div className="relative z-10 w-full md:w-auto">
          <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm md:text-base mb-1 transition-colors">Total Saved Across All Goals</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white transition-colors break-words leading-tight">
            {currencySymbol}{totalSaved.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </h2>
        </div>
        <div className="relative z-10 text-left md:text-right mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-indigo-500/10 dark:border-white/5">
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xs md:text-sm mb-1 transition-colors">Overall Target</p>
          <p className="text-xl md:text-2xl font-bold text-slate-700 dark:text-slate-200 transition-colors break-words">
            {currencySymbol}{totalTarget.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      <div className="mt-8">
        {loading ? (
          <p className="text-slate-500 transition-colors font-medium">Loading your goals...</p>
        ) : goals.length === 0 ? (
          <div className="glass-card p-12 md:p-16 text-center rounded-[2rem] flex flex-col items-center transition-colors">
            <div className="w-16 h-16 rounded-2xl bg-slate-100/80 dark:bg-white/5 flex items-center justify-center text-slate-400 mb-4 backdrop-blur-sm border border-slate-200/50 dark:border-white/5">
              <Target size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200 transition-colors">No goals set</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 transition-colors">What are you saving for? Create your first goal above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal) => {
              const percentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
              const isComplete = percentage >= 100;

              return (
                <div key={goal.id} className="glass-card p-6 rounded-[2rem] relative group flex flex-col justify-between hover:bg-white/40 dark:hover:bg-white/5 transition-all duration-300">
                  
                  {/* UPGRADED: Edit & Delete Buttons */}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all z-10">
                    <button 
                      onClick={() => setEditModal({ isOpen: true, goalId: goal.id, name: goal.name, targetAmount: goal.target_amount.toString(), targetDate: new Date(goal.target_date).toISOString().split('T')[0] })}
                      className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100/80 dark:bg-black/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/10 p-2 rounded-lg backdrop-blur-md transition-colors"
                      title="Edit Goal"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      onClick={() => setGoalToDelete(goal)}
                      className="text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-100/80 dark:bg-black/20 hover:bg-rose-100 dark:hover:bg-rose-500/10 p-2 rounded-lg backdrop-blur-md transition-colors"
                      title="Delete Goal"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-2xl bg-indigo-50/80 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shadow-sm backdrop-blur-sm transition-colors">
                        <TrendingUp size={24} />
                      </div>
                      <div className="truncate pr-16">
                        <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-200 transition-colors truncate">{goal.name}</h3>
                        <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 transition-colors">Target: {new Date(goal.target_date).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-end mb-2">
                      <span className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white transition-colors break-words truncate">
                        {currencySymbol}{Number(goal.current_amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                      <span className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors shrink-0">
                        of {currencySymbol}{Number(goal.target_amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    
                    {/* UPGRADED: Thicker progress bar (h-4) */}
                    <div className="h-3 md:h-4 w-full bg-slate-100/80 dark:bg-slate-950/50 rounded-full overflow-hidden border border-slate-200/50 dark:border-white/5 mb-6 transition-colors shadow-inner backdrop-blur-sm">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out ${isComplete ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]'}`} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <button 
                    onClick={() => { setDepositModal({ isOpen: true, goalId: goal.id, goalName: goal.name, currentAmount: Number(goal.current_amount) }); setDepositInput(""); }}
                    disabled={isComplete}
                    className={`w-full py-3.5 rounded-2xl font-bold flex justify-center items-center gap-2 text-sm md:text-base transition-all active:scale-95 ${
                      isComplete 
                      ? 'bg-emerald-100/80 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 backdrop-blur-sm' 
                      : 'bg-white/80 text-slate-700 hover:bg-white border-slate-200 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:border-white/10 border backdrop-blur-md shadow-sm'
                    }`}
                  >
                    {isComplete ? "Goal Reached! 🎉" : <><PlusCircle size={18} /> Deposit Funds</>}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================== */}
      {/* DEPOSIT MODAL */}
      {/* ============================================== */}
      {depositModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/10 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setDepositModal({ ...depositModal, isOpen: false })} />
          <div className="relative z-10 w-full max-w-sm glass-card rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-200/80 dark:border-white/5 transition-colors">
              <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 transition-colors">Deposit Funds</h3>
              <button onClick={() => setDepositModal({ ...depositModal, isOpen: false })} className="text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 p-1 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={submitDeposit} className="p-6 space-y-4">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Add money to your <span className="font-bold text-indigo-600 dark:text-indigo-400">{depositModal.goalName}</span> fund.</p>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Amount ({currencySymbol})</label>
                <input 
                  required type="text" inputMode="decimal" placeholder="e.g., 500.00" value={formatAmountForDisplay(depositInput)} onChange={handleDepositInputChange} 
                  className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-lg font-bold" autoFocus 
                />
              </div>
              <button type="submit" disabled={isDepositing || !depositInput} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70 shadow-[0_8px_20px_-6px_rgba(99,102,241,0.6)]">
                {isDepositing ? <Loader2 className="animate-spin" size={20} /> : "Confirm Deposit"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================== */}
      {/* EDIT MODAL (NEW!) */}
      {/* ============================================== */}
      {editModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/10 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setEditModal({ ...editModal, isOpen: false })} />
          <div className="relative z-10 w-full max-w-md glass-card rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-200/80 dark:border-white/5 transition-colors">
              <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 transition-colors">Edit Goal</h3>
              <button onClick={() => setEditModal({ ...editModal, isOpen: false })} className="text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 p-1 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={submitEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Goal Name</label>
                <input required type="text" value={editModal.name} onChange={(e) => setEditModal({ ...editModal, name: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Target ({currencySymbol})</label>
                  <input required type="text" inputMode="decimal" value={formatAmountForDisplay(editModal.targetAmount)} onChange={(e) => setEditModal({ ...editModal, targetAmount: cleanNumber(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Target Date</label>
                  <input required type="date" value={editModal.targetDate} onChange={(e) => setEditModal({ ...editModal, targetDate: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 [color-scheme:light] dark:[color-scheme:dark]" />
                </div>
              </div>
              <button type="submit" disabled={isEditing} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70 shadow-[0_8px_20px_-6px_rgba(99,102,241,0.6)] mt-4">
                {isEditing ? <Loader2 className="animate-spin" size={20} /> : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================== */}
      {/* DANGER MODAL (Replaces window.confirm) */}
      {/* ============================================== */}
      {goalToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/10 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setGoalToDelete(null)} />
          <div className="relative z-10 w-full max-w-sm glass-card rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center pt-8">
              <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-500/30">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Delete Goal?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                Are you sure you want to delete your <span className="font-bold text-slate-700 dark:text-slate-300">{goalToDelete.name}</span> fund? The money stays in your account, but the goal tracker will be removed.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setGoalToDelete(null)} className="flex-1 py-3.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-white/5 dark:hover:bg-white/10 transition-colors active:scale-95">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 py-3.5 rounded-xl font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-[0_4px_14px_rgba(244,63,94,0.4)] transition-all hover:-translate-y-0.5 active:scale-95">Yes, Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}