import { motion } from "framer-motion";
import { Calendar } from "../../components/ui/calendar";
import { CalendarCheck, AlertTriangle, Users, Car, Wallet, ParkingSquare } from "lucide-react";
import residentHome from "../../assets/residentHome.jpeg";
import ResidentCalendar from "../../components/ResidentCalendar";
import NewsScroller from "../../components/NewsScroller";
import NewsCard from "../../components/NewsCard";
import vaccinesImage from "../../assets/vaccines.jpg";
import tapwaterImage from "../../assets/tapwater.jpg";
import treePlantingImage from "../../assets/treeplanting.jpg";
import hoaMeetingImage from "../../assets/hoameeting.jpg";
import bingoImage from "../../assets/bingo.avif";
import VenueCarousel from "../../components/VenueCarousel";
import { ChevronRight, Globe2, Store } from "lucide-react";
import foodImage from "../../assets/food.png";
import communityImage from "../../assets/community.jpg";

const quickLinks = [
    { label: "Reservations", icon: CalendarCheck },
    { label: "Complaints", icon: AlertTriangle },
    { label: "Community", icon: Users },
    { label: "Vehicle Stickers", icon: Car },
    { label: "Monthly Dues", icon: Wallet },
    { label: "Parking", icon: ParkingSquare },
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
        title: "New Vehicle Sticker Requirements",
        excerpt: "Starting next month, all resident vehicles will require updated stickers for gate access...",
        office: "Security Office",
    },
    {
        image: bingoImage,
        title: "New Vehicle Sticker Requirements",
        excerpt: "Starting next month, all resident vehicles will require updated stickers for gate access...",
        office: "Security Office",
    },
    {
        image: hoaMeetingImage,
        title: "New Vehicle Sticker Requirements",
        excerpt: "Starting next month, all resident vehicles will require updated stickers for gate access...",
        office: "Security Office",
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
    },
];

function ResidentHomePage() {
    return (
        <>
            {/*Hero Section*/}
            <section
                className="h-100 bg-cover bg-center flex items-center"
                style={{ backgroundImage: `url(${residentHome})` }}
            >
                <div className="flex flex-col items-center justify-center h-screen w-full text-center max-w-4xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="text-white text-5xl md:text-7xl lg:text-7xl font-bold drop-shadow-lg"
                    >
                        Hello, User!
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                        className="text-white text-s mt-6 leading-relaxed drop-shadow-md"
                    >
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </motion.p>
                </div>
            </section>

            {/*Get Started Section*/}
            <section className="min-h-[80vh] py-15 overflow-hidden">
                <div className="px-20 grid grid-cols-1 lg:grid-cols-3 gap-0">
                    
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className="lg:col-span-2 flex items-start mb-10"
                    >
                        <div className="w-2.5 h-13 bg-secondary rounded-full mr-3 mt-2"></div>
                        <div>
                            <h2 className="text-secondary text-4xl font-bold">Get Started,</h2>
                            <p className="text-primary font-bold">What would you like to do?</p>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className="flex items-start mb-10"
                    >
                        <div className="w-2.5 h-13 bg-secondary rounded-full mr-3 mt-2"></div>
                        <div className="flex flex-col">
                            <h2 className="text-secondary text-4xl font-bold">Calendar</h2>
                            <p className="text-primary font-bold">Check out our calendar</p>
                        </div>
                    </motion.div>

                    {/* Quick links */}
                    <div className="lg:col-span-2 grid grid-cols-[repeat(3,auto)] gap-x-8 gap-y-5 justify-start">
                        {quickLinks.map(({ label, icon: Icon }, index) => (
                            <motion.div
                                key={label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.08 }}
                                className={`flex flex-col items-center gap-3 cursor-pointer group ${
                                    index >= 3 ? "-mt-30" : ""
                                }`}
                            >
                                <div className="w-20 h-20 bg-secondary hover:bg-primary rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300">
                                    <Icon className="text-white text-3xl" />
                                </div>
                                <span className="text-primary font-semibold text-sm text-center">
                                    {label}
                                </span>
                            </motion.div>
                        ))}
                    </div>

                    {/*Calendar*/}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="-mt-2 flex justify-center"
                    >
                        <ResidentCalendar />
                    </motion.div>

                </div>
            </section>

            {/*Divider*/}
            <div className="w-297 h-3 bg-primary rounded-full ml-15 mr-3 mt-2"></div>

            {/*Latest News Section*/}
            <section className="relative min-h-[105vh] py-15 overflow-hidden">
                <div className="px-20 grid grid-cols-1 lg:grid-cols-3 gap-0">
                    <motion.div 
                        initial={{ opacity: 0, y: 25 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="lg:col-span-2 flex items-start mb-10"
                    >
                        <div className="w-2.5 h-13 bg-secondary rounded-full mr-3 mt-2"></div>
                        <div>
                            <h2 className="text-secondary text-4xl font-bold">Latest News</h2>
                            <p className="text-primary font-bold">Stay Updated</p>
                        </div>
                    </motion.div>

                    {/* Cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="lg:col-span-3 w-full"
                    >
                        <NewsScroller latestNews={latestNews} />
                    </motion.div>
                </div>

                <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-20">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                        <path
                            fill="#347433"
                            fillOpacity="1"
                            d="M0,96L34.3,85.3C68.6,75,137,53,206,64C274.3,75,343,117,411,154.7C480,192,549,224,617,202.7C685.7,181,754,107,823,106.7C891.4,107,960,181,1029,192C1097.1,203,1166,149,1234,138.7C1302.9,128,1371,160,1406,176L1440,192L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z"
                        ></path>
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

                        <div className="pt-2">
                            <button className="group inline-flex items-center gap-2 bg-secondary text-white font-semibold py-3 px-8 rounded-full shadow-sm hover:bg-secondary/90 hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
                                <span>Host an Event</span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2.5}
                                    stroke="currentColor"
                                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </button>
                        </div>
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

            {/*Community / Business Section*/}
            <section className="w-full overflow-hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2">
                    {communityBusiness.map(({ image, icon: Icon, title, label }, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.15 }}
                            className="relative h-[340px] sm:h-[420px] overflow-hidden group cursor-pointer"
                        >
                            <img
                                src={image}
                                alt={label}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/70 via-orange-400/55 to-amber-300/45"></div>
                            <div className="relative h-full flex flex-col items-center justify-center text-center px-6 gap-4">
                                <Icon className="text-white w-12 h-12" strokeWidth={1.5} />
                                <h3 className="text-white text-2xl sm:text-3xl font-bold leading-snug drop-shadow-md">
                                    {title}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white text-orange-500 shrink-0">
                                        <ChevronRight className="w-4 h-4" strokeWidth={3} />
                                    </span>
                                    <span className="text-white font-semibold">{label}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        </>
    );
}

export default ResidentHomePage;