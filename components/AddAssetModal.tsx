"use client";

import { useState } from "react";
import { Plus, X, Loader2, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";

const ASSET_CATEGORIES = [
  { label: "Computers & Data Equipment (37.5%)", value: "37.5" },
  { label: "Light Vehicles & Construction Equip (25%)", value: "25" },
  { label: "Heavy Vehicles, Machinery & Plant (12.5%)", value: "12.5" },
  { label: "Buildings & Structures (5%)", value: "5" }
];

export default function AddAssetModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    purchase_price: "", 
    purchase_date: "",
    depreciation_rate: "25", 
    salvage_value: "0", 
  });

  const formatAmountForDisplay = (value: string) => {
    if (!value) return "";
    const parts = value.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    let rawValue = e.target.value.replace(/[^0-9.]/g, "");
    
    const parts = rawValue.split(".");
    if (parts.length > 2) {
      rawValue = parts[0] + "." + parts.slice(1).join("");
    }

    setFormData({ ...formData, [field]: rawValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Explicitly grab the logged-in user to satisfy RLS
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to save an asset.");
      }

      // 2. Insert the data with the explicit user_id AND a fallback for your old 'value' column
      const { error } = await supabase.from("assets").insert([
        {
          user_id: user.id, // Explicitly hands the ID to the bouncer
          name: formData.name,
          purchase_price: parseFloat(formData.purchase_price),
          purchase_date: formData.purchase_date,
          depreciation_rate: parseFloat(formData.depreciation_rate),
          salvage_value: parseFloat(formData.salvage_value || "0"),
          value: parseFloat(formData.purchase_price) // Fills your old column just in case it's required!
        },
      ]);

      if (error) throw error; // If Supabase complains, throw it to the catch block!

      // 3. Success! Close modal and reset form
      setIsOpen(false);
      setFormData({
        name: "",
        purchase_price: "", 
        purchase_date: "",
        depreciation_rate: "25", 
        salvage_value: "0", 
      });
      window.dispatchEvent(new Event("assetUpdated")); 
      
    } catch (error: any) {
      // THE MAGIC FIX: This will now show you the EXACT database error in the alert!
      console.error("EXACT DATABASE ERROR:", error);
      alert(`Database Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-[0_8px_20px_-6px_rgba(99,102,241,0.6)] border border-white/20 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 text-xs md:text-sm"
      >
        <Plus size={16} /> <span className="hidden sm:inline">Add Asset</span><span className="sm:hidden">Add</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-slate-900/10 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => { setIsOpen(false); setIsCategoryOpen(false); }}
          />

          <div className="fixed left-4 right-4 top-24 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 z-50 sm:w-96 glass-card rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-visible animate-in fade-in zoom-in-95 origin-top sm:origin-top-right duration-200 flex flex-col max-h-[85vh]">
            
            <div className="flex justify-between items-center p-6 border-b border-zinc-200/80 dark:border-white/5 transition-colors shrink-0">
              <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 transition-colors">Add Depreciating Asset</h3>
              <button onClick={() => { setIsOpen(false); setIsCategoryOpen(false); }} className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5">
                <X size={20} />
              </button>
            </div>

            <form 
              onSubmit={handleSubmit} 
              className="p-6 space-y-4 overflow-y-visible custom-scrollbar"
            >
              <div>
                <label className="block text-sm font-semibold tracking-wide text-zinc-700 dark:text-zinc-400 mb-1 transition-colors">Asset Name</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g., MacBook Pro, Toyota Harrier"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold tracking-wide text-zinc-700 dark:text-zinc-400 mb-1 transition-colors">Asset Category (TRA Rate)</label>
                <button 
                  type="button"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="w-full flex justify-between items-center bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                >
                  <span className="truncate pr-2">
                    {ASSET_CATEGORIES.find(c => c.value === formData.depreciation_rate)?.label || "Select Category"}
                  </span>
                  <ChevronDown size={16} className={`text-zinc-400 shrink-0 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCategoryOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsCategoryOpen(false)} />
                    <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/80 dark:border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      {ASSET_CATEGORIES.map((cat) => (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, depreciation_rate: cat.value });
                            setIsCategoryOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${
                            formData.depreciation_rate === cat.value 
                            ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold' 
                            : 'hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          <span className="truncate">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold tracking-wide text-zinc-700 dark:text-zinc-400 mb-1 transition-colors">Purchase Price</label>
                  <input 
                    required
                    type="text" 
                    inputMode="decimal"
                    placeholder="e.g. 15,000,000"
                    value={formatAmountForDisplay(formData.purchase_price)}
                    onChange={(e) => handleNumberChange(e, "purchase_price")}
                    className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold tracking-wide text-zinc-700 dark:text-zinc-400 mb-1 transition-colors">Purchase Date</label>
                  <input 
                    required
                    type="date" 
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold tracking-wide text-zinc-700 dark:text-zinc-400 mb-1 transition-colors">End Salvage Value</label>
                <input 
                  required
                  type="text" 
                  inputMode="decimal"
                  placeholder="e.g., 0"
                  value={formatAmountForDisplay(formData.salvage_value)}
                  onChange={(e) => handleNumberChange(e, "salvage_value")}
                  className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-[0_8px_20px_-6px_rgba(99,102,241,0.6)] border border-white/20 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 font-bold py-3.5 rounded-xl mt-4 flex justify-center items-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Save Asset"}
              </button>
            </form>

          </div>
        </>
      )}
    </div>
  );
}