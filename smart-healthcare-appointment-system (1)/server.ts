import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, getDoc, setDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase Firestore setup
const configPath = path.join(process.cwd(), "firebase-applet-config.json");
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, (firebaseConfig as any).firestoreDatabaseId);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Data
  const hospitals = [
    { id: "h1", name: "City General Hospital", location: "San Francisco, CA", address: "1001 Potrero Ave, San Francisco, CA 94110", lat: 37.7749, lng: -122.4194, rating: 4.8, image: "https://picsum.photos/seed/hosp1/400/300", description: "State-of-the-art medical facility specializing in cardiology and emergency care." },
    { id: "h2", name: "St. Jude's Children Hospital", location: "Oakland, CA", address: "747 52nd St, Oakland, CA 94609", lat: 37.8368, lng: -122.2625, rating: 4.9, image: "https://picsum.photos/seed/hosp2/400/300", description: "Leading pediatric care center dedicated to children's health and wellness." },
    { id: "h3", name: "Pacific Wellness Center", location: "San Jose, CA", address: "750 S Bascom Ave, San Jose, CA 95128", lat: 37.3235, lng: -121.9211, rating: 4.7, image: "https://picsum.photos/seed/hosp3/400/300", description: "Holistic health center focused on long-term wellness and rehabilitation." },
  ];

  const doctors = [
    { 
      id: "d1", 
      name: "Dr. Sarah Johnson", 
      specialty: "Cardiologist", 
      experience: "12 years", 
      rating: 4.8, 
      image: "https://picsum.photos/seed/doctor1/200/200",
      hospitalId: "h1",
      hospitalName: "City General Hospital"
    },
    { 
      id: "d2", 
      name: "Dr. Michael Chen", 
      specialty: "Dentist", 
      experience: "8 years", 
      rating: 4.9, 
      image: "https://picsum.photos/seed/doctor2/200/200",
      hospitalId: "h3",
      hospitalName: "Pacific Wellness Center"
    },
    { 
      id: "d3", 
      name: "Dr. Emily Williams", 
      specialty: "Pediatrician", 
      experience: "10 years", 
      rating: 4.7, 
      image: "https://picsum.photos/seed/doctor3/200/200",
      hospitalId: "h2",
      hospitalName: "St. Jude's Children Hospital"
    },
    { 
      id: "d4", 
      name: "Dr. James Wilson", 
      specialty: "Neurologist", 
      experience: "15 years", 
      rating: 4.9, 
      image: "https://picsum.photos/seed/doctor4/200/200",
      hospitalId: "h1",
      hospitalName: "City General Hospital"
    },
    { 
      id: "d5", 
      name: "Dr. Lisa Wong", 
      specialty: "Dermatologist", 
      experience: "7 years", 
      rating: 4.6, 
      image: "https://picsum.photos/seed/doctor5/200/200",
      hospitalId: "h3",
      hospitalName: "Pacific Wellness Center"
    },
  ];

  const appointments: any[] = [
    { id: "1", patientId: "p1", doctorId: "d1", date: "2026-04-20", time: "10:00 AM", status: "Upcoming", reason: "General Checkup" },
    { id: "2", patientId: "p1", doctorId: "d2", date: "2026-04-21", time: "02:30 PM", status: "Upcoming", reason: "Dental Cleaning" },
    { id: "3", patientId: "p1", doctorId: "d3", date: "2026-04-12", time: "09:00 AM", status: "Completed", reason: "Fever and Cold" },
    { id: "4", patientId: "p1", doctorId: "d4", date: "2026-04-05", time: "11:30 AM", status: "Completed", reason: "Neurological Consultation" },
    { id: "5", patientId: "p1", doctorId: "d5", date: "2026-03-25", time: "04:00 PM", status: "Cancelled", reason: "Skin Allergy" },
  ];

  const medicines = [
    { id: "m1", name: "Paracetamol", category: "Tablets", price: 5.99, image: "https://picsum.photos/seed/med1/200/200", description: "Pain reliever and fever reducer." },
    { id: "m2", name: "Cough Syrup", category: "Syrups", price: 12.50, image: "https://picsum.photos/seed/med2/200/200", description: "Effective relief for dry cough." },
    { id: "m3", name: "Vitamin C", category: "Supplements", price: 8.99, image: "https://picsum.photos/seed/med3/200/200", description: "Immune system support." },
    { id: "m4", name: "Ibuprofen", category: "Tablets", price: 7.45, image: "https://picsum.photos/seed/med4/200/200", description: "Anti-inflammatory pain relief." },
  ];

  const waitingPatients = [
    { id: "w1", name: "Alice Thompson", waitTime: "12 mins", reason: "Severe migraine and nausea", priority: "High" },
    { id: "w2", name: "Robert Blake", waitTime: "5 mins", reason: "Follow-up on blood test", priority: "Normal" },
    { id: "w3", name: "Elena Gilbert", waitTime: "2 mins", reason: "Skin rash consult", priority: "Normal" },
  ];

  const callHistory = [
    { id: "ch1", patientName: "Bonnie Bennett", duration: "14:22", date: "2026-04-20", status: "Completed", type: "Video", recordingUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
    { id: "ch2", patientName: "Caroline Forbes", duration: "08:45", date: "2026-04-20", status: "Completed", type: "Audio" },
    { id: "ch3", patientName: "Stefan Salvatore", duration: "10:15", date: "2026-04-19", status: "Completed", type: "Video", recordingUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
  ];

  // Seeding helper
  async function seedCollection(colName: string, defaultData: any[]) {
    try {
      const colRef = collection(db, colName);
      const snap = await getDocs(colRef);
      if (snap.empty) {
        console.log(`Seeding initial data for collection: ${colName}...`);
        for (const item of defaultData) {
          const docId = item.id;
          const docData = { ...item };
          delete docData.id;
          await setDoc(doc(db, colName, docId), docData);
        }
      }
    } catch (err) {
      console.error(`Error seeding ${colName}:`, err);
    }
  }

  async function prepareDatabase() {
    try {
      await seedCollection("hospitals", hospitals);
      await seedCollection("doctors", doctors);
      await seedCollection("medicines", medicines);
      await seedCollection("appointments", appointments);
      await seedCollection("waiting_patients", waitingPatients);
      await seedCollection("call_history", callHistory);
      
      // Seed settings if not exists
      const settingsDoc = doc(db, "settings", "reminders");
      const settingsSnap = await getDoc(settingsDoc);
      if (!settingsSnap.exists()) {
        await setDoc(settingsDoc, reminderSettings);
      }
      
      // Seed notification logs if empty
      const logsCol = collection(db, "notification_logs");
      const logsSnap = await getDocs(logsCol);
      if (logsSnap.empty) {
        for (const log of notificationLogs) {
          const docData = { ...log };
          delete docData.id;
          await setDoc(doc(db, "notification_logs", log.id), docData);
        }
      }
      console.log("Firestore database prepared successfully!");
    } catch (err) {
      console.error("Error preparing database:", err);
    }
  }

  // Trigger database preparation
  await prepareDatabase();

  // API Routes
  app.get("/api/hospitals", async (req, res) => {
    try {
      const colRef = collection(db, "hospitals");
      const snap = await getDocs(colRef);
      const list = snap.docs.map(docDoc => ({ id: docDoc.id, ...docDoc.data() }));
      res.json(list);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to fetch hospitals" });
    }
  });

  app.get("/api/doctors", async (req, res) => {
    try {
      const colRef = collection(db, "doctors");
      const snap = await getDocs(colRef);
      const list = snap.docs.map(docDoc => ({ id: docDoc.id, ...docDoc.data() }));
      res.json(list);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to fetch doctors" });
    }
  });

  app.get("/api/appointments", async (req, res) => {
    try {
      const [hospitalsSnap, doctorsSnap, appointmentsSnap] = await Promise.all([
        getDocs(collection(db, "hospitals")),
        getDocs(collection(db, "doctors")),
        getDocs(collection(db, "appointments"))
      ]);
      
      const hospitalsList = hospitalsSnap.docs.map(docDoc => ({ id: docDoc.id, ...docDoc.data() }));
      const doctorsList = doctorsSnap.docs.map(docDoc => ({ id: docDoc.id, ...docDoc.data() }));
      const appointmentsList = appointmentsSnap.docs.map(docDoc => ({ id: docDoc.id, ...docDoc.data() }));
      
      const enrichedAppointments = appointmentsList.map((appItem: any) => {
        const doctor: any = doctorsList.find((d: any) => d.id === appItem.doctorId);
        const hospital: any = doctor ? hospitalsList.find((h: any) => h.id === doctor.hospitalId) : null;
        return {
          ...appItem,
          doctorName: doctor?.name,
          doctorSpecialty: doctor?.specialty,
          doctorHospital: doctor?.hospitalName,
          doctorImage: doctor?.image,
          hospitalAddress: hospital?.address || "",
          hospitalLat: hospital?.lat,
          hospitalLng: hospital?.lng,
          hospitalLocation: hospital?.location || ""
        };
      });
      res.json(enrichedAppointments);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to fetch appointments" });
    }
  });

  app.get("/api/medicines", async (req, res) => {
    try {
      const colRef = collection(db, "medicines");
      const snap = await getDocs(colRef);
      const list = snap.docs.map(docDoc => ({ id: docDoc.id, ...docDoc.data() }));
      res.json(list);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to fetch medicines" });
    }
  });

  app.get("/api/doctor/waiting-list", async (req, res) => {
    try {
      const colRef = collection(db, "waiting_patients");
      const snap = await getDocs(colRef);
      const list = snap.docs.map(docDoc => ({ id: docDoc.id, ...docDoc.data() }));
      res.json(list);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to fetch waiting list" });
    }
  });

  app.get("/api/doctor/call-history", async (req, res) => {
    try {
      const colRef = collection(db, "call_history");
      const snap = await getDocs(colRef);
      const list = snap.docs.map(docDoc => ({ id: docDoc.id, ...docDoc.data() }));
      res.json(list);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to fetch call history" });
    }
  });

  app.delete("/api/doctor/waiting-list/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await deleteDoc(doc(db, "waiting_patients", id));
      res.json({ message: "Patient removed from queue", id });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to remove patient from queue" });
    }
  });

  app.patch("/api/doctor/waiting-list/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { priority } = req.body;
      const docRef = doc(db, "waiting_patients", id);
      await updateDoc(docRef, { priority });
      const snap = await getDoc(docRef);
      res.json({ id: snap.id, ...snap.data() });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to update waiting list priority" });
    }
  });

  // Simulated Notification & Reminder State
  let reminderSettings = {
    emailEnabled: true,
    smsEnabled: true,
    userEmail: "aditimazumder3@gmail.com",
    userPhone: "+1 (555) 724-4328",
    leadTime: "1 Day Prior",
  };

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

  let notificationLogs: NotificationLog[] = [
    {
      id: "log-initial-1",
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), // 24 hours ago
      type: "Email",
      recipient: "aditimazumder3@gmail.com",
      subject: "Appointment Secured - City General Hospital",
      body: `Hi Aditi, your session with Dr. Sarah Johnson (Cardiologist) at City General Hospital is successfully confirmed for 2026-04-20 at 10:00 AM. Location: 1001 Potrero Ave, San Francisco, CA 94110. Preparation tip: Drink plenty of water and bring previous heart reports if any.`,
      status: "Delivered",
      doctorName: "Dr. Sarah Johnson"
    },
    {
      id: "log-initial-2",
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
      type: "SMS",
      recipient: "+1 (555) 724-4328",
      body: `[SmartHealth SMS] Reminder for your visit with Dr. Sarah Johnson tomorrow at 10:00 AM. Location: City General Hospital - 1001 Potrero Ave.`,
      status: "Delivered",
      doctorName: "Dr. Sarah Johnson"
    }
  ];

  async function generateAIPersonalizedNotification(
    type: "Email" | "SMS",
    patientName: string,
    doctorName: string,
    specialty: string,
    hospitalName: string,
    hospitalAddress: string,
    time: string,
    date: string,
    leadTime: string
  ): Promise<{ text: string; subject?: string }> {
    const isEmail = type === "Email";
    
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "YOUR_API_KEY") {
      try {
        const g_ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });
        const formatDescription = isEmail 
          ? "an elegant HTML email notification inside a modern styled div card. Include sections for Appointment timing, Medical Center address, pre-appointment instructions, and diagnostic check lists"
          : "a warm friendly SMS alert message under 180 characters highlighting appointment timing and a gentle hydration tip";
          
        const response = await g_ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: `Create a supportive, highly personalized healthcare automated ${type} reminder.
          
          Context details to integrate:
          - Patient: ${patientName}
          - Doctor: ${doctorName} (Specialization: ${specialty})
          - Medical Center: ${hospitalName} (Address: ${hospitalAddress})
          - Scheduled Time: ${time} on date ${date}
          - Configured Lead Time: ${leadTime} before visit
          
          Design instructions:
          - Use a warm, professional, and comforting medical assistant voice.
          - Highlight dynamic parameters.
          - Structure output for: ${formatDescription}.
          - Do not provide code blocks wrapping HTML, yield output inside a clean wrapper.
          `,
        });
        if (response && response.text) {
          // Normalize formatting
          let parsedText = response.text.replace(/```html|```/g, "").trim();
          return {
            text: parsedText,
            subject: isEmail ? `🔔 SmartHealth Alert: Upcoming visit with ${doctorName} on ${date}` : undefined
          };
        }
      } catch (err) {
        console.warn("Gemini generation failed, using fallback engine:", err);
      }
    }

    // High fidelity template fallback
    if (isEmail) {
      return {
        subject: `🔔 SmartHealth Calendar Alert: appointment with ${doctorName} on ${date}`,
        text: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #f1f5f9; border-radius: 24px; color: #1e293b; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
              <span style="background-color: #dbeafe; color: #2563eb; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 99px; text-transform: uppercase; letter-spacing: 0.05em;">Automated Reminder • ${leadTime} Dispatch</span>
            </div>
            <h2 style="color: #0f172a; margin: 0 0 8px; font-weight: 800; font-size: 20px; letter-spacing: -0.025em;">Secure Dental/Consultation Booking</h2>
            <p style="margin: 0 0 20px; font-size: 14px; color: #64748b; line-height: 1.5;">Dear ${patientName}, here are the details for your upcoming consultation with <b>${doctorName}</b>.</p>
            
            <div style="background-color: #f8fafc; padding: 18px; border-radius: 16px; margin: 20px 0; border: 1px solid #f1f5f9;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="padding: 6px 0; color: #64748b; width: 30%;"><b>Provider:</b></td>
                  <td style="padding: 6px 0; color: #0f172a;"><b>${doctorName}</b> (${specialty})</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;"><b>Facility:</b></td>
                  <td style="padding: 6px 0; color: #0f172a;">${hospitalName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;"><b>Address:</b></td>
                  <td style="padding: 6px 0; color: #0f172a; font-style: italic;">${hospitalAddress}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;"><b>Time:</b></td>
                  <td style="padding: 6px 0; color: #2563eb; font-weight: bold;">${date} at ${time}</td>
                </tr>
              </table>
            </div>

            <div style="font-size: 12px; background-color: #ecfdf5; color: #065f46; padding: 12px 16px; border-radius: 12px; font-weight: 500;">
              🏥 <b>Clinical Tip:</b> Do not consume high-caffeine beverages starting 3 hours before your blood pressure checks to guarantee highly accurate base measurements.
            </div>

            <div style="border-top: 1px solid #f1f5f9; margin-top: 24px; padding-top: 16px; font-size: 11px; color: #94a3b8; text-align: center;">
              This system is fully automated. You can toggle/disable reminders at any time from your Patient Settings panel.
            </div>
          </div>
        `
      };
    } else {
      return {
        text: `[SmartHealth Alert] Hi ${patientName}! Reminder: You have an appointment with ${doctorName} tomorrow at ${time} at ${hospitalName}. Directions: ${hospitalAddress}. Safe travels! 💊`
      };
    }
  }

  // Auto Settings endpoints
  app.get("/api/reminders/settings", async (req, res) => {
    try {
      const snap = await getDoc(doc(db, "settings", "reminders"));
      if (snap.exists()) {
        res.json(snap.data());
      } else {
        res.json(reminderSettings);
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to fetch settings" });
    }
  });

  app.post("/api/reminders/settings", async (req, res) => {
    try {
      const newSettings = req.body;
      const settingsDocRef = doc(db, "settings", "reminders");
      await setDoc(settingsDocRef, newSettings, { merge: true });
      
      const snap = await getDoc(settingsDocRef);
      const updatedSettings: any = snap.data() || reminderSettings;
      
      // Log a delivery confirmation trigger to test SMS & Webmail inbox updates instantly
      const logId = "log-" + Math.random().toString(36).substr(2, 9);
      const settingsLog = {
        timestamp: new Date().toISOString(),
        type: "Email" as const,
        recipient: updatedSettings.userEmail || "aditimazumder3@gmail.com",
        subject: "🔔 Automated Notification Preferences Saved",
        body: `<p>Hi Patient,</p>
               <p>Your healthcare appointment reminders are successfully configured:</p>
               <ul>
                 <li><b>Email Reminders:</b> ${updatedSettings.emailEnabled ? "Active (On)" : "Disabled (Off)"}</li>
                 <li><b>Text / SMS Alerts:</b> ${updatedSettings.smsEnabled ? "Active (On)" : "Disabled (Off)"}</li>
                 <li><b>Delivery window:</b> ${updatedSettings.leadTime || "1 Day Prior"}</li>
               </ul>`,
        status: "Delivered" as const,
        doctorName: "SmartHealth Automated Admin"
      };

      await setDoc(doc(db, "notification_logs", logId), settingsLog);
      res.json({ message: "Settings updated successfully", settings: updatedSettings });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to update settings" });
    }
  });

  app.get("/api/reminders/logs", async (req, res) => {
    try {
      const snap = await getDocs(collection(db, "notification_logs"));
      const logs = snap.docs.map(docDoc => ({ id: docDoc.id, ...docDoc.data() }));
      // Sort newest first
      logs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      res.json(logs);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to fetch logs" });
    }
  });

  app.delete("/api/reminders/logs", async (req, res) => {
    try {
      const colRef = collection(db, "notification_logs");
      const snap = await getDocs(colRef);
      await Promise.all(snap.docs.map(dDoc => deleteDoc(dDoc.ref)));
      res.json({ message: "Notification terminal cleared" });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to clear logs" });
    }
  });

  app.post("/api/reminders/trigger", async (req, res) => {
    try {
      const { appointmentId, type } = req.body;
      const appointmentSnap = await getDoc(doc(db, "appointments", appointmentId));
      if (!appointmentSnap.exists()) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      const appointmentItem: any = { id: appointmentSnap.id, ...appointmentSnap.data() };
      
      const [hospitalsSnap, doctorsSnap, settingsSnap] = await Promise.all([
        getDocs(collection(db, "hospitals")),
        getDocs(collection(db, "doctors")),
        getDoc(doc(db, "settings", "reminders"))
      ]);
      
      const hospitalsList = hospitalsSnap.docs.map(docDoc => ({ id: docDoc.id, ...docDoc.data() }));
      const doctorsList = doctorsSnap.docs.map(docDoc => ({ id: docDoc.id, ...docDoc.data() }));
      const currentSettings: any = settingsSnap.exists() ? settingsSnap.data() : reminderSettings;
      
      const doctor: any = doctorsList.find((d: any) => d.id === appointmentItem.doctorId);
      const hospital: any = doctor ? hospitalsList.find((h: any) => h.id === doctor.hospitalId) : null;
      
      const docName = doctor?.name || "Dr. Johnson";
      const docSpec = doctor?.specialty || "Specialist";
      const hospName = doctor?.hospitalName || "Medical Center";
      const hospAddress = hospital?.address || "1001 Potrero Ave, San Francisco, CA 94110";
      
      if (type === "SMS" || type === "Both") {
        const smsResult = await generateAIPersonalizedNotification(
          "SMS", 
          "Aditi", 
          docName, 
          docSpec, 
          hospName, 
          hospAddress, 
          appointmentItem.time, 
          appointmentItem.date,
          currentSettings.leadTime || "1 Day Prior"
        );
        const logId = "log-manual-" + Math.random().toString(36).substr(2, 9);
        await setDoc(doc(db, "notification_logs", logId), {
          timestamp: new Date().toISOString(),
          type: "SMS",
          recipient: currentSettings.userPhone || "+1 (555) 724-4328",
          body: smsResult.text,
          status: "Delivered",
          doctorName: docName
        });
      }
      
      if (type === "Email" || type === "Both") {
        const emailResult = await generateAIPersonalizedNotification(
          "Email", 
          "Aditi", 
          docName, 
          docSpec, 
          hospName, 
          hospAddress, 
          appointmentItem.time, 
          appointmentItem.date,
          currentSettings.leadTime || "1 Day Prior"
        );
        const logId = "log-manual-" + Math.random().toString(36).substr(2, 9);
        await setDoc(doc(db, "notification_logs", logId), {
          timestamp: new Date().toISOString(),
          type: "Email",
          recipient: currentSettings.userEmail || "aditimazumder3@gmail.com",
          subject: emailResult.subject,
          body: emailResult.text,
          status: "Delivered",
          doctorName: docName
        });
      }
      
      const updatedLogsSnap = await getDocs(collection(db, "notification_logs"));
      const logs = updatedLogsSnap.docs.map(docDoc => ({ id: docDoc.id, ...docDoc.data() }));
      logs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      res.json({ message: "Automated alert triggered successfully", logs });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message || "Error during alert routing generation" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const newId = Math.random().toString(36).substr(2, 9);
      const newAppointment = { ...req.body, id: newId };
      const docData = { ...newAppointment };
      delete docData.id;
      
      await setDoc(doc(db, "appointments", newId), docData);
      
      const [doctorsSnap, hospitalsSnap, settingsSnap] = await Promise.all([
        getDocs(collection(db, "doctors")),
        getDocs(collection(db, "hospitals")),
        getDoc(doc(db, "settings", "reminders"))
      ]);
      
      const doctorsList = doctorsSnap.docs.map(docDoc => ({ id: docDoc.id, ...docDoc.data() }));
      const hospitalsList = hospitalsSnap.docs.map(docDoc => ({ id: docDoc.id, ...docDoc.data() }));
      const currentSettings: any = settingsSnap.exists() ? settingsSnap.data() : reminderSettings;
      
      const doctor: any = doctorsList.find((d: any) => d.id === newAppointment.doctorId);
      const hospital: any = doctor ? hospitalsList.find((h: any) => h.id === doctor.hospitalId) : null;
      
      const docName = doctor?.name || "Doctor Specialist";
      const docSpec = doctor?.specialty || "Medicine";
      const hospName = doctor?.hospitalName || "Clinical Center";
      const hospAddress = hospital?.address || "1001 Potrero Ave, San Francisco, CA 94110";

      try {
        if (currentSettings.smsEnabled) {
          const smsMsg = await generateAIPersonalizedNotification(
            "SMS", 
            "Aditi", 
            docName, 
            docSpec, 
            hospName, 
            hospAddress, 
            newAppointment.time, 
            newAppointment.date,
            currentSettings.leadTime || "1 Day Prior"
          );
          const logId = "log-auto-sms-" + Math.random().toString(36).substr(2, 9);
          await setDoc(doc(db, "notification_logs", logId), {
            timestamp: new Date().toISOString(),
            type: "SMS",
            recipient: currentSettings.userPhone || "+1 (555) 724-4328",
            body: smsMsg.text,
            status: "Delivered",
            doctorName: docName
          });
        }

        if (currentSettings.emailEnabled) {
          const emailMsg = await generateAIPersonalizedNotification(
            "Email", 
            "Aditi", 
            docName, 
            docSpec, 
            hospName, 
            hospAddress, 
            newAppointment.time, 
            newAppointment.date,
            currentSettings.leadTime || "1 Day Prior"
          );
          const logId = "log-auto-email-" + Math.random().toString(36).substr(2, 9);
          await setDoc(doc(db, "notification_logs", logId), {
            timestamp: new Date().toISOString(),
            type: "Email",
            recipient: currentSettings.userEmail || "aditimazumder3@gmail.com",
            subject: emailMsg.subject,
            body: emailMsg.text,
            status: "Delivered",
            doctorName: docName
          });
        }
      } catch (e) {
        console.warn("Instant auto alerts scheduling error:", e);
      }

      res.status(201).json(newAppointment);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to create appointment" });
    }
  });

  app.post("/api/appointments/:id/cancel", async (req, res) => {
    try {
      const { id } = req.params;
      const docRef = doc(db, "appointments", id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        await updateDoc(docRef, { status: "Cancelled" });
        res.json({ message: "Appointment cancelled successfully", appointment: { id, ...snap.data(), status: "Cancelled" } });
      } else {
        res.status(404).json({ error: "Appointment not found" });
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to cancel appointment" });
    }
  });

  app.post("/api/appointments/:id/meet", async (req, res) => {
    try {
      const { id } = req.params;
      const { meetUrl } = req.body;
      const docRef = doc(db, "appointments", id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        await updateDoc(docRef, { meetUrl });
        res.json({ message: "Google Meet link updated successfully", appointment: { id, ...snap.data(), meetUrl } });
      } else {
        res.status(404).json({ error: "Appointment not found" });
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to update Google Meet link" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
