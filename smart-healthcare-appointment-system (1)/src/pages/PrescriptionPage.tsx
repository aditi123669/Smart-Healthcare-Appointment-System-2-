import { motion } from "motion/react";
import { useParams, Link } from "react-router-dom";
import { 
  FileText, 
  Download, 
  Printer, 
  Share2, 
  User as UserIcon, 
  Stethoscope, 
  Calendar, 
  ShieldCheck,
  ChevronLeft,
  ShoppingBag,
  Info,
  AlertCircle
} from "lucide-react";
import { User } from "@/src/types";

export default function PrescriptionPage({ user }: { user: User | null }) {
  const { id } = useParams();

  // Mock data for the specific prescription
  const prescription = {
    id: id || "RX-2026-001",
    date: "April 18, 2026",
    doctor: {
      name: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      address: "Heart Care Clinic, 45 Medical Way, San Francisco, CA"
    },
    patient: {
      name: user?.name || "John Doe",
      age: 32,
      gender: "Male"
    },
    diagnosis: "Mild hypertension and general fatigue.",
    medicines: [
      { name: "Amlodipine", dosage: "5mg", instruction: "Once daily in the morning", duration: "30 days" },
      { name: "Fish Oil Supplements", dosage: "1000mg", instruction: "Once daily with lunch", duration: "60 days" },
      { name: "Multi-Vitamin", dosage: "1 Tablet", instruction: "Once daily with breakfast", duration: "90 days" }
    ],
    notes: "Patient advised to reduce sodium intake and improve sleep schedule. Follow up in 30 days."
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
           <Link to="/dashboard" className="flex items-center gap-2 text-slate-500 font-bold hover:text-primary transition-colors">
             <ChevronLeft size={20} /> Dashboard
           </Link>
           <div className="flex gap-2">
              <button className="p-3 bg-white text-slate-600 rounded-2xl border border-slate-200 hover:text-primary transition-colors">
                <Printer size={20} />
              </button>
              <button className="p-3 bg-white text-slate-600 rounded-2xl border border-slate-200 hover:text-primary transition-colors">
                <Download size={20} />
              </button>
           </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[40px] shadow-soft border border-slate-100 overflow-hidden"
        >
          {/* Prescription Header */}
          <div className="bg-slate-900 p-12 text-white flex flex-col md:flex-row justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-primary rounded-2xl">
                   <Stethoscope size={32} />
                 </div>
                 <h1 className="text-3xl font-black tracking-tighter">SmartHealth</h1>
              </div>
              <div className="space-y-1 opacity-70 italic text-sm">
                 <p>{prescription.doctor.name} • {prescription.doctor.specialty}</p>
                 <p>{prescription.doctor.address}</p>
              </div>
            </div>
            
            <div className="text-right space-y-2">
               <div className="inline-block px-4 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">Official Prescription</div>
               <h2 className="text-4xl font-black tabular-nums">{prescription.id}</h2>
               <p className="opacity-70 text-sm font-bold">{prescription.date}</p>
            </div>
          </div>

          <div className="p-12 space-y-12">
            {/* Patient Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-b border-slate-100 pb-12">
               <div className="space-y-4">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Patient Details</h3>
                 <div className="space-y-1">
                   <p className="text-2xl font-bold text-slate-900">{prescription.patient.name}</p>
                   <p className="text-slate-500 font-medium">Age: {prescription.patient.age} • Gender: {prescription.patient.gender}</p>
                 </div>
               </div>
               <div className="space-y-4">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Diagnosis</h3>
                 <p className="text-slate-700 font-medium italic leading-relaxed">{prescription.diagnosis}</p>
               </div>
            </div>

            {/* Medicines List */}
            <div className="space-y-6">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Rx - Prescription</h3>
               <div className="space-y-4">
                 {prescription.medicines.map((med, i) => (
                   <div key={i} className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm">
                          <FileText size={24} />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-slate-900">{med.name}</h4>
                          <p className="text-sm text-slate-500 font-medium">{med.dosage}</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:items-end gap-1">
                        <p className="text-sm font-bold text-slate-700">{med.instruction}</p>
                        <p className="text-xs text-primary font-black uppercase tracking-widest italic">{med.duration}</p>
                      </div>
                   </div>
                 ))}
               </div>
            </div>

            {/* Doctor's Notes */}
            <div className="p-8 bg-blue-50/50 rounded-3xl border border-blue-100/50 space-y-4 relative overflow-hidden">
               <div className="relative z-10">
                 <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Info size={14} /> Doctor's Instructions
                 </h3>
                 <p className="text-slate-700 font-medium leading-relaxed italic">"{prescription.notes}"</p>
               </div>
               <AlertCircle size={100} className="absolute -right-8 -bottom-8 text-blue-500/5" />
            </div>

            {/* Signature Area */}
            <div className="pt-12 flex flex-col md:flex-row justify-between items-end gap-12">
               <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-600">
                    <ShieldCheck size={20} />
                    <span className="text-sm font-bold uppercase tracking-widest">Digital Verified</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">This is a digitally signed document. No physical signature required.</p>
               </div>
               <div className="text-center border-t-2 border-slate-900 pt-4 w-64">
                  <p className="font-bold text-slate-900">{prescription.doctor.name}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Medical Practitioner ID: 94021</p>
               </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
           <Link to="/store" className="px-8 py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
             <ShoppingBag size={20} /> Buy Precribed Medicines
           </Link>
           <button className="px-8 py-4 bg-white text-slate-600 rounded-2xl border border-slate-200 font-bold hover:bg-slate-50 transition-all">
             Share with Pharmacy
           </button>
        </div>
      </div>
    </div>
  );
}
