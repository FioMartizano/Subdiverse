// AdminCommunityGroups.jsx
import { useState } from "react";
import {
  Users,
  Flag,
  Eye,
  Search,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  XCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Shield,
} from "lucide-react";

import AdminPageLayout from "../../components/admin/AdminPageLayout";
import MetricCard from "../../components/admin/MetricCard";
import useCommunityReports from "../../hooks/useCommunityReports";
import {
  getReportedGroups,
  dismissGroupReport,
  suspendGroup
} from '../../services/groupService';

// Define status icons
const REPORT_STATUS_ICONS = {
  pending: Clock,
  confirmed: CheckCircle2,
  dismissed: XCircle,
};

// Universal report status badge function
function getReportStatusBadge(status) {
  // Normalize the status string
  const normalizedStatus = status?.toLowerCase() || "pending";
  
  // Get the corresponding icon
  const IconComponent = REPORT_STATUS_ICONS[normalizedStatus] || Clock;
  
  // Define status styles using universal color classes
  const STATUS_STYLES = {
    pending: "status-pending",
    confirmed: "status-confirmed",
    dismissed: "status-rejected",
  };
  
  const style = STATUS_STYLES[normalizedStatus] || "bg-gray-400 text-white";
  
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-buttons text-xs capitalize ${style}`}>
      <IconComponent size={12} />
      {status}
    </span>
  );
}

// Universal group status badge function
function getGroupStatusBadge(status) {
  const normalizedStatus = status?.toLowerCase() || "active";
  
  const STATUS_STYLES = {
    active: "bg-green-600 text-white",
    suspended: "bg-red-600 text-white",
    inactive: "bg-gray-400 text-white",
  };
  
  const style = STATUS_STYLES[normalizedStatus] || "bg-gray-400 text-white";
  
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-buttons text-xs capitalize ${style}`}>
      {status || "Active"}
    </span>
  );
}

function formatDate(date) {
  if (!date) return "—";

  let d;

  if (date?.toDate) {
    d = date.toDate();
  } else if (date instanceof Date) {
    d = date;
  } else {
    d = new Date(date);
  }

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(date) {
  if (!date) return "—";

  let d;

  if (date?.toDate) {
    d = date.toDate();
  } else if (date instanceof Date) {
    d = date;
  } else {
    d = new Date(date);
  }

  return d.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AdminCommunityGroups() {
  const {
    groups,
    loading,
    error,
    refresh,
  } = useCommunityReports();

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [search, setSearch] = useState("");
  const [activeCard, setActiveCard] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const itemsPerPage = 10;

  // Calculate statistics
  const totalGroups = groups.length;
  const activeGroups = groups.filter((g) => g.status === "active").length;
  const totalMembers = groups.reduce((sum, g) => sum + (g.memberCount || 0), 0);
  const groupsWithReports = groups.filter((g) => g.reports && g.reports.length > 0).length;

  // Filter groups
  const filtered = groups.filter((group) => {
    const matchesSearch =
      search.trim() === "" ||
      group.name?.toLowerCase().includes(search.toLowerCase()) ||
      group.createdByName?.toLowerCase().includes(search.toLowerCase()) ||
      group.description?.toLowerCase().includes(search.toLowerCase());

    let matchesCard = true;
    if (activeCard === "active") {
      matchesCard = group.status === "active";
    } else if (activeCard === "reported") {
      matchesCard = group.reports && group.reports.length > 0;
    }

    return matchesSearch && matchesCard;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedGroups = filtered.slice(startIndex, startIndex + itemsPerPage);

  // Card selection
  const selectCard = (card) => {
    setActiveCard(card);
    setCurrentPage(1);
  };

  // Handle dismiss report
  const dismissReport = async (groupId, reportId) => {
    setActionLoading(true);
    setActionError("");
    setActionSuccess("");

    try {
      const result = await dismissGroupReport(groupId, reportId);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Update the selected report locally
      setSelectedReport((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          status: "confirmed",
        };
      });

      // Update the selected group locally
      setSelectedGroup((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          reports: prev.reports.map((report) =>
            report.id === reportId
              ? {
                  ...report,
                  status: "confirmed",
                }
              : report
          ),
        };
      });

      setActionSuccess("Report confirmed successfully.");
      setTimeout(() => setActionSuccess(""), 3000);

    } catch (err) {
      console.error("Error confirming report:", err);
      setActionError(err.message || "Could not confirm the report.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle suspend/remove group
  const handleSuspendGroup = async (groupId) => {
    setActionLoading(true);
    setActionError("");
    setActionSuccess("");

    try {
      const result = await suspendGroup(groupId);

      if (!result.success) {
        throw new Error(result.error || "Failed to suspend group");
      }

      setActionSuccess("Group suspended successfully.");
      setTimeout(() => setActionSuccess(""), 3000);

      setShowDetailModal(false);
      setSelectedGroup(null);

      if (refresh) refresh();

    } catch (err) {
      console.error("Error suspending group:", err);
      setActionError("Could not suspend the group. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminPageLayout
        title="Community Groups"
        subtitle="View and manage the communities created by residents."
      >
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium text-foreground">Loading community groups...</p>
            <p className="text-sm text-muted-foreground mt-1">Please wait while we fetch the data.</p>
          </div>
        </div>
      </AdminPageLayout>
    );
  }

  if (error) {
    return (
      <AdminPageLayout
        title="Community Groups"
        subtitle="View and manage the communities created by residents."
      >
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle size={40} className="mx-auto text-red-600 mb-3" />
          <p className="text-red-600 font-medium">Error loading groups</p>
          <p className="text-sm text-red-500 mt-1">{error}</p>
          {refresh && (
            <button
              onClick={refresh}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-buttons hover:bg-red-700 transition-all"
            >
              <RefreshCw size={16} />
              Retry
            </button>
          )}
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title="Community Groups"
      subtitle="View and manage the communities created by residents."
      action={
        refresh && (
          <button
            onClick={refresh}
            className="btn-primary !px-4 !py-2 !text-sm !font-medium w-full sm:w-auto inline-flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        )
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
          icon={Users}
          gradient="linear-gradient(135deg, #42A5F5, #1565C0)"
          textColor="#ffffff"
          subTextColor="rgba(255,255,255,0.85)"
          label="Total Communities"
          value={totalGroups.toLocaleString()}
          description="All registered community groups."
          onClick={() => selectCard("all")}
          isActive={activeCard === "all"}
        />
        <MetricCard
          icon={CheckCircle2}
          gradient="linear-gradient(135deg, #66BB6A, #2E7D32)"
          textColor="#ffffff"
          subTextColor="rgba(255,255,255,0.85)"
          label="Active Communities"
          value={activeGroups.toLocaleString()}
          description="Currently active community groups."
          onClick={() => selectCard("active")}
          isActive={activeCard === "active"}
        />
        <MetricCard
          icon={Users}
          gradient="linear-gradient(135deg, #FDD835, #F9A825)"
          textColor="#5D4037"
          subTextColor="rgba(93,64,55,0.75)"
          label="Total Members"
          value={totalMembers.toLocaleString()}
          description="Residents across all communities."
          onClick={() => selectCard("all")}
          isActive={activeCard === "all"}
        />
        <MetricCard
          icon={Flag}
          gradient="linear-gradient(135deg, #FF8A65, #E64A19)"
          textColor="#ffffff"
          subTextColor="rgba(255,255,255,0.85)"
          label="Reported Groups"
          value={groupsWithReports.toLocaleString()}
          description="Groups with reported content."
          onClick={() => selectCard("reported")}
          isActive={activeCard === "reported"}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 mb-4">
        <div className="hidden sm:block flex-1" />

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search by name, creator, or description..."
            className="text-sm border border-input rounded-buttons pl-9 pr-3 py-2 w-full sm:w-64 bg-card focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-cards border border-border shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted text-muted-foreground">
              <th className="text-left font-medium px-4 py-3 min-w-[200px]">Community</th>
              <th className="hidden lg:table-cell text-left font-medium px-4 py-3 min-w-[150px]">Created By</th>
              <th className="hidden md:table-cell text-left font-medium px-4 py-3 min-w-[100px]">Members</th>
              <th className="text-left font-medium px-4 py-3 min-w-[120px]">Status</th>
              <th className="min-w-[56px]" />
            </tr>
          </thead>
          <tbody>
            {paginatedGroups.map((group) => (
              <tr key={group.id} className="border-t border-border hover:bg-muted/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-medium flex-shrink-0">
                      {group.name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "??"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{group.name || "Unnamed Group"}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {group.description || "No description"}
                        {group.reports && group.reports.length > 0 && (
                          <span className="ml-2 inline-flex items-center gap-1 text-orange-600">
                            <Flag size={10} />
                            {group.reports.length} report{group.reports.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="hidden lg:table-cell px-4 py-3">
                  <div className="text-xs">
                    <p className="text-foreground">{group.createdByName || "Unknown"}</p>
                    <p className="text-muted-foreground">{formatDate(group.createdAt)}</p>
                  </div>
                </td>
                <td className="hidden md:table-cell px-4 py-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">
                    {group.memberCount || 0} members
                  </span>
                </td>
                <td className="px-4 py-3">
                  {getGroupStatusBadge(group.status || "active")}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="relative inline-block text-left">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenuId(openMenuId === group.id ? null : group.id);
                      }}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-buttons hover:bg-muted"
                      aria-label="More actions"
                    >
                      <MoreVertical size={16} className="text-muted-foreground" />
                    </button>

                    {openMenuId === group.id && (
                      <div className="absolute right-0 top-9 z-50 w-48 rounded-xl border border-border bg-card shadow-xl py-1 text-left">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedGroup(group);
                            setShowDetailModal(true);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-3 py-2 text-xs text-left hover:bg-muted flex items-center gap-2"
                        >
                          <Eye size={14} />
                          View Details
                        </button>
                        {group.reports && group.reports.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedGroup(group);
                              setShowDetailModal(true);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-3 py-2 text-xs text-left hover:bg-muted flex items-center gap-2 text-orange-600"
                          >
                            <Flag size={14} />
                            View Reports ({group.reports.length})
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {paginatedGroups.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">
                  No groups match this filter.
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

      {/* Detail Modal */}
      {showDetailModal && selectedGroup && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-2xl bg-card border border-border shadow-2xl">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{selectedGroup.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedGroup.reports?.length || 0} report{selectedGroup.reports?.length !== 1 ? 's' : ''} • {selectedGroup.memberCount || 0} members
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedGroup(null);
                }}
                className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Group Information */}
              <div className="bg-muted/30 p-4 rounded-xl">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Users size={16} />
                  Group Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DetailItem label="Group Name" value={selectedGroup.name} />
                  <DetailItem label="Description" value={selectedGroup.description} />
                  <DetailItem label="Created By" value={selectedGroup.createdByName} />
                  <DetailItem label="Created On" value={formatDateTime(selectedGroup.createdAt)} />
                  <DetailItem label="Members" value={selectedGroup.memberCount || 0} />
                  <DetailItem label="Status" value={
                    <span>{getGroupStatusBadge(selectedGroup.status || "active")}</span>
                  } />
                </div>
              </div>

              {/* Reports Section */}
              {selectedGroup.reports && selectedGroup.reports.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Flag size={16} />
                    Reports ({selectedGroup.reports.length})
                  </h3>

                  <div className="space-y-3">
                    {selectedGroup.reports.map((report, index) => {
                      // Handle different data structures
                      const reportData = report.reportData || report;
                      const reporterName = reportData.reporterName || reportData.reportedBy || reportData.userName || "Anonymous";
                      const reason = reportData.reason || reportData.reportReason || "No reason provided";
                      const description = reportData.description || reportData.reportDescription || reportData.details;
                      const createdAt = reportData.createdAt || reportData.reportedAt || reportData.timestamp;
                      const status = reportData.status || report.status || "pending";

                      return (
                        <div 
                          key={report.id || index} 
                          className="bg-muted/20 p-4 rounded-xl border border-border hover:border-orange-200 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedReport({
                              ...report,
                              reportData: reportData,
                              id: report.id || index
                            });
                            setShowReportModal(true);
                          }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-muted-foreground">
                                Report #{index + 1}
                              </span>
                              {getReportStatusBadge(status)}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatDateTime(createdAt)}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 gap-2">
                            <DetailItem label="Reason" value={reason} />
                            {description && (
                              <DetailItem label="Description" value={description} />
                            )}
                            <DetailItem label="Reported By" value={reporterName} />
                          </div>

                          {status === "pending" && (
                            <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => dismissReport(selectedGroup.id, report.id)}
                                disabled={actionLoading}
                                className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
                              >
                                Confirm Report
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t border-border pt-4 flex flex-wrap gap-3">
                {selectedGroup.reports && selectedGroup.reports.some(r => {
                  const status = r.status || r.reportData?.status || "pending";
                  return status === "pending";
                }) && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Confirm all pending reports for "${selectedGroup.name}"?`)) {
                        selectedGroup.reports
                          .filter(r => {
                            const status = r.status || r.reportData?.status || "pending";
                            return status === "pending";
                          })
                          .forEach(r => dismissReport(selectedGroup.id, r.id));
                      }
                    }}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-buttons hover:bg-green-700 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    Confirm All Pending Reports
                  </button>
                )}
                
                <button
                  onClick={async () => {
                    if (
                      window.confirm(
                        `Are you sure you want to suspend "${selectedGroup.name}"? This will remove the group and all its content.`
                      )
                    ) {
                        await handleSuspendGroup(selectedGroup.id) 
                    }
                  }}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded-buttons hover:bg-red-700 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <Shield size={16} />
                  Suspend Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Detail Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl bg-card border border-border shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Report Details</h2>
              <button
                type="button"
                onClick={() => {
                  setShowReportModal(false);
                  setSelectedReport(null);
                }}
                className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                {getReportStatusBadge(selectedReport.status || selectedReport.reportData?.status || "pending")}
              </div>

              <DetailItem 
                label="Reported By" 
                value={selectedReport.reportData?.reporterName || selectedReport.reportedBy || selectedReport.userName || "Anonymous"} 
              />
              <DetailItem 
                label="Reason" 
                value={selectedReport.reportData?.reason || selectedReport.reportReason || selectedReport.reason || "No reason provided"} 
              />
              {selectedReport.reportData?.description && (
                <DetailItem label="Description" value={selectedReport.reportData.description} />
              )}
              <DetailItem 
                label="Reported On" 
                value={formatDateTime(selectedReport.reportData?.createdAt || selectedReport.reportedAt || selectedReport.timestamp)} 
              />

              {selectedReport.status === "pending" && (
                <div className="pt-4 border-t border-border flex gap-2">
                  <button
                    onClick={() => dismissReport(selectedGroup?.id, selectedReport.id)}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white text-sm rounded-buttons hover:bg-green-700 transition-all disabled:opacity-50"
                  >
                    Confirm Report
                  </button>
                </div>
              )}
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

export default AdminCommunityGroups;