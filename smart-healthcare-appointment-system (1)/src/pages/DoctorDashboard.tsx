import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  Plus, 
  MoreVertical,
  Clipboard,
  Phone,
  Video,
  FileText,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Award,
  ChevronRight,
  ChevronDown,
  Layout,
  History,
  User as UserIcon,
  X,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Play,
  Download
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { User, Appointment, WaitingPatient, CallLog } from "@/src/types";
import VideoCallInterface from "../components/VideoCallInterface";
import GoogleWorkspacePanel from "../components/GoogleWorkspacePanel";

export default function DoctorDashboard({ user }: { user: User }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [waitingList, setWaitingList] = useState<WaitingPatient[]>([]);
  const [callHistory, setCallHistory] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [consultationTab, setConsultationTab] = useState<"waiting" | "history">("waiting");
  const [activeCallPatient, setActiveCallPatient] = useState<WaitingPatient | null>(null);
  const [playingRecording, setPlayingRecording] = useState<string | null>(null);
  const [doctorStatus, setDoctorStatus] = useState<"Online" | "Away" | "Offline">("Online");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const fetchConsultationData = () => {
    Promise.all([
      fetch("/api/appointments").then(res => res.json()),
      fetch("/api/doctor/waiting-list").then(res => res.json()),
      fetch("/api/doctor/call-history").then(res => res.json())
    ]).then(([appointmentsData, waitingListData, callHistoryData]) => {
      setAppointments(appointmentsData);
      setWaitingList(waitingListData);
      setCallHistory(callHistoryData);
    });
  };

  useEffect(() => {
    fetchConsultationData();
    setLoading(false);
  }, []);

  const handleStartCall = (patient: WaitingPatient) => {
    setActiveCallPatient(patient);
    setIsConsultationModalOpen(false);
    // Physically admit the patient (remove from waiting list)
    handleRemoveFromWaiting(patient.id);
  };

  const handleEndCall = () => {
    setActiveCallPatient(null);
    fetchConsultationData(); // Refresh data to show updated history if it were real
  };

  const handleRemoveFromWaiting = (id: string) => {
     fetch(`/api/doctor/waiting-list/${id}`, { method: 'DELETE' })
      .then(() => fetchConsultationData());
  };

  const handleChangePriority = (id: string, current: string) => {
     const nextPriority = current === "High" ? "Normal" : "High";
     fetch(`/api/doctor/waiting-list/${id}`, { 
       method: 'PATCH',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ priority: nextPriority })
     }).then(() => fetchConsultationData());
  };

  const stats = [
    { label: "Today's Appointments", value: "8", icon: <Calendar className="text-blue-500" />, sub: "3 completed" },
    { label: "Pending Reviews", value: "12", icon: <Clock className="text-orange-500" />, sub: "+2 new since 8am" },
    { label: "Total Patients", value: "1,284", icon: <Users className="text-green-500" />, sub: "+15 this month" },
    { label: "Doctor Rating", value: "4.9", icon: <Award className="text-purple-500" />, sub: "Based on 450 reviews" },
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800">Doctor Panel</h1>
            <div className="hidden sm:flex items-center gap-4">
              <div className="relative">
                <button 
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
                    doctorStatus === "Online" ? "bg-primary/5 border-primary/20 text-primary shadow-sm shadow-primary/5" : 
                    doctorStatus === "Away" ? "bg-orange-50 border-orange-200 text-orange-600" : 
                    "bg-slate-50 border-slate-200 text-slate-500"
                  )}
                >
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    doctorStatus === "Online" ? "bg-primary animate-pulse" : 
                    doctorStatus === "Away" ? "bg-orange-500" : 
                    "bg-slate-400"
                  )} />
                  {doctorStatus}
                  <ChevronDown size={14} className={cn("transition-transform duration-300", isStatusDropdownOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {isStatusDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsStatusDropdownOpen(false)} />
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full mt-2 left-0 w-36 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 p-1"
                      >
                        {(["Online", "Away", "Offline"] as const).map((status) => (
                          <button
                            key={status}
                            onClick={() => {
                              setDoctorStatus(status);
                              setIsStatusDropdownOpen(false);
                            }}
                            className={cn(
                              "w-full px-3 py-2 text-left text-xs font-bold rounded-xl transition-colors flex items-center gap-2",
                              doctorStatus === status ? "bg-slate-50 text-slate-900" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                            )}
                          >
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              status === "Online" ? "bg-primary" : 
                              status === "Away" ? "bg-orange-500" : 
                              "bg-slate-400"
                            )} />
                            {status}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <button className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">Schedule Settings</button>
             <button className="bg-primary text-white p-2 rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/10">
               <Plus size={20} />
             </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
            {stats.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-slate-50 rounded-2xl">{stat.icon}</div>
                  <TrendingUp size={16} className="text-green-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                </div>
                <p className="text-[10px] text-slate-500 font-bold">{stat.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Left Column: Appointments List */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Patient Queue</h2>
              <div className="flex items-center gap-4">
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" placeholder="Search patients..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-primary focus:border-primary focus:outline-none w-64" />
                </div>
                <button className="p-2 border border-slate-200 rounded-xl bg-white text-slate-500 hover:text-slate-900">
                  <Filter size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                 [1,2,3].map(i => <div key={i} className="h-24 bg-white animate-pulse rounded-2xl border border-slate-100" />)
              ) : appointments.length > 0 ? (
                appointments.map(app => (
                  <AppointmentListItem key={app.id} app={app} />
                ))
              ) : (
                <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-200">
                  <Clipboard size={48} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-500 font-medium">No appointments scheduled for today.</p>
                </div>
              )}
            </div>

            {/* Google Workspace Clinicial Mail & Telemedicine Desk */}
            <div className="mt-8">
              <GoogleWorkspacePanel 
                user={user} 
                appointments={appointments} 
                onAppointmentUpdated={fetchConsultationData} 
              />
            </div>
          </div>

          {/* Right Column: Schedule & Quick Info */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-6 rounded-3xl shadow-soft border border-slate-100 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">Daily Timeline</h3>
                <Link to="/schedule" className="text-xs font-bold text-primary">View Full</Link>
              </div>
              <div className="relative space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                <TimelineItem time="09:00 AM" title="Consultation" name="John Doe" color="bg-blue-500" />
                <TimelineItem time="10:30 AM" title="Medication Review" name="Anna Taylor" color="bg-orange-500" active />
                <TimelineItem time="12:00 PM" title="Break / Lunch" name="" color="bg-slate-300" />
                <TimelineItem time="02:30 PM" title="Surgery Checkup" name="Mike Ross" color="bg-purple-500" />
              </div>
            </div>

            {/* Tele-Consultation Portal */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white space-y-6 relative overflow-hidden group">
               <div className="relative z-10 space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="text-xl font-bold flex items-center gap-2">
                        Tele-Consultation
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      </h4>
                      <p className="text-slate-400 text-sm">Active virtual portal for digital consultations.</p>
                    </div>
                    <button 
                      onClick={() => {
                        setConsultationTab("history");
                        setIsConsultationModalOpen(true);
                      }}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                    >
                      <History size={20} />
                    </button>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                       <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">In Waiting</p>
                       <p className="text-2xl font-black">{waitingList.length} Patients</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                       <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Today's Avg</p>
                       <p className="text-2xl font-black">12m wait</p>
                    </div>
                 </div>

                 <button 
                  onClick={() => setIsConsultationModalOpen(true)}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-white hover:text-slate-900 transition-all shadow-xl shadow-primary/20"
                 >
                   <Video size={20} />
                   Start Virtual Session
                 </button>
               </div>
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                 <Video size={100} />
               </div>
            </div>

            {/* Waiting List Preview / Quick Actions */}
            {waitingList.length > 0 && (
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Next in Queue</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-bold">
                    {waitingList[0].name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-800">{waitingList[0].name}</h4>
                      <button 
                        onClick={() => handleChangePriority(waitingList[0].id, waitingList[0].priority)}
                        className={cn(
                          "text-[10px] font-bold py-0.5 px-2 rounded-full transition-all active:scale-95",
                          waitingList[0].priority === "High" ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                        )}
                      >
                        {waitingList[0].priority} Priority
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      <span className="font-bold text-slate-400 mr-1">Reason:</span>
                      <span className="italic">"{waitingList[0].reason}"</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => handleStartCall(waitingList[0])}
                    className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/10"
                  >
                    <Video size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Consultation Management Modal */}
      {isConsultationModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={() => setIsConsultationModalOpen(false)}
           />
           <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white w-full max-w-4xl max-h-[80vh] rounded-[40px] shadow-2xl relative z-10 overflow-hidden flex flex-col"
           >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                 <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Tele-Consultation Manager</h2>
                    <p className="text-sm text-slate-500 font-medium">Manage your virtual presence and patient queue.</p>
                 </div>
                 <button 
                  onClick={() => setIsConsultationModalOpen(false)}
                  className="p-2 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl transition-colors"
                 >
                   <X size={24} />
                 </button>
              </div>

              <div className="flex bg-slate-50 p-2 m-8 rounded-2xl shrink-0">
                 <button 
                  onClick={() => setConsultationTab("waiting")}
                  className={cn(
                    "flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all",
                    consultationTab === "waiting" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                 >
                   <Users size={18} />
                   Waiting List ({waitingList.length})
                 </button>
                 <button 
                  onClick={() => setConsultationTab("history")}
                  className={cn(
                    "flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all",
                    consultationTab === "history" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                 >
                   <History size={18} />
                   Call History
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
                 {consultationTab === "waiting" ? (
                    <div className="space-y-4">
                       {waitingList.map(patient => (
                          <div key={patient.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-between hover:bg-white hover:shadow-soft transition-all group">
                             <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-300 font-black text-xl">
                                   {patient.name.charAt(0)}
                                </div>
                                 <div className="space-y-1">
                                   <div className="flex items-center gap-3">
                                      <h4 className="font-bold text-slate-900">{patient.name}</h4>
                                      <button 
                                        onClick={() => handleChangePriority(patient.id, patient.priority)}
                                        className={cn(
                                          "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 hover:brightness-95",
                                          patient.priority === "High" ? "bg-red-50 text-red-500" : "bg-slate-100 text-slate-500"
                                        )}
                                        title="Click to toggle priority"
                                      >
                                        {patient.priority}
                                      </button>
                                   </div>
                                   <p className="text-xs text-slate-500 font-medium">
                                      <span className="text-slate-400 mr-2 font-bold uppercase text-[9px] tracking-widest">Reason for consult:</span>
                                      <span className="italic">"{patient.reason}"</span>
                                   </p>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1.5">
                                      <Clock size={12} />
                                      Waiting for {patient.waitTime}
                                   </p>
                                </div>
                             </div>
                             <div className="flex items-center gap-3">
                                <button 
                                  onClick={() => handleStartCall(patient)}
                                  className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-all hover:scale-105 active:scale-95"
                                >
                                   Admit to Call
                                </button>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                   <button 
                                    onClick={() => handleChangePriority(patient.id, patient.priority)}
                                    className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-orange-500 transition-colors"
                                    title="Toggle Priority"
                                   >
                                      <TrendingUp size={18} />
                                   </button>
                                   <button 
                                    onClick={() => handleRemoveFromWaiting(patient.id)}
                                    className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-red-500 transition-colors"
                                    title="Remove from Queue"
                                   >
                                      <XCircle size={18} />
                                   </button>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div className="space-y-4">
                       {callHistory.map(log => (
                          <div key={log.id} className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center justify-between">
                             <div className="flex items-center gap-6">
                                <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl relative group-history">
                                   {log.type === "Video" ? <Video size={24} /> : <Phone size={24} />}
                                   {log.recordingUrl && (
                                     <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" title="Recording available" />
                                   )}
                                </div>
                                <div className="space-y-1">
                                   <h4 className="font-bold text-slate-900">{log.patientName}</h4>
                                   <p className="text-xs text-slate-500 font-medium font-mono tracking-tight">Session duration: {log.duration}</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-8">
                                <div className="text-right space-y-1">
                                   <p className="text-sm font-bold text-slate-900">{log.date}</p>
                                   <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">{log.status}</span>
                                </div>
                                {log.recordingUrl && (
                                  <div className="flex items-center gap-2">
                                     <button 
                                      onClick={() => setPlayingRecording(log.recordingUrl!)}
                                      className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                                      title="Play Recording"
                                     >
                                        <Play size={18} fill="currentColor" />
                                     </button>
                                     <a 
                                      href={log.recordingUrl} 
                                      download 
                                      target="_blank"
                                      rel="no-referrer"
                                      className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 hover:text-slate-900 transition-all"
                                      title="Download Recording"
                                     >
                                        <Download size={18} />
                                     </a>
                                  </div>
                                )}
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>

              <div className="p-8 border-t border-slate-100 shrink-0 flex items-center justify-between bg-slate-50/50">
                 <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                       {[1,2,3].map(i => (
                         <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                           {i}
                         </div>
                       ))}
                    </div>
                    <p className="text-xs text-slate-500 font-medium italic">3 patients currently in your digital lobby.</p>
                 </div>
                 <button className="flex items-center gap-2 text-sm font-bold text-primary group">
                    View Comprehensive Logs
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                 </button>
              </div>
           </motion.div>
        </div>
      )}

      <AnimatePresence>
        {activeCallPatient && (
          <VideoCallInterface 
            patient={activeCallPatient} 
            onEndCall={handleEndCall} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {playingRecording && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setPlayingRecording(null)}
               className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-slate-900 w-full max-w-4xl aspect-video rounded-[32px] overflow-hidden shadow-2xl relative z-10 border border-white/10"
             >
                <div className="absolute top-6 right-6 z-20">
                   <button 
                    onClick={() => setPlayingRecording(null)}
                    className="p-3 bg-black/40 hover:bg-black/60 text-white rounded-2xl backdrop-blur-md transition-all"
                   >
                     <X size={24} />
                   </button>
                </div>
                <video 
                  src={playingRecording} 
                  controls 
                  autoPlay 
                  className="w-full h-full object-contain"
                />
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AppointmentListItem({ app }: { app: Appointment, key?: React.Key }) {
  return (
    <motion.div 
      whileHover={{ x: 4 }}
      className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group"
    >
      <div className="flex items-center gap-6">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center relative">
          <Users size={24} className="text-slate-400" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary border-2 border-white rounded-full" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-900">Patient #7342</h4>
            <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold text-slate-500 rounded uppercase">Video Call</span>
          </div>
          <p className="text-sm font-medium text-slate-500 italic">"Feeling persistent headache since 2 days"</p>
          <div className="flex items-center gap-4 pt-1">
             <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
               <Clock size={14} /> {app.time}
             </div>
             <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
               <ArrowRight size={14} /> {app.status}
             </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
          <FileText size={20} />
        </button>
        <button className="p-2 text-slate-400 hover:text-accent hover:bg-accent/10 rounded-xl transition-all">
          <CheckCircle size={20} />
        </button>
        <button className="p-2 text-slate-300 hover:text-slate-900 rounded-xl transition-all">
          <MoreVertical size={20} />
        </button>
      </div>
    </motion.div>
  );
}

function TimelineItem({ time, title, name, color, active }: { time: string, title: string, name: string, color: string, active?: boolean }) {
  return (
    <div className="relative pl-8 space-y-1">
      <div className={cn(
        "absolute left-[5px] top-1.5 w-3 h-3 rounded-full border-2 border-white ring-2 z-10",
        active ? "bg-primary ring-primary/20 scale-125" : "bg-slate-200 ring-slate-100"
      )} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{time}</p>
      <div className={cn(
        "p-4 rounded-2xl border",
        active ? "bg-primary/5 border-primary/20" : "bg-white border-slate-100"
      )}>
        <p className="text-sm font-bold text-slate-800">{title}</p>
        <p className="text-xs text-slate-500 font-medium">{name}</p>
      </div>
    </div>
  );
}
