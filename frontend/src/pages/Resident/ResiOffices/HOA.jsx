// frontend/src/pages/Resident/ResiOffices/HOA.jsx
import HOA_bg from "../../../assets/officesMedia/HOApage_bg.jpg";
import { useState } from "react";
import { 
    Contact, Clock, MapPin, Phone, Mail, Building2, Users, FileText, 
    AlertTriangle, Shield, Megaphone, Home, FileCheck, MoveRight, 
    HardHat, Lightbulb, Droplets, Trash2, Car, Plus 
} from "lucide-react";

import hoaOfficer1 from "../../../assets/hoaOfficer.jpg";
import hoaOfficer2 from "../../../assets/hoaOfficer2.jpg";
import hoaOfficer3 from "../../../assets/hoaOfficer3.jpg";
import hoaOfficer4 from "../../../assets/hoaOfficer4.jpg";
import hoaService1 from "../../../assets/hoaService1.jpg";
import hoaService2 from "../../../assets/hoaService2.jpg";
import hoaService3 from "../../../assets/hoaService3.jpg";

// Components
import Post from "../../../components/posts/Post";
import CreatePost from "../../../components/posts/CreatePost";

// Hooks
import { useAuth } from "../../../hooks/useAuth";
import { usePosts } from "../../../hooks/usePosts";

// Data - Officers and Board (static)
const officersData = [
    { id: 1, name: "Juan Dela Cruz", position: "President", image: hoaOfficer1 },
    { id: 2, name: "Maria Santos", position: "Vice President", image: hoaOfficer2 },
    { id: 3, name: "Jose Reyes", position: "Secretary", image: hoaOfficer3 },
    { id: 4, name: "Ana Gonzales", position: "Treasurer", image: hoaOfficer4 },
];

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

// Health highlights equivalent - HOA info
const hoaHighlights = [
    { icon: <Clock className="w-6 h-6 text-[var(--color-primary)]" />, label: "Office Hours", value: "Mon–Fri · 8AM – 5PM" },
    { icon: <MapPin className="w-6 h-6 text-[var(--color-primary)]" />, label: "Location", value: "Clubhouse Building, Ground Floor" },
    { icon: <Users className="w-6 h-6 text-[var(--color-primary)]" />, label: "Association", value: "Windward Hills HOA" },
    { icon: <Phone className="w-6 h-6 text-[var(--color-primary)]" />, label: "Contact", value: "(02) 8XXX-XXXX" },
];

// Community programs equivalent
const hoaPrograms = [
    { title: "Monthly Meeting", desc: "Every 2nd Saturday · Clubhouse" },
    { title: "Clean-Up Drive", desc: "Every 3rd Sunday · Community-wide" },
    { title: "Bayanihan Events", desc: "Quarterly · Community outreach" },
    { title: "Scholarship Program", desc: "Annual · Application open June" },
];

function HOA() {
    const [hoveredTile, setHoveredTile] = useState(null);
    const [showCreatePost, setShowCreatePost] = useState(false);
    
    // Auth and Posts hooks
    const { user, isAdmin, loading: authLoading } = useAuth();
    const { 
        posts, 
        loading: postsLoading, 
        error,
        hasMore,
        isLoadingMore,
        loadMore,
        setPosts 
    } = usePosts();

    // Handler for like updates
    const handleLikeUpdate = (postId, isLiked) => {
        setPosts(prev => 
            prev.map(post => 
                post.id === postId 
                    ? {
                        ...post,
                        engagement: {
                            ...post.engagement,
                            likes: isLiked 
                                ? (post.engagement?.likes || 0) + 1 
                                : (post.engagement?.likes || 0) - 1
                        },
                        isLiked: isLiked
                    }
                    : post
            )
        );
    };

    // Handler for new post created
    const handlePostCreated = (newPost) => {
        setPosts(prev => [newPost, ...prev]);
    };

    // Handler for post deletion
    const handlePostDelete = (postId) => {
        setPosts(prev => prev.filter(post => post.id !== postId));
    };

    // Services data - updated to match Healthcare's service tile structure
    const servicesData = [
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

    // Services list for right sidebar
    const servicesList = [
        { icon: <Contact size={24} />, title: "ID Applications", desc: "Homeowner, tenant, dependent IDs" },
        { icon: <FileText size={24} />, title: "Permits", desc: "Construction, event, moving permits" },
        { icon: <MoveRight size={24} />, title: "Move-in/Out", desc: "Clearance and gate passes" },
        { icon: <Car size={24} />, title: "Vehicle Sticker", desc: "Vehicle registration and stickers" },
        { icon: <Home size={24} />, title: "Business Permit", desc: "Home-based business permits" },
        { icon: <AlertTriangle size={24} />, title: "Report Concerns", desc: "Infrastructure and utilities issues" }
    ];

    // Concern categories for the bottom section
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
            
            {/* HERO SECTION - Matching Healthcare's hero style */}
            <section
                className="w-full h-[500px] md:h-[600px] bg-cover bg-center flex items-center relative overflow-hidden"
                style={{ 
                    backgroundImage: `linear-gradient(rgba(25, 28, 32, 0.75), rgba(88, 88, 88, 0.65)), url(${HOA_bg})` 
                }}
            >
                {/* Applied fade-in-up here */}
                <div className="ml-12 md:ml-24 max-w-2xl text-left z-10 fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <p className="text-[var(--color-accent)] text-lg md:text-xl font-semibold tracking-wider block mb-1">
                        <span className="text-secondary">WWHS</span> · Homeowners Association
                    </p>
                    
                    <h1 className="text-white text-4xl md:text-6xl font-bold leading-tight">
                        HOA <br /> 
                        <span className="whitespace-nowrap text-[var(--color-accent)]">Main Office</span>
                    </h1>
                    <p className="text-gray-200 text-sm md:text-base mt-4 max-w-xl leading-relaxed">
                        Building a better community together. Your hub for HOA services, announcements, and community concerns.
                    </p>
                </div>
            </section>

            {/* OFFICE INFO - Matching Healthcare's info cards */}
            <section className="bg-white w-full py-8 px-6 md:px-24 flex justify-center -mt-8 relative z-20">
                <div className="max-w-6xl w-full grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-2xl p-6 md:p-8 border border-gray-100 fade-in-up shadow-sm" style={{ animationDelay: '0.3s' }}>
                    {hoaHighlights.map((item, idx) => (
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


            {/* SERVICES WE OFFER - Matching Healthcare's services section */}
            <section className="bg-white w-full py-16 px-6 md:px-24 flex justify-center rounded-t-[40px] shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.04)] relative z-20 -mt-8">
                <div className="max-w-6xl w-full">
                    <div className="flex items-center gap-4 mb-10 fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <div className="w-[8px] h-[36px] bg-[var(--color-primary)] rounded-full"></div>
                        <h2 className="text-[var(--color-secondary)] text-3xl md:text-4xl font-bold tracking-wide">
                            Services We Offer
                        </h2>
                    </div>
                    <p className="text-gray-600 text-base md:text-lg mb-10 max-w-3xl fade-in-up" style={{ animationDelay: '0.3s' }}>
                        Complete assistance for all your HOA needs — from ID applications and permits to construction guidelines and community concerns.
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

                        {/* Right side info column - Matching Healthcare's sidebar */}
                        <div className="lg:col-span-1 pt-2 space-y-6">
                            <div className="bg-[var(--color-primary)]/5 p-6 rounded-2xl border border-[var(--color-primary)]/10 hover:shadow-md transition-shadow duration-300">
                                <p className="text-[var(--color-primary)] text-lg md:text-xl font-semibold leading-relaxed">
                                    Serving Windward Hills residents
                                </p>
                                <p className="text-gray-600 text-sm mt-2">
                                    HOA office located at the Clubhouse Building, Ground Floor
                                </p>
                                <div className="mt-4 flex items-center gap-2 flex-wrap">
                                    <span className="px-3 py-1 bg-[var(--color-accent)]/20 text-[var(--color-primary)] text-xs font-bold rounded-full">Mon–Fri 8AM–5PM</span>
                                    <span className="px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-bold rounded-full">Clubhouse</span>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Community Programs</p>
                                <ul className="mt-2 space-y-2">
                                    {hoaPrograms.map((prog, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm">
                                            <span className="text-[var(--color-accent)] text-lg leading-4">•</span>
                                            <span><span className="font-semibold text-[var(--color-primary)]">{prog.title}</span> <span className="text-gray-500 text-xs">{prog.desc}</span></span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <a 
                                href="https://www.facebook.com/AnongPageNGHOANATIN" 
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

            {/* ANNOUNCEMENTS SECTION - Embedded between services and bottom cards */}
            <section className="bg-gray-50 w-full py-16 px-4 md:px-12">
                <div className="max-w-3xl mx-auto">
                    {/* Header with New Post Button */}
                    <div className="flex items-center justify-between mb-8 fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-center gap-4">
                            <Megaphone className="text-[var(--color-secondary)] w-8 h-8" />
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-primary)]">Announcements</h2>
                                <p className="text-gray-500 text-sm">Stay updated with the latest HOA news</p>
                            </div>
                        </div>
                        
                        {/* Only show New Post button if user is admin/officer */}
                        {!authLoading && isAdmin && (
                            <button
                                onClick={() => setShowCreatePost(true)}
                                className="px-4 py-2 bg-[var(--color-secondary)] text-white rounded-lg hover:bg-[var(--color-primary)] transition flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow-md"
                            >
                                <Plus className="w-4 h-4" />
                                New Post
                            </button>
                        )}
                    </div>

                    {/* Loading State */}
                    {postsLoading && (
                        <div className="text-center py-8">
                            <div className="inline-block w-8 h-8 border-4 border-[var(--color-secondary)] border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-500 text-sm mt-2">Loading announcements...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="text-center py-8">
                            <p className="text-red-500 text-sm">Error loading posts: {error}</p>
                            <button 
                                onClick={() => window.location.reload()}
                                className="mt-2 text-[var(--color-secondary)] hover:underline"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Posts Feed */}
                    {!postsLoading && !error && (
                        <>
                            <div className="space-y-6">
                                {posts.length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                                        <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 text-sm">No announcements yet.</p>
                                        {isAdmin && (
                                            <p className="text-gray-400 text-xs mt-1">
                                                Click the "New Post" button to create one.
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    posts.map((post) => (
                                        <Post 
                                            key={post.id}
                                            post={post}
                                            onLikeUpdate={handleLikeUpdate}
                                            onPostDelete={handlePostDelete}
                                        />
                                    ))
                                )}
                            </div>

                            {/* Load More Button */}
                            {hasMore && posts.length > 0 && (
                                <div className="text-center mt-6">
                                    <button
                                        onClick={loadMore}
                                        disabled={isLoadingMore}
                                        className="px-6 py-2 text-[var(--color-secondary)] hover:bg-orange-50 rounded-lg transition font-medium text-sm disabled:opacity-50"
                                    >
                                        {isLoadingMore ? 'Loading...' : 'Load More'}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* CREATE POST MODAL */}
            <CreatePost
                isOpen={showCreatePost}
                onClose={() => setShowCreatePost(false)}
                onPostCreated={handlePostCreated}
                officeName="HOA Main Office"
            />

            {/* ADDITIONAL INFO: Concern Categories & Programs - Matching Healthcare's bottom cards */}
            <section className="bg-gray-50 w-full py-12 px-6 md:px-24 flex justify-center border-t border-gray-200">
                <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-[var(--color-primary)]/10 rounded-full">
                                <Lightbulb className="w-6 h-6 text-[var(--color-primary)]" />
                            </div>
                            <h3 className="text-xl font-bold text-[var(--color-primary)]">Report Concerns</h3>
                        </div>
                        <p className="text-gray-600 text-sm">Report infrastructure issues: street lights, road conditions, drainage, garbage collection, and more.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 fade-in-up" style={{ animationDelay: '0.4s' }}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-[var(--color-accent)]/20 rounded-full">
                                <Building2 className="w-6 h-6 text-[var(--color-primary)]" />
                            </div>
                            <h3 className="text-xl font-bold text-[var(--color-primary)]">Community Programs</h3>
                        </div>
                        <p className="text-gray-600 text-sm">Monthly meetings, clean-up drives, Bayanihan events, and scholarship programs.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 fade-in-up" style={{ animationDelay: '0.6s' }}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-[var(--color-primary)]/10 rounded-full">
                                <Shield className="w-6 h-6 text-[var(--color-primary)]" />
                            </div>
                            <h3 className="text-xl font-bold text-[var(--color-primary])">Security & Safety</h3>
                        </div>
                        <p className="text-gray-600 text-sm">Gate security, CCTV monitoring, and community safety initiatives.</p>
                    </div>
                </div>
            </section>

            
            {/* OFFICERS SECTION - Matching Healthcare's officer cards */}
            <section className="bg-[var(--color-primary)] w-full py-16 px-4 md:px-12 flex flex-col items-center">
                <h2 className="text-white text-5xl md:text-6xl font-bold tracking-tight mb-4 text-center fade-in-up" style={{ animationDelay: '0.2s' }}>
                    Our Officers & Board
                </h2>
                <p className="text-gray-300 text-center max-w-2xl mb-12 text-lg fade-in-up" style={{ animationDelay: '0.3s' }}>
                    Your elected leaders dedicated to serving the community
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full px-4">
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

                {/* Board of Directors - Now inside the same section with matching style */}
                <div className="w-full max-w-7xl mt-16">
                    <h3 className="text-white text-2xl font-semibold mb-6 text-center fade-in-up" style={{ animationDelay: '0.6s' }}>
                        Board of Directors
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 fade-in-up" style={{ animationDelay: '0.7s' }}>
                        {boardMembers.map((member, idx) => (
                            <div 
                                key={member.id} 
                                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
                            >
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

        </div>
    );
}

export default HOA;