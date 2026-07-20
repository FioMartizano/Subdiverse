import { useState, useEffect, useRef } from "react";
import {Car, Bike, FileText, Upload, BadgeCheck, LoaderCircle, Clock3, CircleX, Lock, Wallet,
  Home, Users, User, Check, Plus, CreditCard, Landmark, AlertCircle, Building2,
  BookCheck, FileCheck, ArrowUp} from "lucide-react";

import { auth, db } from "../../firebase";
import { 
  collection, addDoc, getDocs, getDoc, doc, query, 
  where, serverTimestamp, updateDoc, onSnapshot
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { uploadImage } from "../../services/cloudinary";

import stickerImg from "../../assets/VehicleStickerBg.jpg";
import gcash from "../../assets/gcash.jpg";

export default function VehicleSticker() {
  const [resident, setResident] = useState(null);
  const [loadingResident, setLoadingResident] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [formData, setFormData] = useState({
    vehicleType: "",
    plateNumber: "",
  });

  const [orcrFile, setOrcrFile] = useState(null);
  const [receiptFiles, setReceiptFiles] = useState({});
  const [applications, setApplications] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState({});
  const [loadingApps, setLoadingApps] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [showScrollTop, setShowScrollTop] = useState(false);

  const topRef = useRef(null);
  const unsubscribeRef = useRef(null);

  const [pricing, setPricing] = useState({
    homeownerCarPrice: 150,
    homeownerMotorcyclePrice: 100,
    homeownerTribikePrice: 120,
    renterCarPrice: 200,
    renterMotorcyclePrice: 150,
    renterTribikePrice: 170,
    householdCarPrice: 180,
    householdMotorcyclePrice: 130,
    householdTribikePrice: 150,
  });

  // Scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "plateNumber") {
      const cleanValue = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 7);
      setFormData({ ...formData, [name]: cleanValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const getStickerFee = () => {
    if (!resident) return 0;
    if (!formData.vehicleType) return 0;

    const category = resident.residentCategory?.toLowerCase();
    const vehicle = formData.vehicleType.toLowerCase();

    if (category === "owner" || category === "homeowner") {
      if (vehicle === "car") return pricing.homeownerCarPrice;
      if (vehicle === "motorcycle") return pricing.homeownerMotorcyclePrice;
      if (vehicle === "tri-bike") return pricing.homeownerTribikePrice;
    }

    if (category === "renter") {
      if (vehicle === "car") return pricing.renterCarPrice;
      if (vehicle === "motorcycle") return pricing.renterMotorcyclePrice;
      if (vehicle === "tri-bike") return pricing.renterTribikePrice;
    }

    if (category === "household") {
      if (vehicle === "car") return pricing.householdCarPrice;
      if (vehicle === "motorcycle") return pricing.householdMotorcyclePrice;
      if (vehicle === "tri-bike") return pricing.householdTribikePrice;
    }

    return 0;
  };

  const selectedFee = getStickerFee();

  // Set up real-time listener for applications
  const setupRealtimeListener = (uid) => {
    // Clean up existing listener
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (!uid) return;

    const q = query(
      collection(db, "vehicleStickerApplications"),
      where("residentUid", "==", uid)
    );

    unsubscribeRef.current = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        list.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });

        console.log("📱 Real-time update - Applications:", list.length);
        setApplications(list);
        setLoadingApps(false);
      },
      (error) => {
        console.error("❌ Applications listener error:", error);
        setLoadingApps(false);
      }
    );
  };

  // Initial load function (kept for backward compatibility)
  const loadApplications = async (uid) => {
    if (!uid) return;
    
    try {
      setLoadingApps(true);

      const q = query(
        collection(db, "vehicleStickerApplications"),
        where("residentUid", "==", uid)
      );

      const snapshot = await getDocs(q);

      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      list.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });

      setApplications(list);
      setLoadingApps(false);
      
      // Set up real-time listener after initial load
      setupRealtimeListener(uid);

    } catch (error) {
      console.error("Load Applications Error:", error);
      if (error.code === 'permission-denied') {
        alert("You don't have permission to view these applications.");
      }
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Clean up existing listener
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }

      if (!user) {
        setLoadingResident(false);
        setCurrentUser(null);
        return;
      }

      setCurrentUser(user);

      try {
        const residentRef = doc(db, "residents", user.uid);
        const residentSnapshot = await getDoc(residentRef);

        if (!residentSnapshot.exists()) {
          console.log("Resident not found.");
          setResident(null);
          return;
        }

        const residentInfo = {
          id: residentSnapshot.id,
          ...residentSnapshot.data(),
        };

        setResident(residentInfo);

        const settingsRef = doc(db, "vehicleSticker", "settings");
        const settingsSnap = await getDoc(settingsRef);

        if (settingsSnap.exists()) {
          setPricing((currentPricing) => ({
            ...currentPricing,
            ...settingsSnap.data(),
          }));
        } else {
          console.log("Vehicle sticker settings not found. Using default pricing.");
        }

        // Load applications using UID and set up real-time listener
        await loadApplications(user.uid);

      } catch (error) {
        console.error("Vehicle Sticker Error:", error);
        if (error.code === 'permission-denied') {
          alert("You don't have permission to access this data.");
        } else {
          alert(error.message);
        }
      } finally {
        setLoadingResident(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []);

  const handleStep1Submit = async (e) => {
    e.preventDefault();

    if (!resident || !currentUser) {
      alert("Resident information not found.");
      return;
    }
    if (!formData.vehicleType) {
      alert("Please select vehicle type.");
      return;
    }
    if (!formData.plateNumber.trim()) {
      alert("Please enter plate number.");
      return;
    }
    if (formData.plateNumber.length < 3) {
      alert("Plate number must be at least 3 characters.");
      return;
    }
    if (!orcrFile) {
      alert("Please upload your OR/CR.");
      return;
    }

    const normalizedPlateNumber = formData.plateNumber.trim().toUpperCase();

    const hasPreviousApplication = applications.some(
      (application) =>
        application.vehicleInfo?.plateNumber?.toUpperCase() === normalizedPlateNumber
    );

    if (hasPreviousApplication) {
      const proceed = window.confirm(
        "This plate number already exists in one of your previous applications.\n\nPress OK if this is a renewal or reapplication."
      );
      if (!proceed) return;
    }

    try {
      setSubmitting(true);

      const currentYear = new Date().getFullYear();
      const uploadedOrcr = await uploadImage(orcrFile, "vehicleSticker");

      const applicationData = {
        residentUid: currentUser.uid,
        residentId: resident.id,
        residentInfo: {
          firstName: resident.firstName,
          lastName: resident.lastName,
          fullName: `${resident.firstName} ${resident.lastName}`,
          residentCategory: resident.residentCategory,
        },
        vehicleInfo: {
          vehicleType: formData.vehicleType,
          plateNumber: normalizedPlateNumber,
        },
        stickerYear: currentYear,
        applicationType: hasPreviousApplication ? "Renewal" : "New Application",
        stickerFee: selectedFee,
        orcrInfo: {
          fileName: orcrFile.name,
          fileSize: orcrFile.size,
          fileType: orcrFile.type,
          secureUrl: uploadedOrcr.secureUrl,
          publicId: uploadedOrcr.publicId,
          resourceType: uploadedOrcr.resourceType,
          uploadStatus: "uploaded",
        },
        receiptInfo: null,
        status: "Pending",
        paymentStatus: "Locked",
        paymentMethod: null,
        remarks: "",
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "vehicleStickerApplications"), applicationData);

      setFormData({
        vehicleType: "",
        plateNumber: "",
      });
      setOrcrFile(null);

      alert("Step 1 submitted successfully. Waiting for HOA approval.");

    } catch (error) {
      console.error("Submit Error:", error);
      if (error.code === 'permission-denied') {
        alert("You don't have permission to submit this application.");
      } else {
        alert(error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentMethodSelect = (applicationId, method) => {
    setPaymentMethod((prev) => ({
      ...prev,
      [applicationId]: method,
    }));
  };

  const handleGCashReceiptUpload = async (applicationId, file) => {
    if (!file) {
      alert("Please choose a receipt.");
      return;
    }

    try {
      const uploadedReceipt = await uploadImage(file, "vehicleSticker");

      await updateDoc(doc(db, "vehicleStickerApplications", applicationId), {
        receiptInfo: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          secureUrl: uploadedReceipt.secureUrl,
          publicId: uploadedReceipt.publicId,
          resourceType: uploadedReceipt.resourceType,
          uploadStatus: "uploaded",
        },
        paymentStatus: "Paid - Pending Verification",
        paymentMethod: "GCash",
        remarks: "GCash receipt uploaded. Proceed to HOA office with your payment reference."
      });

      setReceiptFiles((prev) => ({
        ...prev,
        [applicationId]: null,
      }));

      // No need to manually reload - real-time listener will update

      alert("GCash receipt uploaded successfully! Please proceed to the HOA office to claim your sticker.");

    } catch (error) {
      console.error("Receipt Upload Error:", error);
      if (error.code === 'permission-denied') {
        alert("You don't have permission to update this application.");
      } else {
        alert(error.message);
      }
    }
  };

  const handleCashPaymentConfirm = async (applicationId) => {
    try {
      await updateDoc(doc(db, "vehicleStickerApplications", applicationId), {
        paymentStatus: "Paid - Pending Verification",
        paymentMethod: "Cash",
        remarks: "Cash payment selected. Proceed to HOA office with your payment."
      });

      alert("Cash payment confirmed! Please proceed to the HOA office to complete your payment and claim your sticker.");

    } catch (error) {
      console.error("Cash Payment Error:", error);
      if (error.code === 'permission-denied') {
        alert("You don't have permission to update this application.");
      } else {
        alert(error.message);
      }
    }
  };

  const hasUnlockedApplication = applications.some(app => 
    app.status === "Approved" && app.paymentStatus === "Unlocked"
  );

  const getVehicleDisplayName = (type) => {
    switch(type?.toLowerCase()) {
      case 'car':
        return 'Car (Four-Wheeled Vehicle)';
      case 'motorcycle':
        return 'Motorcycle (Two-Wheeled Vehicle)';
      case 'tri-bike':
        return 'Tri-Bike (Three-Wheeled Vehicle)';
      default:
        return type || 'Unknown';
    }
  };

  const getFilteredApplications = () => {
    switch(activeTab) {
      case 'pending':
        return applications.filter(app => 
          app.status === "Pending" || 
          (app.status === "Approved" && app.paymentStatus === "Locked")
        );
      case 'payment':
        return applications.filter(app => 
          app.status === "Approved" && 
          (app.paymentStatus === "Unlocked" || 
           app.paymentStatus === "Paid - Pending Verification")
        );
      case 'completed':
        return applications.filter(app => 
          app.paymentStatus === "Verified" || 
          app.paymentStatus === "Completed"
        );
      case "rejected":
        return applications.filter(app =>
          app.status === "Rejected"
        );
      default:
        return applications;
    }
  };

  const filteredApps = getFilteredApplications();

  const getStatusInfo = (app) => {
    if (app.status === "Rejected") {
      return { 
        icon: CircleX, 
        color: 'text-red-600', 
        bg: 'bg-red-100',
        label: 'Rejected',
        message: app.rejectionReason 
          ? `Your application has been rejected. Reason: ${app.rejectionReason}`
          : 'Your application has been rejected. Please contact the HOA office.'
      };
    }
    if (app.status === "Pending") {
      return { 
        icon: Clock3, 
        color: 'text-yellow-600', 
        bg: 'bg-yellow-100',
        label: 'Pending Review',
        message: 'Your OR/CR is being reviewed by the HOA admin.'
      };
    }
    if (app.status === "Approved" && app.paymentStatus === "Locked") {
      return { 
        icon: Lock, 
        color: 'text-orange-600', 
        bg: 'bg-orange-100',
        label: 'Payment Locked',
        message: 'Approved but payment needs to be unlocked by admin.'
      };
    }
    if (app.paymentStatus === "Unlocked") {
      return { 
        icon: Wallet, 
        color: 'text-green-600', 
        bg: 'bg-green-100',
        label: 'Ready for Payment',
        message: 'Choose your payment method below.'
      };
    }
    if (app.paymentStatus === "Paid - Pending Verification") {
      return { 
        icon: Clock3, 
        color: 'text-blue-600', 
        bg: 'bg-blue-100',
        label: 'Paid - Pending Verification',
        message: 'Your payment is recorded. Please proceed to the HOA office to claim your sticker.'
      };
    }
    if (app.paymentStatus === "Verified") {
      return { 
        icon: BookCheck, 
        color: 'text-green-600', 
        bg: 'bg-green-100',
        label: 'Payment Verified',
        message: 'Your payment has been verified. Your sticker is ready for pickup!'
      };
    }
    if (app.paymentStatus === "Completed") {
      return { 
        icon: FileCheck, 
        color: 'text-purple-600', 
        bg: 'bg-purple-100',
        label: 'Sticker Released',
        message: 'Your vehicle sticker has been released.'
      };
    }
    return { 
      icon: AlertCircle, 
      color: 'text-gray-600', 
      bg: 'bg-gray-100',
      label: 'Unknown Status',
      message: 'Please contact support.'
    };
  };

  return (
    <div ref={topRef} className="min-h-screen bg-gray-50 pt-20">
      {/* HERO SECTION */}
      <div
        className="relative h-[400px] bg-cover bg-center"
        style={{ backgroundImage: `url(${stickerImg})` }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Vehicle Sticker Application
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-3xl">
            Submit your OR/CR first. Once the HOA verifies and accepts your 
            documents, the payment section will automatically unlock.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* STEP INDICATOR */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-14 h-14 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white flex-shrink-0">
                <FileText size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Step 1</p>
                <h2 className="text-xl font-bold">Submit OR/CR</h2>
              </div>
            </div>

            <div className={`hidden md:block flex-1 h-1 mx-8 rounded-full ${
              hasUnlockedApplication ? 'bg-[var(--color-secondary)]' : 'bg-gray-300'
            }`} />

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white flex-shrink-0 ${
                hasUnlockedApplication ? 'bg-[var(--color-secondary)]' : 'bg-gray-300'
              }`}>
                <Wallet size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Step 2</p>
                <h2 className="text-xl font-bold">Payment</h2>
                {hasUnlockedApplication && (
                  <p className="text-xs text-[var(--color-secondary)] font-semibold flex items-center gap-1">
                    <Check size={12} /> Unlocked
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 p-5 rounded-xl bg-yellow-50 border border-yellow-200">
            <div className="flex items-start gap-3">
              <Lock className="text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-yellow-800">
                  Step 2 will only unlock after the HOA has approved your OR/CR.
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Once you've made your payment (GCash or Cash), proceed to the HOA office 
                  to claim your vehicle sticker. The admin will verify your payment there.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 1 FORM */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <BadgeCheck className="text-[var(--color-primary)]" />
            Step 1 • Vehicle Information & OR/CR
          </h2>

          <form onSubmit={handleStep1Submit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-2 text-gray-700">
                  Vehicle Type
                </label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                >
                  <option value="">Select Vehicle Type</option>
                  <option value="Car">Car (Four-Wheeled Vehicle)</option>
                  <option value="Motorcycle">Motorcycle (Two-Wheeled Vehicle)</option>
                  <option value="Tri-Bike">Tri-Bike (Three-Wheeled Vehicle)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-700">
                  Plate Number
                </label>
                <input
                  type="text"
                  name="plateNumber"
                  value={formData.plateNumber}
                  onChange={handleChange}
                  placeholder="ABC1234"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none uppercase"
                  maxLength={7}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.plateNumber.length}/7 characters (Alphanumeric only - no spaces or special characters)
                </p>
              </div>
            </div>

            {/* Resident + Pricing */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-[var(--color-primary)] rounded-lg">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Resident Information
                  </h3>
                </div>
                
                {loadingResident ? (
                  <div className="flex justify-center py-8">
                    <LoaderCircle className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
                  </div>
                ) : resident ? (
                  <div className="space-y-4">
                    <div className="bg-white/70 rounded-lg p-4 backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                          {resident.firstName?.[0]}{resident.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-lg">
                            {resident.firstName} {resident.lastName}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Check className="w-3 h-3 text-green-500" />
                            Active Resident
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/70 rounded-lg p-3 backdrop-blur-sm">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Resident Type
                      </p>
                      <p className="font-semibold text-gray-800 mt-1 flex items-center gap-2">
                        <span className={`inline-block w-2 h-2 rounded-full ${
                          resident.residentCategory?.toLowerCase() === 'owner' || 
                          resident.residentCategory?.toLowerCase() === 'homeowner' ? 'bg-green-500' :
                          resident.residentCategory?.toLowerCase() === 'renter' ? 'bg-yellow-500' :
                          'bg-pink-500'
                        }`}></span>
                        {resident.residentCategory}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 mt-3">No resident data found.</p>
                  </div>
                )}
              </div>

              {/* Pricing section */}
              <div className="border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-[var(--color-secondary)] rounded-lg">
                    <Car className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Vehicle Sticker Fees
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg bg-gradient-to-r from-green-50 to-green-100/50 border border-green-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1 bg-[var(--color-primary)] rounded">
                        <Home className="w-4 h-4 text-white" />
                      </div>
                      <p className="font-bold text-green-700">Homeowner</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center bg-white/60 rounded-lg px-3 py-2">
                        <span className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-gray-600" />
                          Car (Four-Wheeled)
                        </span>
                        <span className="font-bold text-green-700">₱{pricing.homeownerCarPrice}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/60 rounded-lg px-3 py-2">
                        <span className="flex items-center gap-2">
                          <Bike className="w-4 h-4 text-gray-600" />
                          Motorcycle (Two-Wheeled)
                        </span>
                        <span className="font-bold text-green-700">₱{pricing.homeownerMotorcyclePrice}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/60 rounded-lg px-3 py-2">
                        <span className="flex items-center gap-2">
                          <Bike className="w-4 h-4 text-gray-600" />
                          Tri-Bike (Three-Wheeled)
                        </span>
                        <span className="font-bold text-green-700">₱{pricing.homeownerTribikePrice}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-100/50 border border-yellow-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1 bg-yellow-600 rounded">
                        <Building2 className="w-4 h-4 text-white" />
                      </div>
                      <p className="font-bold text-yellow-700">Renter</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center bg-white/60 rounded-lg px-3 py-2">
                        <span className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-gray-600" />
                          Car (Four-Wheeled)
                        </span>
                        <span className="font-bold text-yellow-700">₱{pricing.renterCarPrice}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/60 rounded-lg px-3 py-2">
                        <span className="flex items-center gap-2">
                          <Bike className="w-4 h-4 text-gray-600" />
                          Motorcycle (Two-Wheeled)
                        </span>
                        <span className="font-bold text-yellow-700">₱{pricing.renterMotorcyclePrice}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/60 rounded-lg px-3 py-2">
                        <span className="flex items-center gap-2">
                          <Bike className="w-4 h-4 text-gray-600" />
                          Tri-Bike (Three-Wheeled)
                        </span>
                        <span className="font-bold text-yellow-700">₱{pricing.renterTribikePrice}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-gradient-to-r from-rose-50 to-pink-100/50 border border-pink-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1 bg-pink-600 rounded">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <p className="font-bold text-pink-700">Household</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center bg-white/60 rounded-lg px-3 py-2">
                        <span className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-gray-600" />
                          Car (Four-Wheeled)
                        </span>
                        <span className="font-bold text-pink-700">₱{pricing.householdCarPrice}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/60 rounded-lg px-3 py-2">
                        <span className="flex items-center gap-2">
                          <Bike className="w-4 h-4 text-gray-600" />
                          Motorcycle (Two-Wheeled)
                        </span>
                        <span className="font-bold text-pink-700">₱{pricing.householdMotorcyclePrice}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/60 rounded-lg px-3 py-2">
                        <span className="flex items-center gap-2">
                          <Bike className="w-4 h-4 text-gray-600" />
                          Tri-Bike (Three-Wheeled)
                        </span>
                        <span className="font-bold text-pink-700">₱{pricing.householdTribikePrice}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-emerald-600 p-5 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90 font-medium">Your Sticker Fee</p>
                      <p className="text-4xl font-bold mt-1">₱{selectedFee}</p>
                      <p className="text-xs opacity-80 mt-2">
                        Based on your resident category and vehicle type
                      </p>
                    </div>
                    <div className="bg-white/20 rounded-full p-3">
                      <BadgeCheck className="w-8 h-8" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload OR/CR */}
            <div className="border rounded-xl p-6 bg-white">
              <h3 className="text-2xl font-bold flex items-center gap-2 mb-5">
                <FileText className="w-6 h-6 text-[var(--color-primary)]" />
                Upload OR/CR
              </h3>

              <p className="text-gray-600 mb-5">
                Upload a clear copy of your OR /CR. Your application will remain pending until 
                the HOA verifies your documents.
              </p>

              <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[var(--color-primary)] transition-all hover:bg-green-50">
                <Upload className="w-12 h-12 mb-3 text-gray-400" />
                <p className="font-semibold text-gray-700">
                  {orcrFile ? orcrFile.name : "Click to upload OR/CR"}
                </p>
                <p className="text-sm text-gray-500 mt-2">PNG, JPG or PDF</p>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => setOrcrFile(e.target.files[0])}
                />
              </label>

              {orcrFile && (
                <div className="mt-4 flex items-center gap-2 text-green-700 font-medium">
                  <BadgeCheck className="w-5 h-5" />
                  <span>{orcrFile.name}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <LoaderCircle className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Submit Application
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* APPLICATIONS SECTION */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <FileText className="w-8 h-8 text-[var(--color-primary)]" />
            My Vehicle Sticker Applications ({applications.length})
          </h2>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'pending'
                  ? 'bg-[var(--color-primary)] text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Clock3 className="w-5 h-5" />
              Pending
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'pending' ? 'bg-white/30' : 'bg-gray-400 text-white'
              }`}>
                {applications.filter(app => 
                  app.status === "Pending" || 
                  (app.status === "Approved" && app.paymentStatus === "Locked")
                ).length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('payment')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'payment'
                  ? 'bg-[var(--color-secondary)] text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Wallet className="w-5 h-5" />
              Payment
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'payment' ? 'bg-white/30' : 'bg-gray-400 text-white'
              }`}>
                {applications.filter(app => 
                  app.status === "Approved" && 
                  (app.paymentStatus === "Unlocked" || 
                   app.paymentStatus === "Paid - Pending Verification")
                ).length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'completed'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <FileCheck className="w-5 h-5" />
              Completed
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'completed' ? 'bg-white/30' : 'bg-gray-400 text-white'
              }`}>
                {applications.filter(app => 
                  app.paymentStatus === "Verified" || 
                  app.paymentStatus === "Completed"
                ).length}
              </span>
            </button>
          
            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'rejected'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <CircleX className="w-5 h-5" />
              Rejected
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'rejected'
                  ? 'bg-white/30'
                  : 'bg-gray-400 text-white'
              }`}>
                {applications.filter(app =>
                  app.status === "Rejected"
                ).length}
              </span>
            </button>
          </div>

          {loadingResident || loadingApps ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <LoaderCircle className="mx-auto w-12 h-12 text-[var(--color-primary)] animate-spin mb-4" />
              <p className="text-lg text-gray-600">Loading your applications...</p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              {activeTab === 'pending' && (
                <>
                  <Clock3 className="mx-auto w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-lg text-gray-600">No pending applications.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Your pending applications will appear here.
                  </p>
                </>
              )}
              {activeTab === 'payment' && (
                <>
                  <Wallet className="mx-auto w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-lg text-gray-600">No applications ready for payment.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Once your OR/CR is approved, payment options will appear here.
                  </p>
                </>
              )}
              {activeTab === 'completed' && (
                <>
                  <FileCheck className="mx-auto w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-lg text-gray-600">No completed applications.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Your completed applications will appear here.
                  </p>
                </>
              )} 
              {activeTab === 'rejected' && (
                <>
                  <CircleX className="mx-auto w-16 h-16 text-gray-400 mb-4"/>
                  <p className="text-lg text-gray-600">No rejected applications.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Rejected applications will appear here.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredApps.map((app) => {
                const statusInfo = getStatusInfo(app);
                const StatusIcon = statusInfo.icon;
                const isUnlocked = app.status === "Approved" && app.paymentStatus === "Unlocked";
                const isPaidPending = app.paymentStatus === "Paid - Pending Verification";
                
                return (
                  <div
                    key={app.id}
                    className="bg-white rounded-2xl shadow-lg border overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-100 px-6 py-4 gap-3">
                      <div>
                        <h3 className="text-xl font-bold">
                          {getVehicleDisplayName(app.vehicleInfo?.vehicleType)}
                        </h3>
                        <p className="text-gray-600">
                          Plate Number: {app.vehicleInfo?.plateNumber || 'N/A'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${statusInfo.bg} ${statusInfo.color}`}>
                          <StatusIcon className="w-5 h-5" />
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-lg font-bold mb-4 text-gray-800">
                            Application Details
                          </h4>
                          <div className="space-y-2 text-gray-700">
                            <p>
                              <span className="font-semibold">Resident:</span>{" "}
                              {app.residentInfo?.fullName || 'N/A'}
                            </p>
                            <p>
                              <span className="font-semibold">Category:</span>{" "}
                              {app.residentInfo?.residentCategory || 'N/A'}
                            </p>
                            <p>
                              <span className="font-semibold">Vehicle:</span>{" "}
                              {getVehicleDisplayName(app.vehicleInfo?.vehicleType)}
                            </p>
                            <p>
                              <span className="font-semibold">Plate Number:</span>{" "}
                              {app.vehicleInfo?.plateNumber || 'N/A'}
                            </p>
                            <p>
                              <span className="font-semibold">Sticker Fee:</span>{" "}
                              <span className="text-2xl font-bold text-[var(--color-primary)]">₱{app.stickerFee || 0}</span>
                            </p>
                            {app.paymentMethod && (
                              <p>
                                <span className="font-semibold">Payment Method:</span>{" "}
                                {app.paymentMethod}
                              </p>
                            )}
                            {app.remarks && (
                              <p>
                                <span className="font-semibold">Remarks:</span>{" "}
                                {app.remarks}
                              </p>
                            )}
                            {/* Display rejection reason if rejected */}
                            {app.status === "Rejected" && app.rejectionReason && (
                              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="font-semibold text-red-700">Rejection Reason:</p>
                                <p className="text-red-600 text-sm mt-1">{app.rejectionReason}</p>
                              </div>
                            )}
                          </div>

                          {app.orcrInfo && (
                            <div className="mt-6">
                              <h4 className="font-bold mb-3 text-gray-800">
                                Submitted OR/CR
                              </h4>
                              <a
                                href={app.orcrInfo.secureUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 transition"
                              >
                                <FileText className="w-5 h-5" />
                                View OR/CR
                              </a>
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="rounded-xl p-6 border" style={{ 
                            backgroundColor: `${statusInfo.bg}40`,
                            borderColor: statusInfo.color
                          }}>
                            <div className="flex items-center gap-3 mb-3">
                              <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
                              <h4 className={`font-bold ${statusInfo.color}`}>
                                {statusInfo.label}
                              </h4>
                            </div>
                            <p className="text-gray-700">
                              {statusInfo.message}
                            </p>

                            {isUnlocked && (
                              <div className="mt-6 pt-6 border-t border-gray-300">
                                <h5 className="font-bold mb-4 text-gray-800">
                                  Choose Payment Method
                                </h5>
                                
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-3">
                                    <button
                                      type="button"
                                      onClick={() => handlePaymentMethodSelect(app.id, 'GCash')}
                                      className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 justify-center ${
                                        paymentMethod[app.id] === 'GCash'
                                          ? 'border-[var(--color-primary)] bg-green-50 text-[var(--color-primary)]'
                                          : 'border-gray-300 hover:border-gray-400'
                                      }`}
                                    >
                                      <CreditCard className="w-5 h-5" />
                                      <span className="font-medium">GCash</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handlePaymentMethodSelect(app.id, 'Cash')}
                                      className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 justify-center ${
                                        paymentMethod[app.id] === 'Cash'
                                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                                          : 'border-gray-300 hover:border-gray-400'
                                      }`}
                                    >
                                      <Landmark className="w-5 h-5" />
                                      <span className="font-medium">Cash</span>
                                    </button>
                                  </div>

                                  {paymentMethod[app.id] === 'GCash' && (
                                    <>
                                      <div className="rounded-xl border p-4">
                                        <h4 className="font-bold mb-3 flex items-center gap-2">
                                          <CreditCard className="w-5 h-5 text-[var(--color-primary)]" />
                                          GCash Payment
                                        </h4>
                                        <p className="text-sm text-gray-600 mb-2">
                                          Please pay exactly:
                                        </p>
                                        <p className="text-3xl font-bold text-[var(--color-primary)] mb-4">
                                          ₱{app.stickerFee || 0}
                                        </p>
                                        <img
                                          src={gcash}
                                          alt="GCash QR"
                                          className="w-64 rounded-xl border shadow"
                                        />
                                      </div>

                                      <div>
                                        <label className="font-semibold block mb-2 text-gray-700">
                                          Upload GCash Payment Receipt
                                        </label>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => {
                                            if (e.target.files[0]) {
                                              setReceiptFiles((prev) => ({
                                                ...prev,
                                                [app.id]: e.target.files[0],
                                              }));
                                            }
                                          }}
                                          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                                        />
                                        {receiptFiles[app.id] && (
                                          <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                                            <Check className="w-4 h-4" />
                                            {receiptFiles[app.id].name}
                                          </p>
                                        )}
                                      </div>

                                      <button
                                        onClick={() => {
                                          const file = receiptFiles[app.id];
                                          if (!file) {
                                            alert("Please select a receipt first.");
                                            return;
                                          }
                                          handleGCashReceiptUpload(app.id, file);
                                        }}
                                        className="w-full py-3 rounded-xl bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-primary)]/90 transition flex items-center justify-center gap-2"
                                      >
                                        <Upload className="w-5 h-5" />
                                        Pay with GCash & Upload Receipt
                                      </button>
                                    </>
                                  )}

                                  {paymentMethod[app.id] === 'Cash' && (
                                    <>
                                      <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                          <Landmark className="w-5 h-5 text-blue-600" />
                                          <h4 className="font-bold text-blue-700">Cash Payment</h4>
                                        </div>
                                        <p className="text-gray-700 mb-2">
                                          Please pay the exact amount of:
                                        </p>
                                        <p className="text-3xl font-bold text-blue-700 mb-2">
                                          ₱{app.stickerFee || 0}
                                        </p>
                                        <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200">
                                          <p className="text-sm text-gray-600 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-blue-600" />
                                            Pay at the HOA office during business hours.
                                          </p>
                                          <p className="text-sm text-gray-600 mt-1">
                                            <span className="font-semibold">Office Hours:</span> Mon-Fri, 8:00 AM - 5:00 PM
                                          </p>
                                        </div>
                                      </div>

                                      <button
                                        onClick={() => handleCashPaymentConfirm(app.id)}
                                        className="w-full py-3 rounded-xl bg-blue-700 text-white font-semibold hover:bg-blue-800 transition flex items-center justify-center gap-2"
                                      >
                                        <Landmark className="w-5 h-5" />
                                        Confirm Cash Payment
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}

                            {app.receiptInfo && (
                              <div className="mt-4 pt-4 border-t border-gray-300">
                                <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                  <FileText className="w-4 h-4" />
                                  Payment Receipt Uploaded
                                </p>
                                <a
                                  href={app.receiptInfo.secureUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600 underline hover:text-blue-800 text-sm"
                                >
                                  View Receipt
                                </a>
                              </div>
                            )}

                            {isPaidPending && (
                              <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
                                <p className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4" />
                                  Next Steps:
                                </p>
                                <ul className="mt-2 text-sm text-gray-600 space-y-1 list-disc list-inside">
                                  <li>Proceed to the HOA office</li>
                                  <li>Bring your payment reference or confirmation</li>
                                  <li>Present a valid ID</li>
                                  <li>The admin will verify your payment and release your sticker</li>
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-4 bg-[var(--color-primary)] text-white rounded-full shadow-lg hover:bg-[var(--color-primary)]/90 transition-all hover:scale-110 z-50"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}