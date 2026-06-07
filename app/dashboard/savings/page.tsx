"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AddSavingsGoalModal from "@/components/AddSavingsGoalModal";
import { PiggyBank, Target, Trash2, PlusCircle, TrendingUp, X, Loader2, Pencil, History, CalendarDays, CheckCircle2, AlertTriangle, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function SavingsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState("TSh ");

  const today = new Date().toISOString().split("T")[0];
  const currentMonthStr = new Date().toISOString().slice(0, 7); 

  const [activeTab, setActiveTab] = useState<"goals" | "history" | "completed">("goals");

  const [depositModal, setDepositModal] = useState({ isOpen: false, goalId: "", goalName: "", currentAmount: 0, targetAmount: 0 });
  const [depositInput, setDepositInput] = useState("");
  const [depositDate, setDepositDate] = useState(today);
  
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null); 
  const [destinationWalletId, setDestinationWalletId] = useState<string | null>(null); 
  const [isDepositing, setIsDepositing] = useState(false);
  
  // 🚀 NEW: State for Custom Dropdowns in the Deposit Modal
  const [isSourceWalletOpen, setIsSourceWalletOpen] = useState(false);
  const [isDestWalletOpen, setIsDestWalletOpen] = useState(false);

  const [goalToDelete, setGoalToDelete] = useState<any>(null);
  const [editModal, setEditModal] = useState({ isOpen: false, goalId: "", name: "", targetAmount: "", targetDate: "" });
  const [isEditing, setIsEditing] = useState(false);

  const [editDepositModal, setEditDepositModal] = useState({ isOpen: false, txId: "", goalName: "", amount: "", oldAmount: 0, date: "", oldDate: "" });
  const [isEditingDeposit, setIsEditingDeposit] = useState(false);
  const [deleteDepositModal, setDeleteDepositModal] = useState({ isOpen: false, txId: "", goalName: "", amount: 0 });

  const [warningModal, setWarningModal] = useState({ isOpen: false, title: "", message: "" });

  const [filterMonth, setFilterMonth] = useState(currentMonthStr);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(parseInt(currentMonthStr.split('-')[0]));

  const fetchData = async () => {
    try {
      const [goalsRes, historyRes, walletsRes] = await Promise.all([
        supabase.from("savings_goals").select("*").order("created_at", { ascending: false }),
        supabase.from("transactions").select("*").eq("category", "Savings").order("date", { ascending: false }),
        supabase.from("accounts").select("*").order("name", { ascending: true }) 
      ]);

      if (goalsRes.data) setGoals(goalsRes.data);
      if (historyRes.data) setHistory(historyRes.data);
      if (walletsRes.data) setWallets(walletsRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedCurrency = localStorage.getItem("app_currency");
    setCurrencySymbol(savedCurrency === "USD" ? "$" : "TSh ");
    
    fetchData();

    window.addEventListener("goalUpdated", fetchData);
    window.addEventListener("transactionUpdated", fetchData);
    return () => {
      window.removeEventListener("goalUpdated", fetchData);
      window.removeEventListener("transactionUpdated", fetchData);
    }
  }, []);

  const formatAmountForDisplay = (value: string) => {
    if (!value) return "";
    const parts = value.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  const cleanNumber = (val: string) => val.replace(/[^0-9.]/g, "");

  const handleDepositInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value.replace(/[^0-9.]/g, "");
    const parts = rawValue.split(".");
    if (parts.length > 2) rawValue = parts[0] + "." + parts.slice(1).join("");
    setDepositInput(rawValue);
  };

  const showAlert = (title: string, message: string) => {
    setWarningModal({ isOpen: true, title, message });
  };

  // --- GOAL ACTIONS ---
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
      fetchData();
    } else {
      showAlert("Update Failed", "Failed to update the savings goal.");
    }
  };

  const confirmDelete = async () => {
    if (!goalToDelete) return;
    const { error } = await supabase.from("savings_goals").delete().eq("id", goalToDelete.id);
    if (!error) setGoals((prev) => prev.filter((g) => g.id !== goalToDelete.id));
    setGoalToDelete(null);
  };

  const submitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const depositAmount = parseFloat(depositInput);
    
    if (isNaN(depositAmount) || depositAmount <= 0) return showAlert("Invalid Amount", "Please enter a valid amount.");
    if (!selectedWalletId || !destinationWalletId) return showAlert("Select Wallets", "Please select both a Source Wallet and a Destination Wallet.");
    if (selectedWalletId === destinationWalletId) return showAlert("Hold up!", "You cannot transfer money into the same wallet.");

    const remainingToTarget = depositModal.targetAmount - depositModal.currentAmount;
    if (depositAmount > remainingToTarget) {
      return showAlert("Hold up!", `You only need ${currencySymbol}${remainingToTarget.toLocaleString(undefined, { maximumFractionDigits: 2 })} to hit your target.`);
    }

    const fundingWallet = wallets.find(w => w.id === selectedWalletId);
    
    // Safety check just in case
    if (fundingWallet && Number(fundingWallet.balance) < depositAmount) {
      return showAlert("Insufficient Funds", "You do not have enough money in the selected source wallet.");
    }

    setIsDepositing(true);
    const destWallet = wallets.find(w => w.id === destinationWalletId);

    try {
      // 1. Update Goal Amount
      const newGoalAmount = depositModal.currentAmount + depositAmount;
      const { error: goalError } = await supabase.from("savings_goals").update({ current_amount: newGoalAmount }).eq("id", depositModal.goalId);
      if (goalError) throw goalError;

      // 2. Log Tx 1: Expense (Money Out)
      const { error: tx1Error } = await supabase.from("transactions").insert([{
        title: `Transfer to ${depositModal.goalName}`,
        amount: depositAmount,
        type: "expense",
        category: "Savings", 
        date: depositDate,
        account_id: selectedWalletId
      }]);
      if (tx1Error) throw tx1Error;

      // 3. Log Tx 2: Income (Money In - Contra)
      const { error: tx2Error } = await supabase.from("transactions").insert([{
        title: `Contra: Transfer to ${depositModal.goalName}`,
        amount: depositAmount,
        type: "income",
        category: "Transfer", 
        date: depositDate,
        account_id: destinationWalletId
      }]);
      if (tx2Error) throw tx2Error;

      // 4. Update Wallet Balances
      if (fundingWallet && destWallet) {
        await supabase.from("accounts").update({ balance: Number(fundingWallet.balance) - depositAmount }).eq("id", selectedWalletId);
        await supabase.from("accounts").update({ balance: Number(destWallet.balance) + depositAmount }).eq("id", destinationWalletId);
      }

      setDepositModal({ ...depositModal, isOpen: false });
      setSelectedWalletId(null);
      setDestinationWalletId(null);
      setIsSourceWalletOpen(false);
      setIsDestWalletOpen(false);
      fetchData(); 
      window.dispatchEvent(new Event("transactionUpdated")); 
    } catch (error) {
      showAlert("Transaction Failed", "There was an error processing your double-entry deposit.");
    } finally {
      setIsDepositing(false);
    }
  };

  const submitEditDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newAmount = parseFloat(editDepositModal.amount);
    if (isNaN(newAmount) || newAmount <= 0) return showAlert("Invalid Amount", "Please enter a valid amount.");

    const targetGoal = goals.find(g => g.name === editDepositModal.goalName);
    const amountDifference = newAmount - editDepositModal.oldAmount;

    if (targetGoal) {
      const prospectiveBalance = targetGoal.current_amount + amountDifference;
      if (prospectiveBalance > targetGoal.target_amount) {
        const maxAllowed = targetGoal.target_amount - targetGoal.current_amount + editDepositModal.oldAmount;
        return showAlert("Too much!", `The maximum you can update this to is ${currencySymbol}${maxAllowed.toLocaleString(undefined, { maximumFractionDigits: 2 })}.`);
      }
    }

    setIsEditingDeposit(true);

    try {
      const { data: tx1 } = await supabase.from("transactions").select("id, account_id").eq("id", editDepositModal.txId).single();
      const { data: tx2 } = await supabase.from("transactions").select("id, account_id")
        .eq("title", `Contra: Transfer to ${editDepositModal.goalName}`)
        .eq("amount", editDepositModal.oldAmount)
        .eq("date", editDepositModal.oldDate)
        .single();

      if (tx1 && tx1.account_id) {
        const { data: w1 } = await supabase.from("accounts").select("balance").eq("id", tx1.account_id).single();
        if (w1) await supabase.from("accounts").update({ balance: Number(w1.balance) - amountDifference }).eq("id", tx1.account_id);
        await supabase.from("transactions").update({ amount: newAmount, date: editDepositModal.date }).eq("id", tx1.id);
      }

      if (tx2 && tx2.account_id) {
        const { data: w2 } = await supabase.from("accounts").select("balance").eq("id", tx2.account_id).single();
        if (w2) await supabase.from("accounts").update({ balance: Number(w2.balance) + amountDifference }).eq("id", tx2.account_id);
        await supabase.from("transactions").update({ amount: newAmount, date: editDepositModal.date }).eq("id", tx2.id);
      }

      if (targetGoal) await supabase.from("savings_goals").update({ current_amount: targetGoal.current_amount + amountDifference }).eq("id", targetGoal.id);

      setEditDepositModal({ ...editDepositModal, isOpen: false });
      fetchData();
      window.dispatchEvent(new Event("transactionUpdated")); 
    } catch (error) {
      showAlert("Update Error", "Failed to balance your contra records.");
    } finally {
      setIsEditingDeposit(false);
    }
  };

  const confirmDeleteDeposit = async () => {
    const targetGoal = goals.find(g => g.name === deleteDepositModal.goalName);

    try {
      const { data: tx1 } = await supabase.from("transactions").select("id, account_id, amount, date").eq("id", deleteDepositModal.txId).single();
      
      let tx2 = null;
      if (tx1) {
        const { data } = await supabase.from("transactions").select("id, account_id, amount")
          .eq("title", `Contra: Transfer to ${deleteDepositModal.goalName}`)
          .eq("amount", tx1.amount)
          .eq("date", tx1.date).single();
        tx2 = data;
      }

      if (tx1 && tx1.account_id) {
        const { data: w1 } = await supabase.from("accounts").select("balance").eq("id", tx1.account_id).single();
        if (w1) await supabase.from("accounts").update({ balance: Number(w1.balance) + Number(tx1.amount) }).eq("id", tx1.account_id);
        await supabase.from("transactions").delete().eq("id", tx1.id);
      }

      if (tx2 && tx2.account_id) {
        const { data: w2 } = await supabase.from("accounts").select("balance").eq("id", tx2.account_id).single();
        if (w2) await supabase.from("accounts").update({ balance: Number(w2.balance) - Number(tx2.amount) }).eq("id", tx2.account_id);
        await supabase.from("transactions").delete().eq("id", tx2.id);
      }

      if (targetGoal) {
        const adjustedAmount = Math.max(0, targetGoal.current_amount - deleteDepositModal.amount);
        await supabase.from("savings_goals").update({ current_amount: adjustedAmount }).eq("id", targetGoal.id);
      }

      setDeleteDepositModal({ isOpen: false, txId: "", goalName: "", amount: 0 });
      fetchData();
      window.dispatchEvent(new Event("transactionUpdated")); 
    } catch (error) {
      showAlert("Delete Error", "Failed to reverse deposit and refund wallets.");
    }
  };

  const totalSaved = goals.reduce((acc, goal) => acc + Number(goal.current_amount), 0);
  const totalTarget = goals.reduce((acc, goal) => acc + Number(goal.target_amount), 0);
  const filteredHistory = history.filter(tx => tx.date.startsWith(filterMonth));

  const activeGoalsList = goals.filter(g => Number(g.current_amount) < Number(g.target_amount));
  const completedGoalsList = goals.filter(g => Number(g.current_amount) >= Number(g.target_amount));

  const selectedSourceWallet = wallets.find(w => w.id === selectedWalletId);
  const selectedDestWallet = wallets.find(w => w.id === destinationWalletId);

  // Insufficient Funds Check
  const amountValDeposit = parseFloat(depositInput) || 0;
  const isDepositInsufficient = selectedSourceWallet && Number(selectedSourceWallet.balance) < amountValDeposit;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6 md:space-y-8 pb-32 bg-transparent min-h-screen relative">
      
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
        <div className="absolute -inset-4 bg-gradient-to-br from-brand-500/10 to-brand-500/5 dark:from-brand-500/10 dark:to-brand-500/5 pointer-events-none rounded-[2rem]"></div>
        
        <div className="absolute -right-10 -bottom-10 text-brand-500/10 dark:text-brand-500/10 transition-colors">
          <PiggyBank size={150} className="md:w-[200px] md:h-[200px]" />
        </div>
        <div className="relative z-10 w-full md:w-auto">
          <p className="text-brand-600 dark:text-brand-400 font-semibold text-sm md:text-base mb-1 transition-colors">Total Saved Across All Goals</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white transition-colors break-words leading-tight">
            {currencySymbol}{totalSaved.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </h2>
        </div>
        <div className="relative z-10 text-left md:text-right mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-brand-500/10 dark:border-white/5">
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xs md:text-sm mb-1 transition-colors">Overall Target</p>
          <p className="text-xl md:text-2xl font-bold text-slate-700 dark:text-slate-200 transition-colors break-words">
            {currencySymbol}{totalTarget.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* Sleek Tab Navigation */}
      <div className="flex bg-slate-200/50 dark:bg-slate-900/50 p-1.5 rounded-2xl w-max border border-slate-300/50 dark:border-white/5 backdrop-blur-md relative z-10 overflow-x-auto max-w-full no-scrollbar">
        <button 
          onClick={() => setActiveTab('goals')}
          className={`px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${activeTab === 'goals' ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          Active Goals
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${activeTab === 'history' ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          Deposit History
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'completed' ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          Completed
          {completedGoalsList.length > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'completed' ? 'bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400' : 'bg-slate-200 dark:bg-slate-700'}`}>{completedGoalsList.length}</span>
          )}
        </button>
      </div>

      <div className="mt-6">
        {loading ? (
          <p className="text-slate-500 transition-colors font-medium">Decrypting your vault...</p>
        ) : activeTab === 'goals' ? (
          
          activeGoalsList.length === 0 ? (
            <div className="glass-card p-12 md:p-16 text-center rounded-[2rem] flex flex-col items-center transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-slate-100/80 dark:bg-white/5 flex items-center justify-center text-slate-400 mb-4 backdrop-blur-sm border border-slate-200/50 dark:border-white/5">
                <Target size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200 transition-colors">No active goals</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 transition-colors">What are you saving for next? Create a new goal above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300 slide-in-from-bottom-4">
              {activeGoalsList.map((goal) => {
                const percentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100);

                return (
                  <div key={goal.id} className="glass-card p-6 rounded-[2rem] relative group flex flex-col justify-between hover:bg-white/40 dark:hover:bg-white/5 transition-all duration-300">
                    <div className="absolute top-4 right-4 flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all z-10">
                      <button 
                        onClick={() => setEditModal({ isOpen: true, goalId: goal.id, name: goal.name, targetAmount: goal.target_amount.toString(), targetDate: new Date(goal.target_date).toISOString().split('T')[0] })}
                        className="text-slate-400 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 bg-slate-100/80 dark:bg-black/20 hover:bg-brand-100 dark:hover:bg-brand-500/10 p-2 rounded-lg backdrop-blur-md transition-colors"
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
                        <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-2xl bg-brand-50/80 dark:bg-brand-500/10 border border-brand-200/50 dark:border-brand-500/20 flex items-center justify-center text-brand-500 dark:text-brand-400 shadow-sm backdrop-blur-sm transition-colors">
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
                      
                      <div className="h-3 md:h-4 w-full bg-slate-100/80 dark:bg-slate-950/50 rounded-full overflow-hidden border border-slate-200/50 dark:border-white/5 mb-6 transition-colors shadow-inner backdrop-blur-sm">
                        <div 
                          className="h-full bg-brand-500 shadow-[0_0_15px_rgb(var(--brand-500)/0.5)] transition-all duration-1000 ease-out" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <button 
                      onClick={() => { 
                        setDepositModal({ isOpen: true, goalId: goal.id, goalName: goal.name, currentAmount: Number(goal.current_amount), targetAmount: Number(goal.target_amount) }); 
                        setDepositInput(""); 
                        setDepositDate(today); 
                        setSelectedWalletId(null);
                        setDestinationWalletId(null);
                        setIsSourceWalletOpen(false);
                        setIsDestWalletOpen(false);
                      }}
                      className="w-full py-3.5 rounded-2xl font-bold flex justify-center items-center gap-2 text-sm md:text-base transition-all active:scale-95 bg-white/80 text-slate-700 hover:bg-white border-slate-200 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:border-white/10 border backdrop-blur-md shadow-sm"
                    >
                      <PlusCircle size={18} /> Deposit Funds
                    </button>
                  </div>
                );
              })}
            </div>
          )

        ) : activeTab === 'completed' ? (
          
          completedGoalsList.length === 0 ? (
            <div className="glass-card p-12 md:p-16 text-center rounded-[2rem] flex flex-col items-center transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50/80 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4 backdrop-blur-sm border border-emerald-200/50 dark:border-emerald-500/20">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200 transition-colors">No completed goals</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 transition-colors">You haven't hit a target yet. Keep saving, you'll get there!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300 slide-in-from-bottom-4">
              {completedGoalsList.map((goal) => {
                const percentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100);

                return (
                  <div key={goal.id} className="glass-card p-6 rounded-[2rem] relative group flex flex-col justify-between hover:bg-white/40 dark:hover:bg-white/5 transition-all duration-300 opacity-90 hover:opacity-100">
                    <div className="absolute top-4 right-4 flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all z-10">
                      <button 
                        onClick={() => setEditModal({ isOpen: true, goalId: goal.id, name: goal.name, targetAmount: goal.target_amount.toString(), targetDate: new Date(goal.target_date).toISOString().split('T')[0] })}
                        className="text-slate-400 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 bg-slate-100/80 dark:bg-black/20 hover:bg-brand-100 dark:hover:bg-brand-500/10 p-2 rounded-lg backdrop-blur-md transition-colors"
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
                        <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-2xl bg-emerald-50/80 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shadow-sm backdrop-blur-sm transition-colors">
                          <CheckCircle2 size={24} />
                        </div>
                        <div className="truncate pr-16">
                          <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-200 transition-colors truncate">{goal.name}</h3>
                          <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 transition-colors">Target Reached!</p>
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
                      
                      <div className="h-3 md:h-4 w-full bg-slate-100/80 dark:bg-slate-950/50 rounded-full overflow-hidden border border-slate-200/50 dark:border-white/5 mb-6 transition-colors shadow-inner backdrop-blur-sm">
                        <div 
                          className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-out" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <button 
                      disabled
                      className="w-full py-3.5 rounded-2xl font-bold flex justify-center items-center gap-2 text-sm md:text-base transition-all bg-emerald-100/80 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 backdrop-blur-sm"
                    >
                      Goal Reached! 🎉
                    </button>
                  </div>
                );
              })}
            </div>
          )

        ) : (
          /* ============================================== */
          /* HISTORY VIEW */
          /* ============================================== */
          <div className="glass-card p-6 md:p-8 rounded-[2rem] transition-colors relative z-10 animate-in fade-in duration-300 slide-in-from-bottom-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-slate-200/80 dark:border-white/5 pb-4 relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-100 dark:border-brand-500/20">
                  <History size={20} />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 transition-colors">Deposit Ledger</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Manage and review your savings history</p>
                </div>
              </div>
              
              <div className="relative z-50 w-full sm:w-auto">
                <button
                  onClick={() => { setIsFilterOpen(!isFilterOpen); setPickerYear(parseInt(filterMonth.split('-')[0])); }}
                  className="flex items-center justify-between sm:justify-start gap-3 bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 shadow-sm backdrop-blur-md w-full sm:w-auto hover:bg-white/80 dark:hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <CalendarDays size={18} className="text-brand-500 dark:text-brand-400 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {MONTHS[parseInt(filterMonth.split('-')[1]) - 1]} {filterMonth.split('-')[0]}
                    </span>
                  </div>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button>

                {isFilterOpen && (
                  <>
                    <div className="fixed inset-0 z-40 bg-slate-900/10 dark:bg-black/40 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none animate-in fade-in duration-200" onClick={() => setIsFilterOpen(false)} />
                    
                    <div className="fixed left-4 right-4 bottom-24 sm:absolute sm:left-auto sm:right-0 sm:bottom-auto sm:top-full sm:mt-3 z-50 sm:w-72 glass-card rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200/80 dark:border-white/10 p-5 animate-in fade-in zoom-in-95 origin-bottom sm:origin-top-right duration-200">
                      <div className="flex justify-between items-center mb-4 px-2">
                        <button onClick={() => setPickerYear(y => y - 1)} className="p-1.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-500 transition-colors">
                          <ChevronLeft size={18}/>
                        </button>
                        <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">
                          {pickerYear}
                        </span>
                        <button onClick={() => setPickerYear(y => y + 1)} className="p-1.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-500 transition-colors">
                          <ChevronRight size={18}/>
                        </button>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {MONTHS.map((month, idx) => {
                          const isSelected = filterMonth === `${pickerYear}-${String(idx + 1).padStart(2, '0')}`;
                          return (
                            <button
                              key={month}
                              onClick={() => {
                                setFilterMonth(`${pickerYear}-${String(idx + 1).padStart(2, '0')}`);
                                setIsFilterOpen(false);
                              }}
                              className={`py-2.5 rounded-xl text-xs font-bold transition-all ${isSelected ? 'bg-brand-500 text-white shadow-[0_4px_14px_rgb(var(--brand-500)/0.4)] scale-105' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'}`}
                            >
                              {month}
                            </button>
                          )
                        })}
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-white/10 flex justify-center">
                        <button 
                          onClick={() => { setFilterMonth(currentMonthStr); setIsFilterOpen(false); }} 
                          className="text-xs font-bold text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 transition-colors px-4 py-2 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg"
                        >
                          Back to current month
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 text-slate-300 dark:text-slate-600 flex items-center justify-center mx-auto mb-3"><History size={24}/></div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No deposits found for this period.</p>
                </div>
              ) : (
                filteredHistory.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-slate-100/50 dark:hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-slate-200/50 dark:hover:border-white/5 group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center bg-emerald-50/50 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 border border-slate-200/30 dark:border-white/5 backdrop-blur-md transition-colors">
                        <PiggyBank size={18}/>
                      </div>
                      <div>
                        <p className="text-sm md:text-base font-semibold tracking-wide text-slate-900 dark:text-slate-100 transition-colors">{tx.title}</p>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 transition-colors">{new Date(tx.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="text-sm md:text-base font-bold tracking-tight text-emerald-600 dark:text-emerald-400 transition-colors">
                        +{currencySymbol}{Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      
                      <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                            onClick={() => {
                              const targetGoalName = tx.title.replace("Transfer to ", "");
                              setEditDepositModal({ isOpen: true, txId: tx.id, goalName: targetGoalName, amount: tx.amount.toString(), oldAmount: tx.amount, date: tx.date, oldDate: tx.date });
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
                            title="Edit Deposit"
                         >
                           <Pencil size={14}/>
                         </button>
                         <button 
                            onClick={() => {
                              const targetGoalName = tx.title.replace("Transfer to ", "");
                              setDeleteDepositModal({ isOpen: true, txId: tx.id, goalName: targetGoalName, amount: tx.amount });
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                            title="Reverse Transfer"
                         >
                           <Trash2 size={14}/>
                         </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* ============================================== */}
      {/* GENERIC WARNING MODAL */}
      {/* ============================================== */}
      {warningModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/10 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setWarningModal({ ...warningModal, isOpen: false })} />
          <div className="relative z-10 w-full max-w-sm glass-card rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-200 border border-amber-200/50 dark:border-amber-500/20">
            <div className="p-6 text-center pt-8">
              <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-200 dark:border-amber-500/30">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{warningModal.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                {warningModal.message}
              </p>
              <button 
                onClick={() => setWarningModal({ ...warningModal, isOpen: false })} 
                className="w-full py-3.5 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-[0_4px_14px_rgb(var(--brand-500)/0.4)] transition-all hover:-translate-y-0.5 active:scale-95"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================== */}
      {/* 🚀 UPGRADED: ADD DEPOSIT W/ DUAL WALLET SELECT */}
      {/* ============================================== */}
      {depositModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/10 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setDepositModal({ ...depositModal, isOpen: false })} />
          <div className="relative z-10 w-full max-w-sm glass-card rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-visible animate-in zoom-in-95 duration-200 border border-brand-200/50 dark:border-brand-500/20">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-200/80 dark:border-white/5 transition-colors">
              <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 transition-colors">Deposit Funds</h3>
              <button onClick={() => setDepositModal({ ...depositModal, isOpen: false })} className="text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 p-1 rounded-full"><X size={20} /></button>
            </div>
            
            <form onSubmit={submitDeposit} className="p-6 space-y-4">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Transferring money to <span className="font-bold text-brand-600 dark:text-brand-400">{depositModal.goalName}</span>.</p>
              
              <div className="grid grid-cols-1 gap-4">
                
                <div className="relative">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Amount ({currencySymbol})</label>
                  <input 
                    required type="text" inputMode="decimal" placeholder="e.g., 500.00" value={formatAmountForDisplay(depositInput)} onChange={handleDepositInputChange} 
                    className={`w-full bg-slate-50 dark:bg-slate-950/50 border rounded-xl px-4 py-3 focus:outline-none focus:ring-1 text-lg font-bold transition-colors ${isDepositInsufficient ? 'border-rose-500 focus:ring-rose-500 text-rose-600 dark:text-rose-400' : 'border-slate-200/80 dark:border-white/10 focus:ring-brand-500 text-slate-900 dark:text-slate-200'}`} autoFocus 
                  />
                  {/* 🚀 Insufficient Funds Warning */}
                  {isDepositInsufficient && (
                    <p className="text-xs text-rose-500 font-semibold mt-2 animate-in slide-in-from-top-1">
                      Insufficient funds in {selectedSourceWallet?.name}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Date of Transfer</label>
                  <input 
                    required type="date" value={depositDate} onChange={(e) => setDepositDate(e.target.value)} 
                    className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 [color-scheme:light] dark:[color-scheme:dark]" 
                  />
                </div>
                
                {/* 🚀 CUSTOM DUAL WALLET DROPDOWNS */}
                <div className="grid grid-cols-2 gap-3 mt-2 relative z-50">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-1.5 block">From (Deduct)</label>
                    <div className="relative">
                      <button 
                        type="button" 
                        onClick={() => { setIsSourceWalletOpen(!isSourceWalletOpen); setIsDestWalletOpen(false); }}
                        className={`w-full flex justify-between items-center bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors ${!selectedSourceWallet ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}
                      >
                        <span className="truncate">{selectedSourceWallet ? selectedSourceWallet.name : 'Select Source'}</span>
                        <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform duration-200 ${isSourceWalletOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isSourceWalletOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setIsSourceWalletOpen(false)} />
                          <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-48 overflow-y-auto custom-scrollbar">
                            {wallets.length === 0 ? <div className="px-3 py-3 text-xs text-slate-500 text-center">No wallets</div> : wallets.map((w) => (
                              <button key={w.id} type="button" onClick={() => { setSelectedWalletId(w.id); setIsSourceWalletOpen(false); }} className={`w-full text-left px-3 py-2.5 text-xs transition-colors flex items-center justify-between ${selectedWalletId === w.id ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'}`}>
                                <span className="truncate pr-2">{w.name}</span>
                                <span className="text-[10px] font-medium opacity-70 shrink-0">{currencySymbol}{Number(w.balance).toLocaleString()}</span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-1.5 block">To (Store)</label>
                    <div className="relative">
                      <button 
                        type="button" 
                        onClick={() => { setIsDestWalletOpen(!isDestWalletOpen); setIsSourceWalletOpen(false); }}
                        className={`w-full flex justify-between items-center bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors ${!selectedDestWallet ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}
                      >
                        <span className="truncate">{selectedDestWallet ? selectedDestWallet.name : 'Select Dest.'}</span>
                        <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform duration-200 ${isDestWalletOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isDestWalletOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setIsDestWalletOpen(false)} />
                          <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-48 overflow-y-auto custom-scrollbar">
                            {wallets.length === 0 ? <div className="px-3 py-3 text-xs text-slate-500 text-center">No wallets</div> : wallets.map((w) => (
                              <button key={w.id} type="button" onClick={() => { setDestinationWalletId(w.id); setIsDestWalletOpen(false); }} className={`w-full text-left px-3 py-2.5 text-xs transition-colors flex items-center justify-between ${destinationWalletId === w.id ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'}`}>
                                <span className="truncate pr-2">{w.name}</span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              <button type="submit" disabled={isDepositing || !depositInput || !selectedWalletId || !destinationWalletId || isDepositInsufficient} className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70 shadow-[0_8px_20px_-6px_rgb(var(--brand-500)/0.6)] mt-2">
                {isDepositing ? <Loader2 className="animate-spin" size={20} /> : "Confirm Transfer"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================== */}
      {/* MODAL: EDIT DEPOSIT */}
      {/* ============================================== */}
      {editDepositModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/10 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setEditDepositModal({ ...editDepositModal, isOpen: false })} />
          <div className="relative z-10 w-full max-w-sm glass-card rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-200/80 dark:border-white/5 transition-colors">
              <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 transition-colors">Edit Deposit</h3>
              <button onClick={() => setEditDepositModal({ ...editDepositModal, isOpen: false })} className="text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 p-1 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={submitEditDeposit} className="p-6 space-y-4">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Updating deposit for <span className="font-bold text-brand-600 dark:text-brand-400">{editDepositModal.goalName}</span>.</p>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Amount ({currencySymbol})</label>
                  <input 
                    required type="text" inputMode="decimal" value={formatAmountForDisplay(editDepositModal.amount)} onChange={(e) => {
                      let rawValue = e.target.value.replace(/[^0-9.]/g, "");
                      const parts = rawValue.split(".");
                      if (parts.length > 2) rawValue = parts[0] + "." + parts.slice(1).join("");
                      setEditDepositModal({ ...editDepositModal, amount: rawValue });
                    }} 
                    className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 text-lg font-bold" autoFocus 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Date of Deposit</label>
                  <input 
                    required type="date" value={editDepositModal.date} onChange={(e) => setEditDepositModal({ ...editDepositModal, date: e.target.value })} 
                    className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 [color-scheme:light] dark:[color-scheme:dark]" 
                  />
                </div>
              </div>

              <button type="submit" disabled={isEditingDeposit || !editDepositModal.amount} className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70 shadow-[0_8px_20px_-6px_rgb(var(--brand-500)/0.6)] mt-2">
                {isEditingDeposit ? <Loader2 className="animate-spin" size={20} /> : "Update Transfer"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================== */}
      {/* 🚀 UPGRADED: REVERSE DUAL DEPOSIT */}
      {/* ============================================== */}
      {deleteDepositModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/10 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setDeleteDepositModal({ isOpen: false, txId: "", goalName: "", amount: 0 })} />
          <div className="relative z-10 w-full max-w-sm glass-card rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center pt-8">
              <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-500/30">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Reverse Transfer?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                Are you sure you want to delete this deposit of <span className="font-bold text-slate-700 dark:text-slate-300">{currencySymbol}{deleteDepositModal.amount.toLocaleString()}</span>? Doing this will balance the contra, deduct the goal balance, and <span className="font-bold text-emerald-500">refund your original wallet</span>.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteDepositModal({ isOpen: false, txId: "", goalName: "", amount: 0 })} className="flex-1 py-3.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-white/5 dark:hover:bg-white/10 transition-colors active:scale-95">Cancel</button>
                <button onClick={confirmDeleteDeposit} className="flex-1 py-3.5 rounded-xl font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-[0_4px_14px_rgba(244,63,94,0.4)] transition-all hover:-translate-y-0.5 active:scale-95">Yes, Reverse</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================== */}
      {/* MODAL: EDIT GOAL */}
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
                <input required type="text" value={editModal.name} onChange={(e) => setEditModal({ ...editModal, name: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Target ({currencySymbol})</label>
                  <input required type="text" inputMode="decimal" value={formatAmountForDisplay(editModal.targetAmount)} onChange={(e) => setEditModal({ ...editModal, targetAmount: cleanNumber(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Target Date</label>
                  <input required type="date" value={editModal.targetDate} onChange={(e) => setEditModal({ ...editModal, targetDate: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 [color-scheme:light] dark:[color-scheme:dark]" />
                </div>
              </div>
              <button type="submit" disabled={isEditing} className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70 shadow-[0_8px_20px_-6px_rgb(var(--brand-500)/0.6)] mt-4">
                {isEditing ? <Loader2 className="animate-spin" size={20} /> : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================== */}
      {/* MODAL: DELETE GOAL */}
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