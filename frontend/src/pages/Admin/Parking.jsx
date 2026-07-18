// AdminParkingManagement.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Filter, CheckCircle, XCircle, Clock, AlertCircle,
  Eye, ChevronDown, ChevronUp, RefreshCw, User, MapPin,
  Calendar, DollarSign, Car, File, Trash2, Download,
  ChevronLeft, ChevronRight, Users, TrendingUp, TrendingDown,
  MoreVertical, Check, X, AlertTriangle, MessageSquare
} from 'lucide-react';
import { db, auth } from '../../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  limit,
  startAfter,
  Timestamp
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function AdminParking() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(null); // 'confirm' | 'reject'
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    dateRange: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    rejected: 0,
    totalRevenue: 0
  });

  // Real-time listener for reservations
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await checkAdminStatus(currentUser.uid);
        setupReservationsListener();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const checkAdminStatus = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role !== 'admin') {
          alert('Access denied. Admin privileges required.');
          return;
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setLoading(false);
    }
  };

  const setupReservationsListener = () => {
    const reservationsRef = collection(db, 'ParkingReservation');
    const q = query(reservationsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reservationsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate?.() || new Date(data.startDate),
          endDate: data.endDate?.toDate?.() || new Date(data.endDate),
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
        };
      });

      setReservations(reservationsData);
      applyFilters(reservationsData, filters);
      calculateStats(reservationsData);
    }, (error) => {
      console.error('Error listening to reservations:', error);
    });

    return () => unsubscribe();
  };

  const applyFilters = (data, currentFilters) => {
    let filtered = [...data];

    // Status filter
    if (currentFilters.status !== 'all') {
      filtered = filtered.filter(r => r.status === currentFilters.status);
    }

    // Search filter
    if (currentFilters.search.trim()) {
      const searchTerm = currentFilters.search.toLowerCase().trim();
      filtered = filtered.filter(r => {
        const residentName = r.residentInfo?.name?.toLowerCase() || '';
        const spotId = r.spotId?.toLowerCase() || '';
        const residentId = r.residentId?.toLowerCase() || '';
        return residentName.includes(searchTerm) ||
               spotId.includes(searchTerm) ||
               residentId.includes(searchTerm);
      });
    }

    // Date range filter
    const now = new Date();
    if (currentFilters.dateRange === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filtered = filtered.filter(r => r.createdAt >= today);
    } else if (currentFilters.dateRange === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(r => r.createdAt >= weekAgo);
    } else if (currentFilters.dateRange === 'month') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(r => r.createdAt >= monthAgo);
    }

    setFilteredReservations(filtered);
  };

  const calculateStats = (data) => {
    const pending = data.filter(r => r.status === 'pending').length;
    const confirmed = data.filter(r => r.status === 'confirmed').length;
    const rejected = data.filter(r => r.status === 'rejected').length;
    const totalRevenue = data
      .filter(r => r.status === 'confirmed')
      .reduce((sum, r) => sum + (r.totalAmount || 0), 0);

    setStats({
      total: data.length,
      pending,
      confirmed,
      rejected,
      totalRevenue
    });
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(reservations, newFilters);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters(reservations, filters);
  };

  const clearFilters = () => {
    const defaultFilters = {
      status: 'all',
      search: '',
      dateRange: 'all'
    };
    setFilters(defaultFilters);
    applyFilters(reservations, defaultFilters);
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(filteredReservations.length / ITEMS_PER_PAGE);
  const currentItems = filteredReservations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Action handlers
  const handleConfirmReservation = async () => {
    if (!selectedReservation) return;

    setActionLoading(true);
    setActionError(null);

    try {
      // Update reservation status
      const reservationRef = doc(db, 'ParkingReservation', selectedReservation.id);
      await updateDoc(reservationRef, {
        status: 'confirmed',
        paymentStatus: 'confirmed',
        confirmedAt: serverTimestamp(),
        confirmedBy: user?.uid || null
      });

      // Update parking availability
      const availabilityRef = doc(db, 'ParkingAvailability', selectedReservation.spotId);
      const availabilitySnap = await getDoc(availabilityRef);
      if (availabilitySnap.exists()) {
        await updateDoc(availabilityRef, {
          isOccupied: true,
          isPending: false,
          currentReservationId: selectedReservation.id,
          lastUpdated: serverTimestamp()
        });
      } else {
        // Create availability document if it doesn't exist
        await setDoc(availabilityRef, {
          spotId: selectedReservation.spotId,
          spotNumber: selectedReservation.spotNumber,
          isOccupied: true,
          isPending: false,
          currentReservationId: selectedReservation.id,
          lastUpdated: serverTimestamp()
        });
      }

      setSuccessMessage(`Reservation ${selectedReservation.id} has been confirmed successfully!`);
      setShowActionModal(false);
      setSelectedReservation(null);
      
      setTimeout(() => setSuccessMessage(null), 5000);

    } catch (error) {
      console.error('Error confirming reservation:', error);
      setActionError('Failed to confirm reservation. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectReservation = async () => {
    if (!selectedReservation) return;

    if (!rejectionReason.trim()) {
      setActionError('Please provide a reason for rejection.');
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      // Update reservation status
      const reservationRef = doc(db, 'ParkingReservation', selectedReservation.id);
      await updateDoc(reservationRef, {
        status: 'rejected',
        rejectionReason: rejectionReason.trim(),
        rejectedAt: serverTimestamp(),
        rejectedBy: user?.uid || null
      });

      // Update parking availability if pending
      const availabilityRef = doc(db, 'ParkingAvailability', selectedReservation.spotId);
      const availabilitySnap = await getDoc(availabilityRef);
      if (availabilitySnap.exists()) {
        const availabilityData = availabilitySnap.data();
        if (availabilityData.isPending) {
          await updateDoc(availabilityRef, {
            isPending: false,
            lastUpdated: serverTimestamp()
          });
        }
      }

      setSuccessMessage(`Reservation ${selectedReservation.id} has been rejected.`);
      setShowActionModal(false);
      setSelectedReservation(null);
      setRejectionReason('');

      setTimeout(() => setSuccessMessage(null), 5000);

    } catch (error) {
      console.error('Error rejecting reservation:', error);
      setActionError('Failed to reject reservation. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const openActionModal = (reservation, type) => {
    setSelectedReservation(reservation);
    setActionType(type);
    setRejectionReason('');
    setActionError(null);
    setShowActionModal(true);
  };

  const openDetailModal = (reservation) => {
    setSelectedReservation(reservation);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </span>;
      case 'confirmed':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Confirmed
        </span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {status}
        </span>;
    }
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (date) => {
    if (!date) return '—';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Car className="w-6 h-6 text-blue-600" />
                Parking Management
              </h1>
              <p className="text-xs text-gray-500">Admin Dashboard</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-slide-in">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-green-700">{successMessage}</span>
            <button
              onClick={() => setSuccessMessage(null)}
              className="ml-auto text-green-600 hover:text-green-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
              </div>
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Revenue</p>
                <p className="text-2xl font-bold text-indigo-600">₱{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-indigo-100 p-2 rounded-lg">
                <DollarSign className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <form onSubmit={handleSearch} className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, spot, or ID..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
                />
              </form>
            </div>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm bg-white"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>

            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Reservations Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Resident</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Spot</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dates</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Car className="w-12 h-12 text-gray-300" />
                        <p>No reservations found</p>
                        <p className="text-sm text-gray-400">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-gray-50 transition-all">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {reservation.residentInfo?.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {reservation.residentInfo?.contactNumber || 'No contact'}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">
                          {reservation.spotId}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs">
                          <p className="text-gray-900">{formatDate(reservation.startDate)}</p>
                          <p className="text-gray-400">→ {formatDate(reservation.endDate)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900 text-sm">
                          ₱{(reservation.totalAmount || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">/month</p>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(reservation.status)}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-500">
                          {formatDateTime(reservation.createdAt)}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openDetailModal(reservation)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-gray-600"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {reservation.status === 'pending' && (
                            <>
                              <button
                                onClick={() => openActionModal(reservation, 'confirm')}
                                className="p-1.5 hover:bg-green-100 rounded-lg transition-all text-green-600 hover:text-green-700"
                                title="Confirm"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openActionModal(reservation, 'reject')}
                                className="p-1.5 hover:bg-red-100 rounded-lg transition-all text-red-600 hover:text-red-700"
                                title="Reject"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredReservations.length)} of {filteredReservations.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedReservation && (
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
                  setShowDetailModal(false);
                  setSelectedReservation(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                <span className="text-sm text-gray-500">Status</span>
                {getStatusBadge(selectedReservation.status)}
              </div>

              {/* Resident Info */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Resident Information
                </h4>
                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl">
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">
                      {selectedReservation.residentInfo?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Contact</p>
                    <p className="font-medium text-gray-900">
                      {selectedReservation.residentInfo?.contactNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Category</p>
                    <p className="font-medium text-gray-900">
                      {selectedReservation.residentInfo?.residentCategory || 'N/A'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Address
                    </p>
                    <p className="font-medium text-gray-900">
                      {selectedReservation.residentInfo?.address || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reservation Details */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Reservation Details
                </h4>
                <div className="grid grid-cols-2 gap-3 bg-blue-50 p-4 rounded-xl">
                  <div>
                    <p className="text-xs text-gray-500">Parking Spot</p>
                    <p className="font-bold text-blue-600">{selectedReservation.spotId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Spot Number</p>
                    <p className="font-medium text-gray-900">#{selectedReservation.spotNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Start Date</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedReservation.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">End Date</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedReservation.endDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Monthly Rate</p>
                    <p className="font-medium text-gray-900">₱{selectedReservation.monthlyRate?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Amount</p>
                    <p className="font-bold text-blue-600">₱{(selectedReservation.totalAmount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Payment Method</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {selectedReservation.paymentType || 'cash'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Payment Status</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {selectedReservation.paymentStatus || 'pending'}
                    </p>
                  </div>
                </div>
              </div>

              {/* OR/CR Document */}
              {selectedReservation.orcFileInfo && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wider flex items-center gap-2">
                    <File className="w-4 h-4" />
                    OR/CR Document
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <File className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {selectedReservation.orcFileInfo.fileName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(selectedReservation.orcFileInfo.fileSize / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <a
                        href={selectedReservation.orcFileInfo.secureUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-all"
                      >
                        View
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedReservation.status === 'rejected' && selectedReservation.rejectionReason && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Rejection Reason
                  </h4>
                  <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                    <p className="text-red-700">{selectedReservation.rejectionReason}</p>
                    {selectedReservation.rejectedAt && (
                      <p className="text-xs text-red-500 mt-1">
                        Rejected on {formatDateTime(selectedReservation.rejectedAt)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-400 border-t border-gray-100 pt-4">
                <div>
                  <span className="font-medium">Submitted:</span>
                  {' '}{formatDateTime(selectedReservation.createdAt)}
                </div>
                {selectedReservation.confirmedAt && (
                  <div>
                    <span className="font-medium">Confirmed:</span>
                    {' '}{formatDateTime(selectedReservation.confirmedAt)}
                  </div>
                )}
                <div className="col-span-2">
                  <span className="font-medium">Reservation ID:</span>
                  {' '}{selectedReservation.id}
                </div>
              </div>

              {/* Actions */}
              {selectedReservation.status === 'pending' && (
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      openActionModal(selectedReservation, 'reject');
                    }}
                    className="px-6 py-2.5 rounded-xl border-2 border-red-300 text-red-600 hover:bg-red-50 transition-all duration-200 ease-in-out text-sm font-medium"
                  >
                    <X className="w-4 h-4 inline mr-1" />
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      openActionModal(selectedReservation, 'confirm');
                    }}
                    className="px-6 py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all duration-200 ease-in-out text-sm font-medium shadow-lg shadow-green-200"
                  >
                    <Check className="w-4 h-4 inline mr-1" />
                    Confirm Reservation
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Modal (Confirm/Reject) */}
      {showActionModal && selectedReservation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-xl ${
                  actionType === 'confirm' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {actionType === 'confirm' ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {actionType === 'confirm' ? 'Confirm Reservation' : 'Reject Reservation'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {actionType === 'confirm'
                      ? `Confirm ${selectedReservation.spotId} for ${selectedReservation.residentInfo?.name}`
                      : `Reject ${selectedReservation.spotId} for ${selectedReservation.residentInfo?.name}`
                    }
                  </p>
                </div>
              </div>

              {/* Reservation Summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Spot</p>
                    <p className="font-semibold text-gray-900">{selectedReservation.spotId}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Resident</p>
                    <p className="font-semibold text-gray-900">{selectedReservation.residentInfo?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Dates</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(selectedReservation.startDate)} → {formatDate(selectedReservation.endDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Amount</p>
                    <p className="font-semibold text-gray-900">₱{(selectedReservation.totalAmount || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Rejection Reason */}
              {actionType === 'reject' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Reason for Rejection <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a reason for rejecting this reservation..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all text-sm min-h-[100px] resize-y"
                  />
                </div>
              )}

              {actionError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700 mb-4">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{actionError}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowActionModal(false);
                    setSelectedReservation(null);
                    setRejectionReason('');
                    setActionError(null);
                  }}
                  className="px-6 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 ease-in-out text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={actionType === 'confirm' ? handleConfirmReservation : handleRejectReservation}
                  disabled={actionLoading}
                  className={`px-6 py-2.5 rounded-xl text-white transition-all duration-200 ease-in-out text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                    actionType === 'confirm'
                      ? 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200'
                      : 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200'
                  }`}
                >
                  {actionLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      {actionType === 'confirm' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                      {actionType === 'confirm' ? 'Confirm' : 'Reject'}
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
            transform: translateY(-10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
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