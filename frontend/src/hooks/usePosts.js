// frontend/src/hooks/usePosts.js
import { useState, useEffect, useCallback } from 'react';
import { subscribeToPosts } from '../services/postService';

export const usePosts = (initialLimit = 10) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Initial load
  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToPosts(
      (result) => {
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }

        setPosts(result.posts);
        setLastVisible(result.lastVisible);
        setHasMore(result.hasMore);
        setLoading(false);
      },
      null // No lastDoc for initial load
    );

    return () => unsubscribe();
  }, []);

  // Load more posts
  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);

    const unsubscribe = subscribeToPosts(
      (result) => {
        if (result.error) {
          setError(result.error);
          setIsLoadingMore(false);
          return;
        }

        setPosts(prev => [...prev, ...result.posts]);
        setLastVisible(result.lastVisible);
        setHasMore(result.hasMore);
        setIsLoadingMore(false);
      },
      lastVisible
    );

    // Cleanup the listener after loading more
    return () => unsubscribe();
  }, [hasMore, isLoadingMore, lastVisible]);

  // Refresh posts (reset to initial)
  const refresh = useCallback(() => {
    setPosts([]);
    setHasMore(true);
    setLastVisible(null);
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToPosts(
      (result) => {
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }

        setPosts(result.posts);
        setLastVisible(result.lastVisible);
        setHasMore(result.hasMore);
        setLoading(false);
      },
      null
    );

    return () => unsubscribe();
  }, []);

  return {
    posts,
    loading,
    error,
    hasMore,
    isLoadingMore,
    loadMore,
    refresh,
    setPosts // For optimistic updates
  };
};