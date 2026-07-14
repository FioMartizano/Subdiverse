import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import businesshub_banner from "../../assets/businesshub_banner.png";
import {
  BookOpen,
  CakeSlice,
  Cherry,
  Clock,
  Coffee,
  Dumbbell,
  Home,
  LinkIcon,
  MapPin,
  Phone,
  Salad,
  Scissors,
  Search,
  Store,
  Trophy,
  Volleyball,
  Wrench,
  X,
} from "lucide-react";

//business photos/logos
import kapeCure from "../../assets/BusinessLogos/kapecure_ph.jpg";
import yeoggiManna from "../../assets/BusinessLogos/yeoggiManna.jpg";
import antech from "../../assets/BusinessLogos/antech.jpg";
import jgPaper from "../../assets/BusinessLogos/jgPaperAndPrints.jpg";
import siomaiNgInaMo from "../../assets/BusinessLogos/siomaiNgInaMo.jpg";
import smashLab from "../../assets/BusinessLogos/smashLab.jpg";



const customIcons = [
  { id: "L1", Icon: Cherry, pos: "bottom-3 left-1 px-0 justify-between", rot: "rotate-[17deg]" },
  { id: "L2", Icon: CakeSlice, pos: "bottom-3 left-10 px-5 justify-between", rot: "rotate-[20deg]" },
  { id: "L3", Icon: Coffee, pos: "bottom-3 left-10 px-20 justify-between", rot: "rotate-[5deg]" },
  { id: "L4", Icon: Salad, pos: "bottom-3 left-5 px-40 justify-between", rot: "rotate-[3deg]" },
  { id: "L5", Icon: Dumbbell, pos: "bottom-3 left-5 px-60 justify-between", rot: "rotate-[50deg]" },
  { id: "L7", Icon: Volleyball, pos: "bottom-3 left-27 px-70 justify-between", rot: "rotate-[3deg]" },
  { id: "R1", Icon: Cherry, pos: "bottom-3 right-1 px-0 justify-end", rot: "-rotate-[17deg]" },
  { id: "R2", Icon: CakeSlice, pos: "bottom-3 right-10 px-5 justify-end", rot: "-rotate-[20deg]" },
  { id: "R3", Icon: Dumbbell, pos: "bottom-3 right-10 px-20 justify-end", rot: "-rotate-[5deg]" },
  { id: "R4", Icon: Salad, pos: "bottom-3 right-5 px-40 justify-end", rot: "-rotate-[3deg]" },
  { id: "R5", Icon: Coffee, pos: "bottom-3 right-22 px-40 justify-end", rot: "-rotate-[0deg]" },
  { id: "R6", Icon: Volleyball, pos: "bottom-2 right-21 px-60 justify-end", rot: "-rotate-[0deg]" },
];

const CATEGORIES = [
  { id: "cafe-resto", label: "Cafe & Resto", Icon: Coffee },
  { id: "products-services", label: "Products & Services", Icon: Wrench },
  { id: "sports-fitness", label: "Sports & Fitness", Icon: Trophy },
  { id: "house-rent", label: "House for Rent", Icon: Home },
  { id: "barber-salon", label: "Barber & Salon", Icon: Scissors },
  { id: "daycare-academy", label: "Daycare & Academy", Icon: BookOpen },
];

const BUSINESSES = [
  {
    id: 1,
    name: "Kapecure PH Food and Beverage House",
    category: "cafe-resto",
    description:
      "Offers coffee carts, mini pancakes, grazing tables, pasta, pastries, sweets, nachos, tacos, juice, kakanin, and inflatable party setups.",
    phone: "0917 130 4697",
    address: "Blk 52 Lot 2, St. Benedict, Windward Hills Subdivision",
    hours: "2:00 AM - 12:00 AM, Monday-Saturday",
    socialMediaLink:
      "https://www.facebook.com/profile.php?id=100076083451154",
    image: kapeCure
  },
  {
    id: 2,
    name: "Yeogi Manna Cafe",
    category: "cafe-resto",
    description:
      "A neighborhood café serving drinks and snacks in a cozy and welcoming space.",
    phone: "0960 841 6088",
    address:
      "Blk 4 Lot 7, St. Isidore, Phase E, Windward Hills Subdivision",
    hours: "",
    socialMediaLink: "https://www.instagram.com/yeogi.manna.cafe",
    image: yeoggiManna,
  },
  {
    id: 3,
    name: "Antech Engineering Solutions",
    category: "products-services",
    description:
      "Offers drafting, 3D modeling, product and machine design, floor and utility plans, prototype development, 3D printing, fabrication drawings, machining, and stainless steel fabrication services.",
    phone: "0976 642 2701 (Viber)",
    address: "Blk 4 Lot 4, Phase 1, Windward Hills Subdivision",
    hours: "",
    socialMediaLink: "",
    image: antech,
  },
  {
    id: 4,
    name: "Siomai ng Ina Mo",
    category: "cafe-resto",
    description:
      "Serving affordable, flavorful siomai perfect for quick snacks, cravings, and sharing with friends.",
    phone: "0906 822 7354",
    address: "Clubhouse, Windward Hills Subdivision",
    hours: "",
    socialMediaLink:
      "https://www.facebook.com/profile.php?id=100088362385644",
    image: siomaiNgInaMo,
  },
  {
    id: 5,
    name: "Smash Lab by Coach Justin",
    category: "sports-fitness",
    description:
      "Provides badminton coaching for players of all ages and skill levels.",
    phone: "0935 732 3644",
    address: "Covered Court, Windward Hills Subdivision",
    hours: "Saturday and Sunday",
    socialMediaLink: "https://www.facebook.com/smashlabbycoachjustin",
    image: smashLab,
  },
  {
    id: 6,
    name: "JG Paper & Prints",
    category: "products-services",
    description:
      "Creates photobooks, scrapbooks, custom gifts, party prints, and other digital printing products.",
    phone: "0968 651 7680",
    address:
      "Blk 54 Lot 1, Lane 55, St. Benedict Street, Phase 2, Windward Hills Subdivision",
    hours: "9:00 AM - 9:00 PM, Monday, Tuesday, Thursday, Saturday, and Sunday",
    socialMediaLink: "https://www.facebook.com/jgpinkpaperieandprints",
    image: jgPaper,
  },
];

function BusinessHub() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 1, 0.5, 1],
      },
    },
  };

  const iconVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 0.2,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const filteredBusinesses = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return BUSINESSES.filter((business) => {
      const matchesCategory =
        selectedCategory === "all" ||
        business.category === selectedCategory;

      const searchableText = [
        business.name,
        business.description,
        business.address,
        business.phone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        normalizedQuery === "" || searchableText.includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const getCategoryLabel = (categoryId) =>
    CATEGORIES.find((category) => category.id === categoryId)?.label ||
    "Other";

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-gray-50">
      {/* BANNER SECTION */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative h-[400px] w-full overflow-hidden bg-primary shadow-xl"
        style={{
          borderBottomLeftRadius: "3rem",
          borderBottomRightRadius: "3rem",
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-400 to-transparent opacity-10" />

        <div className="relative mx-auto flex h-full w-full max-w-7xl items-center px-6 md:px-12">
          <motion.div
            variants={itemVariants}
            className="z-10 max-w-lg text-white"
          >
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-6xl">
              Neighborhood{" "}
              <span className="text-orange-500">Essentials</span>
            </h1>

            <p className="text-lg font-light text-slate-300 md:text-xl">
              Discover businesses, products, and services available within
              Windward Hills.
            </p>
          </motion.div>

          <motion.img
            variants={itemVariants}
            src={businesshub_banner}
            alt="Windward Hills Business Hub"
            className="absolute right-0 top-3 hidden w-[700px] opacity-90 drop-shadow-2xl lg:block"
          />
        </div>

        {customIcons.map((item) => (
          <motion.div
            variants={iconVariants}
            initial="hidden"
            animate="visible"
            key={item.id}
            className={`pointer-events-none absolute flex w-full items-end text-white/20 ${item.pos}`}
          >
            <item.Icon
              className={item.rot}
              size={48}
              strokeWidth={1.5}
            />
          </motion.div>
        ))}
      </motion.section>

      {/* SEARCH AND FILTERS */}
      <section className="z-20 mx-auto -mt-12 w-full max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="rounded-3xl border border-gray-100 bg-white p-4 shadow-2xl"
        >
          <div className="relative mb-6 w-full">
            <Search className="absolute left-5 top-5 h-6 w-6 text-orange-500" />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-5 pl-14 pr-6 text-lg transition-all focus:outline-none focus:ring-4 focus:ring-orange-500/20"
              placeholder="Search businesses, services, or locations..."
            />
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {CATEGORIES.map((category) => {
              const isActive = selectedCategory === category.id;

              return (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  key={category.id}
                  type="button"
                  onClick={() =>
                    setSelectedCategory(isActive ? "all" : category.id)
                  }
                  className={`flex items-center gap-3 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                      : "bg-gray-100 text-slate-700 hover:bg-gray-200"
                  }`}
                >
                  <category.Icon size={18} />
                  {category.label}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* BUSINESS LIST */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8 flex items-center justify-between px-2"
        >
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Local Businesses
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredBusinesses.length}{" "}
              {filteredBusinesses.length === 1 ? "business" : "businesses"} found
            </p>
          </div>

          {(selectedCategory !== "all" || searchQuery) && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="flex items-center gap-1 text-sm font-semibold text-orange-600 hover:underline"
            >
              <X size={14} />
              Clear Filters
            </motion.button>
          )}
        </motion.div>

        <motion.div
          layout
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredBusinesses.map((business) => (
              <motion.article
                layout
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{
                  duration: 0.4,
                  ease: [0.25, 1, 0.5, 1],
                }}
                key={business.id}
                className="group flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:shadow-2xl"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  {business.image ? (
                    <img
                      src={business.image}
                      alt={business.name}
                      className="h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-orange-50 to-slate-100 text-slate-400">
                      <Store size={42} strokeWidth={1.5} />
                      <span className="text-xs font-medium">
                        Business photo coming soon
                      </span>
                    </div>
                  )}

                  <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-700 shadow-sm backdrop-blur-md">
                    {getCategoryLabel(business.category)}
                  </div>
                </div>

                <div className="flex flex-grow flex-col p-6">
                  <h3 className="mb-2 text-xl font-bold text-slate-900">
                    {business.name}
                  </h3>

                  <p className="mb-6 flex-grow text-sm leading-relaxed text-slate-500">
                    {business.description}
                  </p>

                  <div className="space-y-3 border-t border-gray-100 pt-4 text-xs text-slate-500">
                    {business.address && (
                      <div className="flex items-start gap-2">
                        <MapPin
                          size={14}
                          className="mt-0.5 shrink-0 text-orange-400"
                        />
                        <span>{business.address}</span>
                      </div>
                    )}

                    {business.phone && (
                      <div className="flex items-center gap-2">
                        <Phone
                          size={14}
                          className="shrink-0 text-orange-400"
                        />
                        <span>{business.phone}</span>
                      </div>
                    )}

                    {business.hours && (
                      <div className="flex items-start gap-2">
                        <Clock
                          size={14}
                          className="mt-0.5 shrink-0 text-orange-400"
                        />
                        <span>{business.hours}</span>
                      </div>
                    )}

                    {business.socialMediaLink && (
                      <a
                        href={business.socialMediaLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-fit items-center gap-2 font-semibold text-orange-500 transition-colors hover:text-orange-600 hover:underline"
                      >
                        <LinkIcon size={14} />
                        View Social Media
                      </a>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredBusinesses.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 text-center"
          >
            <p className="text-lg text-slate-500">
              No businesses found matching your criteria.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="mt-4 font-semibold text-orange-500 hover:underline"
            >
              Clear all filters
            </button>
          </motion.div>
        )}
      </section>
    </div>
  );
}

export default BusinessHub;