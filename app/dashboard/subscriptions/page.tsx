"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AddSubscriptionModal from "@/components/AddSubscriptionModal";
import EditSubscriptionModal from "@/components/EditSubscriptionModal"; 
import { ShieldCheck, Play, Music, Dumbbell, Zap, CreditCard, CalendarClock, Trash2, CheckCircle2, History, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Loader2, PlusCircle, AlertCircle, CheckCircle, Smartphone, Landmark, Banknote, Wallet, Receipt } from "lucide-react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const getSubIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('netflix') || lower.includes('hulu') || lower.includes('tv') || lower.includes('disney')) return <Play size={24} />;
  if (lower.includes('spotify') || lower.includes('apple') || lower.includes('music')) return <Music size={24} />;
  if (lower.includes('gym') || lower.includes('fitness')) return <Dumbbell size={24} />;
  if (lower.includes('electric') || lower.includes('water') || lower.includes('wifi')) return <Zap size={24} />;
  return <CreditCard size={24} />;
};

const getWalletIcon = (type: string) => {
  const lower = (type || "").toLowerCase();
  if (lower.includes('mobile') || lower.includes('digital') || lower.includes('mpesa')) return <Smartphone size={18} />;
  if (lower.includes('bank')) return <Landmark size={18} />;
  if (lower.includes('cash')) return <Banknote size={18} />;
  return <Wallet size={18} />;
};

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [confirmPayment, setConfirmPayment] = useState<{isOpen: boolean, sub: any | null}>({ isOpen: false, sub: null });
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  
  const [transactionCharge, setTransactionCharge] = useState<string>("");
  const [isPaying, setIsPaying] = useState<string | null>(null);
  
  const [deleteTxModal, setDeleteTxModal] = useState({ isOpen: false, id: "", title: "", amount: "", charge_id: "" });
  const [isUpdatingTx, setIsUpdatingTx] = useState(false);

  const [currencySymbol, setCurrencySymbol] = useState("TSh ");

  const [activeTab, setActiveTab] = useState<"active" | "completed" | "history">("active");
  
  const currentMonthStr = new Date().toISOString().slice(0, 7); 
  
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(parseInt(currentMonthStr.split('-')[0]));

  const fetchSubsAndHistory = async () => {
    const [subsRes, txRes, walletsRes] = await Promise.all([
      supabase.from("subscriptions").select("*").order("billing_date", { ascending: true }),
      supabase.from("transactions").select("*").eq("category", "Subscription").order("date", { ascending: false }),
      supabase.from("accounts").select("*").order("name", { ascending: true }) 
    ]);

    if (!subsRes.error && subsRes.data) setSubscriptions(subsRes.data);
    if (!txRes.error && txRes.data) setHistory(txRes.data);
    
    if (!walletsRes.error && walletsRes.data) {
      setWallets(walletsRes.data);
      if (walletsRes.data.length > 0) setSelectedWalletId(walletsRes.data[0].id);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    const savedCurrency = localStorage.getItem("app_currency");
    setCurrencySymbol(savedCurrency === "USD" ? "$" : "TSh ");
    
    fetchSubsAndHistory();

    window.addEventListener("subscriptionUpdated", fetchSubsAndHistory);
    return () => window.removeEventListener("subscriptionUpdated", fetchSubsAndHistory);
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("subscriptions").delete().eq("id", id);
    if (!error) {
      setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));
    } else {
      console.error("Failed to delete", error);
    }
  };

  const executeLogPayment = async () => {
    if (!confirmPayment.sub || !selectedWalletId) return;
    
    setIsPaying(confirmPayment.sub.id);
    const todayStr = new Date().toISOString().split('T')[0];
    const subAmount = Number(confirmPayment.sub.amount);
    const chargeAmount = transactionCharge ? Number(transactionCharge) : 0;
    const totalDeduction = subAmount + chargeAmount;
    
    const selectedWallet = wallets.find(w => w.id === selectedWalletId);
    
    try {
      const transactionsToLog = [
        {
          title: `${confirmPayment.sub.name} Subscription`,
          amount: subAmount,
          type: "expense",
          category: "Subscription",
          date: todayStr,
          account_id: selectedWalletId 
        }
      ];

      if (chargeAmount > 0) {
        transactionsToLog.push({
          title: `Fee: ${confirmPayment.sub.name}`,
          amount: chargeAmount,
          type: "expense",
          category: "Bank Charges", 
          date: todayStr,
          account_id: selectedWalletId
        });
      }

      const { error: txError } = await supabase.from("transactions").insert(transactionsToLog);
      if (txError) throw txError;

      const newBalance = Number(selectedWallet.balance) - totalDeduction;
      const { error: accError } = await supabase
        .from("accounts")
        .update({ balance: newBalance })
        .eq("id", selectedWalletId);
        
      if (accError) throw accError;

      setConfirmPayment({ isOpen: false, sub: null });
      setTransactionCharge("");
      fetchSubsAndHistory(); 
      window.dispatchEvent(new Event("transactionUpdated")); 
    } catch (error) {
      console.error("SUPABASE ERROR:", error); 
      alert("Failed to log payment or update wallet. Check the console for details.");
    } finally {
      setIsPaying(null);
    }
  };

  const confirmDeleteTx = async () => {
    setIsUpdatingTx(true);
    try {
      const { data: txData } = await supabase.from("transactions").select("*").eq("id", deleteTxModal.id).single();
      
      if (txData && txData.account_id) {
        const { data: accData } = await supabase.from("accounts").select("balance").eq("id", txData.account_id).single();
        if (accData) {
          const restoredBalance = Number(accData.balance) + Number(txData.amount);
          await supabase.from("accounts").update({ balance: restoredBalance }).eq("id", txData.account_id);
        }
      }

      const { error } = await supabase.from("transactions").delete().eq("id", deleteTxModal.id);
      if (error) throw error;
      
      setDeleteTxModal({ isOpen: false, id: "", title: "", amount: "", charge_id: "" });
      fetchSubsAndHistory();
      window.dispatchEvent(new Event("transactionUpdated"));
    } catch (error) {
      console.error("SUPABASE DELETE ERROR:", error);
      alert("Failed to delete payment record or refund wallet.");
    } finally {
      setIsUpdatingTx(false);
    }
  };

  const totalMonthly = subscriptions.reduce((acc, sub) => acc + Number(sub.amount), 0);
  const today = new Date().getDate();
  
  const isPaidInMonth = (subName: string, monthStr: string) => {
    return history.some(tx => tx.title === `${subName} Subscription` && tx.date.startsWith(monthStr));
  };

  const activeSubsList = subscriptions.filter(sub => !isPaidInMonth(sub.name, currentMonthStr)).sort((a, b) => {
    const aOverdue = today > a.billing_date;
    const bOverdue = today > b.billing_date;
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    return a.billing_date - b.billing_date;
  });

  const remainingThisMonth = activeSubsList.reduce((acc, sub) => acc + Number(sub.amount), 0);
  const completedSubsList = subscriptions.filter(sub => isPaidInMonth(sub.name, selectedMonth));
  const nextBill = activeSubsList.length > 0 ? activeSubsList[0] : null; 
  const filteredHistory = history.filter(tx => tx.date.startsWith(selectedMonth));

  const MonthPickerOverlay = () => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-slate-200/80 dark:border-white/5 pb-4 relative">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-100 dark:border-brand-500/20">
          {activeTab === 'completed' ? <CheckCircle2 size={20} /> : <History size={20} />}
        </div>
        <div>
          <h3 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 transition-colors">
            {activeTab === 'completed' ? 'Completed Bills' : 'Payment Ledger'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {activeTab === 'completed' ? 'Subscriptions paid in this period' : 'Record of logged payments'}
          </p>
        </div>
      </div>
      
      <div className="relative z-50 w-full sm:w-auto">
        <button
          onClick={() => { setIsFilterOpen(!isFilterOpen); setPickerYear(parseInt(selectedMonth.split('-')[0])); }}
          className="flex items-center justify-between sm:justify-start gap-3 bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 shadow-sm backdrop-blur-md w-full sm:w-auto hover:bg-white/80 dark:hover:bg-white/10 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <CalendarDays size={18} className="text-brand-500 dark:text-brand-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {MONTHS[parseInt(selectedMonth.split('-')[1]) - 1]} {selectedMonth.split('-')[0]}
            </span>
          </div>
          <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
        </button>

        {isFilterOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-slate-900/10 dark:bg-black/40 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none animate-in fade-in duration-200" onClick={() => setIsFilterOpen(false)} />
            <div className="fixed left-4 right-4 bottom-24 sm:absolute sm:left-auto sm:right-0 sm:bottom-auto sm:top-full sm:mt-3 z-50 sm:w-72 bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200/80 dark:border-white/10 p-5 animate-in fade-in zoom-in-95 origin-bottom sm:origin-top-right duration-200">
              <div className="flex justify-between items-center mb-4 px-2">
                <button onClick={() => setPickerYear(y => y - 1)} className="p-1.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-500 transition-colors"><ChevronLeft size={18}/></button>
                <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">{pickerYear}</span>
                <button onClick={() => setPickerYear(y => y + 1)} className="p-1.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-500 transition-colors"><ChevronRight size={18}/></button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {MONTHS.map((month, idx) => {
                  const isSelected = selectedMonth === `${pickerYear}-${String(idx + 1).padStart(2, '0')}`;
                  return (
                    <button key={month} onClick={() => { setSelectedMonth(`${pickerYear}-${String(idx + 1).padStart(2, '0')}`); setIsFilterOpen(false); }} className={`py-2.5 rounded-xl text-xs font-bold transition-all ${isSelected ? 'bg-brand-500 text-white shadow-[0_4px_14px_rgb(var(--brand-500)/0.4)] scale-105' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'}`}>
                      {month}
                    </button>
                  )
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-white/10 flex justify-center">
                <button onClick={() => { setSelectedMonth(currentMonthStr); setIsFilterOpen(false); }} className="text-xs font-bold text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 transition-colors px-4 py-2 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg">
                  Back to current month
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-6xl mx-auto space-y-6 md:space-y-8 pb-20 bg-transparent min-h-screen relative overflow-x-hidden md:overflow-x-visible">
      
      {/* 🚀 UPGRADED: Stacked Left-Aligned Header Matching Savings Goals Page */}
      <header className="space-y-4 relative z-[100] w-full text-left">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 transition-colors">Subscriptions</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">Manage your recurring monthly bills.</p>
        </div>
        <div className="flex justify-start">
          <AddSubscriptionModal />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-[2rem] flex flex-col justify-center transition-colors">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 transition-colors">Total Monthly Cost</p>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 transition-colors break-words">
            {currencySymbol}{totalMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
        </div>
        
        <div className="glass-card p-6 rounded-[2rem] flex flex-col justify-center relative overflow-hidden transition-colors border border-brand-100/50 dark:border-brand-500/10">
          <div className="absolute -inset-4 bg-gradient-to-br from-brand-500/10 to-brand-500/5 dark:from-brand-500/10 dark:to-brand-500/5 pointer-events-none rounded-[2rem]"></div>
          <div className="relative z-10">
            <p className="text-brand-600 dark:text-brand-400 text-sm font-medium mb-1 transition-colors">Remaining This Month</p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 transition-colors break-words">
              {currencySymbol}{remainingThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
        </div>

        <div className="glass-card p-6 rounded-[2rem] flex flex-col justify-center relative overflow-hidden transition-colors">
          <div className="absolute -inset-4 bg-gradient-to-br from-brand-500/10 to-brand-500/5 dark:from-brand-500/10 dark:to-brand-500/5 pointer-events-none rounded-[2rem]"></div>
          <div className="absolute -right-6 -top-6 text-brand-500/10 dark:text-brand-500/20 transition-colors">
            <CalendarClock size={100} />
          </div>
          <div className="relative z-10">
            <p className="text-brand-600 dark:text-brand-400 text-sm font-medium mb-1 transition-colors">Next Bill Due</p>
            {nextBill ? (
              <>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 transition-colors truncate">{nextBill.name}</h2>
                <p className={`text-sm mt-1 transition-colors font-medium ${today > nextBill.billing_date ? "text-rose-500" : "text-brand-500 dark:text-brand-300/80"}`}>
                  {today > nextBill.billing_date ? "Overdue" : "Due"} on the {nextBill.billing_date}{[1,21,31].includes(nextBill.billing_date) ? 'st' : [2,22].includes(nextBill.billing_date) ? 'nd' : [3,23].includes(nextBill.billing_date) ? 'rd' : 'th'} • {currencySymbol}{Number(nextBill.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </>
            ) : (
              <h2 className="text-xl font-bold text-slate-500 dark:text-slate-400 transition-colors">All clear this month!</h2>
            )}
          </div>
        </div>
      </div>

      <div className="flex bg-slate-200/50 dark:bg-slate-900/50 p-1.5 rounded-2xl w-max border border-slate-300/50 dark:border-white/5 backdrop-blur-md relative z-10 overflow-x-auto max-w-full no-scrollbar">
        <button 
          onClick={() => setActiveTab('active')}
          className={`px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${activeTab === 'active' ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          Active Subscriptions
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'completed' ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          Completed
          {completedSubsList.length > 0 && selectedMonth === currentMonthStr && (
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'completed' ? 'bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400' : 'bg-slate-200 dark:bg-slate-700'}`}>{completedSubsList.length}</span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${activeTab === 'history' ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          Payment History
        </button>
      </div>

      <div className="mt-8">
        {loading ? (
          <p className="text-slate-500">Loading your vault data...</p>
        ) : activeTab === 'active' ? (
          
          activeSubsList.length === 0 ? (
            <div className="glass-card p-12 rounded-[2rem] text-center flex flex-col items-center justify-center transition-colors">
              <ShieldCheck size={48} className="mx-auto text-slate-400 dark:text-slate-600 mb-4 transition-colors" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200 transition-colors">All caught up!</h3>
              <p className="text-slate-500 mt-2">No active subscriptions due at this moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300 slide-in-from-bottom-4">
              {activeSubsList.map((sub) => {
                const isOverdue = today > sub.billing_date;

                return (
                  <div key={sub.id} className={`glass-card p-6 rounded-[2rem] hover:bg-white/40 dark:hover:bg-white/5 transition duration-300 flex flex-col justify-between relative group border-t-4 ${isOverdue ? 'border-t-rose-500/80 dark:border-t-rose-500/50' : 'border-t-amber-400/50 dark:border-t-amber-500/30'}`}>
                    
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
                      <EditSubscriptionModal sub={sub} />
                      <button 
                        onClick={() => handleDelete(sub.id)}
                        className="text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 bg-white/50 dark:bg-black/20 hover:bg-rose-100 dark:hover:bg-rose-500/10 p-2 rounded-lg transition-all backdrop-blur-md"
                        title="Delete Subscription"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex justify-between items-start">
                      <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shadow-sm backdrop-blur-sm transition-colors ${isOverdue ? 'bg-rose-50/80 border-rose-200/50 text-rose-500 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400' : 'bg-amber-50/80 border-amber-200/50 text-amber-500 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400'}`}>
                        {getSubIcon(sub.name)}
                      </div>
                      <span className={`flex items-center gap-1 border font-bold text-xs px-3 py-1.5 rounded-full mr-16 backdrop-blur-sm transition-colors ${isOverdue ? 'bg-rose-100/50 border-rose-200/50 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400' : 'bg-amber-100/50 border-amber-200/50 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400'}`}>
                        {isOverdue && <AlertCircle size={12} />}
                        {isOverdue ? 'OVERDUE' : `Due Day ${sub.billing_date}`}
                      </span>
                    </div>
                    
                    <div className="mt-6 mb-4">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-200 transition-colors truncate">{sub.name}</h3>
                      <div className="flex items-end gap-1 mt-1">
                        <span className="text-2xl font-bold text-slate-900 dark:text-slate-50 transition-colors break-words">
                          {currencySymbol}{Number(sub.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 text-sm mb-1 font-medium">/mo</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setConfirmPayment({ isOpen: true, sub });
                        setTransactionCharge("");
                      }}
                      className="w-full py-2.5 rounded-xl font-bold flex justify-center items-center gap-2 text-sm transition-all active:scale-95 bg-white/80 text-slate-700 hover:bg-white border-slate-200 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:border-white/10 border backdrop-blur-md shadow-sm"
                    >
                      <PlusCircle size={16} /> Log Payment
                    </button>
                  </div>
                );
              })}
            </div>
          )

        ) : activeTab === 'completed' ? (

          <div className="glass-card p-6 md:p-8 rounded-[2rem] transition-colors relative z-10 animate-in fade-in duration-300 slide-in-from-bottom-4">
            
            <MonthPickerOverlay />

            {completedSubsList.length === 0 ? (
              <div className="text-center py-12 border-t border-slate-200/50 dark:border-white/5 mt-4">
                <CheckCircle size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4 transition-colors" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-200 transition-colors">No completed bills</h3>
                <p className="text-sm text-slate-500 mt-2">No subscriptions were logged as paid for {MONTHS[parseInt(selectedMonth.split('-')[1]) - 1]} {selectedMonth.split('-')[0]}.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-slate-200/50 dark:border-white/5">
                {completedSubsList.map((sub) => (
                  <div key={sub.id} className="glass-card p-6 rounded-[2rem] transition duration-300 flex flex-col justify-between relative opacity-90">
                    <div className="flex justify-between items-start">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50/80 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shadow-sm backdrop-blur-sm transition-colors">
                        {getSubIcon(sub.name)}
                      </div>
                      <span className="flex items-center gap-1 bg-emerald-50/80 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs px-3 py-1.5 rounded-full backdrop-blur-sm transition-colors">
                        <CheckCircle2 size={12} /> Paid
                      </span>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-200 transition-colors truncate">{sub.name}</h3>
                      <div className="flex items-end gap-1 mt-1">
                        <span className="text-2xl font-bold text-slate-400 dark:text-slate-500 transition-colors line-through break-words">
                          {currencySymbol}{Number(sub.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        ) : (
          <div className="glass-card p-6 md:p-8 rounded-[2rem] transition-colors relative z-10 animate-in fade-in duration-300 slide-in-from-bottom-4">
            
            <MonthPickerOverlay />

            <div className="space-y-2">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 text-slate-300 dark:text-slate-600 flex items-center justify-center mx-auto mb-3"><History size={24}/></div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No payment records found for this period.</p>
                </div>
              ) : (
                filteredHistory.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-slate-100/50 dark:hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-slate-200/50 dark:hover:border-white/5 group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center bg-brand-50/50 dark:bg-brand-400/10 text-brand-600 dark:text-brand-400 border border-slate-200/30 dark:border-white/5 backdrop-blur-md transition-colors">
                        <CheckCircle2 size={18}/>
                      </div>
                      <div>
                        <p className="text-sm md:text-base font-semibold tracking-wide text-slate-900 dark:text-slate-100 transition-colors">{tx.title}</p>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 transition-colors">Paid on {new Date(tx.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="text-sm md:text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 transition-colors">
                        {currencySymbol}{Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      
                      <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setDeleteTxModal({ isOpen: true, id: tx.id, title: tx.title, amount: tx.amount.toString(), charge_id: "" })}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                          title="Delete Log"
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

      {confirmPayment.isOpen && confirmPayment.sub && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/10 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setConfirmPayment({ isOpen: false, sub: null })} />
          <div className="relative z-10 w-full max-w-sm glass-card rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-200 border border-brand-200/50 dark:border-brand-500/20">
            <div className="p-6 text-center pt-8">
              <div className="w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-500 dark:text-brand-400 flex items-center justify-center mx-auto mb-4 border border-brand-200 dark:border-brand-500/30">
                <CheckCircle size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Log Payment</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Paying <span className="font-bold text-slate-700 dark:text-slate-300">{currencySymbol}{confirmPayment.sub.amount.toLocaleString()}</span> for <span className="font-bold text-slate-700 dark:text-slate-300">{confirmPayment.sub.name}</span>.
              </p>

              <div className="text-left mb-6 relative">
                <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-2 block">
                  Txn / Bank Charge (Optional)
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-slate-400">
                    <Receipt size={18} />
                  </div>
                  <input
                    type="number"
                    value={transactionCharge}
                    onChange={(e) => setTransactionCharge(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="text-left mb-8 text-slate-900 dark:text-slate-100">
                <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-3 block">
                  Select Payment Wallet
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                  {wallets.map((wallet) => (
                    <button
                      key={wallet.id}
                      onClick={() => setSelectedWalletId(wallet.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                        selectedWalletId === wallet.id 
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400' 
                        : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={selectedWalletId === wallet.id ? 'text-brand-500 dark:text-brand-400' : 'text-slate-500'}>
                          {getWalletIcon(wallet.type)}
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold leading-none">{wallet.name}</p>
                          <p className="text-[10px] mt-1 opacity-80">Bal: {currencySymbol}{Number(wallet.balance).toLocaleString()}</p>
                        </div>
                      </div>
                      {selectedWalletId === wallet.id && <div className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_8px_rgb(var(--brand-500)/0.8)]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => { setConfirmPayment({ isOpen: false, sub: null }); setTransactionCharge(""); }} className="flex-1 py-3.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-white/5 dark:hover:bg-white/10 transition-colors active:scale-95">
                  Cancel
                </button>
                <button 
                  onClick={executeLogPayment} 
                  disabled={isPaying === confirmPayment.sub.id || !selectedWalletId}
                  className="flex-1 py-3.5 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-[0_4px_14px_rgb(var(--brand-500)/0.4)] transition-all hover:-translate-y-0.5 active:scale-95 flex justify-center items-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {isPaying === confirmPayment.sub.id ? <Loader2 className="animate-spin" size={18} /> : "Yes, Log It"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteTxModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/10 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setDeleteTxModal({ isOpen: false, id: "", title: "", amount: "", charge_id: "" })} />
          <div className="relative z-10 w-full max-w-sm glass-card rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center pt-8">
              <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-500/30">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Delete Record?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                Are you sure you want to delete this payment of <span className="font-bold text-slate-700 dark:text-slate-300">{currencySymbol}{Number(deleteTxModal.amount).toLocaleString()}</span>? Doing this will automatically mark <span className="font-bold text-slate-700 dark:text-slate-300">{deleteTxModal.title}</span> as unpaid for this month and <span className="font-bold text-emerald-500">refund your wallet</span>.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTxModal({ isOpen: false, id: "", title: "", amount: "", charge_id: "" })} className="flex-1 py-3.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-white/5 dark:hover:bg-white/10 transition-colors active:scale-95">Cancel</button>
                <button 
                  onClick={confirmDeleteTx} 
                  disabled={isUpdatingTx}
                  className="flex-1 py-3.5 rounded-xl font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-[0_4px_14px_rgba(244,63,94,0.4)] transition-all hover:-translate-y-0.5 active:scale-95 flex justify-center items-center disabled:opacity-70"
                >
                  {isUpdatingTx ? <Loader2 className="animate-spin" size={18} /> : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}