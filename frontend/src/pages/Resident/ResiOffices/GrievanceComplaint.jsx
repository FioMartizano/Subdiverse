import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Upload, X, FileText, Image as ImageIcon, Video, Paperclip, ChevronRight, ChevronLeft, Download, ArrowLeft } from "lucide-react";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth"; 
import { db, auth } from "../../../firebase";
import { uploadImage } from "../../../services/cloudinary";

const CATEGORIES = [
    { value: "noise", label: "Noise complaint" },
    { value: "maintenance", label: "Maintenance issue" },
    { value: "security", label: "Security concern" },
    { value: "billing", label: "Billing dispute" },
    { value: "other", label: "Other" },
];

const STEPS = [
    { id: 1, label: "Category & details" },
    { id: 2, label: "Description" },
    { id: 3, label: "Attachments" },
    { id: 4, label: "Review & submit" },
];

const MAX_FILES = 5;
const MAX_SIZE_MB = 10;
const MAX_VIDEO_SIZE_MB = 50;

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_DOC_TYPES = ["application/pdf"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const ACCEPTED_TYPES = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_DOC_TYPES, ...ACCEPTED_VIDEO_TYPES];

const DISPUTE_FORM_PATH = "/forms/personal-neighbor-dispute-report-form.pdf";

function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileKind(type) {
    if (ACCEPTED_VIDEO_TYPES.includes(type)) return "video";
    if (type === "application/pdf") return "pdf";
    return "image";
}

function GrievanceComplaint() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [fileError, setFileError] = useState("");
    const [isDraggingFile, setIsDraggingFile] = useState(false);

    const [userId, setUserId] = useState(null);
    const [residentName, setResidentName] = useState("");
    const [loadingAuth, setLoadingAuth] = useState(true);

    const [formData, setFormData] = useState({
        category: "",
        title: "",
        location: "",
        hasIncidentTime: false,
        incidentDate: "",
        incidentTime: "",
        description: "",
        isAnonymous: false,
        attachments: [],
    });

    // Get today's date in YYYY-MM-DD format for the max attribute
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);

                const userDocRef = doc(db, "residents", user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const profileData = userDocSnap.data();
                    
                    let officialName = "";
                    if (profileData.firstName && profileData.lastName) {
                        officialName = `${profileData.firstName} ${profileData.lastName}`;
                    } else {
                        officialName = profileData.name || profileData.fullName || profileData.firstName || "";
                    }

                    setResidentName(officialName || user.displayName || user.email || "Resident");

                } else {
                    setResidentName(user.displayName || user.email || "Resident");
                }
            } else {
                setUserId(null);
                setResidentName("");
            }
            setLoadingAuth(false);
        });

        return () => unsubscribe();
    }, []);

    const updateField = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const validateAndAddFiles = (incoming) => {
        setFileError("");
        const incomingArr = Array.from(incoming);

        if (formData.attachments.length + incomingArr.length > MAX_FILES) {
            setFileError(`You can attach up to ${MAX_FILES} files.`);
            return;
        }

        const valid = [];
        for (const file of incomingArr) {
            if (!ACCEPTED_TYPES.includes(file.type)) {
                setFileError("Only JPG, PNG, WEBP, PDF, or video files (MP4, MOV, WEBM) are allowed.");
                continue;
            }
            const isVideo = ACCEPTED_VIDEO_TYPES.includes(file.type);
            const sizeLimitMb = isVideo ? MAX_VIDEO_SIZE_MB : MAX_SIZE_MB;
            if (file.size > sizeLimitMb * 1024 * 1024) {
                setFileError(`${isVideo ? "Videos" : "Photos and documents"} must be under ${sizeLimitMb}MB.`);
                continue;
            }
            valid.push(file);
        }
        if (valid.length) {
            updateField("attachments", [...formData.attachments, ...valid]);
        }
    };

    const removeFile = (index) => {
        updateField("attachments", formData.attachments.filter((_, i) => i !== index));
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
        if (e.dataTransfer.files && e.dataTransfer.files.length) {
            validateAndAddFiles(e.dataTransfer.files);
        }
    };

    const canGoNext = () => {
        if (currentStep === 1) return formData.category && formData.title.trim();
        if (currentStep === 2) return formData.description.trim().length > 0;
        return true;
    };

    const goNext = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length));
    const goBack = () => setCurrentStep((s) => Math.max(s - 1, 1));

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const uploadedAttachments = await Promise.all(
                formData.attachments.map(async (file) => {
                    const url = await uploadImage(file, "complaints");
                    return {
                        url,
                        name: file.name,
                        type: file.type,
                    };
                })
            );

            await addDoc(collection(db, "complaints"), {
                residentId: userId || "anonymous",
                isAnonymous: formData.isAnonymous,
                residentName: formData.isAnonymous ? "Anonymous" : (residentName || "Unknown Resident"),
                category: formData.category,
                title: formData.title,
                description: formData.description,
                location: formData.location || null,
                hasIncidentTime: formData.hasIncidentTime,
                incidentDate: formData.hasIncidentTime ? formData.incidentDate : null,
                incidentTime: formData.hasIncidentTime ? formData.incidentTime : null,
                attachmentUrls: uploadedAttachments,
                status: "pending",
                assignedOfficer: null,
                officeRemarks: "",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            setSubmitted(true);
        } catch (err) {
            console.error("Error submitting complaint to Firestore:", err);
            setFileError("Something went wrong submitting your complaint. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleBackToGrievance = () => {
        navigate('/grievance');
    };

    if (loadingAuth) {
        return (
            <div className="h-screen flex items-center justify-center font-bold text-gray-700">
                Loading...
            </div>
        );
    }

    if (submitted) {
        return (
            <>
                <div className="max-w-5xl mx-auto py-16 px-6 md:px-8">
                    {/* Back button */}
                    <div className="mb-8">
                        <button
                            type="button"
                            onClick={handleBackToGrievance}
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors px-3 py-2 -ml-3 rounded-lg hover:bg-primary/5"
                        >
                            <ArrowLeft size={20} />
                            <span className="text-sm font-medium">Back to Grievance</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8">
                        {/* Left sidebar - shows all steps as completed */}
                        <div>
                            <ol className="space-y-1">
                                {STEPS.map((step) => {
                                    return (
                                        <li
                                            key={step.id}
                                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors text-gray-500`}
                                        >
                                            <span
                                                className={`flex items-center justify-center w-5 h-5 rounded-full text-[11px] shrink-0 bg-primary text-white`}
                                            >
                                                <Check size={12} />
                                            </span>
                                            {step.label}
                                        </li>
                                    );
                                })}
                            </ol>
                        </div>

                        {/* Main content - Success message */}
                        <div className="border border-gray-100 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center min-h-[400px]">
                            <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-6">
                                <Check size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-3">Complaint Submitted Successfully!</h2>
                            <p className="text-gray-600 text-center max-w-md mb-2">
                                Your complaint has been received and is marked as <span className="font-medium text-gray-700">pending</span>.
                            </p>
                            <p className="text-sm text-gray-500 text-center max-w-md">
                                You'll be notified once it's reviewed by the office.
                            </p>
                            
                            <div className="mt-8 flex flex-col sm:flex-row gap-4">
                                <button
                                    type="button"
                                    onClick={handleBackToGrievance}
                                    className="btn-primary"
                                >
                                    Back to Grievance
                                </button>
                                <button
                                    type="button"
                                    onClick={() => window.location.reload()}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    File Another Complaint
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Personal / neighbor dispute — downloadable template section */}
                <div className="w-full bg-orange-50/60 border-y border-orange-100">
                    <section className="max-w-5xl mx-auto py-14 px-6 md:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-center">
                            <div>
                                <span className="inline-block text-[11px] font-semibold uppercase tracking-wide text-secondary bg-secondary/10 px-2.5 py-1 rounded-full mb-3">
                                    Personal or neighbor dispute?
                                </span>
                                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                                    Handle sensitive concerns in person
                                </h2>
                                <p className="text-sm text-gray-600 leading-relaxed max-w-xl">
                                    Personal disputes, neighbor conflicts, and other sensitive or blotter-related
                                    concerns aren't filed through this online form. Instead, download and fill out
                                    the report form below, then bring it in our Grievance Office during office hours along with any photo,
                                    video, or document evidence. This lets an officer properly document your case and begin mediation.
                                </p>
                            </div>

                            <a
                                href={DISPUTE_FORM_PATH}
                                download
                                className="btn-primary flex items-center gap-2 whitespace-nowrap justify-center"
                            >
                                <Download size={16} />
                                Download the form
                            </a>
                        </div>
                    </section>
                </div>

                {/* How the complaints process works section */}
                <div className="w-full">
                    <section className="w-full py-20 bg-gray-50 px-6 md:px-24">
                        <div className="max-w-6xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-black)] mb-12">
                                How the Complaint Process Works
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                {[
                                    { id: "01", title: "Submission", desc: "The complainer submits details about the issue and the person involved." },
                                    { id: "02", title: "Mediation Call", desc: "The grievance officer contacts both parties to initiate the process." },
                                    { id: "03", title: "Escalation", desc: "If the respondent fails to appear after three invitations, the matter is referred to the Barangay." },
                                    { id: "04", title: "Resolution", desc: "If the respondent attends, the officer mediates a face-to-face conversation to resolve the issue." }
                                ].map((step, index) => (
                                    <motion.div
                                        key={step.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.15 }}
                                        className="relative border-t-4 border-[var(--color-primary)] pt-6"
                                    >
                                        <span className="text-[var(--color-secondary)] font-bold text-xl block mb-2">{step.id}</span>
                                        <h3 className="text-lg font-bold text-[var(--color-black)] mb-2">{step.title}</h3>
                                        <p className="text-zinc-600 text-sm leading-relaxed">{step.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="max-w-5xl mx-auto py-16 px-6 md:px-8">
                {/* Back button */}
                <div className="mb-8">
                    <button
                        type="button"
                        onClick={handleBackToGrievance}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors px-3 py-2 -ml-3 rounded-lg hover:bg-primary/5"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-sm font-medium">Back to Grievance</span>
                    </button>
                </div>
                
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">File a complaint</h1>

                <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8">
                    <div>
                        <ol className="space-y-1">
                            {STEPS.map((step) => {
                                const isActive = step.id === currentStep;
                                const isDone = step.id < currentStep;
                                return (
                                    <li
                                        key={step.id}
                                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors
                                            ${isActive ? "bg-primary/10 text-primary font-semibold" : isDone ? "text-gray-500" : "text-gray-400"}`}
                                    >
                                        <span
                                            className={`flex items-center justify-center w-5 h-5 rounded-full text-[11px] shrink-0
                                                ${isDone ? "bg-primary text-white" : isActive ? "border-2 border-primary text-primary" : "border border-gray-300 text-gray-400"}`}
                                        >
                                            {isDone ? <Check size={12} /> : step.id}
                                        </span>
                                        {step.label}
                                    </li>
                                );
                            })}
                        </ol>
                    </div>

                    {/* Form body card */}
                    <div className="border border-gray-100 rounded-2xl p-6 md:p-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -12 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* STEP 1: Category & Details */}
                                {currentStep === 1 && (
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                                            <select
                                                value={formData.category}
                                                onChange={(e) => updateField("category", e.target.value)}
                                                className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                            >
                                                <option value="">Select a category</option>
                                                {CATEGORIES.map((c) => (
                                                    <option key={c.value} value={c.value}>{c.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                                            <input
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) => updateField("title", e.target.value)}
                                                placeholder="Brief summary of the issue"
                                                className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Location <span className="text-gray-400 font-normal">(optional)</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.location}
                                                onChange={(e) => updateField("location", e.target.value)}
                                                placeholder="e.g. Phase 2, Block 5"
                                                className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                            />
                                        </div>

                                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.hasIncidentTime}
                                                onChange={(e) => updateField("hasIncidentTime", e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/30"
                                            />
                                            This relates to a specific date and time
                                        </label>

                                        {formData.hasIncidentTime && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1.5">Date</label>
                                                    <input
                                                        type="date"
                                                        value={formData.incidentDate}
                                                        onChange={(e) => updateField("incidentDate", e.target.value)}
                                                        max={today}
                                                        className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1.5">Time</label>
                                                    <input
                                                        type="time"
                                                        value={formData.incidentTime}
                                                        onChange={(e) => updateField("incidentTime", e.target.value)}
                                                        className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* STEP 2: Description & Anonymity */}
                                {currentStep === 2 && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                                            <textarea
                                                rows={6}
                                                value={formData.description}
                                                onChange={(e) => updateField("description", e.target.value)}
                                                placeholder="Describe what happened..."
                                                className="w-full rounded-lg border border-gray-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                            />
                                        </div>

                                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.isAnonymous}
                                                onChange={(e) => updateField("isAnonymous", e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/30"
                                            />
                                            Submit this complaint anonymously
                                        </label>
                                    </div>
                                )}

                                {/* STEP 3: Attachments */}
                                {currentStep === 3 && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-1">Attachments</p>
                                        <p className="text-xs text-gray-500 mb-4">
                                            Optional — photos, videos, or documents that support your complaint.
                                        </p>

                                        <label
                                            onDragOver={handleDragOver}
                                            onDragEnter={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            className={`rounded-xl border-2 border-dashed cursor-pointer transition-colors flex flex-col items-center justify-center text-center px-6 py-8 ${isDraggingFile
                                                ? "border-primary bg-primary/5"
                                                : "border-gray-200 hover:border-primary/40 hover:bg-gray-50"
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${isDraggingFile ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-400"}`}>
                                                <Upload size={18} />
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {isDraggingFile ? (
                                                    <span className="text-primary font-medium">Drop your files here</span>
                                                ) : (
                                                    <>
                                                        <span className="text-primary font-medium">Click to upload</span> or drag and drop
                                                    </>
                                                )}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                JPG, PNG, WEBP, PDF, or video (MP4, MOV, WEBM)
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                Photos/PDF up to {MAX_SIZE_MB}MB · videos up to {MAX_VIDEO_SIZE_MB}MB · max {MAX_FILES} files
                                            </p>
                                            <input
                                                type="file"
                                                multiple
                                                accept={ACCEPTED_TYPES.join(",")}
                                                className="hidden"
                                                onChange={(e) => validateAndAddFiles(e.target.files)}
                                            />
                                        </label>

                                        {fileError && <p className="mt-2 text-xs text-red-500">{fileError}</p>}

                                        {formData.attachments.length > 0 ? (
                                            <ul className="mt-4 space-y-2">
                                                {formData.attachments.map((file, i) => {
                                                    const kind = getFileKind(file.type);
                                                    return (
                                                        <li key={`${file.name}-${i}`} className="flex items-center justify-between gap-3 border border-gray-100 rounded-lg px-3 py-2.5">
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <div className="w-8 h-8 rounded-md bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                                                                    {kind === "pdf" && <FileText size={15} />}
                                                                    {kind === "video" && <Video size={15} />}
                                                                    {kind === "image" && <ImageIcon size={15} />}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-xs font-medium text-gray-700 truncate max-w-[220px] sm:max-w-[320px]">{file.name}</p>
                                                                    <p className="text-[11px] text-gray-400">{formatBytes(file.size)}</p>
                                                                </div>
                                                            </div>
                                                            <button type="button" onClick={() => removeFile(i)} className="w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0">
                                                                <X size={14} />
                                                            </button>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        ) : (
                                            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-gray-400">
                                                <Paperclip size={12} /> No files attached yet
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* STEP 4: Review Details */}
                                {currentStep === 4 && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-gray-700">Review your complaint</h3>
                                        <dl className="space-y-3 text-sm">
                                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                                <dt className="text-gray-400">Category</dt>
                                                <dd className="text-gray-700 font-medium">
                                                    {CATEGORIES.find((c) => c.value === formData.category)?.label || "—"}
                                                </dd>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                                <dt className="text-gray-400">Title</dt>
                                                <dd className="text-gray-700 font-medium">{formData.title || "—"}</dd>
                                            </div>
                                            {formData.location && (
                                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                                    <dt className="text-gray-400">Location</dt>
                                                    <dd className="text-gray-700 font-medium">{formData.location}</dd>
                                                </div>
                                            )}
                                            {formData.hasIncidentTime && (
                                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                                    <dt className="text-gray-400">Incident</dt>
                                                    <dd className="text-gray-700 font-medium">{formData.incidentDate} {formData.incidentTime}</dd>
                                                </div>
                                            )}
                                            <div className="border-b border-gray-100 pb-2">
                                                <dt className="text-gray-400 mb-1">Description</dt>
                                                <dd className="text-gray-700">{formData.description || "—"}</dd>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                                <dt className="text-gray-400">Attachments</dt>
                                                <dd className="text-gray-700 font-medium">{formData.attachments.length} file(s)</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-gray-400">Anonymous</dt>
                                                <dd className="text-gray-700 font-medium">{formData.isAnonymous ? "Yes" : "No"}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={goBack}
                                disabled={currentStep === 1}
                                className="flex items-center gap-1 text-sm text-gray-500 disabled:opacity-0 hover:text-gray-700"
                            >
                                <ChevronLeft size={16} /> Back
                            </button>

                            {currentStep < STEPS.length ? (
                                <button
                                    type="button"
                                    onClick={goNext}
                                    disabled={!canGoNext()}
                                    className="btn-primary flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="btn-primary disabled:opacity-60"
                                >
                                    {submitting ? "Submitting..." : "Submit complaint"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Personal / neighbor dispute — downloadable template section */}
            <div className="w-full bg-orange-50/60 border-y border-orange-100">
                <section className="max-w-5xl mx-auto py-14 px-6 md:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-center">
                        <div>
                            <span className="inline-block text-[11px] font-semibold uppercase tracking-wide text-secondary bg-secondary/10 px-2.5 py-1 rounded-full mb-3">
                                Personal or neighbor dispute?
                            </span>
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                                Handle sensitive concerns in person
                            </h2>
                            <p className="text-sm text-gray-600 leading-relaxed max-w-xl">
                                Personal disputes, neighbor conflicts, and other sensitive or blotter-related
                                concerns aren't filed through this online form. Instead, download and fill out
                                the report form below, then bring it in our Grievance Office during office hours along with any photo,
                                video, or document evidence. This lets an officer properly document your case and begin mediation.
                            </p>
                        </div>

                        <a
                            href={DISPUTE_FORM_PATH}
                            download
                            className="btn-primary flex items-center gap-2 whitespace-nowrap justify-center"
                        >
                            <Download size={16} />
                            Download the form
                        </a>
                    </div>
                </section>
            </div>

            {/* How the complaints process works section */}
            <div className="w-full">
                <section className="w-full py-20 bg-gray-50 px-6 md:px-24">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-black)] mb-12">
                            How the Complaint Process Works
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {[
                                { id: "01", title: "Submission", desc: "The complainer submits details about the issue and the person involved." },
                                { id: "02", title: "Mediation Call", desc: "The grievance officer contacts both parties to initiate the process." },
                                { id: "03", title: "Escalation", desc: "If the respondent fails to appear after three invitations, the matter is referred to the Barangay." },
                                { id: "04", title: "Resolution", desc: "If the respondent attends, the officer mediates a face-to-face conversation to resolve the issue." }
                            ].map((step, index) => (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.15 }}
                                    className="relative border-t-4 border-[var(--color-primary)] pt-6"
                                >
                                    <span className="text-[var(--color-secondary)] font-bold text-xl block mb-2">{step.id}</span>
                                    <h3 className="text-lg font-bold text-[var(--color-black)] mb-2">{step.title}</h3>
                                    <p className="text-zinc-600 text-sm leading-relaxed">{step.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

export default GrievanceComplaint;