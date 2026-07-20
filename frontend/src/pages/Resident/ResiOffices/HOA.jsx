// frontend/src/pages/Resident/ResiOffices/HOA.jsx
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase";
import { uploadImage } from "../../../services/cloudinary";
import HOA_bg from "../../../assets/officesMedia/HOApage_bg.jpg";
import { useState } from "react";
import { 
    Contact, Clock, MapPin, Phone, Mail, Building2, Users, FileText, 
    AlertTriangle, Shield, Megaphone, Home, FileCheck, MoveRight, 
    HardHat, Lightbulb, Droplets, Trash2, Car, Plus, 
    Globe, UserPlus, Heart, MessageSquare, 
    Eye, MoreVertical, CloudSun, Music, Tag, Award, 
    ChevronRight, Reply, Flag, Calendar, Newspaper, Link as LinkIcon,
    Image as ImageIcon, Send, MoreHorizontal, Share2, Bookmark, X
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

// Hooks
import { useAuth } from "../../../hooks/useAuth";
import { usePosts } from "../../../hooks/usePosts";
import { toggleLike as toggleLikeService } from "../../../services/postService";

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
    const [isComposerOpen, setIsComposerOpen] = useState(false);
    const [postContent, setPostContent] = useState("");
    const [postImage, setPostImage] = useState(null);
    const [postImagePreview, setPostImagePreview] = useState(null);
    const [isPosting, setIsPosting] = useState(false);

    // Auth and Posts hooks
    const {
        user,
        loading: authLoading,
        isAdmin,
        isOfficer,
    } = useAuth();

    const { 
        posts, 
        loading: postsLoading, 
        error,
        hasMore,
        isLoadingMore,
        loadMore,
        setPosts 
    } = usePosts();

    // Only HOA officers and admins can post
    const canPostToHOA =
        isAdmin ||
        (
            isOfficer &&
            user?.officerProfile?.office === "HOA"
        );

    console.log("HOA POST PERMISSION:", {
        isAdmin,
        isOfficer,
        office: user?.officerProfile?.office,
        officerStatus: user?.officerProfile?.status,
        canPostToHOA,
    });

    // Handler for like updates
    const handleLikeUpdate = async (postId, isLiked) => {
        if (!user) {
            alert('Please log in to like posts');
            return;
        }

        try {
            const result = await toggleLikeService(postId, user.uid);
            
            if (result.success) {
                setPosts(prev => 
                    prev.map(post => 
                        post.id === postId 
                            ? {
                                ...post,
                                engagement: {
                                    ...post.engagement,
                                    likes: result.isLiked 
                                        ? (post.engagement?.likes || 0) + 1 
                                        : (post.engagement?.likes || 0) - 1
                                },
                                isLiked: result.isLiked
                            }
                            : post
                    )
                );
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    // Handler for post deletion
    const handlePostDelete = (postId) => {
        setPosts(prev => prev.filter(post => post.id !== postId));
    };

    // Handler for creating a new post with Cloudinary
    const handleCreatePost = async () => {
        console.log("CREATE POST CLICKED");
        
        if (!canPostToHOA) {
            console.log("POST BLOCKED - User does not have permission");
            return;
        }

        if (!postContent.trim() && !postImage) {
            console.log("POST BLOCKED - No content or image");
            return;
        }

        console.log("POSTING ANNOUNCEMENT...");
        setIsPosting(true);

        try {
            let uploadedImage = null;

            // Upload image to Cloudinary if exists
            if (postImage) {
                console.log("📤 Uploading image to Cloudinary...");
                uploadedImage = await uploadImage(postImage, "hoa-posts");
                console.log("✅ Cloudinary Upload Successful:", uploadedImage);
            }

            // Create post data - Author is "HOA Main Office"
            const postData = {
                author: {
                    name: "HOA Main Office",
                    avatar: "https://ui-avatars.com/api/?name=HOA&background=F98300&color=fff&size=80",
                    headline: "Homeowners Association",
                    postedBy: user?.uid
                },
                content: {
                    text: postContent.trim(),
                    images: uploadedImage ? [uploadedImage.secureUrl] : []
                },
                engagement: {
                    likes: 0,
                    comments: 0,
                    views: 0
                },
                metadata: {
                    isPinned: false,
                    source: 'office',
                    officeId: 'hoa'
                },
                userId: user?.uid,
                office: "HOA",
                officeName: "HOA Main Office",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                imageInfo: uploadedImage ? {
                    publicId: uploadedImage.publicId,
                    secureUrl: uploadedImage.secureUrl,
                    resourceType: uploadedImage.resourceType
                } : null
            };

            console.log("SENDING POST DATA:", postData);

            // Add to Firestore
            const docRef = await addDoc(collection(db, "posts"), postData);
            
            // Create the post object with ID
            const newPost = {
                id: docRef.id,
                ...postData,
                createdAt: new Date().toISOString()
            };

            console.log("POST CREATED SUCCESSFULLY:", newPost);
            
            // Update local state
            setPosts(prev => [newPost, ...prev]);
            
            // Reset form
            setPostContent("");
            setPostImage(null);
            setPostImagePreview(null);
            setIsComposerOpen(false);
            
        } catch (error) {
            console.error("ERROR CREATING POST:", error);
            alert("Failed to create post. Please try again.");
        } finally {
            setIsPosting(false);
        }
    };

    // Services data
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

    // Social accounts data 
    const socialAccounts = [
        { icon: <LinkIcon className="w-4 h-4 text-blue-400" />, text: "www.windwardhills.com" },
        { icon: <LinkIcon className="w-4 h-4 text-blue-600" />, text: "facebook.com/windwardhills" },
        { icon: <LinkIcon className="w-4 h-4 text-sky-400" />, text: "twitter.com/wwhills" },
        { icon: <LinkIcon className="w-4 h-4 text-pink-600" />, text: "instagram.com/wwhills" },
        { icon: <LinkIcon className="w-4 h-4 text-red-600" />, text: "youtube.com/windwardhills" },
    ];

    // News items
    const newsItems = [
        { icon: <Calendar className="w-3.5 h-3.5 text-[var(--color-primary)]" />, title: "Annual Meeting", desc: "Join us for the annual homeowners meeting on July 25" },
        { icon: <Award className="w-3.5 h-3.5 text-[var(--color-primary)]" />, title: "Community Award", desc: "Windward Hills recognized as Best Community 2025" },
        { icon: <Music className="w-3.5 h-3.5 text-[var(--color-primary)]" />, title: "Summer Festival", desc: "Annual Summer Festival happening August 15-17" },
    ];

    // Handle image selection
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                alert('Please upload a valid image (JPEG, PNG, GIF, or WEBP).');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB.');
                return;
            }

            setPostImage(file);
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setPostImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setPostImage(null);
        setPostImagePreview(null);
    };

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
            
            {/* HERO SECTION */}
            <section
                className="w-full h-[500px] md:h-[600px] bg-cover bg-center flex items-center relative overflow-hidden"
                style={{ 
                    backgroundImage: `linear-gradient(rgba(25, 28, 32, 0.75), rgba(88, 88, 88, 0.65)), url(${HOA_bg})` 
                }}
            >
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

            {/* OFFICE INFO */}
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

            {/* MAIN CONTENT */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 mt-8 relative z-20 pb-12">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    
                    {/* LEFT COLUMN */}
                    <div className="md:col-span-3 space-y-6">
                        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                            <h2 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b">Social Accounts</h2>
                            <div className="space-y-3">
                                {socialAccounts.map((item, idx) => (
                                    <div key={idx} className="flex items-center space-x-3 text-xs text-gray-500 hover:text-gray-800 cursor-pointer truncate">
                                        <span>{item.icon}</span>
                                        <span className="truncate">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                            <h2 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b">Community Programs</h2>
                            <div className="space-y-3">
                                {hoaPrograms.map((prog, idx) => (
                                    <div key={idx} className="space-y-0.5">
                                        <p className="text-xs font-semibold text-gray-800">{prog.title}</p>
                                        <p className="text-[11px] text-gray-500">{prog.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                            <h2 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b">Report Concerns</h2>
                            <div className="space-y-2">
                                {[
                                    { icon: <Lightbulb className="w-3.5 h-3.5 text-[var(--color-primary)]" />, title: "Street Lights" },
                                    { icon: <Building2 className="w-3.5 h-3.5 text-[var(--color-primary)]" />, title: "Road Conditions" },
                                    { icon: <Droplets className="w-3.5 h-3.5 text-[var(--color-primary)]" />, title: "Drainage System" },
                                    { icon: <Trash2 className="w-3.5 h-3.5 text-[var(--color-primary)]" />, title: "Garbage Collection" },
                                    { icon: <Shield className="w-3.5 h-3.5 text-[var(--color-primary)]" />, title: "Security Concerns" },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center space-x-2 text-xs text-gray-600 hover:text-gray-800 cursor-pointer">
                                        <span>{item.icon}</span>
                                        <span>{item.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* MIDDLE COLUMN - Posts Feed */}
                    <div className="md:col-span-6 space-y-6">
                        
                        {/* Create Post Area - ONLY VISIBLE TO HOA OFFICERS */}
                        {canPostToHOA && (
                            <>
                                {!isComposerOpen ? (
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                                                <img 
                                                    src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'User'}&background=0a66c2&color=fff&size=48`}
                                                    alt={user?.displayName || 'User'}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <button
                                                onClick={() => setIsComposerOpen(true)}
                                                className="flex-1 text-left px-4 py-3 bg-[#f3f2ef] hover:bg-[#e8e6e4] rounded-full text-sm text-gray-600 cursor-pointer transition-colors"
                                            >
                                                Start a post...
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-around mt-3 pt-3 border-t border-gray-100">
                                            <button 
                                                onClick={() => setIsComposerOpen(true)}
                                                className="flex items-center gap-2 text-sm text-gray-500 hover:bg-gray-100 px-4 py-2 rounded-full transition-colors cursor-pointer"
                                            >
                                                <ImageIcon className="w-5 h-5 text-[#378fe9]" />
                                                <span className="hidden sm:inline">Photo</span>
                                            </button>
                                            <button className="flex items-center gap-2 text-sm text-gray-500 hover:bg-gray-100 px-4 py-2 rounded-full transition-colors">
                                                <Users className="w-5 h-5 text-[#5e9b4c]" />
                                                <span className="hidden sm:inline">Tag</span>
                                            </button>
                                            <button className="flex items-center gap-2 text-sm text-gray-500 hover:bg-gray-100 px-4 py-2 rounded-full transition-colors">
                                                <Clock className="w-5 h-5 text-[#e7a33e]" />
                                                <span className="hidden sm:inline">Celebrate</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // Expanded composer
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                                                    <img 
                                                        src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'User'}&background=0a66c2&color=fff&size=40`}
                                                        alt={user?.displayName || 'User'}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 text-sm">
                                                        {user?.displayName || 'HOA Officer'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">Posting in HOA Main Office</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setIsComposerOpen(false);
                                                    setPostContent("");
                                                    handleRemoveImage();
                                                }}
                                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                            >
                                                <X className="w-5 h-5 text-gray-500" />
                                            </button>
                                        </div>

                                        <textarea
                                            value={postContent}
                                            onChange={(e) => setPostContent(e.target.value)}
                                            placeholder="What do you want to talk about?"
                                            className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#0a66c2] min-h-[120px] text-sm"
                                            autoFocus
                                        />

                                        {postImagePreview && (
                                            <div className="mt-3 relative inline-block">
                                                <img 
                                                    src={postImagePreview} 
                                                    alt="Post preview" 
                                                    className="max-h-48 rounded-lg object-cover"
                                                />
                                                <button
                                                    onClick={handleRemoveImage}
                                                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between mt-3 pt-3 border-t">
                                            <label className="flex items-center gap-2 text-sm text-gray-500 hover:bg-gray-100 px-3 py-2 rounded-full transition-colors cursor-pointer">
                                                <ImageIcon className="w-5 h-5 text-[#378fe9]" />
                                                <span>Add Image</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleImageSelect}
                                                />
                                            </label>
                                            <button
                                                onClick={handleCreatePost}
                                                disabled={isPosting || (!postContent.trim() && !postImage)}
                                                className="px-6 py-2 bg-[#0a66c2] text-white rounded-full font-medium hover:bg-[#004182] transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                            >
                                                {isPosting ? 'Posting...' : 'Post'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Loading State */}
                        {postsLoading && (
                            <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-100">
                                <div className="inline-block w-8 h-8 border-4 border-[var(--color-secondary)] border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-gray-500 text-xs mt-2">Loading announcements...</p>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-100">
                                <p className="text-red-500 text-sm">Error loading posts: {error}</p>
                                <button 
                                    onClick={() => window.location.reload()}
                                    className="mt-2 text-[var(--color-secondary)] hover:underline text-sm"
                                >
                                    Retry
                                </button>
                            </div>
                        )}

                        {/* Posts Feed */}
                        {!postsLoading && !error && (
                            <>
                                {posts.length === 0 ? (
                                    <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-100">
                                        <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 font-medium">No announcements yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {posts.map((post) => (
                                            <Post 
                                                key={post.id}
                                                post={post}
                                                source="office"
                                                onLike={handleLikeUpdate}
                                                onDelete={handlePostDelete}
                                                currentUser={user}
                                                isAdmin={isAdmin}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Load More Button */}
                                {hasMore && posts.length > 0 && (
                                    <div className="text-center">
                                        <button
                                            onClick={loadMore}
                                            disabled={isLoadingMore}
                                            className="px-6 py-2 text-[var(--color-secondary)] hover:bg-orange-50 rounded-full transition font-medium text-sm disabled:opacity-50"
                                        >
                                            {isLoadingMore ? 'Loading...' : 'Load more posts'}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="md:col-span-3 space-y-6">

                        <div className="bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-primary)] text-white rounded-lg shadow-sm p-4 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="text-sm font-bold">Windward Hills</h4>
                                    <p className="text-[11px] opacity-90">Monday</p>
                                    <p className="text-[10px] opacity-80">{new Date().toLocaleDateString()}</p>
                                </div>
                                <CloudSun className="w-12 h-12 text-white/90" />
                            </div>
                            
                            <div className="flex items-center justify-between my-4">
                                <span className="text-xs bg-black/10 px-2 py-1 rounded">💧 30%</span>
                                <span className="text-3xl font-light">28°</span>
                            </div>

                            <div className="flex justify-between text-xs border-b border-white/20 pb-2 mb-3">
                                <span>↓ 22°</span>
                                <span>↑ 30°</span>
                            </div>

                            <div className="grid grid-cols-7 text-center text-[10px] opacity-90 pt-1">
                                <div>Mon</div>
                                <div>Tue</div>
                                <div>Wed</div>
                                <div>Thu</div>
                                <div>Fri</div>
                                <div>Sat</div>
                                <div>Sun</div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                            <h2 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">Announcements</h2>
                            <div className="space-y-4">
                                {newsItems.map((news, idx) => (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex items-center space-x-1.5 text-xs font-semibold text-gray-800">
                                            {news.icon}
                                            <span>{news.title}</span>
                                        </div>
                                        <p className="text-[11px] text-gray-500 leading-normal">
                                            {news.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-3 border-t text-center">
                                <button className="text-xs font-medium text-gray-600 hover:text-gray-900">View All</button>
                            </div>
                        </div>

                        <a 
                            href="https://www.facebook.com/AnongPageNGHOANATIN" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-[var(--color-primary)] text-white p-4 rounded-lg shadow-sm hover:opacity-90 transition-all duration-300 flex items-center gap-3"
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="24" 
                                height="24" 
                                viewBox="0 0 24 24" 
                                fill="currentColor" 
                                className="w-5 h-5 flex-shrink-0"
                            >
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            <div>
                                <p className="font-semibold text-sm">Follow Us on Facebook</p>
                                <p className="text-xs opacity-80">Stay updated with latest events</p>
                            </div>
                        </a>

                    </div>

                </div>
            </div>

            {/* SERVICES SECTION */}
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

            {/* ADDITIONAL INFO */}
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
                            <h3 className="text-xl font-bold text-[var(--color-primary)]">Security & Safety</h3>
                        </div>
                        <p className="text-gray-600 text-sm">Gate security, CCTV monitoring, and community safety initiatives.</p>
                    </div>
                </div>
            </section>

            {/* OFFICERS & BOARD SECTION - KEEP OFFICER NAMES AS IS */}
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
                            <div className="w-full aspect-square rounded-3xl overflow-hidden shadow-lg bg-zinc-800 transition-transform duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl">
                                <img 
                                    src={officer.image} 
                                    alt={officer.name} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>
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