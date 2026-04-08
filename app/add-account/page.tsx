"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; 
import { ArrowLeft, Smartphone, Landmark, Wallet, PlusCircle, Activity } from "lucide-react";

export default function AddAccountPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [accountType, setAccountType] = useState<"mobile_money" | "bank" | "cash">("mobile_money");
  const [provider, setProvider] = useState("m-pesa");
  const [accountName, setAccountName] = useState("");
  const [balance, setBalance] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Get current logged-in user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert("You must be logged in to add an account.");
        return;
      }

      // 2. Insert into Supabase
      const { error } = await supabase
        .from('accounts')
        .insert([
          { 
            user_id: user.id,
            name: accountName,
            provider: provider,
            type: accountType,
            balance: parseFloat(balance.replace(/,/g, '')), // Strips commas if user types "1,000,000"
            currency: 'TZS'
          }
        ]);

      if (error) throw error;

      // 3. Success! Redirect back to dashboard
      router.push('/dashboard');
      
    } catch (error: any) {
      console.error("Error adding account:", error.message);
      alert("Failed to add account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#07070A] text-slate-900 dark:text-slate-50 relative overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      
      {/* AMBIENT GLOW */}
      <div className="absolute top-[-10%] left-[50%] translate-x-[-50%] w-[600px] h-[600px] bg-[#8438FF]/10 dark:bg-[#8438FF]/15 rounded-full blur-[120px] pointer-events-none opacity-80 z-0"></div>

      <div className="relative z-10 pt-6 md:pt-12 px-4 sm:px-6 flex flex-col min-h-screen max-w-2xl mx-auto">
        
        {/* TOP NAV */}
        <nav className="w-full mb-8 flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all font-semibold active:scale-95 text-sm md:text-base">
            <ArrowLeft size={18} /> Back to Dashboard
          </Link>
        </nav>

        {/* HEADER */}
        <header className="mb-10 text-center">
          <div className="w-16 h-16 bg-[#8438FF]/10 text-[#8438FF] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Wallet size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            Add New Wallet
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Track your exact balances across M-Pesa, banks, and cash.</p>
        </header>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#0F0F15]/80 p-8 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-3xl flex flex-col gap-8">
          
          {/* STEP 1: ACCOUNT TYPE */}
          <div>
            <label className="text-sm font-bold text-slate-900 dark:text-white mb-4 block">1. Account Type</label>
            <div className="grid grid-cols-3 gap-3">
              <button type="button" onClick={() => { setAccountType("mobile_money"); setProvider("m-pesa"); }} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${accountType === 'mobile_money' ? 'bg-[#8438FF]/10 border-[#8438FF] text-[#8438FF]' : 'bg-slate-50 dark:bg-[#12121A] border-slate-200 dark:border-white/5 text-slate-500 hover:border-slate-300 dark:hover:border-white/20'}`}>
                <Smartphone size={24} />
                <span className="text-xs font-bold">Mobile Money</span>
              </button>
              <button type="button" onClick={() => { setAccountType("bank"); setProvider("crdb"); }} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${accountType === 'bank' ? 'bg-[#10B981]/10 border-[#10B981] text-[#10B981]' : 'bg-slate-50 dark:bg-[#12121A] border-slate-200 dark:border-white/5 text-slate-500 hover:border-slate-300 dark:hover:border-white/20'}`}>
                <Landmark size={24} />
                <span className="text-xs font-bold">Bank</span>
              </button>
              <button type="button" onClick={() => { setAccountType("cash"); setProvider("cash"); }} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${accountType === 'cash' ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-slate-50 dark:bg-[#12121A] border-slate-200 dark:border-white/5 text-slate-500 hover:border-slate-300 dark:hover:border-white/20'}`}>
                <Wallet size={24} />
                <span className="text-xs font-bold">Cash</span>
              </button>
            </div>
          </div>

          {/* STEP 2: PROVIDER */}
          {accountType !== 'cash' && (
            <div>
              <label className="text-sm font-bold text-slate-900 dark:text-white mb-4 block">2. Select Provider</label>
              <select value={provider} onChange={(e) => setProvider(e.target.value)} className="w-full bg-slate-50 dark:bg-[#12121A] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8438FF]/50 transition-all font-medium appearance-none">
                {accountType === 'mobile_money' ? (
                  <>
                    <option value="m-pesa">Vodacom M-Pesa</option>
                    <option value="tigo-pesa">Tigo Pesa</option>
                    <option value="airtel-money">Airtel Money</option>
                    <option value="halopesa">HaloPesa</option>
                  </>
                ) : (
                  <>
                    <option value="crdb">CRDB Bank</option>
                    <option value="nmb">NMB Bank</option>
                    <option value="stanbic">Stanbic Bank</option>
                    <option value="equity">Equity Bank</option>
                  </>
                )}
              </select>
            </div>
          )}

          {/* STEP 3: DETAILS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="accountName" className="text-sm font-bold text-slate-900 dark:text-white">Account Name</label>
              <input type="text" id="accountName" value={accountName} onChange={(e) => setAccountName(e.target.value)} required placeholder={accountType === 'mobile_money' ? "e.g. Main M-Pesa" : "e.g. Salary Account"} className="bg-slate-50 dark:bg-[#12121A] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8438FF]/50 transition-all font-medium" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="balance" className="text-sm font-bold text-slate-900 dark:text-white">Current Balance (TZS)</label>
              <input type="text" id="balance" value={balance} onChange={(e) => setBalance(e.target.value)} required placeholder="0.00" className="bg-slate-50 dark:bg-[#12121A] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8438FF]/50 transition-all font-medium" />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="inline-flex items-center justify-center gap-2 w-full py-4 bg-[#8438FF] hover:bg-[#7328F5] disabled:opacity-50 text-white rounded-2xl font-bold text-base shadow-[0_8px_20px_rgba(132,56,255,0.3)] transition-all duration-300 active:scale-95 mt-4">
            {isLoading ? "Saving..." : "Add Wallet"} <PlusCircle size={18} />
          </button>
        </form>

      </div>
    </div>
  );
}