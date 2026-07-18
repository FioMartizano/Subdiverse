import { useState, useEffect } from "react";
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
} from "lucide-react";

import { db } from "../../firebase";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
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

function AdminUsers() {
  const [residentsList, setResidentsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [previewImage, setPreviewImage] = useState(null);

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



  // synch w/ firestore
  useEffect(() => {
    // A. Query users collection for residents only
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

      // B. Join users and residents (profile verification) by Document ID
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


    // Listen to users collection
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      rawUsersList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      mergeAndSync();
    }, (error) => {
      console.error("Firestore users error:", error);
    });

    // Listen to residents collection
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

  // filters
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
        <button className="btn-primary !px-4 !py-2 !text-sm !font-medium w-full sm:w-auto">
          Add resident
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

      {/* Metric cards */}
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

      {/* Filters */}
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

      {/* Table */}
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
              <tr key={r.id} className="border-t border-border hover:bg-muted/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-medium flex-shrink-0">
                      {initials(r.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{r.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{r.email}</p>
                      {/* Location repeats here for phones/tablets where the dedicated column is hidden */}
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
                  <div className="relative inline-block text-left">
                    <button
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
                      <div className="absolute left-0 top-8 z-50 w-48 rounded-xl border border-border bg-card shadow-xl py-1 text-left">
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
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 relative">
                  <div className="relative inline-block text-left">
                    <button
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
                      <div className="absolute left-0 top-8 z-50 w-48 rounded-xl border border-border bg-card shadow-xl py-1 text-left">
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
                        setOpenVerificationId(null);
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
                            setSelectedResident(r);
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

      {selectedResident && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-2xl bg-card border border-border shadow-2xl">
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

export default AdminUsers;