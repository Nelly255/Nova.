"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";
import AddAssetModal from "@/components/AddAssetModal";
import { Laptop, Car, Home, Camera, Briefcase, Trash2, TrendingDown, CalendarDays, BarChart3, ChevronDown, ChevronLeft, ChevronRight, Info, X, Lightbulb, Percent, Clock, DollarSign, Check, Tag, ArrowRight } from "lucide-react";

const getAssetIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('car') || lower.includes('toyota') || lower.includes('honda') || lower.includes('vehicle')) return <Car size={24} />;
  if (lower.includes('mac') || lower.includes('pc') || lower.includes('laptop') || lower.includes('computer')) return <Laptop size={24} />;
  if (lower.includes('house') || lower.includes('property') || lower.includes('land')) return <Home size={24} />;
  if (lower.includes('camera') || lower.includes('lens')) return <Camera size={24} />;
  return <Briefcase size={24} />;
};

const formatCompactNumber = (number: number) => {
  if (!number) return "0";
  return new Intl.NumberFormat('en-US', {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(number);
};

export default function AssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState("$");
  
  // NEW: Tab State
  const [activeTab, setActiveTab] = useState<'active' | 'sold'>('active');
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const isCurrentYear = selectedYear === new Date().getFullYear();
  
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6; 

  useEffect(() => setMounted(true), []);

  const fetchAssets = async () => {
    // MODIFIED: Fetch ALL assets so we can switch tabs instantly
    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .order("purchase_date", { ascending: false });
    
    if (!error && data) {
      const now = new Date();
      const isViewingCurrentYear = selectedYear === now.getFullYear();

      const calculatedAssets = data.map((asset) => {
        const purchaseDate = new Date(asset.purchase_date);
        const rate = Number(asset.depreciation_rate) / 100;
        const purchasePrice = Number(asset.purchase_price);
        const salvageValue = Number(asset.salvage_value) || 0;
        
        // DAILY MATH LOGIC
        const targetDateEnd = isViewingCurrentYear ? now : new Date(selectedYear, 11, 31, 23, 59, 59);
        const targetDateStart = new Date(selectedYear, 0, 1);

        let currentValue = purchasePrice;
        let valueLostThisYear = 0;
        let totalAccumulatedLoss = 0;
        let dailyLoss = 0;

        if (targetDateEnd >= purchaseDate) {
          const daysOwnedEnd = (targetDateEnd.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24);
          const exactYearsOwnedEnd = daysOwnedEnd / 365.25;

          currentValue = purchasePrice * Math.pow(1 - rate, exactYearsOwnedEnd);
          if (currentValue < salvageValue) currentValue = salvageValue;

          let valueAtStart = purchasePrice;
          if (purchaseDate < targetDateStart) {
            const daysOwnedStart = (targetDateStart.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24);
            const exactYearsOwnedStart = daysOwnedStart / 365.25;
            valueAtStart = purchasePrice * Math.pow(1 - rate, exactYearsOwnedStart);
            if (valueAtStart < salvageValue) valueAtStart = salvageValue;
          }

          valueLostThisYear = Math.max(0, valueAtStart - currentValue);
          totalAccumulatedLoss = Math.max(0, purchasePrice - currentValue);

          const effectiveStartDate = purchaseDate > targetDateStart ? purchaseDate : targetDateStart;
          const daysActiveThisYear = Math.max(1, (targetDateEnd.getTime() - effectiveStartDate.getTime()) / (1000 * 60 * 60 * 24));
          dailyLoss = valueLostThisYear / daysActiveThisYear;
        }

        return {
          ...asset,
          status: asset.status || 'active', // Ensure old data defaults to active
          currentValue,
          valueLostThisYear,
          totalAccumulatedLoss,
          percentageLost: purchasePrice > 0 ? (totalAccumulatedLoss / purchasePrice) * 100 : 0,
          dailyLoss
        };
      });

      setAssets(calculatedAssets);
    }
    setLoading(false);
  };

  useEffect(() => {
    const savedCurrency = localStorage.getItem("app_currency");
    setCurrencySymbol(savedCurrency === "TZS" ? "TSh " : "$");
    fetchAssets();

    window.addEventListener("assetUpdated", fetchAssets);
    return () => window.removeEventListener("assetUpdated", fetchAssets);
  }, [selectedYear]); 

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedYear, activeTab]); // Reset page when changing tabs

  const handleSell = async (id: string, price: number) => {
    const { error } = await supabase
      .from("assets")
      .update({ 
        status: 'sold', 
        sold_price: price, 
        sold_date: new Date().toISOString() 
      })
      .eq("id", id);

    if (!error) {
      // MODIFIED: Update the state to 'sold' instead of removing it, so it jumps to the Sold tab
      setAssets((prev) => 
        prev.map(asset => 
          asset.id === id 
            ? { ...asset, status: 'sold', sold_price: price, sold_date: new Date().toISOString() } 
            : asset
        )
      );
    } else {
      console.error("Failed to sell asset:", error);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("assets").delete().eq("id", id);
    if (!error) {
      setAssets((prev) => {
        const newAssets = prev.filter((a) => a.id !== id);
        // Safely adjust pagination if we delete the last item on a page
        const filteredForTab = newAssets.filter(a => a.status === activeTab);
        if (currentPage > Math.ceil(filteredForTab.length / ITEMS_PER_PAGE)) {
          setCurrentPage(Math.max(1, currentPage - 1));
        }
        return newAssets;
      });
    }
  };

  // NEW: Filter assets based on the active tab
  const displayedAssets = assets.filter(asset => asset.status === activeTab);

  // Stats should only calculate based on ACTIVE assets
  const activeAssetsOnly = assets.filter(asset => asset.status === 'active');
  const totalCurrentValue = activeAssetsOnly.reduce((acc, asset) => acc + asset.currentValue, 0);
  const totalValueLostInYear = activeAssetsOnly.reduce((acc, asset) => acc + asset.valueLostThisYear, 0);

  const years = Array.from({ length: 11 }, (_, i) => 2020 + i);

  const totalPages = Math.max(1, Math.ceil(displayedAssets.length / ITEMS_PER_PAGE));
  const paginatedAssets = displayedAssets.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-8 md:p-10 max-w-6xl mx-auto space-y-8 pb-20 bg-transparent min-h-screen relative">
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 transition-colors">Your Assets</h1>
            <button 
              onClick={() => setIsHelpOpen(true)}
              className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-500 flex items-center justify-center hover:scale-110 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all cursor-pointer"
              title="Asset Intelligence Info"
            >
              <Info size={16} />
            </button>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">Track what you own and see how its value changes over time.</p>
        </div>
        
        <div className="flex items-center gap-3">
          
          <div className="relative z-50">
            <button 
              onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
              className="flex items-center gap-2 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 rounded-2xl px-4 py-2.5 shadow-sm transition-all group hover:border-indigo-500/50 cursor-pointer"
            >
              <CalendarDays size={18} className="text-indigo-500 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {selectedYear} Fiscal Year
              </span>
              <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isYearDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isYearDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-slate-900/5 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
                  onClick={() => setIsYearDropdownOpen(false)}
                />

                <div className="absolute right-0 top-full mt-2 z-50 w-48 bg-white/80 dark:bg-slate-900/80 backdrop-blur-[64px] border border-white/60 dark:border-white/10 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-2 animate-in fade-in zoom-in-95 origin-top-right duration-200 max-h-64 overflow-y-auto custom-scrollbar">
                  {years.map(y => (
                    <button 
                      key={y}
                      onClick={() => {
                        setSelectedYear(y);
                        setIsYearDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                        selectedYear === y 
                          ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                      {y} Fiscal Year
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <AddAssetModal />
        </div>
      </header>

      {/* 🚀 THE PROFESSIONAL HELP MODAL */}
      {isHelpOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-0">
          <div 
            className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
            onClick={() => setIsHelpOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg bg-white dark:bg-[#0A0A0E] rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-slate-200 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            
            <div className="flex justify-between items-center p-6 md:p-8 border-b border-zinc-200/80 dark:border-white/5 shrink-0 bg-slate-50/50 dark:bg-white/5">
              <div>
                <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                  <Briefcase className="text-indigo-500" /> Asset Intelligence
                </h3>
              </div>
              <button onClick={() => setIsHelpOpen(false)} className="text-zinc-500 hover:text-rose-500 dark:text-zinc-400 p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto max-h-[70vh] space-y-6">
              
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-500/20">
                  <TrendingDown size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Understanding Depreciation</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Depreciation is the accounting method used to measure the loss in value of a tangible asset over its useful lifespan. As physical assets experience wear and tear or become obsolete, their value naturally decreases. Tracking this ensures you understand your true Net Book Value (NBV).
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-500/20">
                  <Percent size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Standard Depreciation Rates</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Different asset classes depreciate at distinct speeds based on standard financial and tax guidelines. For instance, computing hardware depreciates rapidly (37.5%) due to technological advancement, whereas vehicles (25%) and property (5%) retain value for much longer.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-500/20">
                  <Clock size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Daily Pro-Rata Calculation</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Rather than applying a flat yearly deduction, Nova utilizes daily pro-rata mathematics. If you acquire an asset mid-year, its depreciation is calculated precisely from the exact date of purchase, providing a hyper-accurate, real-time reflection of your financial standing.
                  </p>
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-zinc-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
              <button 
                onClick={() => setIsHelpOpen(false)}
                className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold py-3.5 rounded-xl transition-all active:scale-95"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      , document.body)}

      {/* Stats Cards - ONLY show on Active Tab */}
      {activeTab === 'active' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
          <div className="glass-card p-8 rounded-[2rem] relative overflow-hidden flex justify-between items-center transition-colors">
            <div className="relative z-10">
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-1 transition-colors">Current Total Value ({selectedYear})</p>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-50 transition-colors">{currencySymbol}{totalCurrentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
            </div>
            <div className="w-16 h-16 rounded-full bg-emerald-50/80 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100/50 dark:border-emerald-500/20 text-emerald-500 dark:text-emerald-400 relative z-10 transition-colors backdrop-blur-sm">
              <Briefcase size={28} />
            </div>
          </div>
          
          <div className="glass-card p-8 rounded-[2rem] flex justify-between items-center transition-colors relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-1 transition-colors">
                Value Lost in {selectedYear} {isCurrentYear ? "(So Far)" : ""}
              </p>
              <h2 className="text-4xl font-bold text-rose-600 dark:text-rose-400 transition-colors">-{currencySymbol}{totalValueLostInYear.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
            </div>
            <div className="w-16 h-16 rounded-full bg-rose-50/80 dark:bg-rose-500/10 flex items-center justify-center border border-rose-100/50 dark:border-rose-500/20 text-rose-500 dark:text-rose-400 transition-colors backdrop-blur-sm relative z-10">
              <TrendingDown size={28} />
            </div>
          </div>
        </div>
      )}

      {/* NEW: Tab Navigation */}
      <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl w-fit border border-slate-200 dark:border-white/10 mt-8">
        <button 
          onClick={() => setActiveTab('active')} 
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'active' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Active Assets
        </button>
        <button 
          onClick={() => setActiveTab('sold')} 
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'sold' ? 'bg-white dark:bg-slate-800 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Sold History
        </button>
      </div>

      {/* Asset List */}
      <div className="mt-6">
        {loading ? (
          <p className="text-slate-500 transition-colors font-medium">Calculating valuations...</p>
        ) : displayedAssets.length === 0 ? (
          <div className="glass-card p-16 text-center rounded-[2rem] flex flex-col items-center transition-colors">
            {activeTab === 'active' ? (
              <>
                <Laptop size={48} className="mx-auto text-slate-400 dark:text-slate-600 mb-4 transition-colors" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200 transition-colors">No active assets</h3>
                <p className="text-slate-500 mt-2 transition-colors">Add your car, laptop, or camera to see its real-time value.</p>
              </>
            ) : (
              <>
                <Tag size={48} className="mx-auto text-emerald-400/50 dark:text-emerald-600/50 mb-4 transition-colors" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200 transition-colors">No sold history</h3>
                <p className="text-slate-500 mt-2 transition-colors">Assets you sell will appear here for your records.</p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedAssets.map((asset) => (
                <AssetCard 
                  key={asset.id} 
                  asset={asset} 
                  selectedYear={selectedYear} 
                  isCurrentYear={isCurrentYear}
                  currencySymbol={currencySymbol} 
                  onDelete={handleDelete} 
                  onSell={handleSell} 
                />
              ))}
            </div>

            {displayedAssets.length > ITEMS_PER_PAGE && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 mt-6 border-t border-white/50 dark:border-white/5 bg-white/40 dark:bg-white/5 transition-colors backdrop-blur-md rounded-2xl">
                <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 text-center sm:text-left">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, displayedAssets.length)} of {displayedAssets.length} assets
                </span>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-white/80 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white/60 dark:bg-transparent shadow-sm"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 px-2">
                    Page {currentPage} / {totalPages}
                  </span>
                  
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-white/80 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white/60 dark:bg-transparent shadow-sm"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Depreciation Forecast Chart - ONLY show on Active Tab */}
      {!loading && activeAssetsOnly.length > 0 && activeTab === 'active' && (
        <div className="mt-10 glass-card p-8 rounded-[2rem] transition-colors">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-indigo-50/80 dark:bg-indigo-500/10 border border-indigo-200/50 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 backdrop-blur-sm">
              <BarChart3 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 transition-colors">Expected Value Drop (5 Years)</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">Forecast of how much value your items will lose</p>
            </div>
          </div>
          
          <DepreciationForecastChart assets={activeAssetsOnly} currencySymbol={currencySymbol} formatCompactNumber={formatCompactNumber} />
        </div>
      )}

    </div>
  );
}

// ==========================================
// ASSET CARD (UPDATED TO FIX OVERLAP AND ADD COMMAS)
// ==========================================
function AssetCard({ asset, selectedYear, isCurrentYear, currencySymbol, onDelete, onSell }: any) {
  const [isSelling, setIsSelling] = useState(false);
  const [sellPrice, setSellPrice] = useState("");
  const isSold = asset.status === 'sold';

  // NEW: Handle input with commas
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Remove all non-digit characters
    const rawValue = e.target.value.replace(/[^0-9.]/g, '');
    
    // 2. Format with commas
    if (rawValue) {
      const parts = rawValue.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      setSellPrice(parts.join('.'));
    } else {
      setSellPrice("");
    }
  };

  const handleConfirmSell = () => {
    if (!sellPrice) return;
    // Strip the commas back out before saving to database
    const numericPrice = Number(sellPrice.replace(/,/g, ''));
    onSell(asset.id, numericPrice);
    setIsSelling(false);
  };

  return (
    <div className={`glass-card p-6 rounded-[2rem] transition duration-300 relative group flex flex-col justify-between overflow-hidden ${isSold ? 'bg-slate-50/50 dark:bg-slate-900/30 border-emerald-500/20' : 'hover:bg-white/40 dark:hover:bg-white/5'}`}>
      
      {/* SOLD BADGE */}
      {isSold && (
        <div className="absolute top-5 right-5 z-10">
          <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-200 dark:border-emerald-500/30">
            <Check size={12} /> SOLD
          </span>
        </div>
      )}

      {/* Dynamic Hover Buttons for Selling & Deleting (Only if active) */}
      {!isSold && (
        <>
          {isSelling ? (
            <div className="absolute inset-x-4 top-4 z-20 bg-white dark:bg-slate-800 p-4 rounded-[1.25rem] shadow-xl border border-indigo-500/30 animate-in fade-in slide-in-from-top-2">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Confirm Sale Price</p>
              <div className="flex items-center gap-2">
                
                {/* NEW: Flex wrapper fixes the overlap issue completely */}
                <div className="flex items-center flex-1 bg-slate-50 dark:bg-slate-900 border-2 border-indigo-500 rounded-xl px-3 py-2 focus-within:ring-4 focus-within:ring-indigo-500/20 transition-all">
                  <span className="text-slate-400 text-sm font-medium mr-1.5 whitespace-nowrap">{currencySymbol}</span>
                  <input
                    type="text" // Changed to text to support commas
                    inputMode="numeric" // Keeps the mobile number pad open
                    value={sellPrice}
                    onChange={handlePriceChange}
                    className="w-full bg-transparent text-sm focus:outline-none text-slate-900 dark:text-white"
                    placeholder="0"
                    autoFocus
                  />
                </div>
                
                {/* UI matches your screenshot perfectly */}
                <button onClick={handleConfirmSell} className="bg-emerald-500 hover:bg-emerald-600 text-white p-2.5 rounded-xl transition-colors shadow-sm" title="Confirm">
                  <ArrowRight size={18} />
                </button>
                <button onClick={() => setIsSelling(false)} className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 p-2.5 rounded-xl transition-colors shadow-sm" title="Cancel">
                  <X size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
              <button 
                onClick={() => setIsSelling(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl backdrop-blur-md transition-all shadow-sm border border-slate-200 dark:border-white/10"
                title="Mark as Sold"
              >
                <Tag size={14} /> Sell
              </button>
              <button 
                onClick={() => onDelete(asset.id)}
                className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 bg-white/80 dark:bg-slate-800/80 hover:bg-rose-100 dark:hover:bg-rose-500/10 rounded-xl backdrop-blur-md transition-all shadow-sm border border-slate-200 dark:border-white/10"
                title="Delete Permanently"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete button always available for sold items too, but placed bottom right */}
      {isSold && (
        <button 
          onClick={() => onDelete(asset.id)}
          className="absolute bottom-5 right-5 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all bg-white/50 dark:bg-black/20 p-2 rounded-lg backdrop-blur-md"
          title="Delete Record"
        >
          <Trash2 size={16} />
        </button>
      )}

      <div>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-50/80 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shadow-sm backdrop-blur-sm transition-colors shrink-0">
            {getAssetIcon(asset.name)}
          </div>
          <div>
            <h3 className={`text-lg font-bold transition-colors line-clamp-1 ${isSold ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-slate-200'}`}>{asset.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
              {isSold ? `Sold on ${new Date(asset.sold_date).toLocaleDateString()}` : `Purchased ${new Date(asset.purchase_date).toLocaleDateString()}`}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-5">
          <div className="bg-slate-50/80 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/5 transition-colors backdrop-blur-sm flex flex-row justify-between items-center p-3">
            <p className="text-slate-500 dark:text-slate-400 transition-colors font-medium tracking-wide text-xs">Original Price</p>
            <p className="font-semibold text-slate-700 dark:text-slate-300 transition-colors text-sm">
              {currencySymbol}{Number(asset.purchase_price).toLocaleString()}
            </p>
          </div>
          
          {/* If sold, highlight the sold price instead of current value */}
          {isSold ? (
            <div className="bg-emerald-50/80 dark:bg-emerald-500/10 rounded-xl border border-emerald-100/50 dark:border-emerald-500/20 transition-colors backdrop-blur-sm flex flex-row justify-between items-center p-3">
              <p className="text-emerald-700 dark:text-emerald-400/80 font-bold tracking-wide text-xs">Final Sale Price</p>
              <p className="font-bold text-emerald-700 dark:text-emerald-300 text-sm">
                {currencySymbol}{Number(asset.sold_price).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          ) : (
            <>
              <div className="bg-rose-50/80 dark:bg-rose-500/10 rounded-xl border border-rose-100/50 dark:border-rose-500/20 transition-colors backdrop-blur-sm flex flex-row justify-between items-center p-3">
                <div>
                  <p className="text-rose-600 dark:text-rose-400/80 transition-colors font-medium tracking-wide text-xs">Lost in '{selectedYear.toString().slice(-2)}</p>
                  {isCurrentYear && asset.dailyLoss > 0 && (
                    <p className="text-[10px] text-rose-500/70 font-semibold mt-0.5" title="This is how much money you lose every single day just by owning this!">Bleeding {currencySymbol}{asset.dailyLoss.toLocaleString(undefined, {maximumFractionDigits: 0})} / day</p>
                  )}
                </div>
                <p className="font-bold text-rose-700 dark:text-rose-300 transition-colors text-sm">
                  -{currencySymbol}{Number(asset.valueLostThisYear).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>

              <div className="bg-indigo-50/80 dark:bg-indigo-500/10 rounded-xl border border-indigo-100/50 dark:border-indigo-500/20 transition-colors backdrop-blur-sm flex flex-row justify-between items-center p-3">
                <p className="text-indigo-600 dark:text-indigo-400/80 transition-colors font-medium tracking-wide text-xs">Current Value</p>
                <p className="font-bold text-indigo-700 dark:text-indigo-300 transition-colors text-sm">
                  {currencySymbol}{Number(asset.currentValue).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
            </>
          )}
        </div>
        
        {/* Only show the depreciation progress bar if it's currently active */}
        {!isSold && (
          <div>
            <div className="flex justify-between text-xs mb-1 transition-colors">
              <span className="text-rose-600 dark:text-rose-400 font-medium transition-colors">Total Value Dropped</span>
              <span className="text-slate-500 dark:text-slate-400 transition-colors font-medium">{asset.percentageLost.toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100/80 dark:bg-slate-800/50 rounded-full overflow-hidden transition-colors shadow-inner backdrop-blur-sm border border-transparent dark:border-white/5">
              <div 
                className="h-full bg-rose-500 transition-all duration-1000 ease-out shadow-rose-500/50 shadow-[0_0_10px]" 
                style={{ width: `${Math.min(asset.percentageLost, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// FORECAST CHART
// ==========================================
function DepreciationForecastChart({ assets, currencySymbol, formatCompactNumber }: { assets: any[], currencySymbol: string, formatCompactNumber: any }) {
  const currentYear = new Date().getFullYear();
  const forecastYears = Array.from({ length: 5 }, (_, i) => currentYear + i);
  
  const chartData = forecastYears.map(year => {
    let totalDepreciationForYear = 0;

    assets.forEach(asset => {
      const purchaseDate = new Date(asset.purchase_date);
      const purchaseYear = purchaseDate.getFullYear();
      
      const rate = Number(asset.depreciation_rate) / 100;
      const purchasePrice = Number(asset.purchase_price);
      const salvageValue = Number(asset.salvage_value) || 0;
      
      if (year >= purchaseYear) {
        const yearsBefore = Math.max(0, year - purchaseYear);
        
        let openingValue = purchasePrice * Math.pow(1 - rate, yearsBefore);
        if (openingValue < salvageValue) openingValue = salvageValue;
        
        let closingValue = purchasePrice * Math.pow(1 - rate, yearsBefore + 1);
        if (closingValue < salvageValue) closingValue = salvageValue;

        totalDepreciationForYear += (openingValue - closingValue);
      }
    });

    return { year, amount: totalDepreciationForYear };
  });

  const maxAmount = Math.max(...chartData.map(d => d.amount), 1);

  return (
    <div className="h-64 flex items-end justify-between gap-2 sm:gap-6 pt-10">
      {chartData.map((data, index) => {
        const heightPercentage = Math.max((data.amount / maxAmount) * 100, 2); 
        
        return (
          <div key={data.year} className="relative flex flex-col items-center flex-1 h-full justify-end group">
            
            <div className="absolute -top-12 opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-300 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap z-10 pointer-events-none">
              -{currencySymbol}{formatCompactNumber(data.amount)}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-white"></div>
            </div>

            <div 
              className="w-full max-w-[4rem] bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-xl transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(99,102,241,0.3)] group-hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] group-hover:brightness-110"
              style={{ 
                height: `${heightPercentage}%`,
                animationDelay: `${index * 150}ms` 
              }}
            ></div>
            
            <div className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {data.year}
            </div>
          </div>
        );
      })}
    </div>
  );
}