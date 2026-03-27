"use client";

import { useState } from "react";
import { HelpCircle, X, ShieldCheck, Target, TrendingDown, BarChart3, Settings } from "lucide-react";

export default function HelpModal() {
  const [isOpen, setIsOpen] = useState(false);

  // The content for our Help Center
  const faqs = [
    {
      icon: <ShieldCheck size={20} />,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-100/50 dark:bg-indigo-500/10",
      title: "What is 'Safe to Spend'?",
      desc: "This is your total Income minus all your Expenses. It tells you exactly how much liquid cash you have available right now without breaking your budget."
    },
    {
      icon: <Target size={20} />,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100/50 dark:bg-emerald-500/10",
      title: "How do Savings Goals work?",
      desc: "When you deposit money into a Savings Goal, the app automatically logs it as an 'Expense'. This safely removes it from your 'Safe to Spend' pool so you don't accidentally spend it!"
    },
    {
      icon: <TrendingDown size={20} />,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-100/50 dark:bg-rose-500/10",
      title: "How does Asset Depreciation work?",
      desc: "We use the Tanzania Revenue Authority (TRA) Reducing Balance method. It accurately calculates your asset's real-time Net Book Value based on the exact month you bought it."
    },
    {
      icon: <BarChart3 size={20} />,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100/50 dark:bg-purple-500/10",
      title: "What is the 5-Year Projection?",
      desc: "The chart on the Assets page forecasts your future tax write-offs. It shows exactly how much value (depreciation expense) you will lose each year for the next 5 years."
    },
    {
      icon: <Settings size={20} />,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100/50 dark:bg-amber-500/10",
      title: "Currency & Theme",
      desc: "You can easily switch between TZS and USD, or toggle Dark/Light mode in the Settings tab."
    }
  ];

  return (
    <div className="relative">
      
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-500 hover:text-brand dark:text-slate-400 dark:hover:text-brand transition-colors p-2 relative z-50 rounded-full hover:bg-slate-100 dark:hover:bg-white/5"
        title="Help & Guides"
      >
        <HelpCircle size={20} />
      </button>

      {isOpen && (
        <>
          {/* Invisible Blur Overlay */}
          <div 
            className="fixed inset-0 z-[9998] bg-slate-900/10 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />

          {/* PATCHED: The Glass Popover Modal (Titan-Tier Z-Index) */}
          <div className="fixed left-4 right-4 top-24 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 z-[10000] sm:w-96 bg-white/80 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/50 dark:border-white/10 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in zoom-in-95 origin-top sm:origin-top-right duration-200 flex flex-col max-h-[80vh] sm:max-h-[75vh]">
            
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-200/50 dark:border-white/5 transition-colors shrink-0">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 transition-colors">Help Center</h3>
                <p className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 mt-0.5">QUICK GUIDE</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/5">
                <X size={20} />
              </button>
            </div>

            {/* Scrollable FAQ List */}
            <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white/60 dark:bg-white/5 border border-white/40 dark:border-white/5 rounded-2xl p-4 backdrop-blur-sm transition-colors group hover:bg-white/80 dark:hover:bg-white/10 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${faq.bg} ${faq.color} transition-colors border border-white/50 dark:border-transparent shadow-sm`}>
                      {faq.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-200 mb-1 transition-colors">{faq.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed transition-colors">{faq.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </>
      )}
    </div>
  );
}