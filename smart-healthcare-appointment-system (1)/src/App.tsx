/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Home, 
  Settings, 
  Calendar, 
  Users, 
  ShoppingBag, 
  LayoutDashboard, 
  User as UserIcon, 
  Plus, 
  LogOut, 
  Bell, 
  Search,
  ShoppingCart,
  Menu,
  X,
  ClipboardList,
  Stethoscope,
  Activity,
  History,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { User, Doctor, Appointment, Medicine, CartItem, UserRole } from "@/src/types";

// Page Components (to be created)
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AppointmentBooking from "./pages/AppointmentBooking";
import MedicineStore from "./pages/MedicineStore";
import CartPage from "./pages/CartPage";
import PrescriptionPage from "./pages/PrescriptionPage";
import MedicalRecordsPage from "./pages/MedicalRecordsPage";
import AppointmentDetailsPage from "./pages/AppointmentDetailsPage";

import { AuthProvider, useAuth } from "./components/AuthProvider";

export default function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

function App() {
  const { user: firebaseUser, profile, loading: authLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Sync simulated user with Firebase user
  useEffect(() => {
    if (!authLoading) {
      if (firebaseUser && profile) {
        setUser({
          id: firebaseUser.uid,
          name: profile.name,
          email: firebaseUser.email || "",
          role: profile.role,
          image: profile.image || ""
        });
      } else {
        // Fallback for legacy simulation (if no firebase user yet)
        const savedUser = localStorage.getItem("user");
        if (savedUser && !firebaseUser) setUser(JSON.parse(savedUser));
      }
    }
  }, [firebaseUser, profile, authLoading]);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const addToCart = (product: Medicine) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, q: number) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, q) } : item));
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} logout={logout} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage login={login} />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                user ? (
                  user.role === "patient" ? <PatientDashboard user={user} /> :
                  user.role === "doctor" ? <DoctorDashboard user={user} /> :
                  <AdminDashboard user={user} />
                ) : <Navigate to="/login" />
              } 
            />

            <Route path="/book-appointment" element={user?.role === "patient" ? <AppointmentBooking /> : <Navigate to="/login" />} />
            <Route path="/store" element={<MedicineStore addToCart={addToCart} />} />
            <Route path="/cart" element={<CartPage cart={cart} removeFromCart={removeFromCart} updateQuantity={updateQuantity} />} />
            <Route path="/prescription/:id" element={<PrescriptionPage user={user} />} />
            <Route path="/full-history" element={user ? <MedicalRecordsPage /> : <Navigate to="/login" />} />
            <Route path="/appointment/:id" element={user ? <AppointmentDetailsPage user={user} /> : <Navigate to="/login" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

function Navbar({ user, logout, cartCount }: { user: User | null, logout: () => void, cartCount: number }) {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isDashboard = location.pathname.includes("dashboard");

  return (
    <nav className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      scrolled || isDashboard ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent"
    )}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-primary rounded-xl text-white group-hover:scale-110 transition-transform">
            <Stethoscope size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">SmartHealth</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <Link to="/store" className="hover:text-primary transition-colors">Pharmacy</Link>
          <Link to="/#services" className="hover:text-primary transition-colors">Services</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/cart" className="relative p-2 text-slate-600 hover:text-primary transition-colors">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>
          
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors">
                <LayoutDashboard size={18} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-5 py-2 text-slate-600 hover:text-primary font-medium">Login</Link>
              <Link to="/register" className="px-5 py-2 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white">
            <Stethoscope size={24} />
            <span className="text-xl font-bold tracking-tight">SmartHealth</span>
          </div>
          <p className="text-sm">Revolutionizing healthcare appointment and management with a seamless digital experience.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/store" className="hover:text-white transition-colors">Pharmacy</Link></li>
            <li><Link to="/book-appointment" className="hover:text-white transition-colors">Book Appointment</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Support</h4>
          <ul className="space-y-2 text-sm">
            <li>Help Center</li>
            <li>Terms of Service</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li>Email: hello@smarthealth.com</li>
            <li>Phone: +1 (555) 000-0000</li>
            <li>Location: San Francisco, CA</li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-sm">
        <p>&copy; 2026 SmartHealth Inc. All rights reserved.</p>
      </div>
    </footer>
  );
}

