import { useState, useEffect, useRef } from "react";
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
  Wallet,
  Landmark,
  AlertTriangle,
  Printer,
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
  Pending: "status-pending",
  Approved: "status-confirmed",
  Rejected: "status-rejected",
  Released: "status-confirmed",
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
  "Unlocked": "bg-pending-bg text-pending-text",
  "Pending Verification": "bg-pending-bg text-pending-text",
  "Paid - Pending Verification": "bg-pending-bg text-pending-text",
  "Verified": "bg-approved-bg text-approved-text",
  "Cash Payment": "bg-approved-bg text-approved-text",
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

// Helper function to escape HTML for reports
function escapeReportHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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
  const [previewImage, setPreviewImage] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState("released");

  // State for actions
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [fixLoading, setFixLoading] = useState(false);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Refs for dropdown portals
  const statusButtonRefs = useRef({});
  const menuButtonRefs = useRef({});

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

  // TEMPORARY: Fix existing applications with "Pending Payment" status
  const fixExistingApplications = async () => {
    try {
      setFixLoading(true);
      
      const appsToFix = applications.filter(
        app => app.status === "Approved" && app.paymentStatus === "Pending Payment"
      );
      
      if (appsToFix.length === 0) {
        setActionSuccess("No applications need fixing.");
        setTimeout(() => setActionSuccess(""), 5000);
        setFixLoading(false);
        return;
      }
      
      console.log(`🔧 Fixing ${appsToFix.length} applications...`);
      
      for (const app of appsToFix) {
        const ref = doc(db, "vehicleStickerApplications", app.id);
        await updateDoc(ref, {
          paymentStatus: "Unlocked"
        });
        console.log(`✅ Fixed application: ${app.id} - ${app.residentInfo?.fullName}`);
      }
      
      setActionSuccess(`✅ Fixed ${appsToFix.length} applications. Residents can now proceed with payment.`);
      setTimeout(() => setActionSuccess(""), 10000);
      
    } catch (error) {
      console.error("❌ Error fixing applications:", error);
      setActionError("Failed to fix applications. Please try again.");
    } finally {
      setFixLoading(false);
    }
  };

  // Print HTML without popup
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
      setActionError("The printable report could not be prepared. Please try again.");
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

  // Build report table
  const buildReportTable = (data, title) => {
    if (!data.length) {
      return `
        <div class="empty-state">
          No records found for this report.
        </div>
      `;
    }

    return `
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Resident</th>
            <th>Plate Number</th>
            <th>Vehicle Type</th>
            <th>Application Type</th>
            <th>Sticker Fee</th>
            <th>Payment Status</th>
            <th>Payment Method</th>
            <th>Status</th>
            <th>Submitted</th>
            ${title === "Released Stickers" ? '<th>Released Date</th>' : ''}
          </tr>
        </thead>
        <tbody>
          ${data
            .map(
              (app, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${escapeReportHtml(app.residentInfo?.fullName || 'Unknown')}</td>
                  <td>${escapeReportHtml(app.vehicleInfo?.plateNumber || 'N/A')}</td>
                  <td>${escapeReportHtml(app.vehicleInfo?.vehicleType || 'N/A')}</td>
                  <td>${escapeReportHtml(app.applicationType || 'N/A')}</td>
                  <td>₱${app.stickerFee || 0}</td>
                  <td>${escapeReportHtml(app.paymentStatus || 'N/A')}</td>
                  <td>${escapeReportHtml(app.paymentMethod || 'N/A')}</td>
                  <td>${escapeReportHtml(app.status || 'N/A')}</td>
                  <td>${formatDate(app.createdAt)}</td>
                  ${title === "Released Stickers" ? `<td>${formatDate(app.releasedAt) || '—'}</td>` : ''}
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    `;
  };

  // Handle generate report
  const handleGenerateReport = () => {
    setActionError("");

    const reportDate = new Date().toLocaleString("en-PH", {
      dateStyle: "long",
      timeStyle: "short",
    });

    let reportTitle = "";
    let reportData = [];
    let reportDescription = "";

    switch (selectedReportType) {
      case "released":
        reportTitle = "Released Stickers Report";
        reportData = applications.filter(app => app.status === "Released");
        reportDescription = "Complete list of all released vehicle stickers.";
        break;
      case "all":
        reportTitle = "All Applications Report";
        reportData = applications;
        reportDescription = "Complete list of all vehicle sticker applications.";
        break;
      case "pending":
        reportTitle = "Pending Applications Report";
        reportData = applications.filter(app => app.status === "Pending");
        reportDescription = "List of all pending vehicle sticker applications awaiting approval.";
        break;
      case "approved":
        reportTitle = "Approved Applications Report";
        reportData = applications.filter(app => app.status === "Approved");
        reportDescription = "List of all approved vehicle sticker applications.";
        break;
      case "rejected":
        reportTitle = "Rejected Applications Report";
        reportData = applications.filter(app => app.status === "Rejected");
        reportDescription = "List of all rejected vehicle sticker applications.";
        break;
      default:
        reportTitle = "Vehicle Sticker Report";
        reportData = applications;
        reportDescription = "Complete list of all vehicle sticker applications.";
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
                <div><strong>Generated:</strong> ${escapeReportHtml(reportDate)}</div>
                <div><strong>Total records:</strong> ${reportData.length}</div>
              </div>
            </header>

            ${buildReportTable(reportData, reportTitle)}

            <div class="footer">
              Generated through the Subdiverse Vehicle Sticker Management System.
            </div>
          </main>
        </body>
      </html>
    `;

    printHtmlWithoutPopup(reportHtml);
    setShowReportModal(false);
  };

  // Calculate metrics
  const totalApplications = applications.length;
  const pendingApplications = applications.filter((app) => app.status === "Pending").length;
  const approvedApplications = applications.filter((app) => app.status === "Approved").length;
  const releasedApplications = applications.filter((app) => app.status === "Released").length;
  const paymentPending = applications.filter((app) => 
    app.paymentStatus === "Pending Payment" || 
    app.paymentStatus === "Pending Verification" || 
    app.paymentStatus === "Paid - Pending Verification"
  ).length;

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
    if (activeCard === "payment") matchesCard = 
      app.paymentStatus === "Pending Payment" || 
      app.paymentStatus === "Pending Verification" || 
      app.paymentStatus === "Paid - Pending Verification";

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

  // Get payment method display
  const getPaymentMethodDisplay = (app) => {
    if (!app.paymentMethod) {
      if (app.paymentStatus === "Paid - Pending Verification" || 
          app.paymentStatus === "Pending Verification") {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded-lg text-xs">
            <Clock size={12} />
            Awaiting method
          </span>
        );
      }
      return <span className="text-xs text-muted-foreground">—</span>;
    }
    
    const method = app.paymentMethod.toLowerCase();
    
    if (method === "gcash") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
          <CreditCard size={12} />
          GCash
        </span>
      );
    }
    if (method === "cash") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs">
          <Landmark size={12} />
          Cash
        </span>
      );
    }
    
    return <span className="text-xs text-muted-foreground">{app.paymentMethod}</span>;
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

    if (application.status === "Approved" && 
        (application.paymentStatus === "Pending Verification" || 
         application.paymentStatus === "Paid - Pending Verification")) {
      actions.push({ 
        label: "Verify Payment", 
        paymentOnly: true,
      });
    }

    if (application.status === "Approved" && 
        (application.paymentStatus === "Verified" || 
         application.paymentStatus === "Cash Payment")) {
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
        paymentStatus: "Unlocked",
        approvedAt: serverTimestamp(),
      });
      setActionSuccess("Application approved successfully. Resident can now proceed with payment.");
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
      setSelectedApplication(application);
      setShowDetailModal(true);
      setOpenMenuId(null);
      setPendingAction({
        type: "verifyPayment",
        application: application,
      });
    } else if (action.releaseOnly) {
      setSelectedApplication(application);
      setPendingAction({
        type: "release",
        application: application,
        label: "Release Sticker",
      });
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

    if (pendingAction.type === "verifyPayment") {
      await verifyPayment(pendingAction.application);
      setShowDetailModal(false);
      setSelectedApplication(null);
      setPendingAction(null);
      return;
    }

    if (pendingAction.type === "release") {
      await releaseSticker(pendingAction.application);
      setSelectedApplication(null);
      setPendingAction(null);
      return;
    }

    await rejectApplication(pendingAction.application, rejectionReason);
  };

  const WarningIcon = AlertTriangle;

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
      action={
        <button
          type="button"
          onClick={() => setShowReportModal(true)}
          className="px-4 py-2 text-sm font-medium rounded-buttons border border-border bg-card hover:bg-muted flex items-center justify-center gap-2"
        >
          <FileText size={16} />
          Generate report
        </button>
      }
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

      {/* Temporary Fix Button */}
      {applications.some(app => app.status === "Approved" && app.paymentStatus === "Pending Payment") && (
        <div className="mb-4 rounded-xl border border-yellow-400 bg-yellow-50 px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <WarningIcon size={18} className="text-yellow-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Some approved applications have "Pending Payment" status instead of "Unlocked".
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Click the button below to fix them so residents can proceed with payment.
                </p>
              </div>
            </div>
            <button
              onClick={fixExistingApplications}
              disabled={fixLoading}
              className="px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600 transition disabled:opacity-50 flex items-center gap-2"
            >
              {fixLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Fixing...
                </>
              ) : (
                'Fix Applications'
              )}
            </button>
          </div>
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
              <th className="text-left px-4 py-3">Method</th>
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

                {/* Payment Method Column */}
                <td className="px-4 py-3">{getPaymentMethodDisplay(app)}</td>

                {/* OR/CR Column */}
                <td className="px-4 py-3">
                  {app.orcrInfo && app.orcrInfo.secureUrl ? (
                    <button
                      onClick={() => setPreviewImage(app.orcrInfo.secureUrl)}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs hover:bg-blue-100 transition-colors"
                    >
                      <Image size={14} />
                      View
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground">No file</span>
                  )}
                </td>

                {/* Status column with dropdown */}
                <td className="px-4 py-3 relative">
                  <div className="relative inline-block text-left">
                    <button
                      ref={(el) => (statusButtonRefs.current[app.id] = el)}
                      type="button"
                      onClick={() => {
                        const actions = getStatusActions(app);
                        if (actions.length > 0) {
                          setOpenStatusId(openStatusId === app.id ? null : app.id);
                          setOpenMenuId(null);
                        }
                      }}
                      title={getStatusActions(app).length > 0 ? "Click to change status" : "No actions available"}
                      className={`inline-flex items-center gap-1 ${getStatusActions(app).length === 0 ? "cursor-default" : "cursor-pointer"}`}
                    >
                      {getStatusBadge(app.status)}
                      {getStatusActions(app).length > 0 && (
                        <ChevronDown size={12} className="text-muted-foreground" />
                      )}
                    </button>

                    {openStatusId === app.id && getStatusActions(app).length > 0 && (
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

                {/* Actions column - 3 dots with ONLY View Details */}
                <td className="px-4 py-3 text-right">
                  <div className="relative inline-block text-left">
                    <button
                      ref={(el) => (menuButtonRefs.current[app.id] = el)}
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
                <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
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
                    if (pendingAction?.type !== "verifyPayment" && pendingAction?.type !== "release") {
                      setPendingAction(null);
                    }
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

                {/* Resident Information */}
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
                    {selectedApplication.paymentMethod && (
                      <DetailItem label="Payment Method" value={selectedApplication.paymentMethod} />
                    )}
                  </div>
                </div>

                {/* Payment Receipt */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <FileText size={16} />
                    Payment Receipt
                  </h3>
                  
                  {selectedApplication.paymentMethod === "Cash" ? (
                    <div className="bg-muted/30 p-4 rounded-xl border-2 border-dashed border-green-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Landmark size={24} className="text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Cash Payment</p>
                          <p className="text-xs text-muted-foreground">Payment made in cash</p>
                        </div>
                      </div>
                    </div>
                  ) : selectedApplication.receiptInfo && selectedApplication.receiptInfo.secureUrl ? (
                    <div className="bg-muted/30 p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {isImageFile(selectedApplication.receiptInfo.fileName) ? (
                            <Image size={24} className="text-green-600" />
                          ) : (
                            <File size={24} className="text-green-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {selectedApplication.receiptInfo.fileName || "Payment Receipt"}
                          </p>
                          {selectedApplication.receiptInfo.fileSize && (
                            <p className="text-xs text-muted-foreground">
                              {(selectedApplication.receiptInfo.fileSize / 1024).toFixed(1)} KB
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => setPreviewImage(selectedApplication.receiptInfo.secureUrl)}
                          className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-all inline-flex items-center gap-1 flex-shrink-0"
                        >
                          <Eye size={14} />
                          View Receipt
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted/30 p-4 rounded-xl border-2 border-dashed border-gray-300">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText size={24} className="text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-muted-foreground">No receipt uploaded yet</p>
                          <p className="text-xs text-muted-foreground">Waiting for resident to upload payment receipt</p>
                        </div>
                      </div>
                    </div>
                  )}
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
                        <button
                          onClick={() => setPreviewImage(selectedApplication.orcrInfo.secureUrl)}
                          className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-all inline-flex items-center gap-1 flex-shrink-0"
                        >
                          <Eye size={14} />
                          View Document
                        </button>
                      </div>
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
                    <DetailItem label="Payment Verified" value={formatDateTime(selectedApplication.paymentVerifiedAt)} />
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

                {/* Quick Action Buttons in Modal */}
                {selectedApplication.status === "Approved" && 
                 (selectedApplication.paymentStatus === "Pending Verification" || 
                  selectedApplication.paymentStatus === "Paid - Pending Verification") && (
                  <div className="flex justify-end gap-2 pt-4 border-t border-border">
                    <button
                      onClick={() => {
                        verifyPayment(selectedApplication);
                        setShowDetailModal(false);
                        setSelectedApplication(null);
                      }}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-approved text-white text-sm rounded-buttons hover:bg-approved/80 disabled:opacity-50"
                    >
                      {actionLoading ? "Processing..." : "Verify Payment"}
                    </button>
                  </div>
                )}

                {selectedApplication.status === "Approved" && 
                 (selectedApplication.paymentStatus === "Verified" || 
                  selectedApplication.paymentStatus === "Cash Payment") && (
                  <div className="flex justify-end gap-2 pt-4 border-t border-border">
                    <button
                      onClick={() => {
                        releaseSticker(selectedApplication);
                        setShowDetailModal(false);
                        setSelectedApplication(null);
                      }}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-approved text-white text-sm rounded-buttons hover:bg-approved/80 disabled:opacity-50"
                    >
                      {actionLoading ? "Processing..." : "Release Sticker"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setPreviewImage(null)}
        >
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            className="absolute top-5 right-5 text-white text-3xl hover:text-gray-300 transition"
          >
            ×
          </button>

          <img
            src={previewImage}
            alt="Document preview"
            onClick={(e) => e.stopPropagation()}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}

      {/* Report Modal */}
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
                  Generate Vehicle Sticker Report
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
                  value: "released",
                  title: "Released Stickers",
                  description: "Complete list of all released vehicle stickers.",
                },
                {
                  value: "all",
                  title: "All Applications",
                  description: "Complete list of all vehicle sticker applications.",
                },
                {
                  value: "pending",
                  title: "Pending Applications",
                  description: "List of all pending vehicle sticker applications awaiting approval.",
                },
                {
                  value: "approved",
                  title: "Approved Applications",
                  description: "List of all approved vehicle sticker applications.",
                },
                {
                  value: "rejected",
                  title: "Rejected Applications",
                  description: "List of all rejected vehicle sticker applications.",
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
                      name="vehicleStickerReportType"
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

      {/* Action Confirmation Modal */}
      {pendingAction && (pendingAction.requiresReason || pendingAction.type === "release") && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground">
              {pendingAction.type === "release" ? "Release Sticker" : pendingAction.label} {pendingAction.type === "release" ? "" : "Application"}
            </h2>

            <p className="text-sm text-muted-foreground mt-2 leading-6">
              {pendingAction.type === "release" ? (
                <>Are you sure you want to release the sticker for{" "}
                <span className="font-medium text-foreground">
                  {pendingAction.application.residentInfo?.fullName}
                </span>{" "}
                with plate number{" "}
                <span className="font-medium text-foreground">
                  {pendingAction.application.vehicleInfo?.plateNumber}
                </span>?</>
              ) : (
                <>Are you sure you want to{" "}
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
                </span>?</>
              )}
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
                  pendingAction.danger || pendingAction.type === "reject"
                    ? "bg-rejected hover:bg-rejected/80"
                    : "bg-approved hover:bg-approved/80"
                }`}
              >
                {actionLoading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPageLayout>
  );
}

export default VehicleStickers;