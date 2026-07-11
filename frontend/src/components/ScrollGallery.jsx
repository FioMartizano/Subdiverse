import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

import senior1 from "../assets/officesMedia/Seniors1.jpg";
import senior2 from "../assets/officesMedia/Seniors2.jpg";
import senior3 from "../assets/officesMedia/Seniors3.jpg";
import senior4 from "../assets/officesMedia/Seniors4.png";
import senior5 from "../assets/officesMedia/Seniors5.png";

const officeInfoData = [
    {
        id: 1,
        title: "Our Mission",
        description:
            "To provide dedicated care, support, and meaningful programs for senior residents, ensuring their well-being and dignity within the community.",
        image: senior1,
    },
    {
        id: 2,
        title: "Our Vision",
        description:
            "A community where every senior citizen feels valued, supported, and actively engaged in community life.",
        image: senior2,
    },
    {
        id: 3,
        title: "Our Objectives",
        description:
            "To coordinate healthcare access, social activities, and welfare assistance tailored to the needs of senior residents.",
        image: senior3,
    },
    {
        id: 4,
        title: "Core Values",
        description:
            "Compassion, respect, and inclusivity guide every program and service we provide to our senior community.",
        image: senior4,
    },
    {
        id: 5,
        title: "Our Commitment",
        description:
            "We are committed to building lasting relationships with our senior residents and fostering a supportive, connected community.",
        image: senior5,
    },
];

function ScrollGallery() {
    const [activeIndex, setActiveIndex] = useState(0);

    const sectionRef = useRef(null);
    const sectionInView = useInView(sectionRef, { margin: "-10% 0px -10% 0px" });

    return (
        <section
            ref={sectionRef}
            className="w-full bg-white relative z-10 pt-20 pb-24 md:pt-28 md:pb-32"
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT: Sticky titles + description */}
                <div className="lg:col-span-4 order-2 lg:order-1">
                    <div className="lg:sticky lg:top-32 flex flex-col gap-8 pt-4">
                        <span className="text-xs tracking-widest uppercase text-zinc-400">
                            About the Office
                        </span>
                        {officeInfoData.map((item, i) => (
                            <motion.div
                                key={item.id}
                                animate={{
                                    opacity: activeIndex === i ? 1 : 0.3,
                                    x: activeIndex === i ? 0 : -4,
                                }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                            >
                                <h3
                                    className={`text-xl md:text-2xl font-bold tracking-tight leading-snug ${
                                        activeIndex === i
                                            ? "text-[var(--color-secondary)]"
                                            : "text-zinc-400"
                                    }`}
                                >
                                    {item.title}
                                </h3>

                                {activeIndex === i && (
                                    <motion.p
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                        className="text-sm text-zinc-500 mt-2 max-w-sm leading-relaxed"
                                    >
                                        {item.description}
                                    </motion.p>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* CENTER: Scrolling image column */}
                <div className="lg:col-span-8 order-1 lg:order-2 flex flex-col gap-12 md:gap-16">
                    {officeInfoData.map((item, i) => (
                        <ImageReveal
                            key={item.id}
                            item={item}
                            isActive={activeIndex === i}
                            onInView={() => setActiveIndex(i)}
                        />
                    ))}
                </div>
            </div>


            <AnimatePresence>
                {sectionInView && (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.3 }}
                        className="fixed right-6 md:right-10 bottom-8 md:top-1/2 md:bottom-auto md:-translate-y-1/2 z-30 text-right pointer-events-none"
                    >
                        <span className="text-3xl font-bold text-[var(--color-primary)]">
                            {String(activeIndex + 1).padStart(2, "0")}
                        </span>
                        <span className="block text-sm text-zinc-400 mt-1">
                            / {String(officeInfoData.length).padStart(2, "0")}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}

function ImageReveal({ item, isActive, onInView }) {
    const ref = useRef(null);

    const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });

    if (inView) {
        onInView();
    }

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0.5, scale: 0.96 }}
            animate={{
                opacity: isActive ? 1 : 0.6,
                scale: isActive ? 1 : 0.97,
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full rounded-3xl overflow-hidden shadow-lg aspect-[4/3] md:aspect-[16/10]"
        >
            <img
                src={item.image}
                alt={item.title}
                className={`w-full h-full object-cover transition-all duration-500 ease-out ${
                    isActive
                        ? "sepia-[.12] saturate-[1.3] contrast-[1.05] brightness-105"
                        : "sepia-[.08] saturate-[1.05] brightness-95"
                }`}
            />
        </motion.div>
    );
}

export default ScrollGallery;