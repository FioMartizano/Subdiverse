import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Calendar, X, CheckCircle, AlertCircle, Clock, Upload, File, Trash2, RefreshCw } from 'lucide-react';
import { auth, db, storage } from '../../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, getDoc, doc, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { uploadImage } from "../../services/cloudinary";

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

  // Status Display States
  const [userReservation, setUserReservation] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  // OR/CR Upload States
  const [orcFile, setOrcFile] = useState(null);
  const [orcPreview, setOrcPreview] = useState(null);
  const [orcFileName, setOrcFileName] = useState('');
  const fileInputRef = useRef(null);

  // Payment Type State
  const [paymentType, setPaymentType] = useState('cash');

  // Generate 50 spots (1-50)
  const generateSpots = () => {
    const spots = [];
    const totalSpots = 50;
    
    for (let i = 1; i <= totalSpots; i++) {
      const id = `SPOT-${String(i).padStart(2, '0')}`;
      const isOccupied = 
        i === 3 || i === 7 || i === 12 || i === 15 || 
        i === 22 || i === 28 || i === 35 || i === 42 || i === 48;
      spots.push({
        id,
        number: i,
        status: isOccupied ? 'occupied' : 'available'
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

  // Check if user is authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchUserData(currentUser.uid);
        await fetchLatestReservation(currentUser.uid);
      } else {
        setUser(null);
        setUserData(null);
        setUserReservation(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && userData) {
      fetchLatestReservation(user.uid);
    }
  }, [user, userData]);

  // Fetch user data from Firestore
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


// Fetch user's latest reservation
const fetchLatestReservation = async (uid) => {
  if (!uid) {
    console.log('❌ No UID provided');
    return;
  }
  
  console.log('🔍 Fetching reservation for user UID:', uid);
  setLoadingStatus(true);
  
  try {
    const reservationsRef = collection(db, 'ParkingReservation');
    // Query by userId (which should be the Firebase Auth UID)
    const q = query(
      reservationsRef,
      where('userId', '==', uid) // This should match user.uid
    );
    const querySnapshot = await getDocs(q);
    
    console.log(`👤 Found ${querySnapshot.size} reservations for user UID:`, uid);
    
    if (!querySnapshot.empty) {
      // Sort by createdAt descending
      const sortedDocs = querySnapshot.docs.sort((a, b) => {
        const aData = a.data();
        const bData = b.data();
        const aTime = aData.createdAt?.toDate?.() || new Date(aData.createdAt);
        const bTime = bData.createdAt?.toDate?.() || new Date(bData.createdAt);
        return bTime - aTime;
      });
      
      const doc = sortedDocs[0];
      const data = doc.data();
      console.log('✅ Found reservation:', { id: doc.id, ...data });
      
      // Convert Firestore timestamps
      const startDate = data.startDate?.toDate ? data.startDate.toDate() : new Date(data.startDate);
      const endDate = data.endDate?.toDate ? data.endDate.toDate() : new Date(data.endDate);
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
      
      setUserReservation({
        id: doc.id,
        ...data,
        startDate: startDate,
        endDate: endDate,
        createdAt: createdAt
      });
    } else {
      console.log('❌ No reservations found for user UID:', uid);
      setUserReservation(null);
    }
  } catch (error) {
    console.error('❌ Error fetching reservation:', error);
  } finally {
    setLoadingStatus(false);
  }
};

  // Check if user has pending reservation
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

  // Check if spot is available for selected dates
  const checkSpotAvailability = async (spotId, startDate, endDate) => {
    try {
      const reservationsRef = collection(db, 'ParkingReservation');
      const q = query(
        reservationsRef,
        where('spotId', '==', spotId),
        where('status', 'in', ['pending', 'confirmed'])
      );
      const querySnapshot = await getDocs(q);
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      let isAvailable = true;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const existingStart = data.startDate.toDate ? data.startDate.toDate() : new Date(data.startDate);
        const existingEnd = data.endDate.toDate ? data.endDate.toDate() : new Date(data.endDate);
        
        if (start < existingEnd && end > existingStart) {
          isAvailable = false;
        }
      });
      
      return isAvailable;
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  };

  // Handle opening the modal
  const handleInputDetails = async () => {
    if (!user) {
      alert('Please log in to make a reservation.');
      return;
    }

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

    const isAvailable = await checkSpotAvailability(selectedId, startDate, endDate);
    if (!isAvailable) {
      alert('This spot is not available for the selected dates. Please choose another spot or date.');
      return;
    }

    // Reset file upload state when opening modal
    setOrcFile(null);
    setOrcPreview(null);
    setOrcFileName('');
    setPaymentType('cash');
    setReservationError(null);
    setShowModal(true);
  };

  // Handle file selection
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

  // Handle file removal
  const handleRemoveFile = () => {
    setOrcFile(null);
    setOrcPreview(null);
    setOrcFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

// Handle reservation submission
const handleSubmitReservation = async () => {
  if (!user || !userData) return;

  if (!paymentType) {
    setReservationError("Please select a payment method.");
    return;
  }

  setSubmitting(true);
  setReservationError(null);

  try {

    // STEP 1: Upload the OR/CR first
    let uploadedImage = null;

    if (orcFile) {
      uploadedImage = await uploadImage(orcFile, "orcr");

      console.log("✅ Cloudinary Upload Successful");
      console.log(uploadedImage);
    }

    // STEP 2: Create Firestore data
    const reservationData = {
      userId: user.uid,
      residentId: userData.residentId || "",

      spotId: selectedId,
      spotNumber: spots.find((s) => s.id === selectedId)?.number || 0,

      startDate: new Date(startDate),
      endDate: new Date(endDate),

      monthlyRate,
      totalAmount,

      paymentType,
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

      // Cloudinary information
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

    // STEP 3: Save to Firestore
    await addDoc(collection(db, "ParkingReservation"), reservationData);

  } catch (error) {
    console.error(error);
    setReservationError("Failed to submit reservation.");
  } finally {
    setSubmitting(false);
  }
};

  // Refresh status
  const handleRefreshStatus = async () => {
    if (user) {
      await fetchLatestReservation(user.uid);
    }
  };

  // Calculate end date (30 days after start date)
  useMemo(() => {
    if (!startDate) {
      setEndDate(null);
      return;
    }
    const date = new Date(startDate);
    date.setDate(date.getDate() + 30);
    setEndDate(date);
  }, [startDate]);

  const totalDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 0;
  }, [startDate, endDate]);

  const totalAmount = monthlyRate;

  // Get spots for current page
  const getCurrentPageSpots = useMemo(() => {
    const startIndex = (currentPage - 1) * SPOTS_PER_PAGE;
    const endIndex = startIndex + SPOTS_PER_PAGE;
    return spots.slice(startIndex, endIndex);
  }, [spots, currentPage]);

  const totalPages = Math.ceil(spots.length / SPOTS_PER_PAGE);

  const handleSpotClick = (id) => {
    const spot = spots.find(s => s.id === id);
    if (!spot || spot.status === 'occupied') return;

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
        return { color: '#8A1D1D', borderClass: 'border-[#8A1D1D] border-dashed' };
      case 'selected':
        return { color: 'var(--color-primary)', borderClass: 'border-[var(--color-primary)] border-solid' };
      case 'available':
      default:
        return { color: '#D1D5DB', borderClass: 'border-gray-300 border-dashed' };
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
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentPage === i
              ? 'bg-[var(--color-primary)] text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  const renderStatusMessage = () => {
    if (loadingStatus) {
      return (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-[var(--color-primary)] border-t-transparent"></div>
          <span className="ml-2 text-sm text-gray-500">Loading status...</span>
        </div>
      );
    }

    if (!userReservation) {
      return (
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm">No active reservation</p>
          <p className="text-xs text-gray-400 mt-1">Make a reservation to get started</p>
        </div>
      );
    }

    const { status, spotId, rejectionReason } = userReservation;

    switch (status) {
      case 'pending':
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="bg-yellow-100 p-2 rounded-full">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-yellow-800">Pending Approval</h4>
                  <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">{spotId}</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Please wait for the HOA admin to review and approve your reservation.
                </p>
                <p className="text-xs text-yellow-600 mt-2">
                  You will receive a notification once your reservation is processed.
                </p>
              </div>
            </div>
          </div>
        );

      case 'confirmed':
        return (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-green-800">Reservation Confirmed!</h4>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">{spotId}</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  You can now proceed to the HOA office to pay and claim your sticker.
                </p>
                <p className="text-xs text-green-600 mt-2">
                  Please bring your valid ID and payment confirmation.
                </p>
              </div>
            </div>
          </div>
        );

      case 'rejected':
        return (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="bg-red-100 p-2 rounded-full">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-red-800">Reservation Rejected</h4>
                  <span className="text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full">{spotId}</span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  Sorry, we can't process your reservation.
                </p>
                {rejectionReason && (
                  <p className="text-sm text-red-700 mt-1 font-medium">
                    Reason: {rejectionReason}
                  </p>
                )}
                <p className="text-xs text-red-600 mt-2">
                  Please contact the HOA office for more information.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-16">
      {showSuccess && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-sm">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-800">Reservation Submitted!</h4>
                <p className="text-sm text-green-700">Your reservation is waiting for processing. You will be notified once confirmed.</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-green-600">
                  <Clock className="w-3 h-3" />
                  <span>Status: Pending</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 md:p-8 flex justify-center">
        <div className="flex flex-col xl:flex-row gap-6 w-full max-w-[1400px]">
          
          {/* LEFT PANEL: Parking Space */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="bg-[var(--color-secondary)] py-6 text-center">
              <h1 className="text-white text-3xl font-bold tracking-wider uppercase drop-shadow-sm">
                Parking Space
              </h1>
            </div>

            <div className="p-6 md:p-8 flex flex-col h-full" id="parking-space-container">
              <div className="bg-[#FCFAFA] border border-gray-300 rounded-xl p-4 md:p-6 mb-6 relative shadow-sm">
                {/* Parking Spots Grid - 5 columns */}
                <div className="grid grid-cols-5 gap-3 md:gap-4 lg:gap-6">
                  {getCurrentPageSpots.map((spot) => {
                    const { color, borderClass } = getSpotStyles(spot.status);
                    let windowColor = '#FCFAFA';
                    if (spot.status === 'selected') windowColor = '#e9f0e9';
                    else if (spot.status === 'occupied') windowColor = '#f7e9e9';
                    
                    return (
                      <div 
                        key={spot.id} 
                        className="flex flex-col items-center gap-1 cursor-pointer hover:translate-y-[-4px] transition-transform"
                        onClick={() => handleSpotClick(spot.id)}
                      >
                        <div className={`w-full aspect-square max-w-[80px] md:max-w-[100px] border-2 rounded-xl flex items-center justify-center p-1.5 transition-colors ${borderClass}`}>
                          <CarIcon 
                            className="w-full h-full" 
                            color={color} 
                            windowColor={windowColor} 
                          />
                        </div>
                        <span className={`text-xs md:text-sm font-semibold tracking-wide ${spot.status === 'occupied' ? 'text-[#8A1D1D]' : 'text-gray-700'}`}>
                          {spot.number}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pagination Controls */}
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ← Prev
                  </button>
                  {renderPageNumbers()}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Next →
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * SPOTS_PER_PAGE + 1} - {Math.min(currentPage * SPOTS_PER_PAGE, spots.length)} of {spots.length} spots
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-col items-center mt-6">
                <div className="flex flex-wrap justify-center gap-6 md:gap-10">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[var(--color-primary)] rounded shadow-sm"></div>
                    <span className="text-sm text-gray-700 font-medium">Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-300 rounded shadow-sm"></div>
                    <span className="text-sm text-gray-700 font-medium">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#8A1D1D] rounded shadow-sm"></div>
                    <span className="text-sm text-gray-700 font-medium">Occupied</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500 font-semibold tracking-wide mt-3">
                  {spots.filter(s => s.status === 'available').length} out of {spots.length} spots available
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Reservation Details */}
          <div className="w-full xl:w-[380px] shrink-0 flex flex-col gap-4">
           {/* Status Display Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Reservation Status</h3>
              {renderStatusMessage()}
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Reservation Details</h2>
                <button
                  onClick={handleRefreshStatus}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Refresh status"
                >
                  <RefreshCw className={`w-4 h-4 text-gray-500 ${loadingStatus ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-xs text-gray-500 mb-2">Selected Spot</p>
                <div className="border border-[var(--color-primary)] bg-[#eef4ee] rounded-xl p-4 flex flex-col justify-between h-32">
                  <div className="flex justify-between items-start">
                    <CarIcon 
                      className="w-14 h-14 ml-1 mt-1" 
                      color="var(--color-primary)" 
                      windowColor="#eef4ee" 
                    />
                    <span className="font-bold text-gray-900 text-lg">{selectedSpot?.id || '—'}</span>
                  </div>
                  <div className="text-[var(--color-primary)] font-bold text-sm ml-1">
                    Php {monthlyRate.toLocaleString()}/month
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 mb-6">
                <div>
                  <label className="block text-xs text-gray-600 mb-1.5">Start Date</label>
                  <input
                    type="date"
                    value={formatDateForInput(startDate)}
                    onChange={handleStartDateChange}
                    min={formatDateForInput(today)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 bg-white cursor-pointer hover:border-gray-400 transition-colors text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Rental starts on {formatDate(startDate)}
                  </p>
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1.5">End Date (Auto-calculated)</label>
                  <div className="flex items-center justify-between border border-gray-300 rounded-md px-3 py-2.5 bg-gray-50 cursor-not-allowed">
                    <span className="text-sm text-gray-800">{formatDate(endDate)}</span>
                    <Calendar className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    30 days after start date
                  </p>
                </div>
              </div>

              <div className="bg-[var(--color-secondary)] text-white rounded-xl p-5 mb-6 shadow-md">
                <div className="text-xs font-medium opacity-90 mb-1">Total Amount</div>
                <div className="flex justify-between items-end">
                  <div className="text-[10px] opacity-90 pb-1">
                    1 month ({totalDays} days)
                  </div>
                  <div className="text-2xl font-bold tracking-tight">Php {totalAmount.toFixed(2)}</div>
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={handleInputDetails}
                  className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-full text-sm font-semibold hover:brightness-95 transition-all shadow-sm"
                >
                  Input details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reservation Modal */}
      {showModal && userData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
              <h3 className="text-xl font-bold text-gray-900">Reservation Details</h3>
              <button 
                onClick={() => {
                  setShowModal(false);
                  handleRemoveFile();
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* User Information */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">User Information</h4>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">
                      {userData.residentData?.firstName} {userData.residentData?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Contact Number</p>
                    <p className="font-medium text-gray-900">{userData.residentData?.contactNumber || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="font-medium text-gray-900">
                      {[
                        userData.residentData?.block,
                        userData.residentData?.lot,
                        userData.residentData?.street,
                        userData.residentData?.phase
                      ].filter(Boolean).join(', ') || 'N/A'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Resident Category</p>
                    <p className="font-medium text-gray-900 capitalize">{userData.residentData?.residentCategory || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Reservation Details */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">Reservation Details</h4>
                <div className="grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded-xl">
                  <div>
                    <p className="text-xs text-gray-500">Parking Spot</p>
                    <p className="font-bold text-[var(--color-primary)]">{selectedSpot?.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Monthly Rate</p>
                    <p className="font-bold text-gray-900">Php {monthlyRate.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Start Date</p>
                    <p className="font-medium text-gray-900">{formatDate(startDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">End Date</p>
                    <p className="font-medium text-gray-900">{formatDate(endDate)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Total Amount</p>
                    <p className="font-bold text-2xl text-[var(--color-primary)]">Php {totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Payment Type */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">Payment Method</h4>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm text-gray-800"
                  >
                    <option value="cash">Cash</option>
                    <option value="gcash">GCash</option>
                    <option value="check">Check</option>
                  </select>
                </div>
              </div>

              {/* OR/CR Upload Section */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">OR/CR Document (Optional)</h4>
                <div className="bg-gray-50 p-4 rounded-xl">
                  {!orcFile ? (
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[var(--color-primary)] transition-colors cursor-pointer"
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
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {orcPreview ? (
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <img src={orcPreview} alt="OR/CR Preview" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <File className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{orcFileName}</p>
                            <p className="text-xs text-gray-500">
                              {(orcFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleRemoveFile}
                          className="p-1 hover:bg-red-50 rounded-full transition-colors text-red-500"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Upload your Official Receipt (OR) or Certificate of Registration (CR) for verification.
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {reservationError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{reservationError}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowModal(false);
                    handleRemoveFile();
                  }}
                  className="px-6 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReservation}
                  disabled={submitting}
                  className="px-6 py-2 rounded-full bg-[var(--color-primary)] text-white hover:brightness-95 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Reservation'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
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
      `}</style>
    </div>
  );
}