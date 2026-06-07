import React from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { CartItem } from "@/src/types";
import { cn } from "@/src/lib/utils";

export default function CartPage({ cart, removeFromCart, updateQuantity }: { 
  cart: CartItem[], 
  removeFromCart: (id: string) => void,
  updateQuantity: (id: string, q: number) => void
}) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 5.00;
  const total = subtotal + shipping;
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-sm">
           <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-400">
             <ShoppingCart size={48} />
           </div>
           <div className="space-y-2">
             <h1 className="text-3xl font-bold text-slate-900">Your cart is empty</h1>
             <p className="text-slate-500 italic">Looks like you haven't added any medicines yet.</p>
           </div>
           <Link to="/store" className="block w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
             Start Shopping
           </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Cart Items List */}
          <div className="flex-1 space-y-6">
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-4">
              Shopping Cart
              <span className="text-sm font-bold px-3 py-1 bg-slate-200 text-slate-600 rounded-full">{cart.length} Items</span>
            </h1>

            <div className="space-y-4">
              {cart.map(item => (
                <motion.div 
                  layout
                  key={item.id}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6"
                >
                  <img src={item.image} alt={item.name} className="w-24 h-24 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                  <div className="flex-1 space-y-1">
                    <h3 className="font-bold text-slate-900 text-lg">{item.name}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{item.category}</p>
                    <p className="text-lg font-black text-primary">${item.price.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 text-slate-500 hover:text-primary hover:bg-white rounded-xl transition-all"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-bold text-slate-900 w-6 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 text-slate-500 hover:text-primary hover:bg-white rounded-xl transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-3 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
               <Feature icon={<Truck size={20} />} label="Free Shipping" sub="On orders over $50" />
               <Feature icon={<ShieldCheck size={20} />} label="Quality Assured" sub="Certified medicines" />
               <Feature icon={<RotateCcw size={20} />} label="Easy Returns" sub="30 day policy" />
            </div>
          </div>

          {/* Order Summary Checkout */}
          <div className="lg:w-96 space-y-8">
            <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100 space-y-8">
              <h3 className="text-xl font-bold text-slate-900">Order Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Subtotal</span>
                  <span className="text-slate-900 font-bold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Shipping</span>
                  <span className={cn("font-bold", shipping === 0 ? "text-green-500" : "text-slate-900")}>
                    {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="h-px bg-slate-100 my-4" />
                <div className="flex justify-between items-center">
                  <span className="text-slate-900 font-black text-xl">Total</span>
                  <span className="text-primary font-black text-3xl tracking-tighter">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Promo Code</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="HEALTH20" className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-bold" />
                    <button className="px-4 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm">Apply</button>
                  </div>
                </div>

                <button 
                  onClick={() => navigate("/dashboard")}
                  className="w-full py-5 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group"
                >
                  Proceed to Checkout
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-4 pt-4 grayscale opacity-40">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" referrerPolicy="no-referrer" />
                 <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-8" alt="Mastercard" referrerPolicy="no-referrer" />
                 <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-5" alt="Paypal" referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, label, sub }: { icon: React.ReactNode, label: string, sub: string }) {
  return (
    <div className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
      <div className="w-12 h-12 bg-slate-50 text-primary rounded-2xl flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-800">{label}</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{sub}</p>
      </div>
    </div>
  );
}
