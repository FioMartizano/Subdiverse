import React, { useState } from "react";
import { motion } from "framer-motion";
import hoaGuest from "../../../assets/hoaGuest.jpg"; 
import LogInValidation from "../../../components/LogInValidation"; 

function GuestHOA() {

  const smoothCurve = { duration: 1.2, ease: [0.25, 1, 0.5, 1] };
  const [showLogin, setShowLogin] = useState(false);

  return (
    <section className="relative w-full min-h-screen bg-white overflow-hidden py-20 px-6 md:px-12 lg:px-24 flex items-center">
      
      {/* Subtle Background Watermark Text */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <span className="absolute -bottom-10 right-1/4 text-[14rem] font-bold text-slate-100/70 font-heading whitespace-nowrap tracking-tighter select-none">
          HOA
        </span>
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
        
        {/* LEFT COLUMN: Typography Content & Call to Actions */}
        <div className="lg:col-span-6 space-y-6 order-2 lg:order-1">
          
          {/* Badge indicator */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3 text-sm font-semibold tracking-widest uppercase text-amber-600"
          >
            <span>02</span>
            <span className="h-px w-12 bg-amber-500/50 inline-block" />
            <span>Community Management</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...smoothCurve, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 font-heading leading-[1.1]"
          >
            Meet Your <br />
            <span className="text-amber-500">HOA Office.</span>
          </motion.h2>

          {/* Body Narrative */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...smoothCurve, delay: 0.2 }}
            className="text-slate-600 text-base md:text-lg leading-relaxed max-w-xl"
          >
            The Windward Hills Homeowners Association office handles neighborhood concerns,
            subdivision development projects, and direct homeowner assistance. We are committed
            to preserving community harmony and building a safe, beautiful environment to thrive in.
          </motion.p>

          {/* Learn More Button - Now positioned below the description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...smoothCurve, delay: 0.3 }}
          >
            <button 
              className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-medium text-sm rounded-full shadow-lg shadow-amber-500/20 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/30"
              onClick={() => setShowLogin(true)}
            >
              Learn More
            </button>
            <LogInValidation
              isOpen={showLogin}
              onClose={() => setShowLogin(false)}
              onLogin={() => console.log("Login")}
              onSignup={() => console.log("Signup")}
            />
          </motion.div>

        </div>

        {/* RIGHT COLUMN: Large Sweeping Asymmetric Curved Image Panel */}
        <div className="lg:col-span-6 relative flex justify-center lg:justify-end order-1 lg:order-2 h-[450px] md:h-[600px] w-full">
          
          {/* Gold Tracking Accent Trim Frame */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ ...smoothCurve, delay: 0.15 }}
            className="absolute inset-0 right-0 top-0 w-full h-full border-l-2 border-b-2 border-amber-500/50 rounded-bl-[10rem] md:rounded-bl-[16rem] pointer-events-none translate-x-[-12px] translate-y-[12px]"
          />

          {/* Main Visual Component container */}
          <motion.div 
            initial={{ opacity: 0, x: 60, scale: 1.03 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={smoothCurve}
            className="relative w-full h-full overflow-hidden rounded-bl-[10rem] md:rounded-bl-[16rem] shadow-2xl bg-slate-100"
          >
            <img 
              src={hoaGuest} 
              alt="Windward Hills HOA Building Entrance" 
              className="w-full h-full object-cover object-center scale-105 hover:scale-100 transition-transform duration-700 ease-out"
            />
          </motion.div>

          {/* Floating Minimalist Detail Element from layout */}
          <div className="absolute bottom-8 left-8 w-6 h-12 border-2 border-slate-300 rounded-full hidden md:flex items-center justify-center backdrop-blur-sm bg-white/10">
            <div className="w-1.5 h-3 bg-amber-500 rounded-full animate-bounce" />
          </div>

        </div>

      </div>
    </section>
  );
}

export default GuestHOA;