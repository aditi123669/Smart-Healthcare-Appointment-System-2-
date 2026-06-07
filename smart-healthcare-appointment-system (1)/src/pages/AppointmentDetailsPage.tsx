import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  User as UserIcon, 
  Building2, 
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  FileText,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  Phone,
  Mail,
  X,
  Info,
  Video,
  ExternalLink
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Appointment } from "@/src/types";
import DoctorLocationMap from "../components/DoctorLocationMap";
import { isWorkspaceConnected, googleSignIn, createGoogleMeetSpace } from "../lib/workspace";

export default function AppointmentDetailsPage({ user }: { user: any }) {
  const { id } = useParams();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchAppointment = () => {
    fetch("/api/appointments")
      .then(res => res.json())
      .then((data: Appointment[]) => {
        const found = data.find(a => a.id === id);
        setAppointment(found || null);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAppointment();
  }, [id]);

  const handleCancelClick = () => {
    setIsConfirmingCancel(true);
  };

  const confirmCancellation = async () => {
    try {
      const response = await fetch(`/api/appointments/${id}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setSuccessMessage("Appointment cancelled successfully!");
        setIsConfirmingCancel(false);
        fetchAppointment();
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        console.error("Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!appointment) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <AlertCircle size={64} className="text-slate-300 mb-4" />
      <h2 className="text-2xl font-bold text-slate-800">Appointment not found</h2>
      <Link to="/dashboard" className="text-primary font-bold mt-4 hover:underline">Back to Dashboard</Link>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40 py-6">
        <div className="container mx-auto px-4">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-500 font-bold text-sm mb-4 hover:text-primary transition-colors">
            <ArrowLeft size={16} />
            Back to Overview
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                  appointment.status === "Upcoming" ? "bg-blue-50 text-blue-600 border-blue-100" :
                  appointment.status === "Completed" ? "bg-green-50 text-green-600 border-green-100" :
                  "bg-red-50 text-red-600 border-red-100"
                )}>
                  {appointment.status}
                </span>
                <span className="text-xs text-slate-400 font-bold tracking-widest uppercase">Visit ID: #{appointment.id}</span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Appointment Details</h1>
            </div>
            
            <div className="flex gap-3">
              <button className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2">
                <FileText size={18} />
                Download Invoice
              </button>
              {appointment.status === "Upcoming" && (
                <button 
                  onClick={handleCancelClick}
                  className="px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-bold text-sm hover:bg-red-100 transition-all flex items-center gap-2"
                >
                  <X size={18} />
                  Cancel Visit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <AnimatePresence>
          {successMessage && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="bg-green-50 border border-green-200 p-6 rounded-3xl flex items-center gap-4 text-green-700 shadow-sm"
            >
              <div className="p-2 bg-green-500 text-white rounded-full">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="font-bold text-lg">Success!</p>
                <p className="text-sm font-medium">{successMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 space-y-8">
             {/* Main Info Card */}
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-white rounded-[40px] shadow-soft border border-slate-100 overflow-hidden"
             >
               <div className="p-10 space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-6">
                     <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medical Specialist</label>
                       <div className="flex items-center gap-4">
                         <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center">
                            {appointment.doctorImage ? (
                              <img src={appointment.doctorImage} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                            ) : (
                              <UserIcon size={24} className="text-slate-300" />
                            )}
                         </div>
                         <div>
                           <h3 className="text-xl font-bold text-slate-900 leading-tight">{appointment.doctorName}</h3>
                           <p className="text-sm text-primary font-bold flex items-center gap-1">
                             <Stethoscope size={14} />
                             {appointment.doctorSpecialty}
                           </p>
                         </div>
                       </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hospital Location</label>
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <Building2 size={24} className="text-slate-400" />
                          <div>
                            <p className="font-bold text-slate-800">{appointment.doctorHospital}</p>
                            <a 
                              href="#location-map" 
                              onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('location-map')?.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className="text-[10px] text-primary font-black uppercase tracking-wider hover:underline cursor-pointer"
                            >
                              View Map & Directions
                            </a>
                          </div>
                        </div>
                     </div>
                   </div>

                   <div className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Schedule Info</label>
                         <div className="grid grid-cols-2 gap-4">
                           <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                              <Calendar size={18} className="text-primary" />
                              <p className="text-xs font-bold text-slate-400 uppercase">Date</p>
                              <p className="font-black text-slate-900">{appointment.date}</p>
                           </div>
                           <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                              <Clock size={18} className="text-primary" />
                              <p className="text-xs font-bold text-slate-400 uppercase">Time</p>
                              <p className="font-black text-slate-900">{appointment.time}</p>
                           </div>
                         </div>
                      </div>

                      <div className="p-5 bg-primary/5 rounded-3xl border border-primary/10 flex items-start gap-4">
                        <ShieldCheck size={24} className="text-primary shrink-0" />
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-primary">Insurance Verified</p>
                          <p className="text-xs text-slate-500 font-medium">Your plan covers $120.00 of this consultation. No co-pay required today.</p>
                        </div>
                      </div>
                   </div>
                 </div>

                 <div className="pt-8 border-t border-slate-50 space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Reason for consultation</h4>
                    <p className="text-lg text-slate-700 font-medium leading-relaxed italic border-l-4 border-slate-200 pl-6">
                      "{appointment.reason}"
                    </p>
                 </div>
               </div>
             </motion.div>

             {/* Dynamic Facility Location Coordinates Map */}
             <div id="location-map" className="scroll-mt-24">
               <DoctorLocationMap 
                 hospitalLat={appointment.hospitalLat}
                 hospitalLng={appointment.hospitalLng}
                 hospitalName={appointment.doctorHospital}
                 hospitalAddress={appointment.hospitalAddress}
                 doctorName={appointment.doctorName}
               />
             </div>

             {/* Google Meet Consultation Section */}
             <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-soft space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <Video size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Virtual Telemedicine Consult</h3>
                    <p className="text-xs text-slate-500 font-medium font-sans">Connect securely via encrypted Google Meet channels</p>
                  </div>
                </div>

                {appointment.meetUrl ? (
                  <div className="p-6 bg-gradient-to-br from-indigo-600 via-primary to-blue-600 text-white rounded-3xl space-y-4 shadow-lg">
                    <div className="space-y-1">
                      <span className="text-[10px] bg-white/20 border border-white/10 px-2.5 py-0.5 rounded font-black uppercase tracking-wider font-mono">Active Telehealth Channel</span>
                      <h4 className="font-bold text-sm tracking-tight leading-none mt-1.5">Secure Meeting Space Ready</h4>
                      <p className="text-[11px] text-white/80 leading-normal font-medium">Your care provider will join this virtual videoconference at the scheduled time of this appointment.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3.5 border-t border-white/10">
                      <code className="text-[11.5px] select-all bg-black/15 px-3 py-1.5 rounded-xl font-bold font-mono truncate">{appointment.meetUrl}</code>
                      <a 
                        href={appointment.meetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 bg-white text-primary font-bold rounded-xl text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 shadow-md shrink-0 cursor-pointer"
                      >
                        Join Consultation
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
                    <div className="text-xs text-slate-600 leading-relaxed font-semibold">
                      <p>There is no Google Meet room linked to this consultation yet. If you are scheduling a digital virtual visit, you can generate a Google Meet link instantly.</p>
                    </div>
                    
                    {isWorkspaceConnected() ? (
                      <button
                        onClick={async () => {
                          const confirmMeet = window.confirm("Generate a live Google Meet room for this appointment?");
                          if (!confirmMeet) return;
                          try {
                            const mResponse = await createGoogleMeetSpace();
                            const patchRes = await fetch(`/api/appointments/${appointment.id}/meet`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ meetUrl: mResponse.meetingUri })
                            });
                            if (patchRes.ok) {
                              alert("Google Meet space linked successfully!");
                              fetchAppointment();
                            }
                          } catch (err: any) {
                            alert(`Error of Meet generation: ${err.message || err}`);
                          }
                        }}
                        className="px-5 py-2.5 bg-slate-100/10 text-slate-900 border border-slate-200 hover:bg-slate-50 font-bold rounded-xl text-xs font-sans transition-all flex items-center gap-1.5 shadow-sm inline-flex cursor-pointer"
                      >
                        <Video size={13} />
                        Generate Meet Room
                      </button>
                    ) : (
                      <div className="flex flex-col items-start gap-3">
                        <button
                          onClick={async () => {
                            try {
                              await googleSignIn();
                              alert("Successfully logged in! Restoring view.");
                              fetchAppointment();
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                           className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm inline-flex cursor-pointer"
                        >
                          <ShieldCheck size={14} />
                          Authorize Workspace to Link Meet
                        </button>
                      </div>
                    )}
                  </div>
                )}
             </div>

             {/* Pre-Visit Instructions */}
             <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-soft space-y-6">
                <h3 className="text-xl font-bold text-slate-900">Pre-Visit Checklist</h3>
                <div className="space-y-3">
                  <CheckItem label="Carry your government ID and insurance card." />
                  <CheckItem label="Arrive 15 minutes early to finalize paperwork." />
                  <CheckItem label="Bring a list of all current medications." />
                </div>
             </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            {/* Quick Actions */}
            <div className="bg-slate-900 p-8 rounded-[40px] text-white space-y-6 shadow-2xl">
               <div className="space-y-1">
                 <h4 className="text-xl font-black italic tracking-tighter">Need Support?</h4>
                 <p className="text-slate-400 text-sm font-medium">Connect with the clinic instantly.</p>
               </div>
               
               <div className="space-y-3">
                  <button className="w-full py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-primary/90 transition-all">
                    <MessageSquare size={20} />
                    Live Chat with Clinic
                  </button>
                  <button className="w-full py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-white/20 transition-all">
                    <Phone size={20} />
                    Call Reception
                  </button>
               </div>

               <div className="pt-4 border-t border-white/10">
                 <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Reception is Online
                 </div>
               </div>
            </div>

            {/* Preparation Tip */}
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-soft flex items-start gap-4">
               <div className="p-3 bg-yellow-50 text-yellow-500 rounded-2xl">
                 <Info size={24} />
               </div>
               <div className="space-y-1">
                 <p className="font-bold text-slate-800">Preparation Tip</p>
                 <p className="text-xs text-slate-500 font-medium">Fasting for 8 hours is recommended for any potential blood work during this visit.</p>
               </div>
            </div>
          </div>

        </div>
      </div>

      <AnimatePresence>
        {isConfirmingCancel && appointment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfirmingCancel(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[40px] shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-10 text-center space-y-8">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto">
                  <AlertCircle size={40} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Confirm Cancellation</h3>
                  <p className="text-slate-500 font-medium">Are you sure you want to cancel your visit with <span className="text-slate-800 font-bold">{appointment.doctorName}</span> on <span className="text-slate-800 font-bold">{appointment.date}</span>?</p>
                </div>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={confirmCancellation}
                    className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold text-lg hover:bg-red-600 transition-all shadow-xl shadow-red-500/20"
                  >
                    Yes, Cancel Visit
                  </button>
                  <button 
                    onClick={() => setIsConfirmingCancel(false)}
                    className="w-full py-4 bg-slate-50 text-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-100 transition-all"
                  >
                    Keep Appointment
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">This action cannot be undone.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-50 group hover:bg-green-50 hover:border-green-100 transition-all">
      <div className="w-5 h-5 rounded-md border-2 border-slate-200 flex items-center justify-center group-hover:bg-green-500 group-hover:border-green-500 transition-all">
        <CheckCircle2 size={12} className="text-white opacity-0 group-hover:opacity-100" />
      </div>
      <p className="text-sm font-bold text-slate-600 group-hover:text-green-900 transition-colors">{label}</p>
    </div>
  );
}
