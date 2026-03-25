"use client";

import { useEffect, useState } from "react";
import { MonitorSmartphone } from "lucide-react";

export default function SingleTabEnforcer() {
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    // 1. When this tab loads, claim it as the active one
    const claimTab = () => {
      localStorage.setItem("nova_active_tab", Date.now().toString());
      setIsLocked(false);
    };

    claimTab();

    // 2. Listen to see if any OTHER tab tries to claim it
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "nova_active_tab") {
        // Another tab just updated the timestamp! Lock this tab.
        setIsLocked(true);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // If we are the active tab, render nothing (stay invisible)
  if (!isLocked) return null;

  // If another tab took over, render the gorgeous lock screen!
  return (
    <div className="fixed inset-0 z-[99999] bg-slate-900/40 dark:bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/50 dark:border-white/10 p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-200 dark:border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
          <MonitorSmartphone size={28} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Opened elsewhere</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
          To prevent duplicate entries and keep your vault strictly synced, Nova can only be used in one tab at a time.
        </p>
        <button 
          onClick={() => {
            // Take the session back!
            localStorage.setItem("nova_active_tab", Date.now().toString());
            setIsLocked(false);
          }}
          className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold py-3.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-slate-900/20 dark:shadow-white/20"
        >
          Use Here Instead
        </button>
      </div>
    </div>
  );
}