"use client";

import Link from "next/link";
import { LineChart, Building, Calculator, ArrowRight, Wrench } from "lucide-react";

export default function ToolsHubPage() {
  return (
    <div className="p-6 md:p-10 pb-32 max-w-6xl mx-auto space-y-6 md:space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Wrench className="text-indigo-600 dark:text-indigo-400" size={28} />
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
          className="group bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-white/5 p-8 rounded-[2rem] hover:shadow-2xl dark:hover:bg-slate-800/50 transition-all duration-300 hover:border-purple-500/30 overflow-hidden relative flex flex-col h-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-black/50"
        >
          {/* Subtle glow background */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/5 dark:bg-purple-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-purple-500/15 transition-colors"></div>
          
          <div className="w-14 h-14 bg-purple-50 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-100 dark:border-purple-500/20 mb-6 text-purple-600 dark:text-purple-400 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 shadow-sm">
            <LineChart size={24} />
          </div>
          
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
            Net Worth Calculator
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-grow mb-6">
            Calculate your gross assets against your total liabilities to find your exact wealth standing.
          </p>
          
          <div className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mt-auto">
            Launch Tool <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Tool 2: Depreciation Calculator */}
        <Link 
          href="/dashboard/depreciation-calculator" 
          className="group bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-white/5 p-8 rounded-[2rem] hover:shadow-2xl dark:hover:bg-slate-800/50 transition-all duration-300 hover:border-emerald-500/30 overflow-hidden relative flex flex-col h-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-black/50"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/5 dark:bg-emerald-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-emerald-500/15 transition-colors"></div>
          
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20 mb-6 text-emerald-600 dark:text-emerald-400 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 shadow-sm">
            <Building size={24} />
          </div>
          
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
            TRA Asset Depreciation
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-grow mb-6">
            Calculate capital allowance and reducing balances according to tax law to understand true asset values.
          </p>
          
          <div className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mt-auto">
            Launch Tool <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Tool 3: Budget Calculator */}
        <Link 
          href="/dashboard/budget-calculator" 
          className="group bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-white/5 p-8 rounded-[2rem] hover:shadow-2xl dark:hover:bg-slate-800/50 transition-all duration-300 hover:border-sky-500/30 overflow-hidden relative flex flex-col h-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-black/50"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-sky-500/5 dark:bg-sky-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-sky-500/15 transition-colors"></div>
          
          <div className="w-14 h-14 bg-sky-50 dark:bg-sky-500/10 rounded-2xl flex items-center justify-center border border-sky-100 dark:border-sky-500/20 mb-6 text-sky-600 dark:text-sky-400 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 shadow-sm">
            <Calculator size={24} />
          </div>
          
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
            Zero-Based Budget
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-grow mb-6">
            Input your monthly salary to generate a strict, optimized 50/30/20 spending plan for ultimate financial independence.
          </p>
          
          <div className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors mt-auto">
            Launch Tool <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

      </div>
    </div>
  );
}