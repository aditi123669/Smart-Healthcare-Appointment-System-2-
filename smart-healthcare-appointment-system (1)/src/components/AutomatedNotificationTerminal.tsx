import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Inbox, 
  Settings, 
  Trash2, 
  RefreshCw, 
  Check, 
  Clock, 
  User as UserIcon, 
  AlertCircle, 
  ChevronRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Send,
  Building2
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface NotificationLog {
  id: string;
  timestamp: string;
  type: "Email" | "SMS";
  recipient: string;
  subject?: string;
  body: string;
  status: "Delivered" | "Queued" | "Failed";
  doctorName?: string;
}

interface ReminderSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  userEmail: string;
  userPhone: string;
  leadTime: string;
}

export default function AutomatedNotificationTerminal({ appointments = [] }: { appointments: any[] }) {
  const [settings, setSettings] = useState<ReminderSettings>({
    emailEnabled: true,
    smsEnabled: true,
    userEmail: "aditimazumder3@gmail.com",
    userPhone: "+1 (555) 724-4328",
    leadTime: "1 Day Prior",
  });
  
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [activeSegment, setActiveSegment] = useState<"Inbox" | "Settings">("Inbox");
  const [inboxMedium, setInboxMedium] = useState<"Email" | "SMS">("Email");
  const [selectedMail, setSelectedMail] = useState<NotificationLog | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");

  const fallbackAppointments = appointments.filter(a => a.status === "Upcoming");

  // Load reminders configuration & delivered outbox log history
  const fetchSettingsAndLogs = async () => {
    setIsLoading(true);
    try {
      const settingsRes = await fetch("/api/reminders/settings");
      if (settingsRes.ok) {
        const sData = await settingsRes.json();
        setSettings(sData);
      }
      
      const logsRes = await fetch("/api/reminders/logs");
      if (logsRes.ok) {
        const lData = await logsRes.json();
        setLogs(lData);
        // Default select first email log in reader
        const firstEmail = lData.find((l: NotificationLog) => l.type === "Email");
        if (firstEmail) setSelectedMail(firstEmail);
      }
    } catch (err) {
      console.error("Failed to load automation data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsAndLogs();
  }, [appointments]);

  // Handle saving reminder preference triggers
  const savePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus("");
    try {
      const res = await fetch("/api/reminders/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaveStatus("Preferences successfully live!");
        setTimeout(() => setSaveStatus(""), 4000);
        // Refresh logs to capture updated preference alert mock
        const logsRes = await fetch("/api/reminders/logs");
        if (logsRes.ok) {
          const lData = await logsRes.json();
          setLogs(lData);
        }
      }
    } catch (err) {
      console.error(err);
      setSaveStatus("Error updating variables.");
    } finally {
      setIsSaving(false);
    }
  };

  // Trigger outbound manual delivery alert simulation
  const triggerManualAlert = async (appId: string) => {
    if (!appId) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/reminders/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: appId,
          type: settings.emailEnabled && settings.smsEnabled ? "Both" : settings.emailEnabled ? "Email" : "SMS"
        })
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        // Select newly delivered mail instantly for active reading
        const latestEmail = data.logs.find((l: NotificationLog) => l.type === "Email");
        if (latestEmail) {
          setSelectedMail(latestEmail);
          setInboxMedium("Email");
        } else {
          setInboxMedium("SMS");
        }
      }
    } catch (err) {
      console.error("Failed to route simulated alert:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear deliveries inbox in UI and backend mock
  const clearInboxes = async () => {
    try {
      const res = await fetch("/api/reminders/logs", { method: "DELETE" });
      if (res.ok) {
        setLogs([]);
        setSelectedMail(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-[40px] border border-slate-100 shadow-soft overflow-hidden space-y-0">
      
      {/* Smart Title Bar */}
      <div className="p-8 pb-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 w-fit">
              <Sparkles size={11} className="animate-pulse" />
              Automated Alerts Center
            </span>
            <span className="text-[10px] bg-green-50 text-green-600 border border-green-100 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Gemini Powered
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Active SMS & Email Dispatcher</h3>
          <p className="text-xs text-slate-500 font-medium">Configure preferences and run live AI dispatch simulation inboxes below.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchSettingsAndLogs}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:text-primary hover:border-primary/20 active:scale-95 transition-all text-xs flex items-center gap-1.5 font-bold shadow-sm"
            title="Refresh logs & connection status"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin text-primary" : ""} />
            Sync Logs
          </button>
          
          <button 
            onClick={clearInboxes}
            className="p-2.5 bg-white border border-rose-100 text-rose-500 rounded-xl hover:bg-rose-50 active:scale-95 transition-all text-xs flex items-center gap-1.5 font-bold shadow-sm"
          >
            <Trash2 size={14} />
            Empty Inboxes
          </button>
        </div>
      </div>

      {/* Controller Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
        
        {/* Left Control Column: Settings and Manual Triggers (4 Cols) */}
        <div className="lg:col-span-5 p-8 space-y-6">
          
          {/* Section Switcher */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveSegment("Inbox")}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                activeSegment === "Inbox" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              )}
            >
              <Inbox size={14} />
              Deliveries Terminal
            </button>
            <button
              onClick={() => setActiveSegment("Settings")}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                activeSegment === "Settings" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              )}
            >
              <Settings size={14} />
              Alert Rules Settings
            </button>
          </div>

          {activeSegment === "Settings" ? (
            <form onSubmit={savePreferences} className="space-y-5">
              <div className="space-y-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Channels Preferences</span>
                
                {/* Email Reminders Toggle */}
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-xl", settings.emailEnabled ? "bg-blue-50 text-blue-600" : "bg-slate-200 text-slate-400")}>
                      <Mail size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">HTML Automated Email Reminders</p>
                      <p className="text-[10px] text-slate-400 font-medium">Sends rich therapeutic pre-visit checklist HTML inboxes</p>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={settings.emailEnabled}
                    onChange={e => setSettings({...settings, emailEnabled: e.target.checked})}
                    className="w-5 h-5 accent-primary rounded-lg border-2 cursor-pointer"
                  />
                </label>

                {/* SMS Reminders Toggle */}
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-xl", settings.smsEnabled ? "bg-indigo-50 text-indigo-600" : "bg-slate-200 text-slate-400")}>
                      <MessageSquare size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">SMS Automated Text Reminders</p>
                      <p className="text-[10px] text-slate-400 font-medium">Delivers concise real-time alert texts via simulated carrier</p>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={settings.smsEnabled}
                    onChange={e => setSettings({...settings, smsEnabled: e.target.checked})}
                    className="w-5 h-5 accent-primary rounded-lg border-2 cursor-pointer"
                  />
                </label>
              </div>

              {/* Contact Credentials Fields */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Target Credentials & Routing</span>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Deliver Email To</label>
                  <input 
                    type="email" 
                    value={settings.userEmail}
                    onChange={e => setSettings({...settings, userEmail: e.target.value})}
                    placeholder="example@gmail.com"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:border-primary/20 rounded-xl focus:bg-white text-xs font-bold outline-none transition-all placeholder:font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Deliver SMS Text To</label>
                  <input 
                    type="text" 
                    value={settings.userPhone}
                    onChange={e => setSettings({...settings, userPhone: e.target.value})}
                    placeholder="+1 (555) 724-4328"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:border-primary/20 rounded-xl focus:bg-white text-xs font-bold outline-none transition-all placeholder:font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Frequency Lead Time Window</label>
                  <select
                    value={settings.leadTime}
                    onChange={e => setSettings({...settings, leadTime: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:border-primary/20 rounded-xl focus:bg-white text-xs font-bold outline-none transition-all cursor-pointer"
                  >
                    <option value="Instant Booking">Instant Confirmation (Onbooking)</option>
                    <option value="1 Hour Prior">1 Hour before scheduled slot</option>
                    <option value="3 Hours Prior">Same-day (3 hours prior)</option>
                    <option value="1 Day Prior">Overnight (1 day prior at 08:00 AM)</option>
                    <option value="3 Days Prior">T-Minus 3 Days Wellness Check</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3.5 bg-primary text-white hover:bg-primary/95 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                >
                  <ShieldCheck size={14} />
                  {isSaving ? "Saving rules..." : "Save Delivery Rules"}
                </button>
                {saveStatus && (
                  <p className="text-center text-[10px] text-green-600 font-bold mt-2 animate-pulse">{saveStatus}</p>
                )}
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              
              {/* Manual Outbound Simulator Action Trigger */}
              <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl space-y-4 shadow-xl relative overflow-hidden">
                <div className="relative z-10 space-y-3.5">
                  <span className="text-[9px] bg-white/10 border border-white/20 px-2 py-0.5 rounded font-black uppercase tracking-wider">Manual Dispatch Outbox</span>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm tracking-tight leading-none">Instant Alert Sim Trigger</h4>
                    <p className="text-[10px] text-slate-300 leading-normal font-medium">Force manual dispatch testing of automated email & text reminders via server-side generative loop.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Select Scheduled Visit Slot</label>
                    <select
                      value={selectedAppointmentId}
                      onChange={e => setSelectedAppointmentId(e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/15 focus:border-white/35 rounded-xl text-white text-[11px] font-bold outline-none cursor-pointer"
                    >
                      <option value="" className="text-slate-900">Choose upcoming appointment...</option>
                      {fallbackAppointments.length > 0 ? (
                        fallbackAppointments.map(a => (
                          <option key={a.id} value={a.id} className="text-slate-900">
                            {a.doctorId ? `Visit with ${a.doctorName} on ${a.date}` : `Consultation slot: ${a.date}`}
                          </option>
                        ))
                      ) : (
                        <option value="" className="text-slate-900">No active bookings registered</option>
                      )}
                    </select>
                  </div>

                  <button
                    onClick={() => triggerManualAlert(selectedAppointmentId)}
                    disabled={!selectedAppointmentId || isLoading}
                    className="w-full py-2.5 bg-white text-slate-900 hover:bg-slate-100 font-bold text-[11px] rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Send size={11} />
                    {isLoading ? "Generating Outbox AI..." : "Deliver Automated Reminders"}
                  </button>
                </div>
                <div className="absolute right-0 bottom-0 text-white/[0.03] select-none scale-150 transform translate-x-3 translate-y-3 font-black text-9xl">
                  AI
                </div>
              </div>

              {/* Status checklist */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] text-slate-600 space-y-2 font-medium">
                <p className="font-bold text-slate-700">📌 Automated Scheduler Engine status:</p>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <p>Daily cron loop daemon evaluated successfully</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn("w-1.5 h-1.5 rounded-full", settings.emailEnabled || settings.smsEnabled ? "bg-green-500 animate-pulse" : "bg-red-400")} />
                  <p>Active listener streams hooked: {settings.emailEnabled ? "Email" : ""} {settings.smsEnabled ? "SMS" : ""}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Terminal Column: Interactive Smartphone SMS and Webmail Preview in Real-time (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-50/70 p-8 space-y-6">
          
          {/* Inbox toggles */}
          <div className="flex justify-between items-center sm:bg-white sm:p-1.5 sm:rounded-2xl sm:border sm:border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-3 hidden sm:block">Recipient Devices Screens</span>
            
            <div className="flex bg-slate-100 sm:bg-transparent p-1 sm:p-0 rounded-xl sm:rounded-none gap-2">
              <button
                onClick={() => setInboxMedium("Email")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                  inboxMedium === "Email" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-800"
                )}
              >
                <Mail size={13} />
                Webmail client
              </button>
              <button
                onClick={() => setInboxMedium("SMS")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                  inboxMedium === "SMS" ? "bg-white text-indigo-500 shadow-sm" : "text-slate-500 hover:text-slate-800"
                )}
              >
                <Smartphone size={13} />
                SMS Client (iPhone)
              </button>
            </div>
          </div>

          {/* Actual screens rendering */}
          {inboxMedium === "Email" ? (
            
            /* High fidelity Webmail simulator */
            <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm h-[400px] flex flex-col">
              
              {/* Webmail application headers */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 bg-red-400 rounded-full" />
                    <div className="w-2.5 h-2.5 bg-amber-400 rounded-full" />
                    <div className="w-2.5 h-2.5 bg-green-400 rounded-full" />
                  </div>
                  <span className="text-[9px] text-slate-400 font-black tracking-widest uppercase">SmartHealth Mail Client v3.1</span>
                </div>
                <div className="text-[10px] text-slate-500 font-bold bg-white border px-2 py-0.5 rounded-lg">
                  Inbox ({logs.filter(l => l.type === "Email").length})
                </div>
              </div>

              {/* Master grid of internal email list and email body reading panel */}
              <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12">
                
                {/* Internal email thread lists - 4 Column wide */}
                <div className="md:col-span-4 border-r border-slate-100 overflow-y-auto divide-y divide-slate-50 max-h-[350px]">
                  {logs.filter(l => l.type === "Email").length > 0 ? (
                    logs.filter(l => l.type === "Email").map((log) => (
                      <div
                        key={log.id}
                        onClick={() => setSelectedMail(log)}
                        className={cn(
                          "p-3.5 text-left cursor-pointer transition-colors space-y-1 relative",
                          selectedMail?.id === log.id ? "bg-primary/[0.03] border-l-2 border-primary" : "hover:bg-slate-50"
                        )}
                      >
                        <p className="text-[10px] font-black text-slate-800 leading-snug truncate">
                          {log.doctorName || "Simulated Clinic Dispatch"}
                        </p>
                        <p className="text-[9px] text-primary font-bold truncate">
                          {log.subject || "No Subject"}
                        </p>
                        <p className="text-[8px] text-slate-400 font-medium">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-[10px] text-slate-400 italic">
                      Empty Webmail Inbox
                    </div>
                  )}
                </div>

                {/* Internal email body reading viewer panel - 8 Columns wide */}
                <div className="md:col-span-8 overflow-y-auto p-5 max-h-[350px] bg-slate-50/30">
                  {selectedMail ? (
                    <div className="space-y-4">
                      <div className="pb-3 border-b border-slate-100 space-y-1.5">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-slate-800 text-xs leading-snug">
                            {selectedMail.subject || "System Notification Log Update"}
                          </h4>
                          <span className="text-[8px] px-1.5 py-0.5 bg-green-50 text-green-600 rounded">Delivered</span>
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-500 leading-none">
                          <p>From: <code>automated-alerts@smarthealth.net</code></p>
                          <p>{new Date(selectedMail.timestamp).toLocaleString()}</p>
                        </div>
                        <p className="text-[9px] text-slate-500 leading-none">To: <code>{selectedMail.recipient}</code></p>
                      </div>

                      {/* HTML parsing simulation. Safe because mock body is defined structurally */}
                      <div 
                        className="text-xs text-slate-700 leading-relaxed max-w-full overflow-x-hidden font-medium"
                        dangerouslySetInnerHTML={{ __html: selectedMail.body }} 
                      />
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 py-10">
                      <Mail size={32} strokeWidth={1} />
                      <p className="text-[10px] font-bold">Select any email log message thread to read content</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            
            /* High fidelity iOS / Simulated Smartphone wrapper UI */
            <div className="max-w-[340px] mx-auto bg-slate-900 border-[8px] border-slate-800 rounded-[48px] overflow-hidden shadow-2xl relative">
              
              {/* iPhone top sensor dynamic island mock */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-full z-20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-slate-950 rounded-full absolute right-4" />
              </div>

              {/* Internal phone screen screen area */}
              <div className="bg-slate-50 h-[430px] pt-6 flex flex-col select-none relative z-10 text-slate-800 font-sans">
                
                {/* Simulated iPhone Header status bar */}
                <div className="p-3 pb-1 border-b border-slate-200 bg-white flex justify-between items-center text-[9px] font-black text-slate-700 shrink-0">
                  <span>9:41 AM</span>
                  <div className="flex items-center gap-1 text-[10px]">
                    <code>5G</code>
                    <div className="w-4 h-2 bg-slate-800 rounded-sm relative">
                      <div className="absolute top-0.5 right-0.5 bottom-0.5 left-0.5 bg-white rounded-xs" />
                    </div>
                  </div>
                </div>

                {/* SMS Sender details */}
                <div className="bg-white p-3 border-b border-slate-200/80 shrink-0 text-center flex flex-col items-center">
                  <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-sm mb-1">
                    SM
                  </div>
                  <h4 className="text-[10px] font-black text-slate-800 leading-none">SmartHealth Alerts Inbox</h4>
                  <p className="text-[7px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">Shortcode: 32247</p>
                </div>

                {/* Smartphone SMS conversation scroller */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col-reverse justify-start">
                  {logs.filter(l => l.type === "SMS").length > 0 ? (
                    logs.filter(l => l.type === "SMS").map((log) => (
                      <div key={log.id} className="space-y-1">
                        <div className="flex flex-col items-start max-w-[85%]">
                          <div className="bg-slate-200/90 text-slate-850 p-3 rounded-2xl rounded-tl-sm text-left text-[11px] leading-snug font-medium border border-slate-200/30 shadow-xs">
                            {log.body}
                          </div>
                          <span className="text-[8px] text-slate-400 font-bold px-1 py-0.5 leading-none mt-1">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Delivered
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12 text-center space-y-1">
                      <MessageSquare size={24} strokeWidth={1} />
                      <p className="text-[9px] font-bold">No texts received yet</p>
                      <p className="text-[8px] max-w-[140px]">Trigger an automated alert or configure preferences to receive SMS</p>
                    </div>
                  )}
                </div>

                {/* iPhone Bottom Home swipe bar */}
                <div className="bg-white p-2 flex justify-center items-center gap-1.5 shrink-0 border-t border-slate-100">
                  <div className="flex-1 bg-slate-100 h-6.5 rounded-full px-3 py-1 text-[9px] text-slate-400 font-bold flex items-center">
                    iMessage
                  </div>
                  <div className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-sm">
                    <Send size={10} />
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
