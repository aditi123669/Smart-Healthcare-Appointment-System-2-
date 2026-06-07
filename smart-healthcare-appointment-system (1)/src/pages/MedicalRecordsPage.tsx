import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  ExternalLink, 
  Calendar, 
  ChevronRight,
  ArrowLeft,
  Activity,
  History,
  ShieldCheck,
  Stethoscope
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Appointment } from "@/src/types";

export default function MedicalRecordsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("status");
    if (status) setActiveTab(status);

    fetch("/api/appointments")
      .then(res => res.json())
      .then(data => {
        setAppointments(data);
        setLoading(false);
      });
  }, [location.search]);

  const filteredRecords = activeTab === "All" 
    ? appointments 
    : appointments.filter(a => a.status === activeTab);

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <Link to="/dashboard" className="inline-flex items-center gap-2 text-primary text-sm font-bold mb-2 hover:gap-3 transition-all">
                <ArrowLeft size={16} />
                Back to Dashboard
              </Link>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                Medical Records
                <ShieldCheck size={32} className="text-primary" />
              </h1>
              <p className="text-slate-500 font-medium">Your complete health history, securely stored and accessible.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex-1 md:flex-none px-6 py-3 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all">
                <Download size={18} />
                Download All Records
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <div className="lg:w-80 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search records..." 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Filter by Status</h4>
                <div className="space-y-1">
                  {["All", "Completed", "Upcoming", "Cancelled"].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all",
                        activeTab === tab 
                          ? "bg-primary/10 text-primary" 
                          : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {tab}
                      <span className="text-[10px] bg-white border border-slate-100 px-2 py-0.5 rounded-full text-slate-400">
                        {tab === "All" ? appointments.length : appointments.filter(a => a.status === tab).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50">
                <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-4">
                   <Activity className="text-blue-500 shrink-0" size={20} />
                   <div className="space-y-1">
                     <p className="text-xs font-bold text-blue-900 leading-tight">Syncing with Partner Hospitals</p>
                     <p className="text-[10px] text-blue-700 font-medium">Your records from City General are automatically updated.</p>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Records List */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <History size={20} className="text-slate-400" />
              <h3 className="text-lg font-bold text-slate-800">History Log</h3>
            </div>

            <div className="space-y-4">
              {loading ? (
                [1,2,3,4].map(i => (
                  <div key={i} className="h-32 bg-white animate-pulse rounded-3xl border border-slate-100" />
                ))
              ) : filteredRecords.length > 0 ? (
                filteredRecords.map(record => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8 group"
                  >
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100 shrink-0">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        {record.date.split("-")[1] === "04" ? "APR" : "MAR"}
                      </span>
                      <span className="text-2xl font-black text-slate-900 tracking-tighter leading-none">
                        {record.date.split("-")[2]}
                      </span>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <h4 className="text-xl font-black text-slate-800 tracking-tight truncate">{record.doctorName}</h4>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border",
                          record.status === "Completed" ? "bg-green-50 text-green-600 border-green-100" :
                          record.status === "Upcoming" ? "bg-blue-50 text-blue-600 border-blue-100" :
                          "bg-red-50 text-red-600 border-red-100"
                        )}>
                          {record.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 font-medium italic flex items-center justify-center md:justify-start gap-2">
                        <Stethoscope size={14} />
                        {record.doctorSpecialty} • {record.doctorHospital}
                      </p>
                      <div className="flex items-center justify-center md:justify-start gap-4">
                        <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                          <FileText size={14} />
                          Reason: <span className="text-slate-700">{record.reason}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                       <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 hover:text-slate-900 transition-all border border-transparent hover:border-slate-200 group-hover:scale-105">
                         <Download size={20} />
                       </button>
                       <Link 
                        to={`/appointment/${record.id}`} 
                        className="px-6 py-3 bg-white border-2 border-slate-100 text-slate-700 rounded-2xl font-black text-sm hover:border-primary/20 hover:text-primary transition-all flex items-center gap-2 group-hover:shadow-lg group-hover:shadow-primary/5"
                       >
                         Details
                         <ExternalLink size={16} />
                       </Link>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="bg-white p-20 rounded-[40px] border border-dashed border-slate-200 text-center space-y-4">
                  <History size={64} className="mx-auto text-slate-200" />
                  <div className="space-y-1">
                    <p className="text-xl font-bold text-slate-800">No records found</p>
                    <p className="text-slate-500 max-w-xs mx-auto text-sm italic">Adjust your filters or book an appointment to start your history.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
