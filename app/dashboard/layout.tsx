"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react"; 
import { supabase } from "@/lib/supabase"; 
import { LayoutDashboard, ArrowRightLeft, Target, ShieldCheck, Settings, PiggyBank, Briefcase, Menu, ChevronLeft, CreditCard, Activity, LogOut, Download, Search, Coffee, Wallet } from "lucide-react"; 
import UserProfile from "@/components/UserProfile"; 
import AuthGuard from "@/components/AuthGuard";
import QuickTourModal from "@/components/QuickTourModal"; 
import SingleTabEnforcer from "@/components/SingleTabEnforcer"; 
// 🚀 INJECTED: The Command Palette Import
import CommandPalette from "@/components/CommandPalette";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); 
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // PWA Install State
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('app_theme');
    if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [pathname]); 

  // PWA Registration & Install Listener
  useEffect(() => {
    // 1. Register the Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => console.error('SW Failed', err));
    }

    // 2. Listen for the native browser install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null); // Hide button once installed!
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/"; 
  };

  return (
    <AuthGuard>
      <SingleTabEnforcer />
      <QuickTourModal /> 
      <CommandPalette />
      
      <div className="flex h-[100dvh] bg-transparent text-slate-900 dark:text-slate-50 font-sans overflow-hidden transition-colors duration-300 relative">
        
        {/* Universal Hidden Scrollbar Styling */}
        <style dangerouslySetInnerHTML={{__html: `
          .nuke-scrollbar::-webkit-scrollbar { display: none !important; }
          .nuke-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
        `}} />

        {/* 💻 DESKTOP SIDEBAR - 🚀 PATCHED: w-56 changed to w-64 */}
        <aside className={`border-r border-white/60 dark:border-white/5 bg-white/40 dark:bg-[#0A0A0E]/60 backdrop-blur-[40px] hidden md:flex flex-col h-full relative z-20 transition-all duration-500 ease-in-out shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-none ${isCollapsed ? 'w-20 px-3 py-6' : 'w-64 p-5'}`}>
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-4 top-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white dark:border-white/10 rounded-full p-2 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 z-50 group hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <Menu size={16} className="text-slate-600 dark:text-slate-300 group-hover:text-indigo-500" /> : <ChevronLeft size={16} className="text-slate-600 dark:text-slate-300 group-hover:text-indigo-500" />}
          </button>

          {/* 1. Fixed Top Section (Logo) */}
          <div className={`shrink-0 flex items-center mb-6 mt-2 transition-all duration-500 ${isCollapsed ? 'justify-center' : 'gap-2 px-2 justify-start'}`}>
            <Activity size={28} className="text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]" />
            <div className={`overflow-hidden transition-all duration-500 flex items-center ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
              <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white whitespace-nowrap" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Nova.</span>
            </div>
          </div>
            
          {/* 2. Scrollable Middle Section - Mask-Image Edge Fading */}
          <div 
            className="flex-1 overflow-y-auto min-h-0 nuke-scrollbar -mx-2 px-2 pb-6"
            style={{ 
              maskImage: 'linear-gradient(to bottom, transparent, black 16px, black calc(100% - 16px), transparent)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 16px, black calc(100% - 16px), transparent)'
            }}
          >
            <nav className="space-y-1.5 pt-4 pb-4">
              <NavItem href="/dashboard" icon={<LayoutDashboard size={20}/>} label="Overview" active={pathname === "/dashboard"} isCollapsed={isCollapsed} />
              <NavItem href="/dashboard/wallets" icon={<Wallet size={20}/>} label="Wallets" active={pathname === "/dashboard/wallets"} isCollapsed={isCollapsed} />
              <NavItem href="/dashboard/transactions" icon={<ArrowRightLeft size={20}/>} label="Transactions" active={pathname === "/dashboard/transactions"} isCollapsed={isCollapsed} />
              <NavItem href="/dashboard/budgets" icon={<Target size={20}/>} label="Budgets" active={pathname === "/dashboard/budgets"} isCollapsed={isCollapsed} />
              <NavItem href="/dashboard/subscriptions" icon={<ShieldCheck size={20}/>} label="Subscriptions" active={pathname === "/dashboard/subscriptions"} isCollapsed={isCollapsed} />
              <NavItem href="/dashboard/savings" icon={<PiggyBank size={20}/>} label="Savings Goals" active={pathname === "/dashboard/savings"} isCollapsed={isCollapsed} />
              <NavItem href="/dashboard/assets" icon={<Briefcase size={20}/>} label="Assets" active={pathname === "/dashboard/assets"} isCollapsed={isCollapsed} />
              <NavItem href="/dashboard/debts" icon={<CreditCard size={20}/>} label="Debts & Loans" active={pathname === "/dashboard/debts"} isCollapsed={isCollapsed} />
              
              {/* ☕ Ko-fi Button (Desktop) */}
              <div className="pt-4 pb-2">
                <a 
                  href="https://ko-fi.com/nellyjackson" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  title={isCollapsed ? "Support on Ko-fi" : ""}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-start px-4 gap-3'} py-3 rounded-xl transition-all duration-300 font-bold group relative text-amber-700 dark:text-amber-400 bg-amber-500/10 backdrop-blur-md hover:bg-amber-500/20 border border-amber-500/20 shadow-[0_4px_12px_-4px_rgba(251,191,36,0.2)] dark:shadow-[0_4px_12px_-4px_rgba(251,191,36,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900`}
                >
                  <div className="relative z-10 shrink-0 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-translate-y-0.5 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">
                    <Coffee size={20} />
                  </div>
                  <div className={`relative z-10 overflow-hidden transition-all duration-500 flex items-center ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                    <span className="whitespace-nowrap">Support on Ko-fi</span>
                  </div>
                </a>
              </div>
            </nav>
          </div>

          {/* 3. Fixed Bottom Section */}
          <div className="shrink-0 flex flex-col gap-2 pt-4 border-t border-slate-200/50 dark:border-white/5 transition-colors mt-auto z-10 bg-transparent">
            
            {/* IN-APP INSTALL BUTTON (DESKTOP) */}
            {installPrompt && (
              <button 
                onClick={handleInstallApp} 
                className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-start px-4 gap-3'} py-3 rounded-xl transition-all duration-300 font-bold group relative text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 backdrop-blur-md hover:bg-indigo-500/20 border border-indigo-500/20 shadow-[0_4px_12px_-4px_rgba(99,102,241,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500`}
              >
                <Download size={20} className="group-hover:scale-110 transition-transform shrink-0 drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]" />
                <span className={`whitespace-nowrap overflow-hidden transition-all duration-500 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>Install App</span>
              </button>
            )}

            <NavItem href="/dashboard/settings" icon={<Settings size={20}/>} label="Settings" active={pathname === "/dashboard/settings"} isCollapsed={isCollapsed} />
            <UserProfile isCollapsed={isCollapsed} />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative z-10 flex flex-col pt-24 md:pt-0">
          <div className="flex-1">
            {children}
          </div>
        </main>

        {/* 📱 MOBILE FLOATING TOP HEADER */}
        <header className="md:hidden fixed top-[max(env(safe-area-inset-top),1rem)] left-4 right-4 z-[9999] flex items-center justify-between px-5 py-3 border border-white/40 dark:border-white/10 bg-white/40 dark:bg-[#0A0A0E]/60 backdrop-blur-[40px] saturate-[2] shadow-[0_16px_40px_-10px_rgba(0,0,0,0.5)] rounded-[2rem] pointer-events-auto">
          <div className="flex items-center gap-2">
            <Activity size={24} className="text-indigo-600 dark:text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]" />
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Nova.</span>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <a 
              href="https://ko-fi.com/nellyjackson" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 transition-colors p-2 rounded-full hover:bg-amber-50 dark:hover:bg-amber-500/10 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              title="Support on Ko-fi"
            >
              <Coffee size={20} />
            </a>

            <button 
              onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
              className="text-slate-500 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              title="Search"
              aria-label="Open Command Palette"
            >
              <Search size={20} />
            </button>

            {installPrompt && (
              <button 
                onClick={handleInstallApp}
                className="flex items-center gap-1.5 bg-indigo-500/20 border border-indigo-500/30 backdrop-blur-md hover:bg-indigo-500/30 text-indigo-700 dark:text-indigo-300 px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <Download size={14} /> Install
              </button>
            )}

            <button 
              onClick={handleSignOut}
              className="flex items-center gap-1.5 bg-rose-500/10 backdrop-blur-md hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </header>

        {/* 📱 MOBILE FLOATING BOTTOM NAV */}
        <nav className="md:hidden fixed bottom-[max(env(safe-area-inset-bottom),1.5rem)] left-4 right-4 z-[9999] pointer-events-auto">
          <div className="nuke-scrollbar bg-white/40 dark:bg-[#0A0A0E]/60 backdrop-blur-[40px] saturate-[2] border border-white/40 dark:border-white/10 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.5)] rounded-[2.5rem] px-2 py-2.5 flex items-center justify-between gap-1 overflow-x-auto relative">
            <MobileNavItem href="/dashboard" icon={<LayoutDashboard size={22}/>} label="Home" active={pathname === "/dashboard"} />
            <MobileNavItem href="/dashboard/wallets" icon={<Wallet size={22}/>} label="Wallets" active={pathname === "/dashboard/wallets"} />
            <MobileNavItem href="/dashboard/transactions" icon={<ArrowRightLeft size={22}/>} label="Txns" active={pathname === "/dashboard/transactions"} />
            <MobileNavItem href="/dashboard/budgets" icon={<Target size={22}/>} label="Budgets" active={pathname === "/dashboard/budgets"} />
            <MobileNavItem href="/dashboard/subscriptions" icon={<ShieldCheck size={22}/>} label="Subs" active={pathname === "/dashboard/subscriptions"} />
            <MobileNavItem href="/dashboard/savings" icon={<PiggyBank size={22}/>} label="Save" active={pathname === "/dashboard/savings"} />
            <MobileNavItem href="/dashboard/debts" icon={<CreditCard size={22}/>} label="Debts" active={pathname === "/dashboard/debts"} />
            <MobileNavItem href="/dashboard/assets" icon={<Briefcase size={22}/>} label="Assets" active={pathname === "/dashboard/assets"} />
            <div className="w-[1px] h-8 bg-slate-300/50 dark:bg-white/10 shrink-0 mx-1 rounded-full"></div>
            <MobileNavItem href="/dashboard/settings" icon={<Settings size={22}/>} label="Settings" active={pathname === "/dashboard/settings"} />
          </div>
        </nav>

      </div>
    </AuthGuard>
  );
}

// --- DESKTOP NAV ITEM (🚀 UPGRADED GLASSMORPHISM + ACCESSIBILITY) ---
function NavItem({ icon, label, href = "#", active = false, isCollapsed }: any) {
  return (
    <Link 
      href={href} 
      title={isCollapsed ? label : ""} 
      aria-current={active ? "page" : undefined}
      className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-start px-4 gap-3'} py-3 rounded-xl transition-all duration-300 font-medium group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900
      ${active 
        ? 'bg-white/70 dark:bg-slate-800/60 backdrop-blur-md shadow-[0_8px_20px_-6px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.3)] border border-white/80 dark:border-white/10 text-indigo-600 dark:text-indigo-400 font-bold' 
        : 'text-slate-500 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-white/5 hover:backdrop-blur-sm border border-transparent'
      }`}
    >
      <div className={`relative z-10 shrink-0 transition-transform duration-300 ease-out ${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]' : 'group-hover:scale-110 group-hover:-translate-y-0.5'}`}>
        {icon}
      </div>
      <div className={`relative z-10 overflow-hidden transition-all duration-500 flex items-center ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
        <span className="whitespace-nowrap">{label}</span>
      </div>
    </Link>
  );
}

// --- MOBILE NAV ITEM (🚀 ADDED ACCESSIBILITY) ---
function MobileNavItem({ icon, label, href = "#", active = false }: any) {
  return (
    <Link 
      href={href} 
      aria-current={active ? "page" : undefined}
      onClick={() => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(50);
        }
      }}
      className={`flex flex-col items-center justify-center min-w-[60px] py-2.5 px-2 rounded-2xl transition-all duration-300 relative group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
      ${active 
        ? 'text-indigo-600 dark:text-indigo-400 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-white/50 dark:border-white/5' 
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
      }`}
    >
      <div className={`transition-transform duration-300 ${active ? '-translate-y-1 scale-110 drop-shadow-md' : 'group-hover:-translate-y-1'}`}>{icon}</div>
      {active && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>}
    </Link>
  );
}