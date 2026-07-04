import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, User, Phone, MapPin, Lock, Eye, EyeOff, Calendar, ShieldCheck, CreditCard, Image, Users, Upload, FileText } from "lucide-react";
import { auth, db, storage } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import signUpImage from "../../assets/signUp.jpg";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { uploadImage } from "../../services/cloudinary"; //add this to link cloudinary.js


function SignUp() {
    const [userType, setUserType] = useState("owner"); // "owner", "renter", or "household"
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [idFile, setIdFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState("Weak");
    const [passwordScore, setPasswordScore] = useState(0);


    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        contactNumber: "",
        block: "",
        lot: "",
        street: "",
        phase: "",
        ownerFullName: "",
        leaseStart: "",
        leaseEnd: "",
        homeownerName: "",
        relationshipToHomeowner: "",
        otherRelationship: "",
        password: "",
        confirmPassword: "",
        idType: "",
        otherIdType: "", // Added to store manual input for "Other ID"
        idNumber: "",
    });

    const checkPasswordStrength = (password) => {
        let score = 0;

        if (password.length >= 6) score++; // Firebase minimum
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score <= 2) {
            setPasswordStrength("Weak");
            setPasswordScore(33);
        } else if (score <= 4) {
            setPasswordStrength("Medium");
            setPasswordScore(66);
        } else {
            setPasswordStrength("Strong");
            setPasswordScore(100);
        }
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;

        // Contact Number
        if (id === "contactNumber") {
            const numbersOnly = value.replace(/\D/g, "");

            setFormData((prev) => ({
                ...prev,
                contactNumber: numbersOnly.slice(0, 11),
            }));

            return;
        }

        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }));

        if (id === "password") {
            checkPasswordStrength(value);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setIdFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.contactNumber.length !== 11) {
            alert("Contact number must contain exactly 11 digits.");
            return;
        }

        if (formData.password.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(formData.email)) {
            alert("Please enter a valid email.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        setIsLoading(true);

        try {
            // Step 1: Create user authentication account sa Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );
            const userId = userCredential.user.uid;

            // Step 2: Upload the ID copy to Cloudinary 
            let uploadedIdUrl = "";
            if (idFile) {
                uploadedIdUrl = await uploadImage(idFile, "authentication/valid-ids"); //add this pero state your own folder 
            }

            // Step 3A: Save user base role and status to the "users" collection
            await setDoc(doc(db, "users", userId), {
                email: formData.email,
                role: "resident",
                status: "pending",
                residentId: userId,
                createdAt: new Date().toISOString()
            });

            // Step 3B: Save detailed profile fields to the "residents" collection
            await setDoc(doc(db, "residents", userId), {
                firstName: formData.firstName,
                lastName: formData.lastName,
                contactNumber: formData.contactNumber,
                email: formData.email,
                block: formData.block,
                lot: formData.lot,
                street: formData.street,
                phase: formData.phase,
                residentCategory: userType,

                ...(userType === "renter" && {
                    leaseStart: formData.leaseStart,
                    leaseEnd: formData.leaseEnd,
                    propertyOwnerName: formData.ownerFullName
                }),

                ...(userType === "household" && {
                    homeownerName: formData.homeownerName,
                    relationshipToHomeowner: formData.relationshipToHomeowner,
                    otherRelationship: formData.relationshipToHomeowner === "Other" ? formData.otherRelationship : ""
                }),

                idType: formData.idType === "Other" ? formData.otherIdType : formData.idType,
                idNumber: formData.idNumber,
                idImageUrl: uploadedIdUrl, // Stores the secure Cloudinary URL
                verificationStatus: "unverified",
                createdAt: new Date().toISOString()
            });

            alert("Registration successful! Your account has been submitted for admin approval.");

        } catch (error) {
            console.error("Error during registration process:", error);

            if (error.code === "auth/email-already-in-use") {
                alert("This email address is already in use. Please try a different email or log in.");
            } else {
                alert("Registration failed: " + error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };



    const getAccountTypeLabel = () => {
        if (userType === "owner") return "Property Owner Account";
        if (userType === "renter") return "Renter Account";
        return "Household Member Account";
    };



    return (
        <div className="w-full h-screen min-h-screen bg-white grid grid-cols-1 md:grid-cols-12 overflow-hidden">
            {/* Left Column */}
            <div className="hidden md:block md:col-span-5 lg:col-span-5 p-4 bg-white h-full">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.005 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full h-full rounded-[24px] bg-slate-900 border border-slate-100 p-12 flex flex-col justify-between relative overflow-hidden shadow-lg group"
                >
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{
                            backgroundImage: `url(${signUpImage})`,
                        }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>

                    <div className="relative z-10 flex items-center justify-between">
                        <span className="text-white/40 text-3xl font-light select-none transition-transform duration-500 group-hover:rotate-45">
                            ✳
                        </span>
                    </div>

                    <div className="relative z-10 space-y-3 max-w-sm mb-6">
                        <span className="inline-block text-xs font-semibold uppercase tracking-widest bg-white/10 px-2.5 py-1 rounded-md text-white/90">
                            Join the community
                        </span>
                        <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white drop-shadow-md">
                            Discover a seamless way to manage community connections
                        </h2>
                    </div>
                </motion.div>
            </div>

            {/* Right Column*/}
            <div className="col-span-1 md:col-span-7 lg:col-span-7 flex flex-col justify-center items-center px-6 pt-24 pb-12 sm:px-16 sm:pt-28 md:px-16 lg:px-24 bg-white h-full overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="max-w-2xl w-full mx-auto"
                ></motion.div>

                <div className="flex-shrink-0 w-full text-left max-w-xl mx-auto pl-1">
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-secondary font-heading">
                        Sign Up
                    </h1>
                    <p className="text-sm font-medium mt-1 mb-6 text-primary">
                        If you are a resident, register now!
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4 max-w-xl w-full flex-shrink-0">
                    <button
                        type="button"
                        onClick={() => setUserType("owner")}
                        className={`py-2.5 px-2 rounded-[var(--radius-buttons)] font-bold text-xs sm:text-sm tracking-wide border uppercase transition-all duration-200 cursor-pointer ${userType === "owner"
                            ? "bg-secondary text-white border-secondary shadow-md"
                            : "bg-white text-primary border-gray-300 hover:bg-gray-50"
                            }`}
                    >
                        Owner
                    </button>
                    <button
                        type="button"
                        onClick={() => setUserType("renter")}
                        className={`py-2.5 px-2 rounded-[var(--radius-buttons)] font-bold text-xs sm:text-sm tracking-wide border uppercase transition-all duration-200 cursor-pointer ${userType === "renter"
                            ? "bg-secondary text-white border-secondary shadow-md"
                            : "bg-white text-primary border-gray-300 hover:bg-gray-50"
                            }`}
                    >
                        Renter
                    </button>
                    <button
                        type="button"
                        onClick={() => setUserType("household")}
                        className={`py-2.5 px-2 rounded-[var(--radius-buttons)] font-bold text-xs sm:text-sm tracking-wide border uppercase transition-all duration-200 cursor-pointer ${userType === "household"
                            ? "bg-secondary text-white border-secondary shadow-md"
                            : "bg-white text-primary border-gray-300 hover:bg-gray-50"
                            }`}
                    >
                        Household
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
                            background: #fb923c;
                            border-radius: 20px;
                            transition: background 0.3s ease;
                        }
                        form::-webkit-scrollbar-thumb:hover {
                            background: #ea580c;
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
                            {getAccountTypeLabel()}
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
                                        <input id="contactNumber" value={formData.contactNumber} onChange={handleInputChange} type="tel" inputMode="numeric" maxLength={11} placeholder="+63 XXX XXX XXXX" className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
                                    </div>
                                </div>

                                {/* Address Grid (Dissected Fields) */}
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5 text-gray-400" /> Address Location
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex flex-col gap-1">
                                            <input id="block" value={formData.block} onChange={handleInputChange} type="text" placeholder="(Block 1)" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <input id="lot" value={formData.lot} onChange={handleInputChange} type="text" placeholder="(Lot 9)" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">

                                        <div className="flex flex-col gap-1">
                                            <input id="phase" value={formData.phase} onChange={handleInputChange} type="text" placeholder="Phase 1" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <input id="street" value={formData.street} onChange={handleInputChange} type="text" placeholder="Example Street" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
                                        </div>

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

                            {/* --- SECTION 2.5: HOUSEHOLD MEMBER SPECIFIC PROPERTY --- */}
                            {userType === "household" && (
                                <div className="space-y-4 pt-2 border-t border-gray-100">
                                    <h3 className="text-xs font-bold tracking-wider text-secondary uppercase">
                                        Household Association
                                    </h3>

                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="homeownerName" className="text-xs font-semibold text-gray-600">Homeowner Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input id="homeownerName" value={formData.homeownerName} onChange={handleInputChange} type="text" placeholder="Enter the primary homeowner's name" className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="relationshipToHomeowner" className="text-xs font-semibold text-gray-600">Relationship to Homeowner</label>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <select
                                                id="relationshipToHomeowner"
                                                value={formData.relationshipToHomeowner}
                                                onChange={handleInputChange}
                                                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary appearance-none cursor-pointer"
                                            >
                                                <option value="">Select Relationship</option>
                                                <option value="Spouse">Spouse</option>
                                                <option value="Father">Father</option>
                                                <option value="Mother">Mother</option>
                                                <option value="Brother">Brother</option>
                                                <option value="Sister">Sister</option>
                                                <option value="Son">Son</option>
                                                <option value="Daughter">Daughter</option>
                                                <option value="Grandparent">Grandparent</option>
                                                <option value="Other">Other</option>
                                            </select>
                                            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-500 w-0 h-0"></div>
                                        </div>
                                    </div>

                                    {/* Animated field for Custom Relationship Types */}
                                    <AnimatePresence>
                                        {formData.relationshipToHomeowner === "Other" && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="flex flex-col gap-1.5 overflow-hidden"
                                            >
                                                <label htmlFor="otherRelationship" className="text-xs font-semibold text-gray-600">Please Specify Relationship</label>
                                                <div className="relative">
                                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input id="otherRelationship" value={formData.otherRelationship} onChange={handleInputChange} type="text" placeholder="e.g. Cousin, Aunt, Guardian" className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
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

                                    <div className="mt-2">
                                        <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-300 ${passwordStrength === "Weak"
                                                    ? "bg-red-500"
                                                    : passwordStrength === "Medium"
                                                        ? "bg-yellow-500"
                                                        : "bg-green-500"
                                                    }`}
                                                style={{ width: `${passwordScore}%` }}
                                            />
                                        </div>

                                        <p
                                            className={`text-xs mt-1 font-medium ${passwordStrength === "Weak"
                                                ? "text-red-500"
                                                : passwordStrength === "Medium"
                                                    ? "text-yellow-600"
                                                    : "text-green-600"
                                                }`}
                                        >
                                            Password Strength: {passwordStrength}
                                        </p>
                                    </div>

                                    <div className="text-xs mt-2 space-y-1">
                                        <p className={formData.password.length >= 6 ? "text-green-600" : "text-gray-500"}>
                                            ✓ At least 6 characters
                                        </p>

                                        <p className={/[A-Z]/.test(formData.password) ? "text-green-600" : "text-gray-500"}>
                                            ✓ One uppercase letter
                                        </p>

                                        <p className={/[a-z]/.test(formData.password) ? "text-green-600" : "text-gray-500"}>
                                            ✓ One lowercase letter
                                        </p>

                                        <p className={/[0-9]/.test(formData.password) ? "text-green-600" : "text-gray-500"}>
                                            ✓ One number
                                        </p>

                                        <p className={/[^A-Za-z0-9]/.test(formData.password) ? "text-green-600" : "text-gray-500"}>
                                            ✓ One special character
                                        </p>
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

                                    {formData.confirmPassword && (
                                        <p
                                            className={`text-xs mt-2 font-medium ${formData.password === formData.confirmPassword
                                                ? "text-green-600"
                                                : "text-red-500"
                                                }`}
                                        >
                                            {formData.password === formData.confirmPassword
                                                ? "✓ Passwords match"
                                                : "✗ Passwords do not match"}
                                        </p>
                                    )}
                                </div>
                            </div>


                            {/* --- SECTION 4: IDENTITY VERIFICATION --- */}
                            <div className="space-y-4 pt-2 border-t border-gray-100">
                                <h3 className="text-xs font-bold tracking-wider text-secondary uppercase">
                                    Identity Verification
                                </h3>

                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="idType" className="text-xs font-semibold text-gray-600">Valid ID Type</label>
                                    <div className="relative">
                                        <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <select
                                            id="idType"
                                            value={formData.idType}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary appearance-none cursor-pointer"
                                        >
                                            <option value="">Select Valid ID</option>

                                            {/* Subdivision Specific WWHS IDs */}
                                            {userType === "owner" && <option value="wwhs-owner">Homeowners - Green WWHS ID</option>}
                                            {userType === "renter" && <option value="wwhs-renter">Renter - Yellow WWHS ID</option>}
                                            {userType === "household" && <option value="wwhs-household">Occupant/Household Member - White WWHS ID</option>}

                                            {/* General Government Standard ID Options */}
                                            <option value="passport">Passport</option>
                                            <option value="drivers">Driver's License</option>
                                            <option value="national">National ID / UMID</option>

                                            {/* New "Other" Option */}
                                            <option value="Other">Other (Please specify)</option>
                                        </select>
                                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-500 w-0 h-0"></div>
                                    </div>
                                </div>

                                {/* Animated field for Custom/Other Valid ID types */}
                                <AnimatePresence>
                                    {formData.idType === "Other" && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex flex-col gap-1.5 overflow-hidden"
                                        >
                                            <label htmlFor="otherIdType" className="text-xs font-semibold text-gray-600">Please Specify ID Type</label>
                                            <div className="relative">
                                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input id="otherIdType" value={formData.otherIdType} onChange={handleInputChange} type="text" placeholder="e.g. SSS, TIN, Company ID" className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="idNumber" className="text-xs font-semibold text-gray-600">ID Number</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input id="idNumber" value={formData.idNumber} onChange={handleInputChange} type="text" placeholder="Enter ID Number" className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
                                    </div>
                                </div>

                                {/* Shared Upload ID Dropbox */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-gray-600">Upload ID Copy</label>
                                    <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center gap-2 bg-gray-50/50 hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <Upload className="w-5 h-5 text-gray-400" />
                                        <span className="text-xs text-gray-600 font-medium">
                                            {idFile ? idFile.name : "Click to upload or drag image/PDF"}
                                        </span>
                                        <span className="text-[10px] text-gray-400">Max size: 5MB</span>
                                    </label>
                                </div>

                                <p className="text-[11px] text-gray-500 italic mt-1">
                                    * Your account will be reviewed by the admin before activation.
                                </p>
                            </div>

                            <div className="pt-2 pb-6">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full text-white font-semibold py-3 rounded-full shadow-sm transition-all duration-200 cursor-pointer ${isLoading
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-primary hover:brightness-110"
                                        }`}
                                >
                                    {isLoading ? "Registering..." : "Register"}
                                </button>

                                <p className="text-center text-[11px] text-gray-500 mt-3">
                                    By signing up you agree to our <span className="text-blue-600 underline cursor-pointer hover:text-blue-800">Terms of Use</span> and <span className="text-blue-600 underline cursor-pointer hover:text-blue-800">Privacy Policy</span>.
                                </p>
                            </div>

                        </motion.div>
                    </AnimatePresence>
                </form>

            </div>
        </div >
    );
}

export default SignUp;