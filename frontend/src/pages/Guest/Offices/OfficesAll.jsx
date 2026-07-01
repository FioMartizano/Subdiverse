import React from "react";
import { motion } from "framer-motion";
import OffiesGP from "../../../assets/officesGP.jpg";
import hoaGuest from "../../../assets/hoaGuest.jpg";
import seniorGuest from "../../../assets/seniorGuest.jpg";
import healthGuest from "../../../assets/healthCareGuest.jpg";
import churchGuest from "../../../assets/churchGuest.jpg";
import GuestElderly from "./GuestElderly"; 
import GuestHealthcare from "./GuestHealthcare"; 
import GuestHOA from "./GuestHOA"; 

// Assuming AnimatedShape is in a components folder
import AnimatedShape from "../../../components/AnimatedShape"; 

const offices = [
    { img: hoaGuest, title: "HOA Office", desc: "Handles community concerns and homeowner assistance." },
    { img: seniorGuest, title: "Senior Citizen Office", desc: "Support and services for senior residents." },
    { img: healthGuest, title: "Health Office", desc: "Basic healthcare and wellness assistance." },
    { img: churchGuest, title: "Church Office", desc: "Coordinates parish events and services." },
];

// Added animation variants
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

function OfficesAll() {
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
            Providing accessible support, wellness, and administrative services right here in our neighborhood. We’re here to help you thrive.
          </p>
        </div>
        <div className="absolute -bottom-px left-0 right-0 overflow-hidden leading-none pointer-events-none">
          <svg className="curve-rise w-full h-[120px] md:h-[160px]" viewBox="0 0 1440 160" preserveAspectRatio="none">
            <path d="M0,160 L0,80 C360,-40 1080,200 1440,40 L1440,160 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Title Section - Spacing Fixed */}
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

      
      {/* Guest Healthcare Display Section */}
      <div className="w-full">
        <GuestHOA/>
      </div>


      {/* Guest Healthcare Display Section */}
      <div className="w-full">
        <GuestHealthcare />
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