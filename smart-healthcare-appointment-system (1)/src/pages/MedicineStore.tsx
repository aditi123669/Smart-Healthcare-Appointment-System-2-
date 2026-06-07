import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Plus, 
  Minus, 
  ShoppingCart, 
  ChevronRight,
  Star,
  Info,
  Heart
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Medicine } from "@/src/types";

export default function MedicineStore({ addToCart }: { addToCart: (p: Medicine) => void }) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Tablets", "Syrups", "Supplements", "First Aid", "Skincare"];

  useEffect(() => {
    fetch("/api/medicines")
      .then(res => res.json())
      .then(data => {
        setMedicines(data);
        setLoading(false);
      });
  }, []);

  const filteredMedicines = activeCategory === "All" 
    ? medicines 
    : medicines.filter(m => m.category === activeCategory);

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Search & Categories Header */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40 py-6">
        <div className="container mx-auto px-4 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Health Store</h1>
              <p className="text-slate-500 font-medium italic">Genuine medicines delivered to your door.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative flex-1 lg:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search medicines, vitamins, wellness..." 
                  className="w-full pl-12 pr-4 py-3 bg-slate-100 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />
              </div>
              <button className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:text-primary transition-colors">
                <Filter size={20} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-6 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all",
                  activeCategory === cat 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
             [1,2,3,4,5,6,7,8].map(i => <div key={i} className="aspect-[3/4] bg-white animate-pulse rounded-3xl border border-slate-100" />)
          ) : filteredMedicines.length > 0 ? (
            filteredMedicines.map(med => (
              <MedicineCard key={med.id} med={med} onAdd={() => addToCart(med)} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center space-y-4">
               <ShoppingBag size={64} className="mx-auto text-slate-200" />
               <p className="text-slate-500 font-medium">No medicines found in this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MedicineCard({ med, onAdd }: { med: Medicine, onAdd: () => void, key?: React.Key }) {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="bg-white rounded-[32px] overflow-hidden shadow-soft border border-slate-100 group flex flex-col"
    >
      <div className="relative aspect-square p-2">
        <img 
          src={med.image} 
          alt={med.name} 
          className="w-full h-full object-cover rounded-[24px] group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 right-4 translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
          <button className="p-2 bg-white/80 backdrop-blur shadow-sm rounded-xl text-slate-400 hover:text-red-500 transition-colors">
            <Heart size={18} />
          </button>
        </div>
        <div className="absolute bottom-4 left-4">
           <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-lg text-[10px] font-bold text-slate-800 shadow-sm uppercase tracking-wider">{med.category}</span>
        </div>
      </div>

      <div className="p-6 space-y-4 flex-1 flex flex-col">
        <div className="flex-1 space-y-2 text-left">
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">{med.name}</h3>
          <p className="text-xs text-slate-500 leading-relaxed italic line-clamp-2">{med.description}</p>
        </div>

        <div className="flex items-center gap-1 text-yellow-400">
           <Star size={14} fill="currentColor" />
           <span className="text-xs font-bold text-slate-900">4.8</span>
           <span className="text-xs text-slate-400 font-medium ml-1">(120+)</span>
        </div>

        <div className="flex items-center justify-between pt-2">
           <div className="text-left">
             <p className="text-2xl font-black text-slate-900 tracking-tighter">${med.price.toFixed(2)}</p>
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">In Stock</p>
           </div>
           <button 
            onClick={onAdd}
            className="p-3 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 group/btn"
           >
             <Plus size={20} className="group-active/btn:scale-90 transition-transform" />
           </button>
        </div>
      </div>
    </motion.div>
  );
}
