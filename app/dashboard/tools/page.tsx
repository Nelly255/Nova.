"use client";

import Link from "next/link";
import { LineChart, Building, Calculator, ArrowRight, Wrench, Car, TrendingUp, Shield, TrendingDown, Wallet, Target, Receipt } from "lucide-react";

export default function ToolsHubPage() {
  return (
    <div className="p-6 md:p-10 pb-32 max-w-6xl mx-auto space-y-6 md:space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Wrench className="text-brand-600 dark:text-brand-400" size={28} />
          Financial Tools
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm md:text-base">
          Powerful, zero-friction calculators to help you plan your wealth and stay compliant.
        </p>
      </header>

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Tool 1: Net Worth Calculator */}
        <Link 
          href="/dashboard/net-worth-calculator" 
          className="group bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-white/5 p-8 rounded-[2rem] hover:shadow-2xl dark:hover:bg-slate-800/50 transition-all duration-300 hover:border-brand-500/30 overflow-hidden relative flex flex-col h-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-black/50"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-500/5 dark:bg-brand-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-brand-500/15 transition-colors"></div>
          
          <div className="w-14 h-14 bg-brand-50 dark:bg-brand-500/10 rounded-2xl flex items-center justify-center border border-brand-100 dark:border-brand-500/20 mb-6 text-brand-600 dark:text-brand-400 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 shadow-sm">
            <LineChart size={24} />
          </div>
          
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
            Net Worth Calculator
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-grow mb-6">
            Calculate your gross assets against your total liabilities to find your exact wealth standing.
          </p>
          
          <div className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mt-auto">
            Launch Tool <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Tool 2: Depreciation Calculator */}
        <Link 
          href="/dashboard/depreciation-calculator" 
          className="group bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-white/5 p-8 rounded-[2rem] hover:shadow-2xl dark:hover:bg-slate-800/50 transition-all duration-300 hover:border-brand-500/30 overflow-hidden relative flex flex-col h-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-black/50"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-500/5 dark:bg-brand-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-brand-500/15 transition-colors"></div>
          
          <div className="w-14 h-14 bg-brand-50 dark:bg-brand-500/10 rounded-2xl flex items-center justify-center border border-brand-100 dark:border-brand-500/20 mb-6 text-brand-600 dark:text-brand-400 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 shadow-sm">
            <Building size={24} />
          </div>
          
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
            TRA Asset Depreciation
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-grow mb-6">
            Calculate capital allowance and reducing balances according to tax law to understand true asset values.
          </p>
          
          <div className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mt-auto">
            Launch Tool <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Tool 3: Budget Calculator */}
        <Link 
          href="/dashboard/budget-calculator" 
          className="group bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-white/5 p-8 rounded-[2rem] hover:shadow-2xl dark:hover:bg-slate-800/50 transition-all duration-300 hover:border-brand-500/30 overflow-hidden relative flex flex-col h-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-black/50"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-500/5 dark:bg-brand-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-brand-500/15 transition-colors"></div>
          
          <div className="w-14 h-14 bg-brand-50 dark:bg-brand-500/10 rounded-2xl flex items-center justify-center border border-brand-100 dark:border-brand-500/20 mb-6 text-brand-600 dark:text-brand-400 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 shadow-sm">
            <Calculator size={24} />
          </div>
          
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
            Zero-Based Budget
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-grow mb-6">
            Input your monthly salary to generate a strict, optimized 50/30/20 spending plan for ultimate financial independence.
          </p>
          
          <div className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mt-auto">
            Launch Tool <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Tool 4: TRA Import Calculator */}
        <Link 
          href="/dashboard/tra-car-import-duty-calculator-tanzania" 
          className="group bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-white/5 p-8 rounded-[2rem] hover:shadow-2xl dark:hover:bg-slate-800/50 transition-all duration-300 hover:border-brand-500/30 overflow-hidden relative flex flex-col h-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-black/50"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-500/5 dark:bg-brand-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-brand-500/15 transition-colors"></div>
          
          <div className="w-14 h-14 bg-brand-50 dark:bg-brand-500/10 rounded-2xl flex items-center justify-center border border-brand-100 dark:border-brand-500/20 mb-6 text-brand-600 dark:text-brand-400 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 shadow-sm">
            <Car size={24} />
          </div>
          
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
            TRA Import Duty
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-grow mb-6">
            Estimate exact import duties, excise taxes, and VAT for vehicles based on TRA formulas.
          </p>
          
          <div className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mt-auto">
            Launch Tool <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Tool 5: Compound Interest Calculator */}
        <Link 
          href="/dashboard/compound-interest-calculator" 
          className="group bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-white/5 p-8 rounded-[2rem] hover:shadow-2xl dark:hover:bg-slate-800/50 transition-all duration-300 hover:border-brand-500/30 overflow-hidden relative flex flex-col h-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-black/50"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-500/5 dark:bg-brand-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-brand-500/15 transition-colors"></div>
          
          <div className="w-14 h-14 bg-brand-50 dark:bg-brand-500/10 rounded-2xl flex items-center justify-center border border-brand-100 dark:border-brand-500/20 mb-6 text-brand-600 dark:text-brand-400 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 shadow-sm">
            <TrendingUp size={24} />
          </div>
          
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
            Compound Interest
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-grow mb-6">
            Project your investment growth over time with the power of compounding interest.
          </p>
          
          <div className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mt-auto">
            Launch Tool <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Tool 6: Emergency Fund Calculator */}
        <Link 
          href="/dashboard/emergency-fund-calculator" 
          className="group bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-white/5 p-8 rounded-[2rem] hover:shadow-2xl dark:hover:bg-slate-800/50 transition-all duration-300 hover:border-brand-500/30 overflow-hidden relative flex flex-col h-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-black/50"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-500/5 dark:bg-brand-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-brand-500/15 transition-colors"></div>
          
          <div className="w-14 h-14 bg-brand-50 dark:bg-brand-500/10 rounded-2xl flex items-center justify-center border border-brand-100 dark:border-brand-500/20 mb-6 text-brand-600 dark:text-brand-400 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 shadow-sm">
            <Shield size={24} />
          </div>
          
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
            Emergency Fund
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-grow mb-6">
            Determine exactly how much cash you need to safely weather financial storms and unexpected life events.
          </p>
          
          <div className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mt-auto">
            Launch Tool <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Tool 7: Debt Payoff Calculator */}
        <Link 
          href="/dashboard/debt-payoff-calculator" 
          className="group bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-white/5 p-8 rounded-[2rem] hover:shadow-2xl dark:hover:bg-slate-800/50 transition-all duration-300 hover:border-brand-500/30 overflow-hidden relative flex flex-col h-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-black/50"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-500/5 dark:bg-brand-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-brand-500/15 transition-colors"></div>
          
          <div className="w-14 h-14 bg-brand-50 dark:bg-brand-500/10 rounded-2xl flex items-center justify-center border border-brand-100 dark:border-brand-500/20 mb-6 text-brand-600 dark:text-brand-400 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 shadow-sm">
            <TrendingDown size={24} />
          </div>
          
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
            Debt Payoff Strategy
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-grow mb-6">
            Strategize the fastest way to become completely debt-free and calculate total interest lost.
          </p>
          
          <div className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mt-auto">
            Launch Tool <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Tool 8: PAYE Take-Home Calculator */}
        <Link 
          href="/dashboard/paye-calculator" 
          className="group bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-white/5 p-8 rounded-[2rem] hover:shadow-2xl dark:hover:bg-slate-800/50 transition-all duration-300 hover:border-brand-500/30 overflow-hidden relative flex flex-col h-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-black/50"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-500/5 dark:bg-brand-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-brand-500/15 transition-colors"></div>
          
          <div className="w-14 h-14 bg-brand-50 dark:bg-brand-500/10 rounded-2xl flex items-center justify-center border border-brand-100 dark:border-brand-500/20 mb-6 text-brand-600 dark:text-brand-400 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 shadow-sm">
            <Wallet size={24} />
          </div>
          
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
            PAYE Calculator
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-grow mb-6">
            Calculate your exact take-home pay after standard TRA deductions and NSSF contributions.
          </p>
          
          <div className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mt-auto">
            Launch Tool <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Tool 9: Reverse Gross Salary Calculator */}
        <Link 
          href="/dashboard/gross-salary-calculator" 
          className="group bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-white/5 p-8 rounded-[2rem] hover:shadow-2xl dark:hover:bg-slate-800/50 transition-all duration-300 hover:border-brand-500/30 overflow-hidden relative flex flex-col h-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-black/50"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-500/5 dark:bg-brand-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-brand-500/15 transition-colors"></div>
          
          <div className="w-14 h-14 bg-brand-50 dark:bg-brand-500/10 rounded-2xl flex items-center justify-center border border-brand-100 dark:border-brand-500/20 mb-6 text-brand-600 dark:text-brand-400 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 shadow-sm">
            <Target size={24} />
          </div>
          
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
            Gross Salary Target
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-grow mb-6">
            Reverse-engineer your dream net salary to find the exact gross amount you need to negotiate for.
          </p>
          
          <div className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mt-auto">
            Launch Tool <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* 🚀 Tool 10: Freelance Invoice Calculator */}
        <Link 
          href="/dashboard/freelance-invoice-calculator" 
          className="group bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-white/5 p-8 rounded-[2rem] hover:shadow-2xl dark:hover:bg-slate-800/50 transition-all duration-300 hover:border-brand-500/30 overflow-hidden relative flex flex-col h-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-black/50"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-500/5 dark:bg-brand-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-brand-500/15 transition-colors"></div>
          
          <div className="w-14 h-14 bg-brand-50 dark:bg-brand-500/10 rounded-2xl flex items-center justify-center border border-brand-100 dark:border-brand-500/20 mb-6 text-brand-600 dark:text-brand-400 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 shadow-sm">
            <Receipt size={24} />
          </div>
          
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
            Invoice Strategy
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-grow mb-6">
            Reverse-engineer your freelance invoice. Calculate exact Gross amounts to cover WHT and VAT.
          </p>
          
          <div className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mt-auto">
            Launch Tool <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

      </div>
    </div>
  );
}