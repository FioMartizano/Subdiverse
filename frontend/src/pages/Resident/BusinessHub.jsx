import React, { useState, useMemo } from 'react';
import businesshub_banner from "../../assets/businesshub_banner.png";
import { 
  Cherry, CakeSlice, Coffee, Salad, Dumbbell, Volleyball, Search, 
  Home, Scissors, BookOpen, MapPin, Phone, Clock, ArrowUpRight 
} from 'lucide-react';

const customIcons = [
  // --- LEFT SIDE ---
  { id: 'L1', Icon: Cherry,     pos: 'bottom-13 left-1 px-0 justify-between', rot: 'rotate-[17deg]' },
  { id: 'L2', Icon: CakeSlice,  pos: 'bottom-9 left-10 px-5 justify-between',  rot: 'rotate-[20deg]' },
  { id: 'L3', Icon: Coffee,     pos: 'bottom-7 left-10 px-20 justify-between', rot: 'rotate-[5deg]' },
  { id: 'L4', Icon: Salad,      pos: 'bottom-5 left-5 px-40 justify-between',  rot: 'rotate-[3deg]' },
  { id: 'L5', Icon: Dumbbell,   pos: 'bottom-2 left-21 px-60 justify-between', rot: 'rotate-[50deg]' },
  { id: 'L7', Icon: Volleyball, pos: 'bottom-2 left-27 px-70 justify-between', rot: 'rotate-[3deg]' },

  // --- RIGHT SIDE ---
  { id: 'R1', Icon: Cherry,     pos: 'bottom-13 right-1 px-0 justify-end',  rot: '-rotate-[17deg]' },
  { id: 'R2', Icon: CakeSlice,  pos: 'bottom-9 right-10 px-5 justify-end',  rot: '-rotate-[20deg]' },
  { id: 'R3', Icon: Dumbbell,   pos: 'bottom-7 right-10 px-20 justify-end', rot: '-rotate-[5deg]' },
  { id: 'R4', Icon: Salad,      pos: 'bottom-5 right-5 px-40 justify-end',  rot: '-rotate-[3deg]' },
  { id: 'R5', Icon: Coffee,     pos: 'bottom-4 right-22 px-40 justify-end', rot: '-rotate-[0deg]' },
  { id: 'R6', Icon: Volleyball, pos: 'bottom-2 right-21 px-60 justify-end', rot: '-rotate-[0deg]' },
];

// Mock Business Data Stream Source Array
const SAMPLE_BUSINESSES = [
  {
    id: 1,
    name: "Windward Heights Villas",
    category: "house-rent",
    description: "Premium 3-bedroom residential luxury townhomes ready for lease with skyline views.",
    phone: "(555) 019-2834",
    address: "Block 4, Lot 12, Upper Ridge Drive",
    hours: "9:00 AM - 6:00 PM",
    image: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 2,
    name: "The Daily Grind Cafe",
    category: "cafe-resto",
    description: "Artisanal espresso bar serving small-batch roasts and organic community breakfasts daily.",
    phone: "(555) 023-8841",
    address: "Commercial Center, Ground Floor",
    hours: "6:30 AM - 8:00 PM",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 3,
    name: "Iron & Pulse Fitness Club",
    category: "fitness",
    description: "Fully equipped athletic center offering cross-training, free weights, and cardio equipment.",
    phone: "(555) 044-9102",
    address: "Clubhouse Complex, East Wing",
    hours: "5:00 AM - 10:00 PM",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 4,
    name: "Classic & Co. Cuts",
    category: "barber-salon",
    description: "Premium modern grooming studio specializing in traditional hot towel shaves and custom styling.",
    phone: "(555) 091-7723",
    address: "Starlight Strip, Suite B",
    hours: "10:00 AM - 8:00 PM",
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 5,
    name: "Little Sprouts Academy",
    category: "daycare-academy",
    description: "Certified early education development and enrichment daycare programs for toddlers.",
    phone: "(555) 032-1198",
    address: "Community Quad, Building 3",
    hours: "7:00 AM - 5:30 PM",
    image: "https://images.unsplash.com/photo-1576489922095-a3a44d03395c?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 6,
    name: "Bella Vista Bistro",
    category: "cafe-resto",
    description: "Fine alfresco family dining highlighting handcrafted wood-fired brick oven pizzas.",
    phone: "(555) 082-3345",
    address: "Commercial Center, Lookout Deck",
    hours: "11:00 AM - 10:00 PM",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80"
  }
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

  // Dynamic Query Filter Compute Pipeline
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
    <div className="w-full flex flex-col items-center bg-gray-50 min-h-screen pt-24 pb-20">
      <div className="w-[98%] max-w-[1600px] relative">
        
        {/* BANNER COMPONENT */}
        <section 
          id="hero-banner"
          aria-label="Neighborhood Essentials Hero Banner"
          className="relative w-full h-[400px] bg-[var(--color-primary)] rounded-t-3xl overflow-hidden shadow-md flex items-end"
          style={{ 
            borderBottomLeftRadius: '50% 15%', 
            borderBottomRightRadius: '50% 15%' 
          }}
        >
          <div className="absolute top-0 left-0 w-full h-[85%] flex items-center justify-between px-16 lg:px-24 gap-12">
            <div className="w-[40%] text-white z-10 max-w-xl">
              <h1 className="text-5xl lg:text-6xl font-bold mb-4 leading-tight drop-shadow-xl">
                Neighborhood <br /> Essentials
              </h1>
              <p className="text-lg lg:text-xl opacity-90 drop-shadow-md">
                Discover local merchant services, dining selections, and administrative amenities open near Windward Hills.
              </p>
            </div>

            <div className="w-[60%] flex justify-end z-10 relative">
              <img 
                src={businesshub_banner} 
                alt="House and Groceries" 
                className="absolute left-33 top-[-205px] w-[800px] max-w-none object-contain drop-shadow-2xl" 
              />
            </div>
          </div>

          {customIcons.map((item) => (
            <div 
              key={item.id} 
              className={`absolute w-full flex items-end text-[#2F5931] opacity-80 pointer-events-none ${item.pos}`}
            >
              <item.Icon className={item.rot} size={48} strokeWidth={1.5} />
            </div>
          ))}
        </section>

        {/* SEARCH AND CONTROL ACTION FILTERS */}
        <section 
          id="search-categories"
          aria-label="Search and Category Filters"
          className="w-full max-w-5xl mx-auto mt-[-40px] pt-15 z-20 relative px-4"
        >
          {/* Dynamic Search Box Input */}
          <div className="relative w-full mb-8">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 bg-white shadow-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800 transition-all"
              placeholder="Search for merchants, menus, keywords or locations..."
              aria-label="Search for services"
            />
          </div>

          {/* Interactive Category Filter Row buttons */}
          <div className="flex flex-wrap justify-center gap-4 md:flex-nowrap">
            {categories.map((btn) => {
              const isActive = selectedCategory === btn.id;
              return (
                <button 
                  key={btn.id}
                  onClick={() => setSelectedCategory(isActive ? "all" : btn.id)}
                  className={`flex items-center justify-between px-6 py-4 rounded-xl shadow-md min-w-[220px] transition-all duration-300 transform hover:-translate-y-0.5
                    ${isActive 
                      ? 'bg-orange-600 border-2 border-orange-300 scale-102 shadow-orange-600/20' 
                      : 'bg-[var(--color-secondary)] hover:bg-orange-600/90'
                    } 
                    text-white font-bold flex-1`}
                >
                  <span className="truncate mr-2">{btn.label}</span>
                  <btn.Icon size={22} className="shrink-0" />
                </button>
              );
            })}
          </div>
        </section>

        {/* DYNAMIC SHOWCASE CONTAINER GRID PANELS */}
        <section className="w-full max-w-7xl mx-auto mt-16 px-4">
          <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Verified Local Establishments</h2>
              <p className="text-sm text-slate-500 mt-1">Showing {filteredBusinesses.length} active directory entries</p>
            </div>
            {selectedCategory !== "all" && (
              <button 
                onClick={() => setSelectedCategory("all")}
                className="text-sm text-orange-600 font-semibold hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>

          {filteredBusinesses.length === 0 ? (
            <div className="w-full text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm">
              <p className="text-slate-400 text-lg">No business matches your matching search criteria.</p>
              <button 
                onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
                className="mt-4 px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-full text-sm font-medium transition-colors"
              >
                Reset Search parameters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBusinesses.map((biz) => (
                <article 
                  key={biz.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col border border-slate-100"
                >
                  <div className="h-48 w-full relative overflow-hidden bg-slate-100">
                    <img 
                      src={biz.image} 
                      alt={biz.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-700 uppercase tracking-wider shadow-sm">
                      {biz.category.replace('-', ' ')}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                        {biz.name}
                      </h3>
                      <div className="text-slate-400 group-hover:text-orange-600 transition-colors pt-1">
                        <ArrowUpRight size={18} />
                      </div>
                    </div>

                    <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">
                      {biz.description}
                    </p>

                    <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-slate-400 shrink-0" />
                        <span className="truncate">{biz.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-slate-400 shrink-0" />
                        <span>{biz.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-600">{biz.hours}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

export default BusinessHub;