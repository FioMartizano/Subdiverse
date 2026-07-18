import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, User, Phone, MapPin, Lock, Eye, EyeOff, Calendar, ShieldCheck, CreditCard, Image, Users, Upload, FileText, AlertCircle, X, Check } from "lucide-react";
import { initializeApp, getApps } from "firebase/app";
import {
    getAuth,
    createUserWithEmailAndPassword,
    deleteUser,
    signOut,
    signInWithPopup,
    GoogleAuthProvider,
    sendEmailVerification,
    EmailAuthProvider,
    linkWithCredential,
} from "firebase/auth";
import { getFirestore, doc, getDoc, writeBatch } from "firebase/firestore";
import signUpImage from "../../assets/signUp.jpg";
import { uploadImage } from "../../services/cloudinary"; //add this to link cloudinary.js
import { useNavigate } from "react-router-dom";

const signupFirebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const signupApp =
    getApps().find((app) => app.name === "signupApp") ||
    initializeApp(signupFirebaseConfig, "signupApp");

const signupAuth = getAuth(signupApp);
const signupDb = getFirestore(signupApp);

/*
 * GOOGLE SIGN-UP PROVIDER
 *
 * Google verifies the user's identity and prefills their email/name.
 * The resident must still create a Subdiverse password and complete
 * all HOA registration requirements. Google and password credentials
 * are linked to one Firebase UID.
 */
const signupGoogleProvider = new GoogleAuthProvider();
signupGoogleProvider.setCustomParameters({
    prompt: "select_account",
});

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
    const [idFrontFile, setIdFrontFile] = useState(null);
    const [idBackFile, setIdBackFile] = useState(null);
    const [isDraggingFile, setIsDraggingFile] = useState(null); // "front", "back", or null
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    /*
     * signupMethod:
     * - "password" = normal email/password registration
     * - "google"   = Google verified the email; a password will also be
     *                linked so the resident can use either login method
     */
    const [signupMethod, setSignupMethod] = useState("password");
    const [googleSignupAccount, setGoogleSignupAccount] = useState(null);

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

    const handleIdFileSelected = (side, fileList) => {
        const file = Array.from(fileList || [])[0];
        if (!file) return;

        setTouched((prev) => ({
            ...prev,
            [side === "front" ? "idFrontFile" : "idBackFile"]: true,
        }));

        if (side === "front") {
            setIdFrontFile(file);
        } else {
            setIdBackFile(file);
        }
    };

    const handleFileChange = (side, e) => {
        handleIdFileSelected(side, e.target.files);
        e.target.value = "";
    };

    const handleDragOver = (side, e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingFile(side);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingFile(null);
    };

    const handleDrop = (side, e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingFile(null);
        handleIdFileSelected(side, e.dataTransfer.files);
    };

    const removeIdFile = (side) => {
        if (side === "front") {
            setIdFrontFile(null);
        } else {
            setIdBackFile(null);
        }
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

        /*
         * Every resident creates a Subdiverse password.
         *
         * For normal signup, Firebase creates a password account.
         * For Google signup, this password is linked to the verified
         * Google account so both methods share the same UID.
         */
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

        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

        if (!idFrontFile) {
            errors.idFrontFile = "Please upload the front photo of your valid ID.";
        } else if (!allowedTypes.includes(idFrontFile.type)) {
            errors.idFrontFile = "Only JPG, JPEG, PNG, and WEBP files are allowed.";
        } else if (idFrontFile.size > 5 * 1024 * 1024) {
            errors.idFrontFile = "The front ID image must not exceed 5 MB.";
        }

        if (!idBackFile) {
            errors.idBackFile = "Please upload the back photo of your valid ID.";
        } else if (!allowedTypes.includes(idBackFile.type)) {
            errors.idBackFile = "Only JPG, JPEG, PNG, and WEBP files are allowed.";
        } else if (idBackFile.size > 5 * 1024 * 1024) {
            errors.idBackFile = "The back ID image must not exceed 5 MB.";
        }

        return errors;
    };

    useEffect(() => {
        const errors = validateForm();
        setFieldErrors(errors);
  
    }, [formData, idFrontFile, idBackFile, userType, signupMethod]);

    const isFormValid = Object.keys(fieldErrors).length === 0;

    const stepFields = {
        1: ["email", "password", "confirmPassword"],
        2: [
            "firstName",
            "lastName",
            "contactNumber",
            "emergencyContactNumber",
            ...(userType === "renter"
                ? ["ownerFullName", "leaseStart", "leaseEnd"]
                : []),
            ...(userType === "household"
                ? ["homeownerName", "relationshipToHomeowner", "otherRelationship"]
                : []),
        ],
        3: ["block", "lot", "street", "phase"],
        4: ["idType", "otherIdType", "idNumber", "idFrontFile", "idBackFile"],
    };

    const validateCurrentStep = () => {
        const errors = validateForm();
        const fields = stepFields[currentStep] || [];
        const stepErrors = {};

        fields.forEach((field) => {
            if (errors[field]) {
                stepErrors[field] = errors[field];
            }
        });

        setFieldErrors(errors);

        if (Object.keys(stepErrors).length > 0) {
            setTouched((prev) => {
                const next = { ...prev };
                fields.forEach((field) => {
                    next[field] = true;
                });
                return next;
            });
            return false;
        }

        return true;
    };

    const goToNextStep = () => {
        if (!validateCurrentStep()) return;
        setCurrentStep((prev) => Math.min(prev + 1, 4));
    };

    const goToPreviousStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const isCurrentStepValid = () => {
        const errors = validateForm();
        const fields = stepFields[currentStep] || [];
        return !fields.some((field) => Boolean(errors[field]));
    };


    /*
     * SIGN UP WITH GOOGLE
     *
     * This authenticates the Google account but DOES NOT submit
     * the resident registration yet. It prefills identity fields,
     * then the resident creates a password and completes the form.
     */
    const handleGoogleSignup = async () => {
        setSubmitError("");
        setIsGoogleLoading(true);

        try {
            const result = await signInWithPopup(
                signupAuth,
                signupGoogleProvider
            );

            const googleUser = result.user;

            /*
             * Confirm that Firebase authenticated this user through Google
             * and that Google supplied a verified email address.
             */
            const isVerifiedGoogleAccount =
                googleUser.emailVerified &&
                googleUser.providerData.some(
                    (provider) =>
                        provider.providerId === "google.com"
                );

            if (
                !isVerifiedGoogleAccount ||
                !googleUser.email
            ) {
                await signOut(signupAuth);
                setSubmitError(
                    "Google could not verify this account or email address. Please choose a valid Google account."
                );
                return;
            }

            /*
             * Do not let an already registered account create another
             * Firestore profile using the same Firebase UID.
             */
            const existingUserSnap = await getDoc(
                doc(signupDb, "users", googleUser.uid)
            );

            if (existingUserSnap.exists()) {
                await signOut(signupAuth);

                setSubmitError(
                    "This Google account is already registered. Please go to Login and choose Continue with Google."
                );
                return;
            }

            const displayNameParts = String(
                googleUser.displayName || ""
            )
                .trim()
                .split(/\s+/)
                .filter(Boolean);

            const suggestedFirstName =
                displayNameParts[0] || "";

            const suggestedLastName =
                displayNameParts.length > 1
                    ? displayNameParts
                          .slice(1)
                          .join(" ")
                    : "";

            setSignupMethod("google");

            setGoogleSignupAccount({
                uid: googleUser.uid,
                email: googleUser.email || "",
                displayName: googleUser.displayName || "",
            });

            /*
             * Prefill only empty name fields so the resident can still
             * correct how their name should appear in HOA records.
             */
            setFormData((prev) => ({
                ...prev,
                email: googleUser.email || prev.email,
                firstName:
                    prev.firstName ||
                    suggestedFirstName,
                lastName:
                    prev.lastName ||
                    suggestedLastName,
                password: "",
                confirmPassword: "",
            }));

            setTouched((prev) => ({
                ...prev,
                email: true,
            }));
        } catch (error) {
            console.error("Google sign-up error:", {
                code: error.code,
                message: error.message,
                email: error.customData?.email,
            });

            if (
                error.code ===
                "auth/popup-closed-by-user"
            ) {
                setSubmitError(
                    "Google sign-up was closed before it finished."
                );
            } else if (
                error.code === "auth/popup-blocked"
            ) {
                setSubmitError(
                    "The Google sign-up popup was blocked. Please allow popups and try again."
                );
            } else if (
                error.code ===
                "auth/account-exists-with-different-credential"
            ) {
                setSubmitError(
                    "This email is already registered using email and password. Please log in using that method."
                );
            } else if (
                error.code ===
                "auth/network-request-failed"
            ) {
                setSubmitError(
                    "Network error. Please check your connection and try again."
                );
            } else {
                setSubmitError(
                    "Google sign-up could not be completed. Please try again."
                );
            }
        } finally {
            setIsGoogleLoading(false);
        }
    };

    /*
     * Lets the resident switch back to the normal password signup flow
     * before submitting their registration.
     */
    const handleUsePasswordSignup = async () => {
        try {
            if (
                signupMethod === "google" &&
                signupAuth.currentUser
            ) {
                await signOut(signupAuth);
            }
        } catch (error) {
            console.error(
                "Could not sign out Google signup account:",
                error
            );
        }

        setSignupMethod("password");
        setGoogleSignupAccount(null);

        setFormData((prev) => ({
            ...prev,
            email: "",
            password: "",
            confirmPassword: "",
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError("");

        const errors = validateForm();

        if (Object.keys(errors).length > 0) {
            setTouched((prev) => {
                const all = { ...prev };

                Object.keys(formData).forEach((key) => {
                    all[key] = true;
                });

                all.idFrontFile = true;
                all.idBackFile = true;
                return all;
            });

            setFieldErrors(errors);
            setShowIncompleteModal(true);
            return;
        }

        setIsLoading(true);

        let createdUser = null;
        let profileCreated = false;
        let failedStep = "creating the Firebase Authentication account";

        try {
            /*
             * AUTH METHOD:
             *
             * Password signup creates a new password account.
             * Google signup reuses the verified Google user and links the
             * resident's Subdiverse password to that same Firebase UID.
             */
            if (signupMethod === "google") {
                if (
                    !googleSignupAccount ||
                    !signupAuth.currentUser ||
                    signupAuth.currentUser.uid !==
                        googleSignupAccount.uid
                ) {
                    throw new Error(
                        "Your Google sign-up session expired. Please choose your Google account again."
                    );
                }

                createdUser = signupAuth.currentUser;

                const registrationEmail = String(
                    createdUser.email ||
                    googleSignupAccount.email
                ).trim();

                const alreadyHasPasswordProvider =
                    createdUser.providerData.some(
                        (provider) =>
                            provider.providerId === "password"
                    );

                /*
                 * This check makes retries safe. If an upload or Firestore
                 * write failed after linking, the next submit will not try
                 * to link the password provider a second time.
                 */
                if (!alreadyHasPasswordProvider) {
                    failedStep =
                        "linking the Subdiverse password to the Google account";

                    const passwordCredential =
                        EmailAuthProvider.credential(
                            registrationEmail,
                            formData.password
                        );

                    const linkedUserCredential =
                        await linkWithCredential(
                            createdUser,
                            passwordCredential
                        );

                    createdUser =
                        linkedUserCredential.user;

                    await createdUser.reload();
                }
            } else {
                const userCredential =
                    await createUserWithEmailAndPassword(
                        signupAuth,
                        formData.email.trim(),
                        formData.password
                    );

                createdUser = userCredential.user;
            }

            const userId = createdUser.uid;
            const registrationEmail = String(
                createdUser.email ||
                formData.email
            ).trim();

            await createdUser.getIdToken(true);

            console.log("Created signup UID:", createdUser.uid);
            console.log(
                "Signup Auth current UID:",
                signupAuth.currentUser?.uid
            );
            console.log("Firestore document UID:", userId);

            failedStep = "uploading the valid ID images";

            const [idImageFrontUrl, idImageBackUrl] = await Promise.all([
                uploadImage(
                    idFrontFile,
                    "authentication/valid-ids"
                ),
                uploadImage(
                    idBackFile,
                    "authentication/valid-ids"
                ),
            ]);

            /*
             * Refresh once more immediately before the first Firestore write.
             * This keeps the registration request authenticated.
             */
            await createdUser.getIdToken(true);

            console.log(
                "UID immediately before users write:",
                signupAuth.currentUser?.uid
            );

            failedStep = "creating the users and residents documents";
            console.log("Attempting atomic profile write...");

            /*
             * Save both documents in one Firestore batch. If either write is
             * rejected, neither document is created. This prevents partial
             * registrations such as a users document without a resident record.
             */
            const registrationBatch = writeBatch(signupDb);
            const userDocRef = doc(
                signupDb,
                "users",
                userId
            );
            const residentDocRef = doc(
                signupDb,
                "residents",
                userId
            );

            //from status to accountStatus (since may verificationStatus, para d malito)
            registrationBatch.set(userDocRef, {
                email: registrationEmail,
                role: "resident",
                accountStatus: "pending",
                residentId: userId,
                createdAt: new Date().toISOString(),
            });

            registrationBatch.set(residentDocRef, {
                firstName: formData.firstName.trim(),
                middleName: formData.middleName.trim(),
                lastName: formData.lastName.trim(),
                suffix: formData.suffix,

                contactNumber:
                    `+63${formData.contactNumber}`,
                emergencyContactNumber:
                    `+63${formData.emergencyContactNumber}`,

                email: registrationEmail,

                block: formData.block.trim(),
                lot: formData.lot.trim(),
                street: formData.street.trim(),
                phase: formData.phase.trim(),

                residentCategory: userType,

                ...(userType === "renter" && {
                    leaseStart: formData.leaseStart,
                    leaseEnd: formData.leaseEnd,
                    propertyOwnerName:
                        formData.ownerFullName.trim(),
                }),

                ...(userType === "household" && {
                    homeownerName:
                        formData.homeownerName.trim(),
                    relationshipToHomeowner:
                        formData.relationshipToHomeowner,
                    otherRelationship:
                        formData.relationshipToHomeowner === "Other"
                            ? formData.otherRelationship.trim()
                            : "",
                }),

                idType:
                    formData.idType === "Other"
                        ? formData.otherIdType.trim()
                        : formData.idType,

                idNumber: formData.idNumber.trim(),

                idImageFrontUrl:
                    idImageFrontUrl || "",
                idImageBackUrl:
                    idImageBackUrl || "",

                verificationStatus: "unverified",
                createdAt: new Date().toISOString(),
            });

            await registrationBatch.commit();
            profileCreated = true;

            console.log(
                "Users and residents documents successfully created."
            );

            /*
             * Normal password signup must prove ownership through an
             * email-verification link. Google signup is already email-verified,
             * and its linked password inherits the same verified Firebase user.
             */
            let verificationEmailSent = true;

            if (signupMethod === "password") {
                failedStep = "sending the email verification link";

                try {
                    await sendEmailVerification(createdUser);
                    console.log(
                        "Email verification link sent."
                    );
                } catch (verificationError) {
                    verificationEmailSent = false;
                    console.error(
                        "Could not send verification email:",
                        verificationError
                    );
                }
            }

            failedStep = "signing the pending account out";

            try {
                await signOut(signupAuth);
            } catch (signOutError) {
                console.error(
                    "Could not sign out after registration:",
                    signOutError
                );
            }

            const successMessage =
                signupMethod === "google"
                    ? "Your Google account and Subdiverse password were linked successfully. Your resident registration was submitted for HOA approval. After activation, you can log in using either Continue with Google or your email and password."
                    : verificationEmailSent
                        ? "Your resident registration was submitted. We sent a verification link to your email. Verify your email first, then wait for HOA approval before logging in."
                        : "Your resident registration was submitted, but the verification email could not be sent. Try logging in again to request another verification link, then wait for HOA approval.";

            setSuccess({
                show: true,
                message: successMessage,
            });
        } catch (error) {
            console.error(
                `Registration failed while ${failedStep}:`,
                error
            );

            /*
             * Remove an incomplete Authentication account so the same email
             * can be used again after a failed registration.
             */
            /*
             * For password signup, remove the incomplete Auth user so the
             * resident can retry with the same email.
             *
             * For Google signup, keep the authenticated linked account so
             * the resident can correct the form/upload problem and resubmit.
             */
            if (
                signupMethod === "password" &&
                !profileCreated &&
                createdUser &&
                signupAuth.currentUser?.uid ===
                    createdUser.uid
            ) {
                try {
                    await deleteUser(createdUser);

                    console.log(
                        "Incomplete password signup account removed."
                    );
                } catch (deleteError) {
                    console.error(
                        "Could not remove incomplete signup account:",
                        deleteError
                    );
                }
            }

            if (
                error.code ===
                "auth/email-already-in-use"
            ) {
                setTouched((prev) => ({
                    ...prev,
                    email: true,
                }));

                setFieldErrors((prev) => ({
                    ...prev,
                    email:
                        "This email address is already in use. Please try a different email or log in.",
                }));

                setSubmitError(
                    "An account with this email already exists."
                );
            } else if (
                error.code === "auth/invalid-email"
            ) {
                setSubmitError(
                    "The email address is invalid."
                );
            } else if (
                error.code === "auth/weak-password"
            ) {
                setSubmitError(
                    "The password does not meet Firebase's requirements."
                );
            } else if (
                error.code ===
                "auth/provider-already-linked"
            ) {
                setSubmitError(
                    "A password is already linked to this Google account. Please try submitting the registration again."
                );
            } else if (
                error.code ===
                "auth/credential-already-in-use"
            ) {
                setSubmitError(
                    "This password credential is already connected to another Firebase account. Please use a different Google account or log in using the existing account."
                );
            } else if (
                error.code ===
                "auth/network-request-failed"
            ) {
                setSubmitError(
                    "Network connection failed. Please check your internet and try again."
                );
            } else if (
                error.code === "permission-denied"
            ) {
                setSubmitError(
                    `Firestore denied the request while ${failedStep}. Check that your published rules allow an authenticated user to create users/{uid} and residents/{uid}.`
                );
            } else {
                setSubmitError(
                    error.message ||
                        `Registration failed while ${failedStep}. Please try again.`
                );
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

    const steps = [
        { number: 1, label: "Account" },
        { number: 2, label: "Profile" },
        { number: 3, label: "Residence" },
        { number: 4, label: "Verify" },
    ];

    return (
        <div className="relative min-h-screen bg-white">
            <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-12">
                {/* Left visual panel */}
                <div className="hidden lg:block lg:col-span-5 p-4 min-h-screen">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        className="sticky top-4 h-[calc(100vh-2rem)] rounded-[28px] overflow-hidden relative shadow-xl bg-slate-900"
                    >
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${signUpImage})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/15" />

                        <div className="relative z-10 h-full flex flex-col justify-between p-10">
                            <span className="text-white/50 text-3xl select-none"></span>

                            <div className="max-w-md space-y-4">
                                <span className="inline-flex items-center rounded-full bg-white/10 backdrop-blur px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
                                    Windward Hills Community
                                </span>
                                <h2 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.05] text-white">
                                    One account for your community life.
                                </h2>
                                <p className="text-sm leading-6 text-white/70">
                                    Register once, stay connected, and access resident services through Subdiverse.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right form panel */}
                <div className="col-span-1 lg:col-span-7 min-h-screen flex justify-center px-5 sm:px-8 lg:px-12 xl:px-20 py-10 lg:py-14">
                    <div className="w-full max-w-3xl">
                        <div className="mb-8">
                            <span className="text-primary text-2xl block mb-4 select-none"></span>
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-secondary font-heading">
                                Create your account
                            </h1>
                            <p className="text-sm text-gray-500 mt-2">
                                Complete your resident registration in a few simple steps.
                            </p>
                        </div>

                        {/* Modern stepper */}
                        <div className="mb-10">
                            <div className="flex items-center">
                                {steps.map((step, index) => {
                                    const isActive = currentStep === step.number;
                                    const isComplete = currentStep > step.number;

                                    return (
                                        <div
                                            key={step.number}
                                            className={`flex items-center ${index < steps.length - 1 ? "flex-1" : ""}`}
                                        >
                                            <div className="flex flex-col items-center gap-2 min-w-fit">
                                                <div
                                                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                                        isComplete
                                                            ? "bg-primary text-white"
                                                            : isActive
                                                                ? "bg-secondary text-white ring-4 ring-secondary/10"
                                                                : "bg-gray-100 text-gray-400"
                                                    }`}
                                                >
                                                    {isComplete ? (
                                                        <Check className="w-4 h-4" strokeWidth={3} />
                                                    ) : (
                                                        String(step.number).padStart(2, "0")
                                                    )}
                                                </div>
                                                <span
                                                    className={`hidden sm:block text-[11px] font-semibold ${
                                                        isActive || isComplete
                                                            ? "text-secondary"
                                                            : "text-gray-400"
                                                    }`}
                                                >
                                                    {step.label}
                                                </span>
                                            </div>

                                            {index < steps.length - 1 && (
                                                <div
                                                    className={`h-px mx-3 sm:mx-5 flex-1 transition-colors ${
                                                        currentStep > step.number
                                                            ? "bg-primary"
                                                            : "bg-gray-200"
                                                    }`}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {submitError && (
                            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-6">
                                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-red-600 font-medium">{submitError}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ opacity: 0, x: 18 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -18 }}
                                    transition={{ duration: 0.2 }}
                                    className="rounded-[24px] border border-gray-200 bg-white shadow-sm p-5 sm:p-7"
                                >
                                    {/* STEP 1 */}
                                    {currentStep === 1 && (
                                        <div className="space-y-6">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                                                    Step 1 of 4
                                                </p>
                                                <h2 className="text-2xl font-bold text-secondary mt-2">
                                                    Choose how to continue
                                                </h2>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Use Google for a faster start, or register with your email.
                                                </p>
                                            </div>

                                            {signupMethod === "google" && googleSignupAccount ? (
                                                <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <p className="text-sm font-bold text-green-800">
                                                                Google account connected
                                                            </p>
                                                            <p className="text-sm text-green-700 mt-1">
                                                                {googleSignupAccount.email}
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={handleGoogleSignup}
                                                            disabled={isGoogleLoading || isLoading}
                                                            className="text-xs font-semibold text-primary hover:underline"
                                                        >
                                                            Use another
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={handleGoogleSignup}
                                                    disabled={isGoogleLoading || isLoading}
                                                    className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl py-3.5 font-semibold text-sm bg-white hover:bg-gray-50 transition"
                                                >
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                                                        <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.8z" />
                                                        <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.1C3.25 21.3 7.31 24 12 24z" />
                                                        <path fill="#FBBC05" d="M5.27 14.3c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3v-3.1H1.27C.46 8.24 0 10.06 0 12s.46 3.76 1.27 5.4l4-3.1z" />
                                                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.6l4 3.1C6.22 6.86 8.87 4.75 12 4.75z" />
                                                    </svg>
                                                    {isGoogleLoading ? "Connecting Google..." : "Continue with Google"}
                                                </button>
                                            )}

                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-px bg-gray-200" />
                                                <span className="text-[11px] text-gray-400 font-medium uppercase">
                                                    or use email
                                                </span>
                                                <div className="flex-1 h-px bg-gray-200" />
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <label htmlFor="email" className="text-xs font-semibold text-gray-600">
                                                        Email address
                                                    </label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                        <input
                                                            id="email"
                                                            value={formData.email}
                                                            onChange={handleInputChange}
                                                            type="email"
                                                            placeholder="you@example.com"
                                                            readOnly={signupMethod === "google"}
                                                            className={inputClasses(
                                                                "email",
                                                                signupMethod === "google"
                                                                    ? "pl-10 bg-gray-100 cursor-not-allowed"
                                                                    : "pl-10"
                                                            )}
                                                        />
                                                    </div>
                                                    <FieldError field="email" />
                                                </div>

                                                {signupMethod === "google" && (
                                                    <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
                                                        <p className="text-xs font-semibold text-blue-800">
                                                            Create a Subdiverse password
                                                        </p>
                                                        <p className="text-[11px] leading-5 text-blue-700 mt-1">
                                                            This gives you another way to sign in. After approval, you can use either Google or your email and Subdiverse password.
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="flex flex-col gap-1.5">
                                                        <label htmlFor="password" className="text-xs font-semibold text-gray-600">
                                                            Password
                                                        </label>
                                                        <div className="relative">
                                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                            <input
                                                                id="password"
                                                                type={showPassword ? "text" : "password"}
                                                                value={formData.password}
                                                                onChange={handleInputChange}
                                                                placeholder="At least 8 characters"
                                                                className={inputClasses("password", "pl-10 pr-10")}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                            >
                                                                {showPassword
                                                                    ? <EyeOff className="w-4 h-4" />
                                                                    : <Eye className="w-4 h-4" />}
                                                            </button>
                                                        </div>

                                                        <FieldError field="password" />

                                                        <div className="mt-2">
                                                            <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                                                                <div
                                                                    className={`h-full transition-all duration-300 ${
                                                                        passwordStrength === "Weak"
                                                                            ? "bg-red-500"
                                                                            : passwordStrength === "Medium"
                                                                                ? "bg-yellow-500"
                                                                                : "bg-green-500"
                                                                    }`}
                                                                    style={{ width: `${passwordScore}%` }}
                                                                />
                                                            </div>

                                                            <p
                                                                className={`text-xs mt-1 font-medium ${
                                                                    passwordStrength === "Weak"
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
                                                            <p className={formData.password.length >= 8 ? "text-green-600" : "text-gray-500"}>
                                                                At least 8 characters
                                                            </p>
                                                            <p className={/[A-Z]/.test(formData.password) ? "text-green-600" : "text-gray-500"}>
                                                                One uppercase letter
                                                            </p>
                                                            <p className={/[a-z]/.test(formData.password) ? "text-green-600" : "text-gray-500"}>
                                                                One lowercase letter
                                                            </p>
                                                            <p className={/[0-9]/.test(formData.password) ? "text-green-600" : "text-gray-500"}>
                                                                One number
                                                            </p>
                                                            <p className={/[^A-Za-z0-9]/.test(formData.password) ? "text-green-600" : "text-gray-500"}>
                                                                One special character
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-1.5">
                                                        <label htmlFor="confirmPassword" className="text-xs font-semibold text-gray-600">
                                                            Confirm password
                                                        </label>
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
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                            >
                                                                {showConfirmPassword
                                                                    ? <EyeOff className="w-4 h-4" />
                                                                    : <Eye className="w-4 h-4" />}
                                                            </button>
                                                        </div>
                                                        <FieldError field="confirmPassword" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 2 */}
                                    {currentStep === 2 && (
                                        <div className="space-y-6">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                                                    Step 2 of 4
                                                </p>
                                                <h2 className="text-2xl font-bold text-secondary mt-2">
                                                    Tell us about yourself
                                                </h2>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Select your resident type and complete your profile details.
                                                </p>
                                            </div>

                                            <div>
                                                <label className="text-xs font-semibold text-gray-600">
                                                    I am a...
                                                </label>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                                                    {[
                                                        { value: "owner", label: "Homeowner", description: "Owns a property in Windward Hills." },
                                                        { value: "renter", label: "Renter", description: "Currently renting a property in the subdivision." },
                                                        { value: "household", label: "Household", description: "Lives with a registered homeowner as a family or household member." },
                                                    ].map((type) => (
                                                        <button
                                                            key={type.value}
                                                            type="button"
                                                            onClick={() => setUserType(type.value)}
                                                            className={`rounded-2xl border p-4 text-left transition ${
                                                                userType === type.value
                                                                    ? "border-secondary bg-secondary text-white shadow-sm"
                                                                    : "border-gray-200 bg-white hover:border-gray-300"
                                                            }`}
                                                        >
                                                            <p className="text-sm font-bold">{type.label}</p>
                                                            <p
                                                                className={`text-[11px] leading-4 mt-1 ${
                                                                    userType === type.value
                                                                        ? "text-white/75"
                                                                        : "text-gray-500"
                                                                }`}
                                                            >
                                                                {type.description}
                                                            </p>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="firstName" className="text-xs font-semibold text-gray-600">First name</label>
                                                    <input id="firstName" value={formData.firstName} onChange={handleInputChange} className={inputClasses("firstName", "px-3 mt-1.5")} />
                                                    <FieldError field="firstName" />
                                                </div>
                                                <div>
                                                    <label htmlFor="middleName" className="text-xs font-semibold text-gray-600">Middle name <span className="text-gray-400">(optional)</span></label>
                                                    <input id="middleName" value={formData.middleName} onChange={handleInputChange} className={inputClasses("middleName", "px-3 mt-1.5")} />
                                                    <FieldError field="middleName" />
                                                </div>
                                                <div>
                                                    <label htmlFor="lastName" className="text-xs font-semibold text-gray-600">Last name</label>
                                                    <input id="lastName" value={formData.lastName} onChange={handleInputChange} className={inputClasses("lastName", "px-3 mt-1.5")} />
                                                    <FieldError field="lastName" />
                                                </div>
                                                <div>
                                                    <label htmlFor="suffix" className="text-xs font-semibold text-gray-600">Suffix</label>
                                                    <select id="suffix" value={formData.suffix} onChange={handleInputChange} className={inputClasses("suffix", "px-3 mt-1.5 bg-white")}>
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

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="contactNumber" className="text-xs font-semibold text-gray-600">Contact number</label>
                                                    <div className="relative mt-1.5">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">+63</span>
                                                        <input
                                                            id="contactNumber"
                                                            value={formatPhoneNumber(formData.contactNumber)}
                                                            onChange={handleInputChange}
                                                            className={inputClasses("contactNumber", "pl-12")}
                                                            placeholder="917 123 4567"
                                                        />
                                                    </div>
                                                    <FieldError field="contactNumber" />
                                                </div>

                                                <div>
                                                    <label htmlFor="emergencyContactNumber" className="text-xs font-semibold text-gray-600">Emergency contact</label>
                                                    <div className="relative mt-1.5">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">+63</span>
                                                        <input
                                                            id="emergencyContactNumber"
                                                            value={formatPhoneNumber(formData.emergencyContactNumber)}
                                                            onChange={handleInputChange}
                                                            className={inputClasses("emergencyContactNumber", "pl-12")}
                                                            placeholder="917 123 4567"
                                                        />
                                                    </div>
                                                    <FieldError field="emergencyContactNumber" />
                                                </div>
                                            </div>

                                            {userType === "renter" && (
                                                <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4 space-y-4">
                                                    <h3 className="text-sm font-bold text-secondary">Rental information</h3>
                                                    <div>
                                                        <label htmlFor="ownerFullName" className="text-xs font-semibold text-gray-600">Property owner's full name</label>
                                                        <input id="ownerFullName" value={formData.ownerFullName} onChange={handleInputChange} className={inputClasses("ownerFullName", "px-3 mt-1.5")} />
                                                        <FieldError field="ownerFullName" />
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div>
                                                            <label htmlFor="leaseStart" className="text-xs font-semibold text-gray-600">Lease start</label>
                                                            <input id="leaseStart" type="date" value={formData.leaseStart} onChange={handleInputChange} className={inputClasses("leaseStart", "px-3 mt-1.5")} />
                                                            <FieldError field="leaseStart" />
                                                        </div>
                                                        <div>
                                                            <label htmlFor="leaseEnd" className="text-xs font-semibold text-gray-600">Lease end</label>
                                                            <input id="leaseEnd" type="date" value={formData.leaseEnd} onChange={handleInputChange} className={inputClasses("leaseEnd", "px-3 mt-1.5")} />
                                                            <FieldError field="leaseEnd" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {userType === "household" && (
                                                <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4 space-y-4">
                                                    <h3 className="text-sm font-bold text-secondary">Household information</h3>
                                                    <div>
                                                        <label htmlFor="homeownerName" className="text-xs font-semibold text-gray-600">Homeowner name</label>
                                                        <input id="homeownerName" value={formData.homeownerName} onChange={handleInputChange} className={inputClasses("homeownerName", "px-3 mt-1.5")} />
                                                        <FieldError field="homeownerName" />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="relationshipToHomeowner" className="text-xs font-semibold text-gray-600">Relationship to homeowner</label>
                                                        <select id="relationshipToHomeowner" value={formData.relationshipToHomeowner} onChange={handleInputChange} className={inputClasses("relationshipToHomeowner", "px-3 mt-1.5 bg-white")}>
                                                            <option value="">Select relationship</option>
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
                                                        <FieldError field="relationshipToHomeowner" />
                                                    </div>

                                                    {formData.relationshipToHomeowner === "Other" && (
                                                        <div>
                                                            <label htmlFor="otherRelationship" className="text-xs font-semibold text-gray-600">Specify relationship</label>
                                                            <input id="otherRelationship" value={formData.otherRelationship} onChange={handleInputChange} className={inputClasses("otherRelationship", "px-3 mt-1.5")} />
                                                            <FieldError field="otherRelationship" />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* STEP 3 */}
                                    {currentStep === 3 && (
                                        <div className="space-y-6">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                                                    Step 3 of 4
                                                </p>
                                                <h2 className="text-2xl font-bold text-secondary mt-2">
                                                    Where do you live?
                                                </h2>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Enter your Windward Hills residence information.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="block" className="text-xs font-semibold text-gray-600">Block</label>
                                                    <input id="block" value={formData.block} onChange={handleInputChange} placeholder="Block 71" className={inputClasses("block", "px-3 mt-1.5")} />
                                                    <FieldError field="block" />
                                                </div>
                                                <div>
                                                    <label htmlFor="lot" className="text-xs font-semibold text-gray-600">Lot</label>
                                                    <input id="lot" value={formData.lot} onChange={handleInputChange} placeholder="Lot 9" className={inputClasses("lot", "px-3 mt-1.5")} />
                                                    <FieldError field="lot" />
                                                </div>
                                                <div>
                                                    <label htmlFor="phase" className="text-xs font-semibold text-gray-600">Phase</label>
                                                    <input id="phase" value={formData.phase} onChange={handleInputChange} placeholder="Phase 1" className={inputClasses("phase", "px-3 mt-1.5")} />
                                                    <FieldError field="phase" />
                                                </div>
                                                <div>
                                                    <label htmlFor="street" className="text-xs font-semibold text-gray-600">Street</label>
                                                    <input id="street" value={formData.street} onChange={handleInputChange} placeholder="Mahogany Street" className={inputClasses("street", "px-3 mt-1.5")} />
                                                    <FieldError field="street" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 4 */}
                                    {currentStep === 4 && (
                                        <div className="space-y-6">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                                                    Step 4 of 4
                                                </p>
                                                <h2 className="text-2xl font-bold text-secondary mt-2">
                                                    Verify your identity
                                                </h2>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Your ID helps the HOA confirm your identity before activating your account.
                                                </p>
                                            </div>

                                            <div className="rounded-2xl bg-blue-50 border border-blue-100 px-4 py-3">
                                                <p className="text-xs text-blue-700 leading-5">
                                                    Your information is used only for resident verification and account review.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="idType" className="text-xs font-semibold text-gray-600">Valid ID type</label>
                                                    <select id="idType" value={formData.idType} onChange={handleInputChange} className={inputClasses("idType", "px-3 mt-1.5 bg-white")}>
                                                        <option value="">Select valid ID</option>
                                                        {userType === "owner" && <option value="wwhs-owner">Homeowners - Green WWHS ID</option>}
                                                        {userType === "renter" && <option value="wwhs-renter">Renter - Yellow WWHS ID</option>}
                                                        {userType === "household" && <option value="wwhs-household">Occupant/Household Member - White WWHS ID</option>}
                                                        <option value="passport">Passport</option>
                                                        <option value="drivers">Driver's License</option>
                                                        <option value="national">National ID / UMID</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                    <FieldError field="idType" />
                                                </div>

                                                <div>
                                                    <label htmlFor="idNumber" className="text-xs font-semibold text-gray-600">ID number</label>
                                                    <input id="idNumber" value={formData.idNumber} onChange={handleInputChange} maxLength={25} className={inputClasses("idNumber", "px-3 mt-1.5")} />
                                                    <FieldError field="idNumber" />
                                                </div>
                                            </div>

                                            {formData.idType === "Other" && (
                                                <div>
                                                    <label htmlFor="otherIdType" className="text-xs font-semibold text-gray-600">Specify ID type</label>
                                                    <input id="otherIdType" value={formData.otherIdType} onChange={handleInputChange} className={inputClasses("otherIdType", "px-3 mt-1.5")} />
                                                    <FieldError field="otherIdType" />
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {[
                                                    {
                                                        side: "front",
                                                        label: "Front of ID",
                                                        file: idFrontFile,
                                                        field: "idFrontFile",
                                                    },
                                                    {
                                                        side: "back",
                                                        label: "Back of ID",
                                                        file: idBackFile,
                                                        field: "idBackFile",
                                                    },
                                                ].map((item) => (
                                                    <div key={item.side}>
                                                        <label className="text-xs font-semibold text-gray-600">
                                                            {item.label}
                                                        </label>

                                                        <label
                                                            onDragOver={(e) => handleDragOver(item.side, e)}
                                                            onDragEnter={(e) => handleDragOver(item.side, e)}
                                                            onDragLeave={handleDragLeave}
                                                            onDrop={(e) => handleDrop(item.side, e)}
                                                            className={`mt-1.5 min-h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 p-4 cursor-pointer transition ${
                                                                isDraggingFile === item.side
                                                                    ? "border-primary bg-primary/5"
                                                                    : item.file
                                                                        ? "border-green-300 bg-green-50/40"
                                                                        : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                                                            }`}
                                                        >
                                                            <input
                                                                type="file"
                                                                accept="image/jpeg,image/png,image/jpg,image/webp"
                                                                onChange={(e) => handleFileChange(item.side, e)}
                                                                className="hidden"
                                                            />

                                                            {item.file ? (
                                                                <>
                                                                    <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                                                                        
                                                                    </div>
                                                                    <p className="text-xs font-semibold text-green-700 text-center">
                                                                        {item.file.name}
                                                                    </p>
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            removeIdFile(item.side);
                                                                        }}
                                                                        className="text-[11px] text-red-500 hover:underline"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Upload className="w-5 h-5 text-gray-400" />
                                                                    <p className="text-xs font-semibold text-gray-600">
                                                                        Click or drag image
                                                                    </p>
                                                                    <p className="text-[10px] text-gray-400">
                                                                        JPG, PNG or WEBP · Max 5 MB
                                                                    </p>
                                                                </>
                                                            )}
                                                        </label>

                                                        <FieldError field={item.field} />
                                                    </div>
                                                ))}
                                            </div>

                                            <p className="text-[11px] text-gray-500 italic">
                                                Your account will be reviewed by the HOA administrator before activation.
                                            </p>
                                        </div>
                                    )}

                                    {/* Navigation buttons */}
                                    <div className="flex items-center justify-between gap-3 mt-8 pt-5 border-t border-gray-100">
                                        <button
                                            type="button"
                                            onClick={goToPreviousStep}
                                            disabled={currentStep === 1}
                                            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition ${
                                                currentStep === 1
                                                    ? "text-gray-300 cursor-not-allowed"
                                                    : "text-gray-600 hover:bg-gray-100"
                                            }`}
                                        >
                                            ← Back
                                        </button>

                                        {currentStep < 4 ? (
                                            <button
                                                type="button"
                                                onClick={goToNextStep}
                                                disabled={!isCurrentStepValid()}
                                                className={`px-6 py-3 rounded-full text-sm font-semibold shadow-sm transition ${
                                                    !isCurrentStepValid()
                                                        ? "bg-primary/20 text-primary/40 cursor-not-allowed"
                                                        : "bg-primary text-white hover:brightness-105 active:scale-[0.99] cursor-pointer"
                                                }`}
                                            >
                                                Continue →
                                            </button>
                                        ) : (
                                            <button
                                                type="submit"
                                                disabled={isLoading || !isFormValid}
                                                className={`px-6 py-3 rounded-full text-sm font-semibold shadow-sm transition ${
                                                    isLoading
                                                        ? "bg-gray-400 text-white cursor-not-allowed"
                                                        : !isFormValid
                                                            ? "bg-primary/20 text-primary/40 cursor-not-allowed"
                                                            : "bg-primary text-white hover:brightness-105 active:scale-[0.99] cursor-pointer"
                                                }`}
                                            >
                                                {isLoading ? "Submitting..." : "Submit Registration"}
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </form>

                        <p className="text-center text-[11px] text-gray-400 mt-5">
                            By signing up, you agree to our Terms of Use and Privacy Policy.
                        </p>
                    </div>
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