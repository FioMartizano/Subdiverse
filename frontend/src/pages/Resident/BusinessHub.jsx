import React from 'react';
import businesshub_banner from "../../assets/businesshub_banner.png";
import { Cherry, CakeSlice, Coffee, Salad, SportShoe, Dumbbell, Volleyball, Search, Home, Scissors, BookOpen } from 'lucide-react';

const customIcons = [
    // --- LEFT SIDE ---
    { id: 'L1', Icon: Cherry,     pos: 'bottom-13 left-1 px-0 justify-between', rot: 'rotate-[17deg]' },
    { id: 'L2', Icon: CakeSlice,  pos: 'bottom-9 left-10 px-5 justify-between',  rot: 'rotate-[20deg]' },
    { id: 'L3', Icon: Coffee,     pos: 'bottom-7 left-10 px-20 justify-between', rot: 'rotate-[5deg]' },
    { id: 'L4', Icon: Salad,      pos: 'bottom-5 left-5 px-40 justify-between',  rot: 'rotate-[3deg]' },
    { id: 'L5', Icon: SportShoe,  pos: 'bottom-4 left-22 px-40 justify-between', rot: 'rotate-[0deg]' },
    { id: 'L6', Icon: Dumbbell,   pos: 'bottom-2 left-21 px-60 justify-between', rot: 'rotate-[50deg]' },
    { id: 'L7', Icon: Volleyball, pos: 'bottom-2 left-27 px-70 justify-between', rot: 'rotate-[3deg]' },

    // --- RIGHT SIDE ---
    { id: 'R1', Icon: Cherry,     pos: 'bottom-13 right-1 px-0 justify-end',  rot: '-rotate-[17deg]' },
    { id: 'R2', Icon: CakeSlice,  pos: 'bottom-9 right-10 px-5 justify-end',  rot: '-rotate-[20deg]' },
    { id: 'R3', Icon: Dumbbell,   pos: 'bottom-7 right-10 px-20 justify-end', rot: '-rotate-[5deg]' },
    { id: 'R4', Icon: Salad,      pos: 'bottom-5 right-5 px-40 justify-end',  rot: '-rotate-[3deg]' },
    { id: 'R5', Icon: Coffee,     pos: 'bottom-4 right-22 px-40 justify-end', rot: '-rotate-[0deg]' },
    { id: 'R6', Icon: Volleyball, pos: 'bottom-2 right-21 px-60 justify-end', rot: '-rotate-[0deg]' },
    { id: 'R7', Icon: SportShoe,  pos: 'bottom-2 right-27 px-70 justify-end', rot: '-rotate-[3deg]' },
];

function BusinessHub() {
  return (
    <div className="w-full flex justify-center bg-gray-50 min-h-screen pt-24 pb-8">
      <div className="w-[98%] max-w-[1600px] relative">
        
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
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.
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

    
        <section 
          id="search-categories"
          aria-label="Search and Category Filters"
          className="w-full max-w-5xl mx-auto mt-[-40px] pt-15 z-20 relative"
        >
     
          <div className="relative w-full mb-8">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="What do you need?"
              aria-label="Search for services"
            />
          </div>


            <div className="flex flex-wrap justify-center gap-4 md:flex-nowrap">
            {[
                { label: 'House for rent', Icon: Home },
                { label: 'Cafe & Resto', Icon: Coffee },
                { label: 'Fitness', Icon: Dumbbell },
                { label: 'Barber & Salon', Icon: Scissors },
                { label: 'Daycare & Academy', Icon: BookOpen }
            ].map((btn, idx) => (
            <button 
            key={idx}
            className={`flex items-center justify-between px-6 py-4 rounded-xl shadow-md min-w-[260px] transition-all duration-300 
                hover:shadow-lg
                ${btn.active ? 'bg-[var(--color-secondary)] border-2 border-blue-400' : 'bg-[var(--color-secondary)] hover:bg-orange-600'} 
                text-white font-bold flex-1`}
            >
            <span>{btn.label}</span>
            <btn.Icon size={24} />
            </button>
            ))}
            </div>
        </section>

      </div>
    </div>
  );
}

export default BusinessHub;