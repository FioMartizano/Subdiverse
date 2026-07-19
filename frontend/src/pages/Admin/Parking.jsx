// AdminParkingManagement.jsx
import { useState, useEffect } from "react";
import {
  Car,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  Check,
  X,
  AlertCircle,
  Coins,
  Calendar,
  User,
  MapPin,
  File,
  RefreshCw,
} from "lucide-react";

import { db } from "../../firebase";
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc,
  getDoc,
  orderBy,
  serverTimestamp,
  setDoc
} from "firebase/firestore";
import AdminPageLayout from "../../components/admin/AdminPageLayout";
import MetricCard from "../../components/admin/MetricCard";

const STATUS_STYLES = {
  pending: "bg-[#F9A825] text-white",
  confirmed: "bg-[#43A047] text-white",
  rejected: "bg-[#D32F2F] text-white",
};

const STATUS_ICONS = {
  pending: Clock,
  confirmed: CheckCircle2,
  rejected: XCircle,
};

function formatDate(date) {
  if (!date) return "—";
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(date) {
  if (!date) return "—";
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AdminParking() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("all");
  const [activeCard, setActiveCard] = useState("all");
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [openStatusId, setOpenStatusId] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const itemsPerPage = 10;

  // Real-time listener for parking reservations
  useEffect(() => {
    const reservationsQuery = query(
      collection(db, "ParkingReservation"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      reservationsQuery,
      (snapshot) => {
        const reservationsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            startDate: data.startDate?.toDate?.() || new Date(data.startDate),
            endDate: data.endDate?.toDate?.() || new Date(data.endDate),
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
            confirmedAt: data.confirmedAt?.toDate?.() || null,
            rejectedAt: data.rejectedAt?.toDate?.() || null,
          };
        });
        setReservations(reservationsData);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore parking reservations error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Statistics
  const totalReservations = reservations.length;
  const pendingReservations = reservations.filter((r) => r.status === "pending").length;
  const confirmedReservations = reservations.filter((r) => r.status === "confirmed").length;
  const rejectedReservations = reservations.filter((r) => r.status === "rejected").length;
  const totalRevenue = reservations
    .filter((r) => r.status === "confirmed")
    .reduce((sum, r) => sum + (r.totalAmount || 0), 0);

  // Filter reservations
  const filtered = reservations.filter((r) => {
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const matchesSearch =
      search.trim() === "" ||
      r.residentInfo?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.spotId?.toLowerCase().includes(search.toLowerCase()) ||
      r.residentId?.toLowerCase().includes(search.toLowerCase()) ||
      r.residentInfo?.address?.toLowerCase().includes(search.toLowerCase());

    let matchesCard = true;
    if (activeCard === "pending") {
      matchesCard = r.status === "pending";
    } else if (activeCard === "confirmed") {
      matchesCard = r.status === "confirmed";
    } else if (activeCard === "needsReview") {
      matchesCard = r.status === "pending" || r.status === "rejected";
    }

    return matchesStatus && matchesSearch && matchesCard;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedReservations = filtered.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Status change handlers (similar to account status)
  const updateReservationStatus = async (reservationId, newStatus, reason = "") => {
    setActionLoading(true);
    setActionError("");
    setActionSuccess("");

    try {
      const reservationRef = doc(db, "ParkingReservation", reservationId);
      const reservationSnap = await getDoc(reservationRef);
      const reservationData = reservationSnap.data();

      const updateData = {
        status: newStatus,
        paymentStatus: newStatus === "confirmed" ? "confirmed" : "pending",
      };

      if (newStatus === "confirmed") {
        updateData.confirmedAt = serverTimestamp();
      }

      if (newStatus === "rejected" && reason) {
        updateData.rejectionReason = reason.trim();
        updateData.rejectedAt = serverTimestamp();
      }

      await updateDoc(reservationRef, updateData);

      // Update parking availability
      const availabilityRef = doc(db, "ParkingAvailability", reservationData.spotId);
      const availabilitySnap = await getDoc(availabilityRef);

      if (newStatus === "confirmed") {
        if (availabilitySnap.exists()) {
          await updateDoc(availabilityRef, {
            isOccupied: true,
            isPending: false,
            currentReservationId: reservationId,
            lastUpdated: serverTimestamp(),
          });
        } else {
          await setDoc(availabilityRef, {
            spotId: reservationData.spotId,
            spotNumber: reservationData.spotNumber,
            isOccupied: true,
            isPending: false,
            currentReservationId: reservationId,
            lastUpdated: serverTimestamp(),
          });
        }
      } else if (newStatus === "rejected") {
        if (availabilitySnap.exists()) {
          const availabilityData = availabilitySnap.data();
          if (availabilityData.isPending) {
            await updateDoc(availabilityRef, {
              isPending: false,
              lastUpdated: serverTimestamp(),
            });
          }
        }
      }

      setOpenMenuId(null);
      setOpenStatusId(null);
      setPendingAction(null);
      setSelectedReservation(null);
      setRejectionReason("");

      setActionSuccess(
        `Reservation successfully ${newStatus}.`
      );

      setTimeout(() => setActionSuccess(""), 5000);

    } catch (error) {
      console.error("Error updating reservation status:", error);
      setActionError("Could not update the reservation status. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Get status actions (similar to account actions)
// Replace the getStatusActions function with this:
  const getStatusActions = (reservation) => {
    // Only allow status changes if the reservation is pending
    if (reservation.status === "pending") {
      return [
        {
          label: "Confirm",
          newStatus: "confirmed",
        },
        {
          label: "Reject",
          newStatus: "rejected",
          danger: true,
          requiresReason: true,
        },
      ];
    }
    
    // Return empty array for confirmed or rejected (no actions available)
    return [];
  };
  // Request action (similar to user management)
  const requestAction = (reservation, action) => {
    setActionError("");
    setActionSuccess("");
    setOpenMenuId(null);
    setOpenStatusId(null);

    if (action.requiresReason) {
      setSelectedReservation(reservation);
      setPendingAction({
        reservationId: reservation.id,
        residentName: reservation.residentInfo?.name,
        spotId: reservation.spotId,
        label: action.label,
        currentStatus: reservation.status,
        newStatus: action.newStatus,
        danger: action.danger || false,
        requiresReason: true,
      });
    } else {
      // Direct action (no reason needed for confirm)
      updateReservationStatus(reservation.id, action.newStatus);
    }
  };

  const confirmPendingAction = async () => {
    if (!pendingAction) return;

    if (pendingAction.requiresReason && !rejectionReason.trim()) {
      setActionError("Please provide a reason for rejection.");
      return;
    }

    await updateReservationStatus(
      pendingAction.reservationId,
      pendingAction.newStatus,
      rejectionReason
    );
  };

  // Card selection
  const selectCard = (card, status) => {
    setActiveCard(card);
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Get status badge component
  const getStatusBadge = (status) => {
    const StatusIcon = STATUS_ICONS[status] || Clock;
    const style = STATUS_STYLES[status] || "bg-gray-400 text-white";
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-buttons text-xs capitalize ${style}`}>
        <StatusIcon size={12} />
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-lg font-medium text-foreground">Loading reservations...</p>
          <p className="text-sm text-muted-foreground mt-1">Please wait while we fetch real-time data.</p>
        </div>
      </div>
    );
  }

  return (
    <AdminPageLayout
      title="Parking Management"
      subtitle="View, confirm, and manage parking reservations"
      action={
        <button className="btn-primary !px-4 !py-2 !text-sm !font-medium w-full sm:w-auto inline-flex items-center gap-2">
          WALK IN ATA
        </button>
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

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          icon={Car}
          gradient="linear-gradient(135deg, #42A5F5, #1565C0)"
          textColor="#ffffff"
          subTextColor="rgba(255,255,255,0.85)"
          label="Total reservations"
          value={totalReservations.toLocaleString()}
          description="All parking reservations made by residents."
          onClick={() => selectCard("all", "all")}
          isActive={activeCard === "all"}
        />
        <MetricCard
          icon={Clock}
          gradient="linear-gradient(135deg, #FDD835, #F9A825)"
          textColor="#5D4037"
          subTextColor="rgba(93,64,55,0.75)"
          label="Pending approval"
          value={pendingReservations.toLocaleString()}
          description="Reservations waiting for admin confirmation."
          onClick={() => selectCard("pending", "pending")}
          isActive={activeCard === "pending"}
        />
        <MetricCard
          icon={CheckCircle2}
          gradient="linear-gradient(135deg, #66BB6A, #2E7D32)"
          textColor="#ffffff"
          subTextColor="rgba(255,255,255,0.85)"
          label="Confirmed"
          value={confirmedReservations.toLocaleString()}
          description="Approved reservations with active parking spots."
          onClick={() => selectCard("confirmed", "confirmed")}
          isActive={activeCard === "confirmed"}
        />
        <MetricCard
          icon={Coins}
          gradient="linear-gradient(135deg, #FF8A65, #E64A19)"
          textColor="#ffffff"
          subTextColor="rgba(255,255,255,0.85)"
          label="Total Revenue"
          value={`₱${totalRevenue.toLocaleString()}`}
          description="Total collected from confirmed reservations."
          onClick={() => selectCard("needsReview", "all")}
          isActive={activeCard === "needsReview"}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-3">
          <label className="text-sm text-muted-foreground whitespace-nowrap">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setActiveCard(e.target.value === "all" ? "all" : e.target.value);
              setCurrentPage(1);
            }}
            className="text-sm border border-input rounded-buttons px-3 py-2 bg-card focus:outline-none focus:ring-2 focus:ring-ring/30"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="hidden sm:block flex-1" />

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search by name, spot, or ID..."
            className="text-sm border border-input rounded-buttons pl-9 pr-3 py-2 w-full sm:w-64 bg-card focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-cards border border-border shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted text-muted-foreground">
              <th className="text-left font-medium px-4 py-3 min-w-[200px]">Resident</th>
              <th className="hidden lg:table-cell text-left font-medium px-4 py-3 min-w-[100px]">Spot</th>
              <th className="hidden md:table-cell text-left font-medium px-4 py-3 min-w-[200px]">Dates</th>
              <th className="text-left font-medium px-4 py-3 min-w-[120px]">Amount</th>
              <th className="text-left font-medium px-4 py-3 min-w-[120px]">Status</th>
              <th className="min-w-[56px]" />
            </tr>
          </thead>
          <tbody>
            {paginatedReservations.map((r) => (
              <tr key={r.id} className="border-t border-border hover:bg-muted/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-medium flex-shrink-0">
                      {r.residentInfo?.name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "??"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{r.residentInfo?.name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground truncate">{r.residentInfo?.contactNumber || "No contact"}</p>
                    </div>
                  </div>
                </td>
                <td className="hidden lg:table-cell px-4 py-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">
                    {r.spotId}
                  </span>
                </td>
                <td className="hidden md:table-cell px-4 py-3">
                  <div className="text-xs">
                    <p className="text-foreground">{formatDate(r.startDate)}</p>
                    <p className="text-muted-foreground">→ {formatDate(r.endDate)}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-foreground text-sm">
                    ₱{(r.totalAmount || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">/month</p>
                </td>
                  <td className="px-4 py-3 relative">
                    <div className="relative inline-block text-left">
                      <button
                        type="button"
                        onClick={() => {
                          if (r.status=== "pending") {
                            setOpenStatusId(openStatusId === r.id ? null : r.id);
                            setOpenMenuId(null);
                          }
                        }}
                        title={r.status === "pending" ? "Click to change status" : "Status cannot be changed"}
                        className={`inline-flex items-center gap-1 ${r.status !== "pending" ? "cursor-default" : "cursor-pointer"}`}
                      >
                        {getStatusBadge(r.status)}
                        {r.status === "pending" && (
                          <ChevronDown size={12} className="text-muted-foreground" />
                        )}
                      </button>

                      {openStatusId === r.id && r.status === "pending" && (
                        <div className="absolute left-0 top-8 z-50 w-48 rounded-xl border border-border bg-card shadow-xl py-1 text-left">
                          <div className="px-3 py-2 text-[11px] font-medium text-muted-foreground">
                            Change status
                          </div>

                          {getStatusActions(r).map((action) => (
                            <button
                              key={action.newStatus}
                              type="button"
                              disabled={actionLoading}
                              onClick={() => requestAction(r, action)}
                              className={`w-full px-3 py-2 text-xs text-left disabled:opacity-50 ${
                                action.danger
                                  ? "text-red-600 hover:bg-red-50"
                                  : "hover:bg-muted"
                              }`}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                <td className="px-4 py-3 text-right">
                  <div className="relative inline-block text-left">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenuId(openMenuId === r.id ? null : r.id);
                        setOpenStatusId(null);
                      }}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-buttons hover:bg-muted"
                      aria-label="More actions"
                    >
                      <MoreVertical size={16} className="text-muted-foreground" />
                    </button>

                    {openMenuId === r.id && (
                      <div className="absolute right-0 top-9 z-50 w-40 rounded-xl border border-border bg-card shadow-xl py-1 text-left">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedReservation(r);
                            setShowDetailModal(true);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-3 py-2 text-xs text-left hover:bg-muted"
                        >
                          View details
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {paginatedReservations.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">
                  No reservations match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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

      {/* Pending Action Modal (Confirm/Reject with reason) */}
      {pendingAction && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground">
              {pendingAction.label} Reservation
            </h2>

            <p className="text-sm text-muted-foreground mt-2 leading-6">
              Are you sure you want to{" "}
              <span className={`font-medium ${pendingAction.danger ? "text-red-600" : "text-foreground"}`}>
                {pendingAction.label.toLowerCase()}
              </span>{" "}
              the parking reservation for{" "}
              <span className="font-medium text-foreground">
                {pendingAction.residentName}
              </span>{" "}
              for spot{" "}
              <span className="font-medium text-foreground">
                {pendingAction.spotId}
              </span>
              ?
            </p>

            {pendingAction.requiresReason && (
              <div className="mt-4">
                <label className="text-sm font-medium text-foreground">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason..."
                  className="w-full mt-1.5 px-4 py-3 border-2 border-input rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all text-sm min-h-[80px] resize-y bg-card"
                />
              </div>
            )}

            {actionError && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {actionError}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => {
                  setPendingAction(null);
                  setRejectionReason("");
                  setActionError("");
                }}
                className="px-4 py-2 text-sm rounded-buttons border border-border hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={confirmPendingAction}
                className={`px-4 py-2 text-sm font-medium rounded-buttons text-white disabled:opacity-50 ${
                  pendingAction.danger
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {actionLoading ? "Processing..." : `Confirm ${pendingAction.label}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedReservation && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-2xl bg-card border border-border shadow-2xl">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Reservation Details</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Complete reservation information
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedReservation(null);
                }}
                className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between bg-muted/50 p-4 rounded-xl">
                <span className="text-sm text-muted-foreground">Status</span>
                {getStatusBadge(selectedReservation.status)}
              </div>

              {/* Resident Info */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <User size={16} />
                  Resident Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl">
                  <DetailItem label="Name" value={selectedReservation.residentInfo?.name} />
                  <DetailItem label="Contact" value={selectedReservation.residentInfo?.contactNumber} />
                  <DetailItem label="Category" value={selectedReservation.residentInfo?.residentCategory} />
                  <DetailItem label="Address" value={selectedReservation.residentInfo?.address} />
                </div>
              </div>

              {/* Reservation Details */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Calendar size={16} />
                  Reservation Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl">
                  <DetailItem label="Spot" value={selectedReservation.spotId} />
                  <DetailItem label="Spot Number" value={`#${selectedReservation.spotNumber}`} />
                  <DetailItem label="Start Date" value={formatDate(selectedReservation.startDate)} />
                  <DetailItem label="End Date" value={formatDate(selectedReservation.endDate)} />
                  <DetailItem label="Monthly Rate" value={`₱${(selectedReservation.monthlyRate || 0).toLocaleString()}`} />
                  <DetailItem label="Total Amount" value={`₱${(selectedReservation.totalAmount || 0).toLocaleString()}`} />
                  <DetailItem label="Payment Method" value={selectedReservation.paymentType || "cash"} />
                  <DetailItem label="Payment Status" value={selectedReservation.paymentStatus || "pending"} />
                </div>
              </div>

              {/* OR/CR Document */}
              {selectedReservation.orcFileInfo && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <File size={16} />
                    OR/CR Document
                  </h3>
                  <div className="bg-muted/30 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <File size={24} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {selectedReservation.orcFileInfo.fileName}
                        </p>
                        <p className="text-xs text-muted-foreground">
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
              {selectedReservation.status === "rejected" && selectedReservation.rejectionReason && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-red-600">
                    <AlertCircle size={16} />
                    Rejection Reason
                  </h3>
                  <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 p-4 rounded-xl">
                    <p className="text-red-700 dark:text-red-400">{selectedReservation.rejectionReason}</p>
                    {selectedReservation.rejectedAt && (
                      <p className="text-xs text-red-500 dark:text-red-400/70 mt-1">
                        Rejected on {formatDateTime(selectedReservation.rejectedAt)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground border-t border-border pt-4">
                <div>
                  <span className="font-medium">Submitted:</span> {formatDateTime(selectedReservation.createdAt)}
                </div>
                {selectedReservation.confirmedAt && (
                  <div>
                    <span className="font-medium">Confirmed:</span> {formatDateTime(selectedReservation.confirmedAt)}
                  </div>
                )}
                <div className="col-span-2">
                  <span className="font-medium">Reservation ID:</span> {selectedReservation.id}
                </div>
              </div>
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

export default AdminParking;