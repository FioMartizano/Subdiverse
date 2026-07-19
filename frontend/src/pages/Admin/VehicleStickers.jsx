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
  Coins,
  AlertCircle,
  Eye,
  CreditCard,
  BadgeCheck,
  FileText,
  User,
  File,
  ExternalLink,
  Image,
} from "lucide-react";

import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  orderBy,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";

import { db } from "../../firebase";

import AdminPageLayout from "../../components/admin/AdminPageLayout";
import MetricCard from "../../components/admin/MetricCard";

// Status style mappings
const STATUS_STYLES = {
  Pending: "bg-pending-bg text-pending-text",
  Approved: "bg-approved-bg text-approved-text",
  Rejected: "bg-rejected-bg text-rejected-text",
  Released: "bg-approved-bg text-approved-text",
};

// Status icon mappings
const STATUS_ICONS = {
  Pending: Clock,
  Approved: CheckCircle2,
  Rejected: XCircle,
  Released: BadgeCheck,
};

// Payment status style mappings
const PAYMENT_STYLES = {
  "Pending Payment": "bg-pending-bg text-pending-text",
  "Pending Verification": "bg-pending-bg text-pending-text",
  "Verified": "bg-approved-bg text-approved-text",
};

// Helper function to format dates
function formatDate(date) {
  if (!date) return "—";
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

// Helper function to format date and time
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

// Helper function to check if file is an image
function isImageFile(filename) {
  if (!filename) return false;
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
  const ext = filename.split('.').pop().toLowerCase();
  return imageExtensions.includes(ext);
}

// Detail Item component
function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground mt-1 break-words">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function VehicleStickers() {
  // State for applications data
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [residentDetails, setResidentDetails] = useState({});

  // State for filters and search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeCard, setActiveCard] = useState("all");

  // State for UI controls
  const [openMenuId, setOpenMenuId] = useState(null);
  const [openStatusId, setOpenStatusId] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // State for actions
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Function to fetch resident details
  const fetchResidentDetails = async (residentId) => {
    if (!residentId || residentDetails[residentId]) return;
    
    try {
      const residentRef = doc(db, "residents", residentId);
      const residentSnap = await getDoc(residentRef);
      
      if (residentSnap.exists()) {
        setResidentDetails(prev => ({
          ...prev,
          [residentId]: residentSnap.data()
        }));
      }
    } catch (error) {
      console.error("Error fetching resident details:", error);
    }
  };

  // Real-time listener for vehicle sticker applications
  useEffect(() => {
    const applicationsQuery = query(
      collection(db, "vehicleStickerApplications"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      applicationsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const docData = doc.data();
          return {
            id: doc.id,
            ...docData,
            createdAt: docData.createdAt?.toDate?.() || new Date(docData.createdAt),
            approvedAt: docData.approvedAt?.toDate?.() || null,
            rejectedAt: docData.rejectedAt?.toDate?.() || null,
            releasedAt: docData.releasedAt?.toDate?.() || null,
            paymentVerifiedAt: docData.paymentVerifiedAt?.toDate?.() || null,
          };
        });
        setApplications(data);
        setLoading(false);

        // Fetch resident details for each application
        data.forEach(app => {
          if (app.residentUid) {
            fetchResidentDetails(app.residentUid);
          }
        });
      },
      (error) => {
        console.error("Firestore vehicle sticker applications error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Calculate metrics
  const totalApplications = applications.length;
  const pendingApplications = applications.filter((app) => app.status === "Pending").length;
  const approvedApplications = applications.filter((app) => app.status === "Approved").length;
  const releasedApplications = applications.filter((app) => app.status === "Released").length;
  const paymentPending = applications.filter((app) => app.paymentStatus === "Pending Payment").length;

  // Filter applications based on search, status, and active card
  const filteredApplications = applications.filter((app) => {
    const matchesStatus = statusFilter === "all" ? true : app.status === statusFilter;

    const matchesSearch =
      search.trim() === ""
        ? true
        : (app.residentInfo?.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
          (app.vehicleInfo?.plateNumber || "").toLowerCase().includes(search.toLowerCase());

    let matchesCard = true;
    if (activeCard === "pending") matchesCard = app.status === "Pending";
    if (activeCard === "approved") matchesCard = app.status === "Approved";
    if (activeCard === "released") matchesCard = app.status === "Released";
    if (activeCard === "payment") matchesCard = app.paymentStatus === "Pending Payment";

    return matchesStatus && matchesSearch && matchesCard;
  });

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / itemsPerPage));
  const safeCurrentPage = currentPage > totalPages ? totalPages : currentPage;
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedApplications = filteredApplications.slice(startIndex, startIndex + itemsPerPage);

  // Update current page when total pages change
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Get status badge component
  const getStatusBadge = (status) => {
    const StatusIcon = STATUS_ICONS[status] || Clock;
    const style = STATUS_STYLES[status] || "bg-gray-100 text-gray-600";

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-buttons text-xs font-medium ${style}`}
      >
        <StatusIcon size={12} />
        {status}
      </span>
    );
  };

  // Get payment status badge
  const getPaymentBadge = (paymentStatus) => {
    const style = PAYMENT_STYLES[paymentStatus] || "bg-gray-100 text-gray-600";
    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${style}`}>
        {paymentStatus}
      </span>
    );
  };

  // Get status actions
  const getStatusActions = (application) => {
    const actions = [];

    if (application.status === "Pending") {
      actions.push({ 
        label: "Approve", 
        newStatus: "Approved",
      });
      actions.push({ 
        label: "Reject", 
        newStatus: "Rejected", 
        danger: true, 
        requiresReason: true,
      });
    }

    if (application.status === "Approved" && application.paymentStatus === "Pending Verification") {
      actions.push({ 
        label: "Verify Payment", 
        paymentOnly: true,
      });
    }

    if (application.status === "Approved" && application.paymentStatus === "Verified") {
      actions.push({ 
        label: "Release Sticker", 
        releaseOnly: true,
      });
    }

    return actions;
  };

  // Approve application
  const approveApplication = async (application) => {
    try {
      setActionLoading(true);
      const ref = doc(db, "vehicleStickerApplications", application.id);
      await updateDoc(ref, {
        status: "Approved",
        paymentStatus: "Pending Payment",
        approvedAt: serverTimestamp(),
      });
      setActionSuccess("Application approved successfully.");
      setPendingAction(null);
      setSelectedApplication(null);
      setOpenMenuId(null);
      setOpenStatusId(null);
      setTimeout(() => setActionSuccess(""), 5000);
    } catch (error) {
      console.error(error);
      setActionError("Could not approve the application. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Reject application
  const rejectApplication = async (application, reason) => {
    try {
      setActionLoading(true);
      const ref = doc(db, "vehicleStickerApplications", application.id);
      await updateDoc(ref, {
        status: "Rejected",
        rejectionReason: reason,
        rejectedAt: serverTimestamp(),
      });
      setActionSuccess("Application rejected.");
      setPendingAction(null);
      setSelectedApplication(null);
      setOpenMenuId(null);
      setOpenStatusId(null);
      setRejectionReason("");
      setTimeout(() => setActionSuccess(""), 5000);
    } catch (error) {
      console.error(error);
      setActionError("Could not reject the application. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Verify payment
  const verifyPayment = async (application) => {
    try {
      setActionLoading(true);
      const ref = doc(db, "vehicleStickerApplications", application.id);
      await updateDoc(ref, {
        paymentStatus: "Verified",
        paymentVerifiedAt: serverTimestamp(),
      });
      setActionSuccess("Payment verified successfully.");
      setPendingAction(null);
      setSelectedApplication(null);
      setOpenMenuId(null);
      setOpenStatusId(null);
      setTimeout(() => setActionSuccess(""), 5000);
    } catch (error) {
      console.error(error);
      setActionError("Could not verify payment. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Release sticker
  const releaseSticker = async (application) => {
    try {
      setActionLoading(true);
      const ref = doc(db, "vehicleStickerApplications", application.id);
      await updateDoc(ref, {
        status: "Released",
        releasedAt: serverTimestamp(),
      });
      setActionSuccess("Sticker released successfully.");
      setPendingAction(null);
      setSelectedApplication(null);
      setOpenMenuId(null);
      setOpenStatusId(null);
      setTimeout(() => setActionSuccess(""), 5000);
    } catch (error) {
      console.error(error);
      setActionError("Could not release sticker. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Request action
  const requestAction = (application, action) => {
    setActionError("");
    setActionSuccess("");
    setOpenMenuId(null);
    setOpenStatusId(null);

    if (action.requiresReason) {
      setSelectedApplication(application);
      setPendingAction({
        applicationId: application.id,
        residentName: application.residentInfo?.fullName,
        plateNumber: application.vehicleInfo?.plateNumber,
        label: action.label,
        newStatus: action.newStatus,
        danger: action.danger || false,
        requiresReason: true,
        application: application,
      });
    } else if (action.paymentOnly) {
      verifyPayment(application);
    } else if (action.releaseOnly) {
      releaseSticker(application);
    } else {
      approveApplication(application);
    }
  };

  // Confirm pending action
  const confirmPendingAction = async () => {
    if (!pendingAction) return;

    if (pendingAction.requiresReason && !rejectionReason.trim()) {
      setActionError("Please provide a reason for rejection.");
      return;
    }

    await rejectApplication(pendingAction.application, rejectionReason);
  };

  if (loading) {
    return (
      <AdminPageLayout
        title="Vehicle Sticker Management"
        subtitle="Review, approve, and release vehicle sticker applications"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading applications...</p>
          </div>
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title="Vehicle Sticker Management"
      subtitle="Review, approve, and release vehicle sticker applications"
    >
      {actionError && (
        <div className="mb-4 rounded-xl border border-rejected bg-rejected-bg px-4 py-3 text-sm text-rejected-text">
          {actionError}
        </div>
      )}

      {actionSuccess && (
        <div className="mb-4 rounded-xl border border-approved bg-approved-bg px-4 py-3 text-sm text-approved-text">
          {actionSuccess}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <MetricCard
          icon={Car}
          label="Total Applications"
          value={totalApplications}
          description="All sticker requests"
          gradient="linear-gradient(135deg, #42A5F5, #1565C0)"
          textColor="#fff"
          subTextColor="rgba(255,255,255,.8)"
          onClick={() => {
            setActiveCard("all");
            setStatusFilter("all");
          }}
          isActive={activeCard === "all"}
        />

        <MetricCard
          icon={Clock}
          label="Pending"
          value={pendingApplications}
          description="Awaiting approval"
          gradient="linear-gradient(135deg, #FDD835, #F9A825)"
          textColor="#5D4037"
          subTextColor="rgba(93,64,55,.75)"
          onClick={() => {
            setActiveCard("pending");
            setStatusFilter("Pending");
          }}
          isActive={activeCard === "pending"}
        />

        <MetricCard
          icon={CheckCircle2}
          label="Approved"
          value={approvedApplications}
          description="Ready for payment"
          gradient="linear-gradient(135deg, #66BB6A, #2E7D32)"
          textColor="#fff"
          subTextColor="rgba(255,255,255,.8)"
          onClick={() => {
            setActiveCard("approved");
            setStatusFilter("Approved");
          }}
          isActive={activeCard === "approved"}
        />

        <MetricCard
          icon={Coins}
          label="Payment Pending"
          value={paymentPending}
          description="Waiting verification"
          gradient="linear-gradient(135deg, #FF8A65, #E64A19)"
          textColor="#fff"
          subTextColor="rgba(255,255,255,.8)"
          onClick={() => {
            setActiveCard("payment");
            setStatusFilter("all");
          }}
          isActive={activeCard === "payment"}
        />

        <MetricCard
          icon={BadgeCheck}
          label="Released"
          value={releasedApplications}
          description="Sticker issued"
          gradient="linear-gradient(135deg, #7E57C2, #4527A0)"
          textColor="#fff"
          subTextColor="rgba(255,255,255,.8)"
          onClick={() => {
            setActiveCard("released");
            setStatusFilter("Released");
          }}
          isActive={activeCard === "released"}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-3">
          <label className="text-sm text-muted-foreground">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-sm border border-input rounded-buttons px-3 py-2 bg-card"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Released">Released</option>
          </select>
        </div>

        <div className="hidden sm:block flex-1" />

        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search resident or plate number..."
            className="text-sm border border-input rounded-buttons pl-9 pr-3 py-2 w-full sm:w-72 bg-card"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-cards border border-border shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted text-muted-foreground">
              <th className="text-left px-4 py-3">Resident</th>
              <th className="text-left px-4 py-3">Plate Number</th>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-left px-4 py-3">Fee</th>
              <th className="text-left px-4 py-3">Payment</th>
              <th className="text-left px-4 py-3">OR/CR</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="w-[70px]" />
            </tr>
          </thead>
          <tbody>
            {paginatedApplications.map((app) => (
              <tr key={app.id} className="border-t border-border hover:bg-muted/60">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium">{app.residentInfo?.fullName || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">
                      {app.residentInfo?.residentCategory || "No category"}
                    </p>
                  </div>
                </td>

                <td className="px-4 py-3 font-medium">{app.vehicleInfo?.plateNumber || "N/A"}</td>
                <td className="px-4 py-3">{app.applicationType || "N/A"}</td>
                <td className="px-4 py-3">₱{app.stickerFee || 0}</td>

                <td className="px-4 py-3">{getPaymentBadge(app.paymentStatus)}</td>

                {/* OR/CR Column */}
                <td className="px-4 py-3">
                  {app.orcrInfo && app.orcrInfo.secureUrl ? (
                    <a
                      href={app.orcrInfo.secureUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs hover:bg-blue-100 transition-colors"
                    >
                      {isImageFile(app.orcrInfo.fileName) ? (
                        <Image size={14} />
                      ) : (
                        <File size={14} />
                      )}
                      View
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">No file</span>
                  )}
                </td>

                {/* Status column with dropdown */}
                <td className="px-4 py-3 relative">
                  <div className="relative inline-block text-left">
                    <button
                      type="button"
                      onClick={() => {
                        if (app.status === "Pending") {
                          setOpenStatusId(openStatusId === app.id ? null : app.id);
                          setOpenMenuId(null);
                        }
                      }}
                      title={app.status === "Pending" ? "Click to change status" : "Status cannot be changed"}
                      className={`inline-flex items-center gap-1 ${app.status !== "Pending" ? "cursor-default" : "cursor-pointer"}`}
                    >
                      {getStatusBadge(app.status)}
                      {app.status === "Pending" && (
                        <ChevronDown size={12} className="text-muted-foreground" />
                      )}
                    </button>

                    {openStatusId === app.id && app.status === "Pending" && (
                      <div className="absolute left-0 top-8 z-50 w-48 rounded-xl border border-border bg-card shadow-xl py-1 text-left">
                        <div className="px-3 py-2 text-[11px] font-medium text-muted-foreground">
                          Change status
                        </div>
                        {getStatusActions(app).map((action) => (
                          <button
                            key={action.label}
                            type="button"
                            disabled={actionLoading}
                            onClick={() => requestAction(app, action)}
                            className={`w-full px-3 py-2 text-xs text-left disabled:opacity-50 ${
                              action.danger
                                ? "text-red-600 hover:bg-red-50"
                                : "text-green-600 hover:bg-green-50"
                            }`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>

                {/* Actions column - 3 dots */}
                <td className="px-4 py-3 text-right">
                  <div className="relative inline-block text-left">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenuId(openMenuId === app.id ? null : app.id);
                        setOpenStatusId(null);
                      }}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-buttons hover:bg-muted"
                      aria-label="More actions"
                    >
                      <MoreVertical size={16} className="text-muted-foreground" />
                    </button>

                    {openMenuId === app.id && (
                      <div className="absolute right-0 top-9 z-50 w-40 rounded-xl border border-border bg-card shadow-xl py-1 text-left">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedApplication(app);
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

            {paginatedApplications.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  No vehicle sticker applications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 text-sm text-muted-foreground">
        <span>
          Showing{" "}
          {filteredApplications.length === 0 ? 0 : startIndex + 1} -{" "}
          {Math.min(startIndex + itemsPerPage, filteredApplications.length)} of{" "}
          {filteredApplications.length}
        </span>

        <div className="flex items-center gap-2">
          <button
            disabled={safeCurrentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            className="w-8 h-8 rounded-buttons border border-border flex items-center justify-center disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>

          <span>
            Page {safeCurrentPage} of {totalPages}
          </span>

          <button
            disabled={safeCurrentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            className="w-8 h-8 rounded-buttons border border-border flex items-center justify-center disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Application Details Modal */}
      {showDetailModal && selectedApplication && (() => {
        const residentData = selectedApplication.residentUid ? residentDetails[selectedApplication.residentUid] : null;
        
        return (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border shadow-2xl">
              {/* Modal Header */}
              <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Vehicle Sticker Application
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Complete application details
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedApplication(null);
                  }}
                  className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Status */}
                <div className="flex items-center justify-between bg-muted/50 rounded-xl p-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Current Status</p>
                    <p className="font-medium mt-1">{selectedApplication.status}</p>
                  </div>
                  {getStatusBadge(selectedApplication.status)}
                </div>

                {/*Resident Information*/}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <User size={16} />
                  Resident Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl">
                  <DetailItem 
                    label="Full Name" 
                    value={residentData ? `${residentData.firstName || ''} ${residentData.lastName || ''}`.trim() || selectedApplication.residentInfo?.fullName : selectedApplication.residentInfo?.fullName} 
                  />
                  <DetailItem 
                    label="Contact Number" 
                    value={residentData?.contactNumber || "Not provided"} 
                  />
                  <DetailItem 
                    label="Resident Category" 
                    value={residentData?.residentCategory || selectedApplication.residentInfo?.residentCategory} 
                  />
                  <DetailItem 
                    label="Address" 
                    value={
                      residentData 
                        ? `${residentData.street || ''}, ${residentData.block || ''}, ${residentData.lot || ''}, ${residentData.phase || ''}`.replace(/, ,/g, ',').replace(/^, /, '').trim() || "Not provided"
                        : "Not provided"
                    } 
                  />
                </div>
              </div>

                {/* Vehicle Information */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Car size={16} />
                    Vehicle Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-xl">
                    <DetailItem label="Vehicle Type" value={selectedApplication.vehicleInfo?.vehicleType} />
                    <DetailItem label="Plate Number" value={selectedApplication.vehicleInfo?.plateNumber} />
                    <DetailItem label="Application Type" value={selectedApplication.applicationType} />
                    <DetailItem label="Sticker Year" value={selectedApplication.stickerYear} />
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Coins size={16} />
                    Payment Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-green-50/50 p-4 rounded-xl">
                    <DetailItem
                      label="Sticker Fee"
                      value={`₱${(selectedApplication.stickerFee || 0).toLocaleString()}`}
                    />
                    <DetailItem label="Payment Status" value={selectedApplication.paymentStatus} />
                  </div>
                </div>

                {/* OR/CR Document */}
                {selectedApplication.orcrInfo && selectedApplication.orcrInfo.secureUrl && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <FileText size={16} />
                      OR/CR Document
                    </h3>
                    <div className="bg-muted/30 p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {isImageFile(selectedApplication.orcrInfo.fileName) ? (
                            <Image size={24} className="text-blue-600" />
                          ) : (
                            <File size={24} className="text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {selectedApplication.orcrInfo.fileName || "OR/CR Document"}
                          </p>
                          {selectedApplication.orcrInfo.fileSize && (
                            <p className="text-xs text-muted-foreground">
                              {(selectedApplication.orcrInfo.fileSize / 1024).toFixed(1)} KB
                            </p>
                          )}
                        </div>
                        <a
                          href={selectedApplication.orcrInfo.secureUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-all inline-flex items-center gap-1 flex-shrink-0"
                        >
                          <Eye size={14} />
                          View Document
                        </a>
                      </div>
                      {/* Image preview */}
                      {isImageFile(selectedApplication.orcrInfo.fileName) && (
                        <div className="mt-3">
                          <img 
                            src={selectedApplication.orcrInfo.secureUrl} 
                            alt="OR/CR Document Preview"
                            className="max-h-48 rounded-lg object-contain border border-border"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Clock size={16} />
                    Timeline
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl">
                    <DetailItem label="Submitted" value={formatDateTime(selectedApplication.createdAt)} />
                    <DetailItem label="Approved" value={formatDateTime(selectedApplication.approvedAt)} />
                    <DetailItem label="Rejected" value={formatDateTime(selectedApplication.rejectedAt)} />
                    <DetailItem label="Released" value={formatDateTime(selectedApplication.releasedAt)} />
                  </div>
                </div>

                {/* Rejection Reason */}
                {selectedApplication.rejectionReason && (
                  <div className="bg-rejected-bg border border-rejected rounded-xl p-4">
                    <p className="text-xs text-rejected-text font-medium">Rejection Reason</p>
                    <p className="text-sm text-rejected-text mt-1">{selectedApplication.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Action Confirmation Modal */}
      {pendingAction && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground">
              {pendingAction.label} Application
            </h2>

            <p className="text-sm text-muted-foreground mt-2 leading-6">
              Are you sure you want to{" "}
              <span className={`font-medium ${pendingAction.danger ? "text-rejected-text" : "text-approved-text"}`}>
                {pendingAction.label.toLowerCase()}
              </span>{" "}
              the vehicle sticker application for{" "}
              <span className="font-medium text-foreground">
                {pendingAction.residentName}
              </span>{" "}
              with plate number{" "}
              <span className="font-medium text-foreground">
                {pendingAction.plateNumber}
              </span>
              ?
            </p>

            {pendingAction.requiresReason && (
              <div className="mt-4">
                <label className="text-sm font-medium text-foreground">
                  Rejection Reason <span className="text-rejected-text">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  className="w-full mt-2 px-4 py-3 border-2 border-input rounded-xl focus:ring-2 focus:ring-rejected/20 focus:border-rejected outline-none transition-all text-sm min-h-[90px] resize-none bg-card"
                />
              </div>
            )}

            {actionError && (
              <div className="mt-3 rounded-xl border border-rejected bg-rejected-bg px-4 py-3 text-sm text-rejected-text">
                {actionError}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setPendingAction(null);
                  setRejectionReason("");
                  setActionError("");
                }}
                className="px-4 py-2 text-sm rounded-buttons border border-border hover:bg-muted"
              >
                Cancel
              </button>

              <button
                disabled={actionLoading}
                onClick={confirmPendingAction}
                className={`px-4 py-2 text-sm font-medium text-white rounded-buttons disabled:opacity-50 ${
                  pendingAction.danger
                    ? "bg-rejected hover:bg-rejected/80"
                    : "bg-approved hover:bg-approved/80"
                }`}
              >
                {actionLoading ? "Processing..." : `Confirm ${pendingAction.label}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPageLayout>
  );
}

export default VehicleStickers;