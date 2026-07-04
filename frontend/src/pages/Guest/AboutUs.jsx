import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import aboutus_bg from "../../assets/aboutus_bg.jpg";
import image_753148 from "../../assets/poolHome.jpg"; 
import windwardHistory from "../../assets/Windward_AboutUs.png"; 
import wwhsLogo from "../../assets/wwhs-logo.png";
import filinvestLogo from "../../assets/filinvest-logo.png";
import WindwardMap from "../../components/Maps/WindwardMap";

const logos = [wwhsLogo, filinvestLogo];
const repeated = Array(5).fill(logos).flat();

const accordionData = [
  {
    title: "Secure & Gated Community",
    content: "We prioritize your family's safety with round-the-clock professional security, entry control systems per street, and active perimeter monitoring to guarantee peace of mind day and night.",
  },
  {
    title: "Premium Shared Amenities",
    content: "Enjoy exclusive access to beautifully maintained facilities, including community clubhouse, swimming pools, and sports complexes built for active lifestyles.",
  },
  {
    title: "Eco-Friendly Green Spaces",
    content: "Immerse yourself in carefully landscaped parks, green-house space, and dedicated recreational open spaces designed to foster real wellness and premium suburban living.",
  },
  {
    title: "Strategic Prime Location",
    content: "Perfectly positioned with seamless access to premier schools, vital business hubs, Villar passway, and essential shopping destination retail centers.",
  },
];

function AboutUs() {
  // State to track which accordion item is open
  const [openIndex, setOpenIndex] = useState(0);

  // Cohesive premium deceleration curve for organic movement
  const smoothCurve = { duration: 1.2, ease: [0.25, 1, 0.5, 1] };

  // Stagger configurations for parent-child container animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] },
    },
  };

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
            <path fill="var(--background)" fillOpacity="1" d="M0,192L34.3,176C68.6,160,137,128,206,133.3C274.3,139,343,181,411,186.7C480,192,549,160,617,128C685.7,96,754,64,823,80C891.4,96,960,160,1029,165.3C1097.1,171,1166,117,1234,128C1302.9,139,1371,213,1406,250.7L1440,288L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Our History Section */}
      <section className="py-16 md:py-24 bg-background overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 md:px-24">
        
          <div className="flex items-center gap-6 mb-16 justify-center">
            <h1 className="text-4xl md:text-5xl font-semibold text-primary">Our History</h1>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Side: Elegant Text Block */}
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={smoothCurve}
              className="lg:col-span-7 space-y-6 text-neutral-700 text-left"
            >
              <h3 className="text-2xl md:text-3xl font-medium text-foreground tracking-tight">
                Rooted in Community, Growing for Generations
              </h3>
              <p className="text-base md:text-lg leading-relaxed opacity-90">
              Established and developed by the Filinvest Group Corporation, Windward Hills Subdivision was created to provide affordable housing for low- to middle-income families. The company acquired the land in 1989 and began constructing residential residential units in 1994. By 1995, the first homeowners had started moving into the subdivision, marking the beginning of a growing residential community.</p>
            </motion.div>

            {/* Right Side: Premium Layout Asset Stack */}
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ ...smoothCurve, delay: 0.1 }}
              className="lg:col-span-5 relative flex justify-center lg:justify-end"
            >
              <div className="absolute inset-0 bg-secondary/15 rounded-3xl translate-x-4 translate-y-4 -z-10" />
              
              {/* Main crisp graphic frame */}
              <div className="w-full max-w-[500px] aspect-[16/10] rounded-3xl overflow-hidden shadow-xl border border-border">
                <img 
                  src={windwardHistory} 
                  alt="Windward Hills vintage landscape history" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 ease-in-out"
                />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Logo Carousel Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-white py-10 md:py-3 overflow-hidden"
      >
        <style>{`
          @keyframes logo-scroll {
            from {transform: translateX(0);}
            to {transform: translateX(-50%);}
          }
          .logo-track {
            animation: logo-scroll 20s linear infinite;
          }
          .logo-track:hover {
            animation-play-state: paused;
          }
          @media (prefers-reduced-motion: reduce) {
            .logo-track{animation: none;}
          }
        `}</style>

        <div className="logo-track flex items-center gap-8 md:gap-12 lg:gap-16">
          {[...repeated, ...repeated].map((logo, i) => (
            <img key={i} src={logo} alt={`Logo ${i}`} className="h-10 md:h-16 lg:h-45 w-auto flex-none" />
          ))}
        </div>
      </motion.section>

      {/* Community Metrics / Stats Section */}
      <section className="py-16 md:py-24 bg-background relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="max-w-7xl mx-auto px-8 md:px-24 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0 items-center text-center">
            
            {/* First Stat */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
              className="flex flex-col space-y-3 group"
            >
              <span className="text-6xl md:text-7xl font-bold tracking-tight text-primary transition-transform duration-300 group-hover:scale-105 inline-block">
                3,200
              </span>
              <span className="text-xs md:text-sm text-neutral-500 font-semibold uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">
                Total Housing Units
              </span>
            </motion.div>

            {/* Second Stat */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1], delay: 0.1 }}
              className="flex flex-col space-y-3 md:border-l md:border-border/60 md:px-16 group"
            >
              <span className="text-6xl md:text-7xl font-bold tracking-tight text-primary transition-transform duration-300 group-hover:scale-105 inline-block">
                80%
              </span>
              <span className="text-xs md:text-sm text-neutral-500 font-semibold uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">
                Current Occupancy Ratio
              </span>
            </motion.div>

            {/* Third Stat */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1], delay: 0.2 }}
              className="flex flex-col space-y-3 md:border-l md:border-border/60 md:pl-16 group"
            >
              <span className="text-6xl md:text-7xl font-bold tracking-tight text-primary transition-transform duration-300 group-hover:scale-105 inline-block">
                125<span className="text-4xl md:text-5xl font-medium align-top ml-0.5">+</span>
              </span>
              <span className="text-xs md:text-sm text-neutral-500 font-semibold uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">
                Hectares of Land Area
              </span>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Why Choose Us Section with Accordion */}
      <section className="py-16 md:py-24 bg-background overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 md:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Column: Multi-Layered Image Frame Layout - EXTRA BIG (Animated on Scroll) */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={smoothCurve}
              className="lg:col-span-5 flex items-center justify-center pt-8 pb-12 px-6"
            >
              <div className="relative w-full max-w-[650px] aspect-[4/3]">
                
                <div 
                  className="absolute -top-16 -left-16 w-[60%] h-[140%] bg-primary z-0"
                  style={{ 
                    boxShadow: '0 30px 80px rgba(0,43,73,0.4)',
                    transform: 'rotate(-2deg)'
                  }}
                />
                
                {/* 2. Large Yellow Accent - extending further right */}
                <div 
                  className="absolute -top-10 -right-14 w-[75%] h-[30%] bg-secondary opacity-90 z-0"
                  style={{ 
                    boxShadow: '0 15px 50px rgba(249,188,80,0.35)',
                    transform: 'rotate(1deg)'
                  }}
                />
                
                {/* 3. Extended Pink Bottom Block */}
                <div 
                  className="absolute -bottom-12 left-[30%] w-[40%] h-[18%] bg-secondary z-0"
                />
                
                {/* 4. Fourth Accent Block */}
                <div 
                  className="absolute top-[40%] -right-8 w-[20%] h-[25%] bg-primary opacity-60 z-0"
                  style={{ 
                    boxShadow: '0 10px 40px rgba(0,43,73,0.2)',
                    transform: 'rotate(3deg)'
                  }}
                />
                
                {/* 5. Main Foreground Image Frame */}
                <div className="relative w-full h-full z-10 bg-transparent shadow-2xl border-4 border-white/30 overflow-hidden rounded-xl">
                  <img
                    src={image_753148}
                    alt="Windward Hills Community Lifestyle"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 ease-in-out"
                  />
                </div>
                
              </div>
            </motion.div>

            {/* Right Column: Heading & Interactive Accordion Stack (Staggered Animation on Scroll) */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="lg:col-span-7 flex flex-col space-y-8 pt-2"
            >
              
              {/* Header Content Blocks */}
              <div className="space-y-3">
                <span className="text-neutral-400 text-lg font-medium tracking-tight block">
                  What do we
                </span>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
                  Built on Trust, <br />Driven by Community
                </h2>
              </div>

              {/* Interactive Accordion Layout Group */}
              <div className="border-t border-border/60 divide-y divide-border/60">
                {accordionData.map((item, index) => {
                  const isOpen = openIndex === index;
                  return (
                    <motion.div 
                      variants={itemVariants}
                      key={index} 
                      className="py-4 md:py-5"
                    >
                      {/* Toggle Trigger */}
                      <button
                        onClick={() => setOpenIndex(isOpen ? -1 : index)}
                        className="w-full flex items-center justify-between text-left group focus:outline-none"
                      >
                        <span className={`text-lg md:text-xl font-semibold tracking-tight transition-colors duration-200 ${
                          isOpen ? "text-foreground" : "text-neutral-500 hover:text-foreground"
                        }`}>
                          {item.title}
                        </span>
                        
                        {/* Accordion Arrow */}
                        <svg
                          className={`w-5 h-5 text-neutral-500 transition-transform duration-300 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Animated Content Expansion Drawer */}
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                            className="overflow-hidden"
                          >
                            <p className="pt-3 text-sm md:text-base text-neutral-500 leading-relaxed max-w-2xl">
                              {item.content}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>

            </motion.div>

          </div>
        </div>
      </section>
    </>
  );
}

export default AboutUs;