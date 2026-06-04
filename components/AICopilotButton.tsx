"use client";

import { useState } from "react";
import { Wand2, X, Bot, ChevronRight, Lock } from "lucide-react"; // Swapped Sparkles for Wand2
import { Plus_Jakarta_Sans } from "next/font/google";

const headerFont = Plus_Jakarta_Sans({ subsets: ["latin"] });

export default function AICopilotButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [joined, setJoined] = useState(false);

  const handleJoinWaitlist = () => {
    setJoined(true);
    setTimeout(() => {
      setIsOpen(false);
      setJoined(false);
    }, 3000);
  };

  return (
    <>
      {/* 🚀 RESPONSIVE MINIMALIST FAB */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-28 md:bottom-6 right-4 md:right-6 z-40 flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_8px_30px_rgb(0,0,0,0.15)] dark:shadow-[0_8px_30px_rgba(99,102,241,0.3)] hover:scale-110 hover:-translate-y-1 transition-all duration-300 active:scale-95"
        aria-label="Open AI Assistant"
      >
        {/* Changed to Wand2 for a premium AI feel */}
        <Wand2 className="w-5 h-5 md:w-6 md:h-6 fill-current" />
      </button>

      {/* 🚀 COMPACT PREMIUM GLASS MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          
          {/* Backdrop Blur */}
          <div 
            className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Modal Content - Resized to max-w-[340px] for a tighter mobile fit */}
          <div className="relative w-full max-w-[340px] bg-white dark:bg-[#0F0F15] border border-slate-200 dark:border-white/10 p-6 sm:p-7 rounded-[1.75rem] shadow-2xl overflow-hidden transform transition-all animate-in zoom-in-95 slide-in-from-bottom-8">
            
            {/* Ambient Background Glow (Scaled down) */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/20 dark:bg-indigo-500/30 blur-3xl rounded-full pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 dark:bg-purple-500/30 blur-3xl rounded-full pointer-events-none"></div>

            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors bg-slate-100 dark:bg-white/5 p-1.5 rounded-full active:scale-90 z-10"
            >
              <X size={16} />
            </button>

            <div className="relative z-10 flex flex-col items-center text-center mt-2">
              {/* Reduced icon container size */}
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-500/20 dark:to-purple-500/20 rounded-[1rem] flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30 mb-4 text-indigo-600 dark:text-indigo-400 shadow-inner">
                <Bot size={28} />
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-3">
                <Lock size={10} /> Closed Beta
              </div>

              {/* Reduced heading size */}
              <h2 className={`${headerFont.className} text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight`}>
                Nova AI Copilot
              </h2>
              
              {/* Reduced text size and padding */}
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6 px-1">
                Your intelligent wealth manager is training. Get actionable advice on your budget, TRA taxes, and asset strategy based on real-time data.
              </p>

              {/* Thinner button */}
              <button 
                onClick={handleJoinWaitlist}
                disabled={joined}
                className="w-full relative overflow-hidden bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-100 disabled:bg-emerald-500 disabled:text-white disabled:active:scale-100 group shadow-lg"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 dark:via-black/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                
                {joined ? (
                  <span className="flex items-center gap-2 relative z-10">You're on the list! <Wand2 size={14} /></span>
                ) : (
                  <span className="flex items-center gap-2 relative z-10">Request Early Access <ChevronRight size={14} /></span>
                )}
              </button>

              <p className="mt-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                Priority access for Nova Pro
              </p>
            </div>

          </div>
        </div>
      )}
    </>
  );
}