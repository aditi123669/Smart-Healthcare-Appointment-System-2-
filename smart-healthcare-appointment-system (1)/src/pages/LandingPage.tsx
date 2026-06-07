import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  Stethoscope, 
  Calendar, 
  ShoppingBag, 
  ShieldCheck, 
  Clock, 
  Users, 
  MessageSquare,
  ArrowRight,
  Star,
  CheckCircle2,
  Building2
} from "lucide-react";
import { cn } from "@/src/lib/utils";

export default function LandingPage() {
  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl -z-10" />
        
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-8 text-center lg:text-left">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold"
              >
                <ShieldCheck size={16} />
                <span>Trusted by 50,000+ patients worldwide</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]"
              >
                Book Appointments & Manage Your <span className="text-primary italic">Health</span> Seamlessly
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
              >
                Connecting you with the best specialists, providing instant consultations, 
                and delivering medicines to your doorstep. All in one smart platform.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-4"
              >
                <Link to="/register" className="px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center gap-2 group">
                  Get Started Now
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/#services" className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold text-lg border border-slate-200 hover:bg-slate-50 transition-all">
                  Our Services
                </Link>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="flex items-center justify-center lg:justify-start gap-8 pt-4"
              >
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/150?u=${i}`} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="User" referrerPolicy="no-referrer" />
                  ))}
                </div>
                <div className="text-left text-sm">
                  <div className="flex text-yellow-400 mb-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                  <p className="text-slate-600 font-medium">4.9/5 from 2,000+ reviews</p>
                </div>
              </motion.div>
            </div>
            
            <div className="flex-1 relative">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7, type: "spring" }}
                className="relative z-10"
              >
                <img 
                  src="https://picsum.photos/seed/healthcare-hero/800/1000" 
                  alt="Doctor Hero" 
                  className="rounded-3xl shadow-2xl w-full max-w-[500px] mx-auto object-cover aspect-[4/5]"
                  referrerPolicy="no-referrer"
                />
                
                {/* Floating Cards */}
                <motion.div 
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -right-4 top-1/4 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 border border-slate-100"
                >
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Verified Doctors</p>
                    <p className="text-sm font-bold text-slate-900">100% Reliable</p>
                  </div>
                </motion.div>
                
                <motion.div 
                   initial={{ x: -50, opacity: 0 }}
                   animate={{ x: 0, opacity: 1 }}
                   transition={{ delay: 0.6 }}
                   className="absolute -left-4 bottom-1/4 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 border border-slate-100"
                >
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Next Available</p>
                    <p className="text-sm font-bold text-slate-900">Today, 4:00 PM</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-primary font-bold tracking-widest uppercase text-sm">Our Focus</h2>
            <h3 className="text-4xl font-bold text-slate-900">Comprehensive Care for You</h3>
            <p className="text-slate-600 font-medium italic text-lg">Everything you need to manage your health in one simple dashboard.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ServiceCard 
              icon={<Calendar className="text-blue-500" />}
              title="Appointment Booking"
              description="Find top doctors from elite hospitals and book appointments in seconds."
              color="bg-blue-50"
            />
            <ServiceCard 
              icon={<MessageSquare className="text-purple-500" />}
              title="Online Consultation"
              description="Speak with specialists from the comfort of your home via video or chat."
              color="bg-purple-50"
            />
            <ServiceCard 
              icon={<ShoppingBag className="text-green-500" />}
              title="Medicine Store"
              description="Order prescriptions and healthcare products with superfast delivery."
              color="bg-green-50"
            />
          </div>
        </div>
      </section>

      {/* Hospital Partners Section */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-primary rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-[120px]" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center space-y-16">
          <div className="max-w-3xl mx-auto space-y-4">
             <motion.span 
               initial={{ opacity: 0, y: 10 }}
               whileInView={{ opacity: 1, y: 0 }}
               className="px-4 py-1.5 bg-primary/20 text-primary border border-primary/30 rounded-full text-[10px] font-black uppercase tracking-[0.3em] inline-block"
             >
               Elite Healthcare Network
             </motion.span>
             <motion.h2 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="text-4xl md:text-6xl font-black italic tracking-tighter"
             >
               Partnering with <span className="text-primary italic">Global</span> Medical Centers
             </motion.h2>
             <p className="text-slate-400 font-medium italic text-lg">
               Direct integration with leading hospitals for seamless data sharing and appointment priority.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <HospitalPartnerCard 
               id="h1"
               name="City General Hospital" 
               specialty="Cardiology & Emergency" 
               image="https://picsum.photos/seed/hosp1/600/400"
             />
             <HospitalPartnerCard 
               id="h2"
               name="St. Jude's Children Hospital" 
               specialty="Pediatrics & Oncology" 
               image="https://picsum.photos/seed/hosp2/600/400"
               delay={0.1}
             />
             <HospitalPartnerCard 
               id="h3"
               name="Pacific Wellness Center" 
               specialty="Neurology & Dermatology" 
               image="https://picsum.photos/seed/hosp3/600/400"
               delay={0.2}
             />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-[40px] p-8 md:p-16 text-white flex flex-col lg:flex-row items-center gap-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <circle cx="100" cy="0" r="50" fill="white" />
              </svg>
            </div>
            
            <div className="flex-1 space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">Ready to prioritize your health?</h2>
              <p className="text-primary-light/80 text-lg">Join thousands of happy patients today and experience the future of healthcare.</p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/register" className="px-8 py-4 bg-white text-primary rounded-2xl font-bold hover:bg-slate-100 transition-all shadow-lg">
                  Join Now
                </Link>
                <div className="flex items-center gap-8 pl-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">120k+</p>
                    <p className="text-xs opacity-70">Downloads</p>
                  </div>
                  <div className="w-px h-10 bg-white/20" />
                  <div className="text-center">
                    <p className="text-2xl font-bold">4.8</p>
                    <p className="text-xs opacity-70">App Rating</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 flex justify-center">
               <div className="relative">
                 <div className="w-64 h-64 bg-white/10 rounded-full blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                 <Stethoscope size={240} className="text-white/20 relative animate-pulse" />
               </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ServiceCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="p-8 bg-white rounded-3xl shadow-soft border border-slate-100 transition-all group"
    >
      <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", color)}>
        {icon}
      </div>
      <h4 className="text-xl font-bold text-slate-900 mb-4">{title}</h4>
      <p className="text-slate-600 leading-relaxed mb-6 italic">{description}</p>
      <Link to="/register" className="inline-flex items-center gap-2 text-primary font-bold group-hover:gap-3 transition-all">
        Learn More <ArrowRight size={18} />
      </Link>
    </motion.div>
  );
}

function HospitalPartnerCard({ id, name, specialty, image, delay = 0 }: { id: string, name: string, specialty: string, image: string, delay?: number }) {
  return (
    <Link to={`/book-appointment?hospital=${id}`}>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="group relative h-80 rounded-[48px] overflow-hidden shadow-2xl border-4 border-white/5 cursor-pointer"
      >
        <img src={image} alt={name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
        <div className="absolute bottom-0 left-0 p-10 text-left space-y-2">
           <div className="flex items-center gap-3 text-primary">
             <Building2 size={24} />
             <span className="text-[10px] font-black uppercase tracking-[0.3em]">Institutional Partner</span>
           </div>
           <h4 className="text-2xl font-black italic tracking-tighter">{name}</h4>
           <p className="text-slate-400 font-bold italic text-sm">{specialty}</p>
        </div>
      </motion.div>
    </Link>
  );
}
