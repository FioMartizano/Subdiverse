import React from "react";
import { motion } from "framer-motion";
import factoryImage from "../../../assets/guestHOA_bg.jpg"; // Update path

function GuestElderly() {
  return (
    <section
      id="progressive-architecture"
      className="relative w-full h-screen overflow-hidden"
    >
      {/* Full-screen background image: ultra-smooth ease in from the right */}
      <motion.img
        src={factoryImage}
        alt="Progressive Architecture"
        initial={{ opacity: 0, scale: 1.1, x: 60 }}
        whileInView={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
        viewport={{ once: true, amount: 0.3 }}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Optional dark gradient for legibility behind the text panel */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 150 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          opacity: { duration: 0.8, ease: "easeOut" },
          y: { duration: 1.1, ease: [0.25, 1, 0.5, 1] },
        }}
        viewport={{ once: true, amount: 0.3 }}
        className="absolute bottom-0 right-0 w-[100%] sm:w-[80%] md:w-[45%] lg:w-[38%] rounded-tl-[3.5rem] md:rounded-tl-[5rem] overflow-hidden shadow-2xl"
      >
        <div className="bg-white/95 backdrop-blur-sm px-8 py-12 md:px-12 md:py-16 space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground font-heading leading-tight">
            Guest Elderly Services
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            A former factory is being transformed into a compact urban
            neighborhood with unique conditions for working and living.
          </p>

          <button className="btn-primary">Learn More</button>
        </div>
      </motion.div>
    </section>
  );
}

export default GuestElderly;