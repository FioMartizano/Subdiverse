import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, User, Phone, MapPin, Lock, Eye, EyeOff, Calendar, ShieldCheck, CreditCard, Image } from "lucide-react";

function SignUp() {
    const [userType, setUserType] = useState("owner"); // "owner" or "renter"
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        contactNumber: "",
        address: "",
        ownerFullName: "",
        leaseStart: "",
        leaseEnd: "",
        password: "",
        confirmPassword: "",
        idType: "",
        idNumber: "",
    });

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Submitting registration for:", userType, formData);
    };

    return (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 min-h-screen bg-white">

            {/* Left Column*/}
            <div className="hidden md:block p-4 bg-white h-full min-h-[800px]">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="w-full h-full rounded-[24px] bg-gray-50 border border-gray-100 p-10 flex flex-col justify-between relative overflow-hidden"
                >
                    <div className="relative z-10 flex items-center justify-between">
                        <span className="text-gray-400 text-4xl font-light select-none">✳</span>
                    </div>

                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-[0.15]">
                        <Image className="w-16 h-16 text-gray-900 stroke-[1.25]" />
                        <span className="text-xs font-mono tracking-widest uppercase mt-2 text-gray-900">
                            Subdivision Photo Placeholder
                        </span>
                    </div>

                    <div className="relative z-10 text-gray-800 space-y-2 max-w-sm mb-16">
                        <p className="text-sm font-medium text-gray-400 tracking-wide">Join the community</p>
                        <h2 className="text-3xl lg:text-4xl font-bold tracking-tight leading-tight text-gray-900">
                            Discover a seamless way to manage community connections
                        </h2>
                    </div>
                </motion.div>
            </div>

            {/* Right Column*/}
            <div className="flex flex-col justify-start mt-16 px-6 py-8 sm:px-16 md:px-16 lg:px-20 bg-white h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] overflow-hidden">

                <div className="flex-shrink-0">
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-secondary font-heading">
                        Sign Up
                    </h1>
                    <p className="text-sm font-medium mt-1 mb-6 text-primary">
                        If you are a resident, register now!
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 max-w-md w-full flex-shrink-0">
                    <button
                        type="button"
                        onClick={() => setUserType("owner")}
                        className={`py-2.5 px-4 rounded-[var(--radius-buttons)] font-bold text-sm tracking-wide border uppercase transition-all duration-200 cursor-pointer ${userType === "owner"
                            ? "bg-secondary text-white border-secondary shadow-md"
                            : "bg-white text-primary border-gray-300 hover:bg-gray-50"
                            }`}
                    >
                        Property Owner
                    </button>
                    <button
                        type="button"
                        onClick={() => setUserType("renter")}
                        className={`py-2.5 px-4 rounded-[var(--radius-buttons)] font-bold text-sm tracking-wide border uppercase transition-all duration-200 cursor-pointer ${userType === "renter"
                            ? "bg-secondary text-white border-secondary shadow-md"
                            : "bg-white text-primary border-gray-300 hover:bg-gray-50"
                            }`}
                    >
                        Renter
                    </button>
                </div>


                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col w-full max-w-xl mx-auto md:mx-0 overflow-y-auto pr-4 flex-grow space-y-6 scrollbar-thin transition-all duration-300"
                    style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#f3f4f6',
                    }}
                >

                    <style dangerouslySetInnerHTML={{
                        __html: `
                        form::-webkit-scrollbar {
                            width: 6px;
                            transition: all 0.3s ease-in-out;
                        }
                        form::-webkit-scrollbar-track {
                            background: #f3f4f6;
                            border-radius: 20px;
                        }
                        form::-webkit-scrollbar-thumb {
                            background: #fb923c; /* Light orange default */
                            border-radius: 20px;
                            transition: background 0.3s ease;
                        }
                        form::-webkit-scrollbar-thumb:hover {
                            background: #ea580c; /* High-intensity darker orange on hover */
                        }
                        form:hover::-webkit-scrollbar-thumb {
                            animation: pulseScrollbar 1.5s ease-in-out infinite alternate;
                        }
                        @keyframes pulseScrollbar {
                            0% { background-color: #f97316; }
                            100% { background-color: #fb923c; }
                        }
                    `}} />

                    <div className="pt-2">
                        <span className="bg-gray-100 text-primary text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded">
                            {userType === "owner" ? "Property Owner Account" : "Renter Account"}
                        </span>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={userType}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            {/* --- SECTION 1: PERSONAL INFORMATION --- */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold tracking-wider text-secondary uppercase">
                                    Personal Information
                                </h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="firstName" className="text-xs font-semibold text-gray-600">First name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input id="firstName" value={formData.firstName} onChange={handleInputChange} type="text" placeholder="Juan" className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="lastName" className="text-xs font-semibold text-gray-600">Last name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input id="lastName" value={formData.lastName} onChange={handleInputChange} type="text" placeholder="Dela Cruz" className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="email" className="text-xs font-semibold text-gray-600">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input id="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="example@gmail.com" className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="contactNumber" className="text-xs font-semibold text-gray-600">Contact Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input id="contactNumber" value={formData.contactNumber} onChange={handleInputChange} type="text" placeholder="+63 XXX XXX XXXX" className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="address" className="text-xs font-semibold text-gray-600">Address</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input id="address" value={formData.address} onChange={handleInputChange} type="text" placeholder="e.g. Block 4, Lot 9" className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
                                    </div>
                                </div>
                            </div>

                            {/* --- SECTION 2: RENTER SPECIFIC PROPERTY --- */}
                            {userType === "renter" && (
                                <div className="space-y-4 pt-2 border-t border-gray-100">
                                    <h3 className="text-xs font-bold tracking-wider text-secondary uppercase">
                                        Unit Property Details
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label htmlFor="leaseStart" className="text-xs font-semibold text-gray-600">Lease Start Date</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input id="leaseStart" value={formData.leaseStart} onChange={handleInputChange} type="date" className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label htmlFor="leaseEnd" className="text-xs font-semibold text-gray-600">Lease End Date</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input id="leaseEnd" value={formData.leaseEnd} onChange={handleInputChange} type="date" className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="ownerFullName" className="text-xs font-semibold text-gray-600">Owner's Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input id="ownerFullName" value={formData.ownerFullName} onChange={handleInputChange} type="text" placeholder="Enter the owner of the property" className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- SECTION 3: ACCOUNT SECURITY --- */}
                            <div className="space-y-4 pt-2 border-t border-gray-100">
                                <h3 className="text-xs font-bold tracking-wider text-secondary uppercase">
                                    Account Security
                                </h3>

                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="password" className="text-xs font-semibold text-gray-600">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder="Enter at least 8 characters"
                                            className="w-full border border-gray-300 rounded-lg pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="confirmPassword" className="text-xs font-semibold text-gray-600">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            placeholder="Repeat password"
                                            className="w-full border border-gray-300 rounded-lg pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                                        />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* --- SECTION 4: IDENTITY VERIFICATION --- */}
                            <div className="space-y-4 pt-2 border-t border-gray-100">
                                <h3 className="text-xs font-bold tracking-wider text-secondary uppercase">
                                    Identity Verification
                                </h3>

                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="idType" className="text-xs font-semibold text-gray-600">Government ID Type</label>
                                    <div className="relative">
                                        <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <select
                                            id="idType"
                                            value={formData.idType}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary appearance-none cursor-pointer"
                                        >
                                            <option value="">Select ID</option>
                                            <option value="passport">Passport</option>
                                            <option value="drivers">Driver's License</option>
                                            <option value="national">National ID / UMID</option>
                                        </select>
                                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-500 w-0 h-0"></div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="idNumber" className="text-xs font-semibold text-gray-600">ID Number</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input id="idNumber" value={formData.idNumber} onChange={handleInputChange} type="text" placeholder="Enter ID Number" className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
                                    </div>
                                </div>

                                <p className="text-[11px] text-gray-500 italic mt-1">
                                    * Your account will be reviewed by the admin before activation.
                                </p>
                            </div>

                            <div className="pt-2 pb-6">
                                <button
                                    type="submit"
                                    className="w-full bg-primary hover:brightness-110 text-white font-semibold py-3 rounded-full shadow-sm transition-all duration-200 cursor-pointer"
                                >
                                    Register
                                </button>
                                <p className="text-center text-[11px] text-gray-500 mt-3">
                                    By signing up you agree to our <span className="text-blue-600 underline cursor-pointer hover:text-blue-800">Terms of Use</span> and <span className="text-blue-600 underline cursor-pointer hover:text-blue-800">Privacy Policy</span>.
                                </p>
                            </div>

                        </motion.div>
                    </AnimatePresence>
                </form>

            </div>
        </div>
    );
}

export default SignUp;