"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

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

// 🚀 UPDATED: Added currencySymbol to the props and type definition
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
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);
  
  // Track which slice the user is hovering over
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("transactions").select("*").eq("type", "expense");

      if (!error && data) {
        // 1. Filter strictly by the time-machine dropdown AND rigorously ignore all internal transfers
        const periodTransactions = data.filter((t: any) => {
          const d = new Date(t.date);
          
          // Check both category and type fields to guarantee no transfers slip through
          const categoryName = (t.category || '').toLowerCase();
          const typeName = (t.type || '').toLowerCase();
          
          const isInternalTransfer = 
            categoryName === 'contra' || 
            categoryName === 'transfer' || 
            typeName === 'transfer';

          return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear && !isInternalTransfer;
        });

        // 2. Group the true spending by category
        const grouped: Record<string, number> = {};
        let total = 0;

        periodTransactions.forEach((t: any) => {
          grouped[t.category] = (grouped[t.category] || 0) + Number(t.amount);
          total += Number(t.amount);
        });

        // 3. Convert the grouped data into an array with percentages and colors
        const formattedData = Object.keys(grouped)
          .map((key, index) => ({
            category: key,
            amount: grouped[key],
            percentage: total > 0 ? (grouped[key] / total) * 100 : 0,
            color: COLORS[index % COLORS.length]
          }))
          .sort((a, b) => b.amount - a.amount); // Sort largest to smallest

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

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 w-full mt-6">
      
      {/* The Interactive SVG Doughnut */}
      <div className="relative w-40 h-40 shrink-0">
        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90 overflow-visible drop-shadow-xl">
          {chartData.map((data) => {
            // Magical SVG Math: r=15.9155 makes the circumference exactly 100
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
                className="transition-all duration-300 ease-out cursor-pointer origin-center"
                style={{ opacity: isFaded ? 0.3 : 1 }}
                onMouseEnter={() => setHoveredCategory(data.category)}
                onMouseLeave={() => setHoveredCategory(null)}
              />
            );
          })}
        </svg>

        {/* Floating Center Text */}
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
            className={`flex items-center justify-between text-sm transition-opacity duration-300 cursor-default ${hoveredCategory && hoveredCategory !== data.category ? 'opacity-30' : 'opacity-100'}`}
            onMouseEnter={() => setHoveredCategory(data.category)}
            onMouseLeave={() => setHoveredCategory(null)}
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
  );
}