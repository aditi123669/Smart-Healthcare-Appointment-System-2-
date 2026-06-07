import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  PhoneOff, 
  MessageSquare, 
  Users, 
  Settings,
  Maximize2,
  MoreHorizontal,
  User as UserIcon,
  ShieldCheck,
  Circle,
  Square
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { WaitingPatient } from "@/src/types";

interface VideoCallInterfaceProps {
  patient: WaitingPatient;
  onEndCall: () => void;
}

export default function VideoCallInterface({ patient, onEndCall }: VideoCallInterfaceProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [recordingStatus, setRecordingStatus] = useState("");
  const [isConnecting, setIsConnecting] = useState(true);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Initial connection simulation
    const connectionTimer = setTimeout(() => {
      setIsConnecting(false);
    }, 2500);

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(err => console.log("Camera access denied or unavailable", err));
    }

    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      if (localVideoRef.current && localVideoRef.current.srcObject) {
         const stream = localVideoRef.current.srcObject as MediaStream;
         stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordingStatus("Recording started");
      setTimeout(() => setRecordingStatus(""), 3000);
    } else {
       setIsRecording(false);
       setRecordingStatus("Recording saved to history");
       setTimeout(() => setRecordingStatus(""), 3000);
    }
  };

  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-slate-950 flex flex-col overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 p-6 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10">
          <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center font-bold">
            {patient.name.charAt(0)}
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">{patient.name}</p>
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mt-1">Live Consultation</p>
          </div>
        </div>

        <div className="flex items-center gap-4 pointer-events-auto">
          <AnimatePresence>
            {recordingStatus && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-white text-xs font-bold flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                {recordingStatus}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="px-4 py-2 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`} />
            <span className="text-white font-mono text-xs">{formatDuration(callDuration)}</span>
          </div>
          <div className="px-4 py-2 bg-green-500 text-white rounded-xl flex items-center gap-2 shadow-lg shadow-green-500/20">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-bold uppercase">Encrypted</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isConnecting && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[150] bg-slate-900 flex flex-col items-center justify-center space-y-8"
          >
             <div className="relative">
                <div className="w-32 h-32 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-20 h-20 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold text-3xl">
                     {patient.name.charAt(0)}
                   </div>
                </div>
             </div>
             <div className="text-center space-y-2">
                <h3 className="text-white text-xl font-bold">Connecting to {patient.name}</h3>
                <p className="text-slate-400 text-sm animate-pulse italic">Establishing secure peer-to-peer connection...</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 relative flex items-center justify-center bg-slate-900">
         <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
               <div className="text-center space-y-4">
                  <div className="w-32 h-32 bg-slate-700 rounded-full mx-auto flex items-center justify-center text-6xl text-slate-500 font-bold">
                    {patient.name.charAt(0)}
                  </div>
                  <p className="text-slate-400 font-medium">Connecting to patient's stream...</p>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto">Reason: {patient.reason}</p>
                  {isRecording && (
                    <div className="flex items-center gap-2 justify-center text-red-500 text-xs font-bold animate-pulse">
                      <Circle size={10} fill="currentColor" />
                      REC
                    </div>
                  )}
               </div>
            </div>
         </div>

         <motion.div 
           drag
           dragConstraints={{ left: 20, right: 20, top: 20, bottom: 20 }}
           className="absolute bottom-32 right-8 w-48 aspect-video bg-slate-950 rounded-2xl shadow-2xl border border-white/20 overflow-hidden z-20 cursor-move"
         >
            {isVideoOff ? (
              <div className="w-full h-full flex items-center justify-center bg-slate-900">
                <UserIcon size={32} className="text-slate-700" />
              </div>
            ) : (
              <video 
                ref={localVideoRef} 
                autoPlay 
                muted 
                playsInline 
                className="w-full h-full object-cover mirror transform scale-x-[-1]" 
              />
            )}
            <div className="absolute bottom-2 left-2 bg-black/40 backdrop-blur-sm px-2 py-1 rounded text-[8px] text-white font-bold uppercase tracking-widest">
              You (Preview)
            </div>
         </motion.div>
      </div>

      <div className="h-28 bg-slate-950/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-center gap-4 px-6 relative z-30">
         <div className="absolute inset-y-0 left-8 flex items-center gap-6">
            <button className="text-slate-400 hover:text-white transition-colors">
              <Users size={20} />
            </button>
            <button className="text-slate-400 hover:text-white transition-colors">
              <MessageSquare size={20} />
            </button>
         </div>

         <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                isMuted ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
              )}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            
            <button 
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                isVideoOff ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
              )}
            >
              {isVideoOff ? <VideoOff size={24} /> : <VideoIcon size={24} />}
            </button>

            <button 
              onClick={onEndCall}
              className="w-20 h-14 bg-red-600 text-white rounded-2xl flex items-center justify-center hover:bg-red-700 transition-all shadow-xl shadow-red-600/30 active:scale-95"
            >
              <PhoneOff size={28} />
            </button>

            <button 
              onClick={toggleRecording}
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                isRecording ? "bg-red-500/20 text-red-500 ring-2 ring-red-500" : "bg-white/10 text-white hover:bg-white/20"
              )}
            >
              {isRecording ? <Square size={20} fill="currentColor" /> : <Circle size={20} fill="currentColor" />}
            </button>

            <button className="w-14 h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all">
              <Settings size={24} />
            </button>
         </div>

         <div className="absolute inset-y-0 right-8 flex items-center gap-6">
            <button className="text-slate-400 hover:text-white transition-colors">
              <MoreHorizontal size={20} />
            </button>
            <button className="text-slate-400 hover:text-white transition-colors">
              <Maximize2 size={20} />
            </button>
         </div>
      </div>
    </motion.div>
  );
}
