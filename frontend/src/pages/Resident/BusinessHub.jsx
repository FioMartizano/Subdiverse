// BusinessHub.jsx
import React, { useMemo, useState, useEffect } from "react";
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
  AlertCircle,
  Mail,
} from "lucide-react";

import { db } from "../../firebase";
import {
  collection,
  query,
  onSnapshot,
  where,
  orderBy,
} from "firebase/firestore";

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

function BusinessHub() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // Real-time listener for businesses
  useEffect(() => {
    // Query only active businesses
    const businessesQuery = query(
      collection(db, "Businesses"),
      where("status", "==", "active"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      businessesQuery,
      (snapshot) => {
        const businessesData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate?.() || null,
          };
        });
        setBusinesses(businessesData);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error("Firestore businesses error:", error);
        setError("Failed to load businesses. Please try again later.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filter businesses
  const filteredBusinesses = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return businesses.filter((business) => {
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
  }, [businesses, searchQuery, selectedCategory]);

  const getCategoryLabel = (categoryId) =>
    CATEGORIES.find((category) => category.id === categoryId)?.label ||
    "Other";

  const getCategoryIcon = (categoryId) => {
    const category = CATEGORIES.find((cat) => cat.id === categoryId);
    return category ? category.Icon : Store;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center bg-gray-50">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-lg font-medium text-slate-700">Loading businesses...</p>
            <p className="text-sm text-slate-500 mt-1">Discovering local treasures</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center bg-gray-50">
        <div className="flex min-h-[400px] items-center justify-center px-4">
          <div className="text-center max-w-md">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-slate-800">Something went wrong</h3>
            <p className="text-sm text-slate-600 mt-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div class="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-orange-50 to-slate-100 text-slate-400">
                            <${getCategoryIcon(business.category).displayName || 'Store'} size={42} strokeWidth={1.5} />
                            <span class="text-xs font-medium">No image available</span>
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-orange-50 to-slate-100 text-slate-400">
                      {React.createElement(getCategoryIcon(business.category), {
                        size: 42,
                        strokeWidth: 1.5,
                      })}
                      <span className="text-xs font-medium">
                        No image available
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

                  <p className="mb-6 flex-grow text-sm leading-relaxed text-slate-500 line-clamp-3">
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

                    {business.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="shrink-0 text-orange-400" />
                        <span>{business.email}</span>
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
            <Store size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-lg text-slate-500">
              {searchQuery || selectedCategory !== "all" 
                ? "No businesses found matching your criteria."
                : "No businesses available yet. Check back soon!"}
            </p>
            {(searchQuery || selectedCategory !== "all") && (
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
            )}
          </motion.div>
        )}
      </section>
    </div>
  );
}

export default BusinessHub;