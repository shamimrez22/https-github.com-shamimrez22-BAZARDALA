import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Download, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '../../components/ui/button';

const AdminAnalytics = () => {
  const salesData = [
    { name: 'Jan', revenue: 4000, orders: 240 },
    { name: 'Feb', revenue: 3000, orders: 198 },
    { name: 'Mar', revenue: 5000, orders: 305 },
    { name: 'Apr', revenue: 4500, orders: 280 },
    { name: 'May', revenue: 6000, orders: 390 },
    { name: 'Jun', revenue: 5500, orders: 340 },
  ];

  const categoryData = [
    { name: 'Electronics', value: 400 },
    { name: 'Fashion', value: 300 },
    { name: 'Home Decor', value: 300 },
    { name: 'Beauty', value: 200 },
  ];

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="bg-[#ead9c4] border-b border-[#777] p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-black text-[#9B2B2C] uppercase tracking-tight flex items-center gap-3">
            Sales <span className="text-slate-900">Analytics</span>
          </h1>
          <p className="text-slate-600 font-bold text-[10px] uppercase mt-1">
            Sales Intelligence Ledger // Operation Protocol 33 // Data Sync Active
          </p>
        </div>
        <div className="flex gap-3">
          <button className="h-10 px-6 bg-white border border-slate-200 text-slate-900 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95">
            <Filter className="mr-2 h-4 w-4" /> Date Filter
          </button>
          <button className="h-10 px-6 bg-brand-primary text-white font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:shadow-xl transition-all active:scale-95">
            <Download className="mr-2 h-4 w-4" /> Download Report
          </button>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend */}
        <div className="bg-white border border-slate-200 flex flex-col group hover:border-brand-primary transition-all">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Revenue Analysis</span>
            <div className="flex items-center text-emerald-600 text-[10px] font-black tracking-widest">
              <TrendingUp className="h-3 w-3 mr-1" /> +15.2% Growth
            </div>
          </div>
          <div className="p-8 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: '900' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: '900' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '0px', padding: '12px' }}
                  itemStyle={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', color: '#fff' }}
                  labelStyle={{ fontSize: '9px', fontWeight: '900', color: '#38bdf8', marginBottom: '4px' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 4, strokeWidth: 0, fill: '#0ea5e9' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white border border-slate-200 flex flex-col group hover:border-brand-primary transition-all">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Category Sales</span>
          </div>
          <div className="p-8 h-[300px] flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '0px', padding: '12px' }}
                    itemStyle={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-48 space-y-3">
              {categoryData.map((cat, i) => (
                <div key={i} className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest pb-2 border-b border-slate-50">
                  <div className="w-2 h-2" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-slate-400">{cat.name}</span>
                  <span className="text-slate-900 ml-auto">{cat.value}_NODE</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Volume */}
        <div className="lg:col-span-2 bg-white border border-slate-200 flex flex-col group hover:border-brand-primary transition-all">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Order Volume</span>
          </div>
          <div className="p-8 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: '900' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: '900' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '0px', padding: '12px' }}
                  itemStyle={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', color: '#fff' }}
                  labelStyle={{ fontSize: '9px', fontWeight: '900', color: '#38bdf8', marginBottom: '4px' }}
                />
                <Bar dataKey="orders" fill="#9B2B2C" radius={0} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
