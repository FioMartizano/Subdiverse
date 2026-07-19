import { useState, useEffect, useCallback } from "react";
import { getReportedGroups } from "../services/groupService";

const useCommunityReports = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getReportedGroups();

      if (!result.success) {
        throw new Error(result.error);
      }

      setGroups(result.data);

    } catch (err) {
      console.error("Error loading community groups:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return {
    groups,
    loading,
    error,
    refresh: fetchGroups,
  };
};

export default useCommunityReports;