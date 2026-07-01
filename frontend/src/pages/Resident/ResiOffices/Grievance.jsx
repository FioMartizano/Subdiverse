import guestHOAbg from "../../../assets/guestHOA_bg.jpg";
import { useState } from "react";
import { Contact, HeartPulse, UserRound } from "lucide-react";

import hoaOfficer1 from "../../../assets/hoaOfficer.jpg";
import hoaOfficer2 from "../../../assets/hoaOfficer2.jpg";
import hoaOfficer3 from "../../../assets/hoaOfficer3.jpg";
import hoaOfficer4 from "../../../assets/hoaOfficer4.jpg";
import hoaService1 from "../../../assets/hoaService1.jpg";
import hoaService2 from "../../../assets/hoaService2.jpg";
import hoaService3 from "../../../assets/hoaService3.jpg";



// Mock data array for the officers grid
const officersData = [
    { id: 1, name: "Lorem Ipsum", position: "Position", image: hoaOfficer1 },
    { id: 2, name: "Lorem Ipsum", position: "Position", image: hoaOfficer2 },
    { id: 3, name: "Lorem Ipsum", position: "Position", image: hoaOfficer3 },
    { id: 4, name: "Lorem Ipsum", position: "Position", image: hoaOfficer4 },
];


function Grievance() {
   
    const [hoveredTile, setHoveredTile] = useState(null);

    // Dynamic dataset containing icons, text data, and images
    const tilesData = [
        {
            id: 1,
            type: "interactive",
            icon: <Contact className="text-white w-16 h-16 stroke-[1.5]" />,
            title: "ID Assistance",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt"
        },
        {
            id: 2,
            type: "image",
            src: hoaService2,
            alt: "Community Activity"
        },
        {
            id: 3,
            type: "interactive",
            icon: <HeartPulse className="text-white w-16 h-16 stroke-[1.5]" />,
            title: "Health Programs",
            description: "Scheduled medical checks, active wellness monitoring, and healthcare resource coordination."
        },
        {
            id: 4,
            type: "image",
            src: hoaService3,
            alt: "Services Documentation"
        },
        {
            id: 5,
            type: "interactive",
            icon: <UserRound className="text-white w-16 h-16 stroke-[1.5]" />,
            title: "Senior Care",
            description: "Dedicated assistance networks and community initiatives specialized for elder residents."
        },
        {
            id: 6,
            type: "image",
            src: hoaService1,
            alt: "Medical Care Programs"
        }
    ];
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
                        <button className="bg-[var(--color-secondary)] hover:bg-[var(--color-primary)] text-white font-semibold py-3 px-8 rounded-full shadow-md transition duration-200 text-sm md:text-base">
                            Stay Updated
                        </button>
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
                                    className={`aspect-square rounded-2xl flex flex-col p-5 transition-all duration-300 select-none ${
                                        isHovered 
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
                            Services are available through scheduled visits, health programs, and community initiatives.
                        </p>
                    </div>

                </div>
            </div>
        </section>
            
        <p><a href="https://www.magnific.com/free-photo/close-up-beautiful-smiley-woman_18168017.htm">Image by freepik</a></p>
            
        </div>
    );
}

export default Grievance;
