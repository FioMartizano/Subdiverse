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

/*const quickLinks = [
    { label: "Reservations", icon: CalendarCheck, to: "/reservation" },
    { label: "Complaints", icon: AlertTriangle, to: "/grievance" },
    { label: "Community", icon: Users, to: "/community" },
    { label: "Vehicle Stickers", icon: Car, to: "/vehicleSticker" },
    { label: "Monthly Dues", icon: Wallet, to: "/monthlyDues" },
    { label: "Parking", icon: ParkingSquare, to: "/parkingReservation" },
];*/

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
        image: bingoImage ,
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

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                        className="mt-8 flex gap-4"
                    >
                    </motion.div>
                </div>
            </section>

            {/*Get Started Section*/}
            <section className="min-h-[80vh] py-15">
                <div className="px-20 grid grid-cols-1 lg:grid-cols-3 gap-0">


                    <div className="lg:col-span-2 flex items-start mb-10">
                        <div className="w-2.5 h-13 bg-secondary rounded-full mr-3 mt-2"></div>
                        <div>
                            <h2 className="text-secondary text-4xl font-bold">Get Started,</h2>
                            <p className="text-primary font-bold">What would you like to do?</p>
                        </div>
                    </div>

                    <div className="flex items-start mb-10">
                        <div className="w-2.5 h-13 bg-secondary rounded-full mr-3 mt-2"></div>

                        <div className="flex flex-col">
                            <h2 className="text-secondary text-4xl font-bold">
                                Calendar
                            </h2>
                            <p className="text-primary font-bold">
                                Check out our calendar
                            </p>
                        </div>
                    </div>

                    {/* Quick links */}

                    {/*<div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-2 gap-6">
                        {quickLinks.map(({ label, icon: Icon, to }) => (
                            <Link
                                key={label}
                                to={to}
                                className="flex flex-col items-center justify-center gap-3 bg-white border border-gray-200 rounded-2xl py-10 px-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                            >
                                <Icon className="text-secondary text-4xl" />
                                <span className="text-primary font-semibold">{label}</span>
                            </Link>
                        ))}
                    </div>*/}

                    <div className="lg:col-span-2 grid grid-cols-[repeat(3,auto)] gap-x-8 gap-y-5 justify-start">
                        {quickLinks.map(({ label, icon: Icon }, index) => (
                            <div
                                key={label}
                                className={`flex flex-col items-center gap-3 cursor-pointer group ${index >= 3 ? "-mt-30" : ""
                                    }`}
                            >
                                <div className="w-20 h-20 bg-secondary hover:bg-primary rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300">
                                    <Icon className="text-white text-3xl" />
                                </div>
                                <span className="text-primary font-semibold text-sm text-center">
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/*Calendar*/}
                    <div className="-mt-2 flex justify-center">
                        <ResidentCalendar />
                    </div>

                </div>
            </section>

            {/*Divider*/}
            <div className="w-297 h-3 bg-primary rounded-full ml-15 mr-3 mt-2"></div>

            {/*Latest News Section*/}
            <section className="relative min-h-[105vh] py-15">
                <div className="px-20 grid grid-cols-1 lg:grid-cols-3 gap-0">

                    <div className="lg:col-span-2 flex items-start mb-10">
                        <div className="w-2.5 h-13 bg-secondary rounded-full mr-3 mt-2"></div>
                        <div>
                            <h2 className="text-secondary text-4xl font-bold">Latest News</h2>
                            <p className="text-primary font-bold">Stay Updated</p>
                        </div>
                    </div>

                        {/* Cards */}
                        

                    <NewsScroller latestNews={latestNews} />


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

        {/*Venue Reservations CTA*/}
        <section className="min-h-[70vh] py-15">
            <div className="flex items-start justify-between gap-10 px-20">

                    <div className="max-w-md">
                        <h2 className="text-secondary text-5xl font-bold text-left mb-3">
                            Looking for a Venue?
                        </h2>
                        <p className="text-primary font-bold text-left">
                            Reserve our community facilities quickly and easily through our WWHS Portal.
                        </p>
                    </div>

                    {/* Right: Carousel */}
                    <div className="flex-1">
                        {/* your carousel/image slider goes here */}
                    </div>


            </div>

        </section>


        </>
    )
}
export default ResidentHomePage;