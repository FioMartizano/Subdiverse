import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Calendar, X, CheckCircle, AlertCircle, Clock, Upload, File, Trash2, RefreshCw, Car, CreditCard, MapPin, User, Calendar as CalendarIcon, DollarSign, Map, ChevronLeft, ChevronRight } from 'lucide-react';
import { auth, db } from '../../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, getDoc, doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { uploadImage } from "../../services/cloudinary";
import heroImg from "../../assets/parking_bg.JPEG";

const CarIcon = ({ className, color = "currentColor", windowColor = "white" }) => (
  <svg viewBox="0 0 100 100" className={className} fill={color}>
    <rect x="25" y="15" width="50" height="70" rx="15" />
    <path d="M 30 35 Q 50 30 70 35 L 65 45 L 35 45 Z" fill={windowColor} />
    <path d="M 33 65 L 67 65 L 69 72 Q 50 75 31 72 Z" fill={windowColor} />
    <rect x="15" y="45" width="15" height="12" rx="4" />
    <rect x="70" y="45" width="15" height="12" rx="4" />
  </svg>
);

export default function ParkingReservation() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reservationError, setReservationError] = useState(null);

  const [userReservations, setUserReservations] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [showPastReservations, setShowPastReservations] = useState(false);

  const [orcFile, setOrcFile] = useState(null);
  const [orcPreview, setOrcPreview] = useState(null);
  const [orcFileName, setOrcFileName] = useState('');
  const fileInputRef = useRef(null);

  const [paymentType, setPaymentType] = useState('cash');

  const generateSpots = () => {
    const spots = [];
    const totalSpots = 50;
    
    for (let i = 1; i <= totalSpots; i++) {
      const id = `SPOT-${String(i).padStart(2, '0')}`;
      spots.push({
        id,
        number: i,
        status: 'available' 
      });
    }
    return spots;
  };

  const [spots, setSpots] = useState(generateSpots());
  const [selectedId, setSelectedId] = useState('SPOT-01');
  const [currentPage, setCurrentPage] = useState(1);
  const SPOTS_PER_PAGE = 25;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(null);

  const monthlyRate = 1000;

  // ============================================================
  // FETCH USER DATA
  // ============================================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchUserData(currentUser.uid);
        await fetchUserReservations(currentUser.uid);
        await fetchAvailability();
      } else {
        setUser(null);
        setUserData(null);
        setUserReservations([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && userData) {
      fetchUserReservations(user.uid);
    }
  }, [user, userData]);

  const fetchUserData = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.residentId) {
          const residentDoc = await getDoc(doc(db, 'residents', userData.residentId));
          if (residentDoc.exists()) {
            setUserData({
              ...userData,
              residentData: residentDoc.data()
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // ============================================================
  // FETCH USER RESERVATIONS
  // ============================================================
  const fetchUserReservations = async (uid) => {
    if (!uid) {
      console.log('No UID provided');
      return;
    }
    
    console.log('🔍 Fetching reservations for user UID:', uid);
    setLoadingStatus(true);
    
    try {
      const reservationsRef = collection(db, 'ParkingReservation');
      const q = query(
        reservationsRef,
        where('userId', '==', uid)
      );
      const querySnapshot = await getDocs(q);
      
      console.log(`👤 Found ${querySnapshot.size} reservations for user UID:`, uid);
      
      const allReservations = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const startDate = data.startDate?.toDate ? data.startDate.toDate() : new Date(data.startDate);
        const endDate = data.endDate?.toDate ? data.endDate.toDate() : new Date(data.endDate);
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
        return {
          id: docSnap.id,
          ...data,
          startDate,
          endDate,
          createdAt
        };
      }).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      
      setUserReservations(allReservations);
    } catch (error) {
      console.error('❌ Error fetching reservations:', error);
    } finally {
      setLoadingStatus(false);
    }
  };

  // ============================================================
  // FETCH AVAILABILITY
  // ============================================================
  const fetchAvailability = async () => {
    try {
      console.log('🔄 Fetching parking availability...');
      
      const availabilityRef = collection(db, 'ParkingAvailability');
      const querySnapshot = await getDocs(availabilityRef);
      
      const availabilityMap = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        availabilityMap[data.spotId] = {
          isOccupied: data.isOccupied || false,
          isPending: data.isPending || false,
        };
      });
      
      setSpots(prevSpots => 
        prevSpots.map(spot => {
          const availability = availabilityMap[spot.id];
          if (!availability) return spot;
          
          let status = 'available';
          if (availability.isPending) {
            status = 'pending';
          } else if (availability.isOccupied) {
            status = 'occupied';
          }
          
          return {
            ...spot,
            status: status,
          };
        })
      );
      
      console.log('✅ Availability fetched successfully');
      
    } catch (error) {
      console.error('❌ Error fetching availability:', error);
    }
  };

  // Real-time listener for availability updates
  useEffect(() => {
    if (!user) return;
    
    console.log('👂 Setting up real-time availability listener...');
    
    const availabilityRef = collection(db, 'ParkingAvailability');
    const unsubscribe = onSnapshot(availabilityRef, (snapshot) => {
      const availabilityMap = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        availabilityMap[data.spotId] = {
          isOccupied: data.isOccupied || false,
          isPending: data.isPending || false,
        };
      });
      
      setSpots(prevSpots => 
        prevSpots.map(spot => {
          const availability = availabilityMap[spot.id];
          if (!availability) return spot;
          
          let status = 'available';
          if (availability.isPending) {
            status = 'pending';
          } else if (availability.isOccupied) {
            status = 'occupied';
          }
          
          return {
            ...spot,
            status: status,
          };
        })
      );
      
      console.log('🔄 Availability updated in real-time');
    }, (error) => {
      console.error('❌ Error listening to availability:', error);
    });
    
    return () => {
      console.log('👋 Unsubscribing from availability listener');
      unsubscribe();
    };
  }, [user]);

  // ============================================================
  // CHECK RESERVATION STATUS
  // ============================================================
  const checkPendingReservation = async () => {
    if (!user) return false;
    
    try {
      const reservationsRef = collection(db, 'ParkingReservation');
      const q = query(
        reservationsRef,
        where('userId', '==', user.uid),
        where('status', '==', 'pending')
      );
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking pending reservations:', error);
      return false;
    }
  };

  const checkSpotAvailability = async (spotId) => {
    try {
      const availabilityRef = doc(db, 'ParkingAvailability', spotId);
      const availabilitySnap = await getDoc(availabilityRef);
      
      if (!availabilitySnap.exists()) {
        console.error('Spot not found in availability collection');
        return false;
      }
      
      const availability = availabilitySnap.data();
      
      if (availability.isOccupied || availability.isPending) {
        console.log(`Spot ${spotId} is not available (occupied: ${availability.isOccupied}, pending: ${availability.isPending})`);
        return false;
      }
      
      console.log(`✅ Spot ${spotId} is available!`);
      return true;
      
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  };

  // ============================================================
  // HANDLE INPUT DETAILS
  // ============================================================
  const handleInputDetails = async () => {
    if (!selectedId) {
      alert('Please select a parking spot first.');
      return;
    }

    if (!startDate) {
      alert('Please select a start date.');
      return;
    }

    const hasPending = await checkPendingReservation();
    if (hasPending) {
      alert('You already have a pending reservation. Please wait for it to be processed.');
      return;
    }

    const isAvailable = await checkSpotAvailability(selectedId);
    if (!isAvailable) {
      alert('This spot is not available for the selected dates. Please choose another spot or date.');
      return;
    }

    setOrcFile(null);
    setOrcPreview(null);
    setOrcFileName('');
    setPaymentType('cash');
    setReservationError(null);
    setShowModal(true);
  };

  // ============================================================
  // FILE HANDLING
  // ============================================================
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid image (JPEG, PNG) or PDF file.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB.');
        return;
      }

      setOrcFile(file);
      setOrcFileName(file.name);

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setOrcPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setOrcPreview(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setOrcFile(null);
    setOrcPreview(null);
    setOrcFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ============================================================
  // SUBMIT RESERVATION - FIXED!
  // ============================================================
  const handleSubmitReservation = async () => {
    if (!user || !userData) return;

    if (!paymentType) {
      setReservationError("Please select a payment method.");
      return;
    }

    setSubmitting(true);
    setReservationError(null);

    try {
      let uploadedImage = null;

      if (orcFile) {
        uploadedImage = await uploadImage(orcFile, "orcr");
        console.log("✅ Cloudinary Upload Successful");
        console.log(uploadedImage);
      }

      // Calculate months (30 days = 1 month)
      const monthsRequested = 1; // Currently only 1 month at a time
      const totalMonths = 1;

      const reservationData = {
        userId: user.uid,
        residentId: userData.residentId || "",
        spotId: selectedId,
        spotNumber: spots.find((s) => s.id === selectedId)?.number || 0,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        monthsRequested: monthsRequested,    // ✅ REQUIRED by rules
        totalMonths: totalMonths,            // ✅ REQUIRED by rules
        monthlyRate: monthlyRate,
        totalAmount: totalAmount,
        paymentStatus: "pending",            // ✅ FIXED: Changed from paymentType
        status: "pending",
        createdAt: serverTimestamp(),
        residentInfo: {
          name: `${userData.residentData?.firstName || ""} ${userData.residentData?.lastName || ""}`.trim(),
          address: [
            userData.residentData?.block,
            userData.residentData?.lot,
            userData.residentData?.street,
            userData.residentData?.phase,
          ]
            .filter(Boolean)
            .join(", "),
          residentCategory: userData.residentData?.residentCategory || "",
          contactNumber: userData.residentData?.contactNumber || "",
        },
        orcFileInfo: uploadedImage
          ? {
              fileName: orcFile.name,
              fileSize: orcFile.size,
              fileType: orcFile.type,
              secureUrl: uploadedImage.secureUrl,
              publicId: uploadedImage.publicId,
              resourceType: uploadedImage.resourceType,
              uploadStatus: "uploaded",
            }
          : null,
      };

      await addDoc(collection(db, "ParkingReservation"), reservationData);

      setShowModal(false);
      setShowSuccess(true);
      
      setOrcFile(null);
      setOrcPreview(null);
      setOrcFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      await fetchUserReservations(user.uid);

      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);

    } catch (error) {
      console.error('❌ Error submitting reservation:', error);
      setReservationError("Failed to submit reservation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefreshStatus = async () => {
    if (user) {
      await fetchUserReservations(user.uid);
      await fetchAvailability();
    }
  };

  // ============================================================
  // DATE CALCULATIONS
  // ============================================================
  useMemo(() => {
    if (!startDate) {
      setEndDate(null);
      return;
    }
    const date = new Date(startDate);
    date.setDate(date.getDate() + 30);
    setEndDate(date);
  }, [startDate]);

  const totalAmount = monthlyRate;

  // ============================================================
  // PARKING GRID
  // ============================================================
  const getCurrentPageSpots = useMemo(() => {
    const startIndex = (currentPage - 1) * SPOTS_PER_PAGE;
    const endIndex = startIndex + SPOTS_PER_PAGE;
    return spots.slice(startIndex, endIndex);
  }, [spots, currentPage]);

  const totalPages = Math.ceil(spots.length / SPOTS_PER_PAGE);

  const handleSpotClick = (id) => {
    const spot = spots.find(s => s.id === id);
    if (!spot || spot.status === 'occupied' || spot.status === 'pending') return;

    const updated = spots.map(s => {
      if (s.id === id) {
        return { ...s, status: 'selected' };
      } else if (s.status === 'selected') {
        return { ...s, status: 'available' };
      }
      return s;
    });
    setSpots(updated);
    setSelectedId(id);
  };

  const getSpotStyles = (status) => {
    switch (status) {
      case 'occupied':
        return { color: '#FF7043', borderClass: 'border-red-500 border-2', bgClass: 'bg-red-50' };
      case 'pending':
        return { color: '#FF9800', borderClass: 'border-orange-400 border-2', bgClass: 'bg-orange-50' };
      case 'selected':
        return { color: '#FFB300', borderClass: 'border-secondary border-2', bgClass: 'bg-yellow-50' };
      case 'available':
      default:
        return { color: '#1B5E20', borderClass: 'border-gray-300 border-2', bgClass: 'bg-gray-50' };
    }
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  const handleStartDateChange = (e) => {
    const newDate = new Date(e.target.value);
    newDate.setHours(0, 0, 0, 0);
    
    if (newDate < today) {
      alert('Start date cannot be in the past. Please select today or a future date.');
      return;
    }
    
    setStartDate(newDate);
  };

  const selectedSpot = spots.find(s => s.id === selectedId);

  const formatDateForInput = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const element = document.getElementById('parking-space-container');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`w-10 h-10 rounded-full text-sm font-medium transition-all duration-200 ease-in-out active:scale-90 ${
            currentPage === i
              ? 'bg-secondary text-white shadow-lg shadow-secondary-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  // ============================================================
  // RENDER RESERVATION CARD
  // ============================================================
  const renderReservationCard = (reservation) => {
    const { id, status, spotId, rejectionReason, startDate: rStart, endDate: rEnd, totalAmount: rAmount } = reservation;

    switch (status) {
      case 'pending':
        return (
          <div key={id} className="bg-pending-bg border border-pending/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="bg-pending/15 p-2 rounded-full">
                <Clock className="w-5 h-5 text-pending" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-pending-text">Pending Approval</h4>
                  <span className="text-xs text-pending-text bg-pending/15 px-2 py-0.5 rounded-full">{spotId}</span>
                </div>
                <p className="text-sm text-pending-text/90 mt-1">
                  Waiting for HOA admin to review
                </p>
                <p className="text-xs text-pending-text/80 mt-1.5">
                  {formatDate(rStart)} – {formatDate(rEnd)} · ₱{(rAmount || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        );

      case 'confirmed':
        return (
          <div key={id} className="bg-approved-bg border border-approved/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="bg-approved/15 p-2 rounded-full">
                <CheckCircle className="w-5 h-5 text-approved" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-approved-text">Confirmed!</h4>
                  <span className="text-xs text-approved-text bg-approved/15 px-2 py-0.5 rounded-full">{spotId}</span>
                </div>
                <p className="text-sm text-approved-text/90 mt-1">
                  Proceed to HOA office for payment
                </p>
                <p className="text-xs text-approved-text/80 mt-1.5">
                  {formatDate(rStart)} – {formatDate(rEnd)} · ₱{(rAmount || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        );

      case 'rejected':
        return (
          <div key={id} className="bg-rejected-bg border border-rejected/25 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="bg-rejected/15 p-2 rounded-full">
                <AlertCircle className="w-5 h-5 text-rejected" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-rejected-text">Rejected</h4>
                  <span className="text-xs text-rejected-text bg-rejected/15 px-2 py-0.5 rounded-full">{spotId}</span>
                </div>
                {rejectionReason && (
                  <p className="text-sm text-rejected-text/90 mt-1">
                    Reason: {rejectionReason}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ============================================================
  // RENDER STATUS MESSAGE
  // ============================================================
  const renderStatusMessage = () => {
    if (loadingStatus) {
      return (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
          <span className="ml-2 text-sm text-gray-500">Loading status...</span>
        </div>
      );
    }

    const activeReservations = userReservations.filter(
      (r) => r.status === 'pending' || r.status === 'confirmed'
    );
    const rejectedReservations = userReservations.filter((r) => r.status === 'rejected');

    return (
      <div>
        {activeReservations.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Car className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm font-medium">No active reservation</p>
            <p className="text-xs text-gray-400 mt-1">Select a spot to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeReservations.map((r) => renderReservationCard(r))}
          </div>
        )}

        {rejectedReservations.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowPastReservations((prev) => !prev)}
              className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-all duration-200 ease-in-out flex items-center gap-1"
            >
              {showPastReservations ? 'Hide' : 'View'} past ({rejectedReservations.length})
            </button>
            {showPastReservations && (
              <div className="space-y-3 mt-3 animate-fade-in">
                {rejectedReservations.map((r) => renderReservationCard(r))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ============================================================
  // LOADING
  // ============================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-gray-50 font-sans animate-page-in">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-24 right-4 z-50 animate-slide-in">
          <div className="bg-white rounded-xl shadow-2xl border border-pending/30 p-4 max-w-sm">
            <div className="flex items-start gap-3">
              <div className="bg-pending/15 p-2 rounded-full">
                <CheckCircle className="w-5 h-5 text-pending" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Reservation Submitted!</h4>
                <p className="text-sm text-gray-600">Your reservation is being processed.</p>
                <span className="inline-block mt-1 text-xs text-pending-text bg-pending/15 px-2 py-0.5 rounded-full">Pending</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HERO */}
      <div className="relative w-full h-[420px] overflow-hidden">
        <img src={heroImg} alt="Car park" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute top-0 left-0 w-full h-20 bg-white z-10" />

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4" style={{ height: 'calc(100% - 88px)' }}>
          <h1 className="mt-20 text-5xl sm:text-6xl font-extrabold text-white tracking-tight">Parking Reservation</h1>
          <p className="text-[var(--color-accent)] text-lg md:text-xl font-semibold tracking-wider block mb-1">
            <span className="text-secondary">WWHS</span> - Reserve a slot for your car parking space!
          </p>
        </div>
      </div>

      {/* Booking Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 flex items-center gap-3 border border-gray-200 rounded-xl px-3 py-2.5">
              <div className="bg-secondary p-2.5 rounded-lg flex-shrink-0">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Location</p>
                <p className="text-sm font-semibold text-gray-900">Parking Area</p>
              </div>
            </div>
            <button
              onClick={() => document.getElementById('parking-space-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="lg:w-40 border-2 border-gray-900 rounded-xl text-sm font-semibold text-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-200 ease-in-out active:scale-95 py-2.5"
            >
              Reserve a slot
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-3 mt-3">
            <div className="flex-1 flex items-center gap-3 border border-gray-200 rounded-xl px-3 py-2.5">
              <div className="bg-secondary p-2.5 rounded-lg flex-shrink-0">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400">Entry date</p>
                <input
                  type="date"
                  value={formatDateForInput(startDate)}
                  onChange={handleStartDateChange}
                  min={formatDateForInput(today)}
                  className="text-sm font-semibold text-gray-900 w-full bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <div className="flex-1 flex items-center gap-3 border border-gray-200 rounded-xl px-3 py-2.5">
              <div className="bg-secondary p-2.5 rounded-lg flex-shrink-0">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Exit date</p>
                <p className="text-sm font-semibold text-gray-900">{formatDate(endDate)}</p>
              </div>
            </div>

            <div className="flex-1 flex items-center gap-3 border border-gray-200 rounded-xl px-3 py-2.5">
              <div className="bg-secondary p-2.5 rounded-lg flex-shrink-0">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Selected spot</p>
                <p className="text-sm font-semibold text-gray-900">{selectedSpot?.id || '—'}</p>
              </div>
            </div>

            <div className="flex-1 flex items-center gap-3 border border-gray-200 rounded-xl px-3 py-2.5">
              <div className="bg-secondary p-2.5 rounded-lg flex-shrink-0">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Price</p>
                <p className="text-sm font-semibold text-gray-900">₱{totalAmount.toLocaleString()}/mo</p>
              </div>
            </div>

            <button
              onClick={handleInputDetails}
              className="lg:w-56 bg-secondary hover:bg-amber-400 rounded-xl text-sm font-bold text-gray-900 transition-all duration-200 ease-in-out active:scale-95 py-2.5"
            >
              Choose this space
            </button>
          </div>
        </div>
      </div>

      {/* Parking Grid + Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Parking Map */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Map className="w-6 h-6 text-secondary" />
                    Select Your Spot
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Tap an available space below</p>
                </div>
                <div className="text-sm text-gray-500">
                  <span className="font-medium text-gray-700">{spots.filter(s => s.status === 'available').length}</span> available
                </div>
              </div>
            </div>

            <div className="p-6" id="parking-space-container">
              <div className="grid grid-cols-5 gap-3 md:gap-4">
                {getCurrentPageSpots.map((spot) => {
                  const { color, borderClass, bgClass } = getSpotStyles(spot.status);
                  let windowColor = '#F3F4F6';
                  if (spot.status === 'selected') windowColor = '#DBEAFE';
                  else if (spot.status === 'occupied') windowColor = '#FEE2E2';
                  else if (spot.status === 'pending') windowColor = '#FFF3E0';
                  
                  return (
                    <div 
                      key={spot.id} 
                      className={`flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-200 ease-in-out ${
                        spot.status !== 'occupied' && spot.status !== 'pending' 
                          ? 'hover:scale-105 active:scale-90' 
                          : 'opacity-60 cursor-not-allowed'
                      }`}
                      onClick={() => handleSpotClick(spot.id)}
                    >
                      <div className={`w-full aspect-square max-w-[80px] md:max-w-[90px] rounded-xl flex items-center justify-center p-1.5 transition-all ${borderClass} ${bgClass} ${
                        spot.status === 'selected' ? 'shadow-md shadow-orange-100' : ''
                      }`}>
                        <CarIcon 
                          className="w-full h-full" 
                          color={color} 
                          windowColor={windowColor} 
                        />
                      </div>
                      <span className={`text-xs font-bold ${
                        spot.status === 'occupied' ? 'text-red-600' : 
                        spot.status === 'pending' ? 'text-orange-600' : 
                        'text-gray-700'
                      }`}>
                        {spot.number}
                      </span>
                      {spot.status === 'occupied' && (
                        <span className="text-[8px] text-red-500 font-medium">Taken</span>
                      )}
                      {spot.status === 'pending' && (
                        <span className="text-[8px] text-orange-500 font-medium">Pending</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="flex flex-col items-center gap-4 mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg transition-all duration-200 ease-in-out ${
                      currentPage === 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100 active:scale-90'
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex gap-1">
                    {renderPageNumbers()}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg transition-all duration-200 ease-in-out ${
                      currentPage === totalPages
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100 active:scale-90'
                    }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-xs text-gray-400">
                  Showing {Math.min((currentPage - 1) * SPOTS_PER_PAGE + 1, spots.length)} - {Math.min(currentPage * SPOTS_PER_PAGE, spots.length)} of {spots.length} spots
                </div>
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-6 mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                  <span className="text-xs text-gray-600">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-xs text-gray-600">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-400 rounded"></div>
                  <span className="text-xs text-gray-600">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-xs text-gray-600">Occupied</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reservation Status */}
          <div className="lg:col-span-1 lg:sticky lg:top-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Reservation Status</h3>
                <button
                  onClick={handleRefreshStatus}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-all duration-200 ease-in-out active:scale-90"
                >
                  <RefreshCw className={`w-4 h-4 text-gray-400 ${loadingStatus ? 'animate-spin' : ''}`} />
                </button>
              </div>
              {renderStatusMessage()}

              {(() => {
                const activeReservations = userReservations.filter(
                  (r) => r.status === 'pending' || r.status === 'confirmed'
                );
                if (activeReservations.length === 0) return null;
                const combinedTotal = activeReservations.reduce(
                  (sum, r) => sum + (r.totalAmount || 0),
                  0
                );
                return (
                  <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Active reservations</span>
                      <span className="font-semibold text-gray-900">{activeReservations.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                      <span className="text-gray-500">Combined monthly total</span>
                      <span className="font-bold text-lg text-primary">₱{combinedTotal.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && userData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-xl">
                  <Car className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Reservation Details</h3>
              </div>
              <button 
                onClick={() => {
                  setShowModal(false);
                  handleRemoveFile();
                  setReservationError(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4" />
                  User Information
                </h4>
                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">
                      {userData.residentData?.firstName} {userData.residentData?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Contact</p>
                    <p className="font-medium text-gray-900">{userData.residentData?.contactNumber || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Address
                    </p>
                    <p className="font-medium text-gray-900">
                      {[
                        userData.residentData?.block,
                        userData.residentData?.lot,
                        userData.residentData?.street,
                        userData.residentData?.phase
                      ].filter(Boolean).join(', ') || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reservation Details */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wider flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Reservation Details
                </h4>
                <div className="grid grid-cols-2 gap-3 bg-blue-50 p-4 rounded-xl">
                  <div>
                    <p className="text-xs text-gray-500">Parking Spot</p>
                    <p className="font-bold text-blue-600">{selectedSpot?.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Monthly Rate</p>
                    <p className="font-bold text-gray-900">₱{monthlyRate.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Entry Date</p>
                    <p className="font-medium text-gray-900">{formatDate(startDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Exit Date</p>
                    <p className="font-medium text-gray-900">{formatDate(endDate)}</p>
                  </div>
                  <div className="col-span-2 border-t border-blue-200 pt-3">
                    <p className="text-xs text-gray-500">Total Amount</p>
                    <p className="font-bold text-2xl text-blue-600">₱{totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payment Method
                </h4>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                >
                  <option value="cash">💵 Cash</option>
                  <option value="gcash">📱 GCash</option>
                  <option value="check">📝 Check</option>
                </select>
              </div>

              {/* OR/CR Upload */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  OR/CR Document (Optional)
                </h4>
                <div className="bg-gray-50 p-4 rounded-xl">
                  {!orcFile ? (
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload OR/CR</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF (Max 5MB)</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-xl p-4 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {orcPreview ? (
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                              <img src={orcPreview} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                              <File className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{orcFileName}</p>
                            <p className="text-xs text-gray-500">{(orcFile.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <button
                          onClick={handleRemoveFile}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-all text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {reservationError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{reservationError}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowModal(false);
                    handleRemoveFile();
                    setReservationError(null);
                  }}
                  className="px-6 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 ease-in-out active:scale-95 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReservation}
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 ease-in-out active:scale-95 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-200"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Submit Reservation
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        @keyframes page-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-page-in {
          animation: page-in 0.5s ease-in;
        }
      `}</style>
    </div>
  );
}