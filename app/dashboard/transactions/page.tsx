"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";
import AddTransactionModal from "@/components/AddTransactionModal";
import { 
  ArrowDownToLine, Receipt, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, 
  Trash2, Edit2, UploadCloud, FileText, Loader2, CheckCircle2, AlertTriangle, X, Download, 
  ListFilter, Search, Wallet, TrendingUp, Smartphone, Landmark, Banknote, Scale
} from "lucide-react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const CATEGORIES = ["Housing", "Food", "Transportation", "Utilities", "Insurance", "Healthcare", "Savings", "Personal", "Debt Repayment", "Entertainment", "Income", "Asset Sale", "Loan Received", "Loan Given", "Transfer", "Contra", "Other"];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [walletBalances, setWalletBalances] = useState({ total: 0, mobile: 0, bank: 0, cash: 0 });
  const [loading, setLoading] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState("TSh ");
  
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [activeFilter, setActiveFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [activeWalletFilter, setActiveWalletFilter] = useState<'all' | 'mobile' | 'bank' | 'cash'>('all');
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10; 

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ id: "", title: "", amount: "", date: "", type: "expense", category: "", account_id: "" });

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{message: string, type: 'idle' | 'success' | 'error'}>({ message: "", type: 'idle' });

  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  useEffect(() => setMounted(true), []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: txData, error: txError } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });
      
      if (!txError && txData) {
        setTransactions(txData);
      }

      const { data: accountsData } = await supabase
        .from('accounts')
        .select('balance, type')
        .eq('user_id', user.id);

      if (accountsData) {
        let total = 0, mobile = 0, bank = 0, cash = 0;
        
        accountsData.forEach(acc => {
          const bal = Number(acc.balance);
          const accType = String(acc.type || "").toLowerCase().trim();
          
          total += bal;
          if (accType.includes('digital') || accType.includes('mobile') || accType.includes('m-pesa') || accType.includes('mpesa') || accType.includes('tigo')) mobile += bal;
          else if (accType.includes('bank') || accType.includes('crdb') || accType.includes('nmb')) bank += bal;
          else if (accType.includes('cash')) cash += bal;
        });

        setWalletBalances({ total, mobile, bank, cash });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedCurrency = localStorage.getItem("app_currency");
    setCurrencySymbol(savedCurrency === "USD" ? "$" : "TSh ");
    fetchTransactions();

    window.addEventListener("transactionUpdated", fetchTransactions);
    return () => window.removeEventListener("transactionUpdated", fetchTransactions);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth, selectedYear, activeFilter, activeWalletFilter, searchQuery]);

  const handleDelete = async (tx: any) => {
    if (deletingIds.includes(tx.id)) return;
    setDeletingIds(prev => [...prev, tx.id]);

    try {
      if (tx.account_id) {
        const { data: accountData } = await supabase
          .from("accounts")
          .select("balance")
          .eq("id", tx.account_id)
          .single();

        if (accountData) {
          const currentBalance = Number(accountData.balance);
          const txAmount = Number(tx.amount);
          
          const restoredBalance = tx.type === 'expense' 
            ? currentBalance + txAmount 
            : currentBalance - txAmount;

          await supabase
            .from("accounts")
            .update({ balance: restoredBalance })
            .eq("id", tx.account_id);
        }
      }

      const { error } = await supabase.from("transactions").delete().eq("id", tx.id);
      
      if (!error) {
        window.dispatchEvent(new Event("transactionUpdated"));
      }
    } catch (error) {
      console.error("Failed to delete and refund:", error);
    } finally {
      setDeletingIds(prev => prev.filter(id => id !== tx.id));
    }
  };

  const openEditModal = (tx: any) => {
    setEditForm({ 
      id: tx.id, 
      title: tx.title, 
      amount: tx.amount.toString(), 
      date: tx.date.split('T')[0], 
      type: tx.type, 
      category: tx.category,
      account_id: tx.account_id 
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(true);
    
    try {
      const newAmount = Number(editForm.amount.replace(/,/g, ''));
      const { id, account_id, type: newType } = editForm;

      const { data: oldTx, error: fetchError } = await supabase
        .from("transactions")
        .select("amount, type, account_id")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateTxError } = await supabase.from("transactions").update({
        title: editForm.title, 
        amount: newAmount, 
        date: editForm.date, 
        type: newType, 
        category: editForm.category
      }).eq("id", id);

      if (updateTxError) throw updateTxError;

      if (account_id) {
        const { data: accountData } = await supabase
          .from("accounts")
          .select("balance")
          .eq("id", account_id)
          .single();

        if (accountData) {
          let currentBalance = Number(accountData.balance);
          const oldAmount = Number(oldTx.amount);
          const oldType = oldTx.type;

          if (oldType === 'expense') {
            currentBalance += oldAmount;
          } else {
            currentBalance -= oldAmount;
          }

          if (newType === 'expense') {
            currentBalance -= newAmount;
          } else {
            currentBalance += newAmount;
          }

          await supabase
            .from("accounts")
            .update({ balance: currentBalance })
            .eq("id", account_id);
        }
      }

      setIsEditModalOpen(false);
      window.dispatchEvent(new Event("transactionUpdated"));
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update transaction and wallet.");
    } finally {
      setIsEditing(false);
    }
  };

  const handlePriceChange = (value: string) => {
    const rawValue = value.replace(/[^0-9.]/g, '');
    if (rawValue) {
      const parts = rawValue.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      setEditForm({ ...editForm, amount: parts.join('.') });
    } else { setEditForm({ ...editForm, amount: "" }); }
  };

  const handleFileDrop = async (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files[0]; if (file) processCSV(file); };
  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) processCSV(file); };
  
  const processCSV = async (file: File) => {
    if (!file.name.endsWith('.csv')) { setImportStatus({ message: "Please upload a valid .csv file.", type: 'error' }); return; }
    setIsImporting(true); setImportStatus({ message: "Reading file...", type: 'idle' });
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string; const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) throw new Error("File is empty or missing data.");
        const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''));
        const dateIdx = headers.findIndex(h => h.includes('date') || h.includes('time'));
        const titleIdx = headers.findIndex(h => h.includes('title') || h.includes('desc') || h.includes('name'));
        const amountIdx = headers.findIndex(h => h.includes('amount') || h.includes('value') || h.includes('price'));
        const typeIdx = headers.findIndex(h => h.includes('type') || h.includes('kind'));
        const catIdx = headers.findIndex(h => h.includes('category') || h.includes('cat'));
        if (dateIdx === -1 || amountIdx === -1) throw new Error("Could not find 'Date' or 'Amount' columns in CSV.");

        const bulkData = [];
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map(cell => cell.trim().replace(/"/g, ''));
          if (!row[amountIdx]) continue; 
          let rawAmount = row[amountIdx].replace(/[^0-9.-]/g, ''); let amountVal = parseFloat(rawAmount); let txType = 'expense';
          if (amountVal < 0) { txType = 'expense'; amountVal = Math.abs(amountVal); } else if (typeIdx !== -1 && row[typeIdx].toLowerCase().includes('income')) { txType = 'income'; } else if (typeIdx === -1 && amountVal > 0 && row[titleIdx]?.toLowerCase().includes('deposit')) { txType = 'income'; }
          bulkData.push({ date: row[dateIdx] ? new Date(row[dateIdx]).toISOString() : new Date().toISOString(), title: titleIdx !== -1 ? row[titleIdx] : "Imported Transaction", amount: amountVal, type: txType, category: catIdx !== -1 ? row[catIdx] : "Other" });
        }
        const { error } = await supabase.from('transactions').insert(bulkData);
        if (error) throw error;
        setImportStatus({ message: `Successfully imported ${bulkData.length} transactions!`, type: 'success' });
        window.dispatchEvent(new Event("transactionUpdated"));
        setTimeout(() => { setIsImportModalOpen(false); setImportStatus({ message: "", type: 'idle' }); }, 2500);
      } catch (err: any) { setImportStatus({ message: err.message || "Failed to parse CSV.", type: 'error' }); }
      setIsImporting(false);
    };
    reader.readAsText(file);
  };

  const downloadCSVTemplate = () => {
    const csvContent = "Date,Description,Amount,Type,Category\n2026-03-30,Salary Deposit,500000,income,Income\n2026-03-31,Groceries,25000,expense,Food";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.setAttribute("download", `Nova_Import_Template.csv`); document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const currentPeriodTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
  });

  const filteredTransactions = currentPeriodTransactions.filter(t => {
    const matchTab = activeFilter === 'all' ? true : t.type === activeFilter;
    
    const matchSearch = searchQuery === "" || 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
      
    const txAccountType = String(t.account_type || t.wallet_type || "").toLowerCase().trim();
    let matchWallet = true;
    
    if (activeWalletFilter === 'mobile') {
      matchWallet = txAccountType.includes('digital') || 
                    txAccountType.includes('mobile') || 
                    txAccountType.includes('m-pesa') || 
                    txAccountType.includes('mpesa') ||
                    txAccountType.includes('tigo');
    } else if (activeWalletFilter === 'bank') {
      matchWallet = txAccountType.includes('bank') || txAccountType.includes('crdb') || txAccountType.includes('nmb');
    } else if (activeWalletFilter === 'cash') {
      matchWallet = txAccountType.includes('cash');
    }

    return matchTab && matchSearch && matchWallet;
  });

  // 🚀 THIS HELPER EXCLUDES DOUBLE ENTRIES
  const isExcludedFromRealWealth = (category: string) => {
    const cat = (category || "").toLowerCase();
    return cat.includes("transfer") || 
           cat.includes("contra") || 
           cat.includes("loan received") || 
           cat.includes("loan given");
  };

  // We only use "Real" transactions for Income and Expenses
  const realTransactions = currentPeriodTransactions.filter(t => !isExcludedFromRealWealth(t.category));
  const totalIncome = realTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpense = realTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
  
  // 🚀 ROLLING OPENING BALANCE: OB = Previous Month's Closing Cash Flow
  // Closing Cash Flow (any month) = Opening Balance + Real Income − Real Expenses
  // Opening Balance (any month) = previous month's Closing Cash Flow
  // So we roll forward month-by-month from the earliest real transaction up to
  // (but not including) the selected month, carrying the balance as we go.
  const calculateRollingOpeningBalance = (targetYear: number, targetMonth: number) => {
    if (transactions.length === 0) return 0;

    // Net REAL cash flow per month (income − expense), excluding Contra, Transfers,
    // Loan Received, and Loan Given — same rule used for the current month's totals.
    const monthlyRealNet = new Map<string, number>();
    let earliestYear = targetYear;
    let earliestMonth = targetMonth;

    transactions.forEach(t => {
      if (isExcludedFromRealWealth(t.category)) return; // Contra/Transfer/Loan = zero effect on cash flow

      const d = new Date(t.date);
      const y = d.getFullYear();
      const m = d.getMonth();

      if (y < earliestYear || (y === earliestYear && m < earliestMonth)) {
        earliestYear = y;
        earliestMonth = m;
      }

      const key = `${y}-${m}`;
      const signedAmount = Number(t.amount) * (t.type === 'income' ? 1 : -1);
      monthlyRealNet.set(key, (monthlyRealNet.get(key) || 0) + signedAmount);
    });

    // Roll forward: each month's Closing CF becomes the next month's Opening Balance.
    let rollingBalance = 0;
    let iterYear = earliestYear;
    let iterMonth = earliestMonth;

    while (iterYear < targetYear || (iterYear === targetYear && iterMonth < targetMonth)) {
      rollingBalance += monthlyRealNet.get(`${iterYear}-${iterMonth}`) || 0;
      iterMonth++;
      if (iterMonth > 11) { iterMonth = 0; iterYear++; }
    }

    return rollingBalance;
  };

  const openingBalance = calculateRollingOpeningBalance(selectedYear, selectedMonth);

  // 🚀 Closing Cash Flow = Opening Balance + Real Income - Real Expense
  const totalCashFlow = openingBalance + totalIncome - totalExpense;

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE));
  const paginatedTx = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-6 md:space-y-8 pb-32 relative bg-transparent min-h-screen transition-colors duration-300">
      
      {/* HEADER */}
      <header className="relative z-[120] flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 transition-colors">Transactions</h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Manage your income and expenses.</p>
        </div>
        
        <div className="w-full xl:w-auto relative">
          <style dangerouslySetInnerHTML={{__html: '.nuke-scrollbar::-webkit-scrollbar { display: none !important; } .nuke-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }'}} />
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full [&_button]:w-auto">
            
            {/* Period Selector (Calendar) */}
            <div className="relative z-[100] shrink-0">
              <button 
                onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
                className="relative z-50 flex items-center justify-center gap-2 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 rounded-2xl px-4 py-2.5 shadow-sm transition-all group hover:border-brand-500/50 h-[42px]"
              >
                <CalendarDays size={18} className="text-brand-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  {MONTHS[selectedMonth]} {selectedYear}
                </span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isPeriodDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isPeriodDropdownOpen && (
                <div 
                  className="fixed inset-0 bg-slate-900/20 dark:bg-black/50 backdrop-blur-sm z-40 animate-in fade-in" 
                  onClick={() => setIsPeriodDropdownOpen(false)} 
                />
              )}

              {isPeriodDropdownOpen && (
                <div className="absolute left-0 md:left-auto md:right-0 top-full mt-2 z-50 w-72 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-5 animate-in fade-in zoom-in-95 origin-top-left md:origin-top-right">
                  <div className="flex justify-between items-center mb-6 px-2">
                    <button onClick={() => setSelectedYear(y => y - 1)} className="p-1.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-500 transition-colors"><ChevronLeft size={18}/></button>
                    <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">{selectedYear}</span>
                    <button onClick={() => setSelectedYear(y => y + 1)} className="p-1.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-500 transition-colors"><ChevronRight size={18}/></button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {MONTHS.map((monthStr, index) => {
                      const isSelected = selectedMonth === index;
                      return (
                        <button 
                          key={monthStr}
                          onClick={() => { setSelectedMonth(index); setIsPeriodDropdownOpen(false); }}
                          className={`py-2 rounded-xl text-sm font-bold transition-all duration-200 ${isSelected ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 scale-105' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                        >
                          {monthStr}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* EXPANDABLE SEARCH BAR */}
            <div
              className={`relative z-40 shrink-0 flex items-center transition-all duration-500 ease-out overflow-hidden bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl shadow-sm focus-within:border-brand-500/50 ${
                isSearchExpanded || searchQuery ? 'w-[180px] sm:w-64 border-brand-500/30' : 'w-[42px] cursor-pointer hover:bg-white/80 dark:hover:bg-white/10'
              }`}
              style={{ height: '42px' }}
              onClick={() => {
                if (!isSearchExpanded) {
                  setIsSearchExpanded(true);
                  setTimeout(() => searchInputRef.current?.focus(), 100);
                }
              }}
            >
              <div className="w-[42px] h-full flex items-center justify-center shrink-0">
                <Search size={18} className={`transition-colors duration-300 ${isSearchExpanded || searchQuery ? "text-brand-500" : "text-slate-500 dark:text-slate-400 group-hover:text-brand-500"}`} />
              </div>
              
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => { if (!searchQuery) setIsSearchExpanded(false); }}
                className={`h-full bg-transparent text-sm font-bold text-slate-700 dark:text-slate-200 placeholder-slate-400/80 focus:outline-none transition-all duration-300 ${
                  isSearchExpanded || searchQuery ? 'w-full opacity-100 pr-8' : 'w-0 opacity-0 pointer-events-none'
                }`}
              />
              
              {(isSearchExpanded || searchQuery) ? (
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setSearchQuery(""); 
                    setIsSearchExpanded(false); 
                  }} 
                  className="absolute right-0 top-0 h-full w-8 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors animate-in fade-in"
                >
                  <X size={14} />
                </button>
              ) : null}
            </div>

            {/* Import CSV Button */}
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="relative z-40 shrink-0 flex items-center justify-center gap-2 bg-white/80 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 transition-all active:scale-95 px-4 py-2.5 rounded-2xl font-bold text-sm shadow-sm h-[42px]"
            >
              <UploadCloud size={16} /> <span className="hidden sm:inline">Import Bank CSV</span><span className="sm:hidden">Import</span>
            </button>

            {/* Add Transaction Button */}
            <div className="relative z-40 shrink-0 flex items-center [&_button]:w-auto [&_button]:min-w-[160px] [&_button]:h-[42px]">
              <AddTransactionModal />
            </div>
          </div>
        </div>
      </header>

      {/* 5-CARD HERO METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-6 animate-in fade-in duration-500">
        <div className="glass-card p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] flex flex-col justify-center border border-brand-500/10 transition-colors bg-gradient-to-br from-brand-50/50 to-transparent dark:from-brand-500/5">
          <p className="text-brand-600 dark:text-brand-400 font-bold mb-1 tracking-wide uppercase text-[10px] md:text-xs flex items-center gap-1.5">
            <Wallet size={14} /> Total Balance
          </p>
          <h2 className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-white break-words">
            {currencySymbol}{walletBalances.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </h2>
        </div>

        <div className="glass-card p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] flex flex-col justify-center border border-slate-500/10 dark:border-slate-400/10 transition-colors bg-slate-50/30 dark:bg-slate-800/20">
          <p className="text-slate-500 dark:text-slate-400 font-bold mb-1 tracking-wide uppercase text-[10px] md:text-xs flex items-center gap-1.5">
            <Scale size={14} /> Opening Balance
          </p>
          <h2 className="text-xl md:text-3xl font-extrabold text-slate-700 dark:text-slate-300 break-words">
            {openingBalance >= 0 ? '+' : ''}{currencySymbol}{openingBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </h2>
        </div>

        <div className="glass-card p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] flex flex-col justify-center border border-emerald-500/10 transition-colors">
          <p className="text-emerald-600 dark:text-emerald-400 font-bold mb-1 tracking-wide uppercase text-[10px] md:text-xs flex items-center gap-1.5">
            <ArrowDownToLine size={14} className="rotate-180" /> Real Income
          </p>
          <h2 className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-white break-words">
            {currencySymbol}{totalIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </h2>
        </div>
        
        <div className="glass-card p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] flex flex-col justify-center border border-rose-500/10 transition-colors">
          <p className="text-rose-600 dark:text-rose-400 font-bold mb-1 tracking-wide uppercase text-[10px] md:text-xs flex items-center gap-1.5">
            <Receipt size={14} /> Real Expenses
          </p>
          <h2 className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-white break-words">
            {currencySymbol}{totalExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </h2>
        </div>

        {/* 🚀 TOTAL CASH FLOW (OB + IN - OUT) */}
        <div className={`col-span-2 lg:col-span-1 glass-card p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] flex flex-col justify-center border transition-colors ${totalCashFlow >= 0 ? 'border-emerald-500/10 bg-emerald-50/30 dark:bg-emerald-500/5' : 'border-rose-500/10 bg-rose-50/30 dark:bg-rose-500/5'}`}>
          <p className={`font-bold mb-1 tracking-wide uppercase text-[10px] md:text-xs flex items-center gap-1.5 ${totalCashFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            <TrendingUp size={14} className={totalCashFlow < 0 ? "rotate-180" : ""} /> 
            Total Cash Flow
          </p>
          <h2 className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-white break-words">
            {totalCashFlow >= 0 ? '+' : ''}{currencySymbol}{totalCashFlow.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </h2>
        </div>
      </div>

      {/* TOOLBAR: TABS & FRIENDLY WALLET PILLS */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 relative z-40 animate-in fade-in duration-500">
        
        <div className="flex bg-white/60 dark:bg-white/5 p-1.5 rounded-2xl w-fit border border-slate-200/80 dark:border-white/10 backdrop-blur-md shadow-sm">
          <button 
            onClick={() => setActiveFilter('all')} 
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeFilter === 'all' ? 'bg-white dark:bg-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.05)] text-brand-600 dark:text-brand-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <ListFilter size={16} /> All
          </button>
          <button 
            onClick={() => setActiveFilter('income')} 
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeFilter === 'income' ? 'bg-emerald-50 dark:bg-emerald-500/10 shadow-[0_2px_10px_rgba(0,0,0,0.05)] text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <ArrowDownToLine size={16} className="rotate-180" /> <span className="hidden sm:inline">Income</span>
          </button>
          <button 
            onClick={() => setActiveFilter('expense')} 
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeFilter === 'expense' ? 'bg-rose-50 dark:bg-rose-500/10 shadow-[0_2px_10px_rgba(0,0,0,0.05)] text-rose-600 dark:text-rose-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <Receipt size={16} /> <span className="hidden sm:inline">Expenses</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => setActiveWalletFilter('all')}
            className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-bold transition-all shadow-sm backdrop-blur-md ${
              activeWalletFilter === 'all' 
              ? 'bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-500/20 dark:border-brand-500/30 dark:text-brand-300 scale-105' 
              : 'bg-white/80 dark:bg-white/5 border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10'
            }`}
          >
            <Wallet size={14} className={activeWalletFilter === 'all' ? 'text-brand-600 dark:text-brand-400' : 'text-brand-500'} />
            <span className={`font-medium hidden sm:inline ${activeWalletFilter === 'all' ? 'text-brand-600/70 dark:text-brand-400/70' : 'text-slate-400'}`}>All Wallets</span> 
          </button>

          <button 
            onClick={() => setActiveWalletFilter('mobile')}
            className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-bold transition-all shadow-sm backdrop-blur-md ${
              activeWalletFilter === 'mobile' 
              ? 'bg-sky-50 border-sky-200 text-sky-700 dark:bg-sky-500/20 dark:border-sky-500/30 dark:text-sky-300 scale-105' 
              : 'bg-white/80 dark:bg-white/5 border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10'
            }`}
          >
            <Smartphone size={14} className={activeWalletFilter === 'mobile' ? 'text-sky-600 dark:text-sky-400' : 'text-sky-500'} />
            <span className={`font-medium hidden sm:inline ${activeWalletFilter === 'mobile' ? 'text-sky-600/70 dark:text-sky-400/70' : 'text-slate-400'}`}>Mobile:</span> 
            {currencySymbol}{walletBalances.mobile.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </button>

          <button 
            onClick={() => setActiveWalletFilter('bank')}
            className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-bold transition-all shadow-sm backdrop-blur-md ${
              activeWalletFilter === 'bank' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-300 scale-105' 
              : 'bg-white/80 dark:bg-white/5 border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10'
            }`}
          >
            <Landmark size={14} className={activeWalletFilter === 'bank' ? 'text-emerald-600 dark:text-emerald-400' : 'text-emerald-500'} />
            <span className={`font-medium hidden sm:inline ${activeWalletFilter === 'bank' ? 'text-emerald-600/70 dark:text-emerald-400/70' : 'text-slate-400'}`}>Bank:</span> 
            {currencySymbol}{walletBalances.bank.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </button>

          <button 
            onClick={() => setActiveWalletFilter('cash')}
            className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-bold transition-all shadow-sm backdrop-blur-md ${
              activeWalletFilter === 'cash' 
              ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/20 dark:border-amber-500/30 dark:text-amber-300 scale-105' 
              : 'bg-white/80 dark:bg-white/5 border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10'
            }`}
          >
            <Banknote size={14} className={activeWalletFilter === 'cash' ? 'text-amber-600 dark:text-amber-400' : 'text-amber-500'} />
            <span className={`font-medium hidden sm:inline ${activeWalletFilter === 'cash' ? 'text-amber-600/70 dark:text-amber-400/70' : 'text-slate-400'}`}>Cash:</span> 
            {currencySymbol}{walletBalances.cash.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </button>
        </div>
      </div>

      {/* 🚀 RESPONSIVE TRANSACTIONS LIST */}
      <div className="glass-card rounded-[2rem] p-2 sm:p-4 transition-colors shadow-sm min-h-[400px] relative z-10">
        {loading ? (
          <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-brand-500" size={32} /></div>
        ) : paginatedTx.length === 0 ? (
          <div key={`empty-${activeFilter}-${searchQuery}-${activeWalletFilter}`} className="p-16 text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-16 h-16 rounded-2xl bg-slate-100/80 dark:bg-white/5 flex items-center justify-center text-slate-400 mb-4 backdrop-blur-sm border border-slate-200/50 dark:border-white/5">
              {searchQuery ? <Search size={32} /> : activeWalletFilter !== 'all' ? <Wallet size={32} /> : <FileText size={32} />}
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200">
              {searchQuery ? "No matches found" : activeWalletFilter !== 'all' ? `No ${activeWalletFilter} transactions found` : `No ${activeFilter !== 'all' ? activeFilter : ''} transactions`}
            </h3>
            <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
              {searchQuery 
                ? `We couldn't find any records matching "${searchQuery}".`
                : activeWalletFilter !== 'all'
                ? `If you added this transaction recently, check the 'account_type' spelling in your Supabase table!`
                : `No records match your current filter for ${MONTHS[selectedMonth]} ${selectedYear}.`
              }
            </p>
          </div>
        ) : (
          <div key={`list-${activeFilter}-${currentPage}-${searchQuery}-${activeWalletFilter}`} className="divide-y divide-slate-100 dark:divide-white/5">
            {paginatedTx.map((tx, index) => {
              const isExpanded = expandedTxId === tx.id;
              const isDeleting = deletingIds.includes(tx.id);

              return (
                <div 
                  key={tx.id} 
                  onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
                  className={`flex items-center justify-between p-3 sm:p-4 hover:bg-slate-50/80 dark:hover:bg-white/5 rounded-[1.5rem] transition-all group animate-in fade-in slide-in-from-bottom-4 duration-500 cursor-pointer gap-2 ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
                >
                  
                  {/* Left Side: Icon and Details */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl sm:rounded-[1.25rem] flex items-center justify-center border shadow-sm backdrop-blur-sm transition-colors ${tx.type === 'income' ? 'bg-emerald-50/80 dark:bg-emerald-500/10 border-emerald-200/50 dark:border-emerald-500/20 text-emerald-500' : 'bg-rose-50/80 dark:bg-rose-500/10 border-rose-200/50 dark:border-rose-500/20 text-rose-500'}`}>
                      {tx.type === 'income' ? <ArrowDownToLine size={18} className="rotate-180 sm:w-5 sm:h-5"/> : <Receipt size={18} className="sm:w-5 sm:h-5" />}
                    </div>
                    
                    <div className="min-w-0 flex-1 pr-1">
                      <p className={`text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 transition-all duration-300 ${isExpanded ? 'whitespace-normal break-words' : 'truncate'}`}>
                        {tx.title}
                      </p>
                      <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {new Date(tx.date).toLocaleDateString()} <span className="hidden sm:inline">•</span><span className="sm:hidden">,</span> {tx.category}
                      </p>
                    </div>
                  </div>
                  
                  {/* 🚀 Right Side: Amount and Stacked Actions for Mobile */}
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 sm:gap-3 shrink-0">
                    <span className={`text-sm sm:text-lg font-bold tracking-tight whitespace-nowrap transition-colors ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {tx.type === 'expense' ? '-' : '+'}{currencySymbol}{Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    
                    <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); openEditModal(tx); }} 
                        className="p-1.5 sm:p-2 text-slate-400 hover:text-brand-600 bg-white/50 dark:bg-black/20 hover:bg-brand-100 dark:hover:bg-brand-500/10 rounded-lg transition-all" 
                        title="Edit"
                      >
                        <Edit2 size={14} className="sm:w-4 sm:h-4" />
                      </button>
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(tx); }} 
                        disabled={isDeleting}
                        className={`p-1.5 sm:p-2 rounded-lg transition-all ${isDeleting ? 'text-rose-400 cursor-not-allowed' : 'text-slate-400 hover:text-rose-600 bg-white/50 dark:bg-black/20 hover:bg-rose-100 dark:hover:bg-rose-500/10'}`} 
                        title="Delete"
                      >
                        {isDeleting ? <Loader2 size={14} className="animate-spin sm:w-4 sm:h-4" /> : <Trash2 size={14} className="sm:w-4 sm:h-4" />}
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredTransactions.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between px-6 py-4 glass-card rounded-2xl shadow-sm">
          <span className="text-sm font-medium text-slate-500">Page {currentPage} of {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 disabled:opacity-50 hover:bg-white dark:hover:bg-white/5"><ChevronLeft size={18} /></button>
            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 disabled:opacity-50 hover:bg-white dark:hover:bg-white/5"><ChevronRight size={18} /></button>
          </div>
        </div>
      )}

      {/* CSV DRAG & DROP MODAL */}
      {isImportModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => !isImporting && setIsImportModalOpen(false)} />
          <div className="relative z-10 w-full max-w-lg bg-white dark:bg-[#0A0A0E] rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-slate-200 dark:border-white/10 overflow-hidden animate-in zoom-in-95">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><UploadCloud size={20} className="text-brand-500" /> Import Bank Statement</h3>
              <button onClick={() => !isImporting && setIsImportModalOpen(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white p-1 rounded-full"><X size={20}/></button>
            </div>

            <div className="p-8">
              {importStatus.type === 'success' ? (
                <div className="text-center py-6 animate-in zoom-in">
                  <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Import Complete!</h3>
                  <p className="text-slate-500">{importStatus.message}</p>
                </div>
              ) : importStatus.type === 'error' ? (
                <div className="text-center py-6 animate-in zoom-in">
                  <AlertTriangle size={48} className="text-rose-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Import Failed</h3>
                  <p className="text-slate-500 mb-6">{importStatus.message}</p>
                  <button onClick={() => setImportStatus({message:'', type:'idle'})} className="bg-slate-100 dark:bg-white/10 px-6 py-2 rounded-xl font-bold text-sm">Try Again</button>
                </div>
              ) : (
                <>
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleFileDrop}
                    className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center transition-all duration-300 ${
                      isDragging 
                      ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-500/10 scale-105' 
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {isImporting ? (
                      <Loader2 size={48} className="text-brand-500 animate-spin mb-4" />
                    ) : (
                      <FileText size={48} className={`mb-4 transition-colors ${isDragging ? 'text-brand-500' : 'text-slate-400'}`} />
                    )}
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Drag & Drop CSV</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">M-Pesa, CRDB, NMB, or standard CSVs.</p>
                    
                    <input type="file" id="csvUpload" accept=".csv" className="hidden" onChange={handleFileInput} disabled={isImporting} />
                    <label htmlFor="csvUpload" className="bg-brand-600 hover:bg-brand-500 text-white font-bold py-2.5 px-6 rounded-xl cursor-pointer transition-all active:scale-95 shadow-md disabled:opacity-50">
                      Browse Files
                    </label>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <button onClick={downloadCSVTemplate} className="text-xs font-bold text-brand-500 hover:text-brand-600 dark:text-brand-400 flex items-center justify-center gap-1 mx-auto transition-colors">
                      <Download size={14}/> Download Template Format
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      , document.body)}

      {/* THE "OOPS" EDIT MODAL */}
      {isEditModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => !isEditing && setIsEditModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md bg-white dark:bg-[#0A0A0E] rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-slate-200 dark:border-white/10 overflow-hidden animate-in zoom-in-95">
            <div className="flex justify-between items-center p-6 border-b border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
              <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2"><Edit2 size={20} className="text-brand-500" /> Edit Transaction</h3>
              <button onClick={() => !isEditing && setIsEditModalOpen(false)} className="text-slate-500 hover:text-rose-500 p-1 rounded-full"><X size={20} /></button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              
              <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl mb-4 border border-slate-200/50 dark:border-white/5">
                <button type="button" onClick={() => setEditForm({...editForm, type: 'expense'})} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${editForm.type === 'expense' ? 'bg-white dark:bg-slate-800 shadow-sm text-rose-600 dark:text-rose-400' : 'text-slate-500'}`}>Expense</button>
                <button type="button" onClick={() => setEditForm({...editForm, type: 'income'})} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${editForm.type === 'income' ? 'bg-white dark:bg-slate-800 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>Income</button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Title</label>
                <input required type="text" value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-1 focus:ring-brand-500 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Amount</label>
                  <div className="flex items-center bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl px-3 py-3 focus-within:ring-1 focus-within:ring-brand-500">
                    <span className="text-slate-400 text-sm font-medium mr-1.5">{currencySymbol}</span>
                    <input required type="text" inputMode="numeric" value={editForm.amount} onChange={(e) => handlePriceChange(e.target.value)} className="w-full bg-transparent text-slate-900 dark:text-white outline-none font-bold" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Date</label>
                  <input required type="date" value={editForm.date} onChange={(e) => setEditForm({...editForm, date: e.target.value})} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-1 focus:ring-brand-500 outline-none [color-scheme:light] dark:[color-scheme:dark]" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Category</label>
                <select value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value})} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-1 focus:ring-brand-500 outline-none appearance-none">
                  {CATEGORIES.map(cat => <option key={cat} value={cat} className="dark:bg-slate-900">{cat}</option>)}
                </select>
              </div>

              <button type="submit" disabled={isEditing} className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl shadow-[0_8px_20px_-6px_rgb(var(--brand-500)/0.6)] transition-all active:scale-95 mt-4 flex justify-center items-center gap-2">
                {isEditing ? <Loader2 className="animate-spin" size={20} /> : "Update Transaction"}
              </button>
            </form>
          </div>
        </div>
      , document.body)}

    </div>
  );
}