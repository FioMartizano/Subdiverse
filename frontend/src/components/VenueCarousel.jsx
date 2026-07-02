import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Users, ChevronLeft, ChevronRight } from "lucide-react";
import clubhouseImage from "../assets/clubhouse.jpg";
import poolImage from "../assets/poolHome.jpg";
import courtImage from "../assets/court.jpg";

const venues = [
  {
    name: "Clubhouse",
    location: "Main Building, Ground Floor",
    capacity: "Up to 150 guests",
    image: clubhouseImage,
  },
  {
    name: "Swimming Pool",
    location: "Near Community Pool",
    capacity: "Up to 80 guests",
    image: poolImage,
  },
  {
    name: "Basketball Court",
    location: "Sports Complex",
    capacity: "Up to 200 guests",
    image: courtImage,
  },
];

export default function VenueStackCarousel() {
  const [index, setIndex] = React.useState(0);

  const next = () => setIndex((i) => (i + 1) % venues.length);
  const prev = () => setIndex((i) => (i - 1 + venues.length) % venues.length);

  // returns the venue at a given offset from the active index
  const getCard = (offset) =>
    venues[(index + offset + venues.length) % venues.length];

  return (
    <div className="relative w-full max-w-sm h-96 flex items-center justify-center">
      {/* Card 3 (furthest back) */}
      <motion.div
        key={`back2-${index}`}
        className="absolute w-72 h-80 rounded-3xl overflow-hidden shadow-md"
        initial={false}
        animate={{ scale: 0.85, y: 30, opacity: 0.4, rotate: -6 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <img
          src={getCard(2).image}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>

      {/* Card 2 (middle back) */}
      <motion.div
        key={`back1-${index}`}
        className="absolute w-72 h-80 rounded-3xl overflow-hidden shadow-md"
        initial={false}
        animate={{ scale: 0.92, y: 15, opacity: 0.7, rotate: 4 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <img
          src={getCard(1).image}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/25" />
      </motion.div>

      {/* Active Card (front) */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={`front-${index}`}
          className="absolute w-72 h-80 rounded-3xl overflow-hidden shadow-xl cursor-grab active:cursor-grabbing"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
          exit={{ scale: 0.9, opacity: 0, x: -80 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.6}
          onDragEnd={(e, { offset, velocity }) => {
            if (offset.x < -80 || velocity.x < -400) next();
            else if (offset.x > 80 || velocity.x > 400) prev();
          }}
        >
          <img
            src={getCard(0).image}
            alt={getCard(0).name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

          <div className="absolute top-4 right-4 bg-secondary text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
            Available
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <h3 className="text-xl font-bold mb-2">{getCard(0).name}</h3>

            <div className="flex items-center gap-1.5 text-sm text-white/90 mb-1">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{getCard(0).location}</span>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-white/90">
              <Users className="w-4 h-4 shrink-0" />
              <span>{getCard(0).capacity}</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Prev/Next controls */}
      <button
        onClick={prev}
        className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-secondary hover:text-white transition-all duration-300"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={next}
        className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-secondary hover:text-white transition-all duration-300"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dot indicators */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {venues.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index ? "w-6 bg-secondary" : "w-2 bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

