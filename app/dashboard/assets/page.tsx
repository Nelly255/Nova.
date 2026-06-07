"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";
import AddAssetModal from "@/components/AddAssetModal";
import { Laptop, Car, Home, Camera, Briefcase, Trash2, TrendingDown, CalendarDays, BarChart3, ChevronDown, ChevronLeft, ChevronRight, Info, X, Lightbulb, Percent, Clock, Tag, ArrowRight, Wallet, CreditCard, Gift, Edit2, Loader2, Check } from "lucide-react";

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
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState("TSh ");
  
  const [activeTab, setActiveTab] = useState<'active' | 'sold'>('active');
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const isCurrentYear = selectedYear === new Date().getFullYear();
  
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6; 

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ 
    id: "", name: "", purchase_price: "", purchase_date: "", depreciation_rate: "", salvage_value: "" 
  });

  useEffect(() => setMounted(true), []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [assetsRes, walletsRes] = await Promise.all([
      supabase.from("assets").select("*").order("purchase_date", { ascending: false }),
      supabase.from("accounts").select("*").eq('user_id', user.id)
    ]);
    
    if (walletsRes.data) {
      setWallets(walletsRes.data);
    }

    if (assetsRes.data) {
      const now = new Date();
      const isViewingCurrentYear = selectedYear === now.getFullYear();

      const calculatedAssets = assetsRes.data.map((asset) => {
        const purchaseDate = new Date(asset.purchase_date);
        const rate = Number(asset.depreciation_rate) / 100;
        const purchasePrice = Number(asset.purchase_price);
        const salvageValue = Number(asset.salvage_value) || 0;
        
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
          status: asset.status || 'active',
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
    setCurrencySymbol(savedCurrency === "USD" ? "$" : "TSh ");
    fetchData();

    window.addEventListener("assetUpdated", fetchData);
    return () => window.removeEventListener("assetUpdated", fetchData);
  }, [selectedYear]); 

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedYear, activeTab]); 

  const handleSell = async (id: string, price: number, disposeType: 'cash' | 'credit' | 'giveaway', walletId?: string) => {
    const assetToSell = assets.find(a => a.id === id);

    const { error } = await supabase
      .from("assets")
      .update({ 
        status: 'sold', 
        sold_price: price, 
        sold_date: new Date().toISOString() 
      })
      .eq("id", id);

    if (!error) {
      if (disposeType === 'cash' && walletId && assetToSell && price > 0) {
        const { error: txError } = await supabase
          .from("transactions")
          .insert([{
            title: `Sold: ${assetToSell.name}`,
            amount: price,
            date: new Date().toISOString(),
            type: 'income',
            category: 'Asset Sale',
            account_id: walletId
          }]);
          
        const selectedWallet = wallets.find(w => w.id === walletId);
        if (selectedWallet) {
          const newBalance = Number(selectedWallet.balance) + price;
          await supabase.from("accounts").update({ balance: newBalance }).eq("id", walletId);
        }

        if (txError) {
          console.error("Failed to log automated income transaction:", txError);
        } else {
          window.dispatchEvent(new Event("transactionUpdated"));
        }
      }

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
        const filteredForTab = newAssets.filter(a => a.status === activeTab);
        if (currentPage > Math.ceil(filteredForTab.length / ITEMS_PER_PAGE)) {
          setCurrentPage(Math.max(1, currentPage - 1));
        }
        return newAssets;
      });
    }
  };

  const openEditModal = (asset: any) => {
    setEditForm({
      id: asset.id,
      name: asset.name,
      purchase_price: asset.purchase_price.toString(),
      purchase_date: asset.purchase_date.split('T')[0],
      depreciation_rate: asset.depreciation_rate.toString(),
      salvage_value: asset.salvage_value ? asset.salvage_value.toString() : "0"
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(true);

    const { error } = await supabase
      .from("assets")
      .update({
        name: editForm.name,
        purchase_price: Number(editForm.purchase_price.replace(/,/g, '')),
        purchase_date: editForm.purchase_date,
        depreciation_rate: Number(editForm.depreciation_rate),
        salvage_value: Number(editForm.salvage_value.replace(/,/g, ''))
      })
      .eq("id", editForm.id);

    if (!error) {
      setIsEditModalOpen(false);
      fetchData(); 
    } else {
      console.error("Failed to update asset:", error);
    }
    setIsEditing(false);
  };

  const handleEditPriceChange = (field: 'purchase_price' | 'salvage_value', value: string) => {
    const rawValue = value.replace(/[^0-9.]/g, '');
    if (rawValue) {
      const parts = rawValue.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      setEditForm({ ...editForm, [field]: parts.join('.') });
    } else {
      setEditForm({ ...editForm, [field]: "" });
    }
  };

  const displayedAssets = assets.filter(asset => asset.status === activeTab);
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
              className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 text-brand-500 flex items-center justify-center hover:scale-110 hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-all cursor-pointer"
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
              className="flex items-center gap-2 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 rounded-2xl px-4 py-2.5 shadow-sm transition-all group hover:border-brand-500/50 cursor-pointer"
            >
              <CalendarDays size={18} className="text-brand-500 group-hover:scale-110 transition-transform" />
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
                      onClick={() => { setSelectedYear(y); setIsYearDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                        selectedYear === y ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
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

      {/* THE EDIT ASSET MODAL */}
      {isEditModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-0">
          <div 
            className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
            onClick={() => !isEditing && setIsEditModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md bg-white dark:bg-[#0A0A0E] rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-slate-200 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            
            <div className="flex justify-between items-center p-6 border-b border-zinc-200/80 dark:border-white/5 shrink-0 bg-slate-50/50 dark:bg-white/5">
              <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Edit2 size={20} className="text-brand-500" /> Edit Asset
              </h3>
              <button onClick={() => !isEditing && setIsEditModalOpen(false)} className="text-zinc-500 hover:text-rose-500 dark:text-zinc-400 p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-400 mb-1">Asset Name</label>
                <input 
                  required type="text" value={editForm.name} 
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})} 
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-400 mb-1">Purchase Price</label>
                  <div className="flex items-center bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl px-3 py-3 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 transition-colors">
                    <span className="text-slate-400 text-sm font-medium mr-1.5 whitespace-nowrap">{currencySymbol}</span>
                    <input 
                      required type="text" inputMode="numeric" value={editForm.purchase_price} 
                      onChange={(e) => handleEditPriceChange('purchase_price', e.target.value)} 
                      className="w-full bg-transparent text-slate-900 dark:text-slate-200 focus:outline-none" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-400 mb-1">Purchase Date</label>
                  <input 
                    required type="date" value={editForm.purchase_date} 
                    onChange={(e) => setEditForm({...editForm, purchase_date: e.target.value})} 
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors [color-scheme:light] dark:[color-scheme:dark]" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-400 mb-1">Depreciation (APR %)</label>
                  <div className="relative">
                    <input 
                      required type="number" step="0.1" value={editForm.depreciation_rate} 
                      onChange={(e) => setEditForm({...editForm, depreciation_rate: e.target.value})} 
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl px-4 py-3 pr-8 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors" 
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-400 mb-1">Salvage Value</label>
                  <div className="flex items-center bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl px-3 py-3 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 transition-colors">
                    <span className="text-slate-400 text-sm font-medium mr-1.5 whitespace-nowrap">{currencySymbol}</span>
                    <input 
                      type="text" inputMode="numeric" value={editForm.salvage_value} 
                      onChange={(e) => handleEditPriceChange('salvage_value', e.target.value)} 
                      className="w-full bg-transparent text-slate-900 dark:text-slate-200 focus:outline-none" 
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" disabled={isEditing} 
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl shadow-[0_8px_20px_-6px_rgb(var(--brand-500)/0.6)] transition-all duration-300 hover:-translate-y-0.5 active:scale-95 mt-4 flex justify-center items-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isEditing ? <Loader2 className="animate-spin" size={20} /> : "Update Asset"}
              </button>
            </form>
          </div>
        </div>
      , document.body)}

      {/* HELP MODAL PORTAL */}
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
                  <Briefcase className="text-brand-500" /> Asset Intelligence
                </h3>
              </div>
              <button onClick={() => setIsHelpOpen(false)} className="text-zinc-500 hover:text-rose-500 dark:text-zinc-400 p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto max-h-[70vh] space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 border border-brand-100 dark:border-brand-500/20">
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

      <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl w-fit border border-slate-200 dark:border-white/10 mt-8">
        <button 
          onClick={() => setActiveTab('active')} 
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'active' ? 'bg-white dark:bg-slate-800 shadow-sm text-brand-600 dark:text-brand-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
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
                  wallets={wallets}
                  selectedYear={selectedYear} 
                  isCurrentYear={isCurrentYear}
                  currencySymbol={currencySymbol} 
                  onDelete={handleDelete} 
                  onSell={handleSell} 
                  onEdit={openEditModal}
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
                    className="p-2 rounded-lg border border-white/80 dark:border-slate-700 text-slate-500 disabled:opacity-50 transition-colors bg-white/60 dark:bg-transparent shadow-sm"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 px-2">Page {currentPage} / {totalPages}</span>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-white/80 dark:border-slate-700 text-slate-500 disabled:opacity-50 transition-colors bg-white/60 dark:bg-transparent shadow-sm"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {!loading && activeAssetsOnly.length > 0 && activeTab === 'active' && (
        <div className="mt-10 glass-card p-8 rounded-[2rem] transition-colors overflow-hidden relative">
          <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-brand-50/80 dark:bg-brand-500/10 border border-brand-200/50 dark:border-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400 backdrop-blur-sm shadow-inner">
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
// ASSET CARD
// ==========================================
function AssetCard({ asset, wallets, selectedYear, isCurrentYear, currencySymbol, onDelete, onSell, onEdit }: any) {
  const [isSelling, setIsSelling] = useState(false);
  const [sellPrice, setSellPrice] = useState("");
  const [disposeType, setDisposeType] = useState<'cash' | 'credit' | 'giveaway'>('cash');
  
  const [selectedWalletId, setSelectedWalletId] = useState("");
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const selectedWallet = wallets.find((w: any) => w.id === selectedWalletId);
  
  const isSold = asset.status === 'sold';

  useEffect(() => {
    if (isSelling && wallets.length > 0 && !selectedWalletId) {
      setSelectedWalletId(wallets[0].id);
    }
  }, [isSelling, wallets]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9.]/g, '');
    if (rawValue) {
      const parts = rawValue.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      setSellPrice(parts.join('.'));
    } else {
      setSellPrice("");
    }
  };

  const handleConfirmSell = () => {
    if (disposeType !== 'giveaway' && !sellPrice) return;
    const numericPrice = disposeType === 'giveaway' ? 0 : Number(sellPrice.replace(/,/g, ''));
    onSell(asset.id, numericPrice, disposeType, selectedWalletId);
    setIsSelling(false);
  };

  const canSubmit = 
    disposeType === 'giveaway' ? true : 
    disposeType === 'credit' ? Boolean(sellPrice) :
    Boolean(sellPrice && selectedWalletId);

  return (
    <div className={`glass-card p-6 rounded-[2rem] transition duration-300 relative group flex flex-col justify-between ${isSold ? 'bg-slate-50/50 dark:bg-slate-900/30 border-emerald-500/20' : 'hover:bg-white/40 dark:hover:bg-white/5'}`}>
      
      {isSold && (
        <div className="absolute top-5 right-5 z-10">
          <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-200 dark:border-emerald-500/30">
            <Check size={12} /> SOLD
          </span>
        </div>
      )}

      {!isSold && (
        <>
          {isSelling ? (
            <div className="absolute inset-x-4 top-4 z-20 bg-white dark:bg-slate-800 p-4 rounded-[1.25rem] shadow-xl border border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-top-2">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3">How was it disposed?</p>
              
              <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl mb-4 border border-slate-200/50 dark:border-white/5">
                <button 
                  onClick={() => setDisposeType('cash')} 
                  className={`flex-1 flex items-center justify-center gap-1.5 text-[10px] font-bold py-2 rounded-lg transition-all ${disposeType === 'cash' ? 'bg-white dark:bg-slate-800 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                >
                  <Wallet size={12}/> Cash
                </button>
                <button 
                  onClick={() => setDisposeType('credit')} 
                  className={`flex-1 flex items-center justify-center gap-1.5 text-[10px] font-bold py-2 rounded-lg transition-all ${disposeType === 'credit' ? 'bg-white dark:bg-slate-800 shadow-sm text-brand-600 dark:text-brand-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                >
                  <CreditCard size={12}/> Credit
                </button>
                <button 
                  onClick={() => setDisposeType('giveaway')} 
                  className={`flex-1 flex items-center justify-center gap-1.5 text-[10px] font-bold py-2 rounded-lg transition-all ${disposeType === 'giveaway' ? 'bg-white dark:bg-slate-800 shadow-sm text-rose-600 dark:text-rose-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                >
                  <Gift size={12}/> Gift
                </button>
              </div>

              {disposeType === 'cash' && (
                <div className={`relative mb-3 ${isWalletOpen ? 'z-50' : 'z-40'}`}>
                  <button 
                    onClick={() => setIsWalletOpen(!isWalletOpen)} 
                    className="w-full flex justify-between items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-left focus:outline-none transition-colors"
                  >
                    <span className={`text-xs font-medium truncate pr-2 ${!selectedWallet ? 'text-slate-400' : 'text-slate-900 dark:text-slate-200'}`}>
                      {selectedWallet ? `${selectedWallet.name} (${currencySymbol}${Number(selectedWallet.balance).toLocaleString()})` : 'Deposit into wallet...'}
                    </span>
                    <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform duration-200 ${isWalletOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isWalletOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsWalletOpen(false)} />
                      <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl shadow-lg max-h-36 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-150">
                        {wallets.length === 0 ? (
                          <div className="px-3 py-2 text-xs text-slate-500 text-center">No wallets found</div>
                        ) : wallets.map((w: any) => (
                          <button 
                            key={w.id} 
                            onClick={() => { setSelectedWalletId(w.id); setIsWalletOpen(false); }} 
                            className={`w-full text-left px-3 py-2.5 text-xs transition-colors flex justify-between items-center ${selectedWalletId === w.id ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                          >
                            <span className="truncate pr-2">{w.name}</span>
                            <span className="opacity-70 shrink-0">{currencySymbol}{Number(w.balance).toLocaleString()}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {disposeType === 'credit' && (
                <div className="bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 p-3 rounded-xl mb-3 flex gap-2.5 items-start animate-in fade-in zoom-in duration-300">
                  <Lightbulb className="text-brand-500 dark:text-brand-400 shrink-0 mt-0.5" size={16} />
                  <p className="text-[10px] md:text-xs text-brand-900 dark:text-brand-300 leading-relaxed font-medium">
                    <strong className="block mb-1 text-brand-700 dark:text-brand-400">Nova Pro Tip</strong>
                    Don't forget to head over to the <strong>Debts & Loans</strong> tab later to log this as an "Owed To Me" record so you can track the collection!
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2">
                {disposeType !== 'giveaway' && (
                  <div className={`flex items-center flex-1 bg-white dark:bg-slate-900 border-2 rounded-xl px-3 py-1.5 transition-all animate-in fade-in zoom-in duration-200 ${disposeType === 'credit' ? 'border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/20' : 'border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/20'}`}>
                    <span className="text-slate-400 text-sm font-medium mr-1.5 whitespace-nowrap">{currencySymbol}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={sellPrice}
                      onChange={handlePriceChange}
                      className="w-full bg-transparent text-sm focus:outline-none text-slate-900 dark:text-white"
                      placeholder="0"
                      autoFocus
                    />
                  </div>
                )}
                
                <button disabled={!canSubmit} onClick={handleConfirmSell} className={`${disposeType === 'credit' ? 'bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50' : 'bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50'} disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-transform hover:scale-105 shrink-0 shadow-sm ${disposeType === 'giveaway' ? 'flex-1 py-2 font-bold text-sm' : 'w-9 h-9'}`} title="Confirm">
                  {disposeType === 'giveaway' ? 'Confirm Gift' : <ArrowRight size={16} />}
                </button>
                <button onClick={() => {setIsSelling(false); setDisposeType('cash');}} className={`bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-xl flex items-center justify-center transition-transform hover:scale-105 shrink-0 shadow-sm ${disposeType === 'giveaway' ? 'w-10 py-2' : 'w-9 h-9'}`} title="Cancel">
                  <X size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
              <button 
                onClick={() => setIsSelling(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 dark:bg-slate-800/80 hover:bg-brand-50 dark:hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold rounded-xl backdrop-blur-md transition-all shadow-sm border border-slate-200 dark:border-white/10"
              >
                <Tag size={14} /> Dispose
              </button>
              <button 
                onClick={() => onEdit(asset)}
                className="p-1.5 text-slate-400 hover:text-brand-600 dark:text-slate-500 dark:hover:text-brand-400 bg-white/80 dark:bg-slate-800/80 hover:bg-brand-100 dark:hover:bg-brand-500/10 rounded-xl backdrop-blur-md transition-all shadow-sm border border-slate-200 dark:border-white/10"
                title="Edit Asset"
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={() => onDelete(asset.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 bg-white/80 dark:bg-slate-800/80 hover:bg-rose-100 dark:hover:bg-rose-500/10 rounded-xl backdrop-blur-md transition-all shadow-sm border border-slate-200 dark:border-white/10"
                title="Delete Permanently"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {isSold && (
        <div className="absolute bottom-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
          <button 
            onClick={() => onEdit(asset)}
            className="p-2 text-slate-400 hover:text-brand-600 bg-white/50 dark:bg-black/20 hover:bg-brand-100 dark:hover:bg-brand-500/10 rounded-lg backdrop-blur-md transition-all"
            title="Edit Original Purchase"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => onDelete(asset.id)}
            className="p-2 text-slate-400 hover:text-rose-600 bg-white/50 dark:bg-black/20 hover:bg-rose-100 dark:hover:bg-rose-500/10 rounded-lg backdrop-blur-md transition-all"
            title="Delete Record"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      <div>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-50/80 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex items-center justify-center text-brand-500 dark:text-brand-400 shadow-sm backdrop-blur-sm transition-colors shrink-0">
            {getAssetIcon(asset.name)}
          </div>
          <div>
            <h3 className={`text-lg font-bold transition-colors line-clamp-1 ${isSold ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-slate-200'}`}>{asset.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
              {isSold ? `Disposed on ${new Date(asset.sold_date).toLocaleDateString()}` : `Purchased ${new Date(asset.purchase_date).toLocaleDateString()}`}
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
          
          {isSold ? (
            <div className="bg-emerald-50/80 dark:bg-emerald-500/10 rounded-xl border border-emerald-100/50 dark:border-emerald-500/20 transition-colors backdrop-blur-sm flex flex-row justify-between items-center p-3">
              <p className="text-emerald-700 dark:text-emerald-400/80 font-bold tracking-wide text-xs">
                {Number(asset.sold_price) === 0 ? "Given Away / Lost" : "Final Sale Price"}
              </p>
              {Number(asset.sold_price) > 0 && (
                <p className="font-bold text-emerald-700 dark:text-emerald-300 text-sm">
                  {currencySymbol}{Number(asset.sold_price).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              )}
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

              <div className="bg-brand-50/80 dark:bg-brand-500/10 rounded-xl border border-brand-100/50 dark:border-brand-500/20 transition-colors backdrop-blur-sm flex flex-row justify-between items-center p-3">
                <p className="text-brand-600 dark:text-brand-400/80 transition-colors font-medium tracking-wide text-xs">Current Value</p>
                <p className="font-bold text-brand-700 dark:text-brand-300 transition-colors text-sm">
                  {currencySymbol}{Number(asset.currentValue).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
            </>
          )}
        </div>
        
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
// FORECAST CHART (Premium Area Line Graph)
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

  // Math for SVG mapping (X: 0 to 100%, Y: 20% to 85%)
  const points = chartData.map((d, i) => {
    const x = (i / (chartData.length - 1)) * 100;
    const normalizedAmount = Math.max(d.amount, 0);
    const y = 85 - ((normalizedAmount / maxAmount) * 65);
    return { x, y, ...d };
  });

  // Generate smooth cubic bezier curve path
  let pathD = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const pPrev = points[i - 1];
    const pCurr = points[i];
    const cpX = (pPrev.x + pCurr.x) / 2;
    pathD += ` C ${cpX},${pPrev.y} ${cpX},${pCurr.y} ${pCurr.x},${pCurr.y}`;
  }
  const areaD = `${pathD} L 100,85 L 0,85 Z`;

  return (
    <div className="relative w-full h-[280px] mt-2 group/chart">
      {/* BACKGROUND SVG GRAPH */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(var(--brand-500))" stopOpacity="0.35" />
            <stop offset="100%" stopColor="rgb(var(--brand-500))" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        
        {/* Baseline / Floor */}
        <line x1="0" y1="85" x2="100" y2="85" stroke="currentColor" strokeOpacity="0.15" strokeWidth="0.2" vectorEffect="non-scaling-stroke" className="text-slate-500 dark:text-slate-400" strokeDasharray="1 1" />
        
        {/* Area Fill */}
        <path d={areaD} fill="url(#areaGradient)" className="transition-all duration-700 ease-in-out" />
        
        {/* Premium Stroke Line */}
        <path d={pathD} fill="none" stroke="rgb(var(--brand-500))" strokeWidth="3" vectorEffect="non-scaling-stroke" className="transition-all duration-700 ease-in-out drop-shadow-[0_6px_10px_rgb(var(--brand-500)/0.5)]" />
      </svg>
      
      {/* HTML INTERACTIVE OVERLAYS */}
      <div className="absolute inset-0 z-10">
        {points.map((p) => (
          <div key={p.year} className="absolute top-0 bottom-0 w-20 -ml-10 flex flex-col items-center group/point cursor-pointer" style={{ left: `${p.x}%` }}>
            
            {/* Tracking / Hover Line */}
            <div className="absolute top-[5%] bottom-[15%] w-px bg-brand-500/20 opacity-0 group-hover/point:opacity-100 transition-opacity duration-300" style={{ borderLeft: '1px dashed rgb(var(--brand-500))' }} />
            
            {/* Floating Tooltip */}
            <div 
              className="absolute opacity-0 group-hover/point:opacity-100 transition-all duration-300 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold py-2 px-3.5 rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] whitespace-nowrap z-20 pointer-events-none"
              style={{ top: `${p.y}%`, marginTop: '-44px' }}
            >
              -{currencySymbol}{formatCompactNumber(p.amount)}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900 dark:border-t-white"></div>
            </div>
            
            {/* Interactive Data Node (Dot) */}
            <div 
              className="absolute w-4 h-4 bg-white dark:bg-slate-900 border-[3.5px] border-brand-500 rounded-full transition-all duration-300 scale-75 group-hover/point:scale-125 group-hover/point:shadow-[0_0_15px_rgb(var(--brand-500)/0.7)] shadow-sm"
              style={{ top: `${p.y}%`, marginTop: '-8px' }}
            />
            
            {/* X-Axis Labels */}
            <div className="absolute bottom-2 text-sm font-extrabold text-slate-500 dark:text-slate-400 group-hover/point:text-brand-600 dark:group-hover/point:text-brand-400 transition-colors">
              {p.year}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}