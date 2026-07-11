import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, User, Phone, MapPin, Lock, Eye, EyeOff, Calendar, ShieldCheck, CreditCard, Image, Users, Upload, FileText, AlertCircle, X } from "lucide-react";
import { auth, db, storage } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import signUpImage from "../../assets/signUp.jpg";
import { uploadImage } from "../../services/cloudinary"; //add this to link cloudinary.js
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const SuccessModal = ({ isOpen, message, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-[var(--radius-cards)] shadow-xl w-80 text-center">
                <h3 className="text-lg font-bold text-green-600 mb-2">
                    ✅ Registration Successful
                </h3>

                <p className="text-sm text-gray-600 mb-4">
                    {message}
                </p>

                <button
                    onClick={onClose}
                    className="w-full bg-primary text-white py-2 rounded-[var(--radius-buttons)]"
                >
                    Go to Login
                </button>
            </div>
        </div>
    );
};

const IncompleteModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-80 p-6 text-center">
                <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                    Almost there
                </h3>
                <p className="text-sm text-gray-500 mb-5">
                    Please complete all required fields correctly before submitting.
                </p>
                <button
                    onClick={onClose}
                    className="w-full bg-primary text-white text-sm font-medium py-2.5 rounded-full hover:brightness-110 transition cursor-pointer"
                >
                    Got it
                </button>
            </div>
        </div>
    );
};

function SignUp() {
    const [userType, setUserType] = useState("owner"); // "owner", "renter", or "household"
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [idFiles, setIdFiles] = useState([]); // array of up to 2 files: [front, back]
    const [isDraggingFile, setIsDraggingFile] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState("Weak");
    const [passwordScore, setPasswordScore] = useState(0);


    const [fieldErrors, setFieldErrors] = useState({});

    const [touched, setTouched] = useState({});

    const [submitError, setSubmitError] = useState("");

    const [success, setSuccess] = useState({ show: false, message: "" });
    const [showIncompleteModal, setShowIncompleteModal] = useState(false);

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: "",
        middleName: "",
        lastName: "",
        suffix: "",
        email: "",
        contactNumber: "",
        emergencyContactNumber: "",
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
        otherIdType: "",
        idNumber: "",
    });

    // Phone number formatting function
    const formatPhoneNumber = (value) => {
        // Remove all non-digit characters
        const digits = value.replace(/\D/g, '');
        
        // Format as +63 XXX XXX XXXX
        if (digits.length <= 3) {
            return digits;
        } else if (digits.length <= 6) {
            return `${digits.slice(0, 3)} ${digits.slice(3)}`;
        } else if (digits.length <= 10) {
            return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
        }
        return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
    };

    const getAccountTypeLabel = () => {
        if (userType === "owner") return "Property Owner Account";
        if (userType === "renter") return "Renter Account";
        return "Household Member Account";
    };

    const checkPasswordStrength = (password) => {
        let score = 0;

        if (password.length >= 6) score++;
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
        setTouched((prev) => ({ ...prev, [id]: true }));

        // Letters (and spaces) only for name fields
        if (id === "firstName" || id === "middleName" || id === "lastName") {
            const lettersOnly = value.replace(/[^A-Za-z\s]/g, "");
            setFormData((prev) => ({
                ...prev,
                [id]: lettersOnly,
            }));
            return;
        }

        // +63 is implied, user only types the 10 digits after it
        if (id === "contactNumber" || id === "emergencyContactNumber") {
            const numbersOnly = value.replace(/\D/g, '');
            // Limit to 10 digits
            const limited = numbersOnly.slice(0, 10);
            setFormData((prev) => ({
                ...prev,
                [id]: limited,
            }));
            return;
        }

        // ID Number validation - limit to 25 characters
        if (id === "idNumber") {
            // Allow alphanumeric characters, spaces, hyphens, and slashes
            const cleaned = value.replace(/[^A-Za-z0-9\s\-/]/g, '');
            // Limit to 25 characters
            const limited = cleaned.slice(0, 25);
            setFormData((prev) => ({
                ...prev,
                [id]: limited,
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

    const handleFilesSelected = (fileList) => {
        setTouched((prev) => ({ ...prev, idFiles: true }));
        const incoming = Array.from(fileList || []);
        if (incoming.length === 0) return;
        setIdFiles((prev) => [...prev, ...incoming].slice(0, 2));
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            handleFilesSelected(e.target.files);
        }
        e.target.value = ""; // allow re-selecting the same file after removal
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingFile(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingFile(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingFile(false);
        if (e.dataTransfer.files) {
            handleFilesSelected(e.dataTransfer.files);
        }
    };

    const removeIdFile = (index) => {
        setIdFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const validateForm = () => {
        const errors = {};
        const nameRegex = /^[A-Za-z\s]+$/;

        if (!formData.firstName.trim()) {
            errors.firstName = "First name is required.";
        } else if (!nameRegex.test(formData.firstName)) {
            errors.firstName = "First name can only contain letters.";
        }

        if (formData.middleName.trim() && !nameRegex.test(formData.middleName)) {
            errors.middleName = "Middle name can only contain letters.";
        }

        if (!formData.lastName.trim()) {
            errors.lastName = "Last name is required.";
        } else if (!nameRegex.test(formData.lastName)) {
            errors.lastName = "Last name can only contain letters.";
        }

        if (!formData.email.trim()) {
            errors.email = "Email address is required.";
        } else {
            const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
            if (!emailRegex.test(formData.email)) errors.email = "Please enter a valid email.";
        }

        if (!formData.contactNumber.trim()) {
            errors.contactNumber = "Contact number is required.";
        } else if (!/^9\d{9}$/.test(formData.contactNumber)) {
            errors.contactNumber = "Please enter a valid 10-digit mobile number.";
        }

        if (!formData.emergencyContactNumber.trim()) {
            errors.emergencyContactNumber = "Emergency contact number is required.";
        } else if (!/^9\d{9}$/.test(formData.emergencyContactNumber)) {
            errors.emergencyContactNumber = "Please enter a valid 10-digit mobile number.";
        } else if (formData.emergencyContactNumber === formData.contactNumber) {
            errors.emergencyContactNumber = "Emergency contact should be different from your own number.";
        }

        if (!formData.block.trim()) errors.block = "Block is required.";
        if (!formData.lot.trim()) errors.lot = "Lot is required.";
        if (!formData.street.trim()) errors.street = "Street is required.";
        if (!formData.phase.trim()) errors.phase = "Phase is required.";

        if (userType === "renter") {
            if (!formData.ownerFullName.trim()) errors.ownerFullName = "Property owner's name is required.";
            if (!formData.leaseStart) errors.leaseStart = "Lease start date is required.";
            if (!formData.leaseEnd) errors.leaseEnd = "Lease end date is required.";
            if (
                formData.leaseStart &&
                formData.leaseEnd &&
                new Date(formData.leaseEnd) <= new Date(formData.leaseStart)
            ) {
                errors.leaseEnd = "Lease end date must be after the start date.";
            }
        }

        if (userType === "household") {
            if (!formData.homeownerName.trim()) errors.homeownerName = "Homeowner's name is required.";
            if (!formData.relationshipToHomeowner) errors.relationshipToHomeowner = "Please select your relationship.";
            if (formData.relationshipToHomeowner === "Other" && !formData.otherRelationship.trim()) {
                errors.otherRelationship = "Please specify your relationship.";
            }
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            errors.password = "Must be 8+ characters with an uppercase, lowercase, and number.";
        }
        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = "Passwords do not match.";
        }

        if (!formData.idType) errors.idType = "Please select an ID type.";
        if (formData.idType === "Other" && !formData.otherIdType.trim()) {
            errors.otherIdType = "Please specify the ID type.";
        }
        
        // Updated ID number validation with 25 character limit
        if (!formData.idNumber.trim()) {
            errors.idNumber = "ID number is required.";
        } else if (formData.idNumber.length > 25) {
            errors.idNumber = "ID number must not exceed 25 characters.";
        }

        if (idFiles.length === 0) {
            errors.idFiles = "Please upload the front and back photos of your valid ID.";
        } else {
            const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
            const hasInvalidType = idFiles.some((f) => !allowedTypes.includes(f.type));
            const hasTooLarge = idFiles.some((f) => f.size > 5 * 1024 * 1024);
            if (hasInvalidType) {
                errors.idFiles = "Only JPG, JPEG, PNG, and WEBP files are allowed.";
            } else if (hasTooLarge) {
                errors.idFiles = "Each image must not exceed 5 MB.";
            } else if (idFiles.length < 2) {
                errors.idFiles = "Please upload both the front and back of your ID.";
            }
        }

        return errors;
    };

    useEffect(() => {
        const errors = validateForm();
        setFieldErrors(errors);
  
    }, [formData, idFiles, userType]);

    const isFormValid = Object.keys(fieldErrors).length === 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError("");

        const errors = validateForm();

        if (Object.keys(errors).length > 0) {
  
            setTouched((prev) => {
                const all = { ...prev };
                Object.keys(formData).forEach((k) => {
                    all[k] = true;
                });
                all.idFiles = true;
                return all;
            });
            setFieldErrors(errors);
            setShowIncompleteModal(true);
            return;
        }

        setIsLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );
            const userId = userCredential.user.uid;

            let idImageUrls = [];
            if (idFiles.length > 0) {
                idImageUrls = await Promise.all(
                    idFiles.map((file) => uploadImage(file, "authentication/valid-ids")) //cloudinary
                );
            }

            await setDoc(doc(db, "users", userId), {
                email: formData.email,
                role: "resident",
                status: "pending",
                residentId: userId,
                createdAt: new Date().toISOString()
            });

            await setDoc(doc(db, "residents", userId), {
                firstName: formData.firstName,
                middleName: formData.middleName,
                lastName: formData.lastName,
                suffix: formData.suffix,
                contactNumber: `+63${formData.contactNumber}`,
                emergencyContactNumber: `+63${formData.emergencyContactNumber}`,
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
                idImageFrontUrl: idImageUrls[0] || "",
                idImageBackUrl: idImageUrls[1] || "",
                verificationStatus: "unverified",
                createdAt: new Date().toISOString()
            });

            setSuccess({
                show: true,
                message:
                    "Your account has been submitted for admin approval. You'll be able to sign in once your identity and residency have been verified.",
            });

        } catch (error) {
            console.error("Error during registration process:", error);

            if (error.code === "auth/email-already-in-use") {
                setTouched((prev) => ({ ...prev, email: true }));
                setFieldErrors((prev) => ({
                    ...prev,
                    email: "This email address is already in use. Please try a different email or log in.",
                }));
            } else {
                setSubmitError(error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    //end
    const getFieldStatus = (field) => {
        if (!touched[field]) return "default";

        if (field === "confirmPassword") {
            if (formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword) return "error";
            if (fieldErrors.confirmPassword) return "error";
            return "default";
        }
        if (field === "contactNumber" || field === "emergencyContactNumber") {
            const val = formData[field];
            if (val.length > 0 && !/^9\d{9}$/.test(val)) {
                const isPossiblyStillTyping = val.length < 10 && /^9?\d*$/.test(val);
                if (!isPossiblyStillTyping) return "error";
            }
            if (fieldErrors[field]) return "error";
            return "default";
        }
        if (field === "email") {
            const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
            if (formData.email.length > 0 && formData.email.includes("@") && formData.email.includes(".") && !emailRegex.test(formData.email)) {
                return "error";
            }
            if (fieldErrors.email) return "error";
            return "default";
        }

        if (fieldErrors[field]) return "error";
        return "default";
    };

    const inputClasses = (field, extra = "") => {
        const status = getFieldStatus(field);
        const base = `w-full border rounded-lg pr-10 py-2 text-sm focus:outline-none focus:ring-2 transition-colors duration-200 ${extra}`;
        if (status === "error") return `${base} border-red-400 focus:ring-red-100 focus:border-red-500`;
        return `${base} border-gray-300 focus:ring-primary/40 focus:border-primary`;
    };

    const FieldStatusIcon = ({ field }) => {
        const status = getFieldStatus(field);
        if (status === "error") {
            return (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold leading-none">!</span>
                </span>
            );
        }
        return null;
    };

    const FieldError = ({ field }) => {
        if (!touched[field] || !fieldErrors[field]) return null;
        return <p className="text-xs text-red-500 font-medium mt-0.5">{fieldErrors[field]}</p>;
    };

    return (

        <div className="relative">

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
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                            style={{ backgroundImage: `url(${signUpImage})` }}
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

                {/* Right Column - Fixed layout for wider width and scrollbar at edge */}
                <div className="col-span-1 md:col-span-7 lg:col-span-7 flex flex-col justify-center items-center px-4 pt-24 pb-12 sm:px-6 sm:pt-28 md:px-6 lg:px-8 bg-white h-full overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="max-w-2xl w-full mx-auto"
                    ></motion.div>

                    <div className="flex-shrink-0 w-full text-left max-w-2xl mx-auto pl-1">
                        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-secondary font-heading">
                            Sign Up
                        </h1>
                        <p className="text-sm font-medium mt-1 mb-6 text-primary">
                            If you are a resident, register now!
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4 max-w-2xl w-full flex-shrink-0">
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
                        className="flex flex-col w-full max-w-2xl mx-auto md:mx-0 overflow-y-auto flex-grow space-y-6 scrollbar-thin transition-all duration-300 pr-2"
                        style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#f3f4f6',
                        }}
                    >

                        <style dangerouslySetInnerHTML={{
                            __html: `
                                form::-webkit-scrollbar {
                                    width: 8px;
                                    background: transparent;
                                }
                                form::-webkit-scrollbar-track {
                                    background: #f1f1f1;
                                    border-radius: 4px;
                                }
                                form::-webkit-scrollbar-thumb {
                                    background: #c1c1c1;
                                    border-radius: 4px;
                                }
                                form::-webkit-scrollbar-thumb:hover {
                                    background: #a8a8a8;
                                }
                            `
                        }} />

                        <div className="pt-2">
                            <span className="bg-gray-100 text-primary text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded">
                                {getAccountTypeLabel()}
                            </span>
                        </div>

                        {submitError && (
                            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-red-600 font-medium">{submitError}</p>
                            </div>
                        )}

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={userType}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold tracking-wider text-secondary uppercase">
                                        Personal Information
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label htmlFor="firstName" className="text-xs font-semibold text-gray-600">First name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input id="firstName" value={formData.firstName} onChange={handleInputChange} type="text" placeholder="Juan" className={inputClasses("firstName", "pl-10")} />
                                                <FieldStatusIcon field="firstName" />
                                            </div>
                                            <FieldError field="firstName" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label htmlFor="middleName" className="text-xs font-semibold text-gray-600">Middle name <span className="text-gray-400 font-normal">(optional)</span></label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input id="middleName" value={formData.middleName} onChange={handleInputChange} type="text" placeholder="Santos" className={inputClasses("middleName", "pl-10")} />
                                                <FieldStatusIcon field="middleName" />
                                            </div>
                                            <FieldError field="middleName" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="col-span-2 flex flex-col gap-1.5">
                                            <label htmlFor="lastName" className="text-xs font-semibold text-gray-600">Last name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input id="lastName" value={formData.lastName} onChange={handleInputChange} type="text" placeholder="Dela Cruz" className={inputClasses("lastName", "pl-10")} />
                                                <FieldStatusIcon field="lastName" />
                                            </div>
                                            <FieldError field="lastName" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label htmlFor="suffix" className="text-xs font-semibold text-gray-600">Suffix <span className="text-gray-400 font-normal">(optional)</span></label>
                                            <div className="relative">
                                                <select
                                                    id="suffix"
                                                    value={formData.suffix}
                                                    onChange={handleInputChange}
                                                    className={inputClasses("suffix", "px-3 bg-white appearance-none cursor-pointer")}
                                                >
                                                    <option value="">None</option>
                                                    <option value="Jr.">Jr.</option>
                                                    <option value="Sr.">Sr.</option>
                                                    <option value="II">II</option>
                                                    <option value="III">III</option>
                                                    <option value="IV">IV</option>
                                                    <option value="V">V</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="email" className="text-xs font-semibold text-gray-600">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input id="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="example@gmail.com" className={inputClasses("email", "pl-10")} />
                                            <FieldStatusIcon field="email" />
                                        </div>
                                        <FieldError field="email" />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="contactNumber" className="text-xs font-semibold text-gray-600">Contact Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                                            <span className="absolute left-9 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 pointer-events-none">+63</span>
                                            <input 
                                                id="contactNumber" 
                                                value={formatPhoneNumber(formData.contactNumber)} 
                                                onChange={handleInputChange} 
                                                type="text" 
                                                inputMode="numeric" 
                                                maxLength={14} 
                                                placeholder="917 123 4567" 
                                                className={inputClasses("contactNumber", "pl-16")} 
                                            />
                                            <FieldStatusIcon field="contactNumber" />
                                        </div>
                                        <FieldError field="contactNumber" />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="emergencyContactNumber" className="text-xs font-semibold text-gray-600">Emergency Contact Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                                            <span className="absolute left-9 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 pointer-events-none">+63</span>
                                            <input 
                                                id="emergencyContactNumber" 
                                                value={formatPhoneNumber(formData.emergencyContactNumber)} 
                                                onChange={handleInputChange} 
                                                type="text" 
                                                inputMode="numeric" 
                                                maxLength={14} 
                                                placeholder="917 123 4567" 
                                                className={inputClasses("emergencyContactNumber", "pl-16")} 
                                            />
                                            <FieldStatusIcon field="emergencyContactNumber" />
                                        </div>
                                        <FieldError field="emergencyContactNumber" />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-gray-400" /> Address Location
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex flex-col gap-1">
                                                <div className="relative">
                                                    <input id="block" value={formData.block} onChange={handleInputChange} type="text" placeholder="(Block 1)" className={inputClasses("block", "px-3")} />
                                                    <FieldStatusIcon field="block" />
                                                </div>
                                                <FieldError field="block" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <div className="relative">
                                                    <input id="lot" value={formData.lot} onChange={handleInputChange} type="text" placeholder="(Lot 9)" className={inputClasses("lot", "px-3")} />
                                                    <FieldStatusIcon field="lot" />
                                                </div>
                                                <FieldError field="lot" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex flex-col gap-1">
                                                <div className="relative">
                                                    <input id="phase" value={formData.phase} onChange={handleInputChange} type="text" placeholder="Phase 1" className={inputClasses("phase", "px-3")} />
                                                    <FieldStatusIcon field="phase" />
                                                </div>
                                                <FieldError field="phase" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <div className="relative">
                                                    <input id="street" value={formData.street} onChange={handleInputChange} type="text" placeholder="Example Street" className={inputClasses("street", "px-3")} />
                                                    <FieldStatusIcon field="street" />
                                                </div>
                                                <FieldError field="street" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

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
                                                    <input id="leaseStart" value={formData.leaseStart} onChange={handleInputChange} type="date" className={inputClasses("leaseStart", "pl-10")} />
                                                    <FieldStatusIcon field="leaseStart" />
                                                </div>
                                                <FieldError field="leaseStart" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label htmlFor="leaseEnd" className="text-xs font-semibold text-gray-600">Lease End Date</label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input id="leaseEnd" value={formData.leaseEnd} onChange={handleInputChange} type="date" className={inputClasses("leaseEnd", "pl-10")} />
                                                    <FieldStatusIcon field="leaseEnd" />
                                                </div>
                                                <FieldError field="leaseEnd" />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <label htmlFor="ownerFullName" className="text-xs font-semibold text-gray-600">Owner's Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input id="ownerFullName" value={formData.ownerFullName} onChange={handleInputChange} type="text" placeholder="Enter the owner of the property" className={inputClasses("ownerFullName", "pl-10")} />
                                                <FieldStatusIcon field="ownerFullName" />
                                            </div>
                                            <FieldError field="ownerFullName" />
                                        </div>
                                    </div>
                                )}

                                {userType === "household" && (
                                    <div className="space-y-4 pt-2 border-t border-gray-100">
                                        <h3 className="text-xs font-bold tracking-wider text-secondary uppercase">
                                            Household Association
                                        </h3>

                                        <div className="flex flex-col gap-1.5">
                                            <label htmlFor="homeownerName" className="text-xs font-semibold text-gray-600">Homeowner Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input id="homeownerName" value={formData.homeownerName} onChange={handleInputChange} type="text" placeholder="Enter the primary homeowner's name" className={inputClasses("homeownerName", "pl-10")} />
                                                <FieldStatusIcon field="homeownerName" />
                                            </div>
                                            <FieldError field="homeownerName" />
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <label htmlFor="relationshipToHomeowner" className="text-xs font-semibold text-gray-600">Relationship to Homeowner</label>
                                            <div className="relative">
                                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <select
                                                    id="relationshipToHomeowner"
                                                    value={formData.relationshipToHomeowner}
                                                    onChange={handleInputChange}
                                                    className={inputClasses("relationshipToHomeowner", "pl-10 bg-white appearance-none cursor-pointer")}
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
                                            </div>
                                            <FieldError field="relationshipToHomeowner" />
                                        </div>

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
                                                        <input id="otherRelationship" value={formData.otherRelationship} onChange={handleInputChange} type="text" placeholder="e.g. Cousin, Aunt, Guardian" className={inputClasses("otherRelationship", "pl-10")} />
                                                        <FieldStatusIcon field="otherRelationship" />
                                                    </div>
                                                    <FieldError field="otherRelationship" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

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
                                                className={inputClasses("password", "pl-10 pr-10")}
                                            />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <FieldError field="password" />

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
                                                className={inputClasses("confirmPassword", "pl-10 pr-10")}
                                            />
                                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {touched.confirmPassword && fieldErrors.confirmPassword ? (
                                            <FieldError field="confirmPassword" />
                                        ) : formData.confirmPassword.length > 0 ? (
                                            formData.password === formData.confirmPassword ? (
                                                <p className="text-xs mt-1 font-medium text-green-600">
                                                    ✓ Passwords match
                                                </p>
                                            ) : (
                                                <p className="text-xs mt-1 font-medium text-red-500">
                                                    ✗ Passwords do not match
                                                </p>
                                            )
                                        ) : null}
                                    </div>
                                </div>


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
                                                className={inputClasses("idType", "pl-10 bg-white appearance-none cursor-pointer")}
                                            >
                                                <option value="">Select Valid ID</option>
                                                {userType === "owner" && <option value="wwhs-owner">Homeowners - Green WWHS ID</option>}
                                                {userType === "renter" && <option value="wwhs-renter">Renter - Yellow WWHS ID</option>}
                                                {userType === "household" && <option value="wwhs-household">Occupant/Household Member - White WWHS ID</option>}
                                                <option value="passport">Passport</option>
                                                <option value="drivers">Driver's License</option>
                                                <option value="national">National ID / UMID</option>
                                                <option value="Other">Other (Please specify)</option>
                                            </select>
                                        </div>
                                        <FieldError field="idType" />
                                    </div>

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
                                                    <input id="otherIdType" value={formData.otherIdType} onChange={handleInputChange} type="text" placeholder="e.g. SSS, TIN, Company ID" className={inputClasses("otherIdType", "pl-10")} />
                                                    <FieldStatusIcon field="otherIdType" />
                                                </div>
                                                <FieldError field="otherIdType" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Updated ID Number input with character counter */}
                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="idNumber" className="text-xs font-semibold text-gray-600">ID Number</label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input 
                                                id="idNumber" 
                                                value={formData.idNumber} 
                                                onChange={handleInputChange} 
                                                type="text" 
                                                placeholder="Enter ID Number (max 25 characters)" 
                                                maxLength={25}
                                                className={inputClasses("idNumber", "pl-10 pr-16")} 
                                            />
                                            <FieldStatusIcon field="idNumber" />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-medium">
                                                {formData.idNumber.length}/25
                                            </span>
                                        </div>
                                        <FieldError field="idNumber" />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-gray-600">Upload Valid ID (Front & Back)</label>

                                        {idFiles.length < 2 && (
                                            <label
                                                onDragOver={handleDragOver}
                                                onDragEnter={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                                onDrop={handleDrop}
                                                className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors duration-200 ${
                                                isDraggingFile
                                                    ? "border-primary bg-primary/5"
                                                    : touched.idFiles && fieldErrors.idFiles
                                                        ? "border-red-400 bg-gray-50/50 hover:bg-gray-50"
                                                        : "border-gray-300 bg-gray-50/50 hover:bg-gray-50"
                                            }`}>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />
                                                <Upload className={`w-5 h-5 ${isDraggingFile ? "text-primary" : touched.idFiles && fieldErrors.idFiles ? "text-red-400" : "text-gray-400"}`} />
                                                <span className="text-xs text-gray-600 font-medium">
                                                    {isDraggingFile
                                                        ? "Drop your photo here"
                                                        : idFiles.length === 0
                                                            ? "Click to upload or drag the front photo"
                                                            : "Click to upload or drag the back photo"}
                                                </span>
                                                <span className="text-[10px] text-gray-400">2 photos max (front &amp; back) · 5MB each</span>
                                            </label>
                                        )}

                                        {idFiles.length > 0 && (
                                            <div className="space-y-2 mt-1">
                                                {idFiles.map((file, index) => (
                                                    <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50/50">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <Image className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                            <span className="text-xs text-gray-600 font-medium truncate">
                                                                {index === 0 ? "Front: " : "Back: "}{file.name}
                                                            </span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeIdFile(index)}
                                                            className="text-gray-400 hover:text-red-500 flex-shrink-0 cursor-pointer"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <FieldError field="idFiles" />
                                    </div>

                                    <p className="text-[11px] text-gray-500 italic mt-1">
                                        * Your account will be reviewed by the admin before activation.
                                    </p>
                                </div>

                                <div className="pt-2 pb-6">
                                    <button
                                        type="submit"
                                        disabled={isLoading || !isFormValid}
                                        className={`w-full font-semibold py-3 rounded-full shadow-sm transition-all duration-200 ${isLoading
                                            ? "bg-gray-400 text-white cursor-not-allowed"
                                            : !isFormValid
                                                ? "bg-primary/15 text-primary/50 cursor-not-allowed"
                                                : "bg-primary text-white hover:brightness-110 cursor-pointer"
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
            </div>

            <SuccessModal
                isOpen={success.show}
                message={success.message}
                onClose={() => {
                    setSuccess({ show: false, message: "" });
                    navigate("/login");
                }}
            />

            <IncompleteModal
                isOpen={showIncompleteModal}
                onClose={() => setShowIncompleteModal(false)}
            />
        </div>
    );
}

export default SignUp;