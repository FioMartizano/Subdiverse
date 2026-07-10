import HOA_bg from "../../../assets/officesMedia/HOApage_bg.jpg";
import { useState } from "react";
import { Contact, HeartPulse, UserRound, Clock, MapPin, Phone, Mail,Building2, Users, FileText, AlertTriangle,
    Shield, CalendarDays, Megaphone, Home, FileCheck, MoveRight, HardHat,
    Lightbulb, Droplets, Trash2, Car, Bell, Plus } from "lucide-react";

import hoaOfficer1 from "../../../assets/hoaOfficer.jpg";
import hoaOfficer2 from "../../../assets/hoaOfficer2.jpg";
import hoaOfficer3 from "../../../assets/hoaOfficer3.jpg";
import hoaOfficer4 from "../../../assets/hoaOfficer4.jpg";
import hoaService1 from "../../../assets/hoaService1.jpg";
import hoaService2 from "../../../assets/hoaService2.jpg";
import hoaService3 from "../../../assets/hoaService3.jpg";

import Post from "../../../components/posts/Post";
import CreatePost from "../../../components/posts/CreatePost";
import CommentModal from "../../../components/posts/CommentModal";
import { hoaAnnouncements } from "../../../data/mockPosts";

// Mock data array for the officers grid - Updated with real positions
const officersData = [
    { id: 1, name: "Juan Dela Cruz", position: "President", image: hoaOfficer1 },
    { id: 2, name: "Maria Santos", position: "Vice President", image: hoaOfficer2 },
    { id: 3, name: "Jose Reyes", position: "Secretary", image: hoaOfficer3 },
    { id: 4, name: "Ana Gonzales", position: "Treasurer", image: hoaOfficer4 },
];

// Board of Directors (15 Members)
const boardMembers = [
    { id: 1, name: "Pedro Martinez", committee: "Infrastructure" },
    { id: 2, name: "Luz Fernandez", committee: "Security" },
    { id: 3, name: "Ramon Cruz", committee: "Finance" },
    { id: 4, name: "Elena Santos", committee: "Health & Wellness" },
    { id: 5, name: "Carlos Reyes", committee: "Youth & Sports" },
    { id: 6, name: "Martha Lopez", committee: "Education" },
    { id: 7, name: "George Tan", committee: "Ways & Means" },
    { id: 8, name: "Rosa Mendoza", committee: "Audit" },
    { id: 9, name: "Ricardo Garcia", committee: "Rules & Regulations" },
    { id: 10, name: "Teresa Cruz", committee: "Community Relations" },
    { id: 11, name: "Antonio Villanueva", committee: "Environmental" },
    { id: 12, name: "Carmen Flores", committee: "Events" },
    { id: 13, name: "Rafael Castro", committee: "Utilities" },
    { id: 14, name: "Lourdes Nacpil", committee: "Welfare" },
    { id: 15, name: "Felipe Reyes", committee: "Legal Affairs" },
];

function HOA() {
    const [hoveredTile, setHoveredTile] = useState(null);
    const [activeTab, setActiveTab] = useState("announcements");
    const [announcements, setAnnouncements] = useState(hoaAnnouncements);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [showComments, setShowComments] = useState(false);

    // Handler functions for post interactions
      // Handler functions for post interactions
    const handleLike = (postId, isLiked) => {
        setAnnouncements(prev => 
            prev.map(post => 
                post.id === postId 
                    ? {
                        ...post,
                        engagement: {
                            ...post.engagement,
                            likes: isLiked 
                                ? post.engagement.likes + 1 
                                : post.engagement.likes - 1,
                            isLiked
                        }
                    }
                    : post
            )
        );
    };

    const handleComment = (postId) => {
        // Find the post and open comment modal
        const post = announcements.find(p => p.id === postId);
        if (post) {
            setSelectedPost(post);
            setShowComments(true);
        }
    };


    const handlePostCreated = (newPost) => {
        // Add the new post to the top of the feed
        setAnnouncements(prev => [newPost, ...prev]);
    };

    const handleAddComment = (postId, newComment) => {
        setAnnouncements(prev => 
            prev.map(post => 
                post.id === postId
                    ? {
                        ...post,
                        engagement: {
                            ...post.engagement,
                            comments: post.engagement.comments + 1
                        }
                    }
                    : post
            )
        );
    };

    // Dynamic dataset containing icons, text data, and images
    const tilesData = [
        {
            id: 1,
            type: "interactive",
            icon: <Contact className="text-white w-16 h-16 stroke-[1.5]" />,
            title: "ID Assistance",
            description: "Apply for homeowner, tenant, or dependent IDs. Requirements and processing details available at the office."
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
            icon: <FileCheck className="text-white w-16 h-16 stroke-[1.5]" />,
            title: "Permits & Clearances",
            description: "Construction permits, moving permits, event permits, and move-in/out clearances processing."
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
            icon: <HardHat className="text-white w-16 h-16 stroke-[1.5]" />,
            title: "Construction & Building",
            description: "Construction guidelines, building permits, renovation approvals, and contractor accreditation."
        },
        {
            id: 6,
            type: "image",
            src: hoaService1,
            alt: "Community Services"
        },
        {
            id: 7,
            type: "interactive",
            icon: <MoveRight className="text-white w-16 h-16 stroke-[1.5]" />,
            title: "Move-in/Move-out",
            description: "Proper procedures for moving in or out of the subdivision. Gate passes and clearance processing."
        },
        {
            id: 8,
            type: "interactive",
            icon: <AlertTriangle className="text-white w-16 h-16 stroke-[1.5]" />,
            title: "Report Concerns",
            description: "Report infrastructure issues: street lights, road conditions, drainage, garbage collection, and more."
        }
    ];

    // Services offered list
    const servicesList = [
        { icon: <Contact size={24} />, title: "ID Applications", desc: "Homeowner, tenant, dependent IDs" },
        { icon: <FileText size={24} />, title: "Permits", desc: "Construction, event, moving permits" },
        { icon: <MoveRight size={24} />, title: "Move-in/Out", desc: "Clearance and gate passes" },
        { icon: <Car size={24} />, title: "Vehicle Sticker", desc: "Vehicle registration and stickers" },
        { icon: <Home size={24} />, title: "Business Permit", desc: "Home-based business permits" },
        { icon: <AlertTriangle size={24} />, title: "Report Concerns", desc: "Infrastructure and utilities issues" }
    ];

    // Concerns categories
    const concernCategories = [
        { icon: <Lightbulb />, title: "Street Lights", description: "Broken or malfunctioning street lights" },
        { icon: <Building2 />, title: "Road Conditions", description: "Potholes, uneven roads, road damage" },
        { icon: <Droplets />, title: "Drainage System", description: "Clogged drains, flooding issues" },
        { icon: <Trash2 />, title: "Garbage Collection", description: "Missed pickups, improper disposal" },
        { icon: <Shield />, title: "Security Concerns", description: "Gate security, CCTV, safety issues" },
        { icon: <AlertTriangle />, title: "Utilities", description: "Water, power, internet disruptions" }
    ];

    return (
        <div className="bg-white min-h-screen w-full flex flex-col">

            <div className="absolute top-0 left-0 w-full h-20 bg-white z-10"></div>
            
            {/* HERO SECTION */}
            <section
                className="w-full h-[500px] md:h-[600px] bg-cover bg-center flex items-center relative overflow-hidden"
                style={{ 
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${HOA_bg})` 
                }}
            >
                <div className="ml-12 md:ml-24 max-w-3xl text-left z-10">
                    <span className="text-[var(--color-secondary)] text-lg md:text-xl font-medium tracking-wide block mb-1">
                        Welcome to the
                    </span>
                    
                    <h1 className="text-white text-4xl md:text-6xl font-bold leading-tight">
                        Homeowners Association <br /> <span className="whitespace-nowrap text-[var(--color-secondary)]">Main Office</span>
                    </h1>

                    <p className="text-gray-200 text-sm md:text-base mt-4 max-w-xl leading-relaxed">
                        Building a better community together. Your hub for HOA services, announcements, and community concerns.
                    </p>
                </div>
            </section>

            {/* OFFICE INFORMATION BANNER */}
            <section className="bg-white border-b border-gray-100 py-6 px-4 md:px-12">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="flex items-center gap-3">
                        <Clock className="text-[var(--color-secondary)] w-6 h-6" />
                        <div>
                            <p className="text-xs text-gray-500 font-medium">OFFICE HOURS</p>
                            <p className="text-sm font-semibold">Mon-Fri • 8:00 AM - 5:00 PM</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <MapPin className="text-[var(--color-secondary)] w-6 h-6" />
                        <div>
                            <p className="text-xs text-gray-500 font-medium">LOCATION</p>
                            <p className="text-sm font-semibold">Clubhouse Building, Ground Floor</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Phone className="text-[var(--color-secondary)] w-6 h-6" />
                        <div>
                            <p className="text-xs text-gray-500 font-medium">CONTACT</p>
                            <p className="text-sm font-semibold">(02) 8XXX-XXXX</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Mail className="text-[var(--color-secondary)] w-6 h-6" />
                        <div>
                            <p className="text-xs text-gray-500 font-medium">EMAIL</p>
                            <p className="text-sm font-semibold">hoa@subdivision.com</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ANNOUNCEMENTS SECTION */}
            <section className="bg-gray-50 w-full py-16 px-4 md:px-12">
                <div className="max-w-3xl mx-auto">
                    {/* Header with New Post Button */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <Megaphone className="text-[var(--color-secondary)] w-8 h-8" />
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-primary)]">Announcements</h2>
                                <p className="text-gray-500 text-sm">Stay updated with the latest HOA news</p>
                            </div>
                        </div>
                        
                        <button
                            onClick={() => setShowCreatePost(true)}
                            className="px-4 py-2 bg-[var(--color-secondary)] text-white rounded-lg hover:bg-[var(--color-primary)] transition flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow-md"
                        >
                            <Plus className="w-4 h-4" />
                            New Post
                        </button>
                    </div>

                    {/* Posts Feed - Vertical layout */}
                    <div className="space-y-6">
                        {announcements.map((post) => (
                            <Post 
                                key={post.id}
                                post={post}
                                onLike={handleLike}
                                onComment={handleComment}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* CREATE POST MODAL - THIS WAS MISSING! */}
            <CreatePost
                isOpen={showCreatePost}
                onClose={() => setShowCreatePost(false)}
                onPostCreated={handlePostCreated}
                officeName="HOA Main Office"
            />

               {/* COMMENT MODAL*/}
            {selectedPost && (
                <CommentModal
                    isOpen={showComments}
                    onClose={() => {
                        setShowComments(false);
                        setSelectedPost(null);
                    }}
                    post={selectedPost}
                    onAddComment={handleAddComment}
                />
            )}

            {/* OFFICERS SECTION */}
            <section className="bg-[var(--color-secondary)] w-full py-16 px-4 md:px-12 flex flex-col items-center">
                <h2 className="text-white text-5xl md:text-6xl font-bold tracking-tight mb-4 text-center">
                    Officers & Board
                </h2>
                <p className="text-white/80 text-center max-w-2xl mb-12">
                    Your elected leaders dedicated to serving the community
                </p>

                {/* Executive Committee */}
                <div className="w-full max-w-7xl mb-12">
                    <h3 className="text-white text-2xl font-semibold mb-6 text-center">Executive Committee</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {officersData.map((officer) => (
                            <div key={officer.id} className="flex flex-col items-center">
                                <div className="w-full aspect-square rounded-3xl overflow-hidden shadow-lg bg-zinc-800">
                                    <img 
                                        src={officer.image} 
                                        alt={officer.name} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="mt-4 text-center">
                                    <h3 className="text-white text-xl font-bold leading-tight">
                                        {officer.name}
                                    </h3>
                                    <p className="text-white/90 text-base font-light mt-0.5">
                                        {officer.position}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Board of Directors */}
                <div className="w-full max-w-7xl">
                    <h3 className="text-white text-2xl font-semibold mb-6 text-center">Board of Directors</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {boardMembers.map((member) => (
                            <div key={member.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-colors">
                                <div className="w-12 h-12 rounded-full bg-white/20 mx-auto mb-2 flex items-center justify-center">
                                    <Users className="text-white w-6 h-6" />
                                </div>
                                <p className="text-white font-semibold text-sm">{member.name}</p>
                                <p className="text-white/70 text-xs">{member.committee}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SERVICES WE OFFER SECTION */}
            <section className="bg-white w-full py-16 px-6 md:px-24 flex justify-center rounded-t-[40px] shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.05)] relative z-20 -mt-8">
                <div className="max-w-7xl w-full">
                    
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-[8px] h-[36px] bg-[var(--color-primary)] rounded-full"></div>
                        <div>
                            <h2 className="text-[var(--color-secondary)] text-3xl md:text-4xl font-bold tracking-wide">
                                Services We Offer
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">Complete assistance for all your HOA needs</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                        
                        {/* Services Grid */}
                        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {tilesData.map((tile) => {
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
                                        className={`aspect-square rounded-2xl flex flex-col p-5 transition-all duration-300 select-none ${
                                            isHovered 
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

                        {/* Right Side Description */}
                        <div className="lg:col-span-1 pt-2">
                            <p className="text-[var(--color-primary)] text-lg md:text-xl font-medium leading-relaxed">
                                Services are available at the HOA office during business hours. Walk-ins are welcome, or schedule an appointment for priority assistance.
                            </p>
                            <div className="mt-6 space-y-3">
                                {servicesList.map((service, index) => (
                                    <div key={index} className="flex items-center gap-3 text-sm text-gray-600">
                                        <span className="text-[var(--color-secondary)]">{service.icon}</span>
                                        <div>
                                            <p className="font-semibold">{service.title}</p>
                                            <p className="text-xs text-gray-400">{service.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* REPORT CONCERNS SECTION */}
            <section className="bg-gray-50 w-full py-16 px-4 md:px-12">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <AlertTriangle className="text-[var(--color-secondary)] w-8 h-8" />
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-primary)]">Report a Concern</h2>
                            <p className="text-gray-500 text-sm">Help us maintain our community infrastructure</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {concernCategories.map((concern, index) => (
                            <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                                <div className="text-[var(--color-secondary)] mb-3">
                                    {concern.icon}
                                </div>
                                <h3 className="font-bold text-[var(--color-primary)] mb-1">{concern.title}</h3>
                                <p className="text-sm text-gray-500">{concern.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 text-center">
                        <button className="bg-[var(--color-secondary)] hover:bg-[var(--color-primary)] text-white font-semibold py-3 px-8 rounded-full transition duration-200">
                            Submit a Concern Report
                        </button>
                    </div>
                </div>
            </section>

            {/* QUICK LINKS / RESOURCES */}
            <section className="bg-white w-full py-12 px-4 md:px-12 border-t border-gray-100">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h4 className="font-bold text-[var(--color-primary)] mb-3">Quick Links</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><a href="#" className="hover:text-[var(--color-secondary)]">Pay Dues Online</a></li>
                            <li><a href="#" className="hover:text-[var(--color-secondary)]">Download Forms</a></li>
                            <li><a href="#" className="hover:text-[var(--color-secondary)]">Subdivision Rules</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-[var(--color-primary)] mb-3">Emergency Contacts</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li>Barangay Hall: (02) 8XXX-XXXX</li>
                            <li>Police Station: (02) 8XXX-XXXX</li>
                            <li>Fire Station: (02) 8XXX-XXXX</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-[var(--color-primary)] mb-3">Important Documents</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><a href="#" className="hover:text-[var(--color-secondary)]">HOA By-Laws</a></li>
                            <li><a href="#" className="hover:text-[var(--color-secondary)]">Master Deed</a></li>
                            <li><a href="#" className="hover:text-[var(--color-secondary)]">Dues Structure</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-[var(--color-primary)] mb-3">Office Hours</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li>Monday-Friday: 8AM-5PM</li>
                            <li>Saturday: 9AM-12PM</li>
                            <li>Sunday: Closed</li>
                        </ul>
                    </div>
                </div>
            </section>
            
        </div>
    );
}

export default HOA;