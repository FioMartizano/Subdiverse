import React, { useState } from "react";
import { motion } from "framer-motion";
import grievanceGuest from "../../../assets/guestHOA_bg.jpg"; // Replace with your grievance asset
import LogInValidation from "../../../components/LogInValidation";  

function GuestGrievance() {
  // Ultra-premium ease-out curve for a fluid, tactile presentation fluid glide
  const smoothCurve = { duration: 1.2, ease: [0.25, 1, 0.5, 1] };
  const [showLogin, setShowLogin] = useState(false);
  return (
    <section className="relative w-full min-h-screen bg-slate-50 overflow-hidden py-20 px-6 md:px-12 lg:px-24 flex items-center">
      
      {/* Subtle Background Watermark Text */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <span className="absolute -bottom-10 left-1/4 text-[14rem] font-bold text-slate-200/50 font-heading whitespace-nowrap tracking-tighter select-none">
          HEARING
        </span>
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
        
        {/* LEFT COLUMN: Large Sweeping Asymmetric Curved Image Panel (Inverted to Left Side) */}
        <div className="lg:col-span-6 relative flex justify-center lg:justify-start order-1 h-[450px] md:h-[600px] w-full">
          
          {/* Emerald Tracking Accent Trim Frame */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, x: -20 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ ...smoothCurve, delay: 0.15 }}
            className="absolute inset-0 left-0 top-0 w-full h-full border-r-2 border-b-2 border-emerald-600/40 rounded-br-[10rem] md:rounded-br-[16rem] pointer-events-none translate-x-[12px] translate-y-[12px]"
          />

          {/* Main Visual Component container */}
          <motion.div 
            initial={{ opacity: 0, x: -60, scale: 1.03 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={smoothCurve}
            className="relative w-full h-full overflow-hidden rounded-br-[10rem] md:rounded-br-[16rem] shadow-2xl bg-slate-100"
          >
            <img 
              src={grievanceGuest} 
              alt="Windward Hills Grievance Committee Session Room" 
              className="w-full h-full object-cover object-center scale-105 hover:scale-100 transition-transform duration-700 ease-out"
            />
          </motion.div>

          {/* Floating Minimalist Detail Element from layout */}
          <div className="absolute bottom-8 right-8 w-6 h-12 border-2 border-slate-300 rounded-full hidden md:flex items-center justify-center backdrop-blur-sm bg-white/10">
            <div className="w-1.5 h-3 bg-emerald-600 rounded-full animate-bounce" />
          </div>

        </div>

        {/* RIGHT COLUMN: Typography Content & Call to Actions */}
        <div className="lg:col-span-6 space-y-6 order-2">
          
          {/* Badge indicator */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3 text-sm font-semibold tracking-widest uppercase text-emerald-700"
          >
            <span>03</span>
            <span className="h-px w-12 bg-emerald-600/50 inline-block" />
            <span>Conflict Resolution</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...smoothCurve, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 font-heading leading-[1.1]"
          >
            Grievance & <br />
            <span className="text-emerald-600">Committee.</span>
          </motion.h2>

          {/* Body Narrative */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...smoothCurve, delay: 0.2 }}
            className="text-slate-600 text-base md:text-lg leading-relaxed max-w-xl"
          >
            The Grievance Committee provides an impartial forum for resolving neighborhood
            disputes and upholding community rules. Committed to fairness and mutual respect,
            we work diligently to maintain harmony, protect homeowner interests, and settle matters amicably.
          </motion.p>

          {/* Learn More Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...smoothCurve, delay: 0.3 }}
          >
            <button 
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-full shadow-lg shadow-emerald-600/20 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-600/30"
              onClick={() => setShowLogin(true)}
            >
              File a Request
            </button>
            <LogInValidation
              isOpen={showLogin}
              onClose={() => setShowLogin(false)}
              onLogin={() => console.log("Login")}
              onSignup={() => console.log("Signup")}
            />
          </motion.div>

        </div>

      </div>
    </section>
  );
}

export default GuestGrievance;