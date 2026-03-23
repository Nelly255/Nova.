"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AddAssetModal from "@/components/AddAssetModal";
import { Laptop, Car, Home, Camera, Briefcase, Trash2, TrendingDown, CalendarDays, BarChart3, ChevronDown } from "lucide-react";

const getAssetIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('car') || lower.includes('toyota') || lower.includes('honda') || lower.includes('vehicle')) return <Car size={24} />;
  if (lower.includes('mac') || lower.includes('pc') || lower.includes('laptop') || lower.includes('computer')) return <Laptop size={24} />;
  if (lower.includes('house') || lower.includes('property') || lower.includes('land')) return <Home size={24} />;
  if (lower.includes('camera') || lower.includes('lens')) return <Camera size={24} />;
  return <Briefcase size={24} />;
};

export default function AssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState("$");
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

  const fetchAssets = async () => {
    const { data, error } = await supabase.from("assets").select("*").order("purchase_date", { ascending: false });
    
    if (!error && data) {
      const calculatedAssets = data.map((asset) => {
        const purchaseDate = new Date(asset.purchase_date);
        const purchaseYear = purchaseDate.getFullYear();
        
        // Safety checks to ensure we are doing math with real numbers
        const rate = Number(asset.depreciation_rate) / 100;
        const purchasePrice = Number(asset.purchase_price);
        const salvageValue = Number(asset.salvage_value) || 0;
        
        // 1. Calculate strictly based on FULL years passed (Math.floor is the magic fix here)
        const exactYears = (new Date().getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        const fullYearsOwned = Math.max(0, Math.floor(exactYears));

        // 2. Calculate Current NBV and enforce the Salvage Value floor
        let currentNBV = purchasePrice * Math.pow(1 - rate, fullYearsOwned);
        if (currentNBV < salvageValue) currentNBV = salvageValue;

        const totalAccumulated = purchasePrice - currentNBV;

        // 3. Calculate exact value lost in the specifically selected dropdown year
        let valueLostInSelectedYear = 0;
        if (selectedYear >= purchaseYear) {
          const yearsBeforeSelected = selectedYear - purchaseYear;
          
          let openingValueForYear = purchasePrice * Math.pow(1 - rate, yearsBeforeSelected);
          if (openingValueForYear < salvageValue) openingValueForYear = salvageValue;

          let closingValueForYear = purchasePrice * Math.pow(1 - rate, yearsBeforeSelected + 1);
          if (closingValueForYear < salvageValue) closingValueForYear = salvageValue;

          valueLostInSelectedYear = openingValueForYear - closingValueForYear;
        }

        return {
          ...asset,
          currentValue: currentNBV,
          valueLostThisYear: valueLostInSelectedYear,
          percentageLost: purchasePrice > 0 ? (totalAccumulated / purchasePrice) * 100 : 0,
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

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("assets").delete().eq("id", id);
    if (!error) setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  const totalCurrentValue = assets.reduce((acc, asset) => acc + asset.currentValue, 0);
  const totalValueLostInYear = assets.reduce((acc, asset) => acc + asset.valueLostThisYear, 0);

  const years = Array.from({ length: 11 }, (_, i) => 2020 + i);

  return (
    <div className="p-8 md:p-10 max-w-6xl mx-auto space-y-8 pb-20 bg-transparent min-h-screen relative">
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 transition-colors">Asset Depreciation</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">Track your Net Book Value and yearly tax write-offs.</p>
        </div>
        
        <div className="flex items-center gap-3">
          
          {/* Custom Frosted Glass Year Dropdown */}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-8 rounded-[2rem] relative overflow-hidden flex justify-between items-center transition-colors">
          <div className="relative z-10">
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-1 transition-colors">Total Net Book Value (Today)</p>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-50 transition-colors">{currencySymbol}{totalCurrentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          </div>
          <div className="w-16 h-16 rounded-full bg-emerald-50/80 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100/50 dark:border-emerald-500/20 text-emerald-500 dark:text-emerald-400 relative z-10 transition-colors backdrop-blur-sm">
            <Briefcase size={28} />
          </div>
        </div>
        
        <div className="glass-card p-8 rounded-[2rem] flex justify-between items-center transition-colors relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-1 transition-colors">Value Lost in {selectedYear}</p>
            <h2 className="text-4xl font-bold text-rose-600 dark:text-rose-400 transition-colors">-{currencySymbol}{totalValueLostInYear.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          </div>
          <div className="w-16 h-16 rounded-full bg-rose-50/80 dark:bg-rose-500/10 flex items-center justify-center border border-rose-100/50 dark:border-rose-500/20 text-rose-500 dark:text-rose-400 transition-colors backdrop-blur-sm relative z-10">
            <TrendingDown size={28} />
          </div>
        </div>
      </div>

      {/* Asset List */}
      <div className="mt-8">
        {loading ? (
          <p className="text-slate-500 transition-colors font-medium">Calculating valuations...</p>
        ) : assets.length === 0 ? (
          <div className="glass-card p-16 text-center rounded-[2rem] flex flex-col items-center transition-colors">
            <Laptop size={48} className="mx-auto text-slate-400 dark:text-slate-600 mb-4 transition-colors" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200 transition-colors">No assets tracked</h3>
            <p className="text-slate-500 mt-2 transition-colors">Add your car, laptop, or camera to see its real-time value.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset) => (
              <div key={asset.id} className="glass-card p-6 rounded-[2rem] hover:bg-white/40 dark:hover:bg-white/5 transition duration-300 relative group flex flex-col justify-between">
                
                <button 
                  onClick={() => handleDelete(asset.id)}
                  className="absolute top-4 right-4 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 bg-white/50 dark:bg-black/20 hover:bg-rose-100 dark:hover:bg-rose-500/10 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10 backdrop-blur-md"
                >
                  <Trash2 size={16} />
                </button>

                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50/80 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shadow-sm backdrop-blur-sm transition-colors">
                      {getAssetIcon(asset.name)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-200 transition-colors line-clamp-1">{asset.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">Purchased {new Date(asset.purchase_date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-50/80 dark:bg-white/5 p-3 rounded-xl border border-slate-200/50 dark:border-white/5 transition-colors backdrop-blur-sm">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 transition-colors font-medium">Purchase Price</p>
                      <p className="font-semibold text-slate-700 dark:text-slate-300 transition-colors truncate">{currencySymbol}{Number(asset.purchase_price).toLocaleString()}</p>
                    </div>
                    <div className="bg-indigo-50/80 dark:bg-indigo-500/10 p-3 rounded-xl border border-indigo-100/50 dark:border-indigo-500/20 transition-colors backdrop-blur-sm">
                      <p className="text-xs text-indigo-600 dark:text-indigo-400/80 mb-1 transition-colors font-medium">Today's NBV</p>
                      <p className="font-bold text-indigo-700 dark:text-indigo-300 transition-colors truncate">{currencySymbol}{asset.currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1 transition-colors">
                      <span className="text-rose-600 dark:text-rose-400 font-medium transition-colors">All-time Loss</span>
                      <span className="text-slate-500 dark:text-slate-400 transition-colors font-medium">{asset.percentageLost.toFixed(1)}% Depreciated</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100/80 dark:bg-slate-800/50 rounded-full overflow-hidden transition-colors shadow-inner backdrop-blur-sm border border-transparent dark:border-white/5">
                      <div 
                        className="h-full bg-rose-500 transition-all duration-1000 ease-out shadow-rose-500/50 shadow-[0_0_10px]" 
                        style={{ width: `${Math.min(asset.percentageLost, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Depreciation Forecast Chart */}
      {!loading && assets.length > 0 && (
        <div className="mt-10 glass-card p-8 rounded-[2rem] transition-colors">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-indigo-50/80 dark:bg-indigo-500/10 border border-indigo-200/50 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 backdrop-blur-sm">
              <BarChart3 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 transition-colors">5-Year Depreciation Forecast</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">Projected loss across all assets</p>
            </div>
          </div>
          
          <DepreciationForecastChart assets={assets} currencySymbol={currencySymbol} />
        </div>
      )}

    </div>
  );
}

// ==========================================
// PATCHED NATIVE TAILWIND FORECAST CHART
// ==========================================
function DepreciationForecastChart({ assets, currencySymbol }: { assets: any[], currencySymbol: string }) {
  const currentYear = new Date().getFullYear();
  const forecastYears = Array.from({ length: 5 }, (_, i) => currentYear + i);
  
  const chartData = forecastYears.map(year => {
    let totalDepreciationForYear = 0;

    assets.forEach(asset => {
      const purchaseYear = new Date(asset.purchase_date).getFullYear();
      
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
              -{currencySymbol}{data.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
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