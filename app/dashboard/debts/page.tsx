"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  CreditCard, Home, Car, GraduationCap, Building, 
  PlusCircle, Trash2, TrendingDown, Target, X, Loader2, ChevronDown, 
  ArrowUpRight, Users, Briefcase, Wallet, ChevronLeft, ChevronRight, CheckCircle2
} from "lucide-react";

const DEBT_CATEGORIES = ["Credit Card", "Car Loan", "Student Loan", "Mortgage", "Personal Loan"];
const RECEIVABLE_CATEGORIES = ["Friend/Family", "Business", "Personal Loan", "IOU", "Other"];

const ITEMS_PER_PAGE = 6;

export default function DebtsPage() {
  const [debts, setDebts] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState("TSh ");

  const [activeTab, setActiveTab] = useState<'liability' | 'receivable'>('liability');
  const [statusFilter, setStatusFilter] = useState<'ongoing' | 'completed'>('ongoing');
  const [currentPage, setCurrentPage] = useState(1);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const [addForm, setAddForm] = useState({ 
    name: "", total_amount: "", interest_rate: "", min_payment: "", 
    category: "Credit Card", type: "liability" as 'liability' | 'receivable',
    wallet_id: "" 
  });
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);

  const [paymentModal, setPaymentModal] = useState({ isOpen: false, id: "", name: "", remaining: 0, wallet_id: "" });
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [isPaymentWalletOpen, setIsPaymentWalletOpen] = useState(false);

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: "", name: "" });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [debtsRes, walletsRes] = await Promise.all([
      supabase.from("debts").select("*").order("created_at", { ascending: false }),
      supabase.from("accounts").select("*").eq('user_id', user.id).order('created_at', { ascending: false })
    ]);

    if (debtsRes.data) {
      const processedData = debtsRes.data.map(d => ({ ...d, type: d.type || 'liability' }));
      setDebts(processedData);
      
      const currentFiltered = processedData.filter(d => 
        d.type === activeTab && 
        (statusFilter === 'ongoing' ? Number(d.remaining_amount) > 0 : Number(d.remaining_amount) <= 0)
      );
      const maxPages = Math.ceil(currentFiltered.length / ITEMS_PER_PAGE);
      if (currentPage > maxPages && maxPages > 0) setCurrentPage(maxPages);
    }
    
    if (walletsRes.data) setWallets(walletsRes.data);
    setLoading(false);
  };

  useEffect(() => {
    const savedCurrency = localStorage.getItem("app_currency");
    setCurrencySymbol(savedCurrency === "USD" ? "$" : "TSh ");
    fetchData();
  }, []);

  const formatAmountForDisplay = (value: string) => {
    if (!value) return "";
    const parts = value.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  const cleanNumber = (val: string) => val.replace(/[^0-9.]/g, "");

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Mortgage": return <Home size={24} />;
      case "Car Loan": return <Car size={24} />;
      case "Student Loan": return <GraduationCap size={24} />;
      case "Personal Loan": return <Building size={24} />;
      case "Friend/Family": return <Users size={24} />;
      case "Business": return <Briefcase size={24} />;
      case "IOU": return <CreditCard size={24} />;
      case "Other": return <Target size={24} />;
      default: return <CreditCard size={24} />;
    }
  };

  const handleTypeToggle = (type: 'liability' | 'receivable') => {
    setAddForm({
      ...addForm,
      type,
      category: type === 'liability' ? "Credit Card" : "Friend/Family"
    });
  };

  const handleTabChange = (tab: 'liability' | 'receivable') => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleStatusChange = (status: 'ongoing' | 'completed') => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleAddDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.wallet_id) return alert("Please select a wallet!");
    
    const amount = parseFloat(addForm.total_amount);
    const selectedWallet = wallets.find(w => w.id === addForm.wallet_id);
    
    if (addForm.type === 'receivable' && selectedWallet && Number(selectedWallet.balance) < amount) {
      return alert("Insufficient funds in the selected wallet.");
    }

    setIsAdding(true);
    
    const { error } = await supabase.from("debts").insert([{
      name: addForm.name,
      total_amount: amount,
      remaining_amount: amount, 
      interest_rate: parseFloat(addForm.interest_rate) || 0,
      min_payment: parseFloat(addForm.min_payment) || 0,
      category: addForm.category,
      type: addForm.type 
    }]);

    if (!error) {
      const isLiability = addForm.type === 'liability';
      
      const { error: txError } = await supabase.from("transactions").insert([{
        title: isLiability ? `Borrowed: ${addForm.name}` : `Lent: ${addForm.name}`,
        amount: amount,
        type: isLiability ? 'income' : 'expense',
        category: isLiability ? 'Loan Received' : 'Loan Given',
        date: new Date().toISOString().split("T")[0],
        account_id: addForm.wallet_id 
      }]);

      if (selectedWallet) {
        const newBalance = isLiability 
          ? Number(selectedWallet.balance) + amount 
          : Number(selectedWallet.balance) - amount;
        await supabase.from("accounts").update({ balance: newBalance }).eq("id", addForm.wallet_id);
      }

      if (txError) {
        console.error("Failed to adjust liquid cash:", txError);
      } else {
        window.dispatchEvent(new Event("transactionUpdated"));
      }

      setIsAddModalOpen(false);
      setAddForm({ name: "", total_amount: "", interest_rate: "", min_payment: "", category: "Credit Card", type: "liability", wallet_id: "" });
      
      setActiveTab(addForm.type);
      setStatusFilter('ongoing');
      setCurrentPage(1);
      
      fetchData(); 
    } else {
      alert("Failed to add record.");
    }
    setIsAdding(false);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModal.wallet_id) return alert("Please select a wallet!");
    
    const payAmount = parseFloat(paymentAmount) || 0;
    const targetRecord = debts.find(d => d.id === paymentModal.id);
    const isReceivable = targetRecord?.type === 'receivable';
    const selectedWallet = wallets.find(w => w.id === paymentModal.wallet_id);

    if (payAmount > paymentModal.remaining) return;
    
    if (!isReceivable && selectedWallet && Number(selectedWallet.balance) < payAmount) {
      return alert("Insufficient funds in the selected wallet.");
    }

    setIsPaying(true);
    
    const newRemaining = Math.max(0, paymentModal.remaining - payAmount);

    const { error: debtError } = await supabase
      .from("debts")
      .update({ remaining_amount: newRemaining })
      .eq("id", paymentModal.id);

    const { error: txError } = await supabase
      .from("transactions")
      .insert([{
        title: isReceivable ? `Received: ${paymentModal.name}` : `Payment: ${paymentModal.name}`,
        amount: payAmount,
        type: isReceivable ? "income" : "expense",
        category: isReceivable ? "Debt Repayment" : "Debt Paydown",
        date: new Date().toISOString().split("T")[0],
        account_id: paymentModal.wallet_id 
      }]);

    if (selectedWallet) {
      const newBalance = isReceivable 
        ? Number(selectedWallet.balance) + payAmount 
        : Number(selectedWallet.balance) - payAmount;
      await supabase.from("accounts").update({ balance: newBalance }).eq("id", paymentModal.wallet_id);
    }

    setIsPaying(false);
    if (!debtError && !txError) {
      setPaymentModal({ ...paymentModal, isOpen: false });
      setPaymentAmount("");
      
      if (newRemaining <= 0) {
        setStatusFilter('completed');
        setCurrentPage(1);
      }

      fetchData(); 
      window.dispatchEvent(new Event("transactionUpdated"));
    } else {
      alert("Failed to process payment.");
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    const { error } = await supabase.from("debts").delete().eq("id", deleteModal.id);
    setIsDeleting(false);
    
    if (!error) {
      setDeleteModal({ isOpen: false, id: "", name: "" });
      fetchData();
    } else {
      alert("Failed to delete record.");
    }
  };

  const allDebtsInCurrentTab = debts.filter(d => d.type === activeTab);
  const totalOutstanding = allDebtsInCurrentTab.reduce((acc, d) => acc + Number(d.remaining_amount), 0);
  const totalOriginal = allDebtsInCurrentTab.reduce((acc, d) => acc + Number(d.total_amount), 0);
  const totalMinPayments = allDebtsInCurrentTab.reduce((acc, d) => acc + (d.remaining_amount > 0 ? Number(d.min_payment) : 0), 0);
  const overallProgress = totalOriginal > 0 ? ((totalOriginal - totalOutstanding) / totalOriginal) * 100 : 0;

  const filteredDebts = allDebtsInCurrentTab.filter(d => {
    const isPaidOff = Number(d.remaining_amount) <= 0;
    return statusFilter === 'ongoing' ? !isPaidOff : isPaidOff;
  });

  const totalPages = Math.ceil(filteredDebts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDebts = filteredDebts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const isLiabilityTab = activeTab === 'liability';
  const themeColor = isLiabilityTab ? 'rose' : 'emerald';
  const selectedWalletForAdd = wallets.find(w => w.id === addForm.wallet_id);
  const selectedWalletForPayment = wallets.find(w => w.id === paymentModal.wallet_id);

  const amountValAdd = parseFloat(addForm.total_amount) || 0;
  const isAddInsufficient = addForm.type === 'receivable' && selectedWalletForAdd && Number(selectedWalletForAdd.balance) < amountValAdd;

  const amountValPay = parseFloat(paymentAmount) || 0;
  const isTargetLiability = debts.find(d => d.id === paymentModal.id)?.type === 'liability';
  const isPayInsufficient = isTargetLiability && selectedWalletForPayment && Number(selectedWalletForPayment.balance) < amountValPay;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6 md:space-y-8 pb-32 relative bg-transparent min-h-screen transition-colors duration-300">
      
      <header className="flex justify-between items-end relative z-50">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 transition-colors">Debts & Loans</h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Track what you owe, and what is owed to you.</p>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => {
              setAddForm(prev => ({ ...prev, wallet_id: wallets.length > 0 ? wallets[0].id : "" }));
              setIsAddModalOpen(true);
            }}
            className="bg-brand-600 hover:bg-brand-500 text-white shadow-[0_8px_20px_-6px_rgb(var(--brand-500)/0.6)] border border-white/20 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 text-xs md:text-sm"
          >
            <PlusCircle size={16} /> <span className="hidden sm:inline">Add Record</span><span className="sm:hidden">Add</span>
          </button>

          {isAddModalOpen && (
            <>
              <div className="fixed inset-0 z-40 bg-slate-900/10 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 cursor-default" onClick={() => setIsAddModalOpen(false)} />
              <div className="fixed left-4 right-4 top-24 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 z-50 sm:w-[420px] glass-card rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in zoom-in-95 origin-top sm:origin-top-right duration-200 flex flex-col max-h-[85vh]">
                <div className="flex justify-between items-center p-6 border-b border-slate-200/80 dark:border-white/5 transition-colors shrink-0">
                  <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Add New Record</h3>
                  <button onClick={() => setIsAddModalOpen(false)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/5"><X size={20} /></button>
                </div>

                <form onSubmit={handleAddDebt} className="p-6 space-y-4 overflow-y-auto custom-scrollbar pb-32">
                  <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl mb-2 border border-slate-200/50 dark:border-white/5">
                    <button type="button" onClick={() => handleTypeToggle('liability')} className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-lg transition-all ${addForm.type === 'liability' ? 'bg-white dark:bg-slate-800 shadow-sm text-rose-600 dark:text-rose-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}><TrendingDown size={14}/> I Owe Money</button>
                    <button type="button" onClick={() => handleTypeToggle('receivable')} className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-lg transition-all ${addForm.type === 'receivable' ? 'bg-white dark:bg-slate-800 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}><ArrowUpRight size={14}/> Owed To Me</button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-400 mb-1">{addForm.type === 'liability' ? 'Debt Name' : 'Who owes you?'}</label>
                    <input required type="text" placeholder={addForm.type === 'liability' ? "e.g., Chase Sapphire, Car Loan" : "e.g., John Doe, Dinner Split"} value={addForm.name} onChange={(e) => setAddForm({...addForm, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors" />
                  </div>

                  {/* 🚀 FIXED: Added dynamic z-index here */}
                  <div className={`relative ${isWalletOpen ? 'z-50' : ''}`}>
                    <label className="block text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-400 mb-1">{addForm.type === 'liability' ? 'Deposit Loan Into' : 'Take Money From'}</label>
                    <button type="button" onClick={() => setIsWalletOpen(!isWalletOpen)} className={`w-full flex justify-between items-center bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-left focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors ${!selectedWalletForAdd ? 'text-slate-400' : 'text-slate-900 dark:text-slate-200'}`}>
                      <span className="truncate">{selectedWalletForAdd ? `${selectedWalletForAdd.name} (${currencySymbol}${Number(selectedWalletForAdd.balance).toLocaleString()})` : 'Select a wallet...'}</span>
                      <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform duration-200 ${isWalletOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isWalletOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsWalletOpen(false)} />
                        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-48 overflow-y-auto custom-scrollbar">
                          {wallets.length === 0 ? <div className="px-4 py-3 text-sm text-slate-500 text-center">No wallets found.</div> : wallets.map((w) => (
                              <button key={w.id} type="button" onClick={() => { setAddForm({ ...addForm, wallet_id: w.id }); setIsWalletOpen(false); }} className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${addForm.wallet_id === w.id ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'}`}>
                                <span className="truncate pr-2">{w.name}</span>
                                <span className="text-xs font-medium opacity-70 shrink-0">{currencySymbol}{Number(w.balance).toLocaleString()}</span>
                              </button>
                          ))}
                        </div>
                      </>
                    )}
                    {wallets.length === 0 && <p className="text-xs text-rose-500 mt-1">You need to add a Wallet first to borrow/lend money!</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-400 mb-1">Total Amount ({currencySymbol})</label>
                      <input 
                        required 
                        type="text" 
                        inputMode="decimal" 
                        placeholder="0.00" 
                        value={formatAmountForDisplay(addForm.total_amount)} 
                        onChange={(e) => setAddForm({...addForm, total_amount: cleanNumber(e.target.value)})} 
                        className={`w-full bg-slate-50 dark:bg-slate-950/50 border rounded-xl px-4 py-3 font-bold focus:outline-none focus:ring-1 transition-colors ${isAddInsufficient ? 'border-rose-500 focus:ring-rose-500 text-rose-600 dark:text-rose-400' : 'border-slate-200/80 dark:border-white/10 focus:ring-brand-500 focus:border-brand-500 text-slate-900 dark:text-slate-200'}`} 
                      />
                      {isAddInsufficient && (
                        <p className="text-xs text-rose-500 font-semibold mt-2 animate-in slide-in-from-top-1 col-span-2 absolute">
                          Insufficient funds in {selectedWalletForAdd?.name}
                        </p>
                      )}
                    </div>
                    
                    {/* 🚀 FIXED: Added dynamic z-index here */}
                    <div className={`relative ${isCategoryOpen ? 'z-50' : ''}`}>
                      <label className="block text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-400 mb-1">Category</label>
                      <button type="button" onClick={() => setIsCategoryOpen(!isCategoryOpen)} className="w-full flex justify-between items-center bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors">
                        <span className="truncate">{addForm.category}</span>
                        <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isCategoryOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setIsCategoryOpen(false)} />
                          <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-48 overflow-y-auto custom-scrollbar">
                            {(addForm.type === 'liability' ? DEBT_CATEGORIES : RECEIVABLE_CATEGORIES).map((cat) => (
                              <button key={cat} type="button" onClick={() => { setAddForm({ ...addForm, category: cat }); setIsCategoryOpen(false); }} className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${addForm.category === cat ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'}`}>{cat}</button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div>
                      <label className="block text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-400 mb-1">Interest (APR %)</label>
                      <input type="number" step="0.1" placeholder="e.g., 19.9" value={addForm.interest_rate} onChange={(e) => setAddForm({...addForm, interest_rate: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-400 mb-1">Min. Pay /mo</label>
                      <input type="number" placeholder="0.00" value={addForm.min_payment} onChange={(e) => setAddForm({...addForm, min_payment: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors" />
                    </div>
                  </div>
                  
                  <button type="submit" disabled={isAdding || wallets.length === 0 || !addForm.wallet_id || isAddInsufficient} className="w-full shrink-0 bg-brand-600 hover:bg-brand-500 text-white shadow-[0_8px_20px_-6px_rgb(var(--brand-500)/0.6)] border border-white/20 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 font-bold py-3.5 rounded-xl mt-4 flex justify-center items-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0">
                    {isAdding ? <Loader2 className="animate-spin" size={20} /> : "Save Record"}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Main Tab Navigation */}
      <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl w-fit border border-slate-200 dark:border-white/10 relative z-40">
        <button onClick={() => handleTabChange('liability')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'liability' ? 'bg-white dark:bg-slate-800 shadow-sm text-rose-600 dark:text-rose-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
          Money I Owe
        </button>
        <button onClick={() => handleTabChange('receivable')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'receivable' ? 'bg-white dark:bg-slate-800 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
          Owed To Me
        </button>
      </div>

      {/* The Master Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
        <div className={`glass-card p-6 md:p-8 rounded-[2rem] relative overflow-hidden transition-colors border border-${themeColor}-500/10`}>
          <div className={`absolute -top-24 -right-24 w-64 h-64 bg-${themeColor}-500/10 blur-3xl rounded-full pointer-events-none transition-colors`}></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className={`text-${themeColor}-600 dark:text-${themeColor}-400 font-bold mb-1 tracking-wide uppercase text-xs md:text-sm flex items-center gap-2 transition-colors`}>
                {isLiabilityTab ? <TrendingDown size={16} /> : <ArrowUpRight size={16} />}
                {isLiabilityTab ? "Total Outstanding Debt" : "Total Owed To Me"}
              </p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mt-2 transition-colors break-words leading-tight">
                {currencySymbol}{totalOutstanding.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </h2>
            </div>
          </div>
          <div className="relative z-10 mt-6 pt-6 border-t border-slate-200/50 dark:border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-2 transition-colors">
            <span className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400">
              {isLiabilityTab ? "Total Monthly Minimums:" : "Expected Monthly Returns:"}
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-200 text-sm md:text-base">{currencySymbol}{totalMinPayments.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</span>
          </div>
        </div>

        <div className="glass-card p-6 md:p-8 rounded-[2rem] flex flex-col justify-center transition-colors border border-brand-500/10 relative overflow-hidden">
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-brand-500/10 blur-3xl rounded-full pointer-events-none transition-colors"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-brand-600 dark:text-brand-400 font-bold mb-1 tracking-wide uppercase text-xs md:text-sm flex items-center gap-2 transition-colors">
                  <Target size={16} /> {isLiabilityTab ? "Paydown Progress" : "Collection Progress"}
                </p>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white transition-colors">{overallProgress.toFixed(1)}% {isLiabilityTab ? "Paid Off" : "Collected"}</h3>
              </div>
              <div className="text-right">
                <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-medium">Original Total</p>
                <p className="text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300">{currencySymbol}{totalOriginal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
            </div>
            <div className="h-3 md:h-4 w-full bg-slate-100/80 dark:bg-slate-900/50 rounded-full overflow-hidden transition-colors shadow-inner border border-slate-200/50 dark:border-white/5">
              <div className="h-full bg-gradient-to-r from-brand-400 to-brand-500 transition-all duration-1000 ease-out shadow-[0_0_15px_rgb(var(--brand-500)/0.5)]" style={{ width: `${overallProgress}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation (Ongoing vs Completed) & Grid */}
      <div className="mt-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {statusFilter === 'ongoing' ? (isLiabilityTab ? 'Active Liabilities' : 'Pending Receivables') : 'Settled Records'}
          </h3>
          
          <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl w-fit border border-slate-200 dark:border-white/10">
            <button 
              onClick={() => handleStatusChange('ongoing')} 
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${statusFilter === 'ongoing' ? 'bg-white dark:bg-slate-800 shadow text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Ongoing
            </button>
            <button 
              onClick={() => handleStatusChange('completed')} 
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${statusFilter === 'completed' ? 'bg-white dark:bg-slate-800 shadow text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Completed
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-brand-500" size={32} /></div>
        ) : paginatedDebts.length === 0 ? (
          <div className="glass-card p-12 md:p-16 text-center rounded-[2rem] flex flex-col items-center transition-colors">
            <div className="w-16 h-16 rounded-2xl bg-slate-100/80 dark:bg-white/5 flex items-center justify-center text-slate-400 mb-4 backdrop-blur-sm border border-slate-200/50 dark:border-white/5">
              {statusFilter === 'ongoing' && allDebtsInCurrentTab.length > 0 ? (
                <CheckCircle2 size={32} className="text-emerald-500" />
              ) : (
                isLiabilityTab ? <CreditCard size={32} /> : <Wallet size={32} />
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200 transition-colors">
              {statusFilter === 'ongoing' && allDebtsInCurrentTab.length > 0 
                ? "All caught up! 🎉" 
                : statusFilter === 'completed'
                  ? "No settled records yet"
                  : isLiabilityTab ? "Debt Free! (For now)" : "No Pending Debts"
              }
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 transition-colors">
              {statusFilter === 'ongoing' && allDebtsInCurrentTab.length > 0
                ? `You have completely settled all your ${isLiabilityTab ? 'debts' : 'receivables'}. Check the Completed tab!`
                : statusFilter === 'completed'
                  ? "Records will appear here once they are fully paid off."
                  : isLiabilityTab ? "Add your first credit card or loan to start tracking your paydown." : "Add a record if someone owes you money."
              }
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-500">
              {paginatedDebts.map((debt) => {
                const isPaidOff = Number(debt.remaining_amount) <= 0;
                const progress = ((debt.total_amount - debt.remaining_amount) / debt.total_amount) * 100;
                const cardColor = isLiabilityTab ? (isPaidOff ? 'emerald' : 'rose') : (isPaidOff ? 'slate' : 'emerald');

                return (
                  <div key={debt.id} className={`glass-card p-6 rounded-[2rem] relative group flex flex-col justify-between transition-all duration-300 ${isPaidOff ? 'opacity-70 hover:opacity-100' : 'hover:bg-white/40 dark:hover:bg-white/5 border border-transparent hover:border-slate-200/50 dark:hover:border-white/10'}`}>
                    
                    <button onClick={() => setDeleteModal({ isOpen: true, id: debt.id, name: debt.name })} className="absolute top-4 right-4 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 bg-white/50 dark:bg-black/20 hover:bg-rose-100 dark:hover:bg-rose-500/10 p-2 rounded-lg opacity-100 md:opacity-0 group-hover:opacity-100 transition-all z-10 backdrop-blur-md"><Trash2 size={16} /></button>

                    <div>
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-2xl border flex items-center justify-center shadow-sm backdrop-blur-sm transition-colors bg-${cardColor}-50/80 dark:bg-${cardColor}-500/10 border-${cardColor}-200/50 dark:border-${cardColor}-500/20 text-${cardColor}-500`}>
                          {getCategoryIcon(debt.category)}
                        </div>
                        <div className="truncate pr-8">
                          <h3 className={`text-base md:text-lg font-bold transition-colors truncate ${isPaidOff ? 'text-slate-700 dark:text-slate-300 line-through decoration-slate-400/50 decoration-2' : 'text-slate-900 dark:text-slate-200'}`}>{debt.name}</h3>
                          <p className="text-[10px] md:text-xs font-semibold text-slate-500 dark:text-slate-400 transition-colors">{debt.interest_rate}% APR • {debt.category}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <p className="text-[10px] md:text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">{isPaidOff ? 'Total Settled' : 'Remaining Balance'}</p>
                          <span className={`text-2xl md:text-3xl font-extrabold transition-colors break-words ${isPaidOff ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                            {currencySymbol}{isPaidOff ? Number(debt.total_amount).toLocaleString(undefined, { maximumFractionDigits: 0 }) : Number(debt.remaining_amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="h-2 md:h-2.5 w-full bg-slate-100/80 dark:bg-slate-950/50 rounded-full overflow-hidden border border-slate-200/50 dark:border-white/5 mb-6 transition-colors shadow-inner">
                        <div className={`h-full transition-all duration-1000 ease-out bg-${cardColor}-500 shadow-[0_0_10px_rgba(0,0,0,0.2)]`} style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <button 
                        onClick={() => {
                          setPaymentModal({ isOpen: true, id: debt.id, name: debt.name, remaining: debt.remaining_amount, wallet_id: wallets.length > 0 ? wallets[0].id : "" });
                          setPaymentAmount("");
                          setIsPaymentWalletOpen(false);
                        }}
                        disabled={isPaidOff}
                        className={`flex-1 py-3 rounded-xl font-bold flex justify-center items-center gap-2 text-sm md:text-base transition-all ${isPaidOff ? 'bg-slate-100/50 text-slate-600 border border-slate-200/50 dark:bg-white/5 dark:text-slate-400 dark:border-white/10' : 'bg-white/80 text-slate-700 hover:bg-white border-slate-200 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:border-white/10 border shadow-sm active:scale-95'}`}
                      >
                        {isPaidOff ? (isLiabilityTab ? "Debt Crushed! 🎉" : "Fully Collected! ✅") : <>{isLiabilityTab ? "Log Payment" : "Log Receipt"}</>}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-10">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-3 rounded-2xl bg-white dark:bg-[#0F0F15]/80 backdrop-blur-xl border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-slate-700 dark:text-slate-300 shadow-sm" aria-label="Previous Page">
                  <ChevronLeft size={20} />
                </button>
                <div className="px-4 py-2 rounded-2xl bg-white dark:bg-[#0F0F15]/80 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-sm flex items-center justify-center min-w-[100px]">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Page {currentPage} <span className="text-slate-400 dark:text-slate-500 mx-1">/</span> {totalPages}</span>
                </div>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-3 rounded-2xl bg-white dark:bg-[#0F0F15]/80 backdrop-blur-xl border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-slate-700 dark:text-slate-300 shadow-sm" aria-label="Next Page">
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* --- RECORD PAYMENT MODAL --- */}
      {paymentModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/10 dark:bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={() => setPaymentModal({...paymentModal, isOpen: false})} />
          {/* 🚀 FIXED: Changed overflow-hidden to overflow-visible so the dropdown list isn't clipped */}
          <div className="relative z-10 w-full max-w-sm glass-card rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-visible animate-in zoom-in-95">
            <div className="flex justify-between items-center p-6 border-b border-slate-200/80 dark:border-white/5">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {debts.find(d => d.id === paymentModal.id)?.type === 'receivable' ? 'Record Receipt' : 'Log Payment'}
              </h3>
              <button onClick={() => setPaymentModal({...paymentModal, isOpen: false})} className="text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 p-1 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              <p className="text-sm font-medium text-slate-500 mb-2">
                {debts.find(d => d.id === paymentModal.id)?.type === 'receivable' ? 'Payment received for ' : 'Payment towards '}
                <span className="font-bold text-brand-600 dark:text-brand-400">{paymentModal.name}</span>.
              </p>

              {/* 🚀 FIXED: Added dynamic z-index here */}
              <div className={`relative ${isPaymentWalletOpen ? 'z-50' : ''}`}>
                <label className="block text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-400 mb-1">
                  {debts.find(d => d.id === paymentModal.id)?.type === 'receivable' ? 'Deposit Into' : 'Pay From Wallet'}
                </label>
                <button type="button" onClick={() => setIsPaymentWalletOpen(!isPaymentWalletOpen)} className={`w-full flex justify-between items-center bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-left focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors ${!selectedWalletForPayment ? 'text-slate-400' : 'text-slate-900 dark:text-slate-200'}`}>
                  <span className="truncate">{selectedWalletForPayment ? `${selectedWalletForPayment.name} (${currencySymbol}${Number(selectedWalletForPayment.balance).toLocaleString()})` : 'Select a wallet...'}</span>
                  <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform duration-200 ${isPaymentWalletOpen ? 'rotate-180' : ''}`} />
                </button>
                {isPaymentWalletOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsPaymentWalletOpen(false)} />
                    <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-48 overflow-y-auto custom-scrollbar">
                      {wallets.length === 0 ? <div className="px-4 py-3 text-sm text-slate-500 text-center">No wallets found.</div> : wallets.map((w) => (
                        <button key={w.id} type="button" onClick={() => { setPaymentModal({ ...paymentModal, wallet_id: w.id }); setIsPaymentWalletOpen(false); }} className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${paymentModal.wallet_id === w.id ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'}`}>
                          <span className="truncate pr-2">{w.name}</span>
                          <span className="text-xs font-medium opacity-70 shrink-0">{currencySymbol}{Number(w.balance).toLocaleString()}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-400 mb-1">Amount ({currencySymbol})</label>
                <input 
                  required autoFocus type="text" inputMode="decimal" placeholder="0.00" 
                  value={formatAmountForDisplay(paymentAmount)} 
                  onChange={(e) => setPaymentAmount(cleanNumber(e.target.value))} 
                  className={`w-full bg-slate-50 dark:bg-slate-950/50 border rounded-xl px-4 py-3 focus:outline-none focus:ring-1 text-lg font-bold transition-colors ${((parseFloat(paymentAmount) || 0) > paymentModal.remaining) || isPayInsufficient ? 'border-rose-500 focus:ring-rose-500 text-rose-600 dark:text-rose-400' : 'border-slate-200/80 dark:border-white/10 focus:ring-emerald-500 text-slate-900 dark:text-slate-200'}`} 
                />
                
                {((parseFloat(paymentAmount) || 0) > paymentModal.remaining) && (
                  <p className="text-xs text-rose-500 font-semibold mt-2 animate-in slide-in-from-top-1">
                    Cannot exceed remaining balance of {currencySymbol}{paymentModal.remaining.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                )}
                
                {isPayInsufficient && (
                  <p className="text-xs text-rose-500 font-semibold mt-2 animate-in slide-in-from-top-1">
                    Insufficient funds in {selectedWalletForPayment?.name}
                  </p>
                )}
              </div>

              <button 
                type="submit" 
                disabled={isPaying || !paymentAmount || !paymentModal.wallet_id || (parseFloat(paymentAmount) || 0) > paymentModal.remaining || isPayInsufficient} 
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-[0_8px_20px_-6px_rgba(16,185,129,0.6)] font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 hover:-translate-y-0.5 transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0 disabled:shadow-none mt-4"
              >
                {isPaying ? <Loader2 className="animate-spin" size={20} /> : "Confirm Amount"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- CUSTOM DELETE CONFIRMATION MODAL --- */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/10 dark:bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={() => !isDeleting && setDeleteModal({ isOpen: false, id: "", name: "" })} />
          <div className="relative z-10 w-full max-w-sm glass-card rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95">
            <div className="flex justify-between items-center p-6 border-b border-rose-200/50 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-500/5">
              <div className="flex items-center gap-3">
                <div className="bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 p-2 rounded-full"><Trash2 size={20} /></div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Delete Record</h3>
              </div>
              <button onClick={() => !isDeleting && setDeleteModal({ isOpen: false, id: "", name: "" })} className="text-slate-500 hover:bg-rose-100 dark:hover:bg-rose-500/20 p-1 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-6">
              <p className="text-slate-600 dark:text-slate-300">Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-slate-100">{deleteModal.name}</span>? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteModal({ isOpen: false, id: "", name: "" })} disabled={isDeleting} className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 transition-colors disabled:opacity-50">Cancel</button>
                <button onClick={handleConfirmDelete} disabled={isDeleting} className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-[0_8px_20px_-6px_rgba(244,63,94,0.6)] transition-all hover:-translate-y-0.5 active:scale-95 flex justify-center items-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0">
                  {isDeleting ? <Loader2 className="animate-spin" size={20} /> : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}