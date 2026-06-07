import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Video, 
  Sparkles, 
  Send, 
  Plus, 
  Check, 
  VideoOff, 
  Inbox, 
  ExternalLink, 
  ShieldCheck, 
  Link as LinkIcon, 
  AlertCircle, 
  Calendar,
  Layers,
  RefreshCw,
  LogOut,
  ChevronRight,
  User,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { 
  googleSignIn, 
  getAccessToken, 
  setAccessToken, 
  isWorkspaceConnected, 
  sendGmailMessage, 
  listGmailMessages, 
  getGmailMessage, 
  createGoogleMeetSpace,
  listCalendarEvents,
  createCalendarEvent
} from '../lib/workspace';
import { Appointment } from '../types';

interface GoogleWorkspacePanelProps {
  user: any;
  appointments?: Appointment[];
  onAppointmentUpdated?: () => void;
}

interface WebmailMessage {
  id: string;
  snippet: string;
  sender: string;
  subject: string;
  dateString: string;
  bodyText?: string;
}

export default function GoogleWorkspacePanel({ 
  user, 
  appointments = [], 
  onAppointmentUpdated 
}: GoogleWorkspacePanelProps) {
  
  const [isConnected, setIsConnected] = useState(isWorkspaceConnected());
  const [activeTab, setActiveTab] = useState<'gmail' | 'meet' | 'calendar'>('gmail');
  
  // Google Calendar States
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);
  const [calendarStatus, setCalendarStatus] = useState<string | null>(null);
  
  // Gmail Compose Form State
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ success: boolean; msg: string } | null>(null);
  
  // Gmail Inbox Fetching State
  const [inboxEmails, setInboxEmails] = useState<WebmailMessage[]>([]);
  const [isLoadingInbox, setIsLoadingInbox] = useState(false);
  const [selectedInboxMail, setSelectedInboxMail] = useState<WebmailMessage | null>(null);
  
  // Google Meet Creation State
  const [selectedAppointmentId, setSelectedAppointmentId] = useState('');
  const [isCreatingMeet, setIsCreatingMeet] = useState(false);
  const [meetLinkCreated, setMeetLinkCreated] = useState<string | null>(null);
  const [meetStatus, setMeetStatus] = useState<string | null>(null);

  // Sync state on mount or change
  useEffect(() => {
    setIsConnected(isWorkspaceConnected());
    if (isWorkspaceConnected()) {
      handleRefreshInbox();
      handleRefreshCalendar();
    }
  }, []);

  const handleOAuthConnect = async () => {
    try {
      const authResult = await googleSignIn();
      if (authResult) {
        setIsConnected(true);
        handleRefreshInbox();
        handleRefreshCalendar();
      }
    } catch (err: any) {
      console.error(err);
      alert("Failed to connect with Google identity provider. Ensure clinical scopes were authorized.");
    }
  };

  const handleDisconnect = () => {
    setAccessToken(null);
    setIsConnected(false);
    setInboxEmails([]);
    setSelectedInboxMail(null);
    setCalendarEvents([]);
  };

  const parseDateTime = (dateStr: string, timeStr: string): { startISO: string, endISO: string } => {
    try {
      const parts = timeStr.trim().split(' ');
      const timePart = parts[0];
      const ampm = parts[1] || 'AM';
      
      const [hourStr, minStr] = timePart.split(':');
      let hour = parseInt(hourStr, 10);
      const min = parseInt(minStr, 10);
      
      if (ampm.toUpperCase() === 'PM' && hour < 12) {
        hour += 12;
      } else if (ampm.toUpperCase() === 'AM' && hour === 12) {
        hour = 0;
      }
      
      const pad = (n: number) => String(n).padStart(2, '0');
      const startISO = `${dateStr}T${pad(hour)}:${pad(min)}:00`;
      
      // Default duration is 45 minutes
      let endHour = hour;
      let endMin = min + 45;
      if (endMin >= 60) {
        endMin -= 60;
        endHour += 1;
      }
      if (endHour >= 24) {
        endHour = 23;
        endMin = 59;
      }
      const endISO = `${dateStr}T${pad(endHour)}:${pad(endMin)}:00`;
      return { startISO, endISO };
    } catch (e) {
      return {
        startISO: `${dateStr}T09:00:00`,
        endISO: `${dateStr}T09:45:00`
      };
    }
  };

  const handleRefreshCalendar = async () => {
    if (!isWorkspaceConnected()) return;
    setIsLoadingCalendar(true);
    setCalendarStatus(null);
    try {
      const data = await listCalendarEvents();
      if (data && data.items) {
        setCalendarEvents(data.items);
      } else {
        setCalendarEvents([]);
      }
    } catch (err: any) {
      console.error("Google Calendar sync failed:", err);
      setCalendarStatus(`Sync failed: ${err.message || err}`);
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  const handleAddToCalendar = async (appointment: Appointment) => {
    if (!isWorkspaceConnected()) {
      alert("Please link your Google Workspace first.");
      return;
    }

    const confirmAdd = window.confirm(
      `Confirm adding this medical appointment to your primary Google Calendar?\n\n` +
      `• Provider: ${appointment.doctorName || 'General Practitioner'}\n` +
      `• Specialty: ${appointment.doctorSpecialty || 'Clinical Visit'}\n` +
      `• Scheduled: ${appointment.date} at ${appointment.time}`
    );
    if (!confirmAdd) return;

    setIsSyncingCalendar(true);
    setCalendarStatus("Registering clinical event with Google Calendar API...");

    try {
      const { startISO, endISO } = parseDateTime(appointment.date, appointment.time);
      const hostURL = window.location.origin;
      const description = `This is a secure SmartHealth medical consultation slot.

• Provider: ${appointment.doctorName}
• Reason of visit: ${appointment.reason}
• Status: Confirmed
• Portal Link: ${hostURL}/appointments/${appointment.id}
${appointment.meetUrl ? `\nJoin Encrypted Telehealth Call: ${appointment.meetUrl}` : ''}

Please make sure you have prepared your diagnostic logs and telehealth clearances.`;

      await createCalendarEvent({
        summary: `🩺 SmartHealth: ${appointment.doctorName} (${appointment.reason || 'Clinical Appointment'})`,
        description,
        location: appointment.doctorHospital || "SmartHealth Virtual Clinic",
        startDateTime: startISO,
        endDateTime: endISO
      });

      setCalendarStatus("Success! Medical appointment successfully added to your primary Google Calendar.");
      alert("Appointment successfully published to your Google Calendar!");
      handleRefreshCalendar();
    } catch (err: any) {
      console.error(err);
      setCalendarStatus(`Publish error: ${err.message || err}`);
      alert(`Could not sync to calendar: ${err.message || err}`);
    } finally {
      setIsSyncingCalendar(false);
    }
  };

  const handleRefreshInbox = async () => {
    if (!isWorkspaceConnected()) return;
    setIsLoadingInbox(true);
    try {
      const listData = await listGmailMessages();
      if (listData && listData.messages) {
        const fetchedEmails: WebmailMessage[] = [];
        // Resolve snippets for the top 5 letters
        const itemsToFetch = listData.messages.slice(0, 5);
        for (const item of itemsToFetch) {
          try {
            const detail = await getGmailMessage(item.id);
            const headers = detail.payload?.headers || [];
            const sub = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
            const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || 'Unknown Sender';
            const dateVal = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || '';
            
            fetchedEmails.push({
              id: item.id,
              snippet: detail.snippet || '',
              sender: from,
              subject: sub,
              dateString: dateVal ? new Date(dateVal).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
              bodyText: detail.snippet || 'Body loading...'
            });
          } catch (mErr) {
            console.warn("Skipped reading individual mail detail:", mErr);
          }
        }
        setInboxEmails(fetchedEmails);
        if (fetchedEmails.length > 0) {
          setSelectedInboxMail(fetchedEmails[0]);
        }
      } else {
        setInboxEmails([]);
      }
    } catch (err) {
      console.error("Gmail inbox sync failed:", err);
    } finally {
      setIsLoadingInbox(false);
    }
  };

  const handleSendEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailTo || !emailSubject || !emailBody) {
      alert("Please complete all compose fields first.");
      return;
    }

    // MANDATORY USER CONFIRMATION (per Task Lifecycle Guidelines for mutation/destructive/sending operations)
    const proceed = window.confirm(`Confirm sending clinical Gmail message to: ${emailTo}? This will be sent from your personal Google account.`);
    if (!proceed) return;

    setIsSendingEmail(true);
    setEmailStatus(null);

    const formattedHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #f0f0f0; border-radius: 16px; overflow: hidden; color: #1e293b;">
        <div style="background-color: #0284c7; padding: 24px; text-align: center; color: white;">
          <h2 style="margin: 0; font-weight: 800; letter-spacing: -0.5px;">SmartHealth clinical alert notice</h2>
        </div>
        <div style="padding: 24px; line-height: 1.6;">
          <p style="margin-top: 0;">Hello,</p>
          <p>${emailBody.replace(/\n/g, '<br/>')}</p>
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          <p style="font-size: 11px; color: #64748b; text-align: center; margin-bottom: 0;">
            This communication was sent securely using real-time Google Workspace interfaces integrated with SmartHealth Clinic platform.
          </p>
        </div>
      </div>
    `;

    try {
      await sendGmailMessage(emailTo, emailSubject, formattedHtml);
      setEmailStatus({ success: true, msg: "Clinical consultation letter transmitted securely via Gmail!" });
      setEmailSubject('');
      setEmailBody('');
      // Sync outbox
      handleRefreshInbox();
    } catch (err: any) {
      console.error("Transmit fault:", err);
      setEmailStatus({ success: false, msg: `Transmission fault: ${err.message || err}` });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleCreateMeetLink = async () => {
    if (!selectedAppointmentId) {
      alert("Please select an upcoming appointment to link this Meet.");
      return;
    }

    // MANDATORY USER CONFIRMATION (mutation/create operation)
    const proceed = window.confirm("Create a live Google Meet conferencing space and link it persistently to this medical appointment?");
    if (!proceed) return;

    setIsCreatingMeet(true);
    setMeetStatus("Connecting to Google Meet authorization engine...");
    try {
      const meet = await createGoogleMeetSpace();
      setMeetLinkCreated(meet.meetingUri);
      
      setMeetStatus("Google Meet space provisioned successfully! Linking with clinical records database...");
      
      // Update the backend appointment record persistently with this meet room URL!
      const patchRes = await fetch(`/api/appointments/${selectedAppointmentId}/meet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetUrl: meet.meetingUri })
      });

      if (patchRes.ok) {
        setMeetStatus(`Persistently coupled Meet with consultation #${selectedAppointmentId}!`);
        if (onAppointmentUpdated) {
          onAppointmentUpdated();
        }
      } else {
        setMeetStatus(`Meet is active, but failed saving to appt details.`);
      }
    } catch (err: any) {
      console.error(err);
      setMeetStatus(`Google Meet Creation Error: ${err.message || err}`);
    } finally {
      setIsCreatingMeet(false);
    }
  };

  // Find upcoming eligible appointments that don't already have Google Meet URLs
  const eligibleAppointments = appointments.filter(a => a.status === "Upcoming" && !a.meetUrl);

  return (
    <div className="bg-white rounded-[40px] border border-slate-100 shadow-soft overflow-hidden">
      
      {/* Workspace Header Panel */}
      <div className="p-8 pb-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 w-fit">
              <Sparkles size={11} className="animate-pulse" />
              Google Workspace Services
            </span>
            <span className={cn(
              "text-[9px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider",
              isConnected 
                ? "bg-green-50 text-green-600 border-green-100" 
                : "bg-amber-50 text-amber-600 border-amber-100 animate-pulse"
            )}>
              {isConnected ? "OAuth Active" : "Authorization Required"}
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Clinical Gmail & Meet Desk</h3>
          <p className="text-xs text-slate-500 font-medium">Link your actual G Suite medical coordinates for real patient emailing & dynamic telemedicine meeting rooms.</p>
        </div>

        {isConnected && (
          <button 
            onClick={handleDisconnect}
            className="p-2.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl hover:bg-rose-100 active:scale-95 transition-all text-xs flex items-center gap-1.5 font-bold"
            title="Revoke browser memory credentials"
          >
            <LogOut size={13} />
            Disconnect Office
          </button>
        )}
      </div>

      {!isConnected ? (
        
        /* Direct onboarding with official GSI layout criteria */
        <div className="p-10 text-center max-w-xl mx-auto space-y-8 my-8">
          <div className="w-16 h-16 bg-blue-50 text-primary border border-blue-100 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck size={32} />
          </div>
          
          <div className="space-y-2">
            <h4 className="text-xl font-bold text-slate-800">Secure Healthcare Workspace Sync</h4>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Establish a client-side sandbox to communicate via <strong className="text-slate-700">Gmail</strong> and launch premium encryption telehealth spaces over <strong className="text-slate-700">Google Meet</strong> directly utilizing your account's workspace permissions.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center pt-2">
            {/* Custom crafted GSI button according to Google design criteria */}
            <button 
              onClick={handleOAuthConnect}
              className="px-6 py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all font-bold text-xs flex items-center gap-3.5 shadow-md active:scale-95 border border-slate-700 group cursor-pointer"
            >
              <div className="w-5 h-5 bg-white rounded-md p-0.5 flex items-center justify-center">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-full h-full">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
              </div>
              <span>Connect Clinical Google Workspace</span>
              <ChevronRight size={13} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <p className="text-[10px] text-slate-400 mt-3 font-semibold uppercase tracking-widest">
              Secured client-side • credentials cleared in-memory upon logout
            </p>
          </div>
        </div>

      ) : (

        /* Active Workspace Dashboard Layout Split */
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          
          {/* Active Services Panel Column - 5 cols */}
          <div className="lg:col-span-5 p-8 space-y-6">
            
            {/* Workspace tab selectors */}
            <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
              <button
                onClick={() => setActiveTab('gmail')}
                className={cn(
                  "flex-1 py-2 rounded-xl text-[10px] md:text-xs font-bold transition-all flex items-center justify-center gap-1",
                  activeTab === 'gmail' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                )}
              >
                <Mail size={13} />
                Gmail
              </button>
              <button
                onClick={() => setActiveTab('meet')}
                className={cn(
                  "flex-1 py-2 rounded-xl text-[10px] md:text-xs font-bold transition-all flex items-center justify-center gap-1",
                  activeTab === 'meet' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                )}
              >
                <Video size={13} />
                Meet Rooms
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={cn(
                  "flex-1 py-2 rounded-xl text-[10px] md:text-xs font-bold transition-all flex items-center justify-center gap-1",
                  activeTab === 'calendar' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                )}
              >
                <Calendar size={13} />
                Calendar
              </button>
            </div>

            {activeTab === 'gmail' && (
              /* Direct composing module to write patient medical files / letters */
              <form onSubmit={handleSendEmailSubmit} className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Compose Clinical Notice</span>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Recipient Address</label>
                  <input 
                    type="email" 
                    value={emailTo}
                    onChange={e => setEmailTo(e.target.value)}
                    placeholder="doctor-office@smarthealth.net"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:border-primary/20 rounded-xl focus:bg-white text-xs font-bold outline-none transition-all placeholder:font-medium"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Subject Header</label>
                  <input 
                    type="text" 
                    value={emailSubject}
                    onChange={e => setEmailSubject(e.target.value)}
                    placeholder="Clinical Medical Followup Alert - SmartHealth"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:border-primary/20 rounded-xl focus:bg-white text-xs font-bold outline-none transition-all placeholder:font-medium"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Letter Body Content</label>
                  <textarea 
                    value={emailBody}
                    onChange={e => setEmailBody(e.target.value)}
                    rows={4}
                    placeholder="Dear care coordinator, I have prepared my biometric telemetry reports as required for next week's diagnostic visit. Please find notes enclosed..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:border-primary/20 rounded-xl focus:bg-white text-xs font-medium outline-none transition-all placeholder:font-medium resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="w-full py-3.5 bg-primary text-white hover:bg-primary/95 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Send size={13} />
                  {isSendingEmail ? "Transmitting via Gmail..." : "Deliver secure clinical Email"}
                </button>

                {emailStatus && (
                  <div className={cn(
                    "p-3 rounded-xl border text-[11px] font-bold flex items-center gap-2 animate-pulse",
                    emailStatus.success 
                      ? "bg-green-50 border-green-100 text-green-700" 
                      : "bg-red-50 border-red-100 text-red-700"
                  )}>
                    <AlertCircle size={14} className="shrink-0" />
                    <p>{emailStatus.msg}</p>
                  </div>
                )}
              </form>
            )}

            {activeTab === 'meet' && (
              /* Direct telemedicine generator interface */
              <div className="space-y-5">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Orchestrate Telehealth Link</span>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Upcoming Consultation Slot</label>
                  
                  {eligibleAppointments.length > 0 ? (
                    <select
                      value={selectedAppointmentId}
                      onChange={e => setSelectedAppointmentId(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-150 focus:border-primary/20 rounded-xl focus:bg-white text-xs font-bold outline-none transition-all cursor-pointer"
                    >
                      <option value="">Select eligible upcoming appt...</option>
                      {eligibleAppointments.map(a => (
                        <option key={a.id} value={a.id}>
                          With {a.doctorName} on {a.date} ({a.time})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-dashed rounded-2xl text-[11px] text-slate-500 font-medium italic text-center">
                      No generic upcoming consultations require new Meet rooms.
                    </div>
                  )}
                </div>

                <button
                  onClick={handleCreateMeetLink}
                  disabled={isCreatingMeet || !selectedAppointmentId}
                  className="w-full py-4 bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Video size={13} />
                  {isCreatingMeet ? "Orchestrating Meet Space..." : "Generate live Google Meet Room"}
                </button>

                {meetStatus && (
                  <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] space-y-2">
                    <p className="font-bold text-slate-700 flex items-center gap-1.5">
                      <ShieldCheck size={12} className="text-green-600 animate-pulse" />
                      Status: {meetStatus}
                    </p>
                    
                    {meetLinkCreated && (
                      <div className="flex gap-2">
                        <a 
                          href={meetLinkCreated}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 py-1.5 bg-green-500 text-white rounded-lg text-center font-bold font-mono text-[10px] hover:bg-green-600 transition-all flex items-center justify-center gap-1.5"
                        >
                          Join Active Meet
                          <ExternalLink size={11} />
                        </a>
                      </div>
                    )}
                  </div>
                )}

                <div className="p-4 bg-blue-50/50 border border-blue-100/50 rounded-2xl text-[10px] text-slate-600 space-y-1.5 font-medium leading-relaxed">
                  <p className="font-bold text-slate-700 flex items-center gap-1">
                    <Heart size={10} className="text-primary" />
                    Clinical Safety Guideline:
                  </p>
                  <p>Created Google Meet links transmit fully encrypted video feeds on HIPAA compliance scopes. Patients automatically receive join credentials via connected dashboard records instantly.</p>
                </div>
              </div>
            )}

            {activeTab === 'calendar' && (
              /* Google Calendar interface */
              <div className="space-y-5">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Publish Clinic Slots</span>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    Instantly export your scheduled consulting appointments directly to your personal Google Calendar account:
                  </p>
                </div>

                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                  {appointments.length > 0 ? (
                    appointments.map(appt => (
                      <div 
                        key={appt.id} 
                        className="p-3.5 bg-slate-50 border border-slate-100/80 rounded-2xl flex flex-col gap-3 hover:border-slate-200 transition-all text-sans"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="text-xs font-bold text-slate-800 leading-tight">
                              Consultation: {appt.doctorName || "General Practitioner"}
                            </h5>
                            <p className="text-[10px] text-slate-400 font-bold mt-1">
                              {appt.date} • {appt.time}
                            </p>
                            <p className="text-[9px] text-slate-500 font-medium mt-0.5 italic">
                              Reason: {appt.reason}
                            </p>
                          </div>
                          <span className={cn(
                            "text-[8px] font-black uppercase px-2.5 py-0.5 rounded-full border tracking-wider",
                            appt.status === "Upcoming" ? "bg-green-50 text-green-600 border-green-150" : "bg-slate-100 text-slate-500 border-slate-200"
                          )}>
                            {appt.status}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddToCalendar(appt)}
                          disabled={isSyncingCalendar}
                          className="w-full py-2 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          <Calendar size={12} />
                          Add to primary Google Calendar
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 bg-slate-50 border border-dashed rounded-2xl text-[11px] text-slate-500 font-medium italic text-center">
                      No medical appointments scheduled yet.
                    </div>
                  )}
                </div>

                {calendarStatus && (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-600 space-y-1">
                    <p className="font-bold text-slate-705 flex items-center gap-1">
                      <ShieldCheck size={12} className="text-emerald-500 shrink-0" />
                      Status update:
                    </p>
                    <p className="text-slate-500 font-medium">{calendarStatus}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Live Mail Reader Panel - 7 cols */}
          <div className="lg:col-span-7 bg-slate-50/40 p-8 space-y-6">
            <div className="flex justify-between items-center bg-white p-2 rounded-2xl border border-slate-100/80">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-3">
                {activeTab === 'gmail' && 'Connected Inbox Highlights'}
                {activeTab === 'meet' && 'Telemedicine Meet Rooms'}
                {activeTab === 'calendar' && 'Google Calendar Agenda'}
              </span>
              
              {activeTab === 'gmail' && (
                <button 
                  onClick={handleRefreshInbox}
                  disabled={isLoadingInbox}
                  className="p-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all outline-none"
                >
                  <RefreshCw size={11} className={cn(isLoadingInbox && "animate-spin")} />
                  Sync mails
                </button>
              )}

              {activeTab === 'calendar' && (
                <button 
                  onClick={handleRefreshCalendar}
                  disabled={isLoadingCalendar}
                  className="p-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all outline-none"
                >
                  <RefreshCw size={11} className={cn(isLoadingCalendar && "animate-spin")} />
                  Sync calendar
                </button>
              )}
            </div>

            {activeTab === 'gmail' && (
              /* Gmail webmail view */
              <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm h-[380px] flex flex-col">
                <div className="p-3.5 border-b border-indigo-50/50 bg-slate-50/50 flex justify-between items-center shrink-0">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Clinical Workspace Mailbox</span>
                  <p className="text-[9px] text-slate-500 font-bold bg-white border px-2 py-0.5 rounded">
                    Recent: {inboxEmails.length} messages
                  </p>
                </div>

                <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12">
                  <div className="md:col-span-5 border-r border-slate-100 overflow-y-auto max-h-[330px] divide-y divide-slate-50">
                    {inboxEmails.length > 0 ? (
                      inboxEmails.map(mail => (
                        <div
                          key={mail.id}
                          onClick={() => setSelectedInboxMail(mail)}
                          className={cn(
                            "p-3 text-left cursor-pointer transition-colors space-y-1 relative",
                            selectedInboxMail?.id === mail.id ? "bg-primary/[0.02] border-l-2 border-primary" : "hover:bg-slate-50"
                          )}
                        >
                          <p className="text-[10px] font-black text-slate-800 truncate leading-tight">
                            {mail.sender.split('<')[0]?.trim()}
                          </p>
                          <p className="text-[9px] text-primary font-bold truncate">
                            {mail.subject}
                          </p>
                          <p className="text-[8px] text-slate-400 font-medium">
                            {mail.dateString}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-10 text-center text-[10px] text-slate-400 italic">
                        {isLoadingInbox ? "Syncing Workspace inbox..." : "Inbox is empty or lacks clinic signals."}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-7 bg-slate-50/20 p-4 overflow-y-auto max-h-[330px]">
                    {selectedInboxMail ? (
                      <div className="space-y-3">
                        <div className="pb-2 border-b border-slate-100 space-y-1">
                          <h5 className="font-bold text-slate-800 text-xs">{selectedInboxMail.subject}</h5>
                          <p className="text-[9px] text-slate-500">From: <code>{selectedInboxMail.sender}</code></p>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                          {selectedInboxMail.snippet}...
                        </p>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-1.5">
                        <Inbox size={24} strokeWidth={1} />
                        <p className="text-[9px] font-bold">No mail selected</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'meet' && (
              /* Google Meet schedules list view */
              <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm min-h-[300px] flex flex-col justify-start space-y-4">
                <span className="text-xs font-bold text-slate-850">Connected Google Meet Consultation Logs</span>
                
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[310px]">
                  {appointments.filter(a => a.meetUrl).length > 0 ? (
                    appointments.filter(a => a.meetUrl).map(a => (
                      <div 
                        key={a.id} 
                        className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between gap-4 hover:border-slate-200 transition-all"
                      >
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Consultation with {a.doctorName}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold">
                            {a.date} • {a.time} (Visit #{a.id})
                          </p>
                        </div>

                        <a 
                          href={a.meetUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="px-3.5 py-1.5 bg-primary/10 text-primary border border-primary/10 hover:bg-primary hover:text-white rounded-xl text-[10px] font-bold transition-all flex items-center gap-1"
                        >
                          Join Room
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-slate-400 space-y-2 flex flex-col items-center justify-center h-full">
                      <VideoOff size={32} strokeWidth={1} />
                      <p className="text-[10px] font-bold">No Active Telesupport sessions linked</p>
                      <p className="text-[9px] max-w-[200px] leading-normal mx-auto font-medium text-slate-400">
                        Use the generator panel on the left to allocate Google Meet spaces to scheduled appointments.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'calendar' && (
              /* Google Calendar schedules list view */
              <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm min-h-[300px] flex flex-col justify-start space-y-4">
                <span className="text-xs font-bold text-slate-850">Connected Google Calendar Schedule</span>
                
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[310px]">
                  {calendarEvents.length > 0 ? (
                    calendarEvents.map(event => {
                      const start = event.start?.dateTime || event.start?.date || '';
                      const dateFormatted = start ? new Date(start).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) : 'All Day';
                      const timeFormatted = event.start?.dateTime ? new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All Day';
                      
                      return (
                        <div 
                          key={event.id} 
                          className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between gap-4 hover:border-slate-200 transition-all font-sans"
                        >
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5 leading-tight">
                              <Calendar size={11} className="text-indigo-500 shrink-0" />
                              {event.summary || '(No Title)'}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold">
                              {dateFormatted} at {timeFormatted}
                            </p>
                            {event.location && (
                              <p className="text-[9px] text-slate-500 font-medium truncate max-w-[240px]">
                                📍 {event.location}
                              </p>
                            )}
                          </div>
                          
                          {event.htmlLink && (
                            <a 
                              href={event.htmlLink} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 shrink-0"
                            >
                              Join URL
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 text-center text-slate-400 space-y-2 flex flex-col items-center justify-center h-full">
                      <Calendar size={32} strokeWidth={1} className="text-slate-300" />
                      <p className="text-[10px] font-bold">No upcoming calendar events detected</p>
                      <p className="text-[9px] max-w-[200px] leading-normal mx-auto font-medium text-slate-400">
                        {isLoadingCalendar ? "Syncing Google Calendar agenda..." : "Fetch your active events from Google using the sync button above."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
