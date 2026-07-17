"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; 
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { ArrowRight, Shield, Zap, PieChart, Activity, TrendingUp, Wallet, Target, Sun, Moon, CreditCard, Lock, LineChart, Mail, Layers, RefreshCw, CheckCircle2, Car, Home, Handshake, Crosshair } from "lucide-react";

// Initialize our premium startup fonts
const headerFont = Plus_Jakarta_Sans({ subsets: ["latin"] });
const bodyFont = Inter({ subsets: ["latin"] });

export default function WelcomePage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const router = useRouter(); 
  const [hasActiveSession, setHasActiveSession] = useState(false);

  // 🚀 Core Theme Applier Function
  const applyThemeClass = (isDark: boolean) => {
    setTheme(isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // 🚀 Auth & Cloud Theme Sync Check
  useEffect(() => {
    const initializeUserAndTheme = async () => {
      // 1. Check for active Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setHasActiveSession(true);
        
        // 2. Read theme from cloud (user_metadata)
        const cloudTheme = session.user.user_metadata?.preferred_theme;
        
        if (cloudTheme) {
          // Cloud preference wins over everything else
          applyThemeClass(cloudTheme === 'dark');
          // Update local cache so it doesn't flicker on next reload before DB fetch
          localStorage.setItem('app_theme', cloudTheme); 
          return; // Exit early since cloud theme was applied
        }
      }

      // 3. Fallback for guests or users without a saved cloud preference
      const savedTheme = localStorage.getItem('app_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        applyThemeClass(savedTheme === 'dark');
      } else {
        // System preference
        applyThemeClass(window.matchMedia('(prefers-color-scheme: dark)').matches);
      }
    };

    initializeUserAndTheme();

    // Listen for live OS changes (only applies if user hasn't hard-set a preference)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      const savedTheme = localStorage.getItem('app_theme');
      if (!savedTheme || savedTheme === 'system') {
        applyThemeClass(mediaQuery.matches);
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, []);

  const toggleTheme = async () => {
    // Determine new theme
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    
    // 1. Update UI instantly
    applyThemeClass(newTheme === 'dark');
    
    // 2. Save locally for instant load next time
    localStorage.setItem('app_theme', newTheme);

    // 3. Sync to Cloud (Supabase) if logged in
    if (hasActiveSession) {
      const { error } = await supabase.auth.updateUser({
        data: { preferred_theme: newTheme }
      });
      
      if (error) {
        console.error("Failed to sync theme to cloud:", error);
      }
    }
  };

  const handlePrimaryAction = () => {
    if (hasActiveSession) {
      router.push("/dashboard");
    } else {
      router.push("/signup"); 
    }
  };

  const handleLoginClick = () => {
    if (hasActiveSession) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  // FEATURED TOOLS 
  const featuredTools = [
    {
      href: "/net-worth-calculator",
      icon: <LineChart size={22} />,
      title: "Net Worth",
      description: "See your actual financial standing today.",
      colorClass: "text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20"
    },
    {
      href: "/tra-car-import-duty-calculator-tanzania",
      icon: <Car size={22} />,
      title: "TRA Import",
      description: "Estimate taxes for vehicle imports based on TRA rates.",
      colorClass: "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20"
    },
    {
      href: "/property-tax-calculator-tanzania",
      icon: <Home size={22} />,
      title: "Property Tax",
      description: "Calculate Stamp Duty and Capital Gains for real estate.",
      colorClass: "text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20"
    },
    {
      href: "/paye-calculator",
      icon: <Wallet size={22} />,
      title: "PAYE Calculator",
      description: "Know your exact take-home pay after standard deductions.",
      colorClass: "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20"
    }
  ];

  return (
    <main className={`min-h-screen bg-slate-50 dark:bg-[#0A0A0E] text-slate-900 dark:text-slate-50 flex flex-col relative overflow-hidden selection:bg-brand-500/30 transition-colors duration-500 ${bodyFont.className}`}>
      
      {/* Background Glow Effects - Toned down for a calmer feel */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-brand-600/5 dark:bg-brand-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-[20%] right-[-5%] w-[500px] h-[500px] bg-purple-500/5 dark:bg-purple-500/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Top Navigation Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-4 flex justify-between items-center z-[100] relative pointer-events-auto">
        <div className="flex items-center gap-2">
          <Activity size={28} className="text-brand-600 dark:text-brand-400" />
          <span className={`${headerFont.className} font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white transition-colors`}>
            Nova.
          </span>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4 relative z-[100]">
          <button 
            type="button"
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center shrink-0 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors rounded-full active:bg-slate-200 dark:active:bg-white/10 sm:hover:bg-slate-200 sm:dark:hover:bg-white/10 relative z-[100] cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button onClick={handleLoginClick} className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white text-sm font-medium px-2 sm:px-4 py-2 transition-colors relative z-[100]">
            {hasActiveSession ? "Dashboard" : "Log in"}
          </button>
          <button onClick={handlePrimaryAction} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 px-4 sm:px-5 py-2 rounded-full text-sm font-medium transition-all active:scale-95 shadow-sm relative z-[100]">
            {hasActiveSession ? "Go to Dashboard" : "Create account"}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center z-10 pt-12 lg:pt-20 pb-16 px-6">
        
        {/* Left Column: Typography & CTA */}
        <div className="text-left flex flex-col items-start order-2 lg:order-1 relative z-20">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-200/80 dark:bg-white/5 border border-slate-300/80 dark:border-white/10 text-slate-800 dark:text-slate-300 text-xs font-medium mb-8 transition-colors">
            "Beware of little expenses, a small leak will sink a great ship." – Benjamin Franklin
          </div>

          <h1 className={`${headerFont.className} text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1] text-slate-900 dark:text-white transition-colors`}>
            Finally, a place where <br />
            <span className="text-brand-700 dark:text-brand-400">
              your money makes sense.
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-slate-700 dark:text-slate-300 mb-10 max-w-lg leading-relaxed transition-colors">
            See exactly what you earn, what you spend, and what’s left for tomorrow. No complicated spreadsheets—just a clear, honest picture of your finances.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto relative z-30 mb-8">
            <button onClick={handlePrimaryAction} className="group flex items-center justify-center gap-2 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 px-7 py-3.5 rounded-full text-sm font-semibold transition-all active:scale-95 w-full sm:w-auto">
              {hasActiveSession ? "Go to Dashboard" : "Start tracking"} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <a href="#free-tools" className="group flex items-center justify-center gap-2 bg-transparent hover:bg-slate-200 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 px-7 py-3.5 rounded-full text-sm font-medium transition-all active:scale-95 w-full sm:w-auto">
              Explore free tools
            </a>
          </div>

          <div className="flex items-center gap-3 text-xs md:text-sm text-slate-600 dark:text-slate-400 font-medium transition-colors">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-50 dark:border-[#0A0A0E] bg-slate-300 dark:bg-slate-700 flex items-center justify-center overflow-hidden transition-colors">
                  <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i + 10}&backgroundColor=transparent`} alt="avatar" className="w-full h-full object-cover opacity-80" />
                </div>
              ))}
            </div>
            <span>Trusted by thousands in Tanzania.</span>
          </div>
        </div>

        {/* Right Column: Illustration & Realistic UI Snippet */}
        <div className="relative w-full h-[420px] sm:h-[480px] lg:h-[550px] flex items-center justify-center order-1 lg:order-2 mt-6 lg:mt-0">
          <div className="relative w-full max-w-sm sm:max-w-md z-10 flex items-center justify-center p-4">
            <img 
              src="/hero-illustration.svg" 
              alt="Tracking finances in Tanzania" 
              className="w-full h-auto drop-shadow-sm opacity-90 relative z-10 transition-all"
              style={{ minHeight: '280px', objectFit: 'contain' }} 
            />
          </div>

          {/* Clean, glassy UI snippet - Precision tailored for landing layouts */}
          <div className="absolute bottom-6 right-2 sm:right-6 lg:top-[40%] lg:bottom-auto lg:-right-4 z-20">
            <div className="bg-white/70 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-white/10 p-4 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.35)] flex flex-col gap-3.5 w-56 transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-center justify-between border-b border-slate-200/30 dark:border-white/5 pb-1.5">
                <span className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Recent</span>
                <span className="text-slate-400 dark:text-slate-500 text-[10px] font-medium">Today</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200/50 dark:border-white/5 shrink-0 shadow-sm">
                  <Home size={15} className="text-slate-700 dark:text-slate-300" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">Luku Token</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Utilities</span>
                </div>
                <span className={`${headerFont.className} text-xs font-bold text-slate-800 dark:text-slate-200 shrink-0`}>-20k</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/10 shrink-0 shadow-sm">
                  <Wallet size={15} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">Salary</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Income</span>
                </div>
                <span className={`${headerFont.className} text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0`}>+1.2M</span>
              </div>
            </div>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-brand-500/5 dark:bg-brand-500/10 blur-[80px] rounded-full pointer-events-none z-0 transition-colors"></div>
        </div>
      </div>

      {/* HOW IT WORKS SECTION */}
      <div className="w-full max-w-7xl mx-auto px-6 py-20 z-10 border-t border-slate-300 dark:border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className={`${headerFont.className} text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 transition-colors tracking-tight`}>
            How Nova Works
          </h2>
          <p className="text-slate-700 dark:text-slate-300 transition-colors text-base md:text-lg">
            A simple, quiet way to get your finances under control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-14 max-w-5xl mx-auto relative">
          
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="shrink-0 relative text-slate-500 dark:text-slate-400 pt-1">
              <Handshake size={28} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className={`${headerFont.className} text-lg font-bold text-slate-900 dark:text-white mb-2`}>1. Connect your accounts</h3>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                Bring your cash, bank balances, and mobile money into one view. Stop checking three different apps to know how much money you actually have.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="shrink-0 relative text-slate-500 dark:text-slate-400 pt-1">
              <Crosshair size={28} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className={`${headerFont.className} text-lg font-bold text-slate-900 dark:text-white mb-2`}>2. Track without the friction</h3>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                Log daily spending and bank charges in seconds. Keep an eye on upcoming bills so you are never caught off guard.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="shrink-0 relative text-slate-500 dark:text-slate-400 pt-1">
              <CheckCircle2 size={28} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className={`${headerFont.className} text-lg font-bold text-slate-900 dark:text-white mb-2`}>3. Watch your net worth grow</h3>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                See your progress as you pay down balances and save for the future. No hype, just clear visual proof of your hard work.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="shrink-0 relative text-slate-500 dark:text-slate-400 pt-1">
              <Shield size={28} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className={`${headerFont.className} text-lg font-bold text-slate-900 dark:text-white mb-2`}>4. Total privacy</h3>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                Your data stays yours. We do not sell your information. Everything is secured with industry-standard encryption.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* CORE FEATURES SECTION */}
      <div className="w-full max-w-7xl mx-auto px-6 py-24 md:py-32 z-10">
        <div className="text-center max-w-3xl mx-auto mb-20 md:mb-24">
          <h2 className={`${headerFont.className} text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 transition-colors tracking-tight`}>
            Everything you need. Nothing you don't.
          </h2>
          <p className="text-slate-700 dark:text-slate-300 text-base md:text-lg transition-colors leading-relaxed">
            Stop jumping between spreadsheets and bank accounts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 lg:gap-x-24 lg:gap-y-20 max-w-5xl mx-auto">
          
          <div className="flex flex-col items-start">
            <div className="text-slate-700 dark:text-slate-300 mb-4">
              <PieChart size={24} strokeWidth={1.5} />
            </div>
            <h3 className={`${headerFont.className} text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight`}>
              Clear Cash Flow
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
              Visualize your entire financial life. Know exactly what comes in and what goes out so you can make informed decisions.
            </p>
          </div>

          <div className="flex flex-col items-start">
            <div className="text-slate-700 dark:text-slate-300 mb-4">
              <Zap size={24} strokeWidth={1.5} />
            </div>
            <h3 className={`${headerFont.className} text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight`}>
              Catch Recurring Charges
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
              Spot hidden subscriptions. Keep what you actually use, cancel the rest, and stop wasting money on things you forgot about.
            </p>
          </div>

          <div className="flex flex-col items-start">
            <div className="text-slate-700 dark:text-slate-300 mb-4">
              <CreditCard size={24} strokeWidth={1.5} />
            </div>
            <h3 className={`${headerFont.className} text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight`}>
              Manage Debt
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
              Organize your liabilities. Create a plan to pay them down systematically and track your balance until it hits zero.
            </p>
          </div>

          <div className="flex flex-col items-start">
            <div className="text-slate-700 dark:text-slate-300 mb-4">
              <Target size={24} strokeWidth={1.5} />
            </div>
            <h3 className={`${headerFont.className} text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight`}>
              Track Assets
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
              Log depreciating assets like vehicles, and track the funds you set aside for emergencies or future purchases.
            </p>
          </div>

        </div>
      </div>

      {/* FREE TOOLS SECTION */}
      <div id="free-tools" className="w-full max-w-7xl mx-auto px-6 py-16 lg:py-20 z-10 scroll-mt-20 bg-slate-100/80 dark:bg-white/[0.02] border-y border-slate-300 dark:border-white/5 rounded-3xl mb-24">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className={`${headerFont.className} text-2xl md:text-3xl font-extrabold mb-3 tracking-tight text-slate-900 dark:text-white`}>Free Financial Tools</h2>
          <p className="text-slate-700 dark:text-slate-400 text-sm">Useful calculators for Tanzania. No account required.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredTools.map((tool, index) => (
            <div key={index}>
              <ToolCard
                href={tool.href}
                icon={tool.icon}
                title={tool.title}
                description={tool.description}
                colorClass={tool.colorClass}
              />
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link 
            href="/tools"
            className="group inline-flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 px-6 py-2.5 rounded-full text-xs font-semibold transition-all active:scale-95"
          >
            View all tools <ArrowRight size={14} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* FINAL CTA SECTION */}
      <div className="w-full max-w-4xl mx-auto px-6 pb-32 z-10 text-center relative">
        <div className="relative z-10">
          <h2 className={`${headerFont.className} text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-6 transition-colors tracking-tight`}>
            Ready to get started?
          </h2>
          <p className="text-slate-700 dark:text-slate-300 text-base max-w-xl mx-auto leading-relaxed transition-colors mb-8">
            Create an account today and get a clear picture of your finances.
          </p>
          <button onClick={handlePrimaryAction} className="inline-flex items-center justify-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 px-8 py-3.5 rounded-full text-sm font-semibold transition-all active:scale-95">
            {hasActiveSession ? "Go to Dashboard" : "Create free account"}
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="w-full max-w-7xl mx-auto pt-16 pb-12 border-t border-slate-300 dark:border-white/5 z-10 px-6 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-10 sm:gap-8 mb-12 text-left">
          
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={20} className="text-brand-600 dark:text-brand-400" />
              <span className={`${headerFont.className} font-bold text-xl text-slate-900 dark:text-white`}>Nova.</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 max-w-xs">
              Intelligent Wealth Management. 
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              <Mail size={16} />
              Contact us
            </Link>
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm">Features</h3>
            <ul className="space-y-4 sm:space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li><Link href="/expense-tracker" className="hover:text-slate-900 dark:hover:text-white transition-colors">Expense Tracker</Link></li>
              <li><Link href="/net-worth-tracker" className="hover:text-slate-900 dark:hover:text-white transition-colors">Net Worth Tracker</Link></li>
              <li><Link href="/subscription-tracker" className="hover:text-slate-900 dark:hover:text-white transition-colors">Subscriptions</Link></li>
              <li><Link href="/asset-tracker" className="hover:text-slate-900 dark:hover:text-white transition-colors">Assets</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm">Free Tools</h3>
            <ul className="space-y-4 sm:space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li><Link href="/property-tax-calculator-tanzania" className="hover:text-slate-900 dark:hover:text-white transition-colors">Property Tax Calculator</Link></li>
              <li><Link href="/paye-calculator" className="hover:text-slate-900 dark:hover:text-white transition-colors">PAYE Calculator</Link></li>
              <li><Link href="/tra-car-import-duty-calculator-tanzania" className="hover:text-slate-900 dark:hover:text-white transition-colors">TRA Import Tool</Link></li>
              <li><Link href="/freelance-invoice-calculator" className="hover:text-slate-900 dark:hover:text-white transition-colors">Freelance Invoice</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm">Company</h3>
            <ul className="space-y-4 sm:space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li><Link href="/blog" className="hover:text-slate-900 dark:hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-4 text-xs text-slate-600 dark:text-slate-400 pt-8 border-t border-slate-300 dark:border-white/5">
          <span>© {new Date().getFullYear()} Nova. All rights reserved.</span>
          <div className="flex items-center gap-2">
            <Shield size={14} /> Encrypted & Secure
          </div>
        </div>
      </footer>
    </main>
  );
}

function ToolCard({ href, icon, title, description, colorClass }: { href: string, icon: React.ReactNode, title: string, description: string, colorClass: string }) {
  return (
    <Link href={href} className="group bg-white dark:bg-[#111118]/60 border border-slate-300 dark:border-white/5 p-5 rounded-2xl hover:border-slate-400 dark:hover:border-white/10 transition-colors flex flex-col h-full relative overflow-hidden">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors ${colorClass.replace('bg-', 'bg-').replace('text-', 'text-')}`}>
        {icon}
      </div>
      <h3 className={`${headerFont.className} text-base font-semibold text-slate-900 dark:text-white mb-1 tracking-tight`}>{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4 flex-grow">{description}</p>
    </Link>
  );
}