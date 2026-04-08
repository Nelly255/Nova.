"use client";

import { useState, useEffect, ReactNode, useRef } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";
import { Loader2, X, ArrowRight, ArrowLeftRight, AlertTriangle, ChevronDown, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

interface Wallet {
  id: string;
  name: string;
  balance: number | string;
}

interface Props {
  accounts: Wallet[];
  onSuccess: () => void;
  currencySymbol: string;
  children: ReactNode;
}

// ==========================================
// 🚀 CUSTOM SELECT DROPDOWN
// ==========================================
const CustomSelect = ({ 
  value, 
  onChange, 
  options, 
  placeholder 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  options: { value: string; label: string }[]; 
  placeholder: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-slate-50 dark:bg-black/50 border rounded-2xl px-4 py-3.5 text-sm font-semibold flex justify-between items-center cursor-pointer transition-all duration-200 ${
          isOpen ? "border-indigo-500 ring-1 ring-indigo-500/20 text-slate-900 dark:text-white" : "border-slate-200 dark:border-white/10 hover:border-indigo-500/50 text-slate-900 dark:text-white"
        }`}
      >
        <span className={selectedOption ? "" : "text-slate-400"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-indigo-500" : ""}`} />
      </div>

      {isOpen && (
        <div className="absolute z-[200] w-full mt-2 bg-white dark:bg-[#12121A] border border-slate-200 dark:border-white/10 rounded-2xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500 text-center">No options available</div>
          ) : (
            options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`px-4 py-3 text-sm font-semibold cursor-pointer transition-colors ${
                  value === opt.value ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                }`}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 🚀 NEW: CUSTOM DATE PICKER
// ==========================================
const CustomDatePicker = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    const [y, m, d] = value.split('-');
    return new Date(Number(y), Number(m) - 1, Number(d));
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const handleSelect = (day: number) => {
    const yyyy = currentYear;
    const mm = String(currentMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const [selY, selM, selD] = value.split('-');
  const selectedDate = new Date(Number(selY), Number(selM) - 1, Number(selD));
  const displayDate = selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-slate-50 dark:bg-black/50 border rounded-2xl px-4 py-3.5 text-sm font-semibold flex justify-between items-center cursor-pointer transition-all duration-200 ${
          isOpen ? "border-indigo-500 ring-1 ring-indigo-500/20 text-slate-900 dark:text-white" : "border-slate-200 dark:border-white/10 hover:border-indigo-500/50 text-slate-900 dark:text-white"
        }`}
      >
        <span>{displayDate}</span>
        <CalendarDays size={16} className={`text-slate-400 transition-colors ${isOpen ? "text-indigo-500" : ""}`} />
      </div>

      {isOpen && (
        <div className="absolute z-[200] bottom-full mb-2 right-0 sm:-left-12 w-64 bg-white dark:bg-[#12121A] border border-slate-200 dark:border-white/10 rounded-2xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.5)] p-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          
          <div className="flex justify-between items-center mb-4">
            <button 
              type="button" 
              onClick={(e) => { e.preventDefault(); setViewDate(new Date(currentYear, currentMonth - 1, 1)); }}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {monthNames[currentMonth]} {currentYear}
            </div>
            <button 
              type="button" 
              onClick={(e) => { e.preventDefault(); setViewDate(new Date(currentYear, currentMonth + 1, 1)); }}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-[10px] font-bold text-slate-400 uppercase">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {days.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} />;
              const isSelected = day === Number(selD) && currentMonth === Number(selM) - 1 && currentYear === Number(selY);
              const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;
              
              return (
                <button
                  key={day}
                  type="button"
                  onClick={(e) => { e.preventDefault(); handleSelect(day); }}
                  className={`w-7 h-7 mx-auto rounded-full text-xs font-semibold flex items-center justify-center transition-all ${
                    isSelected ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30" 
                      : isToday ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
};


// ==========================================
// MAIN MODAL COMPONENT
// ==========================================
export default function ContraTransferModal({ accounts, onSuccess, currencySymbol, children }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [form, setForm] = useState({ 
    fromWallet: "", 
    toWallet: "", 
    amount: "",
    date: new Date().toISOString().split('T')[0] 
  });
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const handleAmountChange = (val: string) => {
    const rawValue = val.replace(/[^0-9.]/g, '');
    if (rawValue) {
      const parts = rawValue.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      setForm({ ...form, amount: parts.join('.') });
    } else {
      setForm({ ...form, amount: "" });
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (form.fromWallet === form.toWallet) { setErrorMsg("You cannot transfer money to the same wallet!"); return; }
    
    const amountNum = Number(form.amount.replace(/,/g, ''));
    if (amountNum <= 0) { setErrorMsg("Amount must be greater than zero."); return; }

    const fromAcc = accounts.find(a => a.id === form.fromWallet);
    const toAcc = accounts.find(a => a.id === form.toWallet);

    if (!fromAcc || !toAcc) { setErrorMsg("Please select both wallets."); return; }

    if (amountNum > Number(fromAcc.balance)) {
      setErrorMsg(`Insufficient funds! "${fromAcc.name}" only has ${currencySymbol}${Number(fromAcc.balance).toLocaleString()}. You cannot transfer ${currencySymbol}${amountNum.toLocaleString()}.`);
      return; 
    }

    setIsProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setErrorMsg("User session not found."); setIsProcessing(false); return; }

      // Combine selected date with current time for accurate sorting
      const now = new Date();
      const selectedDate = new Date(form.date);
      selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
      const finalDateIso = selectedDate.toISOString();

      const txs = [
        { user_id: user.id, account_id: fromAcc.id, title: `Transfer to ${toAcc.name}`, amount: amountNum, type: 'expense', category: 'Transfer', date: finalDateIso },
        { user_id: user.id, account_id: toAcc.id, title: `Transfer from ${fromAcc.name}`, amount: amountNum, type: 'income', category: 'Transfer', date: finalDateIso }
      ];

      await supabase.from('transactions').insert(txs);
      await supabase.from('accounts').update({ balance: Number(fromAcc.balance) - amountNum }).eq('id', fromAcc.id);
      await supabase.from('accounts').update({ balance: Number(toAcc.balance) + amountNum }).eq('id', toAcc.id);

      setIsOpen(false);
      setForm({ fromWallet: "", toWallet: "", amount: "", date: new Date().toISOString().split('T')[0] });
      onSuccess();
      window.dispatchEvent(new Event("transactionUpdated"));

    } catch (error: any) {
      console.error("Contra Error:", error);
      setErrorMsg(error.message || "Transfer failed due to a database error. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const closeModal = () => {
    if (isProcessing) return;
    setIsOpen(false);
    setForm({ fromWallet: "", toWallet: "", amount: "", date: new Date().toISOString().split('T')[0] });
    setErrorMsg(null);
  };

  const fromOptions = accounts.map(acc => ({ value: acc.id, label: `${acc.name} (Bal: ${Number(acc.balance).toLocaleString()})` }));
  const toOptions = accounts.map(acc => ({ value: acc.id, label: acc.name }));

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="inline-block w-full sm:w-auto">
        {children}
      </div>

      {mounted && isOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeModal} />
          <div className="relative bg-white dark:bg-[#0F0F15] rounded-[2.5rem] w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center mb-6 px-2">
              <h3 className="font-bold text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <ArrowLeftRight className="text-indigo-500" /> Contra Transfer
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-100 dark:bg-white/5 p-1.5 rounded-full">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleTransfer} className="space-y-4 px-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">From Wallet (Withdraw)</label>
                <CustomSelect options={fromOptions} value={form.fromWallet} onChange={(val) => setForm({...form, fromWallet: val})} placeholder="Select Source..." />
              </div>

              <div className="flex justify-center -my-2 relative z-10 pointer-events-none">
                <div className="bg-white dark:bg-[#0F0F15] p-1.5 rounded-full border border-slate-200 dark:border-white/10 shadow-sm">
                  <ArrowRight size={16} className="text-indigo-500 rotate-90" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">To Wallet (Deposit)</label>
                <CustomSelect options={toOptions} value={form.toWallet} onChange={(val) => setForm({...form, toWallet: val})} placeholder="Select Destination..." />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Transfer Amount</label>
                  <div className="flex items-center bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3.5 focus-within:ring-1 focus-within:ring-indigo-500 transition-shadow">
                    <span className="text-slate-400 font-bold mr-2">{currencySymbol}</span>
                    <input required type="text" inputMode="numeric" placeholder="0" value={form.amount} onChange={(e) => handleAmountChange(e.target.value)} className="w-full bg-transparent text-slate-900 dark:text-white outline-none font-bold text-base" />
                  </div>
                </div>

                {/* 🚀 FULLY CUSTOM DATE PICKER INJECTED HERE */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Transaction Date</label>
                  <CustomDatePicker 
                    value={form.date} 
                    onChange={(val) => setForm({...form, date: val})} 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isProcessing || !form.fromWallet || !form.toWallet || !form.amount}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-[0_8px_20px_-6px_rgba(99,102,241,0.6)] transition-all active:scale-95 mt-6 flex justify-center items-center gap-2 disabled:opacity-50 disabled:hover:bg-indigo-600 disabled:active:scale-100"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={20} /> : "Execute Transfer"}
              </button>
            </form>
          </div>
        </div>
      , document.body)}

      {/* THE ERROR MODAL */}
      {mounted && errorMsg && createPortal(
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setErrorMsg(null)} />
          <div className="relative z-10 w-full max-w-sm bg-white dark:bg-[#0A0A0E] border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 text-rose-500 border border-rose-200 dark:border-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-xl font-bold tracking-tight mb-2 text-slate-900 dark:text-white">Action Denied</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">{errorMsg}</p>
            <button onClick={() => setErrorMsg(null)} className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-900 dark:text-white font-bold py-3.5 rounded-xl transition-colors active:scale-95">Understood</button>
          </div>
        </div>
      , document.body)}
    </>
  );
}