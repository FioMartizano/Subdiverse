import guestHOAbg from "../../../assets/guestHOA_bg.jpg";
import { useState } from "react";
import { Contact, HeartPulse, UserRound } from "lucide-react";
import { Volume2, Scale, House, Dog } from "lucide-react";
import { MapPin, Clock, Mail, Send } from "lucide-react";

import { Link } from "react-router-dom";

import { motion } from "framer-motion";

import hoaOfficer1 from "../../../assets/hoaOfficer.jpg";
import hoaOfficer2 from "../../../assets/hoaOfficer2.jpg";
import hoaOfficer3 from "../../../assets/hoaOfficer3.jpg";
import hoaOfficer4 from "../../../assets/hoaOfficer4.jpg";
import grievance1 from "../../../assets/complaints.jpg";
import grievance2 from "../../../assets/mediation.jpg";
import grievance3 from "../../../assets/resolution.jpg";
import GrievanceMap from "../../../components/Maps/GrievanceMap";






// Mock data array for the officers grid
const officersData = [
    { id: 1, name: "Lorem Ipsum", position: "Position", image: hoaOfficer1 },
    { id: 2, name: "Lorem Ipsum", position: "Position", image: hoaOfficer2 },
    { id: 3, name: "Lorem Ipsum", position: "Position", image: hoaOfficer3 },
    { id: 4, name: "Lorem Ipsum", position: "Position", image: hoaOfficer4 },
];





function Grievance() {


    // Dynamic dataset containing icons, text data, and images
    const tilesData = [
        {
            id: 1,
            type: "interactive",
            icon: <Contact className="text-white w-16 h-16 stroke-[1.5]" />,
            title: "Complaints",
            description: "Receive and document residents' complaints and concerns."
        },
        {
            id: 2,
            type: "image",
            src: grievance1,
            alt: "Complaints"
        },
        {
            id: 3,
            type: "interactive",
            icon: <HeartPulse className="text-white w-16 h-16 stroke-[1.5]" />,
            title: "Mediation Service",
            description: "Facilitate discussions to help parties reach a mutual agreement.."
        },
        {
            id: 4,
            type: "image",
            src: grievance2,
            alt: "Mediation"
        },
        {
            id: 5,
            type: "interactive",
            icon: <UserRound className="text-white w-16 h-16 stroke-[1.5]" />,
            title: "Conflict Resolution",
            description: "Resolve disputes in accordance with HOA policies and community guidelines."
        },
        {
            id: 6,
            type: "image",
            src: grievance3,
            alt: "Resolutions"
        }
    ];

    const [hoveredIndex, setHoveredIndex] = useState(0);
    // The items corresponding to the segments

    // Changed Trash2 to House

    const concerns = [
        { title: "Noise Disturbances", desc: "Excessive sound levels after hours.", rotation: 160, icon: <Volume2 size={24} /> },
        { title: "Community Disputes", desc: "Conflicts among residents, including disturbances, disagreements, or other concerns", rotation: 90, icon: <Scale size={24} /> },
        { title: "Neighbor & Property Concerns", desc: "Concerns involving neighboring properties and shared spaces.", rotation: 290, icon: <House size={24} /> },
        { title: "Pet-Related Concerns", desc: "Unleashed pets, excessive barking and waste compliance.", rotation: 350, icon: <Dog size={24} /> }
    ];

    const [hoveredTile, setHoveredTile] = useState(null);




    return (
        <div className="bg-white min-h-screen w-full flex flex-col">

            {/* HERO */}
            <section
                className="w-full h-[500px] md:h-[600px] bg-cover bg-center flex items-center relative overflow-hidden"
                style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${guestHOAbg})`
                }}
            >

                <div className="ml-12 md:ml-24 max-w-2xl text-left z-10">
                    <span className="text-white text-lg md:text-xl font-medium tracking-wide block mb-1">
                        Welcome to the
                    </span>

                    <h1 className="text-white text-4xl md:text-6xl font-bold leading-tight">
                        WWHS <br /> <span className="whitespace-nowrap">Grievance Committee</span>
                    </h1>

                    <p className="text-gray-200 text-sm md:text-base mt-4 max-w-xl leading-relaxed">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin scelerisque tincidunt elit ornare maximus.
                    </p>

                    <div className="mt-6">
                        <Link to="../../../grievanceComplaint" className="btn-glow active:scale-95 inline-block text-center">
                            <span>Submit a Complaint</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* 2. OFFICERS SECTION */}
            <section className="bg-[var(--color-secondary)] w-full py-16 px-4 md:px-12 flex flex-col items-center">

                {/* Main Heading */}
                <h2 className="text-white text-5xl md:text-6xl font-bold tracking-tight mb-12 text-center">
                    Officers
                </h2>

                {/* Grid Layout Container */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full px-4">
                    {officersData.map((officer) => (
                        <div key={officer.id} className="flex flex-col items-center">

                            {/* Card Image Container with rounded corners and shadow */}
                            <div className="w-full aspect-square rounded-3xl overflow-hidden shadow-lg bg-zinc-800">
                                <img
                                    src={officer.image}
                                    alt={officer.name}
                                    className="w-full h-full object-cover"
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
                        <h2 className="text-[var(--color-secondary)] text-3xl md:text-4xl font-bold tracking-wide">
                            Services We Offer
                        </h2>
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

                                // Render interactive tile with mouse event triggers
                                const isHovered = hoveredTile === tile.id;

                                return (
                                    <div
                                        key={tile.id}
                                        onMouseEnter={() => setHoveredTile(tile.id)}
                                        onMouseLeave={() => setHoveredTile(null)}
                                        className={`aspect-square rounded-2xl flex flex-col p-5 transition-all duration-300 select-none ${isHovered
                                            ? "bg-white border-2 border-transparent justify-start items-start text-left"
                                            : "bg-[var(--color-secondary)] justify-center items-center text-center cursor-pointer"
                                            }`}
                                    >
                                        {isHovered ? (
                                            /* HOVER STATE: Custom text copy layout matching the image */
                                            <div className="animate-fadeIn">
                                                <h3 className="text-[var(--color-secondary)] text-base md:text-lg font-bold tracking-wide mb-1 md:mb-2">
                                                    {tile.title}
                                                </h3>
                                                <p className="text-zinc-600 text-[11px] sm:text-xs md:text-sm font-medium leading-relaxed max-h-[85%] overflow-hidden">
                                                    {tile.description}
                                                </p>
                                            </div>
                                        ) : (
                                            /* DEFAULT STATE: Large minimal icon design */
                                            <div className="transition-transform duration-200 transform scale-100">
                                                {tile.icon}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Right Hand Description Side Column */}
                        <div className="lg:col-span-1 pt-2">
                            <p className="text-[var(--color-primary)] text-lg md:text-xl font-medium leading-relaxed">
                                For personal complaints, disputes, or blotter-related cases, residents are encouraged to visit the Grievance Office in person. This ensures proper documentation, verification, and timely assistance while maintaining confidentiality throughout the complaint process.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* Types of Complaints */}
            <section className="bg-[var(--color-primary)] w-full py-24 px-6 md:px-24 flex justify-center rounded-t-[40px] relative z-20 -mt-8 shadow-2xl">
                <div className="max-w-6xl w-full">
                    <div className="flex items-center gap-4 mb-16">
                        <div className="w-[8px] h-[36px] bg-[#FACC15] rounded-full"></div>
                        <h2 className="text-white text-3xl md:text-5xl font-bold tracking-wide">
                            Types of Concerns We Handle
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-stretch">
                        {/* Left Column */}
                        <div className="space-y-6 flex flex-col">
                            {concerns.slice(0, 2).map((item, idx) => (
                                <div key={idx} onMouseEnter={() => setHoveredIndex(idx)}
                                    className="relative flex items-start gap-4 p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl cursor-pointer hover:bg-white/20 hover:border-white/40 transition-all duration-300 flex-1 group overflow-hidden">
                                    {/* Glow effect pointing to center */}
                                    <div className="hidden md:block absolute -right-4 top-0 bottom-0 w-8 bg-white blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"></div>

                                    <div className="text-white mt-1 shrink-0 transition-colors">{item.icon}</div>
                                    <div className="flex flex-col">
                                        <h3 className="font-bold text-lg text-white transition-colors">{item.title}</h3>
                                        <p className="text-sm text-white/70 mt-1 flex-grow transition-colors">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Center Indicator - Hidden on mobile */}
                        <div className="hidden md:flex justify-center items-center relative">
                            <svg className="w-64 h-64 overflow-visible">
                                <defs>
                                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="6" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                </defs>

                                {/* Base Ring */}
                                <circle cx="128" cy="128" r="110" stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="transparent" />

                                {/* Glowing Indicator */}
                                <motion.circle
                                    cx="128" cy="128" r="110"
                                    stroke="#FFFFFF"
                                    strokeWidth="12"
                                    fill="transparent"
                                    strokeDasharray="690"
                                    strokeDashoffset="520"
                                    strokeLinecap="round"
                                    filter="url(#glow)"
                                    className="drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]"
                                    animate={{ rotate: concerns[hoveredIndex].rotation }}
                                    transition={{ type: "spring", stiffness: 60, damping: 20 }}
                                />
                            </svg>

                            {/* The Icon inside */}
                            <div className="absolute text-white text-4xl drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-pulse">
                                {concerns[hoveredIndex].icon}
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6 flex flex-col">
                            {concerns.slice(2, 4).map((item, idx) => (
                                <div key={idx + 2} onMouseEnter={() => setHoveredIndex(idx + 2)}
                                    className="relative flex items-start gap-4 p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl cursor-pointer hover:bg-white/20 hover:border-white/40 transition-all duration-300 flex-1 group overflow-hidden">
                                    {/* Glow effect pointing to center */}
                                    <div className="hidden md:block absolute -left-4 top-0 bottom-0 w-8 bg-white blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"></div>

                                    <div className="text-white mt-1 shrink-0 transition-colors">{item.icon}</div>
                                    <div className="flex flex-col">
                                        <h3 className="font-bold text-lg text-white transition-colors">{item.title}</h3>
                                        <p className="text-sm text-white/70 mt-1 flex-grow transition-colors">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-gray-50 w-full py-24 px-6 md:px-24">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

                        {/* Contact Details Column */}
                        <div className="space-y-8">
                            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-secondary)]">
                                Visit Our Office
                            </h2>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <MapPin className="text-[var(--color-primary)] mt-1" />
                                    <div>
                                        <h4 className="font-bold">Address</h4>
                                        <p className="text-gray-600">WWHS, Burol 1, Lot 12 Ph E, 56 Main Ave, Dasmariñas, 4114 Cavite</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <Clock className="text-[var(--color-primary)] mt-1" />
                                    <div>
                                        <h4 className="font-bold">Operating Hours</h4>
                                        <p className="text-gray-600">Thur, Fri, Sat: 8:00 AM - 5:00 PM</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <Mail className="text-[var(--color-primary)] mt-1" />
                                    <div>
                                        <h4 className="font-bold">Email</h4>
                                        <p className="text-gray-600">contact@office.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <Send className="text-[var(--color-primary)] mt-1" />
                                    <div>
                                        <h4 className="font-bold">Social Media</h4>
                                        <a href="#" className="text-[var(--color-secondary)] underline hover:opacity-80">
                                            Visit our Facebook Page
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Map Column */}
                        <div className="h-[400px] w-full rounded-3xl overflow-hidden shadow-lg border border-gray-100">

                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                                <GrievanceMap />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>



    );
}


export default Grievance;
