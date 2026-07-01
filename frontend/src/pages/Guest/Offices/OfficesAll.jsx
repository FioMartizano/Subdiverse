import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import OffiesGP from "../../../assets/officesGP.jpg";
import GuestElderly from "./GuestElderly"; 
import GuestHealthcare from "./GuestHealthcare"; 
import GuestGrievance from "./GuestGrievance"; 
import GuestHOA from "./GuestHOA"; 
import GuestParish from "./GuestParish";



function OfficesAll() {
  const location = useLocation();
 
  const hoaRef = useRef(null);
  const grievanceRef = useRef(null);
  const elderlyRef = useRef(null);
  const healthcareRef = useRef(null);
  const parishRef = useRef(null);

  const sectionRefs = {
    hoa: hoaRef,
    grievance: grievanceRef,
    elderly: elderlyRef,
    healthcare: healthcareRef,
    parish: parishRef,
  };

  useEffect(() => {

    const params = new URLSearchParams(location.search);
    const section = params.get("section");
    
    if (section && sectionRefs[section]?.current) {
      setTimeout(() => {
        sectionRefs[section].current.scrollIntoView({ 
          behavior: "smooth", 
          block: "start" 
        });
      }, 100);
    }
  }, [location]);

  return (
    <div className="w-full">
      {/* HERO */}
      <section
        className="w-full h-[500px] md:h-[600px] bg-cover bg-center flex items-center relative overflow-hidden"
        style={{ backgroundImage: `url(${OffiesGP})` }}
      >
        <div className="absolute inset-0 bg-black/40 bg-gradient-to-br from-secondary/40 to-transparent" />
        <div className="relative z-10 max-w-xl px-8 pt-20 pb-32 text-white">
          <p className="uppercase text-xs tracking-[0.25em] text-orange-200 mb-3 font-medium">
            Windward Hills
          </p>
         <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-4 font-heading">
            <span className="whitespace-nowrap">Essential services</span> <br className="hidden md:block" />
            closer to home.
          </h1>
          <p className="text-white/80 mb-6 max-w-sm">
            Providing accessible support, wellness, and administrative services right here in our neighborhood. We're here to help you thrive.
          </p>
        </div>
        <div className="absolute -bottom-px left-0 right-0 overflow-hidden leading-none pointer-events-none">
          <svg className="curve-rise w-full h-[120px] md:h-[160px]" viewBox="0 0 1440 160" preserveAspectRatio="none">
            <path d="M0,160 L0,80 C360,-40 1080,200 1440,40 L1440,160 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Title Section */}
      <div className="relative bg-white overflow-hidden">
        <section className="relative z-10 py-12 md:py-20">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mx-auto max-w-4xl px-6 text-center"
            >
                <h1 className="text-primary text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                    Windward Hills Offices
                </h1>
                <p className="text-secondary mt-3 text-sm md:text-base lg:text-lg font-medium opacity-90">
                    - Windward Hills Subdivision, Burol 1 -
                </p>
            </motion.div>
        </section>
      </div>
      
  
      <div id="section-hoa" ref={hoaRef} className="w-full scroll-mt-20">
        <GuestHOA />
      </div>

      <div id="section-grievance" ref={grievanceRef} className="w-full scroll-mt-20">
        <GuestGrievance />
      </div>

      <div id="section-elderly" ref={elderlyRef} className="w-full scroll-mt-20">
        <GuestElderly />
      </div>

      <div id="section-healthcare" ref={healthcareRef} className="w-full scroll-mt-20">
        <GuestHealthcare />
      </div>

      <div id="section-parish" ref={parishRef} className="w-full scroll-mt-20">
        <GuestParish />
      </div>

      <style>{`
        .curve-rise {
          transform: translateY(40%);
          opacity: 0;
          animation: curveRise 1s ease-out forwards;
          animation-delay: 0.3s;
        }
        @keyframes curveRise {
          to { transform: translateY(0%); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default OfficesAll;