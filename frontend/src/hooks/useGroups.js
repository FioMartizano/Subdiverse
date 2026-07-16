// frontend/src/hooks/useGroups.js
import { useState, useEffect, useCallback } from 'react';
import { 
  subscribeToGroups, 
  searchGroups,
  getGroupById,
  joinGroup,
  leaveGroup,
  reportGroup,
  isMember,
  deleteGroup,
  updateGroup
} from '../services/groupService';
import { useAuth } from './useAuth';

const GROUPS_PER_PAGE = 6;

export const useGroups = (searchTerm = '') => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [myGroupIds, setMyGroupIds] = useState(new Set());
  const [myGroupsLoading, setMyGroupsLoading] = useState(false);
  const [memberCounts, setMemberCounts] = useState({});

  // Fetch groups
  useEffect(() => {
    setLoading(true);
    setError(null);
    setGroups([]);
    setLastVisible(null);
    setHasMore(true);

    let unsubscribe;

    if (searchTerm && searchTerm.trim() !== '') {
      unsubscribe = searchGroups(searchTerm, (result) => {
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }
        setGroups(result.groups);
        setHasMore(false);
        setLoading(false);
      });
    } else {
      unsubscribe = subscribeToGroups(
        (result) => {
          if (result.error) {
            setError(result.error);
            setLoading(false);
            return;
          }
          setGroups(result.groups);
          setLastVisible(result.lastVisible);
          setHasMore(result.hasMore);
          setLoading(false);
        },
        GROUPS_PER_PAGE,
        null
      );
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [searchTerm]);

  // Load more
  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || searchTerm) return;

    setIsLoadingMore(true);

    const unsubscribe = subscribeToGroups(
      (result) => {
        if (result.error) {
          setError(result.error);
          setIsLoadingMore(false);
          return;
        }
        setGroups(prev => [...prev, ...result.groups]);
        setLastVisible(result.lastVisible);
        setHasMore(result.hasMore);
        setIsLoadingMore(false);
      },
      GROUPS_PER_PAGE,
      lastVisible
    );

    return () => unsubscribe();
  }, [hasMore, isLoadingMore, lastVisible, searchTerm]);

  // Refresh
  const refresh = useCallback(() => {
    setGroups([]);
    setHasMore(true);
    setLastVisible(null);
    setLoading(true);
    setError(null);

    let unsubscribe;

    if (searchTerm && searchTerm.trim() !== '') {
      unsubscribe = searchGroups(searchTerm, (result) => {
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }
        setGroups(result.groups);
        setHasMore(false);
        setLoading(false);
      });
    } else {
      unsubscribe = subscribeToGroups(
        (result) => {
          if (result.error) {
            setError(result.error);
            setLoading(false);
            return;
          }
          setGroups(result.groups);
          setLastVisible(result.lastVisible);
          setHasMore(result.hasMore);
          setLoading(false);
        },
        GROUPS_PER_PAGE,
        null
      );
    }

    return () => unsubscribe();
  }, [searchTerm]);

  // Fetch user's group memberships
  const fetchMyGroups = useCallback(async () => {
    if (!user) return;

    setMyGroupsLoading(true);
    try {
      const membershipMap = new Set();
      
      for (const group of groups) {
        const memberStatus = await isMember(group.id, user.uid);
        if (memberStatus) {
          membershipMap.add(group.id);
        }
      }
      
      setMyGroupIds(membershipMap);
    } catch (error) {
      console.error('Error fetching my groups:', error);
    } finally {
      setMyGroupsLoading(false);
    }
  }, [user, groups]);

  // Check membership
  const checkMembership = useCallback(async (groupId) => {
    if (!user) return false;
    return await isMember(groupId, user.uid);
  }, [user]);

  // Join group
  const handleJoinGroup = useCallback(async (groupId, groupName) => {
    if (!user) {
      return { success: false, error: 'Please log in to join groups' };
    }

    try {
      const result = await joinGroup(groupId, user.uid, user.displayName || 'Resident');
      if (result.success) {
        setMyGroupIds(prev => new Set(prev).add(groupId));
        setMemberCounts(prev => ({
          ...prev,
          [groupId]: (prev[groupId] || 0) + 1
        }));
        return { success: true };
      }
      return result;
    } catch (error) {
      console.error('Error joining group:', error);
      return { success: false, error: error.message };
    }
  }, [user]);

  // Leave group
  const handleLeaveGroup = useCallback(async (groupId) => {
    if (!user) {
      return { success: false, error: 'Please log in to leave groups' };
    }

    try {
      const result = await leaveGroup(groupId, user.uid);
      if (result.success) {
        const newSet = new Set(myGroupIds);
        newSet.delete(groupId);
        setMyGroupIds(newSet);
        setMemberCounts(prev => ({
          ...prev,
          [groupId]: Math.max((prev[groupId] || 1) - 1, 0)
        }));
        return { success: true };
      }
      return result;
    } catch (error) {
      console.error('Error leaving group:', error);
      return { success: false, error: error.message };
    }
  }, [user, myGroupIds]);

  // Report group
  const handleReportGroup = useCallback(async (groupId, reason, description) => {
    if (!user) {
      return { success: false, error: 'Please log in to report groups' };
    }

    try {
      const result = await reportGroup(
        groupId,
        user.uid,
        user.displayName || 'Resident',
        reason,
        description
      );
      return result;
    } catch (error) {
      console.error('Error reporting group:', error);
      return { success: false, error: error.message };
    }
  }, [user]);

  // Delete group
  const handleDeleteGroup = useCallback(async (groupId) => {
    if (!user) {
      return { success: false, error: 'Please log in to delete groups' };
    }

    try {
      const result = await deleteGroup(groupId);
      if (result.success) {
        setGroups(prev => prev.filter(g => g.id !== groupId));
        return { success: true };
      }
      return result;
    } catch (error) {
      console.error('Error deleting group:', error);
      return { success: false, error: error.message };
    }
  }, [user]);

  // Update group
  const handleUpdateGroup = useCallback(async (groupId, updates) => {
    if (!user) {
      return { success: false, error: 'Please log in to update groups' };
    }

    try {
      const result = await updateGroup(groupId, updates);
      if (result.success) {
        setGroups(prev => prev.map(g => 
          g.id === groupId ? { ...g, ...updates } : g
        ));
        return { success: true };
      }
      return result;
    } catch (error) {
      console.error('Error updating group:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Get group
  const getGroup = useCallback(async (groupId) => {
    try {
      const result = await getGroupById(groupId);
      return result;
    } catch (error) {
      console.error('Error getting group:', error);
      return { success: false, error: error.message };
    }
  }, []);

  return {
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
    checkMembership,
    joinGroup: handleJoinGroup,
    leaveGroup: handleLeaveGroup,
    reportGroup: handleReportGroup,
    deleteGroup: handleDeleteGroup,
    updateGroup: handleUpdateGroup,
    getGroup,
    memberCounts,
    setGroups
  };
};

export default useGroups;