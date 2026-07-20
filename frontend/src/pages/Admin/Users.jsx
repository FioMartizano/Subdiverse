import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Users,
  Clock,
  CheckCircle2,
  BadgeCheck,
  Search,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileWarning,
  FileText,
} from "lucide-react";

import { db } from "../../firebase";
import { initializeApp, getApp, getApps } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
  deleteUser,
  sendEmailVerification,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import AdminPageLayout from "../../components/admin/AdminPageLayout";
import MetricCard from "../../components/admin/MetricCard";

const ACCOUNT_STATUSES = ["all", "pending", "active", "frozen", "suspended", "archived", "rejected"];

const STATUS_STYLES = {
  pending: "bg-[#F9A825] text-white",
  active: "bg-[#43A047] text-white",
  frozen: "bg-[#5C6BC0] text-white",
  suspended: "bg-[#D32F2F] text-white",
  archived: "bg-[#78716C] text-white",
  rejected: "bg-[#E64A19] text-white",
};

const CATEGORY_STYLES = {
  owner: "bg-[#66BB6A] text-white",
  renter: "bg-[#F9A825] text-white",
  household: "bg-[#7E57C2] text-white",
};

const VERIFICATION_STYLES = {
  verified: "bg-[#43A047] text-white",
  pending: "bg-[#F9A825] text-white",
  unverified: "bg-[#9CA3AF] text-white",
  rejected: "bg-[#E64A19] text-white",
};

function initials(name) {
  if (!name) return "??";
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// SHARED DROPDOWN PORTAL
// Renders table dropdowns outside overflow containers so menus are not clipped.
function DropdownPortal({ anchorRef, onClose, children, align = "left" }) {
  const [style, setStyle] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const updatePosition = () => {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();

     
      const menuHeight = menuRef.current?.offsetHeight || 0;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      const shouldOpenUpward =
        menuHeight > 0 &&
        spaceBelow < menuHeight + 8 &&
        spaceAbove > spaceBelow;

      setStyle({
        position: "fixed",
        top: shouldOpenUpward ? undefined : rect.bottom + 4,
        bottom: shouldOpenUpward
          ? window.innerHeight - rect.top + 4
          : undefined,
        left: align === "right" ? undefined : rect.left,
        right: align === "right" ? window.innerWidth - rect.right : undefined,
        minWidth: rect.width,
        maxHeight: shouldOpenUpward
          ? spaceAbove - 8
          : spaceBelow - 8,
        overflowY: "auto",
      });
    };

    updatePosition();
    const raf = requestAnimationFrame(updatePosition);

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [anchorRef, onClose, align]);

  if (!style) return null;

  return createPortal(
    <div ref={menuRef} style={style} className="z-[100]">
      {children}
    </div>,
    document.body
  );
}

function AdminUsers() {


  const [showAddResident, setShowAddResident] = useState(false);

  const [addResidentForm, setAddResidentForm] = useState({
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

    residentCategory: "owner",

    propertyControlNumber: "",

    propertyOwnerResidentId: "",
    propertyOwnerName: "",

    homeownerResidentId: "",
    homeownerName: "",
    relationshipToHomeowner: "",

    leaseStart: "",
    leaseEnd: "",
  });
  const [residentsList, setResidentsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [previewImage, setPreviewImage] = useState(null); //for click images

  const [statusFilter, setStatusFilter] = useState("all");

  const [activeCard, setActiveCard] = useState("all");
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [openStatusId, setOpenStatusId] = useState(null);
  const [openVerificationId, setOpenVerificationId] = useState(null);
  const [selectedResident, setSelectedResident] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const verificationButtonRefs = useRef({});
  const statusButtonRefs = useRef({});
  const menuButtonRefs = useRef({});

  const getLocalToday = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const today = getLocalToday();

  const [addResidentErrors, setAddResidentErrors] = useState({});
  const [createdResidentCredentials, setCreatedResidentCredentials] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState("master");

  


  // FIRESTORE REAL-TIME SYNC
  useEffect(() => {
    const usersQuery = query(collection(db, "users"), where("role", "==", "resident"));
    const residentsQuery = collection(db, "residents");

    let rawUsersList = [];
    let rawResidentsMap = {};

    const mergeAndSync = () => {
      const getImageUrl = (value) => {
        if (!value) return "";

        if (typeof value === "string") {
          return value;
        }

        return (
          value.secureUrl ||
          value.secure_url ||
          value.url ||
          ""
        );
      };

      const joined = rawUsersList.map((userDoc) => {
        const profileDoc = rawResidentsMap[userDoc.id] || {};

        const fullName = [
          profileDoc.firstName,
          profileDoc.middleName,
          profileDoc.lastName,
          profileDoc.suffix,
        ]
          .filter(Boolean)
          .join(" ");

        const location = [
          profileDoc.block,
          profileDoc.lot,
          profileDoc.street,
          profileDoc.phase,
        ]
          .filter(Boolean)
          .join(", ");

        return {
          id: userDoc.id,
          name: fullName || "Unnamed Resident",
          email: userDoc.email || profileDoc.email || "No email",
          location: location || "Blk / Lot unspecified",
          category: profileDoc.residentCategory || "household",
          block: profileDoc.block || "",
          lot: profileDoc.lot || "",
          street: profileDoc.street || "",
          phase: profileDoc.phase || "",
          propertyControlNumber: profileDoc.propertyControlNumber || "",
          propertyOwnerResidentId: profileDoc.propertyOwnerResidentId || "",
          homeownerResidentId: profileDoc.homeownerResidentId || "",
          verification: profileDoc.verificationStatus || "unverified",
          status: userDoc.accountStatus || userDoc.status || "pending",
          contactNumber: profileDoc.contactNumber || "Not provided",
          emergencyContactNumber: profileDoc.emergencyContactNumber || "Not provided",
          idType: profileDoc.idType || "Not provided",
          idNumber: profileDoc.idNumber || "Not provided",
          idImageFrontUrl: getImageUrl(profileDoc.idImageFrontUrl),
          idImageBackUrl: getImageUrl(profileDoc.idImageBackUrl),
          leaseStart: profileDoc.leaseStart || "",
          leaseEnd: profileDoc.leaseEnd || "",
          propertyOwnerName: profileDoc.propertyOwnerName || "",
          homeownerName: profileDoc.homeownerName || "",
          relationshipToHomeowner: profileDoc.relationshipToHomeowner || "",
        };
      });
      setResidentsList(joined);
      setLoading(false);
    };


    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      rawUsersList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      mergeAndSync();
    }, (error) => {
      console.error("Firestore users error:", error);
    });

    const unsubscribeResidents = onSnapshot(residentsQuery, (snapshot) => {
      rawResidentsMap = {};
      snapshot.docs.forEach((doc) => {
        rawResidentsMap[doc.id] = doc.data();
      });
      mergeAndSync();
    }, (error) => {
      console.error("Firestore residents error:", error);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeResidents();
    };
  }, []);


  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, "");

    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    } else if (digits.length <= 10) {
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }

    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  };

  const normalizePropertyPart = (value, type) => {
    let normalized = String(value || "").trim().toUpperCase();

    const prefixes = {
      phase: /^(PHASE|PH)\s*[-:]?\s*/i,
      block: /^(BLOCK|BLK)\s*[-:]?\s*/i,
      lot: /^(LOT)\s*[-:]?\s*/i,
    };

    normalized = normalized.replace(prefixes[type], "");
    return normalized.replace(/[^A-Z0-9]/g, "");
  };

  const generatePropertyControlNumber = ({ phase, block, lot }) => {
    const normalizedPhase = normalizePropertyPart(phase, "phase");
    const normalizedBlock = normalizePropertyPart(block, "block");
    const normalizedLot = normalizePropertyPart(lot, "lot");

    if (!normalizedPhase || !normalizedBlock || !normalizedLot) {
      return "";
    }

    return `WH-P${normalizedPhase}-B${normalizedBlock}-L${normalizedLot}`;
  };

  const generateTemporaryPassword = (length = 14) => {
    const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lowercase = "abcdefghijkmnopqrstuvwxyz";
    const numbers = "23456789";
    const symbols = "!@#$%";
    const all = uppercase + lowercase + numbers + symbols;

    const randomIndex = (max) => {
      const values = new Uint32Array(1);
      crypto.getRandomValues(values);
      return values[0] % max;
    };

    const chars = [
      uppercase[randomIndex(uppercase.length)],
      lowercase[randomIndex(lowercase.length)],
      numbers[randomIndex(numbers.length)],
      symbols[randomIndex(symbols.length)],
    ];

    while (chars.length < length) {
      chars.push(all[randomIndex(all.length)]);
    }

    for (let i = chars.length - 1; i > 0; i -= 1) {
      const j = randomIndex(i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    return chars.join("");
  };

  const clearAddResidentError = (field) => {
    setAddResidentErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const ownerOptions = residentsList
    .filter((resident) => resident.category === "owner")
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleLinkedOwnerSelect = (ownerId, relationshipType) => {
    const selectedOwner = ownerOptions.find((owner) => owner.id === ownerId);

    if (!selectedOwner) {
      setAddResidentForm((prev) => ({
        ...prev,
        block: "",
        lot: "",
        street: "",
        phase: "",
        propertyControlNumber: "",
        propertyOwnerResidentId:
          relationshipType === "renter" ? "" : prev.propertyOwnerResidentId,
        propertyOwnerName:
          relationshipType === "renter" ? "" : prev.propertyOwnerName,
        homeownerResidentId:
          relationshipType === "household" ? "" : prev.homeownerResidentId,
        homeownerName:
          relationshipType === "household" ? "" : prev.homeownerName,
      }));
      return;
    }

    setAddResidentForm((prev) => ({
      ...prev,
      block: selectedOwner.block || "",
      lot: selectedOwner.lot || "",
      street: selectedOwner.street || "",
      phase: selectedOwner.phase || "",
      propertyControlNumber: selectedOwner.propertyControlNumber || "",
      propertyOwnerResidentId:
        relationshipType === "renter" ? selectedOwner.id : "",
      propertyOwnerName:
        relationshipType === "renter" ? selectedOwner.name : "",
      homeownerResidentId:
        relationshipType === "household" ? selectedOwner.id : "",
      homeownerName:
        relationshipType === "household" ? selectedOwner.name : "",
    }));

    setAddResidentErrors((prev) => ({
      ...prev,
      propertyOwnerResidentId: "",
      propertyOwnerName: "",
      homeownerResidentId: "",
      homeownerName: "",
      block: "",
      lot: "",
      street: "",
      phase: "",
      propertyControlNumber: "",
    }));
  };

  // ADD RESIDENT VALIDATION
  const validateAddResidentForm = () => {
    const errors = {};

    const firstName = addResidentForm.firstName.trim();
    const middleName = addResidentForm.middleName.trim();
    const lastName = addResidentForm.lastName.trim();
    const suffix = addResidentForm.suffix.trim();
    const email = addResidentForm.email.trim().toLowerCase();
    const contactNumber = addResidentForm.contactNumber.trim();
    const emergencyContactNumber = addResidentForm.emergencyContactNumber.trim();
    const block = addResidentForm.block.trim();
    const lot = addResidentForm.lot.trim();
    const street = addResidentForm.street.trim();
    const phase = addResidentForm.phase.trim();
    const propertyControlNumber = addResidentForm.propertyControlNumber.trim();

    const nameRegex = /^[A-Za-z\s]+$/;
    const suffixRegex = /^(Jr\.|Sr\.|II|III|IV|V)$/;
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const mobileRegex = /^9\d{9}$/;
    const propertyControlRegex = /^WH-P\d+-B\d+-L\d+$/i;

    if (!firstName) {
      errors.firstName = "First name is required.";
    } else if (firstName.length < 2) {
      errors.firstName = "First name must contain at least 2 characters.";
    } else if (!nameRegex.test(firstName)) {
      errors.firstName = "First name contains invalid characters.";
    }

    if (middleName && !nameRegex.test(middleName)) {
      errors.middleName = "Middle name contains invalid characters.";
    }

    if (!lastName) {
      errors.lastName = "Last name is required.";
    } else if (lastName.length < 2) {
      errors.lastName = "Last name must contain at least 2 characters.";
    } else if (!nameRegex.test(lastName)) {
      errors.lastName = "Last name contains invalid characters.";
    }

    if (suffix && !suffixRegex.test(suffix)) {
      errors.suffix = "Suffix contains invalid characters.";
    }

    if (!email) {
      errors.email = "Email address is required.";
    } else if (!emailRegex.test(email)) {
      errors.email = "Enter a valid email address.";
    } else {
      const emailAlreadyExists = residentsList.some(
        (resident) => resident.email?.trim().toLowerCase() === email
      );

      if (emailAlreadyExists) {
        errors.email = "A resident account already uses this email address.";
      }
    }

    if (!contactNumber) {
      errors.contactNumber = "Contact number is required.";
    } else if (!mobileRegex.test(contactNumber)) {
      errors.contactNumber =
        "Please enter a valid 10-digit mobile number after +63 (example: 9171234567).";
    }

    if (!emergencyContactNumber) {
      errors.emergencyContactNumber =
        "Emergency contact number is required.";
    } else if (!mobileRegex.test(emergencyContactNumber)) {
      errors.emergencyContactNumber =
        "Please enter a valid 10-digit mobile number after +63 (example: 9171234567).";
    }

    if (
      emergencyContactNumber &&
      emergencyContactNumber === contactNumber
    ) {
      errors.emergencyContactNumber =
        "Emergency contact should be different from the resident's contact number.";
    }

    if (!block) {
      errors.block = "Block is required.";
    }

    if (!lot) {
      errors.lot = "Lot is required.";
    }

    if (!street) {
      errors.street = "Street is required.";
    }

    if (!phase) {
      errors.phase = "Phase is required.";
    }

    if (addResidentForm.residentCategory === "owner") {
      if (!propertyControlNumber) {
        errors.propertyControlNumber = "Property control number is required.";
      } else if (!propertyControlRegex.test(propertyControlNumber)) {
        errors.propertyControlNumber = "Use the format WH-P2-B71-L12.";
      }

      const existingOwnerProperty = residentsList.some(
        (resident) =>
          resident.category === "owner" &&
          resident.propertyControlNumber &&
          resident.propertyControlNumber.trim().toLowerCase() ===
            propertyControlNumber.toLowerCase()
      );

      if (existingOwnerProperty) {
        errors.propertyControlNumber =
          "This property control number is already assigned to an existing owner.";
      }
    } else if (
      propertyControlNumber &&
      !propertyControlRegex.test(propertyControlNumber)
    ) {
      errors.propertyControlNumber =
        "The linked property's control number has an invalid format.";
    }

    if (addResidentForm.residentCategory === "renter") {
      if (!addResidentForm.propertyOwnerResidentId) {
        errors.propertyOwnerResidentId =
          "Select an existing property owner account.";
      }

      if (!addResidentForm.propertyOwnerName.trim()) {
        errors.propertyOwnerName = "Property owner is required.";
      }

      if (!addResidentForm.leaseStart) {
        errors.leaseStart = "Lease start date is required.";
      }

      if (!addResidentForm.leaseEnd) {
        errors.leaseEnd = "Lease end date is required.";
      }

      if (
        addResidentForm.leaseStart &&
        addResidentForm.leaseEnd &&
        new Date(addResidentForm.leaseEnd) <=
          new Date(addResidentForm.leaseStart)
      ) {
        errors.leaseEnd =
          "Lease end date must be after the start date.";
      }

      if (
        addResidentForm.leaseEnd &&
        addResidentForm.leaseEnd < today
      ) {
        errors.leaseEnd =
          "The lease end date cannot already be in the past for a current renter.";
      }
    }

    if (addResidentForm.residentCategory === "household") {
      if (!addResidentForm.homeownerResidentId) {
        errors.homeownerResidentId =
          "Select an existing homeowner account.";
      }

      if (!addResidentForm.homeownerName.trim()) {
        errors.homeownerName = "Homeowner is required.";
      }

      if (!addResidentForm.relationshipToHomeowner.trim()) {
        errors.relationshipToHomeowner =
          "Relationship to homeowner is required.";
      }
    }

    setAddResidentErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // ADD RESIDENT SUBMISSION
  const handleAddResidentSubmit = async (e) => {
    e.preventDefault();

    setActionError("");
    setActionSuccess("");
    setCreatedResidentCredentials(null);

    const isValid = validateAddResidentForm();

    if (!isValid) {
      setActionError(
        "Please correct the highlighted fields before adding the resident."
      );
      return;
    }

    setActionLoading(true);

    let createdUser = null;
    let secondaryAuth = null;

    try {
      const secondaryAppName = "SecondaryResidentCreator";

      const secondaryApp =
        getApps().find((app) => app.name === secondaryAppName) ||
        initializeApp(getApp().options, secondaryAppName);

      secondaryAuth = getAuth(secondaryApp);

      if (secondaryAuth.currentUser) {
        await signOut(secondaryAuth);
      }

      const temporaryPassword = generateTemporaryPassword();

      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        addResidentForm.email.trim().toLowerCase(),
        temporaryPassword
      );

      createdUser = userCredential.user;
      const residentId = createdUser.uid;

      let verificationEmailSent = true;

      try {
        await sendEmailVerification(createdUser);
      } catch (verificationError) {
        verificationEmailSent = false;
        console.error(
          "Could not send verification email to admin-created resident:",
          verificationError
        );
      }

      const batch = writeBatch(db);

      const userRef = doc(db, "users", residentId);
      const residentRef = doc(db, "residents", residentId);

      batch.set(userRef, {
        residentId: residentId,
        email: addResidentForm.email.trim().toLowerCase(),
        role: "resident",
        accountStatus: "active",
        mustChangePassword: true,
        createdByAdmin: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      batch.set(residentRef, {
        firstName: addResidentForm.firstName.trim(),
        middleName: addResidentForm.middleName.trim(),
        lastName: addResidentForm.lastName.trim(),
        suffix: addResidentForm.suffix.trim(),

        email: addResidentForm.email.trim().toLowerCase(),
        contactNumber:
          `+63${addResidentForm.contactNumber.trim()}`,
        emergencyContactNumber:
          `+63${addResidentForm.emergencyContactNumber.trim()}`,

        block: addResidentForm.block.trim(),
        lot: addResidentForm.lot.trim(),
        street: addResidentForm.street.trim(),
        phase: addResidentForm.phase.trim(),

        residentCategory: addResidentForm.residentCategory,
        propertyControlNumber:
          addResidentForm.propertyControlNumber.trim().toUpperCase(),

        propertyOwnerResidentId:
          addResidentForm.residentCategory === "renter"
            ? addResidentForm.propertyOwnerResidentId
            : "",
        propertyOwnerName:
          addResidentForm.residentCategory === "renter"
            ? addResidentForm.propertyOwnerName
            : "",

        homeownerResidentId:
          addResidentForm.residentCategory === "household"
            ? addResidentForm.homeownerResidentId
            : "",
        homeownerName:
          addResidentForm.residentCategory === "household"
            ? addResidentForm.homeownerName
            : "",
        relationshipToHomeowner:
          addResidentForm.residentCategory === "household"
            ? addResidentForm.relationshipToHomeowner.trim()
            : "",

        leaseStart:
          addResidentForm.residentCategory === "renter"
            ? addResidentForm.leaseStart
            : "",
        leaseEnd:
          addResidentForm.residentCategory === "renter"
            ? addResidentForm.leaseEnd
            : "",

        verificationStatus: "unverified",

        idType: "",
        idNumber: "",
        idImageFrontUrl: "",
        idImageBackUrl: "",
        proofOfBillingUrl: "",

        createdByAdmin: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await batch.commit();

      await signOut(secondaryAuth);

      const displayName = [
        addResidentForm.firstName.trim(),
        addResidentForm.middleName.trim(),
        addResidentForm.lastName.trim(),
        addResidentForm.suffix.trim(),
      ]
        .filter(Boolean)
        .join(" ");

      setCreatedResidentCredentials({
        name: displayName,
        email: addResidentForm.email.trim().toLowerCase(),
        temporaryPassword,
        verificationEmailSent,
      });

      setAddResidentForm({
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

        residentCategory: "owner",

        propertyControlNumber: "",

        propertyOwnerResidentId: "",
        propertyOwnerName: "",

        homeownerResidentId: "",
        homeownerName: "",
        relationshipToHomeowner: "",

        leaseStart: "",
        leaseEnd: "",
      });

      setAddResidentErrors({});
      setShowAddResident(false);

      setActionSuccess(
        verificationEmailSent
          ? `${displayName} was added successfully. A verification link was sent to the resident's email.`
          : `${displayName} was added successfully, but the verification email could not be sent. The resident can attempt to log in to request another verification link.`
      );
    } catch (error) {
      console.error("Error adding resident:", error);

      if (createdUser) {
        try {
          await deleteUser(createdUser);
        } catch (rollbackError) {
          console.error(
            "Could not roll back newly created Auth account:",
            rollbackError
          );
        }
      }

      if (secondaryAuth?.currentUser) {
        try {
          await signOut(secondaryAuth);
        } catch (signOutError) {
          console.error(
            "Could not sign out secondary Auth session:",
            signOutError
          );
        }
      }

      let message =
        "Could not create the resident account. Please try again.";

      switch (error?.code) {
        case "auth/email-already-in-use":
          message =
            "An account with this email address already exists in Firebase Authentication.";
          break;
        case "auth/invalid-email":
          message = "The email address is invalid.";
          break;
        case "auth/weak-password":
          message =
            "The generated temporary password was rejected. Please try again.";
          break;
        case "permission-denied":
        case "firestore/permission-denied":
          message =
            "The resident Auth account could not be saved to Firestore because your security rules do not allow the admin to create resident records.";
          break;
        default:
          if (error?.message) {
            message = error.message;
          }
      }

      setActionError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const selectCard = (card, status) => {
    setActiveCard(card);
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleStatusDropdownChange = (value) => {
    setStatusFilter(value);
    setActiveCard(value === "all" || value === "pending" || value === "active" ? value : null);
    setCurrentPage(1);
  };

  const totalResidents = residentsList.length;
  const pendingAccounts = residentsList.filter((r) => r.status === "pending").length;
  const activeResidents = residentsList.filter((r) => r.status === "active").length;
  const pendingVerification = residentsList.filter((r) => r.verification === "pending" || r.verification === "unverified").length;

  // TABLE FILTERING
  const filtered = residentsList.filter((r) => {
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const matchesVerification = activeCard !== "needsVerification" || r.verification !== "verified";
    const matchesSearch =
      search.trim() === "" ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesVerification && matchesSearch;
  });


  // REPORT HELPERS
  // Escape dynamic Firestore values before inserting them into printable HTML.
  const escapeReportHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const capitalizeReportValue = (value) => {
    const normalized = String(value || "Not provided").trim();

    if (!normalized) {
      return "Not provided";
    }

    return normalized
      .split(" ")
      .map((part) =>
        part ? part.charAt(0).toUpperCase() + part.slice(1) : part
      )
      .join(" ");
  };

  // REPORT TABLE BUILDER
  // Reuse this pattern on other admin pages that need printable tabular reports.
  const buildResidentReportTable = (rows, includePropertyControl = false) => {
    if (!rows.length) {
      return `
        <div class="empty-state">
          No resident records matched this report.
        </div>
      `;
    }

    return `
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Resident</th>
            <th>Email</th>
            <th>Contact</th>
            <th>Address</th>
            ${includePropertyControl ? "<th>Property Control No.</th>" : ""}
            <th>Category</th>
            <th>Verification</th>
            <th>Account Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (resident, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${escapeReportHtml(resident.name)}</td>
                  <td>${escapeReportHtml(resident.email)}</td>
                  <td>${escapeReportHtml(resident.contactNumber)}</td>
                  <td>${escapeReportHtml(resident.location)}</td>
                  ${
                    includePropertyControl
                      ? `<td>${escapeReportHtml(
                          resident.propertyControlNumber || "Not assigned"
                        )}</td>`
                      : ""
                  }
                  <td>${escapeReportHtml(
                    capitalizeReportValue(resident.category)
                  )}</td>
                  <td>${escapeReportHtml(
                    capitalizeReportValue(resident.verification)
                  )}</td>
                  <td>${escapeReportHtml(
                    capitalizeReportValue(resident.status)
                  )}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    `;
  };

  // REPORT SUMMARY BUILDER
  // Builds the summary content shown when the admin selects the Summary report type.
  const buildResidentSummaryReport = () => {
    const categoryCounts = {
      owner: residentsList.filter((resident) => resident.category === "owner")
        .length,
      renter: residentsList.filter((resident) => resident.category === "renter")
        .length,
      household: residentsList.filter(
        (resident) => resident.category === "household"
      ).length,
    };

    const accountStatusCounts = ACCOUNT_STATUSES.filter(
      (status) => status !== "all"
    ).map((status) => ({
      label: capitalizeReportValue(status),
      value: residentsList.filter((resident) => resident.status === status)
        .length,
    }));

    const verificationStatuses = [
      "verified",
      "pending",
      "unverified",
      "rejected",
    ];

    const verificationCounts = verificationStatuses.map((status) => ({
      label: capitalizeReportValue(status),
      value: residentsList.filter(
        (resident) => resident.verification === status
      ).length,
    }));

    return `
      <div class="summary-grid">
        <div class="summary-card">
          <span>Total Residents</span>
          <strong>${residentsList.length}</strong>
        </div>
        <div class="summary-card">
          <span>Property Owners</span>
          <strong>${categoryCounts.owner}</strong>
        </div>
        <div class="summary-card">
          <span>Renters</span>
          <strong>${categoryCounts.renter}</strong>
        </div>
        <div class="summary-card">
          <span>Household Members</span>
          <strong>${categoryCounts.household}</strong>
        </div>
      </div>

      <div class="summary-section">
        <h2>Account Status Breakdown</h2>
        <table class="compact-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${accountStatusCounts
              .map(
                (item) => `
                  <tr>
                    <td>${escapeReportHtml(item.label)}</td>
                    <td>${item.value}</td>
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      </div>

      <div class="summary-section">
        <h2>Verification Status Breakdown</h2>
        <table class="compact-table">
          <thead>
            <tr>
              <th>Verification Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${verificationCounts
              .map(
                (item) => `
                  <tr>
                    <td>${escapeReportHtml(item.label)}</td>
                    <td>${item.value}</td>
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  };

  // REPORT PRINTING
  // Prints through a hidden iframe so the browser print dialog works without popup permission.
  const printHtmlWithoutPopup = (html) => {
    const iframe = document.createElement("iframe");

    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.visibility = "hidden";

    document.body.appendChild(iframe);

    const iframeDocument =
      iframe.contentDocument || iframe.contentWindow?.document;

    if (!iframeDocument) {
      document.body.removeChild(iframe);
      setActionError(
        "The printable report could not be prepared. Please try again."
      );
      return;
    }

    iframeDocument.open();
    iframeDocument.write(html);
    iframeDocument.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1000);
      }
    }, 300);
  };

  // INDIVIDUAL RECORD REPORT
  // Builds and prints one resident's detailed record from the Resident Details modal.
  const handlePrintResident = (resident) => {
    if (!resident) return;

    setActionError("");

    const reportDate = new Date().toLocaleString("en-PH", {
      dateStyle: "long",
      timeStyle: "short",
    });

    const detailRows = [
      ["Full name", resident.name],
      ["Email", resident.email],
      ["Contact number", resident.contactNumber],
      ["Emergency contact", resident.emergencyContactNumber],
      ["Resident category", capitalizeReportValue(resident.category)],
      ["Account status", capitalizeReportValue(resident.status)],
      ["Verification status", capitalizeReportValue(resident.verification)],
      ["Address", resident.location],
      [
        "Property control number",
        resident.propertyControlNumber || "Not assigned",
      ],
      ["ID type", resident.idType || "Not provided"],
      ["ID number", resident.idNumber || "Not provided"],
    ];

    if (resident.category === "renter") {
      detailRows.push(
        ["Property owner", resident.propertyOwnerName || "Not provided"],
        ["Lease start", resident.leaseStart || "Not provided"],
        ["Lease end", resident.leaseEnd || "Not provided"]
      );
    }

    if (resident.category === "household") {
      detailRows.push(
        ["Homeowner", resident.homeownerName || "Not provided"],
        [
          "Relationship to homeowner",
          resident.relationshipToHomeowner || "Not provided",
        ]
      );
    }

    const residentReportHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${escapeReportHtml(resident.name)} | Resident Record</title>
          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 32px;
              font-family: Arial, Helvetica, sans-serif;
              color: #1f2937;
              background: #f8fafc;
            }

            .report-shell {
              max-width: 820px;
              margin: 0 auto;
              background: #ffffff;
              border: 1px solid #e5e7eb;
              border-radius: 16px;
              padding: 32px;
              box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
            }

            .toolbar {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 20px;
            }

            .print-button {
              border: none;
              border-radius: 999px;
              padding: 10px 18px;
              background: #f59e0b;
              color: white;
              font-size: 13px;
              font-weight: 700;
              cursor: pointer;
            }

            .report-header {
              display: flex;
              align-items: flex-start;
              justify-content: space-between;
              gap: 24px;
              padding-bottom: 20px;
              border-bottom: 2px solid #f59e0b;
              margin-bottom: 24px;
            }

            .brand {
              font-size: 12px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.12em;
              color: #d97706;
              margin-bottom: 8px;
            }

            h1 {
              margin: 0;
              font-size: 26px;
              color: #111827;
            }

            .subtitle {
              margin: 6px 0 0;
              color: #6b7280;
              font-size: 13px;
            }

            .meta {
              text-align: right;
              color: #6b7280;
              font-size: 11px;
              line-height: 1.6;
            }

            .details {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
            }

            .details th,
            .details td {
              border: 1px solid #e5e7eb;
              padding: 10px 12px;
              text-align: left;
              vertical-align: top;
            }

            .details th {
              width: 34%;
              background: #f3f4f6;
              color: #374151;
              font-weight: 700;
            }

            .footer {
              margin-top: 28px;
              padding-top: 14px;
              border-top: 1px solid #e5e7eb;
              color: #9ca3af;
              font-size: 10px;
              text-align: center;
            }

            @media print {
              @page {
                size: A4 portrait;
                margin: 14mm;
              }

              body {
                padding: 0;
                background: white;
              }

              .report-shell {
                max-width: none;
                border: none;
                border-radius: 0;
                padding: 0;
                box-shadow: none;
              }

              .toolbar {
                display: none;
              }
            }
          </style>
        </head>

        <body>
          <main class="report-shell">
            <header class="report-header">
              <div>
                <div class="brand">Subdiverse · Windward Hills</div>
                <h1>Resident Record</h1>
                <p class="subtitle">
                  ${escapeReportHtml(resident.name)}
                </p>
              </div>

              <div class="meta">
                <div><strong>Generated:</strong></div>
                <div>${escapeReportHtml(reportDate)}</div>
              </div>
            </header>

            <table class="details">
              <tbody>
                ${detailRows
                  .map(
                    ([label, value]) => `
                      <tr>
                        <th>${escapeReportHtml(label)}</th>
                        <td>${escapeReportHtml(value || "Not provided")}</td>
                      </tr>
                    `
                  )
                  .join("")}
              </tbody>
            </table>

            <div class="footer">
              Generated through the Subdiverse Resident Management System.
            </div>
          </main>
        </body>
      </html>
    `;

    printHtmlWithoutPopup(residentReportHtml);
  };

  // GENERATE REPORT
  // Selects the requested report type, builds its printable HTML, then opens the print dialog.
  // Other admin pages can follow this same pattern: choose type -> build content -> print.
  const handleGenerateReport = () => {
    setActionError("");

    const reportDate = new Date().toLocaleString("en-PH", {
      dateStyle: "long",
      timeStyle: "short",
    });

    let reportTitle = "Resident Master List";
    let reportDescription = "Complete list of all resident accounts.";
    let reportBody = buildResidentReportTable(residentsList);

    if (selectedReportType === "summary") {
      reportTitle = "Resident Summary Report";
      reportDescription =
        "Summary of resident categories, account statuses, and verification statuses.";
      reportBody = buildResidentSummaryReport();
    }

    if (selectedReportType === "property") {
      const propertyRows = [...residentsList].sort((a, b) => {
        const propertyA =
          a.propertyControlNumber || a.location || "ZZZZ";
        const propertyB =
          b.propertyControlNumber || b.location || "ZZZZ";

        const propertyComparison = propertyA.localeCompare(propertyB);

        if (propertyComparison !== 0) {
          return propertyComparison;
        }

        return a.name.localeCompare(b.name);
      });

      reportTitle = "Residents by Property";
      reportDescription =
        "Residents organized by their linked property control number and address.";
      reportBody = buildResidentReportTable(propertyRows, true);
    }

    if (selectedReportType === "filtered") {
      const filterParts = [];

      if (statusFilter !== "all") {
        filterParts.push(
          `Account status: ${capitalizeReportValue(statusFilter)}`
        );
      }

      if (activeCard === "needsVerification") {
        filterParts.push("Verification: Needs verification");
      }

      if (search.trim()) {
        filterParts.push(`Search: "${search.trim()}"`);
      }

      reportTitle = "Filtered Resident Report";
      reportDescription = filterParts.length
        ? `Current filters — ${filterParts.join(" · ")}`
        : "Current resident list with no additional filters applied.";
      reportBody = buildResidentReportTable(filtered);
    }

    const reportHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${escapeReportHtml(reportTitle)} | Subdiverse</title>
          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 32px;
              font-family: Arial, Helvetica, sans-serif;
              color: #1f2937;
              background: #f8fafc;
            }

            .report-shell {
              max-width: 1200px;
              margin: 0 auto;
              background: #ffffff;
              border: 1px solid #e5e7eb;
              border-radius: 16px;
              padding: 32px;
              box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
            }

            .report-header {
              display: flex;
              align-items: flex-start;
              justify-content: space-between;
              gap: 24px;
              padding-bottom: 20px;
              border-bottom: 2px solid #f59e0b;
              margin-bottom: 24px;
            }

            .brand {
              font-size: 13px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.12em;
              color: #d97706;
              margin-bottom: 8px;
            }

            h1 {
              margin: 0;
              font-size: 28px;
              color: #111827;
            }

            .description {
              margin: 8px 0 0;
              color: #6b7280;
              font-size: 13px;
              line-height: 1.5;
            }

            .meta {
              text-align: right;
              color: #6b7280;
              font-size: 12px;
              line-height: 1.6;
              min-width: 210px;
            }

            .toolbar {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 20px;
            }

            .print-button {
              border: none;
              border-radius: 999px;
              padding: 10px 18px;
              background: #f59e0b;
              color: white;
              font-size: 13px;
              font-weight: 700;
              cursor: pointer;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
            }

            th,
            td {
              border: 1px solid #e5e7eb;
              padding: 9px 8px;
              vertical-align: top;
              text-align: left;
            }

            th {
              background: #f3f4f6;
              color: #374151;
              font-weight: 700;
            }

            tbody tr:nth-child(even) {
              background: #fafafa;
            }

            .summary-grid {
              display: grid;
              grid-template-columns: repeat(4, minmax(0, 1fr));
              gap: 12px;
              margin-bottom: 28px;
            }

            .summary-card {
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              padding: 16px;
              background: #fafafa;
            }

            .summary-card span {
              display: block;
              color: #6b7280;
              font-size: 11px;
              margin-bottom: 8px;
            }

            .summary-card strong {
              font-size: 24px;
              color: #111827;
            }

            .summary-section {
              margin-top: 24px;
            }

            .summary-section h2 {
              font-size: 16px;
              margin: 0 0 10px;
            }

            .compact-table {
              max-width: 520px;
            }

            .empty-state {
              padding: 40px;
              text-align: center;
              border: 1px dashed #d1d5db;
              border-radius: 12px;
              color: #6b7280;
            }

            .footer {
              margin-top: 28px;
              padding-top: 14px;
              border-top: 1px solid #e5e7eb;
              color: #9ca3af;
              font-size: 10px;
              text-align: center;
            }

            @media print {
              @page {
                size: A4 landscape;
                margin: 10mm;
              }

              body {
                padding: 0;
                background: white;
              }

              .report-shell {
                max-width: none;
                border: none;
                border-radius: 0;
                padding: 0;
                box-shadow: none;
              }

              .toolbar {
                display: none;
              }

              table {
                font-size: 9px;
              }

              th,
              td {
                padding: 6px;
              }

              thead {
                display: table-header-group;
              }

              tr {
                break-inside: avoid;
              }
            }
          </style>
        </head>

        <body>
          <main class="report-shell">
            <header class="report-header">
              <div>
                <div class="brand">Subdiverse · Windward Hills</div>
                <h1>${escapeReportHtml(reportTitle)}</h1>
                <p class="description">
                  ${escapeReportHtml(reportDescription)}
                </p>
              </div>

              <div class="meta">
                <div><strong>Generated:</strong> ${escapeReportHtml(
                  reportDate
                )}</div>
                <div><strong>Total records:</strong> ${
                  selectedReportType === "filtered"
                    ? filtered.length
                    : residentsList.length
                }</div>
              </div>
            </header>

            ${reportBody}

            <div class="footer">
              Generated through the Subdiverse Resident Management System.
            </div>
          </main>
        </body>
      </html>
    `;

    printHtmlWithoutPopup(reportHtml);
    setShowReportModal(false);
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedResidents = filtered.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-lg font-medium text-foreground">Syncing with Firestore...</p>
          <p className="text-sm text-muted-foreground mt-1">Please wait while we fetch real-time resident data.</p>
        </div>
      </div>
    );
  }

  const updateAccountStatus = async (residentId, newStatus) => {
    setActionLoading(true);
    setActionError("");
    setActionSuccess("");

    try {
      await updateDoc(doc(db, "users", residentId), {
        accountStatus: newStatus,
      });

      setOpenMenuId(null);
      setPendingAction(null);

      if (selectedResident?.id === residentId) {
        setSelectedResident((prev) =>
          prev ? { ...prev, status: newStatus } : prev
        );
      }

      setActionSuccess(
        `Account status successfully changed to ${newStatus}.`
      );
    } catch (error) {
      console.error("Error updating account status:", error);

      setActionError(
        "Could not update the account status. Please check your Firestore rules and try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const updateVerificationStatus = async (
    residentId,
    newStatus
  ) => {
    setActionLoading(true);
    setActionError("");
    setActionSuccess("");

    try {
      const residentRef = doc(
        db,
        "residents",
        residentId
      );

      await updateDoc(residentRef, {
        verificationStatus: newStatus,
      });

      setOpenMenuId(null);
      setPendingAction(null);

      setActionSuccess(
        `Verification status successfully changed to ${newStatus}.`
      );
    } catch (error) {
      console.error(
        "Error updating verification status:",
        error
      );

      setActionError(
        "Could not update the verification status."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const getAccountActions = (resident) => {
    switch (resident.status) {
      case "pending":
        return [
          {
            label: "Approve / Activate",
            newStatus: "active",
          },
          {
            label: "Reject Registration",
            newStatus: "rejected",
            danger: true,
          },
        ];

      case "active":
        return [
          {
            label: "Freeze Account",
            newStatus: "frozen",
          },
          {
            label: "Suspend Account",
            newStatus: "suspended",
            danger: true,
          },
          {
            label: "Archive Account",
            newStatus: "archived",
            danger: true,
          },
        ];

      case "frozen":
        return [
          {
            label: "Reactivate Account",
            newStatus: "active",
          },
          {
            label: "Archive Account",
            newStatus: "archived",
            danger: true,
          },
        ];

      case "suspended":
        return [
          {
            label: "Reactivate Account",
            newStatus: "active",
          },
          {
            label: "Archive Account",
            newStatus: "archived",
            danger: true,
          },
        ];

      case "archived":
        return [
          {
            label: "Restore Account",
            newStatus: "active",
          },
        ];

      case "rejected":
        return [
          {
            label: "Reopen Application",
            newStatus: "pending",
          },
        ];

      default:
        return [];
    }
  };

  const getVerificationActions = (resident) => {
    switch (resident.verification) {
      case "verified":
        return [
          {
            label: "Require Reverification",
            type: "verification",
            newStatus: "unverified",
            danger: true,
          },
        ];

      case "pending":
      case "unverified":
      case "rejected":
      default:
        return [
          {
            label: "Mark as Verified",
            type: "verification",
            newStatus: "verified",
          },
        ];
    }
  };

  const requestAction = (resident, action) => {
    setActionError("");
    setActionSuccess("");
    setOpenMenuId(null);
    setOpenStatusId(null);
    setOpenVerificationId(null);

    setPendingAction({
      residentId: resident.id,
      residentName: resident.name,
      type: action.type || "account",
      label: action.label,
      currentStatus:
        (action.type || "account") === "account"
          ? resident.status
          : resident.verification,
      newStatus: action.newStatus,
      danger: action.danger || false,
    });
  };

  const confirmPendingAction = async () => {
    if (!pendingAction) return;

    if (pendingAction.type === "verification") {
      await updateVerificationStatus(
        pendingAction.residentId,
        pendingAction.newStatus
      );
      return;
    }

    await updateAccountStatus(
      pendingAction.residentId,
      pendingAction.newStatus
    );
  };
  return (
    <AdminPageLayout
      title="Manage residents"
      subtitle="Review sign-ups, verify IDs, and manage account status"
      action={
        // PAGE ACTION BUTTONS
        // Keep page-level actions inside AdminPageLayout's action prop for consistent admin pages.
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* SECONDARY PAGE ACTION: Opens the report selection modal. */}
          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="px-4 py-2 text-sm font-medium rounded-buttons border border-border bg-card hover:bg-muted flex items-center justify-center gap-2"
          >
            <FileText size={16} />
            Generate report
          </button>

          {/* PRIMARY PAGE ACTION: Opens the main create/add modal. */}
          <button
            type="button"
            onClick={() => setShowAddResident(true)}
            className="btn-primary !px-4 !py-2 !text-sm !font-medium w-full sm:w-auto"
          >
            Add resident
          </button>
        </div>
      }
    >
      {actionError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {actionError}
        </div>
      )}

      {actionSuccess && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {actionSuccess}
        </div>
      )}

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          icon={Users}
          gradient="linear-gradient(135deg, #F9A825, #F57F17)"
          textColor="#ffffff"
          subTextColor="rgba(255,255,255,0.85)"
          label="Total residents"
          value={totalResidents.toLocaleString()}
          description="All resident accounts on the platform, regardless of status."
          onClick={() => selectCard("all", "all")}
          isActive={activeCard === "all"}
        />
        <MetricCard
          icon={Clock}
          gradient="linear-gradient(135deg, #FDD835, #F9A825)"
          textColor="#5D4037"
          subTextColor="rgba(93,64,55,0.75)"
          label="Pending accounts"
          value={pendingAccounts.toLocaleString()}
          description="Sign-ups waiting for admin approval before they can log in."
          onClick={() => selectCard("pending", "pending")}
          isActive={activeCard === "pending"}
        />
        <MetricCard
          icon={CheckCircle2}
          gradient="linear-gradient(135deg, #9CCC65, #2E7D32)"
          textColor="#ffffff"
          subTextColor="rgba(255,255,255,0.85)"
          label="Active residents"
          value={activeResidents.toLocaleString()}
          description="Approved accounts in good standing, able to book and transact."
          onClick={() => selectCard("active", "active")}
          isActive={activeCard === "active"}
        />
        <MetricCard
          icon={BadgeCheck}
          gradient="linear-gradient(135deg, #FF8A65, #E64A19)"
          textColor="#ffffff"
          subTextColor="rgba(255,255,255,0.85)"
          label="Pending verification"
          value={pendingVerification.toLocaleString()}
          description="Valid ID submitted but not yet reviewed by an admin."
          onClick={() => selectCard("needsVerification", "all")}
          isActive={activeCard === "needsVerification"}
        />
      </div>

      {/* FILTERS AND SEARCH */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-3">
          <label className="text-sm text-muted-foreground whitespace-nowrap">Account status</label>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusDropdownChange(e.target.value)}
            className="text-sm border border-input rounded-buttons px-3 py-2 bg-card focus:outline-none focus:ring-2 focus:ring-ring/30"
          >
            {ACCOUNT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All statuses" : s[0].toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="hidden sm:block flex-1" />

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search name or block/lot"
            className="text-sm border border-input rounded-buttons pl-9 pr-3 py-2 w-full sm:w-64 bg-card focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
      </div>

      {/* RESIDENT TABLE */}
      <div className="bg-card rounded-cards border border-border shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted text-muted-foreground">
              <th className="text-left font-medium px-4 py-3 min-w-[220px]">Resident</th>
              <th className="hidden lg:table-cell text-left font-medium px-4 py-3 min-w-[180px]">Location</th>
              <th className="hidden md:table-cell text-left font-medium px-4 py-3 min-w-[110px]">Category</th>
              <th className="text-left font-medium px-4 py-3 min-w-[150px]">Verification</th>
              <th className="text-left font-medium px-4 py-3 min-w-[140px]">Account status</th>
              <th className="min-w-[56px]" />
            </tr>
          </thead>
          <tbody>
            {paginatedResidents.map((r) => (
              <tr
                key={r.id}
                className="border-t border-border hover:bg-muted/60 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-medium flex-shrink-0">
                      {initials(r.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{r.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{r.email}</p>
                      <p className="lg:hidden text-xs text-muted-foreground truncate mt-0.5">{r.location}</p>
                    </div>
                  </div>
                </td>
                <td className="hidden lg:table-cell px-4 py-3 text-muted-foreground">{r.location}</td>
                <td className="hidden md:table-cell px-4 py-3">
                  <span className={`inline-block px-2.5 py-1 rounded-buttons text-xs capitalize ${CATEGORY_STYLES[r.category] || "bg-gray-400 text-white"}`}>
                    {r.category}
                  </span>
                </td>
                <td className="px-4 py-3 relative">
                  {/* STATUS BUTTON: Opens a portal dropdown for verification actions. */}
                  <button
                    ref={(el) => (verificationButtonRefs.current[r.id] = el)}
                    type="button"
                    onClick={() => {
                      setOpenVerificationId(
                        openVerificationId === r.id ? null : r.id
                      );
                      setOpenStatusId(null);
                      setOpenMenuId(null);
                    }}
                    title="Click to change verification status"
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-buttons text-xs capitalize ${VERIFICATION_STYLES[r.verification] ||
                      "bg-gray-400 text-white"
                      }`}
                  >
                    <FileWarning size={14} />
                    {r.verification}
                    <ChevronDown size={12} />
                  </button>

                  {openVerificationId === r.id && (
                    <DropdownPortal
                      anchorRef={{ current: verificationButtonRefs.current[r.id] }}
                      onClose={() => setOpenVerificationId(null)}
                    >
                      <div className="w-48 rounded-xl border border-border bg-card shadow-xl py-1 text-left">
                        <div className="px-3 py-2 text-[11px] font-medium text-muted-foreground">
                          Change verification
                        </div>

                        {getVerificationActions(r).map((action) => (
                          <button
                            key={action.newStatus}
                            type="button"
                            disabled={actionLoading}
                            onClick={() => requestAction(r, action)}
                            className={`w-full px-3 py-2 text-xs text-left disabled:opacity-50 ${action.danger
                              ? "text-red-600 hover:bg-red-50"
                              : "hover:bg-muted"
                              }`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </DropdownPortal>
                  )}
                </td>
                <td className="px-4 py-3 relative">
                  {/* STATUS BUTTON: Opens a portal dropdown for account-status actions. */}
                  <button
                    ref={(el) => (statusButtonRefs.current[r.id] = el)}
                    type="button"
                    onClick={() => {
                      setOpenStatusId(
                        openStatusId === r.id ? null : r.id
                      );
                      setOpenVerificationId(null);
                      setOpenMenuId(null);
                    }}
                    title="Click to change account status"
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-buttons text-xs capitalize ${STATUS_STYLES[r.status] ||
                      "bg-gray-400 text-white"
                      }`}
                  >
                    {r.status}
                    <ChevronDown size={12} />
                  </button>

                  {openStatusId === r.id && (
                    <DropdownPortal
                      anchorRef={{ current: statusButtonRefs.current[r.id] }}
                      onClose={() => setOpenStatusId(null)}
                    >
                      <div className="w-48 rounded-xl border border-border bg-card shadow-xl py-1 text-left">
                        <div className="px-3 py-2 text-[11px] font-medium text-muted-foreground">
                          Change account status
                        </div>

                        {getAccountActions(r).map((action) => (
                          <button
                            key={action.newStatus}
                            type="button"
                            disabled={actionLoading}
                            onClick={() =>
                              requestAction(r, {
                                ...action,
                                type: "account",
                              })
                            }
                            className={`w-full px-3 py-2 text-xs text-left disabled:opacity-50 ${action.danger
                              ? "text-red-600 hover:bg-red-50"
                              : "hover:bg-muted"
                              }`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </DropdownPortal>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {/* ROW ACTION BUTTON: Opens the More Actions menu for this record. */}
                  <button
                    ref={(el) => (menuButtonRefs.current[r.id] = el)}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === r.id ? null : r.id);
                      setOpenStatusId(null);
                      setOpenVerificationId(null);
                    }}
                    className="w-8 h-8 inline-flex items-center justify-center rounded-buttons hover:bg-muted"
                    aria-label="More actions"
                  >
                    <MoreVertical size={16} className="text-muted-foreground" />
                  </button>

                  {openMenuId === r.id && (
                    <DropdownPortal
                      anchorRef={{ current: menuButtonRefs.current[r.id] }}
                      onClose={() => setOpenMenuId(null)}
                      align="right"
                    >
                      <div
                        className="w-40 rounded-xl border border-border bg-card shadow-xl py-1 text-left"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedResident(r);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-3 py-2 text-xs text-left hover:bg-muted"
                        >
                          View details
                        </button>
                      </div>
                    </DropdownPortal>
                  )}
                </td>
              </tr>
            ))}
            {paginatedResidents.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">
                  No residents match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 text-sm text-muted-foreground">
        <span>
          Showing {filtered.length === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={safeCurrentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            className="w-8 h-8 rounded-buttons border border-border flex items-center justify-center hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>

          <span>Page {safeCurrentPage} of {totalPages}</span>

          <button
            type="button"
            disabled={safeCurrentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            className="w-8 h-8 rounded-buttons border border-border flex items-center justify-center hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* CONFIRM ACTION MODAL
          Use for destructive or important status changes that require admin confirmation. */}
      {pendingAction && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Confirm action
            </h2>

            <p className="text-sm text-muted-foreground mt-2 leading-6">
              Are you sure you want to{" "}
              <span className="font-medium text-foreground">
                {pendingAction.label.toLowerCase()}
              </span>{" "}
              for{" "}
              <span className="font-medium text-foreground">
                {pendingAction.residentName}
              </span>
              ?
            </p>

            <div className="mt-4 rounded-xl bg-muted px-4 py-3 text-xs text-muted-foreground">
              {pendingAction.type === "account"
                ? `Account status: ${pendingAction.currentStatus} → ${pendingAction.newStatus}`
                : `Verification status: ${pendingAction.currentStatus} → ${pendingAction.newStatus}`}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setPendingAction(null)}
                className="px-4 py-2 text-sm rounded-buttons border border-border hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={confirmPendingAction}
                className={`px-4 py-2 text-sm font-medium rounded-buttons text-white disabled:opacity-50 ${pendingAction.danger
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-primary hover:brightness-105"
                  }`}
              >
                {actionLoading ? "Updating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESIDENT DETAILS MODAL
          Displays full record details and record-specific actions such as Print Resident. */}
      {selectedResident && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-card border border-border shadow-2xl">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Resident details</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Review resident profile, verification, and account information.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedResident(null)}
                className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <p className="text-lg font-semibold text-foreground">{selectedResident.name}</p>
                <p className="text-sm text-muted-foreground">{selectedResident.email}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <DetailItem label="Account status" value={selectedResident.status} />
                <DetailItem label="Verification status" value={selectedResident.verification} />
                <DetailItem label="Resident category" value={selectedResident.category} />
                <DetailItem label="Contact number" value={selectedResident.contactNumber} />
                <DetailItem label="Emergency contact" value={selectedResident.emergencyContactNumber} />
                <DetailItem label="Address" value={selectedResident.location} />
                <DetailItem label="ID type" value={selectedResident.idType} />
                <DetailItem label="ID number" value={selectedResident.idNumber} />
              </div>

              {(selectedResident.idImageFrontUrl || selectedResident.idImageBackUrl) && (
                <div>
                  <h3 className="text-sm font-semibold mb-3">
                    Submitted ID images
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedResident.idImageFrontUrl && (
                      <div className="rounded-xl border border-border p-3 bg-muted/30">
                        <p className="text-xs font-medium mb-2">
                          Front of ID
                        </p>

                        <img
                          src={selectedResident.idImageFrontUrl}
                          alt="Front of submitted ID"
                          onClick={() =>
                            setPreviewImage(selectedResident.idImageFrontUrl)
                          }
                          className="w-full h-56 object-contain rounded-lg bg-black/5 cursor-zoom-in hover:opacity-90 transition"
                        />
                      </div>
                    )}

                    {selectedResident.idImageBackUrl && (
                      <div className="rounded-xl border border-border p-3 bg-muted/30">
                        <p className="text-xs font-medium mb-2">
                          Back of ID
                        </p>

                        <img
                          src={selectedResident.idImageBackUrl}
                          alt="Back of submitted ID"
                          onClick={() =>
                            setPreviewImage(selectedResident.idImageBackUrl)
                          }
                          className="w-full h-56 object-contain rounded-lg bg-black/5 cursor-zoom-in hover:opacity-90 transition"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                {/* MODAL ACTION BUTTON: Prints or saves the selected resident record as PDF. */}
                <button
                  type="button"
                  onClick={() => handlePrintResident(selectedResident)}
                  className="px-4 py-2 text-xs font-medium rounded-buttons border border-border hover:bg-muted flex items-center gap-2"
                >
                  <FileText size={14} />
                  Print resident
                </button>

                {selectedResident.status !== "active" && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => updateAccountStatus(selectedResident.id, "active")}
                    className="btn-primary !px-4 !py-2 !text-xs disabled:opacity-50"
                  >
                    Approve / Activate
                  </button>
                )}

                {selectedResident.verification !== "verified" && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => updateVerificationStatus(selectedResident.id, "verified")}
                    className="px-4 py-2 text-xs font-medium rounded-buttons border border-border hover:bg-muted disabled:opacity-50"
                  >
                    Mark as verified
                  </button>
                )}


              </div>
            </div>
          </div>
        </div>
      )}
      {/* IMAGE PREVIEW MODAL
          Full-screen preview for uploaded verification images. */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setPreviewImage(null)}
        >
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            className="absolute top-5 right-5 text-white text-3xl"
          >
            ×
          </button>

          <img
            src={previewImage}
            alt="Enlarged ID preview"
            onClick={(e) => e.stopPropagation()}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
      {/* GENERATE REPORT MODAL
          Lets the admin choose a report type before calling handleGenerateReport. */}
      {showReportModal && (
        <div
          className="fixed inset-0 z-[75] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowReportModal(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-card border border-border shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-border px-6 py-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Generate resident report
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Choose the report you want to open in a printable view.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-3">
              {[
                {
                  value: "master",
                  title: "Resident Master List",
                  description:
                    "Complete list of all resident accounts and their current statuses.",
                },
                {
                  value: "summary",
                  title: "Resident Summary",
                  description:
                    "Totals by resident category, account status, and verification status.",
                },
                {
                  value: "property",
                  title: "Residents by Property",
                  description:
                    "Resident list organized by property control number and address.",
                },
                {
                  value: "filtered",
                  title: "Current Filtered List",
                  description:
                    "Uses the account status, verification card, and search filters currently applied.",
                },
              ].map((report) => (
                <label
                  key={report.value}
                  className={`block rounded-xl border p-4 cursor-pointer transition ${
                    selectedReportType === report.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/60"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="residentReportType"
                      value={report.value}
                      checked={selectedReportType === report.value}
                      onChange={(e) =>
                        setSelectedReportType(e.target.value)
                      }
                      className="mt-1"
                    />

                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {report.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 leading-5">
                        {report.description}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="border-t border-border px-6 py-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 text-sm font-medium rounded-buttons border border-border hover:bg-muted"
              >
                Cancel
              </button>

              {/* MODAL PRIMARY ACTION: Generates the selected report and opens print preview. */}
              <button
                type="button"
                onClick={handleGenerateReport}
                className="btn-primary !px-5 !py-2 !text-sm"
              >
                Open report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD RESIDENT MODAL
          Main create-record modal. Keep Header -> Form Sections -> Footer Actions structure
          for similar create/edit modals on other admin pages. */}
      {showAddResident && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border shadow-2xl">

            <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Add resident
                </h2>

                <p className="text-xs text-muted-foreground mt-1">
                  Create a new resident record and community account.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowAddResident(false);
                  setAddResidentErrors({});
                  setActionError("");
                }}
                className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleAddResidentSubmit}
              noValidate
              className="p-6 space-y-8"
            >

              <section>
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  Resident category
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {["owner", "renter", "household"].map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        setAddResidentForm((prev) => ({
                          ...prev,
                          residentCategory: category,
                          block: category === "owner" ? prev.block : "",
                          lot: category === "owner" ? prev.lot : "",
                          street: category === "owner" ? prev.street : "",
                          phase: category === "owner" ? prev.phase : "",
                          propertyControlNumber:
                            category === "owner"
                              ? generatePropertyControlNumber({
                                  phase: prev.phase,
                                  block: prev.block,
                                  lot: prev.lot,
                                })
                              : "",
                          propertyOwnerResidentId: "",
                          propertyOwnerName: "",
                          homeownerResidentId: "",
                          homeownerName: "",
                          relationshipToHomeowner: "",
                          leaseStart: "",
                          leaseEnd: "",
                        }));

                        setAddResidentErrors({});
                        setActionError("");
                      }}
                      className={`px-4 py-3 rounded-xl border text-sm capitalize ${addResidentForm.residentCategory === category
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-muted"
                        }`}
                    >
                      {category === "household"
                        ? "Household member"
                        : category}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  Personal information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    label="First name"
                    placeholder="e.g. Juan"
                    value={addResidentForm.firstName}
                    error={addResidentErrors.firstName}
                    onChange={(value) => {
                      const lettersOnly = value.replace(/[^A-Za-z\s]/g, "");
                      setAddResidentForm((prev) => ({
                        ...prev,
                        firstName: lettersOnly,
                      }));
                      clearAddResidentError("firstName");
                    }}
                    required
                  />

                  <FormInput
                    label="Middle name"
                    placeholder="e.g. Santos"
                    value={addResidentForm.middleName}
                    error={addResidentErrors.middleName}
                    onChange={(value) => {
                      const lettersOnly = value.replace(/[^A-Za-z\s]/g, "");
                      setAddResidentForm((prev) => ({
                        ...prev,
                        middleName: lettersOnly,
                      }));
                      clearAddResidentError("middleName");
                    }}
                  />

                  <FormInput
                    label="Last name"
                    placeholder="e.g. Dela Cruz"
                    value={addResidentForm.lastName}
                    error={addResidentErrors.lastName}
                    onChange={(value) => {
                      const lettersOnly = value.replace(/[^A-Za-z\s]/g, "");
                      setAddResidentForm((prev) => ({
                        ...prev,
                        lastName: lettersOnly,
                      }));
                      clearAddResidentError("lastName");
                    }}
                    required
                  />

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Suffix
                    </label>
                    <select
                      value={addResidentForm.suffix}
                      onChange={(e) => {
                        setAddResidentForm((prev) => ({
                          ...prev,
                          suffix: e.target.value,
                        }));
                        clearAddResidentError("suffix");
                      }}
                      className="w-full rounded-buttons border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                    >
                      <option value="">None</option>
                      <option value="Jr.">Jr.</option>
                      <option value="Sr.">Sr.</option>
                      <option value="II">II</option>
                      <option value="III">III</option>
                      <option value="IV">IV</option>
                      <option value="V">V</option>
                    </select>
                    {addResidentErrors.suffix && (
                      <p className="text-[11px] text-red-500 mt-1.5">
                        {addResidentErrors.suffix}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  Contact information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    label="Email address"
                    placeholder="e.g. juandelacruz@gmail.com"
                    type="email"
                    value={addResidentForm.email}
                    error={addResidentErrors.email}
                    onChange={(value) => {
                      setAddResidentForm((prev) => ({
                        ...prev,
                        email: value,
                      }));
                      clearAddResidentError("email");
                    }}
                    required
                  />

                  <PhoneFormInput
                    label="Contact number"
                    prefix="+63"
                    placeholder="917 123 4567"
                    value={formatPhoneNumber(addResidentForm.contactNumber)}
                    error={addResidentErrors.contactNumber}
                    inputMode="numeric"
                    onChange={(value) => {
                      const numbersOnly = value
                        .replace(/\D/g, "")
                        .slice(0, 10);

                      setAddResidentForm((prev) => ({
                        ...prev,
                        contactNumber: numbersOnly,
                      }));
                      clearAddResidentError("contactNumber");
                    }}
                    helperText="Enter the 10 digits after +63."
                    required
                  />

                  <PhoneFormInput
                    label="Emergency contact"
                    prefix="+63"
                    placeholder="917 987 6543"
                    value={formatPhoneNumber(addResidentForm.emergencyContactNumber)}
                    error={addResidentErrors.emergencyContactNumber}
                    inputMode="numeric"
                    onChange={(value) => {
                      const numbersOnly = value
                        .replace(/\D/g, "")
                        .slice(0, 10);

                      setAddResidentForm((prev) => ({
                        ...prev,
                        emergencyContactNumber: numbersOnly,
                      }));
                      clearAddResidentError("emergencyContactNumber");
                    }}
                    helperText="Enter the 10 digits after +63."
                    required
                  />
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  Property information
                </h3>

                {addResidentForm.residentCategory !== "owner" && (
                  <div className="mb-4 rounded-xl border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
                    Property details are automatically inherited from the selected owner account.
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    label="Block"
                    placeholder="e.g. Block 71"
                    value={addResidentForm.block}
                    error={addResidentErrors.block}
                    disabled={addResidentForm.residentCategory !== "owner"}
                    onChange={(value) => {
                      setAddResidentForm((prev) => ({
                        ...prev,
                        block: value,
                        propertyControlNumber:
                          prev.residentCategory === "owner"
                            ? generatePropertyControlNumber({
                                phase: prev.phase,
                                block: value,
                                lot: prev.lot,
                              })
                            : prev.propertyControlNumber,
                      }));
                      clearAddResidentError("block");
                      clearAddResidentError("propertyControlNumber");
                    }}
                    required
                  />

                  <FormInput
                    label="Lot"
                    placeholder="e.g. Lot 12"
                    value={addResidentForm.lot}
                    error={addResidentErrors.lot}
                    disabled={addResidentForm.residentCategory !== "owner"}
                    onChange={(value) => {
                      setAddResidentForm((prev) => ({
                        ...prev,
                        lot: value,
                        propertyControlNumber:
                          prev.residentCategory === "owner"
                            ? generatePropertyControlNumber({
                                phase: prev.phase,
                                block: prev.block,
                                lot: value,
                              })
                            : prev.propertyControlNumber,
                      }));
                      clearAddResidentError("lot");
                      clearAddResidentError("propertyControlNumber");
                    }}
                    required
                  />

                  <FormInput
                    label="Street"
                    placeholder="e.g. Timothy Street"
                    value={addResidentForm.street}
                    error={addResidentErrors.street}
                    disabled={addResidentForm.residentCategory !== "owner"}
                    onChange={(value) => {
                      setAddResidentForm((prev) => ({
                        ...prev,
                        street: value,
                      }));
                      clearAddResidentError("street");
                    }}
                    required
                  />

                  <FormInput
                    label="Phase"
                    placeholder="e.g. Phase 2"
                    value={addResidentForm.phase}
                    error={addResidentErrors.phase}
                    disabled={addResidentForm.residentCategory !== "owner"}
                    onChange={(value) => {
                      setAddResidentForm((prev) => ({
                        ...prev,
                        phase: value,
                        propertyControlNumber:
                          prev.residentCategory === "owner"
                            ? generatePropertyControlNumber({
                                phase: value,
                                block: prev.block,
                                lot: prev.lot,
                              })
                            : prev.propertyControlNumber,
                      }));
                      clearAddResidentError("phase");
                      clearAddResidentError("propertyControlNumber");
                    }}
                    required
                  />

                  <FormInput
                    label="Property control number"
                    placeholder="Generated automatically"
                    value={addResidentForm.propertyControlNumber}
                    error={addResidentErrors.propertyControlNumber}
                    helperText={
                      addResidentForm.residentCategory === "owner"
                        ? "Automatically generated from Phase, Block, and Lot."
                        : "Inherited from the selected owner account."
                    }
                    disabled
                    onChange={() => {}}
                    required={addResidentForm.residentCategory === "owner"}
                  />
                </div>
              </section>

              {addResidentForm.residentCategory === "renter" && (
                <section>
                  <h3 className="text-sm font-semibold text-foreground mb-4">
                    Rental information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <OwnerSelect
                      label="Property owner"
                      value={addResidentForm.propertyOwnerResidentId}
                      owners={ownerOptions}
                      error={addResidentErrors.propertyOwnerResidentId}
                      onChange={(ownerId) =>
                        handleLinkedOwnerSelect(ownerId, "renter")
                      }
                    />

                    <FormInput
                      label="Lease start"
                      type="date"
                      value={addResidentForm.leaseStart}
                      error={addResidentErrors.leaseStart}
                      max={addResidentForm.leaseEnd || undefined}
                      onChange={(value) => {
                        setAddResidentForm((prev) => ({
                          ...prev,
                          leaseStart: value,
                          leaseEnd:
                            prev.leaseEnd && prev.leaseEnd < value
                              ? ""
                              : prev.leaseEnd,
                        }));

                        setAddResidentErrors((prev) => ({
                          ...prev,
                          leaseStart: "",
                          leaseEnd: "",
                        }));
                      }}
                      helperText="Enter the date when the resident's current lease began."
                      required
                    />

                    <FormInput
                      label="Lease end"
                      type="date"
                      value={addResidentForm.leaseEnd}
                      error={addResidentErrors.leaseEnd}
                      min={addResidentForm.leaseStart || today}
                      onChange={(value) => {
                        setAddResidentForm((prev) => ({
                          ...prev,
                          leaseEnd: value,
                        }));
                        clearAddResidentError("leaseEnd");
                      }}
                      helperText="The lease end date cannot be earlier than the lease start date or already expired."
                      required
                    />
                  </div>
                </section>
              )}

              {addResidentForm.residentCategory === "household" && (
                <section>
                  <h3 className="text-sm font-semibold text-foreground mb-4">
                    Household information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <OwnerSelect
                      label="Homeowner"
                      value={addResidentForm.homeownerResidentId}
                      owners={ownerOptions}
                      error={addResidentErrors.homeownerResidentId}
                      onChange={(ownerId) =>
                        handleLinkedOwnerSelect(ownerId, "household")
                      }
                    />

                    <FormInput
                      label="Relationship to homeowner"
                      placeholder="e.g. Daughter, Son, Spouse"
                      value={addResidentForm.relationshipToHomeowner}
                      error={addResidentErrors.relationshipToHomeowner}
                      onChange={(value) => {
                        setAddResidentForm((prev) => ({
                          ...prev,
                          relationshipToHomeowner: value,
                        }));
                        clearAddResidentError("relationshipToHomeowner");
                      }}
                      required
                    />
                  </div>
                </section>
              )}

              <div className="flex justify-end gap-2 pt-5 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddResident(false);
                    setAddResidentErrors({});
                    setActionError("");
                  }}
                  className="px-4 py-2 text-sm rounded-buttons border border-border hover:bg-muted"
                >
                  Cancel
                </button>

                {/* MODAL PRIMARY ACTION: Submits the validated Add Resident form. */}
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary !px-5 !py-2 !text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? "Creating account..." : "Add resident"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* CREATED ACCOUNT CREDENTIALS MODAL
          Shown once after successful account creation so the admin can copy temporary credentials. */}
      {createdResidentCredentials && (
        <div className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Resident account created
            </h2>

            <p className="text-sm text-muted-foreground mt-2 leading-6">
              Give these temporary login credentials to the resident. They
              must verify their email first, then they can log in using the
              temporary password and change it later in User Settings.
            </p>

            <div className="mt-5 space-y-3">
              <div className="rounded-xl bg-muted px-4 py-3">
                <p className="text-[11px] text-muted-foreground">Resident</p>
                <p className="text-sm font-medium text-foreground mt-1">
                  {createdResidentCredentials.name}
                </p>
              </div>

              <div className="rounded-xl bg-muted px-4 py-3">
                <p className="text-[11px] text-muted-foreground">Email</p>
                <p className="text-sm font-medium text-foreground mt-1 break-all">
                  {createdResidentCredentials.email}
                </p>
              </div>

              <div className="rounded-xl bg-muted px-4 py-3">
                <p className="text-[11px] text-muted-foreground">
                  Temporary password
                </p>
                <div className="flex items-center justify-between gap-3 mt-1">
                  <code className="text-sm font-semibold text-foreground break-all">
                    {createdResidentCredentials.temporaryPassword}
                  </code>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          createdResidentCredentials.temporaryPassword
                        );
                        setActionSuccess(
                          "Temporary password copied to clipboard."
                        );
                      } catch (error) {
                        console.error(
                          "Could not copy temporary password:",
                          error
                        );
                      }
                    }}
                    className="px-3 py-1.5 text-xs rounded-buttons border border-border hover:bg-card"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <div
              className={`mt-4 rounded-xl border px-4 py-3 text-xs leading-5 ${
                createdResidentCredentials.verificationEmailSent
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {createdResidentCredentials.verificationEmailSent
                ? "A verification link was sent to this email address. The resident must open the link before their first login."
                : "The verification email could not be sent. The resident can try logging in once to request another verification link."}
            </div>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 leading-5">
              The resident should change this password after logging in, then
              upload their valid ID and proof of billing in User Settings.
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setCreatedResidentCredentials(null)}
                className="btn-primary !px-5 !py-2 !text-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminPageLayout>
  );
}


function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground mt-1 capitalize">{value || "Not provided"}</p>
    </div>
  );
}

function OwnerSelect({ label, value, owners, onChange, error = "" }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
        {label}
        <span className="text-red-500 ml-1">*</span>
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-buttons border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 ${
          error
            ? "border-red-400 focus:ring-red-200"
            : "border-input focus:ring-ring/30"
        }`}
      >
        <option value="">Select an existing owner</option>

        {owners.map((owner) => (
          <option key={owner.id} value={owner.id}>
            {owner.name} — {owner.location}
            {owner.propertyControlNumber
              ? ` — ${owner.propertyControlNumber}`
              : ""}
          </option>
        ))}
      </select>

      {error ? (
        <p className="text-[11px] text-red-500 mt-1.5">{error}</p>
      ) : owners.length === 0 ? (
        <p className="text-[11px] text-amber-600 mt-1.5">
          No owner accounts are available yet. Add an owner first.
        </p>
      ) : (
        <p className="text-[11px] text-muted-foreground mt-1.5">
          Selecting an owner automatically links this resident to the same property.
        </p>
      )}
    </div>
  );
}

function PhoneFormInput({
  label,
  prefix = "+63",
  value,
  onChange,
  required = false,
  placeholder = "",
  helperText = "",
  error = "",
  inputMode = "numeric",
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
        {label}
        {required && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>

      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
          {prefix}
        </span>

        <input
          type="text"
          value={value}
          placeholder={placeholder}
          inputMode={inputMode}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          className={`w-full rounded-buttons border bg-card pl-12 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 ${
            error
              ? "border-red-400 focus:ring-red-200"
              : "border-input focus:ring-ring/30"
          }`}
        />
      </div>

      {error ? (
        <p className="text-[11px] text-red-500 mt-1.5">
          {error}
        </p>
      ) : (
        helperText && (
          <p className="text-[11px] text-muted-foreground mt-1.5">
            {helperText}
          </p>
        )
      )}
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
  min,
  max,
  helperText = "",
  error = "",
  maxLength,
  inputMode,
  disabled = false,
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
        {label}
        {required && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        min={min}
        max={max}
        maxLength={maxLength}
        inputMode={inputMode}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-buttons border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground ${
          error
            ? "border-red-400 bg-card focus:ring-red-200"
            : "border-input bg-card focus:ring-ring/30"
        }`}
      />

      {error ? (
        <p className="text-[11px] text-red-500 mt-1.5">
          {error}
        </p>
      ) : (
        helperText && (
          <p className="text-[11px] text-muted-foreground mt-1.5">
            {helperText}
          </p>
        )
      )}
    </div>
  );
}

export default AdminUsers;