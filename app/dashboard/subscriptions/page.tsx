"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AddSubscriptionModal from "@/components/AddSubscriptionModal";
import EditSubscriptionModal from "@/components/EditSubscriptionModal"; 
import { ShieldCheck, Play, Music, Dumbbell, Zap, CreditCard, CalendarClock, Trash2, CheckCircle2, History, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Loader2, PlusCircle, AlertCircle, CheckCircle, X } from "lucide-react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const getSubIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('netflix') || lower.includes('hulu') || lower.includes('tv') || lower.includes('disney')) return <Play size={24} />;
  if (lower.includes('spotify') || lower.includes('apple') || lower.includes('music')) return <Music size={24} />;
  if (lower.includes('gym') || lower.includes('fitness')) return <Dumbbell size={24} />;
  if (lower.includes('electric') || lower.includes('water') || lower.includes('wifi')) return <Zap size={24} />;
  return <CreditCard size={24} />;
};

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [confirmPayment, setConfirmPayment] = useState<{isOpen: boolean, sub: any | null}>({ isOpen: false, sub: null });
  const [isPaying, setIsPaying] = useState<string | null>(null);
  
  // 🚀 UPDATED: Only Delete Modal State remains for History
  const [deleteTxModal, setDeleteTxModal] = useState({ isOpen: false, id: "", title: "", amount: "" });
  const [isUpdatingTx, setIsUpdatingTx] = useState(false);

  const [currencySymbol, setCurrencySymbol] = useState("TSh ");

  const [activeTab, setActiveTab] = useState<"active" | "completed" | "history">("active");
  
  const currentMonthStr = new Date().toISOString().slice(0, 7); 
  
  // A shared filter month for both Completed and History tabs
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(parseInt(currentMonthStr.split('-')[0]));

  const fetchSubsAndHistory = async () => {
    const [subsRes, txRes] = await Promise.all([
      supabase.from("subscriptions").select("*").order("billing_date", { ascending: true }),
      supabase.from("transactions").select("*").eq("category", "Subscription").order("date", { ascending: false })
    ]);

    if (!subsRes.error && subsRes.data) setSubscriptions(subsRes.data);
    if (!txRes.error && txRes.data) setHistory(txRes.data);
    
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
    if (!confirmPayment.sub) return;
    
    setIsPaying(confirmPayment.sub.id);
    const todayStr = new Date().toISOString().split('T')[0];
    
    const { error } = await supabase.from("transactions").insert([{
      title: `${confirmPayment.sub.name} Subscription`,
      amount: confirmPayment.sub.amount,
      type: "expense",
      category: "Subscription",
      date: todayStr
    }]);

    setIsPaying(null);
    setConfirmPayment({ isOpen: false, sub: null });
    
    if (!error) {
      fetchSubsAndHistory(); 
    } else {
      alert("Failed to log payment.");
    }
  };

  // Delete an existing payment record
  const confirmDeleteTx = async () => {
    setIsUpdatingTx(true);
    const { error } = await supabase.from("transactions").delete().eq("id", deleteTxModal.id);
    
    setIsUpdatingTx(false);
    if (!error) {
      setDeleteTxModal({ isOpen: false, id: "", title: "", amount: "" });
      fetchSubsAndHistory();
    } else {
      alert("Failed to delete payment record.");
    }
  };

  const totalMonthly = subscriptions.reduce((acc, sub) => acc + Number(sub.amount), 0);
  // We keep totalYearly for potential future use or logic, but we won't render it in the card anymore
  const totalYearly = totalMonthly * 12; 

  const today = new Date().getDate();
  
  // Checks if a sub has a corresponding payment in a SPECIFIC month
  const isPaidInMonth = (subName: string, monthStr: string) => {
    return history.some(tx => tx.title === `${subName} Subscription` && tx.date.startsWith(monthStr));
  };

  // 1. Active Subs (Always looks at current month to see what is owed NOW)
  const activeSubsList = subscriptions.filter(sub => !isPaidInMonth(sub.name, currentMonthStr)).sort((a, b) => {
    const aOverdue = today > a.billing_date;
    const bOverdue = today > b.billing_date;
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    return a.billing_date - b.billing_date;
  });

  // 🚀 NEW: Calculate exactly how much is left to pay this month
  const remainingThisMonth = activeSubsList.reduce((acc, sub) => acc + Number(sub.amount), 0);

  // 2. Completed Subs (Time Machine! Looks at whatever month is selected in the picker)
  const completedSubsList = subscriptions.filter(sub => isPaidInMonth(sub.name, selectedMonth));
  
  // 3. Next Bill (First unpaid sub for this month)
  const nextBill = activeSubsList.length > 0 ? activeSubsList[0] : null; 
  
  // 4. History Filter
  const filteredHistory = history.filter(tx => tx.date.startsWith(selectedMonth));

  // Shared Month Picker Component to keep JSX clean
  const MonthPickerOverlay = () => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-slate-200/80 dark:border-white/5 pb-4 relative">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
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
            <CalendarDays size={18} className="text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
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
                    <button key={month} onClick={() => { setSelectedMonth(`${pickerYear}-${String(idx + 1).padStart(2, '0')}`); setIsFilterOpen(false); }} className={`py-2.5 rounded-xl text-xs font-bold transition-all ${isSelected ? 'bg-indigo-500 text-white shadow-[0_4px_14px_rgba(99,102,241,0.4)] scale-105' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'}`}>
                      {month}
                    </button>
                  )
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-white/10 flex justify-center">
                <button onClick={() => { setSelectedMonth(currentMonthStr); setIsFilterOpen(false); }} className="text-xs font-bold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg">
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
    <div className="p-8 md:p-10 max-w-6xl mx-auto space-y-8 pb-20 bg-transparent min-h-screen relative">
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative z-50">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 transition-colors">Subscriptions</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">Manage your recurring monthly bills.</p>
        </div>
        <AddSubscriptionModal />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-[2rem] flex flex-col justify-center transition-colors">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 transition-colors">Total Monthly Cost</p>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 transition-colors break-words">
            {currencySymbol}{totalMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
        </div>
        
        {/* 🚀 UPGRADED: Remaining This Month Card */}
        <div className="glass-card p-6 rounded-[2rem] flex flex-col justify-center relative overflow-hidden transition-colors border border-indigo-100/50 dark:border-indigo-500/10">
          <div className="absolute -inset-4 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-500/5 dark:to-purple-500/5 pointer-events-none rounded-[2rem]"></div>
          <div className="relative z-10">
            <p className="text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-1 transition-colors">Remaining This Month</p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 transition-colors break-words">
              {currencySymbol}{remainingThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
        </div>

        <div className="glass-card p-6 rounded-[2rem] flex flex-col justify-center relative overflow-hidden transition-colors">
          <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/5 dark:to-purple-500/5 pointer-events-none rounded-[2rem]"></div>
          <div className="absolute -right-6 -top-6 text-indigo-500/10 dark:text-indigo-500/20 transition-colors">
            <CalendarClock size={100} />
          </div>
          <div className="relative z-10">
            <p className="text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-1 transition-colors">Next Bill Due</p>
            {nextBill ? (
              <>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 transition-colors truncate">{nextBill.name}</h2>
                <p className={`text-sm mt-1 transition-colors font-medium ${today > nextBill.billing_date ? "text-rose-500" : "text-indigo-500 dark:text-indigo-300/80"}`}>
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
          className={`px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${activeTab === 'active' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          Active Subscriptions
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'completed' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          Completed
          {completedSubsList.length > 0 && selectedMonth === currentMonthStr && (
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'completed' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' : 'bg-slate-200 dark:bg-slate-700'}`}>{completedSubsList.length}</span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${activeTab === 'history' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          Payment History
        </button>
      </div>

      <div className="mt-8">
        {loading ? (
          <p className="text-slate-500">Loading your vault data...</p>
        ) : activeTab === 'active' ? (
          
          /* ============================================== */
          /* ACTIVE SUBSCRIPTIONS VIEW (Due & Overdue) */
          /* ============================================== */
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
                      onClick={() => setConfirmPayment({ isOpen: true, sub })}
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

          /* ============================================== */
          /* 🚀 COMPLETED SUBSCRIPTIONS VIEW (Time Machine) */
          /* ============================================== */
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
          /* ============================================== */
          /* 🚀 PAYMENT HISTORY VIEW (Delete Only) */
          /* ============================================== */
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
                      <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center bg-indigo-50/50 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 border border-slate-200/30 dark:border-white/5 backdrop-blur-md transition-colors">
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
                      
                      {/* 🚀 UPDATED: Only Delete Action remains */}
                      <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setDeleteTxModal({ isOpen: true, id: tx.id, title: tx.title, amount: tx.amount.toString() })}
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

      {/* ============================================== */}
      {/* CONFIRM PAYMENT MODAL */}
      {/* ============================================== */}
      {confirmPayment.isOpen && confirmPayment.sub && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/10 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setConfirmPayment({ isOpen: false, sub: null })} />
          <div className="relative z-10 w-full max-w-sm glass-card rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-200 border border-indigo-200/50 dark:border-indigo-500/20">
            <div className="p-6 text-center pt-8">
              <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-200 dark:border-indigo-500/30">
                <CheckCircle size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Confirm Payment</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                Are you sure you want to log a payment of <span className="font-bold text-slate-700 dark:text-slate-300">{currencySymbol}{confirmPayment.sub.amount.toLocaleString()}</span> for your <span className="font-bold text-slate-700 dark:text-slate-300">{confirmPayment.sub.name}</span> subscription? This will update your cash flow.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmPayment({ isOpen: false, sub: null })} className="flex-1 py-3.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-white/5 dark:hover:bg-white/10 transition-colors active:scale-95">
                  Cancel
                </button>
                <button 
                  onClick={executeLogPayment} 
                  disabled={isPaying === confirmPayment.sub.id}
                  className="flex-1 py-3.5 rounded-xl font-bold text-white bg-indigo-500 hover:bg-indigo-600 shadow-[0_4px_14px_rgba(99,102,241,0.4)] transition-all hover:-translate-y-0.5 active:scale-95 flex justify-center items-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {isPaying === confirmPayment.sub.id ? <Loader2 className="animate-spin" size={18} /> : "Yes, Log It"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================== */}
      {/* 🚀 NEW: DELETE HISTORY PAYMENT MODAL */}
      {/* ============================================== */}
      {deleteTxModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/10 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setDeleteTxModal({ isOpen: false, id: "", title: "", amount: "" })} />
          <div className="relative z-10 w-full max-w-sm glass-card rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center pt-8">
              <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-500/30">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Delete Record?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                Are you sure you want to delete this payment of <span className="font-bold text-slate-700 dark:text-slate-300">{currencySymbol}{Number(deleteTxModal.amount).toLocaleString()}</span>? Doing this will automatically mark <span className="font-bold text-slate-700 dark:text-slate-300">{deleteTxModal.title}</span> as unpaid for this month.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTxModal({ isOpen: false, id: "", title: "", amount: "" })} className="flex-1 py-3.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-white/5 dark:hover:bg-white/10 transition-colors active:scale-95">Cancel</button>
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