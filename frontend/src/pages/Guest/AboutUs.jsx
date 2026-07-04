import React from "react";
import { motion } from "framer-motion";
import aboutus_bg from "../../assets/aboutus_bg.jpg";
import clubhouse_img from "../../assets/clubhouse.jpg";
import AnimatedShape from "../../components/AnimatedShape";
import WindwardMap from "../../components/WindwardMap";

function AboutUs() {
  // Cohesive premium deceleration curve for organic movement
  const smoothCurve = { duration: 1.2, ease: [0.25, 1, 0.5, 1] };

  return (
    <>
      {/* Hero Section */}
      <section
        className="relative min-h-screen bg-cover bg-center flex items-center justify-center text-center px-4 pt-20 overflow-x-hidden"
        style={{ backgroundImage: `url(${aboutus_bg})` }}
      >
        <div className="absolute inset-0 bg-black/40 z-5" />

        <div className="max-w-3xl z-10 -mt-64 space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={smoothCurve}
            className="text-white text-3xl md:text-5xl font-bold drop-shadow-lg tracking-tight"
          >
            Discover <br /> 
            <span className="whitespace-nowrap">Windward Hills Subdivision</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...smoothCurve, delay: 0.15 }}
            className="text-white text-sm md:text-base max-w-xl mx-auto opacity-90 drop-shadow-md font-medium leading-relaxed"
          >
            Know our offices, member officials, and the history of your community, your home.
          </motion.p>
        </div>

        {/* Dynamic Wave Mask SVG */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-20">
          <svg 
            className="relative block w-full h-[25vh] md:h-[30vh]" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 1440 320" 
            preserveAspectRatio="none"
          >
            <path fill="#ffffff" fillOpacity="1" d="M0,192L34.3,176C68.6,160,137,128,206,133.3C274.3,139,343,181,411,186.7C480,192,549,160,617,128C685.7,96,754,64,823,80C891.4,96,960,160,1029,165.3C1097.1,171,1166,117,1234,128C1302.9,139,1371,213,1406,250.7L1440,288L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="relative bg-white pt-16 pb-24 px-4 overflow-visible md:overflow-hidden select-none">
        
        {/* Dynamic Animated Shapes */}
        <AnimatedShape
          className="w-[160px] h-[280px] md:w-[220px] md:h-[380px] lg:w-[296px] lg:h-[513px] -left-[104px] md:-left-[143px] lg:-left-[192px] top-50 !bg-[var(--color-primary)]"
          xRange={[0, 80]}
          yRange={[0, -500]}
          rotateRange={[0, 12]}
          scaleRange={[1, 1.1]}
        />
        
        <AnimatedShape
          className="w-[160px] h-[280px] md:w-[220px] md:h-[380px] lg:w-[296px] lg:h-[513px] -right-[104px] md:-right-[143px] lg:-right-[192px] bottom-20 !bg-[var(--color-secondary)]"
          xRange={[0, -80]}
          yRange={[0, -400]}
          rotateRange={[0, -15]}
          scaleRange={[0.9, 1.05]}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* ====== TOP SECTION (Demographics + Map) ====== */}
          <div className="relative w-full min-h-[500px] md:min-h-[600px] flex flex-col md:flex-row items-center justify-end mt-12 mb-24">
            
            {/* Left Content Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={smoothCurve}
              className="
                order-2 md:order-1
                w-full md:w-[45%] lg:w-[40%]
                md:absolute md:left-4 lg:left-8
                bg-[var(--color-secondary)]
                rounded-3xl md:rounded-br-[6rem]
                p-8 md:p-12
                text-white
                shadow-2xl
                relative
                z-30
                mt-[-4rem] md:mt-0
              "
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Demographics Overview</h2> 
              <div className="w-16 h-1.5 bg-emerald-500 rounded-full mb-6" />
              <p className="text-base md:text-lg leading-relaxed opacity-95">
                Windward Hills Subdivision is located in Barangay Burol 1, Dasma City. 
                Spanning a total area of [Insert Area Size], the subdivision is organized 
                into four distinct phases: Phase 1, Phase 2, Phase A, and Phase E. The community consists of
                1,800 households, representing a significant population cluster within the barangay.
              </p>
            </motion.div>

            {/* Map Wrapper */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={smoothCurve}
              className="
                order-1 md:order-2
                w-full md:w-[70%]
                relative
                z-10
              "
            >
              {/* Accent Outline */}
              <div className="absolute inset-0 bg-[var(--color-primary)] opacity-30 translate-x-4 translate-y-4 md:translate-x-8 md:translate-y-8 rounded-bl-[6rem] md:rounded-bl-[12rem] rounded-3xl md:rounded-l-none -z-10" />
              
              {/* Main Map Container */}
              <div className="w-full rounded-bl-[6rem] md:rounded-bl-[12rem] rounded-3xl md:rounded-l-none shadow-xl overflow-hidden relative z-20 border-4 border-white">
                <WindwardMap />
                
                {/* Custom Popup Card Overlay - Positioned over the Basketball Court marker */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center pointer-events-none">
                  
                  {/* Popup Card */}
                  <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-64 mb-2 transform transition-all hover:scale-105 cursor-pointer pointer-events-auto">
                    <img 
                      src={clubhouse_img} 
                      alt="Windward Hills Basketball Court" 
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-4 bg-white">
                      <h4 className="text-[#D32F2F] font-bold text-lg leading-tight mb-1">
                        Basketball Court
                      </h4>
                      <p className="text-slate-600 text-sm font-medium">
                        Phase 1
                      </p>
                    </div>
                  </div>

                  {/* Map Pin */}
                  <div className="w-5 h-5 bg-[#D32F2F] border-[3px] border-white rounded-full shadow-md pointer-events-none" />
                  
                </div>
              </div>
            </motion.div>

          </div>

          {/* ====== LOCATION & NEARBY SECTION ====== */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={smoothCurve}
            className="mb-24"
          >
            <div className="bg-[#F8F9FA] rounded-3xl p-8 md:p-12 shadow-lg">
              <h3 className="text-gray-900 font-bold tracking-widest uppercase text-sm mb-2">
                Where We Are
              </h3>
              <h2 className="text-4xl md:text-5xl font-black text-[#D32F2F] tracking-tight mb-6">
                Location & Nearby
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Clubhouse */}
                <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow">
                  <div className="text-4xl mb-3">🏠</div>
                  <h4 className="font-bold text-lg mb-1">Clubhouse</h4>
                  <p className="text-sm text-gray-600">Windward Hills Clubhouse</p>
                  <p className="text-xs text-gray-500 mt-1">Phase 1</p>
                </div>

                {/* Basketball Court */}
                <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow">
                  <div className="text-4xl mb-3">🏀</div>
                  <h4 className="font-bold text-lg mb-1">Basketball Court</h4>
                  <p className="text-sm text-gray-600">Community Sports Facility</p>
                  <p className="text-xs text-gray-500 mt-1">Phase 1</p>
                </div>

                {/* Church */}
                <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow">
                  <div className="text-4xl mb-3">⛪</div>
                  <h4 className="font-bold text-lg mb-1">Pope Saint Paul VI Parish</h4>
                  <p className="text-sm text-gray-600">Parish Church</p>
                  <p className="text-xs text-gray-500 mt-1">Near Phase A</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ====== BOTTOM SECTION (History Panel) ====== */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={smoothCurve}
            className="max-w-5xl mx-auto mt-24 md:mt-48 relative z-20 px-4"
          >
            <div className="bg-[var(--color-primary)] rounded-3xl text-center text-white px-8 py-16 md:px-20 md:py-32 shadow-2xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Our History</h2>
              <div className="w-24 h-1.5 bg-white/30 mx-auto rounded-full mb-8" />
              <p className="max-w-2xl mx-auto text-base md:text-lg leading-8 opacity-95">
                Established with a vision for harmonious living, Windward Hills has grown 
                from a small development plan into a vibrant neighborhood. For years, we 
                have fostered safety, unity, and a beautiful space that families are proud 
                to call home.
              </p>
            </div>
          </motion.div>

        </div>
      </section>
    </>
  );
}

export default AboutUs;