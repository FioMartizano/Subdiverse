import seniorsHome from "../../../assets/officesMedia/SeniorsHome.jpg";
import { useState } from "react";
import { Contact, HeartPulse, UserRound, Dumbbell, CakeIcon, PartyPopperIcon } from "lucide-react";
import ScrollGallery from "../../../components/ScrollGallery";
import { MapPin, Clock, Mail, Send } from "lucide-react";
import SeniorsMap from "../../../components/Maps/SeniorsMap";

import hoaOfficer1 from "../../../assets/SeniorsOfficers/Cardel.png";
import hoaOfficer2 from "../../../assets/SeniorsOfficers/Saracho.png";
import SeniorsSupport from "../../../assets/officesMedia/Seniors9.jpg";
import SeniorsHealth from "../../../assets/officesMedia/Seniors10.jpg";
import SeniorsID from "../../../assets/officesMedia/Seniors6.jpg";





const officersData = [
    { id: 1, name: "Editha Cardel", position: "Head Coordinator", image: hoaOfficer1 },
    { id: 2, name: "Elizabeth Saracho", position: "Treasurer", image: hoaOfficer2 },
];


function Elderly() {

    const [hoveredTile, setHoveredTile] = useState(null);

    const tilesData = [
        {
            id: 1,
            type: "interactive",
            icon: <Contact className="text-white w-16 h-16 stroke-[1.5]" />,
            title: "Senior's ID Assistance",
            description: "Provides guidance for first-time applicants, assists in preparing documentary requirements and helps residents understand the application process"
        },
        {
            id: 2,
            type: "image",
            src: SeniorsSupport,
            alt: "Senior Support"
        },
        {
            id: 3,
            type: "interactive",
            icon: <HeartPulse className="text-white w-16 h-16 stroke-[1.5]" />,
            title: "Health Programs",
            description: "Health services such as blood pressure monitoring and blood sugar testing are offered to help monitor the well-being of senior citizens."
        },
        {
            id: 4,
            type: "image",
            src: SeniorsID,
            alt: "ID Assistance"
        },
        {
            id: 5,
            type: "interactive",
            icon: <UserRound className="text-white w-16 h-16 stroke-[1.5]" />,
            title: "Senior Citizen Support",
            description: "Providing companionship and community support to fellow seniors and assisting members with concerns related to senior citizen programs."
        },
        {
            id: 6,
            type: "image",
            src: SeniorsHealth,
            alt: "Medical Care Programs"
        }
    ];

    // Weekly activities / schedule list
    const scheduleList = [
        { icon: <Dumbbell size={24} />, title: "Weekly Zumba", desc: "Every Saturday morning, front of the office" },
        { icon: <CakeIcon size={24} />, title: "Monthly Gatherings", desc: "Monthly Meetings & Birthday celebrations for members celebrating that month" },
        { icon: <PartyPopperIcon size={24} />, title: "Special Events", desc: "Bingo, Raffles, Christmas Party, etc." }
    ];

    return (
        <div className="bg-white min-h-screen w-full flex flex-col">

            <div className="absolute top-0 left-0 w-full h-20 bg-white z-10"></div>

            {/* HERO */}
            <section
                className="w-full h-[500px] md:h-[600px] bg-cover bg-center flex items-center relative overflow-hidden"
                style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${seniorsHome})`
                }}
            >

                <div className="ml-12 md:ml-24 max-w-2xl text-left z-10">
                    <span className="text-white text-lg md:text-xl font-medium tracking-wide block mb-1">
                        Welcome to the
                    </span>

                    <h1 className="text-white text-4xl md:text-6xl font-bold leading-tight">
                        Samahan ng<br /> <span className="whitespace-nowrap">Windward Hills Senior Citizen</span>
                    </h1>

                    <p className="text-gray-200 text-sm md:text-base mt-4 max-w-xl leading-relaxed">
                        The Senior Citizens Office serves senior residents of Windward Hills Subdivision in coordination with the Burol 1 Senior Citizens Organization. Its goal is to foster an active, supportive, and welcoming community where senior citizens can socialize, participate in meaningful activities, and receive assistance with programs and government services.
                    </p>

                    <div className="mt-6">
                        <button className="bg-[var(--color-secondary)] hover:bg-[var(--color-primary)] text-white font-semibold py-3 px-8 rounded-full shadow-md transition duration-200 text-sm md:text-base">
                            Stay Updated
                        </button>
                    </div>
                </div>
            </section>

            {/* OFFICE INFO CARDS - New section matching Healthcare */}
            <section className="bg-white w-full py-8 px-6 md:px-24 flex justify-center -mt-8 relative z-20">
                <div className="max-w-6xl w-full grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-2xl p-6 md:p-8 border border-gray-100 fade-in-up shadow-sm" style={{ animationDelay: '0.3s' }}>
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 hover:-translate-y-1 transition-all duration-300">
                        <div className="bg-[var(--color-primary)]/10 p-2.5 rounded-full">
                            <Clock className="w-6 h-6 text-[var(--color-primary)]" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Office Hours</p>
                            <p className="text-sm md:text-base font-semibold text-[var(--color-primary)] leading-tight">Mon, Wed, Fri<br></br>10 AM to 3 PM</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 hover:-translate-y-1 transition-all duration-300">
                        <div className="bg-[var(--color-primary)]/10 p-2.5 rounded-full">
                            <MapPin className="w-6 h-6 text-[var(--color-primary)]" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Location</p>
                            <p className="text-sm md:text-base font-semibold text-[var(--color-primary)] leading-tight">WWHS, Clubhouse</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 hover:-translate-y-1 transition-all duration-300">
                        <div className="bg-[var(--color-primary)]/10 p-2.5 rounded-full">
                            <Mail className="w-6 h-6 text-[var(--color-primary)]" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Facebook</p>
                            <p className="text-sm md:text-base font-semibold text-[var(--color-primary)] leading-tight">Samahan ng Windward Hills Senior Citizen</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 hover:-translate-y-1 transition-all duration-300">
                        <div className="bg-[var(--color-primary)]/10 p-2.5 rounded-full">
                            <Send className="w-6 h-6 text-[var(--color-primary)]" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Response Time</p>
                            <p className="text-sm md:text-base font-semibold text-[var(--color-primary)] leading-tight">Within 24-48 hrs</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. OFFICERS SECTION */}
            <section className="bg-[var(--color-primary)] w-full py-16 px-4 md:px-12 flex flex-col items-center">

                {/* Main Heading */}
                <h2 className="text-white text-5xl md:text-6xl font-bold tracking-tight mb-12 text-center">
                    Officers
                </h2>

                {/* Centered Layout Container */}
                <div className="flex flex-wrap justify-center gap-10 max-w-4xl w-full px-4">
                    {officersData.map((officer) => (
                        <div key={officer.id} className="flex flex-col items-center w-64 sm:w-72 md:w-80">


                            <div className="w-full aspect-square rounded-3xl overflow-hidden shadow-lg bg-zinc-800 group cursor-pointer">
                                <img
                                    src={officer.image}
                                    alt={officer.name}
                                    className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
                                />
                            </div>

                            {/* Info Text */}
                            <div className="mt-4 text-center">
                                <h3 className="text-white text-xl font-bold leading-tight">
                                    {officer.name}
                                </h3>
                                <p className="text-white text-base italic font-light opacity-90 mt-0.5">
                                    {officer.position}
                                </p>
                            </div>

                        </div>
                    ))}
                </div>
            </section>


            {/* 3. SERVICES WE OFFER SECTION */}
            <section className="bg-white w-full py-16 px-6 md:px-24 flex justify-center rounded-t-[40px] shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.05)] relative z-20 -mt-8">
                <div className="max-w-6xl w-full">

                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-[8px] h-[36px] bg-[var(--color-primary)] rounded-full"></div>
                        <div>
                            <h2 className="text-[var(--color-secondary)] text-3xl md:text-4xl font-bold tracking-wide">
                                Services We Offer
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">Dedicated assistance and programs for our senior residents' well-being</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

                        {/* 2x3 Grid Dashboard Wrapper */}
                        <div className="lg:col-span-3 grid grid-cols-3 gap-4">
                            {tilesData.map((tile) => {
                                // Render standard image block
                                if (tile.type === "image") {
                                    return (
                                        <div key={tile.id} className="aspect-square rounded-2xl overflow-hidden shadow-sm">
                                            <img
                                                src={tile.src}
                                                alt={tile.alt}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    );
                                }

                                const isHovered = hoveredTile === tile.id;

                                return (
                                    <div
                                        key={tile.id}
                                        onMouseEnter={() => setHoveredTile(tile.id)}
                                        onMouseLeave={() => setHoveredTile(null)}
                                        className={`aspect-square rounded-2xl flex flex-col p-5 transition-all duration-300 select-none ${isHovered
                                            ? "bg-white border-2 border-[var(--color-secondary)] justify-start items-start text-left shadow-lg"
                                            : "bg-[var(--color-secondary)] justify-center items-center text-center cursor-pointer"
                                            }`}
                                    >
                                        {isHovered ? (

                                            <div className="animate-fadeIn">
                                                <h3 className="text-[var(--color-secondary)] text-base md:text-lg font-bold tracking-wide mb-1 md:mb-2">
                                                    {tile.title}
                                                </h3>
                                                <p className="text-zinc-600 text-[11px] sm:text-xs md:text-sm font-medium leading-relaxed max-h-[85%] overflow-hidden">
                                                    {tile.description}
                                                </p>
                                            </div>
                                        ) : (

                                            <div className="transition-transform duration-200 transform scale-100">
                                                {tile.icon}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="lg:col-span-1 pt-2">
                            <p className="text-[var(--color-primary)] text-lg md:text-xl font-medium leading-relaxed">
                                Services are available through scheduled visits, health programs, and community initiatives.
                            </p>

                            {/* Weekly Activities / Schedule List */}
                            <div className="mt-6 space-y-3">
                                {scheduleList.map((item, index) => (
                                    <div key={index} className="flex items-center gap-3 text-sm text-gray-600">
                                        <span className="text-[var(--color-secondary)]">{item.icon}</span>
                                        <div>
                                            <p className="font-semibold">{item.title}</p>
                                            <p className="text-xs text-gray-400">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* 4. EVENTS SCROLL GALLERY SECTION */}
            <ScrollGallery />

            {/* VISIT OUR OFFICE SECTION - Updated with fade-in animations */}
            <section id="visit-office" className="bg-gray-50 w-full py-24 px-6 md:px-24">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-4 mb-12 fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <div className="w-[8px] h-[36px] bg-[var(--color-primary)] rounded-full"></div>
                        <h2 className="text-[var(--color-secondary)] text-3xl md:text-4xl font-bold tracking-wide">
                            Visit Our Office
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8 fade-in-up" style={{ animationDelay: '0.3s' }}>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <MapPin className="text-[var(--color-primary)] mt-1" />
                                    <div>
                                        <h4 className="font-bold">Address</h4>
                                        <p className="text-gray-600">WWHS, Burol 1, Main Ave, 8XH8+Q35, Dasmariñas, 4114 Cavite</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <Clock className="text-[var(--color-primary)] mt-1" />
                                    <div>
                                        <h4 className="font-bold">Operating Hours</h4>
                                        <p className="text-gray-600">Mon, Wed, Fri: 10:00 AM - 3:00 PM</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <Mail className="text-[var(--color-primary)] mt-1" />
                                    <div>
                                        <h4 className="font-bold">Contact Number</h4>
                                        <p className="text-gray-600">idk pa</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <Send className="text-[var(--color-primary)] mt-1" />
                                    <div>
                                        <h4 className="font-bold">Social Media</h4>
                                        <a
                                            href="https://www.facebook.com/profile.php?id=61574385560214"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[var(--color-secondary)] underline hover:opacity-80"
                                        >
                                            Visit our Facebook Page
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-[400px] w-full rounded-3xl overflow-hidden shadow-lg border border-gray-100 fade-in-up" style={{ animationDelay: '0.4s' }}>
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                                <SeniorsMap />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}

export default Elderly;