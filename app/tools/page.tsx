"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { 
  ArrowLeft, Search, ArrowRight, Sun, Moon, LineChart, Car, Home, 
  Wallet, Receipt, Target, Calculator, Building, TrendingUp, TrendingDown, 
  Shield, Activity, Mail, Plus, FileText, Coffee, Share2, MessageCircle, 
  Bookmark, User, Building2, 
  Wallet2,
  PieChart,
  Percent
} from "lucide-react"; 

const headerFont = Plus_Jakarta_Sans({ subsets: ["latin"] });
const bodyFont = Inter({ subsets: ["latin"] });

export default function ToolsHubPage() {
  // Initialize with null to prevent hydration mismatch
  const [theme, setTheme] = useState<'dark' | 'light' | null>(null);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasActiveSession, setHasActiveSession] = useState(false);
  
  // CATEGORY FILTER STATE ('all' | 'personal' | 'tra')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'personal' | 'tra'>('all');

  // PAGINATION STATE
  const [visibleCount, setVisibleCount] = useState(8);

  // SHARE & SAVE STATE
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveText, setSaveText] = useState("Save");

  // 🚀 Core Theme Applier Function (FIXED)
  const applyThemeClass = (isDark: boolean) => {
    const newTheme = isDark ? 'dark' : 'light';
    setTheme(newTheme);
    
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      const body = document.body;
      
      if (isDark) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
        // Force dark background on root and body
        root.style.backgroundColor = '#08080C';
        if (body) {
          body.style.backgroundColor = '#08080C';
        }
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
        // Force light background on root and body
        root.style.backgroundColor = '#f8fafc';
        if (body) {
          body.style.backgroundColor = '#f8fafc';
        }
      }
    }
  };

  // 🚀 Bulletproof Auth & Theme Initialization
  useEffect(() => {
    setMounted(true); // Let React know we're on the client

    const initializeUserAndTheme = async () => {
      let cloudTheme = null;

      // 1. Check for active Supabase session safely
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session && !error) {
          setHasActiveSession(true);
          cloudTheme = session.user.user_metadata?.preferred_theme;
        }
      } catch (err) {
        console.error("Supabase auth check failed. Falling back to local theme.", err);
      }

      // 2. Apply theme (Cloud Preference > Local Storage > System OS)
      if (cloudTheme === 'dark' || cloudTheme === 'light') {
        applyThemeClass(cloudTheme === 'dark');
        localStorage.setItem('app_theme', cloudTheme); 
      } else {
        const savedTheme = localStorage.getItem('app_theme');
        if (savedTheme === 'dark' || savedTheme === 'light') {
          applyThemeClass(savedTheme === 'dark');
        } else {
          applyThemeClass(window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
      }
    };

    initializeUserAndTheme();

    // Listen for live OS changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem('app_theme');
      if (!savedTheme || savedTheme === 'system') {
        applyThemeClass(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    applyThemeClass(newTheme === 'dark');
    localStorage.setItem('app_theme', newTheme);

    // Sync to Cloud safely
    if (hasActiveSession) {
      try {
        const { error } = await supabase.auth.updateUser({
          data: { preferred_theme: newTheme }
        });
        if (error) console.error("Failed to sync theme to cloud:", error);
      } catch (err) {
        console.error("Error updating user metadata:", err);
      }
    }
  };

  // Reset pagination when user searches or switches categories
  useEffect(() => {
    setVisibleCount(8);
  }, [searchTerm, selectedCategory]);

  // SHARE HANDLERS
  const platformUrl = typeof window !== "undefined" ? window.location.href : "https://nova.co.tz/tools";
  const shareMessage = `Check out Nova's free Financial Tools & Calculators for Tanzania. Super helpful! ${platformUrl}`;

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(platformUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Nova Financial Tools',
          text: 'Free financial calculators and tools for Tanzania.',
          url: platformUrl,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSaveToggle = () => {
    setIsSaved(true);
    const isMac = typeof window !== "undefined" && navigator.userAgent.toUpperCase().indexOf('MAC') >= 0;
    
    setSaveText(isMac ? "Press Cmd+D" : "Press Ctrl+D");
    
    setTimeout(() => {
      setSaveText("Saved");
    }, 3000);
  };

  const allTools = [
    {
      href: "/payslip-generator",
      icon: <FileText size={22} />,
      title: "PDF Payslip Generator",
      description: "Create professional, ready-to-print payslips for your employees instantly.",
      category: "HR & Payroll",
      type: "tra", 
      colorClass: "text-[#8B5CF6] dark:text-[#8B5CF6] bg-purple-500/10 border-purple-500/20"
    },
    {
      href: "/net-worth-calculator",
      icon: <LineChart size={22} />,
      title: "Net Worth Calculator",
      description: "Calculate your exact wealth standing in Tanzania.",
      category: "Wealth Building",
      type: "personal", 
      colorClass: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20"
    },
    {
      href: "/tra-car-import-duty-calculator-tanzania",
      icon: <Car size={22} />,
      title: "TRA Car Import Duty",
      description: "Estimate taxes for vehicle imports via TRA formulas.",
      category: "Taxes & Compliance",
      type: "tra", 
      colorClass: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20"
    },
    {
      href: "/property-tax-calculator-tanzania",
      icon: <Home size={22} />,
      title: "Property Tax Calculator",
      description: "Calculate Stamp Duty and CGT for real estate.",
      category: "Real Estate",
      type: "tra", 
      colorClass: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
    },
    {
      href: "/paye-calculator",
      icon: <Wallet size={22} />,
      title: "PAYE Calculator",
      description: "Calculate your exact take-home pay after TRA deductions.",
      category: "Taxes & Compliance",
      type: "personal", 
      colorClass: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    },
    {
      href: "/freelance-invoice-calculator",
      icon: <Receipt size={22} />,
      title: "Freelance Invoice Strategy",
      description: "Reverse-engineer your freelance invoice for VAT & WHT.",
      category: "Taxes & Compliance",
      type: "tra", 
      colorClass: "text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20"
    },
    {
      href: "/gross-salary-calculator",
      icon: <Target size={22} />,
      title: "Gross Salary Calculator",
      description: "Enter your target net pay and we'll work backwards to show you the gross salary you need.",
      category: "Income",
      type: "personal", 
      colorClass: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20"
    },
    {
      href: "/budget-calculator",
      icon: <Calculator size={22} />,
      title: "Zero-Based Budget",
      description: "Generate a strict, optimized 50/30/20 spending plan.",
      category: "Budgeting",
      type: "personal", 
      colorClass: "text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20"
    },
    {
      href: "/depreciation-calculator",
      icon: <Building size={22} />,
      title: "Asset Depreciation",
      description: "Calculate capital allowance per Tanzanian tax law.",
      category: "Assets",
      type: "tra", 
      colorClass: "text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/20"
    },
    {
      href: "/compound-interest-calculator",
      icon: <TrendingUp size={22} />,
      title: "Compound Interest",
      description: "Project investment growth over time with compounding.",
      category: "Wealth Building",
      type: "personal", 
      colorClass: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20"
    },
    {
      href: "/debt-payoff-calculator",
      icon: <TrendingDown size={22} />,
      title: "Debt Payoff Strategy",
      description: "Strategize the fastest way to become debt-free.",
      category: "Budgeting",
      type: "personal", 
      colorClass: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20"
    },
    {
      href: "/emergency-fund-calculator",
      icon: <Shield size={22} />,
      title: "Emergency Fund",
      description: "Determine cash needed for unexpected life events.",
      category: "Wealth Building",
      type: "personal", 
      colorClass: "text-slate-600 dark:text-slate-400 bg-slate-500/10 border-slate-500/20"
    },
    {
      href: "/markup-vs-margin-calculator",
      icon: <Percent size={22} />,
      title: "Markup vs Margin",
      description: "Calculate the difference between markup and margin for your business.",
      category: "Business",
      type: "tra",
      colorClass: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
    },
    {
      href: "/return-on-investment-calculator",
      icon: <PieChart size={22} />,
      title: "Return on Investment",
      description: "Calculate the potential return on your investments over time.",
      category: "Wealth Building",
      type: "personal",
      colorClass: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    }
  ];

  const filteredTools = allTools.filter(tool => {
    const matchesSearch = tool.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tool.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || tool.type === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const displayedTools = filteredTools.slice(0, visibleCount);
  const hasMoreTools = filteredTools.length > visibleCount;

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <main className={`min-h-screen flex flex-col bg-slate-50 dark:bg-[#08080C] text-slate-900 dark:text-slate-50 relative overflow-hidden transition-colors duration-500 selection:bg-brand-500/30 ${bodyFont.className}`}>
      
      {/* AMBIENT GLOW */}
      <div className="absolute top-0 inset-x-0 h-[600px] overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-brand-600/10 dark:bg-brand-500/15 blur-[140px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-16 flex-grow w-full">
        
        {/* NAV */}
        <nav className="flex items-center justify-between mb-10 sm:mb-16">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-all bg-white/70 dark:bg-[#12121A]/70 backdrop-blur-md px-4 py-2.5 rounded-full border border-slate-200/80 dark:border-white/10 shadow-sm active:scale-95">
            <ArrowLeft size={16} /> <span className="hidden sm:inline">Back to Home</span><span className="sm:hidden">Back</span>
          </Link>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <a 
              href="https://ko-fi.com/nellyjackson" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 transition-all px-4 py-2.5 rounded-full border border-amber-500/20 backdrop-blur-md shadow-sm active:scale-95"
            >
              <Coffee size={16} /> <span className="hidden sm:inline">Buy us a Coffee</span><span className="sm:hidden">Support</span>
            </a>

            <button 
              onClick={toggleTheme} 
              className="w-10 h-10 rounded-full bg-white/70 dark:bg-[#12121A]/70 backdrop-blur-md border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300 shadow-sm hover:bg-white dark:hover:bg-[#1A1A24] transition-all active:scale-90 flex items-center justify-center"
            >
              {mounted ? (
                theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />
              ) : (
                <span className="w-[18px] h-[18px] block" /> // Prevents layout shift during hydration
              )}
            </button>
          </div>
        </nav>

        {/* HEADER */}
        <header className="mb-10 sm:mb-12 text-center max-w-3xl mx-auto px-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 backdrop-blur-md mb-4 sm:mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">NOVA APP LIBRARY</span>
          </div>
          <h1 className={`${headerFont.className} text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 sm:mb-6 text-slate-900 dark:text-white`}>
            Financial Tools & Calculators.
          </h1>
          <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Professional-grade planning tools tailored for the Tanzanian financial landscape. Completely free. No account required.
          </p>
        </header>

        {/* SEARCH BAR */}
        <div className="max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-500 transition-colors">
              <Search size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Search for taxes, budgeting, assets..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/70 dark:bg-[#12121A]/70 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-full pl-14 pr-6 py-3.5 sm:py-4 text-sm sm:text-base font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500/60 focus:ring-4 focus:ring-brand-500/10 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* CATEGORY TAB SWITCHER */}
        <div className="flex items-center justify-center mb-16 sm:mb-20 px-2">
          <div className="inline-flex p-1.5 rounded-full bg-white/70 dark:bg-[#12121A]/70 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-lg shadow-slate-900/5 dark:shadow-black/20 gap-1.5 max-w-full overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex items-center justify-center px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap active:scale-95 ${
                selectedCategory === 'all'
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-white/5"
              }`}
            >
              All Tools
            </button>

            <button
              onClick={() => setSelectedCategory('personal')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap active:scale-95 ${
                selectedCategory === 'personal'
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-white/5"
              }`}
            >
              <User size={16} /> Personal
            </button>

            <button
              onClick={() => setSelectedCategory('tra')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap active:scale-95 ${
                selectedCategory === 'tra'
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-white/5"
              }`}
            >
              <Building2 size={16} /> TRA & Business
            </button>
          </div>
        </div>

        {/* TOOLS GRID */}
        {displayedTools.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {displayedTools.map((tool, index) => (
                <Link 
                  key={index} 
                  href={tool.href} 
                  className="group bg-white/60 dark:bg-[#111118]/50 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 p-6 sm:p-7 rounded-[2rem] hover:shadow-2xl hover:shadow-brand-500/10 hover:border-brand-500/40 dark:hover:border-brand-500/40 transition-all duration-300 flex flex-col h-full relative overflow-hidden animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${(index % 8) * 50}ms` }}
                >
                  <div className="flex justify-between items-start mb-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${tool.colorClass}`}>
                      {tool.icon}
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-slate-200/50 dark:bg-white/5 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-300/30 dark:border-white/5">
                      {tool.category}
                    </span>
                  </div>
                  <h3 className={`${headerFont.className} text-lg font-bold text-slate-900 dark:text-white mb-2 tracking-tight`}>{tool.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 flex-grow">{tool.description}</p>
                  
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 group-hover:translate-x-1.5 transition-transform">
                    Launch Tool <ArrowRight size={12} />
                  </div>
                </Link>
              ))}
            </div>

            {/* LOAD MORE BUTTON */}
            {hasMoreTools && (
              <div className="mt-12 sm:mt-16 flex justify-center">
                <button 
                  onClick={() => setVisibleCount(prev => prev + 8)}
                  className="group inline-flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
                >
                  <Plus size={16} className="text-brand-500 group-hover:rotate-90 transition-transform duration-300" /> 
                  Load More Tools
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 sm:py-20 bg-white/40 dark:bg-[#12121A]/40 rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 backdrop-blur-xl px-4">
            <Search size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className={`${headerFont.className} text-xl font-bold text-slate-900 dark:text-white mb-2`}>No tools found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">We couldn't find a tool matching your filter or keyword.</p>
            <button 
              onClick={() => { setSearchTerm(""); setSelectedCategory("all"); }} 
              className="mt-6 text-brand-600 dark:text-brand-400 font-bold text-sm hover:underline inline-flex items-center gap-1"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* PREMIUM KO-FI SUPPORT BANNER */}
        <div className="mt-16 sm:mt-20 max-w-5xl mx-auto bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-orange-500/10 backdrop-blur-2xl border border-amber-500/20 rounded-[2.5rem] p-6 sm:p-10 relative overflow-hidden shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="absolute top-0 right-0 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 flex-1">
            <div className="w-14 h-14 shrink-0 bg-white/80 dark:bg-slate-900/80 text-amber-500 border border-amber-500/20 rounded-2xl flex items-center justify-center shadow-md backdrop-blur-md">
              <Coffee size={26} />
            </div>
            <div>
              <h3 className={`${headerFont.className} text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight`}>
                Love these free tools?
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
                We build these calculators to help Tanzanians make better financial decisions. If they saved you time or money, consider buying us a coffee to keep the servers running and the tools 100% free!
              </p>
            </div>
          </div>

          <div className="relative z-10 shrink-0 w-full md:w-auto">
            <a 
              href="https://ko-fi.com/nellyjackson" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full md:w-auto inline-flex justify-center items-center gap-2 bg-[#FF5E5B] hover:bg-[#E04B48] text-white px-7 py-3.5 rounded-full font-bold text-sm transition-all shadow-[0_4px_20px_rgba(255,94,91,0.3)] hover:shadow-[0_6px_24px_rgba(255,94,91,0.45)] hover:-translate-y-0.5 active:scale-95"
            >
              <Coffee size={18} /> Support on Ko-fi
            </a>
          </div>
        </div>

        {/* GLOBAL SHARE & BOOKMARK BANNER */}
        <div className="mt-8 w-full bg-white/50 dark:bg-[#111118]/50 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-[2.5rem] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 transition-colors shadow-sm">
          <div className="text-center md:text-left flex-1">
            <h4 className={`${headerFont.className} text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-1.5`}>Keep these tools handy</h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Bookmark this page to your home screen or share the library with your network.</p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 sm:gap-3 w-full md:w-auto">
            <button 
              onClick={handleWhatsAppShare}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all active:scale-95 shadow-sm"
            >
              <MessageCircle size={18} />
              <span>WhatsApp</span>
            </button>
            
            <button 
              onClick={handleNativeShare}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-brand-500/10 hover:bg-brand-500/20 text-brand-700 dark:text-brand-400 border border-brand-500/20 backdrop-blur-md px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all active:scale-95"
            >
              <Share2 size={18} />
              <span>{copied ? "Copied!" : "Share Link"}</span>
            </button>

            <button 
              onClick={handleSaveToggle}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all active:scale-95 border backdrop-blur-md ${
                isSaved 
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" 
                  : "bg-slate-200/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-300/40 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} className={saveText !== "Save" && saveText !== "Saved" ? "animate-bounce" : ""} />
              <span>{saveText}</span>
            </button>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="w-full max-w-7xl mx-auto pt-16 pb-12 border-t border-slate-200/80 dark:border-white/10 z-10 px-4 sm:px-6 mt-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-10 sm:gap-8 mb-12 text-left">
          
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={20} className="text-brand-600 dark:text-brand-400" />
              <span className={`${headerFont.className} font-bold text-xl text-slate-900 dark:text-white`}>Nova.</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs leading-relaxed">
              Intelligent Wealth Management.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors">
              <Mail size={16} />
              Contact Support
            </Link>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4 text-sm sm:text-base">Features</h4>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li><Link href="/expense-tracker" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Expense Tracker</Link></li>
              <li><Link href="/net-worth-tracker" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Net Worth Tracker</Link></li>
              <li><Link href="/subscription-tracker" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Subscription Radar</Link></li>
              <li><Link href="/asset-tracker" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Asset Tracker</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4 text-sm sm:text-base">Free Tools</h4>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li><Link href="/property-tax-calculator-tanzania" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Property Tax Calculator</Link></li>
              <li><Link href="/paye-calculator" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">PAYE Take-Home Calculator</Link></li>
              <li><Link href="/tra-car-import-duty-calculator-tanzania" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">TRA Import Tool</Link></li>
              <li><Link href="/freelance-invoice-calculator" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Freelance Invoice Tool</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4 text-sm sm:text-base">Company</h4>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li><Link href="/blog" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Financial Blog</Link></li>
              <li><Link href="/privacy" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-slate-500 pt-8 border-t border-slate-200/80 dark:border-white/10">
          <span>© {new Date().getFullYear()} Nova Financial. All rights reserved.</span>
          <div className="flex items-center gap-2 font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3.5 py-1.5 rounded-full border border-emerald-500/20 backdrop-blur-md w-fit">
            <Shield size={14} /> Encrypted & Secure
          </div>
        </div>
      </footer>
    </main>
  );
}