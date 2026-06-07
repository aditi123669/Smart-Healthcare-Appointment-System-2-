import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Filter, 
  Star, 
  Calendar, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  ChevronRight,
  ChevronLeft,
  X,
  Stethoscope,
  Info,
  CheckCircle2,
  AlertCircle,
  Building2,
  User as UserIcon,
  LayoutGrid,
  Activity,
  Heart,
  Droplet,
  Zap
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Doctor, Hospital } from "@/src/types";

export default function AppointmentBooking() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSpecialty, setActiveSpecialty] = useState("All");
  const [activeHospital, setActiveHospital] = useState("All");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const hospId = params.get("hospital");
    const spec = params.get("specialty");
    if (hospId) setActiveHospital(hospId);
    if (spec) setActiveSpecialty(spec);

    Promise.all([
      fetch("/api/doctors").then(res => res.json()),
      fetch("/api/hospitals").then(res => res.json())
    ]).then(([doctorsData, hospitalsData]) => {
      setDoctors(doctorsData);
      setHospitals(hospitalsData);
      setLoading(false);
    });
  }, [location.search]);

  const handleBook = () => {
    fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: "p1",
        doctorId: selectedDoctor?.id,
        date: selectedDate,
        time: selectedTime,
        status: "Upcoming",
        reason: "Consultation"
      })
    }).then(() => {
      setStep(4);
    });
  };

  const specialties = ["All", ...Array.from(new Set(doctors.map(d => d.specialty)))];

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = activeSpecialty === "All" || doc.specialty === activeSpecialty;
    const matchesHospital = activeHospital === "All" || doc.hospitalId === activeHospital;
    return matchesSearch && matchesSpecialty && matchesHospital;
  });

  const dates = ["2026-04-20", "2026-04-21", "2026-04-22", "2026-04-23", "2026-04-24"];
  const times = ["09:00 AM", "10:30 AM", "01:00 PM", "02:30 PM", "04:00 PM"];

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Progress Stepper */}
        <div className="max-w-2xl mx-auto mb-16">
           <div className="flex items-center justify-between relative">
             <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 -z-10" />
             <div className={cn("absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-500", 
               step === 1 ? "w-0" : step === 2 ? "w-1/2" : "w-full"
             )} />
             
             <StepIcon active={step >= 1} current={step === 1} num={1} label="Specialists" />
             <StepIcon active={step >= 2} current={step === 2} num={2} label="Schedule" />
             <StepIcon active={step >= 3} current={step === 3} num={3} label="Confirm" />
           </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 bg-white p-10 rounded-[48px] border border-slate-100 shadow-soft">
                <div className="text-left space-y-3">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight italic">Find Your Best Specialist</h2>
                  <p className="text-slate-500 font-medium italic">Search through elite hospitals and award-winning doctors.</p>
                </div>
                <div className="relative w-full lg:w-[450px]">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search name, hospital or specialization..." 
                    className="w-full pl-16 pr-8 py-5 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-primary focus:outline-none rounded-[32px] shadow-sm transition-all font-bold text-lg" 
                  />
                </div>
              </div>

              {/* Advanced Filter Tabs */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                <aside className="lg:col-span-1 space-y-8 sticky top-24">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <LayoutGrid size={14} className="text-primary" />
                       Specializations
                    </h4>
                    <div className="flex flex-col gap-2">
                       {specialties.map(spec => (
                         <button
                           key={spec}
                           onClick={() => setActiveSpecialty(spec)}
                           className={cn(
                             "w-full text-left px-5 py-3 rounded-2xl font-bold text-sm transition-all",
                             activeSpecialty === spec 
                               ? "bg-primary text-white shadow-lg shadow-primary/20" 
                               : "bg-white text-slate-500 hover:bg-slate-100"
                           )}
                         >
                           {spec}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Building2 size={14} className="text-primary" />
                       Elite Hospitals
                    </h4>
                    <div className="flex flex-col gap-2">
                       <button
                         onClick={() => setActiveHospital("All")}
                         className={cn(
                           "w-full text-left px-5 py-3 rounded-2xl font-bold text-sm transition-all",
                           activeHospital === "All" 
                             ? "bg-slate-900 text-white shadow-lg" 
                             : "bg-white text-slate-500 hover:bg-slate-100"
                         )}
                       >
                         All Centers
                       </button>
                       {hospitals.map(hosp => (
                         <button
                           key={hosp.id}
                           onClick={() => setActiveHospital(hosp.id)}
                           className={cn(
                             "w-full text-left px-5 py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-between group",
                             activeHospital === hosp.id 
                               ? "bg-slate-900 text-white shadow-lg" 
                               : "bg-white text-slate-500 hover:bg-slate-100"
                           )}
                         >
                           <span className="truncate">{hosp.name}</span>
                           <ChevronRight size={14} className="opacity-50 group-hover:translate-x-1 transition-transform" />
                         </button>
                       ))}
                    </div>
                  </div>
                </aside>

                <div className="lg:col-span-3">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {loading ? (
                       [1,2,3,4].map(i => <div key={i} className="h-80 bg-white animate-pulse rounded-[48px] border border-slate-100" />)
                     ) : filteredDoctors.length > 0 ? (
                       filteredDoctors.map(doc => (
                         <DoctorCard 
                           key={doc.id} 
                           doctor={doc} 
                           onSelect={() => {
                             setSelectedDoctor(doc);
                             setStep(2);
                           }} 
                         />
                       ))
                     ) : (
                       <div className="col-span-full py-24 text-center space-y-6 bg-white rounded-[48px] border-2 border-dashed border-slate-200">
                         <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                           <Search size={48} />
                         </div>
                         <div className="space-y-2">
                           <p className="text-2xl font-black text-slate-800 tracking-tight">No Result Matches</p>
                           <p className="text-slate-400 font-medium italic">Try resetting filters to discover more specialists.</p>
                         </div>
                         <button 
                           onClick={() => {
                             setActiveHospital("All");
                             setActiveSpecialty("All");
                             setSearchQuery("");
                           }}
                           className="px-8 py-3 bg-primary text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all"
                         >
                           Reset All Filters
                         </button>
                       </div>
                     )}
                   </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && selectedDoctor && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-6xl mx-auto"
            >
              <button 
                onClick={() => setStep(1)}
                className="mb-8 flex items-center gap-3 text-slate-500 font-black hover:text-primary transition-all px-6 py-2 rounded-full hover:bg-white"
              >
                <ChevronLeft size={24} /> Return to Explorations
              </button>

              <div className="bg-white rounded-[56px] shadow-soft border border-slate-100 p-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
                <div className="lg:col-span-7 space-y-12">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-10">
                    <div className="relative group">
                      <img src={selectedDoctor.image} className="w-48 h-48 rounded-[48px] object-cover border-8 border-slate-50 shadow-lg group-hover:rotate-3 transition-transform" alt={selectedDoctor.name} referrerPolicy="no-referrer" />
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 border-4 border-white rounded-full flex items-center justify-center shadow-lg">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                      </div>
                    </div>
                    <div className="text-center sm:text-left space-y-4">
                      <div className="space-y-1">
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter italic leading-none">{selectedDoctor.name}</h3>
                        <p className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-xl text-xs font-black uppercase tracking-widest mt-2">{selectedDoctor.specialty}</p>
                      </div>
                      
                      <div className="space-y-3">
                         <p className="flex items-center justify-center sm:justify-start gap-2 text-slate-400 font-bold italic">
                           <Building2 size={18} className="text-primary" />
                           {selectedDoctor.hospitalName}
                         </p>
                         <div className="flex items-center justify-center sm:justify-start gap-8">
                           <div className="flex items-center gap-1.5 text-yellow-400">
                             <Star size={20} fill="currentColor" />
                             <span className="text-xl font-black text-slate-900 leading-none">{selectedDoctor.rating}</span>
                           </div>
                           <div className="text-left">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Clinic Experience</p>
                              <p className="text-base font-black text-slate-800">{selectedDoctor.experience}</p>
                           </div>
                         </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                       <h4 className="font-black text-slate-900 flex items-center gap-4 text-2xl tracking-tighter italic">
                         <Calendar size={28} className="text-primary" />
                         Calendar Schedule
                       </h4>
                       <span className="text-xs font-black text-slate-400 uppercase tracking-widest">April 2026</span>
                    </div>
                    <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar">
                      {dates.map(d => {
                        const dateObj = new Date(d);
                        const isSelected = selectedDate === d;
                        return (
                          <button
                            key={d}
                            onClick={() => setSelectedDate(d)}
                            className={cn(
                              "flex flex-col items-center justify-center min-w-[90px] h-32 rounded-[32px] font-bold transition-all border-4",
                              isSelected 
                                ? "bg-primary border-primary text-white shadow-2xl shadow-primary/30 scale-105" 
                                : "bg-white border-slate-50 text-slate-400 hover:border-primary/40 hover:text-slate-600"
                            )}
                          >
                             <p className="text-xs uppercase tracking-widest opacity-60 mb-2 font-black">{dateObj.toLocaleDateString("en-US", { weekday: "short" })}</p>
                             <p className="text-3xl font-black">{dateObj.getDate()}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h4 className="font-black text-slate-900 flex items-center gap-4 text-2xl tracking-tighter italic">
                       <Clock size={28} className="text-primary" />
                       Available Slots
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {times.map(t => (
                        <button
                          key={t}
                          onClick={() => setSelectedTime(t)}
                          className={cn(
                            "py-5 rounded-3xl font-black text-sm transition-all border-4",
                            selectedTime === t 
                              ? "bg-slate-900 border-slate-900 text-white shadow-2xl shadow-slate-900/30 scale-105" 
                              : "bg-white border-slate-50 text-slate-400 hover:border-slate-300"
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-slate-900 rounded-[56px] p-12 flex flex-col justify-between text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                     <Zap size={200} />
                  </div>
                  
                  <div className="space-y-12 relative z-10">
                    <div className="space-y-2">
                       <h4 className="font-black text-4xl tracking-tighter italic">Checkout Detail</h4>
                       <p className="text-slate-400 text-sm font-medium">Verified healthcare booking service.</p>
                    </div>
                    
                    <div className="space-y-8">
                       <CheckoutItem label="Chosen Specialist" value={selectedDoctor.name} />
                       <CheckoutItem label="Medical Center" value={selectedDoctor.hospitalName || ""} />
                       <CheckoutItem label="Booking Date" value={selectedDate ? new Date(selectedDate).toLocaleDateString("en-US", { dateStyle: "long" }) : "---"} />
                       <CheckoutItem label="Time Slot" value={selectedTime || "---"} />
                       <div className="h-px bg-slate-800 my-4" />
                       <div className="flex items-center justify-between">
                         <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">Grand Total</span>
                         <span className="text-4xl font-black text-white italic tracking-tighter">$50.00</span>
                       </div>
                    </div>
                  </div>
                  
                  <button
                    disabled={!selectedDate || !selectedTime}
                    onClick={() => setStep(3)}
                    className="w-full py-6 bg-primary text-white rounded-[32px] font-black text-xl hover:bg-white hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-2xl shadow-primary/40 mt-16 flex items-center justify-center gap-4 group hover:scale-[1.02]"
                  >
                    Confirm Booking
                    <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && selectedDoctor && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-xl mx-auto"
            >
               <div className="bg-white rounded-[64px] shadow-soft border border-slate-100 p-16 space-y-12 text-center relative overflow-hidden">
                  <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                  
                  <div className="w-28 h-28 bg-primary/10 text-primary rounded-[40px] flex items-center justify-center mx-auto mb-6 rotate-12 shadow-inner ring-8 ring-primary/5">
                    <ShieldCheck size={56} />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter italic">Review & Confirm</h3>
                    <p className="text-slate-400 font-medium italic">Double check your appointment information.</p>
                  </div>
                  
                  <div className="bg-slate-50 p-10 rounded-[40px] space-y-6 text-left border border-slate-100 shadow-inner">
                    <ConfirmationRow label="Specialist" value={selectedDoctor.name} />
                    <ConfirmationRow label="Medical Center" value={selectedDoctor.hospitalName || ""} />
                    <ConfirmationRow label="Schedule" value={`${new Date(selectedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${selectedTime}`} />
                    <div className="pt-6 border-t border-slate-200/50 flex justify-between items-center">
                       <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Total Amount</span>
                       <span className="text-primary font-black text-4xl tracking-tighter italic">$50.00</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <button
                      onClick={handleBook}
                      className="w-full py-6 bg-primary text-white rounded-[32px] font-black text-xl hover:bg-slate-900 shadow-2xl shadow-primary/30 transition-all active:scale-95"
                    >
                      Authenticate & Book
                    </button>
                    <button
                      onClick={() => setStep(2)}
                      className="w-full py-4 text-slate-400 font-black hover:text-slate-900 transition-all uppercase tracking-widest text-[10px]"
                    >
                      Back to Re-Schedule
                    </button>
                  </div>
               </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto text-center space-y-12 py-20"
            >
               <div className="relative inline-block">
                 <div className="w-56 h-56 bg-green-50 rounded-[64px] flex items-center justify-center mx-auto rotate-12 animate-pulse" />
                 <CheckCircle2 size={110} className="text-green-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-3" />
               </div>
               
               <div className="space-y-6">
                  <h2 className="text-6xl font-black text-slate-900 tracking-tighter italic">Victory!</h2>
                  <p className="text-2xl text-slate-500 max-w-md mx-auto leading-relaxed italic font-medium">Your appointment has been secured. We've sent the details to your digital wallet.</p>
               </div>
               
               <div className="bg-white p-10 rounded-[48px] border-2 border-slate-50 shadow-soft flex items-center justify-between gap-10 max-w-md mx-auto relative group overflow-hidden">
                 <div className="absolute inset-0 bg-slate-50 translate-y-full group-hover:translate-y-0 transition-transform duration-500 -z-10" />
                 <div className="text-left space-y-2">
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Booking Receipt ID</p>
                   <p className="text-2xl font-black text-slate-900 italic tracking-tighter">#SH-{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
                 </div>
                 <div className="p-5 bg-primary text-white rounded-[24px] shadow-xl shadow-primary/20 -rotate-6">
                   <ShieldCheck size={32} />
                 </div>
               </div>

               <div className="pt-10 flex flex-col sm:flex-row gap-6 justify-center px-8">
                  <Link to="/dashboard" className="px-12 py-6 bg-slate-900 text-white rounded-[32px] font-black text-xl hover:bg-primary transition-all shadow-2xl flex-1 sm:flex-none">
                    Digital Dashboard
                  </Link>
                  <button onClick={() => navigate("/")} className="px-12 py-6 bg-white text-slate-900 border-4 border-slate-100 rounded-[32px] font-black text-xl hover:bg-slate-50 transition-all flex-1 sm:flex-none italic">
                    Back to Hub
                  </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StepIcon({ active, current, num, label }: { active: boolean, current: boolean, num: number, label: string }) {
  return (
    <div className="flex flex-col items-center gap-5 relative">
      <div className={cn(
        "w-20 h-20 rounded-[32px] border-4 flex items-center justify-center transition-all duration-700 font-black text-2xl",
        current ? "bg-white border-primary text-primary scale-125 shadow-2xl shadow-primary/40 rotate-12 z-20" : 
        active ? "bg-primary border-primary text-white -rotate-12" : "bg-white border-slate-100 text-slate-200"
      )}>
        {active && !current && num < 3 ? <CheckCircle2 size={36} /> : num}
      </div>
      <span className={cn(
        "text-[10px] font-black uppercase tracking-[0.2em] absolute -bottom-12 whitespace-nowrap",
        current ? "text-primary" : active ? "text-slate-800" : "text-slate-300"
      )}>
        {label}
      </span>
    </div>
  );
}

function DoctorCard({ doctor, onSelect }: { doctor: Doctor, onSelect: () => void, key?: React.Key }) {
  return (
    <motion.div 
      whileHover={{ y: -16, scale: 1.02 }}
      className="bg-white p-10 rounded-[56px] shadow-soft border-2 border-transparent hover:border-primary/30 transition-all group relative overflow-hidden text-left"
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-10 mb-10">
        <div className="relative shrink-0">
          <img src={doctor.image} alt={doctor.name} className="w-28 h-28 rounded-[36px] object-cover shadow-xl group-hover:-rotate-3 transition-transform ring-8 ring-slate-50" referrerPolicy="no-referrer" />
          <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-green-500 border-4 border-white rounded-full flex items-center justify-center shadow-lg">
             <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
          </div>
        </div>
        <div className="space-y-4 text-center sm:text-left">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic group-hover:text-primary transition-colors leading-none">{doctor.name}</h3>
            <p className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest mt-3 transition-colors group-hover:bg-primary group-hover:text-white">{doctor.specialty}</p>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-yellow-400">
             <Star size={18} fill="currentColor" />
             <span className="text-lg font-black text-slate-900">{doctor.rating}</span>
             <span className="text-[10px] text-slate-300 font-black ml-2 uppercase tracking-widest">Verified Elite</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 rounded-[32px] p-8 mb-10 space-y-5 shadow-inner">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3 text-slate-400">
             <Building2 size={20} className="text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.1em]">Medical Hub</span>
           </div>
           <span className="text-sm font-black text-slate-800 italic">{doctor.hospitalName}</span>
        </div>
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3 text-slate-400">
             <Zap size={20} className="text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.1em]">Clinical Exp.</span>
           </div>
           <span className="text-sm font-black text-slate-800 italic">{doctor.experience}</span>
        </div>
      </div>

      <button 
        onClick={onSelect}
        className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black text-base group-hover:bg-primary transition-all shadow-xl flex items-center justify-center gap-4 active:scale-95"
      >
        Secure Slot
        <ChevronRight size={22} className="group-hover:translate-x-2 transition-transform" />
      </button>

      <Stethoscope size={160} className="absolute -right-12 -top-12 text-primary/5 -rotate-12 group-hover:rotate-12 transition-transform pointer-events-none" />
    </motion.div>
  );
}

function CheckoutItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center gap-4">
      <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">{label}</span>
      <span className="text-white font-black text-right italic tracking-tight">{value}</span>
    </div>
  );
}

function ConfirmationRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between border-b border-slate-200/50 pb-5">
      <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest mt-1">{label}</span>
      <span className="text-slate-900 font-black text-right tracking-tight italic">{value}</span>
    </div>
  );
}
