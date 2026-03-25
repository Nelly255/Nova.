"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Filter, ArrowDownToLine, ArrowUpRight, Trash2, CalendarDays, ChevronLeft, ChevronRight, Pencil, ChevronDown } from "lucide-react";
import EditTransactionModal from "@/components/EditTransactionModal"; 

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState("");
  
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  
  const [transactionToEdit, setTransactionToEdit] = useState<any>(null);
  
  // Custom state for our gorgeous new delete modal!
  const [transactionToDelete, setTransactionToDelete] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 25;
  const [currencySymbol, setCurrencySymbol] = useState("$");

  const fetchAllTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false });

    if (!error && data) setTransactions(data);
    setLoading(false);
  };

  useEffect(() => {
    const savedCurrency = localStorage.getItem("app_currency");
    if (savedCurrency === "TZS") {
      setCurrencySymbol("TSh ");
    } else {
      setCurrencySymbol("$");
    }
    
    fetchAllTransactions();

    window.addEventListener("transactionUpdated", fetchAllTransactions);
    return () => window.removeEventListener("transactionUpdated", fetchAllTransactions);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery, selectedMonth, selectedYear]);

  // This now handles the actual deletion after the user clicks "Yes, Delete" in the modal
  const confirmDelete = async () => {
    if (!transactionToDelete) return;
    
    const { error } = await supabase.from("transactions").delete().eq("id", transactionToDelete.id);
    if (!error) {
      fetchAllTransactions();
      window.dispatchEvent(new Event("transactionUpdated")); 
    }
    setTransactionToDelete(null); // Close the modal
  };

  const filteredTransactions = transactions.filter(t => {
    const typeMatch = filter === 'all' || t.type === filter;
    const searchMatch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        t.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const d = new Date(t.date);
    const monthMatch = d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;

    return typeMatch && searchMatch && monthMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE));
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6 md:space-y-8 pb-32 bg-transparent min-h-screen relative">
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 transition-colors">Transactions</h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">A detailed history of your finances.</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
          <div className="relative z-50">
            <button 
              onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
              className="w-full flex items-center justify-between md:justify-start gap-2 bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-white/5 hover:bg-white/80 dark:hover:bg-slate-800/50 px-4 py-2.5 md:py-2 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex items-center gap-2">
                <CalendarDays size={18} className="text-brand group-hover:scale-110 transition-transform" />
                <span>{MONTHS[selectedMonth]} {selectedYear}</span>
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isPeriodDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isPeriodDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-slate-900/10 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
                  onClick={() => setIsPeriodDropdownOpen(false)}
                />
                <div className="fixed left-4 right-4 top-24 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 z-50 sm:w-72 bg-white/90 dark:bg-slate-900/90 backdrop-blur-[64px] border border-white/60 dark:border-white/10 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-5 animate-in fade-in zoom-in-95 origin-top sm:origin-top-right duration-200">
                  <div className="flex justify-between items-center mb-6 px-2">
                    <button onClick={() => setSelectedYear(y => y - 1)} className="p-1.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-500 transition-colors"><ChevronLeft size={18}/></button>
                    <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">{selectedYear}</span>
                    <button onClick={() => setSelectedYear(y => y + 1)} className="p-1.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-500 transition-colors"><ChevronRight size={18}/></button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {MONTHS.map((monthStr, index) => {
                      const isSelected = selectedMonth === index;
                      const isCurrentRealMonth = index === now.getMonth() && selectedYear === now.getFullYear();

                      return (
                        <button 
                          key={monthStr}
                          onClick={() => { setSelectedMonth(index); setIsPeriodDropdownOpen(false); }}
                          className={`py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                            isSelected 
                              ? 'bg-brand text-white shadow-md shadow-brand/25 scale-105' 
                              : isCurrentRealMonth
                                ? 'bg-brand/10 dark:bg-brand/10 text-brand dark:text-brand border border-brand/20 dark:border-brand/30'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          {monthStr}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search history..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-white/5 rounded-xl pl-10 pr-4 py-2.5 md:py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-brand transition-colors w-full md:w-64 shadow-sm"
              />
            </div>
            <button className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-white/5 p-2.5 md:p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-brand dark:hover:text-brand transition-colors shadow-sm shrink-0">
              <Filter size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-white/5 pb-4 transition-colors relative z-10">
        <button 
          onClick={() => setFilter('all')} 
          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            filter === 'all' 
            ? 'bg-slate-900 text-white shadow-sm dark:bg-slate-800' 
            : 'text-slate-500 hover:text-slate-900 hover:bg-white/80 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-white/5 backdrop-blur-sm'
          }`}
        >
          All
        </button>
        <button 
          onClick={() => setFilter('income')} 
          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            filter === 'income' 
            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
            : 'text-slate-500 hover:text-slate-900 hover:bg-white/80 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-white/5 backdrop-blur-sm'
          }`}
        >
          Income
        </button>
        <button 
          onClick={() => setFilter('expense')} 
          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            filter === 'expense' 
            ? 'bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' 
            : 'text-slate-500 hover:text-slate-900 hover:bg-white/80 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-white/5 backdrop-blur-sm'
          }`}
        >
          Expenses
        </button>
      </div>

      <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-white/5 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-2xl dark:shadow-black/50 transition-colors relative z-10">
        
        {/* ========================================= */}
        {/* 💻 DESKTOP VIEW */}
        {/* ========================================= */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-white/50 dark:border-white/5 bg-white/40 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider transition-colors backdrop-blur-md">
                <th className="px-6 py-4 font-semibold min-w-[200px]">Transaction</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Amount</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40 dark:divide-white/5 transition-colors">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-500">Loading history...</td></tr>
              ) : paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-500">
                    {searchQuery ? `No transactions found matching "${searchQuery}"` : `No transactions found for ${MONTHS[selectedMonth]} ${selectedYear}.`}
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-white/80 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors border border-white/40 dark:border-white/5 ${
                          t.type === 'income' ? 'bg-emerald-100/80 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400' : 'bg-rose-100/80 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                        }`}>
                          {t.type === 'income' ? <ArrowDownToLine size={18}/> : <ArrowUpRight size={18}/>}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-slate-200 transition-colors line-clamp-1">{t.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-700 bg-white/60 dark:text-slate-300 dark:bg-white/10 px-3 py-1.5 rounded-full border border-white/80 dark:border-white/5 transition-colors whitespace-nowrap backdrop-blur-sm">
                        {t.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 transition-colors whitespace-nowrap">
                      {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    {/* UPGRADED: Expenses are now Red here in Desktop view! */}
                    <td className={`px-6 py-4 text-right font-semibold tracking-wide transition-colors whitespace-nowrap ${
                      t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {t.type === 'expense' ? '-' : '+'}
                      {currencySymbol}
                      {Number(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button onClick={() => setTransactionToEdit(t)} className="text-slate-400 dark:text-slate-500 hover:text-brand dark:hover:text-brand hover:bg-brand/10 dark:hover:bg-brand/10 transition-colors p-2 rounded-lg" title="Edit Transaction"><Pencil size={18} /></button>
                        <button onClick={() => setTransactionToDelete(t)} className="text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors p-2 rounded-lg" title="Delete Transaction"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ========================================= */}
        {/* 📱 MOBILE VIEW */}
        {/* ========================================= */}
        <div className="md:hidden divide-y divide-white/40 dark:divide-white/5">
          {loading ? (
            <div className="px-6 py-20 text-center text-slate-500">Loading history...</div>
          ) : paginatedTransactions.length === 0 ? (
            <div className="px-6 py-20 text-center text-slate-500">
              {searchQuery ? `No transactions found matching "${searchQuery}"` : `No transactions found for ${MONTHS[selectedMonth]} ${selectedYear}.`}
            </div>
          ) : (
            paginatedTransactions.map((t) => (
              <div key={t.id} className="p-5 hover:bg-white/80 dark:hover:bg-white/5 transition-colors group">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors mt-0.5 border border-white/40 dark:border-white/5 ${
                      t.type === 'income' ? 'bg-emerald-100/80 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400' : 'bg-rose-100/80 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                    }`}>
                      {t.type === 'income' ? <ArrowDownToLine size={18}/> : <ArrowUpRight size={18}/>}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{t.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium flex flex-wrap gap-1 items-center">
                        <span>{new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-white/60 dark:bg-white/10 rounded-full">{t.category}</span>
                      </p>
                    </div>
                  </div>
                  {/* UPGRADED: Expenses are now Red here in Mobile view too! */}
                  <div className={`text-right font-extrabold text-base tracking-wide transition-colors whitespace-nowrap mt-0.5 ${
                    t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {t.type === 'expense' ? '-' : '+'}{currencySymbol}{Number(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-3 border-t border-white/40 dark:border-white/5 mt-1">
                  <button 
                    onClick={() => setTransactionToEdit(t)} 
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-brand/10 text-brand dark:bg-brand/10 dark:text-brand rounded-lg text-xs font-bold transition-all active:scale-95"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button 
                    onClick={() => setTransactionToDelete(t)} 
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 rounded-lg text-xs font-bold transition-all active:scale-95"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Pagination */}
        {!loading && filteredTransactions.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 border-t border-white/50 dark:border-white/5 bg-white/40 dark:bg-white/5 transition-colors backdrop-blur-md">
            <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 text-center sm:text-left">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} of {filteredTransactions.length} entries
            </span>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-white/80 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white/60 dark:bg-transparent shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>
              
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300 px-2">
                Page {currentPage} / {totalPages}
              </span>
              
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-white/80 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white/60 dark:bg-transparent shadow-sm"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {transactionToEdit && (
        <EditTransactionModal 
          transaction={transactionToEdit} 
          onClose={() => setTransactionToEdit(null)} 
        />
      )}

      {/* ============================================== */}
      {/* DANGER MODAL */}
      {/* ============================================== */}
      {transactionToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/10 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setTransactionToDelete(null)} />
          <div className="relative z-10 w-full max-w-sm bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center pt-8">
              <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-500/30">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Delete Transaction?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                Are you sure you want to delete <span className="font-bold text-slate-700 dark:text-slate-300">{transactionToDelete.title}</span>? This action cannot be undone and will affect your balances.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setTransactionToDelete(null)} className="flex-1 py-3.5 rounded-xl font-bold text-slate-700 bg-white/80 border border-slate-200 hover:bg-white dark:text-slate-300 dark:border-white/5 dark:bg-white/5 dark:hover:bg-white/10 transition-colors active:scale-95 shadow-sm">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 py-3.5 rounded-xl font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-[0_4px_14px_rgba(244,63,94,0.4)] transition-all hover:-translate-y-0.5 active:scale-95">Yes, Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}