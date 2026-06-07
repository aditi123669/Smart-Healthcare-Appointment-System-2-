export type UserRole = "patient" | "doctor" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
  address?: string;
  lat?: number;
  lng?: number;
  rating: number;
  image: string;
  description: string;
}

export interface Doctor extends User {
  specialty: string;
  experience: string;
  rating: number;
  image: string;
  hospitalId: string;
  hospitalName?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: "Upcoming" | "Completed" | "Pending" | "Cancelled";
  reason: string;
  doctorName?: string;
  doctorSpecialty?: string;
  doctorHospital?: string;
  doctorImage?: string;
  hospitalAddress?: string;
  hospitalLat?: number;
  hospitalLng?: number;
  hospitalLocation?: string;
  meetUrl?: string;
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
}

export interface CartItem extends Medicine {
  quantity: number;
}

export interface WaitingPatient {
  id: string;
  name: string;
  waitTime: string;
  reason: string;
  priority: "High" | "Normal";
}

export interface CallLog {
  id: string;
  patientName: string;
  duration: string;
  date: string;
  status: "Completed" | "Missed";
  type: "Video" | "Audio";
  recordingUrl?: string;
}
