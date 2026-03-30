"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react"; 
import { supabase } from "@/lib/supabase"; 
import { LayoutDashboard, ArrowRightLeft, Target, ShieldCheck, Settings, PiggyBank, Briefcase, Menu, ChevronLeft, CreditCard, Activity, LogOut, Download, Search, Coffee } from "lucide-react"; 
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
      {/* 🚀 INJECTED: The Command Palette Component */}
      <CommandPalette />
      
      <div className="flex h-screen bg-transparent text-slate-900 dark:text-slate-50 font-sans overflow-hidden transition-colors duration-300 relative">
        
        {/* 💻 DESKTOP SIDEBAR */}
        <aside className={`border-r border-white/60 dark:border-white/5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl hidden md:flex flex-col justify-between relative z-20 transition-all duration-500 ease-in-out shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-none ${isCollapsed ? 'w-24 px-4 py-6' : 'w-64 p-6'}`}>
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-4 top-10 bg-white/60 dark:bg-slate-800 backdrop-blur-xl border border-white/80 dark:border-white/10 rounded-full p-2 shadow-lg hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 z-50 group hover:scale-110"
          >
            {isCollapsed ? <Menu size={16} className="text-slate-600 dark:text-slate-300 group-hover:text-indigo-500" /> : <ChevronLeft size={16} className="text-slate-600 dark:text-slate-300 group-hover:text-indigo-500" />}
          </button>

          <div>
            <div className={`flex items-center mb-10 mt-2 transition-all duration-500 ${isCollapsed ? 'justify-center' : 'gap-2 px-2 justify-start'}`}>
              <Activity size={28} className="text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:scale-110 transition-transform" />
              <div className={`overflow-hidden transition-all duration-500 flex items-center ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white whitespace-nowrap" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Nova.</span>
              </div>
            </div>
            
            <nav className="space-y-1.5">
              <NavItem href="/dashboard" icon={<LayoutDashboard size={20}/>} label="Overview" active={pathname === "/dashboard"} isCollapsed={isCollapsed} />
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
                  className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-start px-4 gap-3'} py-3 rounded-xl transition-all duration-300 font-bold group relative text-amber-700 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-500/10 hover:bg-amber-200 dark:hover:bg-amber-500/20 border border-amber-200/50 dark:border-amber-500/20 shadow-sm`}
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

          <div className="flex flex-col gap-2 pt-4 border-t border-slate-200/50 dark:border-white/5 transition-colors mt-auto">
            
            {/* IN-APP INSTALL BUTTON (DESKTOP) */}
            {installPrompt && (
              <button 
                onClick={handleInstallApp} 
                className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-start px-4 gap-3'} py-3 rounded-xl transition-all duration-300 font-bold group relative text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20`}
              >
                <Download size={20} className="group-hover:scale-110 transition-transform shrink-0" />
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
        <header className="md:hidden fixed top-4 left-4 right-4 z-[9999] flex items-center justify-between px-5 py-3 border border-white/40 dark:border-white/10 bg-white/20 dark:bg-[#0A0A0E]/40 backdrop-blur-[40px] saturate-[2] shadow-[0_16px_40px_-10px_rgba(0,0,0,0.5)] rounded-[2rem] pointer-events-auto">
          <div className="flex items-center gap-2">
            <Activity size={24} className="text-indigo-600 dark:text-indigo-400" />
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Nova.</span>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            
            {/* ☕ Ko-fi Button (Mobile) */}
            <a 
              href="https://ko-fi.com/nellyjackson" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 transition-colors p-2 rounded-full hover:bg-amber-50 dark:hover:bg-amber-500/10 active:scale-95"
              title="Support on Ko-fi"
            >
              <Coffee size={20} />
            </a>

            {/* 🚀 NEW: The Mobile Search Trigger */}
            <button 
              onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
              className="text-slate-500 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 active:scale-95"
              title="Search"
            >
              <Search size={20} />
            </button>

            {/* IN-APP INSTALL BUTTON (MOBILE) */}
            {installPrompt && (
              <button 
                onClick={handleInstallApp}
                className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all"
              >
                <Download size={14} /> Install
              </button>
            )}

            <button 
              onClick={handleSignOut}
              className="flex items-center gap-1.5 bg-rose-50/80 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-500/20 px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </header>

        {/* 📱 MOBILE FLOATING BOTTOM NAV */}
        <nav className="md:hidden fixed bottom-6 left-4 right-4 z-[9999] pointer-events-auto">
          <style dangerouslySetInnerHTML={{__html: `
            .nuke-scrollbar::-webkit-scrollbar { display: none !important; }
            .nuke-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
          `}} />
          <div className="nuke-scrollbar bg-white/20 dark:bg-[#0A0A0E]/40 backdrop-blur-[40px] saturate-[2] border border-white/40 dark:border-white/10 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.5)] rounded-[2.5rem] px-2 py-2.5 flex items-center justify-between gap-1 overflow-x-auto relative">
            <MobileNavItem href="/dashboard" icon={<LayoutDashboard size={22}/>} label="Home" active={pathname === "/dashboard"} />
            <MobileNavItem href="/dashboard/transactions" icon={<ArrowRightLeft size={22}/>} label="Txns" active={pathname === "/dashboard/transactions"} />
            <MobileNavItem href="/dashboard/budgets" icon={<Target size={22}/>} label="Budgets" active={pathname === "/dashboard/budgets"} />
            <MobileNavItem href="/dashboard/savings" icon={<PiggyBank size={22}/>} label="Save" active={pathname === "/dashboard/savings"} />
            <MobileNavItem href="/dashboard/debts" icon={<CreditCard size={22}/>} label="Debts" active={pathname === "/dashboard/debts"} />
            <MobileNavItem href="/dashboard/assets" icon={<Briefcase size={22}/>} label="Assets" active={pathname === "/dashboard/assets"} />
            <div className="w-[1px] h-8 bg-slate-300/50 dark:bg-white/20 shrink-0 mx-1 rounded-full"></div>
            <MobileNavItem href="/dashboard/settings" icon={<Settings size={22}/>} label="Settings" active={pathname === "/dashboard/settings"} />
          </div>
        </nav>

      </div>
    </AuthGuard>
  );
}

// --- DESKTOP NAV ITEM ---
function NavItem({ icon, label, href = "#", active = false, isCollapsed }: any) {
  return (
    <Link href={href} title={isCollapsed ? label : ""} className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-start px-4 gap-3'} py-3 rounded-xl transition-all duration-300 font-medium group relative ${active ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm border border-indigo-100/50 dark:border-indigo-500/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent'}`}>
      <div className={`relative z-10 shrink-0 transition-transform duration-300 ease-out ${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]' : 'group-hover:scale-110 group-hover:-translate-y-0.5'}`}>{icon}</div>
      <div className={`relative z-10 overflow-hidden transition-all duration-500 flex items-center ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}><span className="whitespace-nowrap">{label}</span></div>
    </Link>
  );
}

// --- MOBILE NAV ITEM ---
function MobileNavItem({ icon, label, href = "#", active = false }: any) {
  return (
    <Link 
      href={href} 
      // 🚀 INJECTED: Premium Haptic Feedback on Mobile Tap!
      onClick={() => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(50);
        }
      }}
      className={`flex flex-col items-center justify-center min-w-[60px] py-2.5 px-2 rounded-2xl transition-all duration-300 relative group shrink-0 ${active ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10' : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'}`}
    >
      <div className={`transition-transform duration-300 ${active ? '-translate-y-1 scale-110 drop-shadow-md' : 'group-hover:-translate-y-1'}`}>{icon}</div>
      {active && <span className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>}
    </Link>
  );
}