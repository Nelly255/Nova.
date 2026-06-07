"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Calculator, X, TrendingDown, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function DepreciationReportModal({ asset, currencySymbol }: { asset: any, currencySymbol: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate exactly what the NEXT depreciation hit will be
  const rateDecimal = asset.depreciation_rate / 100;
  let nextDepreciation = asset.currentValue * rateDecimal;
  
  // Safeguard: Do not depreciate below the salvage value
  if (asset.currentValue - nextDepreciation < asset.salvage_value) {
    nextDepreciation = asset.currentValue - asset.salvage_value;
  }
  
  const isFullyDepreciated = nextDepreciation <= 0;
  const newProjectedNBV = asset.currentValue - nextDepreciation;

  const handleRecordDepreciation = async () => {
    if (isFullyDepreciated) return;
    setIsLoading(true);

    const newAccumulated = asset.accumulatedDepreciation + nextDepreciation;

    const { error } = await supabase
      .from("assets")
      .update({ accumulated_depreciation: newAccumulated })
      .eq("id", asset.id);

    setIsLoading(false);

    if (error) {
      console.error(error);
      alert("Failed to record depreciation.");
    } else {
      setIsOpen(false);
      window.location.reload(); 
    }
  };

  return (
    <>
      {/* Trigger Button - PATCHED for theme colors */}
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition py-3 rounded-xl font-medium flex justify-center items-center gap-2 text-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 mt-4 transition-colors"
      >
        <Calculator size={18} className="text-brand-500 dark:text-brand-400" /> Calculate Year-End
      </button>

      {isOpen && mounted && createPortal(
        /* Overlay Backdrop */
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 transition-colors">
          {/* Modal Card - PATCHED: White in light mode, slate-900 in dark */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 transition-colors">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/50 transition-colors shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-500 dark:text-brand-400 transition-colors">
                  <TrendingDown size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 transition-colors">{asset.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Annual Adjustment ({asset.depreciation_rate}%)</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              
              <div className="space-y-4 mb-8">
                {/* Current NBV Row */}
                <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700/50 transition-colors">
                  <span className="font-medium text-slate-600 dark:text-slate-300">Current Net Book Value</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{currencySymbol}{asset.currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>

                {/* Expense Row */}
                <div className="flex justify-between items-center p-4 bg-rose-50 dark:bg-rose-500/10 rounded-xl border border-rose-100 dark:border-rose-500/20 transition-colors">
                  <span className="font-medium text-rose-600 dark:text-rose-400">Depreciation Expense (This Year)</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">-{currencySymbol}{nextDepreciation.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
              </div>

              {/* Projected Summary Card */}
              <div className="bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/30 p-5 rounded-2xl flex justify-between items-center mb-6 shadow-sm transition-colors">
                <div>
                  <p className="text-xs text-brand-600 dark:text-brand-300 uppercase tracking-wider font-bold mb-1">Projected New NBV</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">After applying depreciation</p>
                </div>
                <h2 className="text-3xl font-bold text-brand-600 dark:text-brand-400">
                  {currencySymbol}{newProjectedNBV.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </h2>
              </div>

              {/* Action Button */}
              <button 
                onClick={handleRecordDepreciation}
                disabled={isFullyDepreciated || isLoading}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl transition-all flex justify-center items-center gap-2 disabled:opacity-50 shadow-[0_8px_20px_-6px_rgb(var(--brand-500)/0.6)] active:scale-95 disabled:active:scale-100 disabled:hover:translate-y-0"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : (isFullyDepreciated ? "Fully Depreciated" : "Record Annual Depreciation")}
              </button>

            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}