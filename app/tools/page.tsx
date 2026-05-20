"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { ArrowLeft, Search, ArrowRight, Sun, Moon, LineChart, Car, Home, Wallet, Receipt, Target, Calculator, Building, TrendingUp, TrendingDown, Shield, Activity, Mail, Plus } from "lucide-react";

const headerFont = Plus_Jakarta_Sans({ subsets: ["latin"] });
const bodyFont = Inter({ subsets: ["latin"] });

export default function ToolsHubPage() {
  const [theme, setTheme] = useState('dark');
  const [searchTerm, setSearchTerm] = useState("");
  
  // 🚀 PAGINATION STATE: Show 8 tools initially (perfect for 4-column desktop grids)
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    const savedTheme = localStorage.getItem('app_theme');
    if (savedTheme === 'light') {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    } else {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('app_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Reset pagination when user searches
  useEffect(() => {
    setVisibleCount(8);
  }, [searchTerm]);

  const allTools = [
    {
      href: "/net-worth-calculator",
      icon: <LineChart size={22} />,
      title: "Net Worth Calculator",
      description: "Calculate your exact wealth standing in Tanzania.",
      category: "Wealth Building",
      colorClass: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20"
    },
    {
      href: "/tra-car-import-duty-calculator-tanzania",
      icon: <Car size={22} />,
      title: "TRA Car Import Duty",
      description: "Estimate taxes for vehicle imports via TRA formulas.",
      category: "Taxes & Compliance",
      colorClass: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20"
    },
    {
      href: "/property-tax-calculator-tanzania",
      icon: <Home size={22} />,
      title: "Property Tax Calculator",
      description: "Calculate Stamp Duty and CGT for real estate.",
      category: "Real Estate",
      colorClass: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20"
    },
    {
      href: "/paye-calculator",
      icon: <Wallet size={22} />,
      title: "PAYE Calculator",
      description: "Calculate your exact take-home pay after TRA deductions.",
      category: "Taxes & Compliance",
      colorClass: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20"
    },
    {
      href: "/freelance-invoice-calculator",
      icon: <Receipt size={22} />,
      title: "Freelance Invoice Strategy",
      description: "Reverse-engineer your freelance invoice for VAT & WHT.",
      category: "Taxes & Compliance",
      colorClass: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 border-violet-100 dark:border-violet-500/20"
    },
    {
      href: "/gross-salary-calculator",
      icon: <Target size={22} />,
      title: "Gross Salary Target",
      description: "Reverse-engineer your dream net salary for negotiations.",
      category: "Income",
      colorClass: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20"
    },
    {
      href: "/budget-calculator",
      icon: <Calculator size={22} />,
      title: "Zero-Based Budget",
      description: "Generate a strict, optimized 50/30/20 spending plan.",
      category: "Budgeting",
      colorClass: "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 border-sky-100 dark:border-sky-500/20"
    },
    {
      href: "/depreciation-calculator",
      icon: <Building size={22} />,
      title: "Asset Depreciation",
      description: "Calculate capital allowance per Tanzanian tax law.",
      category: "Assets",
      colorClass: "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 border-teal-100 dark:border-teal-500/20"
    },
    {
      href: "/compound-interest-calculator",
      icon: <TrendingUp size={22} />,
      title: "Compound Interest",
      description: "Project investment growth over time with compounding.",
      category: "Wealth Building",
      colorClass: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20"
    },
    {
      href: "/debt-payoff-calculator",
      icon: <TrendingDown size={22} />,
      title: "Debt Payoff Strategy",
      description: "Strategize the fastest way to become debt-free.",
      category: "Budgeting",
      colorClass: "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 border-cyan-100 dark:border-cyan-500/20"
    },
    {
      href: "/emergency-fund-calculator",
      icon: <Shield size={22} />,
      title: "Emergency Fund",
      description: "Determine cash needed for unexpected life events.",
      category: "Wealth Building",
      colorClass: "text-[#8B5CF6] dark:text-[#8B5CF6] bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20"
    }
  ];

  // Filtering logic
  const filteredTools = allTools.filter(tool => 
    tool.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const displayedTools = filteredTools.slice(0, visibleCount);
  const hasMoreTools = filteredTools.length > visibleCount;

  return (
    <main className={`min-h-screen flex flex-col bg-slate-50 dark:bg-[#0A0A0E] text-slate-900 dark:text-slate-50 relative overflow-hidden transition-colors duration-500 ${bodyFont.className}`}>
      
      {/* AMBIENT GLOW */}
      <div className="absolute top-0 inset-x-0 h-[500px] overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 dark:bg-indigo-500/15 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-8 pb-16 flex-grow w-full">
        
        {/* NAV */}
        <nav className="flex items-center justify-between mb-16">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-white dark:bg-[#12121A] px-4 py-2 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm active:scale-95">
            <ArrowLeft size={16} /> Back to Home
          </Link>

          <button 
            onClick={toggleTheme} 
            className="p-2.5 rounded-2xl bg-white dark:bg-[#12121A] border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-[#1A1A24] transition-all active:scale-90"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>

        {/* HEADER */}
        <header className="mb-12 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">NOVA APP LIBRARY</span>
          </div>
          <h1 className={`${headerFont.className} text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white`}>
            Financial Tools & Calculators.
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Professional-grade planning tools tailored for the Tanzanian financial landscape. Completely free. No account required.
          </p>
        </header>

        {/* SEARCH BAR */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <Search size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Search for taxes, budgeting, assets..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-[#12121A] border border-slate-200 dark:border-white/10 rounded-full pl-14 pr-6 py-4 text-base font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* TOOLS GRID */}
        {displayedTools.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {displayedTools.map((tool, index) => (
                <Link 
                  key={index} 
                  href={tool.href} 
                  className="group bg-white dark:bg-[#111118]/60 backdrop-blur-sm border border-slate-200 dark:border-white/5 p-6 rounded-[1.5rem] hover:shadow-2xl hover:border-indigo-500/40 transition-all flex flex-col h-full relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${(index % 8) * 50}ms` }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${tool.colorClass}`}>
                      {tool.icon}
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">
                      {tool.category}
                    </span>
                  </div>
                  <h3 className={`${headerFont.className} text-lg font-bold text-slate-900 dark:text-white mb-2 tracking-tight`}>{tool.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 flex-grow">{tool.description}</p>
                  
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                    Launch Tool <ArrowRight size={12} />
                  </div>
                </Link>
              ))}
            </div>

            {/* 🚀 LOAD MORE BUTTON */}
            {hasMoreTools && (
              <div className="mt-12 flex justify-center">
                <button 
                  onClick={() => setVisibleCount(prev => prev + 8)}
                  className="group inline-flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-sm active:scale-95"
                >
                  <Plus size={16} className="text-indigo-500 group-hover:rotate-90 transition-transform duration-300" /> 
                  Load More Tools
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white/50 dark:bg-[#12121A]/50 rounded-[2rem] border border-slate-200 dark:border-white/5 backdrop-blur-sm">
            <Search size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className={`${headerFont.className} text-xl font-bold text-slate-900 dark:text-white mb-2`}>No tools found</h3>
            <p className="text-slate-500 dark:text-slate-400">We couldn't find a tool matching "{searchTerm}". Try another keyword.</p>
            <button onClick={() => setSearchTerm("")} className="mt-6 text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline">
              Clear Search
            </button>
          </div>
        )}

      </div>

      {/* FOOTER */}
      <footer className="w-full max-w-7xl mx-auto pt-16 pb-12 border-t border-slate-200 dark:border-white/5 z-10 px-6 mt-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-10 sm:gap-8 mb-12 text-left">
          
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={20} className="text-indigo-600 dark:text-indigo-400" />
              <span className={`${headerFont.className} font-bold text-xl text-slate-900 dark:text-white`}>Nova.</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
              Intelligent Wealth Management.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
              <Mail size={16} />
              Contact Support
            </Link>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Features</h4>
            <ul className="space-y-4 sm:space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li><Link href="/expense-tracker" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Expense Tracker</Link></li>
              <li><Link href="/net-worth-tracker" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Net Worth Tracker</Link></li>
              <li><Link href="/subscription-tracker" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Subscription Radar</Link></li>
              <li><Link href="/asset-tracker" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Asset Tracker</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Free Tools</h4>
            <ul className="space-y-4 sm:space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li><Link href="/property-tax-calculator-tanzania" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Property Tax Calculator</Link></li>
              <li><Link href="/paye-calculator" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">PAYE Take-Home Calculator</Link></li>
              <li><Link href="/tra-car-import-duty-calculator-tanzania" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">TRA Import Tool</Link></li>
              <li><Link href="/freelance-invoice-calculator" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Freelance Invoice Tool</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Company</h4>
            <ul className="space-y-4 sm:space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li><Link href="/blog" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Financial Blog</Link></li>
              <li><Link href="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-4 text-sm text-slate-500 pt-8 border-t border-slate-200 dark:border-white/5">
          <span>© {new Date().getFullYear()} Nova Financial. All rights reserved.</span>
          <div className="flex items-center gap-2 font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-500/20 w-fit">
            <Shield size={14} /> Bank-Grade Security
          </div>
        </div>
      </footer>
    </main>
  );
}