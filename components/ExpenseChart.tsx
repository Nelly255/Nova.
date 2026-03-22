"use client"; // Required for Recharts to work in Next.js App Router

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Dummy data for our trend
const data = [
  { day: 'Mon', expenses: 120 },
  { day: 'Tue', expenses: 350 },
  { day: 'Wed', expenses: 180 },
  { day: 'Thu', expenses: 420 },
  { day: 'Fri', expenses: 250 },
  { day: 'Sat', expenses: 310 },
  { day: 'Sun', expenses: 190 },
];

export default function ExpenseChart() {
  return (
    <div className="h-[350px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            {/* The glowing gradient effect */}
            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
          <XAxis 
            dataKey="day" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#a1a1aa', fontSize: 12 }} 
            dy={10} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#a1a1aa', fontSize: 12 }} 
            tickFormatter={(value) => `$${value}`} 
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
            itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
            cursor={{ stroke: '#27272a', strokeWidth: 2 }}
          />
          <Area 
            type="monotone" 
            dataKey="expenses" 
            stroke="#818cf8" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorExpenses)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}