"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, AlertCircle, Calendar } from "lucide-react";

export default function DashboardDebtPayoffCalculator() {
  // CALCULATOR STATE
  const [loanBalance, setLoanBalance] = useState<number>(5000000);
  const [interestRate, setInterestRate] = useState<number>(18); // 18% annual
  const [monthlyPayment, setMonthlyPayment] = useState<number>(200000);

  // AMORTIZATION MATH LOGIC
  const calculatePayoff = () => {
    const p = loanBalance;
    const r = (interestRate / 100) / 12; // monthly interest rate
    const a = monthlyPayment;

    if (p <= 0 || a <= 0) return { months: 0, totalPaid: 0, totalInterest: 0, isPossible: true };

    // Catch the trap: Payment is smaller than the monthly interest generated
    if (a <= p * r) {
      return { months: -1, totalPaid: 0, totalInterest: 0, isPossible: false };
    }

    let balance = p;
    let totalInterest = 0;
    let monthCount = 0;
    
    while (balance > 0 && monthCount < 1200) { // safety cap at 100 years
      const interest = balance * r;
      totalInterest += interest;
      const principalPayment = a - interest;
      
      if (balance < principalPayment) {
        balance = 0;
      } else {
        balance -= principalPayment;
      }
      monthCount++;
    }

    return { 
      months: monthCount, 
      totalPaid: p + totalInterest, 
      totalInterest, 
      isPossible: monthCount < 1200 
    };
  };

  const { months, totalPaid, totalInterest, isPossible } = calculatePayoff();

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Convert months to Years/Months string
  const formatTime = (totalMonths: number) => {
    if (!isPossible) return "Never";
    const y = Math.floor(totalMonths / 12);
    const m = totalMonths % 12;
    if (y === 0) return `${m} Months`;
    if (m === 0) return `${y} Years`;
    return `${y} Yrs, ${m} Mos`;
  };

  return (
    <div className="w-full bg-transparent text-slate-900 dark:text-slate-50 relative overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      
      {/* 🚀 SCHEMA MARKUP */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Nova Debt Payoff Calculator",
            "operatingSystem": "Web, iOS, Android",
            "applicationCategory": "FinanceApplication",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "TZS"
            },
            "description": "Calculate exactly when you will be debt-free and see how much interest you can save by increasing your monthly payments."
          })
        }}
      />

      {/* AMBIENT GLOW */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-brand-500/10 dark:bg-brand-500/15 rounded-full blur-[120px] pointer-events-none opacity-80 z-0"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-[120px] pointer-events-none opacity-60 z-0"></div>

      <div className="relative z-10 p-4 sm:p-6 md:p-10 lg:p-12">
        
        {/* HERO SECTION */}
        <header className="max-w-6xl mx-auto mb-12 md:mb-16 grid lg:grid-cols-2 gap-8 md:gap-10 items-end">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#12121A] border border-slate-200 dark:border-white/5 shadow-sm">
              <div className=""></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">DEBT ELIMINATION</span>
            </div>
            
            <h1 className="flex flex-col">
              <span style={{ fontFamily: "'Dancing Script', cursive" }} className="text-[4rem] sm:text-5xl md:text-[5.5rem] font-bold text-slate-800 dark:text-slate-200 leading-[0.8] mb-2 pl-1">
                Destroy your
              </span>
              <span className="text-[3.5rem] sm:text-5xl md:text-[6.5rem] font-[900] tracking-[-0.04em] text-brand-500 leading-[0.85] mt-1 md:mt-0">
                Debt.
              </span>
            </h1>
          </div>
          
          <div className="lg:pl-10 lg:border-l-2 border-slate-200 dark:border-white/10">
            <p className="text-lg sm:text-xl md:text-2xl font-medium text-slate-500 dark:text-slate-400 leading-tight mb-4">
              Find out exactly when <br />
              <span className="text-slate-900 dark:text-white font-bold">You will be Free.</span>
            </p>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 leading-relaxed max-w-md">
              Banks want to keep you paying minimums forever. Use this tool to calculate your exact payoff date and see how much interest you can save by paying a little extra.
            </p>
          </div>
        </header>

        {/* CALCULATOR INTERFACE */}
        <section className="max-w-6xl mx-auto pb-12">
          <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
            
            {/* INPUT CONTROLS */}
            <div className="group bg-white dark:bg-[#0F0F15]/80 p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-slate-100 dark:border-white/5 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-transform duration-300 space-y-8">
              
              <div>
                <label className="flex justify-between text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  <span>Total Loan Balance</span>
                  <span className="text-brand-500">{formatMoney(loanBalance)}</span>
                </label>
                <input 
                  type="range" min="100000" max="50000000" step="100000"
                  value={loanBalance}
                  onChange={(e) => setLoanBalance(Number(e.target.value))}
                  className="w-full accent-brand-500"
                />
              </div>

              <div>
                <label className="flex justify-between text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  <span>Interest Rate (Annual)</span>
                  <span className="text-brand-500">{interestRate}%</span>
                </label>
                <input 
                  type="range" min="1" max="40" step="0.5"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full accent-brand-500"
                />
              </div>

              <div>
                <label className="flex justify-between text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  <span>Your Monthly Payment</span>
                  <span className="text-brand-500">{formatMoney(monthlyPayment)}</span>
                </label>
                <input 
                  type="range" min="10000" max="5000000" step="10000"
                  value={monthlyPayment}
                  onChange={(e) => setMonthlyPayment(Number(e.target.value))}
                  className="w-full accent-brand-500"
                />
              </div>

              {/* Semantic Error - Kept Rose intentionally */}
              {!isPossible && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex gap-3 text-rose-600 dark:text-rose-400">
                  <AlertCircle size={20} className="shrink-0" />
                  <p className="text-sm font-bold">Your payment is too low. It doesn't even cover the monthly interest. You will be in debt forever at this rate.</p>
                </div>
              )}

            </div>

            {/* RESULTS PANEL */}
            <div className="group bg-brand-500/5 dark:bg-brand-500/10 p-8 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-brand-500/20 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-center">
              <div className="w-14 h-14 rounded-2xl bg-brand-500/20 flex items-center justify-center text-brand-500 mb-6">
                <Calendar size={24} />
              </div>
              
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold tracking-widest uppercase mb-2">Time to Debt-Free</p>
              <h3 className={`text-4xl md:text-5xl font-black tracking-tight mb-8 ${!isPossible ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                {formatTime(months)}
              </h3>
              
              <div className="h-px w-full bg-brand-500/20 mb-8"></div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Interest Trapped</p>
                  {/* Semantic Warning - Kept Rose intentionally because interest paid is lost money */}
                  <p className="font-bold text-lg text-rose-500">{isPossible ? formatMoney(totalInterest) : "∞"}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Paid</p>
                  <p className="font-bold text-lg text-slate-900 dark:text-white">{isPossible ? formatMoney(totalPaid) : "∞"}</p>
                </div>
              </div>

              <Link href="/dashboard" className="mt-10 inline-flex items-center justify-center gap-3 w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold shadow-[0_8px_20px_rgb(var(--brand-500)/0.3)] transition-all active:scale-95">
                Build a Payoff Plan <ArrowRight size={18} />
              </Link>
            </div>

          </div>
        </section>

      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Inter:wght@400;700;900&display=swap');
      `}</style>
    </div>
  );
}