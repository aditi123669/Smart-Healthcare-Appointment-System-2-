import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar, 
  Clock, 
  ShoppingBag, 
  ClipboardList, 
  Bell, 
  ChevronRight, 
  Search,
  Plus,
  Activity,
  History,
  CheckCircle,
  AlertCircle,
  FileText,
  Users,
  User as UserIcon,
  Filter,
  X,
  Building2,
  MapPin
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { User, Appointment, Medicine } from "@/src/types";
import AutomatedNotificationTerminal from "../components/AutomatedNotificationTerminal";
import GoogleWorkspacePanel from "../components/GoogleWorkspacePanel";

export default function PatientDashboard({ user }: { user: User }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentFilter, setAppointmentFilter] = useState("Upcoming");
  const [loading, setLoading] = useState(true);
  
  // Reminders State
  const [reminders, setReminders] = useState([
    { id: 1, title: "Morning Pill", time: "08:00 AM", frequency: "Daily", checked: true },
    { id: 2, title: "Afternoon Pill", time: "02:00 PM", frequency: "Daily", checked: false },
    { id: 3, title: "Evening Workout", time: "06:30 PM", frequency: "Mon, Wed, Fri", checked: false },
  ]);
  
  const [isAddingReminder, setIsAddingReminder] = useState(false);
  const [newReminder, setNewReminder] = useState({ title: "", time: "", frequency: "Daily" });
  const [confirmation, setConfirmation] = useState("");

  useEffect(() => {
    fetch("/api/appointments")
      .then(res => res.json())
      .then(data => {
        setAppointments(data);
        setLoading(false);
      });
  }, []);

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminder.title || !newReminder.time) return;

    const reminder = {
      id: Date.now(),
      ...newReminder,
      checked: false
    };

    setReminders([...reminders, reminder]);
    setNewReminder({ title: "", time: "", frequency: "Daily" });
    setIsAddingReminder(false);
    setConfirmation("Reminder added successfully!");
    
    setTimeout(() => setConfirmation(""), 3000);
  };

  const toggleReminder = (id: number) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, checked: !r.checked } : r));
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Dashboard Sticky Header */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800">My Dashboard</h1>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              Patient Account
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-primary transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold">
              {user.name.charAt(0)}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Summary & Actions */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Welcome Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-[32px] shadow-soft border border-slate-100 relative overflow-hidden"
            >
              <div className="relative z-10 space-y-4">
                <h2 className="text-3xl font-bold text-slate-900">Welcome back, <span className="text-primary">{user.name}</span>!</h2>
                <p className="text-slate-500 max-w-md">You have {appointments.filter(a => a.status === "Upcoming").length} upcoming appointments this week. Stay healthy!</p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Link to="/book-appointment" className="px-6 py-3 bg-primary text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                    <Plus size={18} />
                    Book New Appointment
                  </Link>
                  <Link to="/store" className="px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all">
                    <ShoppingBag size={18} />
                    Visit Pharmacy
                  </Link>
                </div>
              </div>
              <Activity size={120} className="absolute -right-8 -bottom-8 text-primary/5 -rotate-12" />
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Heart Rate" value="72 bpm" sub="Normal" icon={<Activity className="text-red-500" />} color="bg-red-50" />
              <StatCard label="Blood Pressure" value="120/80" sub="Healthy" icon={<CheckCircle className="text-blue-500" />} color="bg-blue-50" />
              <StatCard label="Sleep" value="7.5 hrs" sub="Good" icon={<Clock className="text-purple-500" />} color="bg-purple-50" />
              <StatCard label="Steps" value="6,432" sub="Goal: 10k" icon={<Users className="text-orange-500" />} color="bg-orange-50" />
            </div>

            {/* Upcoming Appointments */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-xl font-bold text-slate-900">
                  {appointmentFilter === "All" ? "All Appointments" : `${appointmentFilter} Appointments`}
                </h3>
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors" />
                    <select 
                      value={appointmentFilter}
                      onChange={(e) => setAppointmentFilter(e.target.value)}
                      className="pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer hover:border-primary/40 transition-all"
                    >
                      <option value="All">All Status</option>
                      <option value="Upcoming">Upcoming</option>
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
                  </div>
                  <Link to="/full-history?status=Upcoming" className="text-sm font-bold text-primary hover:underline">View All</Link>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {loading ? (
                   [1,2].map(i => <div key={i} className="h-24 bg-white animate-pulse rounded-2xl border border-slate-100" />)
                ) : appointments.filter(a => appointmentFilter === "All" ? true : a.status === appointmentFilter).length > 0 ? (
                  appointments.filter(a => appointmentFilter === "All" ? true : a.status === appointmentFilter).map(app => (
                    <motion.div 
                      key={app.id}
                      whileHover={{ scale: 1.01 }}
                      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center gap-6"
                    >
                      <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center text-slate-400">
                        {app.doctorImage ? (
                          <img src={app.doctorImage} className="w-full h-full object-cover" alt={app.doctorName} referrerPolicy="no-referrer" />
                        ) : (
                          <UserIcon size={32} />
                        )}
                      </div>
                      <div className="flex-1 text-center sm:text-left space-y-1 min-w-0">
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                          <h4 className="font-bold text-slate-800 text-lg truncate">{app.doctorName || "Doctor"}</h4>
                          <span className={cn(
                             "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border",
                             app.status === "Upcoming" ? "bg-blue-50 text-blue-600 border-blue-100" :
                             app.status === "Completed" ? "bg-green-50 text-green-600 border-green-100" :
                             app.status === "Pending" ? "bg-yellow-50 text-yellow-600 border-yellow-100" :
                             "bg-red-50 text-red-600 border-red-100"
                          )}>
                            {app.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 font-medium truncate">
                          {app.doctorSpecialty} • {app.doctorHospital}
                        </p>
                      </div>
                      <div className="flex items-center gap-8 pr-4">
                        <div className="text-right">
                          <p className="font-bold text-slate-900">{app.date}</p>
                          <p className="text-xs text-slate-500 font-bold">{app.time}</p>
                        </div>
                        <Link to={`/appointment/${app.id}`} className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
                          <ChevronRight size={20} />
                        </Link>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <EmptyState message={`No ${appointmentFilter.toLowerCase()} appointments`} sub="You're all caught up with your schedule." />
                )}
              </div>
            </section>

            {/* My Records Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                 <div className="space-y-1">
                   <h3 className="text-2xl font-black text-slate-900 tracking-tight">My Medical Records</h3>
                   <p className="text-sm text-slate-500 font-medium">Access your history, prescriptions, and lab results.</p>
                 </div>
                 <Link to="/full-history" className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center gap-2">
                   <History size={16} />
                   Full History
                 </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Past Appointments */}
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-soft overflow-hidden">
                   <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                         <Calendar size={18} />
                       </div>
                       <h4 className="font-bold text-slate-800">Past Visits</h4>
                     </div>
                     <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-500 uppercase tracking-wider">
                       {appointments.filter(a => a.status !== "Upcoming").length} records
                     </span>
                   </div>
                   <div className="divide-y divide-slate-50 max-h-[320px] overflow-y-auto no-scrollbar">
                     {appointments.filter(a => a.status !== "Upcoming").map(app => (
                       <div key={app.id} className="p-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
                         <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 flex-shrink-0 overflow-hidden">
                           {app.doctorImage ? (
                             <img src={app.doctorImage} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                           ) : (
                             <UserIcon size={18} />
                           )}
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className="text-sm font-bold text-slate-800 truncate">{app.doctorName}</p>
                           <p className="text-[10px] text-slate-500 font-medium truncate">{app.reason}</p>
                         </div>
                         <div className="text-right flex-shrink-0">
                           <p className="text-xs font-bold text-slate-900">{app.date}</p>
                           <span className={cn(
                             "text-[9px] font-black uppercase tracking-widest",
                             app.status === "Completed" ? "text-green-500" : "text-red-400"
                           )}>
                             {app.status}
                           </span>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>

                {/* Prescriptions */}
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-soft overflow-hidden">
                   <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                         <FileText size={18} />
                       </div>
                       <h4 className="font-bold text-slate-800">Prescriptions</h4>
                     </div>
                     <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-500 uppercase tracking-wider">
                       2 items
                     </span>
                   </div>
                   <div className="divide-y divide-slate-100 max-h-[320px] overflow-y-auto no-scrollbar">
                      <PrescriptionItem doc="Dr. Emily Williams" date="Apr 12, 2026" medicines={["Amoxicillin", "Paracetamol"]} />
                      <PrescriptionItem doc="Dr. Sarah Johnson" date="Mar 28, 2026" medicines={["Vitamin C", "Zinc"]} />
                   </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Records & Store Preview */}
          <div className="lg:col-span-4 space-y-8">
            {/* Health Tips */}
            <div className="bg-gradient-to-br from-primary to-blue-600 p-8 rounded-3xl text-white space-y-4 shadow-xl shadow-primary/20 relative overflow-hidden">
               <div className="relative z-10">
                 <h4 className="font-bold text-xl">Daily Health Tip</h4>
                 <p className="text-primary-light/90 text-sm italic">"Drinking at least 8 glasses of water a day keeps your kidneys healthy and your skin glowing."</p>
               </div>
               <AlertCircle size={80} className="absolute -right-4 -bottom-4 text-white/10" />
            </div>

            {/* Live Doctor Facility Tracker */}
            {(() => {
              const activeApp = appointments.find(a => a.status === "Upcoming" && a.hospitalLat);
              const targetHospital = activeApp?.doctorHospital || "City General Hospital";
              const targetAddress = activeApp?.hospitalAddress || "1001 Potrero Ave, San Francisco, CA 94110";
              const targetDoc = activeApp?.doctorName || "Dr. Sarah Johnson";
              const detailsLink = activeApp ? `/appointment/${activeApp.id}` : "/book-appointment";

              return (
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-soft space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                      <MapPin size={22} className="animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black tracking-widest text-primary uppercase block">Doctor Locator Status</span>
                      <h4 className="font-bold text-slate-900 leading-snug">Active Transit Mapping</h4>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Cabinet</p>
                      <p className="font-bold text-slate-800 text-sm">{targetDoc}</p>
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <Building2 size={12} className="shrink-0 animate-pulse text-primary" />
                        {targetHospital}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-500 space-y-1 font-medium">
                      <p className="font-bold text-slate-700">Clinic Address:</p>
                      <p className="text-[11px] leading-relaxed select-all">{targetAddress}</p>
                    </div>
                  </div>

                  <Link 
                    to={detailsLink} 
                    className="w-full py-3.5 bg-slate-900 text-white hover:bg-slate-800 transition-colors rounded-2xl text-center font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:shadow-slate-900/10 active:scale-[0.98] transition-all"
                  >
                    <span>Compute Live Route & Distance</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              );
            })()}

            {/* Automated Text/Email Reminders Simulation Dashboard */}
            <div className="mt-2 mb-8">
              <AutomatedNotificationTerminal appointments={appointments} />
            </div>

            {/* Google Workspace Clinicial Mail & Telemedicine Desk */}
            <div className="mt-2 mb-10">
              <GoogleWorkspacePanel 
                user={user} 
                appointments={appointments} 
                onAppointmentUpdated={() => {
                  fetch("/api/appointments")
                    .then(res => res.json())
                    .then((data: Appointment[]) => setAppointments(data));
                }} 
              />
            </div>

            {/* Reminder List */}
            <section className="space-y-4">
               <div className="flex items-center justify-between">
                 <h3 className="text-xl font-bold text-slate-900">Reminders</h3>
                 <button 
                  onClick={() => setIsAddingReminder(true)}
                  className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                 >
                   <Plus size={18} />
                 </button>
               </div>
               
               <AnimatePresence>
                 {confirmation && (
                   <motion.div 
                     initial={{ opacity: 0, y: -10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                     className="bg-green-50 border border-green-100 p-3 rounded-xl flex items-center gap-2 text-green-600 text-sm font-bold shadow-sm"
                   >
                     <CheckCircle size={16} />
                     {confirmation}
                   </motion.div>
                 )}
               </AnimatePresence>

               <div className="space-y-3">
                 {reminders.map(rem => (
                   <ReminderItem 
                    key={rem.id} 
                    title={rem.title} 
                    time={rem.time} 
                    frequency={rem.frequency}
                    checked={rem.checked} 
                    onToggle={() => toggleReminder(rem.id)}
                   />
                 ))}
               </div>
            </section>
          </div>
        </div>
      </div>

      {/* Add Reminder Modal */}
      <AnimatePresence>
        {isAddingReminder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingReminder(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-[32px] shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-slate-900">Add Reminder</h3>
                    <p className="text-sm text-slate-500 font-medium">Never miss a health task.</p>
                  </div>
                  <button 
                    onClick={() => setIsAddingReminder(false)}
                    className="p-2 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleAddReminder} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Reminder Title</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Taking Vitamins"
                      value={newReminder.title}
                      onChange={e => setNewReminder({...newReminder, title: e.target.value})}
                      className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-bold placeholder:font-medium"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Time</label>
                      <input 
                        type="time" 
                        required
                        value={newReminder.time}
                        onChange={e => setNewReminder({...newReminder, time: e.target.value})}
                        className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Frequency</label>
                      <select 
                        value={newReminder.frequency}
                        onChange={e => setNewReminder({...newReminder, frequency: e.target.value})}
                        className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                      >
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Bi-Weekly">Bi-Weekly</option>
                        <option value="Monthly">Monthly</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit"
                      className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all"
                    >
                      Create Reminder
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, sub, icon, color }: { label: string, value: string, sub: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-2">
      <div className={cn("p-3 rounded-xl mb-1", color)}>
        {icon}
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-xl font-black text-slate-900 tracking-tight">{value}</p>
      <p className="text-[10px] font-bold text-slate-500">{sub}</p>
    </div>
  );
}

function PrescriptionItem({ doc, date, medicines }: { doc: string, date: string, medicines: string[] }) {
  return (
    <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer">
      <div className="space-y-1 text-left">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-slate-400" />
          <h5 className="font-bold text-slate-800 text-sm">{doc}</h5>
        </div>
        <p className="text-xs text-slate-500 font-medium">Prescribed on {date}</p>
        <div className="flex gap-1 pt-1 text-left">
          {medicines.map(m => (
            <span key={m} className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-600">{m}</span>
          ))}
        </div>
      </div>
      <ChevronRight size={18} className="text-slate-300 group-hover:text-primary transition-colors" />
    </div>
  );
}

function ReminderItem({ title, time, frequency, checked, onToggle }: { title: string, time: string, frequency?: string, checked: boolean, onToggle: () => void, key?: React.Key }) {
  return (
    <div 
      onClick={onToggle}
      className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm cursor-pointer hover:border-primary/20 transition-all group"
    >
      <div className={cn(
        "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
        checked ? "bg-primary border-primary text-white" : "border-slate-200 group-hover:border-primary/40"
      )}>
        {checked && <CheckCircle size={14} />}
      </div>
      <div className="flex-1">
        <p className={cn("text-sm font-bold", checked ? "text-slate-400 line-through" : "text-slate-800")}>{title}</p>
        <div className="flex items-center gap-2">
           <p className="text-[10px] text-slate-500 font-bold tracking-tight">{time}</p>
           {frequency && (
             <>
               <span className="w-1 h-1 bg-slate-300 rounded-full" />
               <p className="text-[10px] text-slate-400 font-bold italic">{frequency}</p>
             </>
           )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message, sub }: { message: string, sub: string }) {
  return (
    <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center text-center space-y-4">
      <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center">
        <Calendar size={32} />
      </div>
      <div className="space-y-1">
        <p className="font-bold text-slate-800">{message}</p>
        <p className="text-sm text-slate-500 italic">{sub}</p>
      </div>
    </div>
  );
}
