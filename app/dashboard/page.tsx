"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Zap, ArrowUpRight, ArrowDownToLine, CalendarDays, Receipt, Sun, Moon, Scale, ChevronDown, ChevronLeft, ChevronRight, Briefcase, PiggyBank, CreditCard, TrendingUp, Target, Rocket, Loader2, Wallet } from "lucide-react"; 
import SpendingChart from "@/components/SpendingChart";
import AddTransactionModal from "@/components/AddTransactionModal";
import HelpModal from "@/components/HelpModal"; 
import NotificationBell from "@/components/NotificationBell"; 
import CategoryChart from "@/components/CategoryChart";
import UserProfile from "@/components/UserProfile"; 
import dynamic from "next/dynamic";
const NovaWrapped = dynamic(() => import("@/components/NovaWrapped"), { ssr: false });
import { supabase } from "@/lib/supabase";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]); 
  const [budgets, setBudgets] = useState<any[]>([]); 
  
  const [assets, setAssets] = useState<any[]>([]);
  const [savings, setSavings] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);
  
  const [accounts, setAccounts] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("User");
  
  const [currencySymbol, setCurrencySymbol] = useState("TSh ");
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Dynamic Greeting State
  const [greeting, setGreeting] = useState("Hello");

  const now = new Date();
  
  // Range Selection State
  const [dateRange, setDateRange] = useState({
    from: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0),
    to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  });
  
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [calendarView, setCalendarView] = useState({ month: now.getMonth(), year: now.getFullYear() });
  
  // Temp state for while the user is actively clicking the calendar
  const [tempSelection, setTempSelection] = useState<{from: Date | null, to: Date | null}>({ from: null, to: null });

  // Check the user's local time for the greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [txRes, subRes, budgetRes, assetsRes, savingsRes, debtsRes, accountsRes] = await Promise.all([
        supabase.from("transactions").select("*").order("date", { ascending: false }),
        supabase.from("subscriptions").select("*").order("billing_date", { ascending: true }),
        supabase.from("budgets").select("*"),
        supabase.from("assets").select("*"),
        supabase.from("savings_goals").select("*"),
        supabase.from("debts").select("*"),
        supabase.from("accounts").select("*") 
      ]);

      if (txRes.data) setTransactions(txRes.data);
      if (subRes.data) setSubscriptions(subRes.data);
      if (budgetRes.data) setBudgets(budgetRes.data);
      if (assetsRes.data) setAssets(assetsRes.data);
      if (savingsRes.data) setSavings(savingsRes.data);
      if (debtsRes.data) setDebts(debtsRes.data);
      if (accountsRes.data) setAccounts(accountsRes.data); 
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedCurrency = localStorage.getItem("app_currency");
    if (savedCurrency === "USD") {
      setCurrencySymbol("$");
    } else {
      setCurrencySymbol("TSh ");
    }

    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const user = session.user;
          const name = user.user_metadata?.full_name || user.email?.split('@')[0] || "User";
          setUserName(name);

          const createdAt = new Date(user.created_at).getTime();
          const timeSinceCreation = new Date().getTime() - createdAt;
          const hasSentEmail = localStorage.getItem('nova_welcome_sent');

          if (timeSinceCreation < 120000 && !hasSentEmail) {
            try {
              await fetch('/api/welcome', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, name: name })
              });
              localStorage.setItem('nova_welcome_sent', 'true');
            } catch (err) {
              console.error("Failed to send welcome email", err);
            }
          }

        } else {
          const savedName = localStorage.getItem("user_name");
          if (savedName) setUserName(savedName);
        }
      } catch (error) {
        console.error("User fetch error:", error);
      }
    };

    fetchUser();
    fetchDashboardData();

    window.addEventListener('transactionUpdated', fetchDashboardData);
    window.addEventListener('subscriptionUpdated', fetchDashboardData);
    window.addEventListener('budgetUpdated', fetchDashboardData);
    window.addEventListener('goalUpdated', fetchDashboardData);

    return () => {
      window.removeEventListener('transactionUpdated', fetchDashboardData);
      window.removeEventListener('subscriptionUpdated', fetchDashboardData);
      window.removeEventListener('budgetUpdated', fetchDashboardData);
      window.removeEventListener('goalUpdated', fetchDashboardData);
    };
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('app_theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleThemeToggle = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('app_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('app_theme', 'light');
      }
      return newMode;
    });
  };

  const formatRangeDisplay = (from: Date, to: Date) => {
    if (from.getFullYear() !== to.getFullYear()) {
      return `${MONTHS[from.getMonth()]} ${from.getDate()}, ${from.getFullYear()} - ${MONTHS[to.getMonth()]} ${to.getDate()}, ${to.getFullYear()}`;
    }
    if (from.getMonth() !== to.getMonth()) {
      return `${MONTHS[from.getMonth()]} ${from.getDate()} - ${MONTHS[to.getMonth()]} ${to.getDate()}, ${to.getFullYear()}`;
    }
    if (from.getDate() !== to.getDate()) {
       return `${MONTHS[from.getMonth()]} ${from.getDate()} - ${to.getDate()}, ${to.getFullYear()}`;
    }
    return `${MONTHS[from.getMonth()]} ${from.getDate()}, ${to.getFullYear()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0E] flex flex-col items-center justify-center transition-colors duration-300">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Decrypting your vault...</p>
      </div>
    );
  }

  // 🚀 TIME MACHINE CORE LOGIC
  const endOfSelectedPeriod = dateRange.to;
  const startOfSelectedPeriod = dateRange.from;
  
  const transactionsUpToSelected = transactions.filter(t => new Date(t.date) <= endOfSelectedPeriod);
  const previousTransactions = transactions.filter(t => new Date(t.date) < startOfSelectedPeriod);
  
  const currentPeriodTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d >= startOfSelectedPeriod && d <= endOfSelectedPeriod;
  });

  const prevIncome = previousTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
  const prevExpense = previousTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
  const openingBalance = prevIncome - prevExpense;

  const currentPeriodIncome = currentPeriodTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
  const currentPeriodExpense = currentPeriodTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);

  const transactionsAfterSelected = transactions.filter(t => new Date(t.date) > endOfSelectedPeriod);

  // 🚀 ENGINE 1: TOTAL RAW WALLETS (Cash + Bank + Mobile Money)
  const currentTotalAccountsBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
  const rolledBackIncome = transactionsAfterSelected.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
  const rolledBackExpense = transactionsAfterSelected.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);

  const totalAllWalletsCash = currentTotalAccountsBalance - rolledBackIncome + rolledBackExpense;

  // 🚀 ENGINE 2: STRICT PHYSICAL CASH ONLY (For the Giant Hero Card)
  const physicalCashAccounts = accounts.filter(acc => 
    (acc.type && acc.type.toLowerCase() === 'cash') || 
    (acc.name && (acc.name.toLowerCase().includes('cash') || acc.name.toLowerCase().includes('hand')))
  );
  const physicalCashIds = physicalCashAccounts.map(acc => acc.id);
  
  const currentPhysicalCashBalance = physicalCashAccounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
  
  // Only roll back transactions that specifically touched the physical cash wallet
  const physicalTransactionsAfterSelected = transactionsAfterSelected.filter(t => physicalCashIds.includes(t.account_id));
  const rolledBackPhysicalIncome = physicalTransactionsAfterSelected.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
  const rolledBackPhysicalExpense = physicalTransactionsAfterSelected.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
  
  const displayPhysicalCash = currentPhysicalCashBalance - rolledBackPhysicalIncome + rolledBackPhysicalExpense;

  // 🚀 SAVINGS CALCULATOR
  const totalSavings = savings.reduce((acc, g) => {
    const addedDate = new Date(g.created_at || now);
    if (addedDate <= endOfSelectedPeriod) {
      return acc + Number(g.current_amount);
    }
    return acc;
  }, 0);

  // 🚀 THE FIX 1: We no longer subtract savings from totalAllWalletsCash for the "Total Liquidity" UI.
  // This ensures the Total Liquidity encompasses all money, preventing the "Physical Cash is larger than Total Liquidity" paradox.

  const isViewingCurrentRange = now >= dateRange.from && now <= dateRange.to;
  const activeAssetsOnly = assets.filter(asset => asset.status === 'active' || !asset.status);

  const totalAssetsValue = activeAssetsOnly.reduce((acc, asset) => {
    const purchaseDate = new Date(asset.purchase_date);
    const rate = Number(asset.depreciation_rate) / 100;
    const purchasePrice = Number(asset.purchase_price);
    const salvageValue = Number(asset.salvage_value) || 0;
    
    const actualTargetDate = endOfSelectedPeriod > now ? now : endOfSelectedPeriod;
    let currentValue = 0; 

    if (actualTargetDate >= purchaseDate) {
      const daysOwnedEnd = (actualTargetDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24);
      const exactYearsOwnedEnd = daysOwnedEnd / 365.25;

      currentValue = purchasePrice * Math.pow(1 - rate, exactYearsOwnedEnd);
      if (currentValue < salvageValue) currentValue = salvageValue;
    }

    return acc + currentValue;
  }, 0);

  const totalDebts = debts.reduce((acc, d) => {
    const addedDate = new Date(d.created_at || now);
    if (addedDate <= endOfSelectedPeriod) {
      return acc + Number(d.remaining_amount);
    }
    return acc;
  }, 0);
  
  // 🚀 THE FIX 2: True Net Worth uses Total All Wallets Cash (which physically holds the savings).
  const trueNetWorth = totalAllWalletsCash + totalAssetsValue - totalDebts;

  // 🚀 WEALTH GRAPH: Loops exactly 6 months back from the End Date
  const generateSparklineData = () => {
    const data = [];
    const labels = [];
    let runningNW = trueNetWorth;

    const endYear = dateRange.to.getFullYear();
    const endMonth = dateRange.to.getMonth();

    for (let i = 0; i < 6; i++) {
      const targetDate = new Date(endYear, endMonth - i, 1);
      const mYear = targetDate.getFullYear();
      const mMonth = targetDate.getMonth();

      const mTx = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === mYear && d.getMonth() === mMonth;
      });

      const mIncome = mTx.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
      const mExpense = mTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
      const mNet = mIncome - mExpense;

      data.unshift(runningNW); 
      labels.unshift(`${MONTHS[mMonth]} ${mYear}`);
      runningNW = runningNW - mNet; 
    }
    return { sparklineData: data, sparklineLabels: labels };
  };

  const { sparklineData, sparklineLabels } = transactions.length > 0 ? generateSparklineData() : { sparklineData: [], sparklineLabels: [] };

  const todayDate = new Date().getDate();
  const upcomingBills = subscriptions.filter(sub => sub.billing_date >= todayDate);
  const nextBill = upcomingBills.length > 0 ? upcomingBills[0] : (subscriptions.length > 0 ? subscriptions[0] : null);

  const categoryTotals = currentPeriodTransactions.reduce((acc, t) => {
    if (t.type === 'expense') {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
    }
    return acc;
  }, {} as Record<string, number>);

  let topCategory = "No Spending";
  let topCategoryAmount = 0;
  
  for (const [cat, amt] of Object.entries(categoryTotals)) {
    const amount = amt as number; 
    
    if (amount > topCategoryAmount) {
      topCategoryAmount = amount;
      topCategory = cat;
    }
  }

  const isEmptyState = transactions.length === 0 && budgets.length === 0 && assets.length === 0 && savings.length === 0 && debts.length === 0 && accounts.length === 0;

  // 🚀 CALENDAR LOGIC HELPERS
  const daysInMonth = new Date(calendarView.year, calendarView.month + 1, 0).getDate();
  const firstDayOfMonth = new Date(calendarView.year, calendarView.month, 1).getDay();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blankDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(calendarView.year, calendarView.month, day);
    
    if (!tempSelection.from || (tempSelection.from && tempSelection.to)) {
      setTempSelection({ from: new Date(clickedDate.setHours(0, 0, 0, 0)), to: null });
    } else {
      const newTo = new Date(clickedDate.setHours(23, 59, 59, 999));
      if (newTo < tempSelection.from) {
        setDateRange({ from: new Date(newTo.setHours(0,0,0,0)), to: new Date(tempSelection.from.setHours(23,59,59,999)) });
      } else {
        setDateRange({ from: tempSelection.from, to: newTo });
      }
      setIsPeriodDropdownOpen(false);
      setTempSelection({ from: null, to: null }); 
    }
  };

  const setPreset = (type: string) => {
    const t = new Date();
    let start, end;

    if (type === 'this_month') {
      start = new Date(t.getFullYear(), t.getMonth(), 1, 0, 0, 0);
      end = new Date(t.getFullYear(), t.getMonth() + 1, 0, 23, 59, 59);
    } else if (type === 'last_month') {
      start = new Date(t.getFullYear(), t.getMonth() - 1, 1, 0, 0, 0);
      end = new Date(t.getFullYear(), t.getMonth(), 0, 23, 59, 59);
    } else if (type === 'last_3_months') {
      start = new Date(t.getFullYear(), t.getMonth() - 2, 1, 0, 0, 0);
      end = new Date(t.getFullYear(), t.getMonth() + 1, 0, 23, 59, 59);
    } else if (type === 'ytd') {
      start = new Date(t.getFullYear(), 0, 1, 0, 0, 0);
      end = new Date(t.getFullYear(), t.getMonth() + 1, 0, 23, 59, 59);
    }

    if (start && end) {
      setDateRange({ from: start, to: end });
      setCalendarView({ month: end.getMonth(), year: end.getFullYear() });
      setIsPeriodDropdownOpen(false);
      setTempSelection({ from: null, to: null });
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6 md:space-y-8 pb-32 relative bg-transparent min-h-screen transition-colors duration-300">
      
      {/* Universal Header */}
      <header className="flex justify-between items-start sm:items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 transition-colors capitalize">
            {isEmptyState ? `Welcome, ${userName}` : greeting}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1 transition-colors">
            {isEmptyState ? "Let's set up your financial vault." : "Here is your financial overview."}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4">
          
          <div className="flex items-center gap-2 md:gap-4 order-first sm:order-last">
            <HelpModal />
            <NotificationBell />
            <button onClick={handleThemeToggle} className="text-slate-500 hover:text-amber-500 dark:text-slate-400 dark:hover:text-amber-400 transition-colors p-1" title="Toggle Theme">
              {isDarkMode ? <Sun size={18} className="md:w-5 md:h-5" /> : <Moon size={18} className="md:w-5 md:h-5" />}
            </button>
            <div className="md:hidden ml-1 flex items-center justify-center cursor-pointer">
              <UserProfile isCollapsed={true} popDirection="down" />
            </div>
          </div>

          {!isEmptyState && (
            <div className="relative z-50 order-last sm:order-first mt-1 sm:mt-0">
              <button 
                onClick={() => {
                  setIsPeriodDropdownOpen(!isPeriodDropdownOpen);
                  setTempSelection({ from: null, to: null });
                  setCalendarView({ month: dateRange.to.getMonth(), year: dateRange.to.getFullYear() });
                }}
                className="flex items-center gap-1.5 md:gap-2 glass-card hover:bg-white/60 dark:hover:bg-white/10 px-3 md:px-4 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer group shadow-sm"
              >
                <CalendarDays size={16} className="text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform hidden sm:block" />
                <span className="whitespace-nowrap">{formatRangeDisplay(dateRange.from, dateRange.to)}</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isPeriodDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* 🚀 PREMIUM CUSTOM CALENDAR POPOVER */}
              {isPeriodDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40 bg-slate-900/5 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsPeriodDropdownOpen(false)} />
                  <div className="fixed left-4 right-4 top-24 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 z-50 sm:w-80 bg-white/90 dark:bg-slate-900/95 backdrop-blur-[64px] border border-white/60 dark:border-white/10 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-5 animate-in fade-in zoom-in-95 origin-top sm:origin-top-right duration-200 overflow-hidden">
                    
                    {/* Header Controls */}
                    <div className="flex justify-between items-center mb-4 px-2">
                      <button 
                        onClick={() => setCalendarView(prev => prev.month === 0 ? { month: 11, year: prev.year - 1 } : { ...prev, month: prev.month - 1 })}
                        className="p-1.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-500 transition-colors"
                      >
                        <ChevronLeft size={18}/>
                      </button>
                      <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">
                        {MONTHS[calendarView.month]} {calendarView.year}
                      </span>
                      <button 
                        onClick={() => setCalendarView(prev => prev.month === 11 ? { month: 0, year: prev.year + 1 } : { ...prev, month: prev.month + 1 })}
                        className="p-1.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-500 transition-colors"
                      >
                        <ChevronRight size={18}/>
                      </button>
                    </div>

                    {/* Days of Week */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                        <div key={day} className="text-center text-[10px] font-bold text-slate-400 dark:text-slate-500">{day}</div>
                      ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 mb-4">
                      {blankDays.map((_, i) => (
                        <div key={`blank-${i}`} className="h-8 w-8" />
                      ))}
                      {calendarDays.map(day => {
                        const currentIterDate = new Date(calendarView.year, calendarView.month, day);
                        
                        // Interaction State Math
                        const activeFrom = tempSelection.from || dateRange.from;
                        const activeTo = tempSelection.to || dateRange.to;

                        const isFromDate = activeFrom && currentIterDate.setHours(0,0,0,0) === activeFrom.setHours(0,0,0,0);
                        const isToDate = activeTo && currentIterDate.setHours(0,0,0,0) === activeTo.setHours(0,0,0,0);
                        
                        let inRange = false;
                        if (activeFrom && activeTo) {
                          inRange = currentIterDate > activeFrom && currentIterDate < activeTo;
                        }

                        let baseClasses = "h-8 w-8 text-sm font-semibold rounded-full flex items-center justify-center transition-all duration-200 ";
                        
                        if (isFromDate || isToDate) {
                           baseClasses += "bg-indigo-500 text-white shadow-md shadow-indigo-500/25 scale-105 z-10 relative";
                        } else if (inRange) {
                           baseClasses += "bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-none scale-100";
                        } else {
                           baseClasses += "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10";
                        }

                        // Connect the edges if in range
                        if (isFromDate && activeTo && currentIterDate < activeTo) {
                          baseClasses += " rounded-r-none";
                        }
                        if (isToDate && activeFrom && currentIterDate > activeFrom) {
                          baseClasses += " rounded-l-none";
                        }

                        return (
                          <div key={day} className="relative flex justify-center">
                            {/* Background connector for range flow */}
                            {inRange && <div className="absolute inset-0 bg-indigo-50 dark:bg-indigo-500/20 -z-10 w-full" />}
                            {isFromDate && activeTo && currentIterDate < activeTo && <div className="absolute inset-y-0 right-0 w-1/2 bg-indigo-50 dark:bg-indigo-500/20 -z-10" />}
                            {isToDate && activeFrom && currentIterDate > activeFrom && <div className="absolute inset-y-0 left-0 w-1/2 bg-indigo-50 dark:bg-indigo-500/20 -z-10" />}
                            
                            <button onClick={() => handleDayClick(day)} className={baseClasses}>
                              {day}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Presets */}
                    <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-200/50 dark:border-white/10">
                      <button onClick={() => setPreset('this_month')} className="py-1.5 px-3 text-xs font-bold bg-slate-100/50 dark:bg-white/5 hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 rounded-lg transition-colors">This Month</button>
                      <button onClick={() => setPreset('last_month')} className="py-1.5 px-3 text-xs font-bold bg-slate-100/50 dark:bg-white/5 hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 rounded-lg transition-colors">Last Month</button>
                      <button onClick={() => setPreset('last_3_months')} className="py-1.5 px-3 text-xs font-bold bg-slate-100/50 dark:bg-white/5 hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 rounded-lg transition-colors">Last 3 Months</button>
                      <button onClick={() => setPreset('ytd')} className="py-1.5 px-3 text-xs font-bold bg-slate-100/50 dark:bg-white/5 hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 rounded-lg transition-colors">Year to Date</button>
                    </div>

                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </header>

      {/* RENDER LOGIC */}
      {isEmptyState ? (
        <EmptyDashboardState />
      ) : (
        <>
          <NovaWrapped 
            month={formatRangeDisplay(dateRange.from, dateRange.to)}
            netWorth={`${currencySymbol}${trueNetWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            monthlyIncome={`+${currencySymbol}${currentPeriodIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            monthlyExpense={`-${currencySymbol}${currentPeriodExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            topCategory={topCategory}
            transactionCount={currentPeriodTransactions.length}
          />

          {/* Massive True Net Worth Banner */}
          <div className="glass-card p-6 md:p-8 rounded-[2rem] relative overflow-hidden transition-colors border-t border-white/40 dark:border-white/10 shadow-xl shadow-brand/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            
            {/* Indigo Glow */}
            <div className="absolute -left-24 -top-24 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none z-0"></div>

            <div className="relative z-10 w-full md:w-auto">
              <p className="text-indigo-600 dark:text-indigo-400 font-bold tracking-widest uppercase text-xs flex items-center gap-2 mb-2">
                <TrendingUp size={16} /> True Net Worth
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white transition-colors break-words leading-tight">
                {currencySymbol}{trueNetWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </h2>
              <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">As of {MONTHS[dateRange.to.getMonth()]} {dateRange.to.getDate()}, {dateRange.to.getFullYear()}</p>
            </div>

            <div className="relative z-10 grid grid-cols-2 md:flex md:flex-wrap gap-4 md:gap-8 mt-2 md:mt-0 w-full md:w-auto">
              <div>
                {/* 🚀 THE FIX: Render totalAllWalletsCash directly to match the true sum of all accounts */}
                <p className="text-[10px] md:text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"><Wallet size={12}/> Total Liquidity</p>
                <p className="text-sm md:text-lg font-bold text-slate-700 dark:text-slate-200 break-words">{currencySymbol}{totalAllWalletsCash.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
              <div>
                <p className="text-[10px] md:text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"><PiggyBank size={12}/> Savings</p>
                <p className="text-sm md:text-lg font-bold text-slate-700 dark:text-slate-200 break-words">{currencySymbol}{totalSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
              <div>
                <p className="text-[10px] md:text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"><Briefcase size={12}/> Assets (NBV)</p>
                <p className="text-sm md:text-lg font-bold text-slate-700 dark:text-slate-200 break-words">{currencySymbol}{totalAssetsValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
              <div>
                <p className="text-[10px] md:text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"><CreditCard size={12}/> Debts</p>
                <p className="text-sm md:text-lg font-bold text-rose-500 dark:text-rose-400 break-words">- {currencySymbol}{totalDebts.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
            </div>
          </div>

          {/* Standalone Premium Trajectory Graph Card */}
          {!isEmptyState && sparklineData.length > 0 && (
            <div className="glass-card p-6 md:p-8 rounded-[2rem] flex flex-col h-48 md:h-64 transition-colors relative overflow-visible z-10 hover:z-50">
              <div className="flex justify-between items-center mb-6 relative z-10">
                <div>
                  <h3 className="text-base md:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 transition-colors">Wealth Trajectory</h3>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">6 Months up to {MONTHS[dateRange.to.getMonth()]} {dateRange.to.getFullYear()}</p>
                </div>
                {/* Indigo Up Badge */}
                {sparklineData[sparklineData.length - 1] >= sparklineData[0] ? (
                  <div className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold border border-indigo-200 dark:border-indigo-500/20 flex items-center gap-1 shadow-sm">
                    <TrendingUp size={12} /> Up Trending
                  </div>
                ) : (
                  <div className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 px-3 py-1 rounded-full text-xs font-bold border border-rose-200 dark:border-rose-500/20 flex items-center gap-1 shadow-sm">
                    <TrendingUp size={12} className="rotate-180" /> Down Trending
                  </div>
                )}
              </div>
              <div className="flex-1 w-full relative -mx-2 sm:-mx-4 mt-2">
                 <NetWorthSparkline data={sparklineData} labels={sparklineLabels} currencySymbol={currencySymbol} />
              </div>
            </div>
          )}

          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card p-6 md:p-8 rounded-[2rem] relative transition-colors">
              <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none">
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/20 dark:bg-indigo-500/10 blur-3xl rounded-full"></div>
              </div>
              
              <div className="relative z-10">
                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-semibold tracking-wider uppercase transition-colors">
                  {isViewingCurrentRange ? "Physical Cash In Hand" : `Period End Physical Cash`}
                </p>
                
                <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tighter mt-2 md:mt-3 text-slate-900 dark:text-white transition-colors break-words leading-tight">
                  {currencySymbol}{displayPhysicalCash.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </h2>
                
                <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3">
                  <AddTransactionModal />
                  <Link href="/dashboard/subscriptions" className="bg-slate-50/50 hover:bg-slate-100/80 dark:bg-white/5 dark:hover:bg-white/10 transition px-6 py-3 rounded-2xl font-medium flex items-center justify-center gap-2 text-sm border border-slate-200/50 dark:border-white/5 text-slate-800 dark:text-white backdrop-blur-md">
                    <Zap size={18} className="text-amber-500 dark:text-amber-400" /> Cancel Subs
                  </Link>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 md:p-8 rounded-[2rem] flex flex-col justify-between group transition-colors overflow-hidden">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 mb-4 backdrop-blur-md transition-colors">!</div>
                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-semibold tracking-wide uppercase transition-colors">Upcoming Bills</p>
                
                {nextBill ? (
                  <>
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight mt-2 md:mt-3 text-slate-900 dark:text-slate-100 transition-colors">{nextBill.name}</h3>
                    <p className="text-xs md:text-sm font-medium text-slate-500 mt-1 transition-colors">
                      Due on the {nextBill.billing_date}th • <span className="font-bold text-rose-600 dark:text-rose-400">{currencySymbol}{Number(nextBill.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight mt-2 md:mt-3 text-slate-900 dark:text-slate-100 transition-colors">No active bills</h3>
                    <p className="text-xs md:text-sm font-medium text-slate-500 mt-1 transition-colors">Add a recurring expense</p>
                  </>
                )}
              </div>
              <Link href="/dashboard/subscriptions" className="text-indigo-500 dark:text-indigo-400 flex items-center gap-1 text-sm font-semibold mt-6 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors">
                Manage Subscriptions <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>

          {/* Budget & Category Doughnut Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card p-6 md:p-8 rounded-[2rem] flex flex-col justify-between transition-colors">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-base md:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 transition-colors">
                    Period Budget Health
                  </h3>
                  <Link href="/dashboard/budgets" className="text-xs md:text-sm text-slate-500 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400 transition font-semibold">View Details</Link>
                </div>
                
                {budgets.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-medium transition-colors">No budgets set. Head over to the Budgets tab to track your spending!</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-4">
                    {budgets.slice(0, 6).map(budget => {
                      const spent = currentPeriodTransactions
                        .filter(t => t.category === budget.name)
                        .reduce((acc, t) => acc + Number(t.amount), 0);
                        
                      return (
                        <BudgetMiniBar 
                          key={budget.id}
                          name={budget.name} 
                          spent={spent} 
                          total={Number(budget.limit_amount)} 
                          currencySymbol={currencySymbol} 
                          isCurrentRange={isViewingCurrentRange} 
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              {budgets.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-200/50 dark:border-white/5">
                  {(() => {
                    const totalLimit = budgets.reduce((acc, b) => acc + Number(b.limit_amount), 0);
                    const totalSpent = budgets.reduce((acc, b) => {
                      const spent = currentPeriodTransactions
                        .filter(t => t.category === b.name)
                        .reduce((sum, t) => sum + Number(t.amount), 0);
                      return acc + spent;
                    }, 0);
                    const overallPct = totalLimit > 0 ? Math.min((totalSpent / totalLimit) * 100, 100) : 0;
                    
                    let progressColor = "bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]";
                    if (overallPct > 75) progressColor = "bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]";
                    if (overallPct > 90) progressColor = "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]";

                    return (
                      <div>
                        <div className="flex justify-between items-end mb-3">
                          <div>
                            <p className="text-[10px] md:text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-1">Overall Budget Usage</p>
                            <p className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                              {currencySymbol}{totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-xs md:text-sm font-medium text-slate-500">/ {currencySymbol}{totalLimit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                            </p>
                          </div>
                          <span className="font-bold text-sm md:text-base text-slate-700 dark:text-slate-300">{overallPct.toFixed(0)}%</span>
                        </div>
                        <div className="h-2.5 md:h-3 w-full bg-slate-100/80 dark:bg-slate-900/80 rounded-full overflow-hidden shadow-inner border border-slate-200/50 dark:border-white/5">
                          <div className={`h-full ${progressColor} transition-all duration-1000 ease-out`} style={{ width: `${overallPct}%` }}></div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="glass-card p-6 md:p-8 rounded-[2rem] flex flex-col transition-colors">
              <h3 className="text-base md:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 transition-colors">Where it went</h3>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-1 transition-colors font-medium">Spending by category</p>
              <div className="flex-1 w-full">
                <CategoryChart selectedMonth={dateRange.to.getMonth()} selectedYear={dateRange.to.getFullYear()} currencySymbol={currencySymbol} />
              </div>
            </div>
          </div>

          {/* Recent Activity & Spending Graph Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card p-6 md:p-8 rounded-[2rem] transition-colors">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base md:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 transition-colors">Activity in Period</h3>
                <Link href="/dashboard/transactions" className="text-xs md:text-sm text-slate-500 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400 transition font-semibold">View all</Link>
              </div>
              <div className="space-y-3">
                {openingBalance !== 0 && (
                  <TransactionRow 
                    icon={<Scale size={16} />} 
                    title={`Period Opening Balance`} 
                    date="Carried over" 
                    amount={`${openingBalance >= 0 ? '+' : ''}${currencySymbol}${openingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
                    color={openingBalance >= 0 ? "text-indigo-600 dark:text-indigo-400" : "text-rose-600 dark:text-rose-400"} 
                    bg={openingBalance >= 0 ? "bg-indigo-50/50 dark:bg-indigo-500/10" : "bg-rose-50/50 dark:bg-rose-500/10"}
                  />
                )}

                {currentPeriodTransactions.length === 0 ? (
                  <p className="text-slate-500 text-center py-6 text-sm font-medium">No transactions found for this period.</p>
                ) : (
                  currentPeriodTransactions.slice(0, 5).map((t) => (
                    <TransactionRow 
                      key={t.id} 
                      icon={t.type === 'income' ? <ArrowDownToLine size={16}/> : <Receipt size={16}/>} 
                      title={t.title} 
                      date={new Date(t.date).toLocaleDateString()} 
                      amount={`${t.type === 'expense' ? '-' : '+'}${currencySymbol}${Number(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
                      color={t.type === 'income' ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"} 
                      bg={t.type === 'income' ? "bg-emerald-50/50 dark:bg-emerald-400/10" : "bg-slate-50/50 dark:bg-white/5"}
                    />
                  ))
                )}
              </div>
            </div>

            <div className="glass-card p-6 md:p-8 rounded-[2rem] flex flex-col transition-colors">
              <h3 className="text-base md:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 transition-colors">Monthly Trends</h3>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-4 transition-colors font-medium">Spending analysis</p>
              <div className="flex-1 flex items-end">
                <SpendingChart selectedMonth={dateRange.to.getMonth()} selectedYear={dateRange.to.getFullYear()} currencySymbol={currencySymbol} />
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}

function BudgetMiniBar({ name, spent, total, currencySymbol, isCurrentRange }: any) {
  const percentage = Math.min((spent / total) * 100, 100);
  
  let progressColor = "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]";
  let pacingUI = null;

  if (isCurrentRange) {
    const today = new Date().getDate();
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const daysRemainingInMonth = daysInMonth - today;

    if (spent >= total) {
       progressColor = "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]";
       pacingUI = <p className="text-[10px] mt-1.5 font-bold text-rose-500 dark:text-rose-400">🛑 Budget exhausted</p>;
    } else if (spent > 0) {
      const dailyBurnRate = spent / today;
      const budgetRemaining = total - spent;
      const daysOfBudgetLeft = budgetRemaining / dailyBurnRate;

      if (daysOfBudgetLeft < daysRemainingInMonth) {
        progressColor = "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]";
        
        const runOutDate = new Date();
        runOutDate.setDate(today + Math.floor(daysOfBudgetLeft));
        const dayOrdinal = runOutDate.getDate();
        
        const suffix = ["st", "nd", "rd"][((dayOrdinal + 90) % 100 - 10) % 10 - 1] || "th";
        
        pacingUI = <p className="text-[10px] mt-1.5 font-bold text-rose-500 dark:text-rose-400 flex items-center gap-1"><TrendingUp size={10}/> Emptying early (~{dayOrdinal}{suffix})</p>;
      } else {
        pacingUI = <p className="text-[10px] mt-1.5 font-bold text-emerald-500 dark:text-emerald-400 flex items-center gap-1"><Scale size={10}/> Good pacing</p>;
      }
    } else {
        pacingUI = <p className="text-[10px] mt-1.5 font-bold text-emerald-500 dark:text-emerald-400">Untouched so far</p>;
    }
  } else {
    if (percentage > 90) progressColor = "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]";
    else if (percentage > 75) progressColor = "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]";
  }

  return (
    <div>
      <div className="flex justify-between text-xs md:text-sm mb-2 md:mb-3">
        <span className="font-semibold tracking-wide text-slate-700 dark:text-slate-200 transition-colors truncate pr-2">{name}</span>
        <span className="font-medium text-slate-500 transition-colors shrink-0">
          {currencySymbol}{(spent >= 1000000 ? (spent/1000000).toFixed(1)+'M' : Number(spent).toLocaleString(undefined, { maximumFractionDigits: 0 }))} / {currencySymbol}{(total >= 1000000 ? (total/1000000).toFixed(1)+'M' : Number(total).toLocaleString())}
        </span>
      </div>
      <div className="h-1.5 md:h-2 w-full bg-slate-100/80 dark:bg-slate-800/50 rounded-full overflow-hidden transition-colors shadow-inner backdrop-blur-sm border border-transparent dark:border-white/5">
        <div className={`h-full ${progressColor} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${percentage}%` }}></div>
      </div>
      {pacingUI}
    </div>
  );
}

function TransactionRow({ icon, title, date, amount, color, bg }: any) {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-white/40 dark:hover:bg-white/5 rounded-2xl transition-all cursor-pointer -mx-3 border border-transparent hover:border-slate-200/50 dark:hover:border-white/5">
      <div className="flex items-center gap-3 md:gap-4 truncate pr-4">
        <div className={`w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-[1rem] flex items-center justify-center ${bg} ${color} transition-colors border border-slate-200/30 dark:border-white/5 backdrop-blur-md`}>{icon}</div>
        <div className="truncate">
          <p className="text-sm md:text-base font-semibold tracking-wide text-slate-900 dark:text-slate-100 transition-colors truncate">{title}</p>
          <p className="text-[10px] md:text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 transition-colors">{date}</p>
        </div>
      </div>
      <span className={`text-sm md:text-base font-bold tracking-tight shrink-0 ${color} transition-colors`}>{amount}</span>
    </div>
  );
}

function NetWorthSparkline({ data, labels, currencySymbol }: { data: number[], labels: string[], currencySymbol: string }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;

  const isTrendingUp = data[data.length - 1] >= data[0];
  const strokeColor = isTrendingUp ? '#6366f1' : '#f43f5e'; 

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = range === 1 && max === min ? 50 : 100 - (((val - min) / range) * 70 + 15);
    return [x, y];
  });

  const smoothPath = points.reduce((acc, point, i, a) => {
    if (i === 0) return `M ${point[0]},${point[1]}`;
    const p0 = a[i - 1];
    const cp1x = p0[0] + (point[0] - p0[0]) * 0.5;
    const cp1y = p0[1];
    const cp2x = p0[0] + (point[0] - p0[0]) * 0.5;
    const cp2y = point[1];
    return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${point[0]},${point[1]}`;
  }, "");

  const fillPath = `${smoothPath} L 100,100 L 0,100 Z`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    const index = Math.round(percentage * (data.length - 1));
    setHoverIndex(index);
  };

  return (
    <div 
      className="absolute inset-0 w-full h-full cursor-crosshair"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverIndex(null)}
      onTouchMove={(e) => {
        if (!containerRef.current) return;
        const touch = e.touches[0];
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
        const percentage = x / rect.width;
        const index = Math.round(percentage * (data.length - 1));
        setHoverIndex(index);
      }}
      onTouchEnd={() => setHoverIndex(null)}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible absolute inset-0 pointer-events-none">
        <defs>
          <linearGradient id="sparkline-up-card" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="sparkline-down-card" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        <path d={fillPath} fill={`url(#${isTrendingUp ? 'sparkline-up-card' : 'sparkline-down-card'})`} />
        
        <path
          d={smoothPath}
          fill="none"
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)]"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {hoverIndex !== null && (
        <div 
          className="absolute top-0 bottom-0 border-l-2 border-dashed border-slate-400/50 dark:border-slate-500/50 pointer-events-none transition-all duration-75 ease-out z-20"
          style={{ left: `${points[hoverIndex][0]}%` }}
        >
          <div 
            className="absolute w-3.5 h-3.5 rounded-full bg-white dark:bg-slate-900 border-[3px] shadow-[0_0_10px_rgba(0,0,0,0.2)] -translate-x-1/2 -translate-y-1/2 transition-all duration-75 ease-out"
            style={{ 
              top: `${points[hoverIndex][1]}%`,
              borderColor: strokeColor,
              boxShadow: `0 0 12px ${strokeColor}80` 
            }}
          />
          
          <div className="absolute -top-6 -translate-x-1/2 -translate-y-full z-50 pointer-events-none">
            <div className="glass-card px-4 py-2 rounded-2xl whitespace-nowrap shadow-xl border border-white/40 dark:border-white/10 text-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
              <p className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-0.5">
                {labels[hoverIndex]}
              </p>
              <p className="text-sm md:text-base font-extrabold text-slate-900 dark:text-white">
                {currencySymbol}{data[hoverIndex].toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 🚀 PRESERVED: Your exact Empty State cards
function EmptyDashboardState() {
  return (
    <div className="glass-card p-8 md:p-12 rounded-[2.5rem] relative text-center border border-indigo-200/50 dark:border-indigo-500/20 shadow-2xl mt-8">
      <div className="absolute -left-32 -top-32 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/20 blur-3xl rounded-full pointer-events-none"></div>
      <div className="absolute -right-32 -bottom-32 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/20 blur-3xl rounded-full pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto">
        
        <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 mb-8 rotate-3 hover:rotate-0 transition-all duration-300">
          <Rocket size={36} />
        </div>
        
        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
          Your vault is ready.
        </h2>
        <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 mb-12 px-6">
          You currently have no data. Let's start building your financial tracker. Complete these three steps to unlock your dashboard.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full relative z-20">
          
          <Link href="/dashboard/budgets" className="group bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 hover:border-indigo-500/30 p-6 rounded-3xl text-left hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 border border-indigo-100 dark:border-indigo-500/20">
              <Target size={20} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">1. Set a Budget</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Define your spending limits for the month.</p>
          </Link>

          <Link href="/dashboard/assets" className="group bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 hover:border-emerald-500/30 p-6 rounded-3xl text-left hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 border border-emerald-100 dark:border-emerald-500/20">
              <Briefcase size={20} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">2. Add an Asset</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Log your cash, property, or investments.</p>
          </Link>

          <div className="group bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 hover:border-purple-500/30 p-6 rounded-3xl text-left hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col popover-up-container z-50">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 border border-purple-100 dark:border-purple-500/20">
              <Receipt size={20} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">3. Log a Transaction</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 flex-1">Record your first income or expense.</p>
            
            <div className="w-full mt-auto">
               <AddTransactionModal />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}