import healthcare_bg from "../../../assets/officesMedia/healthcare_bg.png";
import { useState } from "react";
import { 
    Contact, 
    HeartPulse, 
    UserRound, 
    Baby, 
    Droplet, 
    Pill, 
    Calendar, 
    Users, 
    Stethoscope, 
    Home, 
    Phone, 
    MapPin
} from "lucide-react";

import hoaOfficer1 from "../../../assets/hoaOfficer.jpg";
import hoaOfficer2 from "../../../assets/hoaOfficer2.jpg";
import hoaOfficer3 from "../../../assets/hoaOfficer3.jpg";
import hoaService1 from "../../../assets/hoaService1.jpg";
import hoaService2 from "../../../assets/hoaService2.jpg";
import hoaService3 from "../../../assets/hoaService3.jpg";

// Updated officers data with real names
const officersData = [
    { id: 1, name: "Mary Jane L. Tala", position: "Barangay Health Worker (BHW)", image: hoaOfficer1 },
    { id: 2, name: "Eleonor R. Bueno", position: "Midwife", image: hoaOfficer2 },
    { id: 3, name: "Jean Ferrer Burao", position: "Naturopathy Practitioner", image: hoaOfficer3 },
];

// Service tiles data - updated with real WWHS healthcare info
const servicesData = [
    {
        id: 1,
        type: "interactive",
        icon: <Baby className="text-white w-16 h-16 stroke-[1.5]" />,
        title: "Maternal & Child Care",
        description: "Baby check-ups, immunization, nutrition support, milk supplementation. Anti-pneumonia, anti-influenza, anti-tetanus vaccines."
    },
    {
        id: 2,
        type: "image",
        src: hoaService2,
        alt: "Maternal Care"
    },
    {
        id: 3,
        type: "interactive",
        icon: <Home className="text-white w-16 h-16 stroke-[1.5]" />,
        title: "Elderly Care",
        description: "Home visits for bedridden and elderly residents. Free maintenance medicines for senior citizens."
    },
    {
        id: 4,
        type: "image",
        src: hoaService3,
        alt: "Elderly Care"
    },
    {
        id: 5,
        type: "interactive",
        icon: <Droplet className="text-white w-16 h-16 stroke-[1.5]" />,
        title: "Public Health Programs",
        description: "Dengue prevention (Search & Destroy), Family planning services, TB-DOTS program (6-month treatment with free medication)."
    },
    {
        id: 6,
        type: "image",
        src: hoaService1,
        alt: "Health Programs"
    },
];

// Additional health info for the showcase
const healthHighlights = [
    { icon: <Calendar className="w-6 h-6 text-[var(--color-primary)]" />, label: "Operating Hours", value: "Mon–Fri · 8AM – 5PM" },
    { icon: <MapPin className="w-6 h-6 text-[var(--color-primary)]" />, label: "Location", value: "WWHS Clubhouse" },
    { icon: <Users className="w-6 h-6 text-[var(--color-primary)]" />, label: "Affiliation", value: "CHO2 – Barangay Burol 1" },
    { icon: <Phone className="w-6 h-6 text-[var(--color-primary)]" />, label: "Updates", value: "FB: Not Sure Yet" },
];

const communityPrograms = [
    { title: "Libreng Tuli", desc: "Free circumcision · Summer program" },
    { title: "Nutrition Month", desc: "July · Community events at Burol 1 Covered Court" },
    { title: "Goiter Awareness", desc: "Observed March or September" },
    { title: "Naturopathy", desc: "Every Friday · Jean Ferrer Burao (NP)" },
];

function Healthcare() {
    const [hoveredTile, setHoveredTile] = useState(null);

    return (
        <div className="bg-white min-h-screen w-full flex flex-col">
            
            {/* 👇 Embedded Styles for Entrance Animations 👇 */}
            <style>{`
                @keyframes fadeInUp {
                    0% { opacity: 0; transform: translateY(30px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .fade-in-up {
                    opacity: 0;
                    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>

            <div className="absolute top-0 left-0 w-full h-20 bg-white z-10"></div>
            
            {/* HERO SECTION with clinic branding */}
            <section
                className="w-full h-[500px] md:h-[600px] bg-cover bg-center flex items-center relative overflow-hidden"
                style={{ 
                    backgroundImage: `linear-gradient(rgba(25, 28, 32, 0.75), rgba(88, 88, 88, 0.65)), url(${healthcare_bg})` 
                }}
            >
                {/* Applied fade-in-up here */}
                <div className="ml-12 md:ml-24 max-w-2xl text-left z-10 fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <span className="text-[var(--color-accent)] text-lg md:text-xl font-semibold tracking-wider block mb-1">
                        WWHS · Satellite Health Center
                    </span>
                    <h1 className="text-white text-4xl md:text-6xl font-bold leading-tight">
                        Healthcare <br /> 
                        <span className="whitespace-nowrap text-[var(--color-accent)]">Committee Office</span>
                    </h1>
                    <p className="text-gray-200 text-sm md:text-base mt-4 max-w-xl leading-relaxed">
                        Established 2015 · Serving the Windward Hills community with compassionate, 
                        accessible primary care and public health programs.
                    </p>
                </div>
            </section>

            {/* OFFICE INFO*/}
            <section className="bg-white w-full py-8 px-6 md:px-24 flex justify-center -mt-8 relative z-20">
                <div className="max-w-6xl w-full grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-2xl p-6 md:p-8 border border-gray-100 fade-in-up shadow-sm" style={{ animationDelay: '0.3s' }}>
                    {healthHighlights.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 hover:-translate-y-1 transition-all duration-300">
                            <div className="bg-[var(--color-primary)]/10 p-2.5 rounded-full">
                                {item.icon}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{item.label}</p>
                                <p className="text-sm md:text-base font-semibold text-[var(--color-primary)] leading-tight">{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* OFFICERS SECTION */}
            <section className="bg-[var(--color-primary)] w-full py-16 px-4 md:px-12 flex flex-col items-center">
                <h2 className="text-white text-5xl md:text-6xl font-bold tracking-tight mb-4 text-center fade-in-up" style={{ animationDelay: '0.2s' }}>
                    Our Healthcare Team
                </h2>
                <p className="text-gray-300 text-center max-w-2xl mb-12 text-lg fade-in-up" style={{ animationDelay: '0.3s' }}>
                    Dedicated professionals committed to the health and well-being of every resident.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl w-full px-4">
                    {officersData.map((officer, idx) => (
                        <div 
                            key={officer.id} 
                            className="flex flex-col items-center fade-in-up group" 
                            style={{ animationDelay: `${0.4 + idx * 0.15}s` }}
                        >
                            
                            {/* Card Image Container with rounded corners and shadow */}
                            <div className="w-full aspect-square rounded-3xl overflow-hidden shadow-lg bg-zinc-800 transition-transform duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl">
                                <img 
                                    src={officer.image} 
                                    alt={officer.name} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>

                            {/* Info Text */}
                            <div className="mt-4 text-center transition-transform duration-500 group-hover:-translate-y-1">
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

            {/* SERVICES WE OFFER */}
            <section className="bg-white w-full py-16 px-6 md:px-24 flex justify-center rounded-t-[40px] shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.04)] relative z-20 -mt-8">
                <div className="max-w-6xl w-full">
                    <div className="flex items-center gap-4 mb-10 fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <div className="w-[8px] h-[36px] bg-[var(--color-primary)] rounded-full"></div>
                        <h2 className="text-[var(--color-secondary)] text-3xl md:text-4xl font-bold tracking-wide">
                            Services We Offer
                        </h2>
                    </div>
                    <p className="text-gray-600 text-base md:text-lg mb-10 max-w-3xl fade-in-up" style={{ animationDelay: '0.3s' }}>
                        Comprehensive healthcare services — from maternal and child care to elder support and public health initiatives.
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start fade-in-up" style={{ animationDelay: '0.4s' }}>
                        <div className="lg:col-span-3 grid grid-cols-3 gap-4">
                            {servicesData.map((tile) => {
                                if (tile.type === "image") {
                                    return (
                                        <div key={tile.id} className="aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                                            <img 
                                                src={tile.src} 
                                                alt={tile.alt} 
                                                className="w-full h-full object-cover hover:scale-105 transition duration-500"
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
                                        className={`aspect-square rounded-2xl flex flex-col p-5 transition-all duration-300 select-none ${
                                            isHovered 
                                                ? "bg-white justify-start items-start text-left" 
                                                : "bg-[var(--color-secondary)] justify-center items-center text-center cursor-pointer hover:shadow-lg hover:-translate-y-1"
                                        }`}
                                    >
                                        {isHovered ? (
                                            <div className="animate-fadeIn h-full flex flex-col justify-center">
                                                <h3 className="text-[var(--color-primary)] text-base md:text-lg font-bold tracking-wide mb-2">
                                                    {tile.title}
                                                </h3>
                                                <p className="text-gray-700 text-[11px] sm:text-xs md:text-sm font-medium leading-relaxed overflow-y-auto max-h-[85%]">
                                                    {tile.description}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="transition-transform duration-200 transform scale-100 hover:scale-105">
                                                {tile.icon}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Right side info column */}
                        <div className="lg:col-span-1 pt-2 space-y-6">
                            <div className="bg-[var(--color-primary)]/5 p-6 rounded-2xl border border-[var(--color-primary)]/10 hover:shadow-md transition-shadow duration-300">
                                <p className="text-[var(--color-primary)] text-lg md:text-xl font-semibold leading-relaxed">
                                    Serving Windward Hills since 2015
                                </p>
                                <p className="text-gray-600 text-sm mt-2">
                                    Satellite clinic under CHO2 – Barangay Burol 1 (Phase 3 Main Center)
                                </p>
                                <div className="mt-4 flex items-center gap-2 flex-wrap">
                                    <span className="px-3 py-1 bg-[var(--color-accent)]/20 text-[var(--color-primary)] text-xs font-bold rounded-full">Mon–Fri 8AM–5PM</span>
                                    <span className="px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-bold rounded-full">HOA Clubhouse</span>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Community Programs</p>
                                <ul className="mt-2 space-y-2">
                                    {communityPrograms.map((prog, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm">
                                            <span className="text-[var(--color-accent)] text-lg leading-4">•</span>
                                            <span><span className="font-semibold text-[var(--color-primary)]">{prog.title}</span> <span className="text-gray-500 text-xs">{prog.desc}</span></span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <a 
                                href="https://www.facebook.com/AnongPageNGHEALTHCARENATIN" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 bg-[var(--color-primary)] text-white p-4 rounded-xl hover:opacity-90 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-1"
                            >
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="24" 
                                    height="24" 
                                    viewBox="0 0 24 24" 
                                    fill="currentColor" 
                                    className="w-6 h-6 flex-shrink-0"
                                >
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                                <div>
                                    <p className="font-semibold text-sm">Follow Us</p>
                                    <p className="text-xs opacity-80">Keep updated with our latest events and announcements</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ADDITIONAL INFO: Naturopathy & Programs showcase */}
            <section className="bg-gray-50 w-full py-12 px-6 md:px-24 flex justify-center border-t border-gray-200">
                <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Added slight delay and hover lifts to bottom cards */}
                    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-[var(--color-primary)]/10 rounded-full">
                                <Stethoscope className="w-6 h-6 text-[var(--color-primary)]" />
                            </div>
                            <h3 className="text-xl font-bold text-[var(--color-primary)]">Naturopathy</h3>
                        </div>
                        <p className="text-gray-600 text-sm">Every Friday · Jean Ferrer Burao (NP) provides alternative community-based wellness support.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 fade-in-up" style={{ animationDelay: '0.4s' }}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-[var(--color-accent)]/20 rounded-full">
                                <Pill className="w-6 h-6 text-[var(--color-primary)]" />
                            </div>
                            <h3 className="text-xl font-bold text-[var(--color-primary)]">TB-DOTS Program</h3>
                        </div>
                        <p className="text-gray-600 text-sm">6-month treatment with free medication support. Confidential and accessible.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 fade-in-up" style={{ animationDelay: '0.6s' }}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-[var(--color-primary)]/10 rounded-full">
                                <HeartPulse className="w-6 h-6 text-[var(--color-primary)]" />
                            </div>
                            <h3 className="text-xl font-bold text-[var(--color-primary)]">Dengue Prevention</h3>
                        </div>
                        <p className="text-gray-600 text-sm">Search & Destroy campaigns — community-driven vector control.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Healthcare;