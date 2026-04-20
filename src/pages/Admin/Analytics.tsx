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
    <div className="space-y-6">
      <div className="bg-[#ead9c4] border border-[#777] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#9B2B2C] uppercase tracking-tight flex items-center gap-3">
            Store <span className="text-slate-900">Analytics</span>
          </h1>
          <p className="text-slate-600 font-bold text-[10px] uppercase mt-1">
            Sales Performance // Performance Metrics
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-10 px-6 rounded-none bg-white border border-[#777] text-[10px] font-black uppercase hover:bg-[#ead9c4]">
            <Filter className="mr-2 h-4 w-4" /> Filter Range
          </Button>
          <Button className="h-10 px-6 rounded-none bg-[#9B2B2C] hover:bg-[#7a1f1f] text-white font-black text-[10px] uppercase tracking-widest">
            <Download className="mr-2 h-4 w-4" /> Export Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-[#ead9c4] border border-[#777] flex flex-col">
          <div className="p-4 bg-[#9B2B2C] text-white flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest">Revenue Over Time</span>
            <div className="flex items-center text-white text-[10px] font-black">
              <TrendingUp className="h-3 w-3 mr-1" /> +15.2%
            </div>
          </div>
          <div className="p-6 h-[300px] bg-white/20">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#777" strokeOpacity={0.2} />
                <XAxis dataKey="name" axisLine={{ stroke: '#777' }} tickLine={false} tick={{ fontSize: 10, fill: '#777', fontWeight: 'bold' }} />
                <YAxis axisLine={{ stroke: '#777' }} tickLine={false} tick={{ fontSize: 10, fill: '#777', fontWeight: 'bold' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ead9c4', border: '1px solid #777', borderRadius: '0px', padding: '10px' }}
                  itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#9B2B2C" strokeWidth={2} dot={{ r: 4, fill: '#9B2B2C', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-[#ead9c4] border border-[#777] flex flex-col">
          <div className="p-4 bg-[#9B2B2C] text-white">
            <span className="text-[10px] font-black uppercase tracking-widest">Sales by Category</span>
          </div>
          <div className="p-6 h-[300px] bg-white/20 flex flex-col md:flex-row items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4 md:mt-0 md:pr-4 w-full">
              {categoryData.map((cat, i) => (
                <div key={i} className="flex items-center gap-3 text-[10px] font-bold uppercase p-2 border-b border-[#777]/10">
                  <div className="w-2 h-2" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-slate-600">{cat.name}</span>
                  <span className="font-black text-[#9B2B2C] ml-auto">{cat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Volume */}
        <div className="lg:col-span-2 bg-[#ead9c4] border border-[#777] flex flex-col">
          <div className="p-4 bg-[#9B2B2C] text-white">
            <span className="text-[10px] font-black uppercase tracking-widest">Total Order Volume</span>
          </div>
          <div className="p-6 h-[300px] bg-white/20">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#777" strokeOpacity={0.2} />
                <XAxis dataKey="name" axisLine={{ stroke: '#777' }} tickLine={false} tick={{ fontSize: 10, fill: '#777', fontWeight: 'bold' }} />
                <YAxis axisLine={{ stroke: '#777' }} tickLine={false} tick={{ fontSize: 10, fill: '#777', fontWeight: 'bold' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ead9c4', border: '1px solid #777', borderRadius: '0px', padding: '10px' }}
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
