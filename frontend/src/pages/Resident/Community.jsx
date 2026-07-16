// frontend/src/pages/Resident/CommunityGroups.jsx
import React, { useState, useEffect } from 'react';
import { 
  Search, PlusCircle, Users, ChevronLeft, ChevronRight, 
  MessageCircle, AlertTriangle, X, Flag, Loader2, UserPlus, UserMinus, Trash2
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGroups } from '../../hooks/useGroups';
import CommunityGroup from "../../assets/CommunityGroup.jpg";

const ITEMS_PER_PAGE = 6;

const REPORT_REASONS = [
  'Spam',
  'Inappropriate Content',
  'Harassment or Bullying',
  'Impersonation',
  'Misleading Information',
  'Other'
];

export default function CommunityGroups() {
  // ============================================================
  // STATE
  // ============================================================
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const {
    groups,
    loading,
    error,
    hasMore,
    isLoadingMore,
    loadMore,
    refresh,
    myGroupIds,
    myGroupsLoading,
    fetchMyGroups,
    joinGroup,
    leaveGroup,
    reportGroup,
    deleteGroup,
    setGroups
  } = useGroups(searchTerm);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [createError, setCreateError] = useState('');

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportGroupId, setReportGroupId] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState('');

  const [toast, setToast] = useState(null);





  // ============================================================
  // EFFECTS
  // ============================================================
  
  useEffect(() => {
    if (user) {
      fetchMyGroups();
    }
  }, [user, fetchMyGroups]);

  // ============================================================
  // HANDLERS
  // ============================================================

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setCreateError('Please log in to create a group');
      return;
    }

    if (!newGroup.name.trim()) {
      setCreateError('Group name is required');
      return;
    }

    setCreatingGroup(true);
    setCreateError('');

    try {
      const { createGroup } = await import('../../services/groupService');
      const result = await createGroup({
        name: newGroup.name.trim(),
        description: newGroup.description.trim(),
        createdBy: user.uid,
        createdByName: user.displayName || 'Resident'
      });

      if (result.success) {
        await fetchMyGroups();
        
        showToast(`"${newGroup.name}" has been created! `);
        setShowCreateModal(false);
        setNewGroup({ name: '', description: '' });
      } else {
        setCreateError(result.error || 'Failed to create group');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      setCreateError('Something went wrong. Please try again.');
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    if (!user) {
      showToast('Please log in to join groups', 'error');
      return;
    }

    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const result = await joinGroup(groupId, group.name);
    if (result.success) {
      showToast(`Successfully joined "${group.name}"! 🎉`);
      await fetchMyGroups();
    } else {
      showToast(result.error || 'Failed to join group', 'error');
    }
  };

  const handleLeaveGroup = async (groupId) => {
    if (!user) {
      showToast('Please log in to leave groups', 'error');
      return;
    }

    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    if (!window.confirm(`Are you sure you want to leave "${group.name}"?`)) return;

    const result = await leaveGroup(groupId);
    if (result.success) {
      showToast(`You have left "${group.name}"`);
      await fetchMyGroups();
    } else {
      showToast(result.error || 'Failed to leave group', 'error');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    if (!window.confirm(`Are you sure you want to delete "${group.name}"? This action cannot be undone.`)) return;

    const result = await deleteGroup(groupId);
    if (result.success) {
      showToast(`"${group.name}" has been deleted`);
    } else {
      showToast(result.error || 'Failed to delete group', 'error');
    }
  };

  const handleOpenReportModal = (groupId) => {
    setReportGroupId(groupId);
    setReportReason('');
    setReportDescription('');
    setReportError('');
    setShowReportModal(true);
  };

  const handleSubmitReport = async () => {
    if (!user) {
      setReportError('Please log in to report');
      return;
    }

    if (!reportReason) {
      setReportError('Please select a reason');
      return;
    }

    setSubmittingReport(true);
    setReportError('');

    try {
      const result = await reportGroup(
        reportGroupId,
        user.uid,
        user.displayName || 'Resident',
        reportReason,
        reportDescription
      );

      if (result.success) {
        showToast('Report submitted. Thank you for helping keep our community safe!');
        setShowReportModal(false);
        setReportGroupId(null);
      } else {
        setReportError(result.error || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Error reporting group:', error);
      setReportError('Something went wrong. Please try again.');
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleOpenFeed = (groupId) => {
    showToast('Community Feed coming soon! 🚀', 'info');
  };

  // ============================================================
  // RENDER HELPERS
  // ============================================================

  const getDisplayGroups = () => {
    let filtered = activeTab === 'all' 
      ? groups 
      : groups.filter(g => myGroupIds.has(g.id));

    if (!searchTerm) {
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      filtered = filtered.slice(start, end);
    }

    return filtered;
  };

  const displayGroups = getDisplayGroups();

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--color-secondary)] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading communities...</p>
        </div>
      </div>
    );
  }
  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-24 right-4 z-50 animate-slide-in max-w-sm ${
          toast.type === 'error' ? 'border-red-500' : 
          toast.type === 'info' ? 'border-blue-500' : 
          'border-[var(--color-secondary)]'
        }`}>
          <div className={`bg-white rounded-xl shadow-2xl border-l-4 p-4 ${
            toast.type === 'error' ? 'border-red-500' : 
            toast.type === 'info' ? 'border-blue-500' : 
            'border-[var(--color-secondary)]'
          }`}>
            <p className="text-sm font-medium text-gray-900">{toast.message}</p>
          </div>
        </div>
      )}

      {/* HERO HEADER */}
      <header className="bg-white py-12 px-6 md:px-12 border-b border-gray-100 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
              <span className="text-secondary">Welcome to </span>
              <span className="text-primary">our</span><br/>
              <span className="text-secondary italic font-medium">Community Group</span>
            </h1>
            <p className="mt-4 text-xl text-gray-500 max-w-2xl font-thin ml-2">
              Where <span className='text-secondary'>interest</span> turn into communities that truly <span className='text-secondary'>thrive.</span>
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[var(--color-secondary)] hover:bg-[var(--color-primary)] text-white font-semibold px-8 py-3 rounded-full text-lg shadow-md flex items-center gap-2 transition-all"
          >
            <PlusCircle size={22} />
            Start a New Group
          </button>
        </div>
      </header>

      {/* HERO IMAGE */}
      <section className="w-full overflow-hidden">
        <div className="w-full h-[350px] md:h-[500px] overflow-hidden">
          <img
            src={CommunityGroup}
            alt="Community group"
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
          />
        </div>
      </section>

      {/* CONNECT SECTION */}
      <section className="mt-24 px-6 md:px-12 max-w-7xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-secondary tracking-tight">
          Connect with your <br className="sm:hidden"/> Community
        </h2>
        <div className="mt-10 h-1 w-full max-w-20xl mx-auto bg-primary rounded-full"></div>
      </section>

      {/* CONTROLS SECTION */}
      <section className="mt-12 px-6 md:px-12 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-gray-200 pb-8">
        <div className="flex items-center gap-8 text-lg font-medium w-full sm:w-auto justify-center sm:justify-start">
          <button
            onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
            className={`pb-2 border-b-4 transition-colors ${
              activeTab === 'all' 
                ? 'border-[var(--color-secondary)] text-[var(--color-secondary)]' 
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            All Communities <span className="ml-2 bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-bold">{groups.length}</span>
          </button>
          <button
            onClick={() => { setActiveTab('my'); setCurrentPage(1); }}
            className={`pb-2 border-b-4 transition-colors ${
              activeTab === 'my' 
                ? 'border-[var(--color-secondary)] text-[var(--color-secondary)]' 
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            My Communities <span className="ml-2 bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-bold">{myGroupIds.size}</span>
          </button>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
          <input
            type="text"
            placeholder="Search community..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)] transition"
          />
        </div>
      </section>

      {/* COMMUNITY GRID */}
      <section className="mt-10 px-6 md:px-12 max-w-7xl mx-auto">
        {error ? (
          <div className="text-center py-20">
            <p className="text-red-500">Error loading groups: {error}</p>
            <button
              onClick={refresh}
              className="mt-4 text-[var(--color-secondary)] hover:underline"
            >
              Retry
            </button>
          </div>
        ) : displayGroups.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayGroups.map((group) => {
              const isMember = myGroupIds.has(group.id);
              const isCreator = user?.uid === group.createdBy;
              
              return (
                <div
                  key={group.id}
                  className={`bg-white p-6 rounded-3xl shadow-lg border-t-8 ${
                    isMember ? 'border-[var(--color-secondary)]' : 'border-transparent'
                  } group hover:shadow-2xl transition-all flex flex-col`}
                >
                  <div className="flex-grow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold text-gray-950">{group.name}</h3>
                        {group.memberCount !== undefined && (
                          <div className="mt-1 flex items-center gap-2 text-gray-500 font-medium">
                            <Users size={18} className="text-[var(--color-secondary)]" />
                            <span>{group.memberCount || 0} members</span>
                          </div>
                        )}
                      </div>
                      {isCreator && (
                        <button
                          onClick={() => handleDeleteGroup(group.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          title="Delete group"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                    <p className="text-gray-600 leading-relaxed line-clamp-3">
                      {group.description || 'No description provided.'}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                      <span>Created by {group.createdByName || 'Unknown'}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    {isMember ? (
                      <>
                        <button
                          onClick={() => handleOpenFeed(group.id)}
                          className="flex-1 py-3 rounded-full text-lg font-semibold transition-all bg-[var(--color-secondary)] hover:bg-[var(--color-primary)] text-white flex items-center justify-center gap-2"
                        >
                          <MessageCircle size={20} />
                          Open Feed
                        </button>
                        <button
                          onClick={() => handleLeaveGroup(group.id)}
                          className="px-4 py-3 rounded-full text-lg font-semibold transition-all bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center"
                          title="Leave group"
                        >
                          <UserMinus size={20} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleJoinGroup(group.id)}
                        className="flex-1 py-3 rounded-full text-lg font-semibold transition-all bg-[var(--color-secondary)] hover:bg-[var(--color-primary)] text-white flex items-center justify-center gap-2"
                      >
                        <UserPlus size={20} />
                        Join Community
                      </button>
                    )}
                    
                    {!isCreator && (
                      <button
                        onClick={() => handleOpenReportModal(group.id)}
                        className="px-4 py-3 rounded-full text-lg font-semibold transition-all bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center"
                        title="Report group"
                      >
                        <Flag size={20} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-inner border border-gray-100">
            <Users size={64} className="mx-auto text-gray-300" />
            <h3 className="mt-6 text-3xl font-bold text-gray-700">
              {searchTerm ? 'No communities found' : 'No communities yet'}
            </h3>
            <p className="mt-3 text-lg text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search terms.' 
                : 'Be the first to start a community!'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-6 text-[var(--color-secondary)] hover:underline font-semibold"
              >
                Start a New Group →
              </button>
            )}
          </div>
        )}
      </section>

      {/* PAGINATION */}
      {!searchTerm && displayGroups.length > 0 && (
        <section className="mt-16 mb-24 px-6 md:px-12 max-w-7xl mx-auto flex justify-center items-center gap-3">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`p-2 rounded-full border ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-white text-[var(--color-secondary)] border-[var(--color-secondary)] hover:bg-orange-50'
            }`}
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex gap-1.5">
            {[...Array(Math.ceil(
              (activeTab === 'all' ? groups : groups.filter(g => myGroupIds.has(g.id))).length / ITEMS_PER_PAGE
            ))].map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${
                    currentPage === page
                      ? 'bg-[var(--color-secondary)] text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(
              Math.ceil(
                (activeTab === 'all' ? groups : groups.filter(g => myGroupIds.has(g.id))).length / ITEMS_PER_PAGE
              ), 
              p + 1
            ))}
            disabled={currentPage === Math.ceil(
              (activeTab === 'all' ? groups : groups.filter(g => myGroupIds.has(g.id))).length / ITEMS_PER_PAGE
            )}
            className={`p-2 rounded-full border ${
              currentPage === Math.ceil(
                (activeTab === 'all' ? groups : groups.filter(g => myGroupIds.has(g.id))).length / ITEMS_PER_PAGE
              )
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-white text-[var(--color-secondary)] border-[var(--color-secondary)] hover:bg-orange-50'
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </section>
      )}

      {/* ============================================================
          CREATE GROUP MODAL
          ============================================================ */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <PlusCircle size={24} className="text-[var(--color-secondary)]" />
                Create New Group
              </h3>
              <button
                onClick={() => { setShowCreateModal(false); setCreateError(''); }}
                className="p-2 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="p-6 space-y-4">
              {createError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700">
                  <AlertTriangle size={18} className="flex-shrink-0" />
                  <span className="text-sm">{createError}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="Enter group name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)] transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="What is this group about?"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)] transition resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setCreateError(''); }}
                  className="px-6 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingGroup || !newGroup.name.trim()}
                  className="px-6 py-2.5 rounded-xl bg-[var(--color-secondary)] text-white hover:bg-[var(--color-primary)] transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingGroup ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Group'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          REPORT MODAL
          ============================================================ */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Flag size={24} className="text-red-500" />
                Report Group
              </h3>
              <button
                onClick={() => { setShowReportModal(false); setReportError(''); }}
                className="p-2 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {reportError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700">
                  <AlertTriangle size={18} className="flex-shrink-0" />
                  <span className="text-sm">{reportError}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Reason *
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)] transition"
                >
                  <option value="">Select a reason...</option>
                  {REPORT_REASONS.map((reason) => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Please provide more details..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)] transition resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setShowReportModal(false); setReportError(''); }}
                  className="px-6 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReport}
                  disabled={submittingReport || !reportReason}
                  className="px-6 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingReport ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Report'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
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