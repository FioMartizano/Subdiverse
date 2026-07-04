import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import businesshub_banner from "../../assets/businesshub_banner.png";
import { 
  Cherry, CakeSlice, Coffee, Salad, Dumbbell, Volleyball, Search, 
  Home, Scissors, BookOpen, MapPin, Phone, Clock, X 
} from 'lucide-react';

const customIcons = [
  { id: 'L1', Icon: Cherry,    pos: 'bottom-3 left-1 px-0 justify-between', rot: 'rotate-[17deg]' },
  { id: 'L2', Icon: CakeSlice,  pos: 'bottom-3 left-10 px-5 justify-between',  rot: 'rotate-[20deg]' },
  { id: 'L3', Icon: Coffee,    pos: 'bottom-3 left-10 px-20 justify-between', rot: 'rotate-[5deg]' },
  { id: 'L4', Icon: Salad,      pos: 'bottom-3 left-5 px-40 justify-between',  rot: 'rotate-[3deg]' },
  { id: 'L5', Icon: Dumbbell,   pos: 'bottom-3 left-5 px-60 justify-between', rot: 'rotate-[50deg]' },
  { id: 'L7', Icon: Volleyball, pos: 'bottom-3 left-27 px-70 justify-between', rot: 'rotate-[3deg]' },
  { id: 'R1', Icon: Cherry,    pos: 'bottom-3 right-1 px-0 justify-end',  rot: '-rotate-[17deg]' },
  { id: 'R2', Icon: CakeSlice,  pos: 'bottom-3 right-10 px-5 justify-end',  rot: '-rotate-[20deg]' },
  { id: 'R3', Icon: Dumbbell,   pos: 'bottom-3 right-10 px-20 justify-end', rot: '-rotate-[5deg]' },
  { id: 'R4', Icon: Salad,      pos: 'bottom-3 right-5 px-40 justify-end',  rot: '-rotate-[3deg]' },
  { id: 'R5', Icon: Coffee,    pos: 'bottom-3 right-22 px-40 justify-end', rot: '-rotate-[0deg]' },
  { id: 'R6', Icon: Volleyball, pos: 'bottom-2 right-21 px-60 justify-end', rot: '-rotate-[0deg]' },
];

const SAMPLE_BUSINESSES = [
  { id: 1, name: "Windward Heights Villas", category: "house-rent", description: "Premium 3-bedroom residential luxury townhomes ready for lease with skyline views.", phone: "(555) 019-2834", address: "Block 4, Lot 12, Upper Ridge Drive", hours: "9:00 AM - 6:00 PM", image: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=600&q=80" },
  { id: 2, name: "The Daily Grind Cafe", category: "cafe-resto", description: "Artisanal espresso bar serving small-batch roasts and organic community breakfasts daily.", phone: "(555) 023-8841", address: "Commercial Center, Ground Floor", hours: "6:30 AM - 8:00 PM", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80" },
  { id: 3, name: "Iron & Pulse Fitness Club", category: "fitness", description: "Fully equipped athletic center offering cross-training, free weights, and cardio equipment.", phone: "(555) 044-9102", address: "Clubhouse Complex, East Wing", hours: "5:00 AM - 10:00 PM", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80" },
  { id: 4, name: "Classic & Co. Cuts", category: "barber-salon", description: "Premium modern grooming studio specializing in traditional hot towel shaves and custom styling.", phone: "(555) 091-7723", address: "Starlight Strip, Suite B", hours: "10:00 AM - 8:00 PM", image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80" },
  { id: 5, name: "Little Sprouts Academy", category: "daycare-academy", description: "Certified early education development and enrichment daycare programs for toddlers.", phone: "(555) 032-1198", address: "Community Quad, Building 3", hours: "7:00 AM - 5:30 PM", image: "https://images.unsplash.com/photo-1576489922095-a3a44d03395c?auto=format&fit=crop&w=600&q=80" },
  { id: 6, name: "Bella Vista Bistro", category: "cafe-resto", description: "Fine alfresco family dining highlighting handcrafted wood-fired brick oven pizzas.", phone: "(555) 082-3345", address: "Commercial Center, Lookout Deck", hours: "11:00 AM - 10:00 PM", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80" }
];

function BusinessHub() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: 'house-rent', label: 'House for rent', Icon: Home },
    { id: 'cafe-resto', label: 'Cafe & Resto', Icon: Coffee },
    { id: 'fitness', label: 'Fitness', Icon: Dumbbell },
    { id: 'barber-salon', label: 'Barber & Salon', Icon: Scissors },
    { id: 'daycare-academy', label: 'Daycare & Academy', Icon: BookOpen }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.1
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: [0.25, 1, 0.5, 1] 
      }
    }
  };

  const iconVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { 
      opacity: 0.2, 
      scale: 1,
      transition: { 
        duration: 0.8, 
        ease: "easeOut" 
      }
    }
  };

  const filteredBusinesses = useMemo(() => {
    return SAMPLE_BUSINESSES.filter(biz => {
      const matchesCategory = selectedCategory === "all" || biz.category === selectedCategory;
      const matchesSearch = biz.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            biz.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            biz.address.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="w-full flex flex-col items-center bg-gray-50 min-h-screen">
      {/* BANNER SECTION WITH ANIMATION */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative w-full h-[400px] bg-primary overflow-hidden shadow-xl"
        style={{ borderBottomLeftRadius: '3rem', borderBottomRightRadius: '3rem' }}
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-400 to-transparent" />
        <div className="relative w-full max-w-7xl mx-auto h-full flex items-center px-12">
          <motion.div variants={itemVariants} className="text-white z-10 max-w-lg">
            <h1 className="text-6xl font-extrabold mb-6 tracking-tight">
              Neighborhood <span className="text-orange-500">Essentials</span>
            </h1>
            <p className="text-xl text-slate-300 font-light">
              Discover local merchant services, dining selections, and administrative amenities near Windward Hills.
            </p>
          </motion.div>
          <motion.img 
            variants={itemVariants}
            src={businesshub_banner} 
            alt="Banner" 
            className="absolute right-0 top-3 w-[700px] opacity-90 drop-shadow-2xl" 
          />
        </div>
        {/* Decorative Icons with Animation */}
        {customIcons.map((item) => (
          <motion.div 
            variants={iconVariants}
            initial="hidden"
            animate="visible"
            key={item.id} 
            className={`absolute w-full flex items-end text-white/20 pointer-events-none ${item.pos}`}
          >
            <item.Icon className={item.rot} size={48} strokeWidth={1.5} />
          </motion.div>
        ))}
      </motion.section>

      {/* SEARCH AND FILTERS */}
      <section className="w-full max-w-5xl mx-auto -mt-12 px-4 z-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white p-4 rounded-3xl shadow-2xl border border-gray-100"
        >
          <div className="relative w-full mb-6">
            <Search className="absolute left-5 top-5 h-6 w-6 text-orange-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-5 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-orange-500/20 text-lg transition-all"
              placeholder="Search merchants, services, or locations..."
            />
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((btn) => {
              const isActive = selectedCategory === btn.id;
              return (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  key={btn.id}
                  onClick={() => setSelectedCategory(isActive ? "all" : btn.id)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-300 ${
                    isActive ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-gray-100 hover:bg-gray-200 text-slate-700'
                  } font-semibold text-sm`}
                >
                  <btn.Icon size={18} />
                  {btn.label}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* LISTING GRID */}
      <section className="w-full max-w-7xl mx-auto py-16 px-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-between items-center mb-8 px-2"
        >
          <h2 className="text-2xl font-bold text-slate-800">Verified Establishments</h2>
          {selectedCategory !== "all" && (
            <motion.button 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setSelectedCategory("all")} 
              className="text-sm text-orange-600 font-semibold flex items-center gap-1 hover:underline"
            >
              <X size={14} /> Clear Filters
            </motion.button>
          )}
        </motion.div>

        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredBusinesses.map((biz) => (
              <motion.article 
                layout
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ 
                  duration: 0.4, 
                  ease: [0.25, 1, 0.5, 1] 
                }}
                key={biz.id} 
                className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col border border-gray-100 group"
              >
                <div className="h-48 w-full relative overflow-hidden">
                  <img 
                    src={biz.image} 
                    alt={biz.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-700 shadow-sm">
                    {biz.category.replace('-', ' ')}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{biz.name}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">{biz.description}</p>
                  <div className="space-y-3 pt-4 border-t border-gray-100 text-xs text-slate-500">
                    <div className="flex items-center gap-2"><MapPin size={14} className="text-orange-400" /> {biz.address}</div>
                    <div className="flex items-center gap-2"><Phone size={14} className="text-orange-400" /> {biz.phone}</div>
                    <div className="flex items-center gap-2"><Clock size={14} className="text-orange-400" /> {biz.hours}</div>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredBusinesses.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-slate-500 text-lg">No establishments found matching your criteria.</p>
            <button 
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="mt-4 text-orange-500 font-semibold hover:underline"
            >
              Clear all filters
            </button>
          </motion.div>
        )}
      </section>
    </div>
  );
}

export default BusinessHub;