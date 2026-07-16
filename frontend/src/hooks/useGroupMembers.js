// frontend/src/hooks/useGroupMembers.js
import { useState, useEffect, useCallback } from 'react';
import { subscribeToGroupMembers } from '../services/groupService';

export const useGroupMembers = (groupId) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    if (!groupId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToGroupMembers(
      groupId,
      (result) => {
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }

        setMembers(result);
        setMemberCount(result.length);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [groupId]);

  // Check if a specific user is a member
  const isMember = useCallback((userId) => {
    return members.some(m => m.userId === userId && m.status === 'active');
  }, [members]);

  // Get a member by ID
  const getMember = useCallback((userId) => {
    return members.find(m => m.userId === userId);
  }, [members]);

  return {
    members,
    loading,
    error,
    memberCount,
    isMember,
    getMember
  };
};