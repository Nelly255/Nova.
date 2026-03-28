"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, LayoutDashboard, Target, PiggyBank, Settings, CreditCard, ShieldCheck } from "lucide-react";

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 🚀 UPGRADED: Listens for both the Keyboard AND the new Mobile Button
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleOpenEvent = () => setIsOpen(true);

    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleOpenEvent); // Mobile trigger listener

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleOpenEvent);
    };
  }, []);

  // Auto-focus the input when it opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery(""); // Clear old searches
    }
  }, [isOpen]);

  // Master list of commands
  const commands = [
    { name: "Go to Dashboard", icon: <LayoutDashboard size={18} />, route: "/dashboard", group: "Pages" },
    { name: "View Transactions", icon: <ArrowRight size={18} />, route: "/dashboard/transactions", group: "Pages" },
    { name: "Manage Budgets", icon: <Target size={18} />, route: "/dashboard/budgets", group: "Pages" },
    { name: "Check Subscriptions", icon: <ShieldCheck size={18} />, route: "/dashboard/subscriptions", group: "Pages" },
    { name: "Savings Goals", icon: <PiggyBank size={18} />, route: "/dashboard/savings", group: "Pages" },
    { name: "View Debts & Loans", icon: <CreditCard size={18} />, route: "/dashboard/debts", group: "Pages" },
    { name: "App Settings", icon: <Settings size={18} />, route: "/dashboard/settings", group: "System" },
  ];

  // Filter commands based on user typing
  const filteredCommands = commands.filter((cmd) =>
    cmd.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (route: string) => {
    setIsOpen(false);
    router.push(route);
  };

  if (!isOpen) return null;

  return (
    <div className="relative z-[10005]">
      {/* Invisible Background Overlay */}
      <div 
        className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => setIsOpen(false)}
      />

      {/* The Palette Modal */}
      <div className="fixed left-1/2 top-[15%] w-[90%] max-w-2xl -translate-x-1/2 bg-white/90 dark:bg-[#11111a]/95 backdrop-blur-3xl border border-white/50 dark:border-white/10 rounded-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        
        {/* Search Input Area */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200/50 dark:border-white/5">
          <Search size={22} className="text-slate-400 dark:text-slate-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-lg font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold tracking-widest text-slate-400 bg-slate-100 dark:bg-white/5 rounded-md border border-slate-200 dark:border-white/10">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No results found for "{query}"</div>
          ) : (
            <div className="space-y-1">
              {filteredCommands.map((cmd, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(cmd.route)}
                  className="w-full flex items-center gap-4 px-4 py-3 text-left rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
                >
                  <div className="text-slate-400 group-hover:text-indigo-500 transition-colors">
                    {cmd.icon}
                  </div>
                  <span className="font-medium text-slate-900 dark:text-slate-200">{cmd.name}</span>
                  <span className="ml-auto text-xs font-semibold text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    Jump to
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex justify-between items-center text-xs text-slate-500">
          <span>Search Nova Vault</span>
          <span className="font-semibold text-indigo-500">Pro Feature</span>
        </div>
      </div>
    </div>
  );
}