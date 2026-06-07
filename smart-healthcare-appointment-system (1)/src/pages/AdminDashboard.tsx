import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Users, 
  Calendar, 
  ShoppingBag, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  MoreVertical,
  Search,
  Bell,
  Settings,
  ShieldCheck,
  Stethoscope,
  Activity
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  AreaChart,
  Area
} from "recharts";
import { cn } from "@/src/lib/utils";
import { User } from "@/src/types";

const data = [
  { name: 'Mon', appointments: 40, orders: 24 },
  { name: 'Tue', appointments: 30, orders: 13 },
  { name: 'Wed', appointments: 20, orders: 98 },
  { name: 'Thu', appointments: 27, orders: 39 },
  { name: 'Fri', appointments: 18, orders: 48 },
  { name: 'Sat', appointments: 23, orders: 38 },
  { name: 'Sun', appointments: 34, orders: 43 },
];

export default function AdminDashboard({ user }: { user: User }) {
  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">System Administration</h1>
            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-black rounded uppercase">Super Admin</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="relative hidden md:block">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <input type="text" placeholder="Global search..." className="pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-sm border-transparent focus:bg-white focus:ring-2 focus:ring-primary/10 w-64" />
             </div>
             <Settings size={20} className="text-slate-400 hover:text-slate-900 cursor-pointer" />
             <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold">A</div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <AdminStatCard label="Total Patients" value="12,543" growth={12.5} icon={<Users className="text-blue-500" />} color="bg-blue-50" />
          <AdminStatCard label="Doctors" value="245" growth={4.2} icon={<Stethoscope className="text-purple-500" />} color="bg-purple-50" />
          <AdminStatCard label="Appointments" value="1,892" growth={-2.1} icon={<Calendar className="text-green-500" />} color="bg-green-50" />
          <AdminStatCard label="Total Revenue" value="$42,390" growth={8.4} icon={<ShoppingBag className="text-orange-500" />} color="bg-orange-50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[32px] shadow-soft border border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Health Platform Activity</h3>
                <p className="text-sm text-slate-500 italic">Weekly growth in appointments vs pharmacy orders</p>
              </div>
              <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-600 focus:ring-0">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorApp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500, fill: '#64748b' }} />
                  <Area type="monotone" dataKey="appointments" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorApp)" />
                  <Area type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={3} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Management */}
          <div className="bg-white p-8 rounded-[32px] shadow-soft border border-slate-100 space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Recent Doctor Signups</h3>
            <div className="space-y-4">
              <SignupItem name="Dr. Elena Gilbert" specialty="Dermatology" date="2h ago" />
              <SignupItem name="Dr. Stefan Salvatore" specialty="Psychiatry" date="5h ago" />
              <SignupItem name="Dr. Bonnie Bennett" specialty="Neurology" date="1d ago" />
              <SignupItem name="Dr. Caroline Forbes" specialty="Dental" date="1d ago" />
            </div>
            <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 font-bold hover:bg-slate-50 hover:border-primary/50 hover:text-primary transition-all">
              Verify New Applications (4)
            </button>
          </div>
        </div>

        {/* User Table */}
        <div className="bg-white rounded-[32px] shadow-soft border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Active User Base</h3>
            <button className="px-4 py-2 text-sm font-bold text-primary hover:bg-primary/5 rounded-xl transition-all">Export Report</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-8 py-4">User</th>
                  <th className="px-8 py-4">Role</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Activity</th>
                  <th className="px-8 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <TableRow name="Alex Rivers" email="alex@example.com" role="Patient" status="Active" activity="10 mins ago" />
                <TableRow name="Dr. Sarah J." email="sarah@med.com" role="Doctor" status="On Duty" activity="Online" />
                <TableRow name="Julian Moore" email="j@example.com" role="Patient" status="Inactive" activity="2 days ago" />
                <TableRow name="Lydia Martin" email="lydia@example.com" role="Patient" status="Active" activity="5 mins ago" />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminStatCard({ label, value, growth, icon, color }: { label: string, value: string, growth: number, icon: React.ReactNode, color: string }) {
  const isPositive = growth > 0;
  return (
    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 space-y-4">
      <div className="flex items-center justify-between">
        <div className={cn("p-3 rounded-2xl", color)}>{icon}</div>
        <div className={cn(
          "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg",
          isPositive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
        )}>
          {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(growth)}%
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-black text-slate-800">{value}</h3>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}

function SignupItem({ name, specialty, date }: { name: string, specialty: string, date: string }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400">
          {name.charAt(4)}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">{name}</p>
          <p className="text-xs text-slate-500 font-medium italic">{specialty}</p>
        </div>
      </div>
      <p className="text-[10px] font-bold text-slate-300">{date}</p>
    </div>
  );
}

function TableRow({ name, email, role, status, activity }: { name: string, email: string, role: string, status: string, activity: string }) {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-8 py-4">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400 text-xs">
            {name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{name}</p>
            <p className="text-[10px] text-slate-400 font-medium">{email}</p>
          </div>
        </div>
      </td>
      <td className="px-8 py-4 text-xs font-bold text-slate-600">{role}</td>
      <td className="px-8 py-4">
        <span className={cn(
          "px-2 py-1 rounded-lg text-[10px] font-black uppercase",
          status === "Active" || status === "On Duty" ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-400"
        )}>
          {status}
        </span>
      </td>
      <td className="px-8 py-4 text-xs font-medium text-slate-500 italic">{activity}</td>
      <td className="px-8 py-4">
        <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
          <MoreVertical size={18} />
        </button>
      </td>
    </tr>
  );
}
