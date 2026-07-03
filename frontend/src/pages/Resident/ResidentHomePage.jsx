import { motion } from "framer-motion";
import { CalendarCheck, AlertTriangle, Users, Car, Wallet, ParkingSquare } from "lucide-react";
import residentHome from "../../assets/residentHome.jpeg";
import ResidentCalendar from "../../components/ResidentCalendar";
import NewsScroller from "../../components/NewsScroller";
import vaccinesImage from "../../assets/vaccines.jpg";
import tapwaterImage from "../../assets/tapwater.jpg";
import treePlantingImage from "../../assets/treeplanting.jpg";
import hoaMeetingImage from "../../assets/hoameeting.jpg";
import bingoImage from "../../assets/bingo.avif";
import VenueCarousel from "../../components/VenueCarousel";
import { ChevronRight, Globe2, Store } from "lucide-react";
import foodImage from "../../assets/food.png";
import communityImage from "../../assets/community.jpg";

import { Link } from "react-router-dom";

const quickLinks = [
    { label: "Reservations", icon: CalendarCheck, link: "/reservation" },
    { label: "Complaints", icon: AlertTriangle, link: "/grievance" },
    { label: "Community", icon: Users, link: "/community" },
    { label: "Vehicle Stickers", icon: Car, link: "/vehicleSticker" },
    { label: "Monthly Dues", icon: Wallet, link: "/monthlyDues" },
    { label: "Parking", icon: ParkingSquare, link: "/parkingReservation" },
];

const latestNews = [
    {
        image: treePlantingImage,
        title: "Community Clean-Up Drive This Saturday",
        excerpt: "Join your neighbors for our monthly clean-up initiative starting at 7AM near the clubhouse...",
        office: "Community Relations Office",
    },
    {
        image: vaccinesImage,
        title: "Reminder: Monthly Dues Deadline",
        excerpt: "Please settle your association dues before the 15th to avoid late payment penalties...",
        office: "Finance Office",
    },
    {
        image: tapwaterImage,
        title: "Water Supply Maintenance Schedule",
        excerpt: "Please be advised of temporary water interruptions due to system upgrades this coming Thursday...",
        office: "Technical & Utilities Office",
    },
    {
        image: bingoImage,
        title: "Weekend Community Bingo Night!",
        excerpt: "Get ready for a fun-filled evening with prizes, food trucks, and great company at the main pavilion...",
        office: "Events Committee",
    },
    {
        image: hoaMeetingImage,
        title: "Annual HOA Board Meeting Announcement",
        excerpt: "All homeowners are invited to attend our upcoming annual meeting to discuss subdivision updates...",
        office: "HOA Board Secretariat",
    },
];

const communityBusiness = [
    {
        image: communityImage,
        icon: Globe2,
        title: (
            <>
                Connect with your
                <br />
                community.
            </>
        ),
        label: "Connect",
        link: "/community",
    },
    {
        image: foodImage,
        icon: Store,
        title: (
            <>
                Businesses within
                <br />
                reach.
            </>
        ),
        label: "Browse",
        link: "/businesshub",
    },
];

function ResidentHomePage() {
    return (
        <>
            {/* Hero Section */}
            <section className="relative bg-[#f9f9f9] py-12 px-6 md:px-12 lg:px-20 font-sans overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="group relative mt-16 h-[400px] md:h-[500px] w-full rounded-[2.5rem] overflow-hidden shadow-lg flex items-end p-6 md:p-10 cursor-pointer"
                    >
                        <motion.div
                            className="absolute inset-0 bg-cover bg-center z-0"
                            style={{ backgroundImage: `url(${residentHome})` }}
                            whileHover={{ scale: 1.04 }}
                            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
                        />

                        <div className="mb-10 ml-3 z-10 max-w-xl pointer-events-none">
                            <h1 className="text-white font-bold text-3xl md:text-4xl mb-2 drop-shadow-md group-hover:translate-x-1 transition-transform duration-500">
                                Welcome home, Resident!
                            </h1>
                            <p className="text-white/90 text-sm md:text-base leading-relaxed drop-shadow-sm group-hover:translate-x-1 transition-transform duration-500 delay-75">
                                Welcome to your WWHS Subdivision Portal. Stay connected with our community, explore available neighborhood services, meet your current board officers, and stay instantly updated with the latest community announcements.
                            </p>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent z-[5] pointer-events-none" />
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        {/* Stat 1 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-[#ededed] p-6 rounded-[2rem] flex justify-between items-end"
                        >
                            <div>
                                <h4 className="text-4xl font-bold text-[var(--secondary)] md:text-secondary">3,200</h4>
                                <p className="text-xs uppercase tracking-wider text-gray-500 mt-1">Total Housing Units</p>
                            </div>
                        </motion.div>

                        {/* Stat 2 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-[#ededed] p-6 rounded-[2rem] flex justify-between items-end"
                        >
                            <div>
                                <h4 className="text-4xl font-bold text-[var(--secondary)] md:text-secondary">80%</h4>
                                <p className="text-xs uppercase tracking-wider text-gray-500 mt-1">Current Occupancy</p>
                            </div>
                            <span
                                style={{ borderColor: "var(--primary)", backgroundColor: "var(--accent)", color: "var(--primary)" }}
                                className="border text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full"
                            >
                                Active
                            </span>
                        </motion.div>

                        {/* Stat 3 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-[#1a1a1a] text-white p-6 rounded-[2rem] flex flex-col justify-end min-h-[120px]"
                        >
                            <h4 className="text-3xl font-bold tracking-tight">Filinvest</h4>
                            <p className="text-xs uppercase tracking-wider text-gray-400 mt-1">Subdivision Proposal Partner</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/*Get Started Section */}
            <section className="h-auto pt-16 pb-16 lg:pb-24 bg-white px-6 md:px-12 lg:px-20 overflow-visible">
                <div className="max-w-7xl mx-auto relative">

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                        {/* LEFT / CENTER: GET STARTED + QUICK LINKS */}
                        <div className="lg:col-span-8 space-y-8">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.5 }}
                                className="flex items-center"
                            >
                                <div className="w-2.5 h-12 bg-[var(--secondary)] rounded-full mr-4" />
                                <div>
                                    <h2 className="text-[var(--secondary)] text-3xl md:text-4xl font-bold tracking-tight">
                                        Get Started,
                                    </h2>
                                    <p className="text-[var(--primary)] font-semibold mt-0.5">
                                        What would you like to do?
                                    </p>
                                </div>
                            </motion.div>

                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-3 gap-x-6 gap-y-6 justify-start pt-2">
                                {quickLinks.map(({ label, icon: Icon, link }, index) => (
                                    <Link key={label} to={link} className="w-full">
                                        <motion.div
                                            initial={{ opacity: 0, y: 15 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.4, delay: index * 0.05 }}
                                            className="flex flex-col items-center gap-2.5 cursor-pointer group"
                                        >
                                            <div
                                                style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
                                                className="relative w-16 h-16 sm:w-20 sm:h-20 bg-[var(--secondary)] md:bg-secondary rounded-2xl flex items-center justify-center shadow-sm overflow-hidden transition-all duration-500 ease-out group-hover:bg-emerald-600 group-hover:shadow-lg group-hover:shadow-emerald-600/30 group-hover:-translate-y-2"
                                            >
                                                <div
                                                    style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
                                                    className="absolute bottom-0 w-full h-full bg-[var(--primary)] md:bg-primary rounded-full scale-0 translate-y-1/2 group-hover:scale-150 group-hover:translate-y-0 transition-transform duration-600 z-0 origin-bottom"
                                                />
                                                <Icon
                                                    style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
                                                    className="text-neutral-900 group-hover:text-white text-2xl sm:text-3xl transition-all duration-500 z-10 group-hover:scale-125 group-hover:rotate-6"
                                                />
                                            </div>
                                            <span className="text-[var(--primary)] font-semibold text-xs sm:text-sm text-center line-clamp-2 max-w-[90px] sm:max-w-none transition-colors duration-300 group-hover:text-emerald-600">
                                                {label}
                                            </span>
                                        </motion.div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT: CALENDAR */}
                        <div className="lg:col-span-4 space-y-8">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.5 }}
                                className="flex items-center"
                            >
                                <div className="w-2.5 h-12 bg-[var(--secondary)] rounded-full mr-4" />
                                <div>
                                    <h2 className="text-[var(--secondary)] text-3xl md:text-4xl font-bold tracking-tight">
                                        Calendar
                                    </h2>
                                    <p className="text-[var(--primary)] font-semibold mt-0.5">
                                        Check out our calendar
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.97 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="w-full"
                            >
                                <ResidentCalendar />
                            </motion.div>
                        </div>

                    </div>
                </div>
            </section>


            {/* divider */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-8">
                <div className="h-1 w-full rounded-full bg-emerald-600" />
            </div>

            {/* Latest News Section */}
            <section className="relative h-auto pt-16 pb-16 lg:pb-24 bg-white px-6 md:px-12 lg:px-20 overflow-visible">
                <div className="max-w-7xl mx-auto relative">

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12"></div>

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5 }}
                        className="flex items-start mb-8"
                    >
                        <div className="w-2.5 h-12 bg-[var(--secondary)] rounded-full mr-4" />
                        <div>
                            <h2 className="text-[var(--secondary)] md:text-secondary text-4xl font-bold">
                                Latest News
                            </h2>
                            <p className="text-[var(--primary)] md:text-primary font-bold">
                                Stay Updated
                            </p>
                        </div>
                    </motion.div>

                    {/* Cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                    >
                        <NewsScroller latestNews={latestNews} />
                    </motion.div>
                </div>

                {/*Wave*/}

                <div className="absolute -bottom-15 left-0 w-full overflow-hidden leading-[0] pointer-events-none z-0">
                    <svg
                        className="block w-full h-[150px]"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1440 320"
                        preserveAspectRatio="none"
                    >
                        <path
                            fill="#347433"
                            d="M0,96L34.3,85.3C68.6,75,137,53,206,64C274.3,75,343,117,411,154.7C480,192,549,224,617,202.7C685.7,181,754,107,823,106.7C891.4,107,960,181,1029,192C1097.1,203,1166,149,1234,138.7C1302.9,128,1371,160,1406,176L1440,192L1440,320L0,320Z"
                        />
                    </svg>
                </div>
            </section>

            {/* Venue Reservations CTA */}
            <section className="min-h-[70vh] py-16 bg-neutral-50/60 rounded-3xl my-8 mx-4 md:mx-12 overflow-hidden">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12 px-8 md:px-20">
                    {/* Left content block */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="w-full lg:w-1/2 max-w-xl space-y-6 text-center lg:text-left"
                    >
                        <div className="space-y-3">
                            <span className="text-xs font-semibold tracking-wider uppercase text-primary bg-primary/10 px-3 py-1 rounded-full inline-block">
                                Shared Spaces
                            </span>
                            <h2 className="text-secondary text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                                Planning your next gathering?
                            </h2>
                        </div>

                        <p className="text-black/80 text-lg leading-relaxed font-medium">
                            Whether it's a neighborhood meeting, a celebration, or a local workshop, our community spaces are ready to welcome you. Book your spot easily through the WWHS Portal.
                        </p>

                        <Link to="../../reservation" className="btn-glow active:scale-95 inline-block text-center">
                            <span>Book a Venue</span>
                        </Link>
                    </motion.div>

                    {/* Right aligned carousel block */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                        className="w-full lg:w-1/2 flex justify-center lg:justify-end class-carousel-fix"
                    >
                        <VenueCarousel />
                    </motion.div>
                </div>
            </section>

            {/* Community / Business Section */}
            <section className="w-full overflow-hidden mb-20">
                <div className="grid grid-cols-1 sm:grid-cols-2">
                    {communityBusiness.map(({ image, icon: Icon, title, label, link }, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.15 }}
                            className="relative h-[340px] sm:h-[420px] overflow-hidden group cursor-pointer"
                        >
                            <Link to={link} className="absolute inset-0 z-10 w-full h-full block">
                                <img
                                    src={image}
                                    alt={label}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />

                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/70 via-orange-400/55 to-amber-300/45" />

                                <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-6 gap-4">
                                    <Icon className="text-white w-12 h-12" strokeWidth={1.5} />

                                    <h3 className="text-white text-2xl sm:text-3xl font-bold leading-snug drop-shadow-md">
                                        {title}
                                    </h3>

                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white text-orange-500 shrink-0 transition-transform duration-300 group-hover:translate-x-1">
                                            <ChevronRight className="w-4 h-4" strokeWidth={3} />
                                        </span>
                                        <span className="text-white font-semibold">{label}</span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>
        </>
    );
}

export default ResidentHomePage;