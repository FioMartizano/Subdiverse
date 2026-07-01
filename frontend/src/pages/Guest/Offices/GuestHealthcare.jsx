import React from "react";
import { motion } from "framer-motion";
import healthGuest from "../../../assets/healthCareGuest.jpg"; 
// Note: You can reuse other assets (like seniorGuest or hoaGuest) for the smaller top/bottom accent slots
import seniorGuest from "../../../assets/guestHOA_bg.jpg";
import churchGuest from "../../../assets/guestHOA_bg.jpg";

function GuestHealthcare() {
  // Premium animation curve matching our smooth cinematic feel
  const smoothTransition = { duration: 1.2, ease: [0.25, 1, 0.5, 1] };

  return (
    <section className="relative w-full min-h-screen bg-slate-50/50 overflow-hidden py-24 px-6 md:px-12 lg:px-24 flex items-center">
      
      {/* BACKGROUND WATERMARKS (As seen in image_65afb6.png) */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <span className="absolute -top-10 left-1/3 text-[12rem] font-bold text-slate-200/30 font-heading whitespace-nowrap tracking-tighter">
          Healthcare
        </span>
        <span className="absolute -bottom-16 left-10 text-[12rem] font-bold text-slate-200/20 font-heading whitespace-nowrap tracking-tighter">
          We Care
        </span>
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        
        {/* LEFT COLUMN: Main Curved Image & Accent Frame */}
        <div className="lg:col-span-5 relative flex justify-center lg:justify-start">
          {/* Gold Offset Accent Outline */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, x: -20 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ ...smoothTransition, delay: 0.2 }}
            className="absolute top-4 left-4 w-full h-[450px] md:h-[550px] border-2 border-amber-500/60 rounded-br-[8rem] md:rounded-br-[12rem] pointer-events-none"
          />

          {/* Main Image Wrapper */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={smoothTransition}
            className="relative w-full h-[450px] md:h-[550px] overflow-hidden rounded-br-[8rem] md:rounded-br-[12rem] shadow-xl bg-slate-200"
          >
            <img 
              src={healthGuest} 
              alt="Health Office Facility" 
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>

        {/* CENTER COLUMN: Core Typography and Action Items */}
        <div className="lg:col-span-4 space-y-6 lg:px-6 relative">
          
          {/* Section Indicator Counter */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3 text-sm font-semibold tracking-widest uppercase text-amber-600"
          >
            <span>01</span>
            <span className="h-px w-12 bg-amber-500/50 inline-block" />
            <span>Health Office</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...smoothTransition, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 font-heading leading-tight"
          >
            Your Wellness, <br />
            Our Priority.
          </motion.h2>

          {/* Body Paragraph */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...smoothTransition, delay: 0.2 }}
            className="text-slate-600 text-base md:text-lg leading-relaxed font-normal"
          >
            The Windward Hills Health Office offers readily accessible basic healthcare services, preventative wellness assessments, and localized medical administration directly within your neighborhood vicinity.
          </motion.p>

          {/* Action Pill Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...smoothTransition, delay: 0.3 }}
            className="pt-4"
          >
            <button className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-medium text-sm rounded-full shadow-lg shadow-amber-500/20 transition-all duration-300 transform hover:-translate-y-0.5">
              Learn More
            </button>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Secondary Decorative Framing Panels */}
        <div className="lg:col-span-3 h-full relative hidden lg:flex flex-col justify-between py-12 min-h-[500px]">
          
          {/* Top-Right Organic Crop Image Panel */}
          <motion.div 
            initial={{ opacity: 0, x: 50, y: -30 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={smoothTransition}
            className="w-48 h-48 rounded-bl-[6rem] border-l-2 border-b-2 border-amber-500/40 p-2 self-end"
          >
            <div className="w-full h-full rounded-bl-[5.5rem] overflow-hidden bg-slate-200 shadow-md">
              <img src={seniorGuest} alt="Senior Care Segment" className="w-full h-full object-cover" />
            </div>
          </motion.div>

          {/* Bottom-Right Straight Corner Segment */}
          <motion.div 
            initial={{ opacity: 0, x: 50, y: 30 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...smoothTransition, delay: 0.15 }}
            className="w-56 h-36 border-t-2 border-l-2 border-amber-500/40 pt-2 pl-2 self-end"
          >
            <div className="w-full h-full overflow-hidden bg-slate-200 shadow-md">
              <img src={churchGuest} alt="Community Wellness Context" className="w-full h-full object-cover" />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

export default GuestHealthcare;