"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, X, Receipt } from "lucide-react";

// Our premium brand palette for the pie slices
const COLORS = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#f43f5e", // Rose
  "#f59e0b", // Amber
  "#0ea5e9", // Sky
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#14b8a6", // Teal
];

export default function CategoryChart({ 
  selectedMonth, 
  selectedYear,
  currencySymbol 
}: { 
  selectedMonth: number; 
  selectedYear: number; 
  currencySymbol: string;
}) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);
  
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("transactions").select("*").eq("type", "expense");

      if (!error && data) {
        const periodTransactions = data.filter((t: any) => {
          const d = new Date(t.date);
          const categoryName = (t.category || '').toLowerCase();
          const typeName = (t.type || '').toLowerCase();
          const isInternalTransfer = categoryName === 'contra' || categoryName === 'transfer' || typeName === 'transfer';
          return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear && !isInternalTransfer;
        });

        setAllTransactions(periodTransactions);

        const grouped: Record<string, number> = {};
        let total = 0;

        periodTransactions.forEach((t: any) => {
          grouped[t.category] = (grouped[t.category] || 0) + Number(t.amount);
          total += Number(t.amount);
        });

        const formattedData = Object.keys(grouped)
          .map((key, index) => ({
            category: key,
            amount: grouped[key],
            percentage: total > 0 ? (grouped[key] / total) * 100 : 0,
            color: COLORS[index % COLORS.length]
          }))
          .sort((a, b) => b.amount - a.amount);

        setTotalSpent(total);
        setChartData(formattedData);
      }
      setLoading(false);
    };

    fetchCategories();
    window.addEventListener('transactionUpdated', fetchCategories);
    return () => window.removeEventListener('transactionUpdated', fetchCategories);
  }, [selectedMonth, selectedYear]);

  if (loading) {
    return (
      <div className="w-full h-full min-h-[200px] flex flex-col items-center justify-center text-indigo-500/50">
        <Loader2 className="animate-spin mb-2" size={24} />
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="w-full h-full min-h-[200px] flex items-center justify-center border-2 border-dashed border-slate-200/50 dark:border-white/5 rounded-2xl mt-4">
        <p className="text-sm font-medium text-slate-400 dark:text-slate-500">No spending data yet.</p>
      </div>
    );
  }

  let cumulativePercent = 0;

  const statementTransactions = selectedCategory 
    ? allTransactions.filter(t => t.category === selectedCategory).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  return (
    <>
      <div className="flex flex-col items-center justify-center h-full gap-6 w-full mt-6">
        
        {/* The Interactive SVG Doughnut */}
        <div className="relative w-40 h-40 shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90 overflow-visible drop-shadow-xl">
            {chartData.map((data) => {
              const dashArray = `${data.percentage} ${100 - data.percentage}`;
              const offset = -cumulativePercent;
              cumulativePercent += data.percentage;
              
              const isHovered = hoveredCategory === data.category;
              const isFaded = hoveredCategory && !isHovered;

              return (
                <circle
                  key={data.category}
                  r="15.9155"
                  cx="18"
                  cy="18"
                  fill="transparent"
                  stroke={data.color}
                  strokeWidth={isHovered ? "5" : "4"}
                  strokeDasharray={dashArray}
                  strokeDashoffset={offset}
                  className="transition-all duration-300 ease-out cursor-pointer origin-center hover:drop-shadow-lg"
                  style={{ opacity: isFaded ? 0.3 : 1 }}
                  onMouseEnter={() => setHoveredCategory(data.category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  onClick={() => setSelectedCategory(data.category)}
                />
              );
            })}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500">Total</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[80%]">
              {currencySymbol}{totalSpent >= 1000000 ? (totalSpent/1000000).toFixed(1) + 'M' : totalSpent.toLocaleString(undefined, {maximumFractionDigits: 0})}
            </span>
          </div>
        </div>

        {/* The Legend List */}
        <div className="w-full space-y-2.5 max-h-36 overflow-y-auto custom-scrollbar pr-2">
          {chartData.map((data) => (
            <div 
              key={data.category} 
              className={`flex items-center justify-between text-sm transition-all duration-300 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 ${hoveredCategory && hoveredCategory !== data.category ? 'opacity-30' : 'opacity-100'}`}
              onMouseEnter={() => setHoveredCategory(data.category)}
              onMouseLeave={() => setHoveredCategory(null)}
              onClick={() => setSelectedCategory(data.category)}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: data.color }}></div>
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{data.category}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-medium">
                  {currencySymbol}{data.amount >= 1000000 ? (data.amount/1000000).toFixed(1) + 'M' : data.amount.toLocaleString(undefined, {maximumFractionDigits: 0})}
                </span>
                <span className="font-bold text-slate-900 dark:text-white w-10 text-right">
                  {data.percentage.toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Statement Modal - Mobile Layout Fix */}
      {selectedCategory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#18181b] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-100 dark:border-white/10 ring-1 ring-black/5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-transparent">
              <div>
                <h3 className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight">
                  {selectedCategory}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Statement for selected period
                </p>
              </div>
              <button 
                onClick={() => setSelectedCategory(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-white hover:bg-slate-50 dark:bg-white/5 dark:hover:bg-white/10 rounded-full transition-all shadow-sm border border-slate-200 dark:border-transparent"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body - Transaction List */}
            <div className="p-3 sm:p-6 overflow-y-auto flex-1 custom-scrollbar space-y-2.5 sm:space-y-3">
              {statementTransactions.length > 0 ? (
                statementTransactions.map((t, i) => (
                  <div 
                    key={t.id || i} 
                    className="group flex justify-between items-center p-3 sm:p-3.5 bg-white dark:bg-white/[0.02] hover:bg-slate-50 hover:dark:bg-white/[0.04] border border-slate-100 dark:border-white/5 rounded-xl transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 overflow-hidden mr-3 sm:mr-4">
                      {/* Premium Icon Badge */}
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                        <Receipt size={16} strokeWidth={2.5} className="sm:w-[18px] sm:h-[18px]" />
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="font-semibold text-[13px] sm:text-sm text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {t.description || t.narration || t.name || 'Expense'}
                        </span>
                        <span className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5 uppercase tracking-wider">
                          {new Date(t.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-[13px] sm:text-sm text-slate-900 dark:text-white whitespace-nowrap shrink-0 tracking-tight">
                      {currencySymbol}{Number(t.amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 sm:py-12 text-slate-400 dark:text-slate-500 flex flex-col items-center gap-3">
                  <Receipt size={28} className="opacity-20 sm:w-8 sm:h-8" />
                  <span className="text-[13px] sm:text-sm font-medium">No transactions found.</span>
                </div>
              )}
            </div>
            
            {/* Modal Footer - Category Total */}
            <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-[#121214] flex flex-wrap gap-2 justify-between items-end pr-16 sm:pr-6">
              <div className="flex flex-col">
                <span className="font-medium text-slate-500 dark:text-slate-400 text-[11px] sm:text-xs tracking-wide uppercase mb-0.5 sm:mb-1">Total Spent</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 text-[13px] sm:text-sm">{selectedCategory}</span>
              </div>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xl sm:text-2xl tracking-tight whitespace-nowrap">
                {currencySymbol}
                {chartData.find(d => d.category === selectedCategory)?.amount.toLocaleString(undefined, { maximumFractionDigits: 2 }) || "0"}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}