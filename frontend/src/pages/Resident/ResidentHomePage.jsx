import { motion } from "framer-motion";
import { Calendar } from "../../components/ui/calendar";
import { CalendarCheck, AlertTriangle, Users, Car, Wallet, ParkingSquare } from "lucide-react";
import residentHome from "../../assets/residentHome.jpeg";
import ResidentCalendar from "../../components/ResidentCalendar";

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



function ResidentHomePage(){
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
            <section className="min-h-[60vh] py-15">
                <div className="px-20 grid grid-cols-1 lg:grid-cols-3 gap-0">

                <div className="lg:col-span-2 flex items-start mb-10">
                        <div className="w-2.5 h-13 bg-secondary rounded-full mr-3 mt-2"></div>
                        <div>
                            <h2 className="text-secondary text-4xl font-bold">Latest News</h2>
                            <p className="text-primary font-bold">Stay Updated</p>
                    </div>
                    {/*Cards */}
                </div>
                </div>

            </section>


        </>
    )
}
export default ResidentHomePage;