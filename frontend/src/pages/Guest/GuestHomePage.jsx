import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
// Assets
import homeImage from "../../assets/home.jpg";
import wwhsLogo from "../../assets/wwhs-logo.png";
import filinvestLogo from "../../assets/filinvest-logo.png";
import abHome from "../../assets/aboutUsHome.jpg";
import hoaGuest from "../../assets/hoaGuest.jpg";
import seniorGuest from "../../assets/seniorGuest.jpg";
import healthGuest from "../../assets/healthCareGuest.jpg";
import churchGuest from "../../assets/churchGuest.jpg";
// Components
import AnimatedShape from "../../components/AnimatedShape";
import WindwardMap from "../../components/Maps/WindwardMap";

const logos = [wwhsLogo, filinvestLogo];
const repeated = Array(5).fill(logos).flat();

const offices = [
    { img: hoaGuest, title: "HOA Office", desc: "Handles community concerns and homeowner assistance.", link: "/guest_offices?section=hoa" },
    { img: seniorGuest, title: "Senior Citizen Office", desc: "Support and services for senior residents.", link: "/guest_offices?section=elderly" },
    { img: healthGuest, title: "Health Office", desc: "Basic healthcare and wellness assistance.", link: "/guest_offices?section=healthcare" },
    { img: churchGuest, title: "Church Office", desc: "Coordinates parish events and services.", link: "/guest_offices?section=parish" },
];

const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };
const staggerItem = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };

function GuestHomePage() {
    const { scrollYProgress } = useScroll();
    const yellowY = useTransform(scrollYProgress, [0, 1], [0, -200]);
    const yellowRotate = useTransform(scrollYProgress, [0, 1], [0, 45]);

 
    const contactRef = useRef(null);

    const { scrollYProgress: contactProgress } = useScroll({
        target: contactRef,
        offset: ["start end", "start center"],

    });

    const [isLargeScreen, setIsLargeScreen] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia("(min-width: 1024px)");
        const updateMatch = () => setIsLargeScreen(mq.matches);
        updateMatch();
        mq.addEventListener("change", updateMatch);
        return () => mq.removeEventListener("change", updateMatch);
    }, []);


    const shapeOpacity = useTransform(
        contactProgress,
        [0, 1],
        isLargeScreen ? [1, 1] : [1, 0]
    );

    return (
        <>
            {/* Hero Section */}
            <section
                className="min-h-screen bg-cover bg-center flex items-center"
                style={{ backgroundImage: `url(${homeImage})` }}
            >
                <div className="px-6 sm:px-10 md:px-16 lg:ml-20 lg:px-0 max-w-4xl">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold drop-shadow-lg leading-tight"
                    >
                        Windward Hills Subdivision
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                        className="text-white text-sm md:text-base mt-6 leading-relaxed drop-shadow-md"
                    >
                        Experience a smarter way to connect with Windward Hills Subdivision through digital services, reservations, announcements, and community engagement.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                        className="mt-8 flex gap-4"
                    >
                        <button className="btn-primary">
                            Sign Up
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Logo Carousel Section */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="bg-white py-10 md:py-3 overflow-hidden"
            >
                <style>{`
                        @keyframes logo-scroll {
                        from {transform: translateX(0);}
                        to {transform: translateX(-50%);}
                        }
                        .logo-track {
                            animation: logo-scroll 20s linear infinite;
                        }
                        .logo-track:hover {
                            animation-play-state: paused;
                        }
                        @media (prefers-reduced-motion: reduce) {
                        .logo-track{animation: none;}
                        }
                        `}</style>

                <div className="logo-track flex items-center gap-8 md:gap-12 lg:gap-16">
                    {[...repeated, ...repeated].map((logo, i) => (
                        <img key={i} src={logo} alt={`Logo ${i}`} className="h-8 sm:h-10 md:h-16 lg:h-45 w-auto flex-none" />
                    ))}
                </div>
            </motion.section>

            {/* About Section */}
            <section className="min-h-fit md:min-h-screen flex items-center bg-primary py-16 md:py-0">
                <div className="max-w-6xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

                    <motion.div
                        initial={{ opacity: 0, x: -60 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="w-full lg:w-3/5"
                    >
                        <img
                            src={abHome}
                            alt="About Us"
                            className="w-full h-56 sm:h-64 md:h-80 lg:h-[400px] xl:h-[480px] object-cover rounded-2xl shadow-lg"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 60 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
                        className="w-full lg:w-1/2 text-white"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="rounded-full bg-secondary px-6 py-2 shadow-lg"></div>
                            <p className="text-white text-sm sm:text-base md:text-lg lg:text-xl font-semibold mb-2">
                                Windward Hills Subdivision
                            </p>
                        </div>

                        <h2 className="text-secondary text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold drop-shadow-lg">
                            About Us
                        </h2>

                        <p className="mt-6 text-sm md:text-base lg:text-lg leading-relaxed">
                            Developed by Filinvest Group Corporation, Windward Hills Subdivision is a thriving residential community composed of four phases—Phase 1, Phase 2, Phase D, and Phase E. Conveniently located near schools, universities, markets, and essential establishments, it also features its own businesses, parish church, and community organizations. Guided by its vision of fostering camaraderie and unity, Windward Hills continues to provide a safe, connected, and welcoming environment for its residents.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* CHANGED: Offices + divider + Contact are back under ONE shared
                relative wrapper, exactly like your original — this is what lets
                the shape travel the full distance from Contact up through Offices. */}
            <div className="relative bg-white overflow-hidden pb-15 lg:pb-25">
                <motion.div style={{ opacity: shapeOpacity }}>
                    <AnimatedShape
                        className="w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] md:w-[300px] md:h-[300px] lg:w-[400px] lg:h-[400px] -right-[75px] sm:-right-[100px] md:-right-[150px] lg:-right-[200px] top-100 !bg-secondary !blur-none rounded-full opacity-100"
                        xRange={[0, 0]}
                        yRange={[0, -800]}
                        rotateRange={[0, 45]}
                        scaleRange={[1, 1.2]}
                    />

                    <AnimatedShape
                        className="absolute w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] md:w-[300px] md:h-[300px] lg:w-[400px] lg:h-[400px] -left-[75px] sm:-left-[100px] md:-left-[150px] lg:-left-[200px] top-[50%] -translate-y-1/2 !bg-primary !blur-none rounded-full opacity-100"
                        xRange={[0, 0]}
                        yRange={[1300, -40]}
                        rotateRange={[0, -45]}
                        scaleRange={[1, 1.2]}
                    />
                </motion.div>

                <section className="relative z-10 py-16">
                    {/* Office Section Heading */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="mx-auto max-w-4xl px-6 text-center mt-16"
                    >
                        <h1 className="text-primary text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
                            Windward Hills Offices
                        </h1>

                        <p className="text-secondary mt-4 text-sm md:text-base lg:text-lg leading-relaxed">
                            - Windward Hills Subdivision, Burol 1 -
                        </p>
                    </motion.div>

                    {/* Office Cards */}
                    <div className="mx-auto mt-12 max-w-6xl px-6">
                        <motion.div
                            className="flex flex-col md:flex-row gap-5 md:h-[333px] lg:h-[400px]"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            variants={staggerContainer}
                        >
                            {offices.map((office, i) => (
                                <Link key={i} to={office.link} className="md:flex-1">
                                    <motion.div
                                        variants={staggerItem}
                                        className="group relative h-56 sm:h-64 md:h-full md:hover:flex-[2.2] transition-all duration-500 ease-in-out overflow-hidden rounded-2xl shadow-lg cursor-pointer"
                                    >
                                        <img
                                            src={office.img}
                                            alt={office.title}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />

                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500" />

                                        <div className="absolute bottom-0 left-0 p-5 text-white opacity-100 translate-y-0 md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-500">
                                            <h3 className="text-base sm:text-lg md:text-xl font-bold">{office.title}</h3>
                                            <p className="text-xs md:text-sm mt-1 text-white/90">{office.desc}</p>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* divider */}
                <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-8">
                    <div className="h-1 w-full rounded-full bg-emerald-600" />
                </div>

                {/* Contact Section — ref placed here so we can detect when it's
                    about to scroll into view, purely to drive the mobile/tablet fade */}
                <section ref={contactRef} className="relative z-10 py-16">
                    <div className="max-w-7xl mx-auto px-6">
                        {/* Heading */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="lg:pl-24"
                        >
                            <p className="text-base md:text-lg text-primary py-2">
                                Contact Us
                            </p>

                            <h1 className="text-secondary text-2xl md:text-4xl lg:text-5xl font-bold">
                                Get in Touch
                            </h1>
                        </motion.div>

                        {/* Content */}
                        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

                            {/* Left */}
                            <motion.div
                                className="lg:pl-48 space-y-6"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.2 }}
                                variants={staggerContainer}
                            >
                                <motion.div variants={staggerItem}>
                                    <h2 className="text-primary text-sm md:text-base lg:text-lg font-semibold">
                                        Contact Number
                                    </h2>
                                    <p className="text-secondary text-sm md:text-base">
                                        Phone: (123) 456-7890
                                    </p>
                                </motion.div>

                                <motion.div variants={staggerItem}>
                                    <h2 className="text-primary text-sm md:text-base lg:text-lg font-semibold">
                                        Email Address
                                    </h2>
                                    <p className="text-secondary text-sm md:text-base">
                                        Email: hoa@example.com
                                    </p>
                                </motion.div>

                                <motion.div variants={staggerItem}>
                                    <h2 className="text-primary text-sm md:text-base lg:text-lg font-semibold">
                                        Address
                                    </h2>
                                    <p className="text-secondary text-sm md:text-base">
                                        Windward Hills Subdivision
                                        <br />
                                        Burol I, Dasmariñas City
                                        <br />
                                        Cavite
                                    </p>
                                </motion.div>
                            </motion.div>

                            {/* Right */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.7, ease: "easeOut" }}
                                className="w-full lg:-mt-16 lg:-ml-16"
                            >
                                <WindwardMap />
                            </motion.div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

export default GuestHomePage;