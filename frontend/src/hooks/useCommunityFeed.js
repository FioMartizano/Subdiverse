// frontend/src/hooks/useCommunityFeed.js
import { useState, useEffect, useCallback } from 'react';
import { 
  subscribeToCommunityPosts,
  createCommunityPost,
  deleteCommunityPost,
  toggleCommunityPostLike,
  createComment,
  deleteComment,
  toggleCommentLike
} from '../services/communityFeedService';
import { getGroupById } from '../services/groupService';
import { useAuth } from './useAuth';

export const useCommunityFeed = (groupId) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [group, setGroup] = useState(null);
  const [groupLoading, setGroupLoading] = useState(true);

  // Fetch group info
  useEffect(() => {
    const fetchGroup = async () => {
      if (!groupId) return;
      setGroupLoading(true);
      const result = await getGroupById(groupId);
      if (result.success) {
        setGroup(result.data);
      } else {
        setError('Group not found');
      }
      setGroupLoading(false);
    };
    fetchGroup();
  }, [groupId]);

  // Fetch posts
  useEffect(() => {
    if (!groupId) return;
    
    setLoading(true);
    setError(null);
    setPosts([]);
    setLastVisible(null);
    setHasMore(true);

    const unsubscribe = subscribeToCommunityPosts(
      groupId,
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
      10,
      null
    );

    return () => unsubscribe();
  }, [groupId]);

  // Load more posts
  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);

    const unsubscribe = subscribeToCommunityPosts(
      groupId,
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
      10,
      lastVisible
    );

    return () => unsubscribe();
  }, [hasMore, isLoadingMore, lastVisible, groupId]);

  // Create a post
  const handleCreatePost = useCallback(async (postData) => {
    if (!user) {
      return { success: false, error: 'Please log in to post' };
    }

    try {
      const result = await createCommunityPost({
        ...postData,
        groupId,
        userId: user.uid,
        author: {
          id: user.uid,
          name: user.displayName || 'Resident',
          avatar: user.photoURL || 'https://ui-avatars.com/api/?name=Resident&background=347433&color=fff&size=40',
          role: 'resident'
        },
        engagement: {
          likes: 0,
          comments: 0
        },
      });
      return result;
    } catch (error) {
      console.error('Error creating post:', error);
      return { success: false, error: error.message };
    }
  }, [user, groupId]);

  // Delete a post
  const handleDeletePost = useCallback(async (postId) => {
    if (!user) {
      return { success: false, error: 'Please log in' };
    }

    try {
      const result = await deleteCommunityPost(postId);
      if (result.success) {
        setPosts(prev => prev.filter(p => p.id !== postId));
      }
      return result;
    } catch (error) {
      console.error('Error deleting post:', error);
      return { success: false, error: error.message };
    }
  }, [user]);

  // Toggle like on a post
  const handleToggleLike = useCallback(async (postId) => {
    if (!user) {
      return { success: false, error: 'Please log in to like' };
    }

    try {
      const result = await toggleCommunityPostLike(postId, user.uid);
      if (result.success) {
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            const newLikes = result.isLiked 
              ? (post.engagement?.likes || 0) + 1 
              : (post.engagement?.likes || 0) - 1;
            return {
              ...post,
              engagement: { ...post.engagement, likes: newLikes },
              isLiked: result.isLiked
            };
          }
          return post;
        }));
      }
      return result;
    } catch (error) {
      console.error('Error toggling like:', error);
      return { success: false, error: error.message };
    }
  }, [user]);

  // Create a comment
  const handleCreateComment = useCallback(async (postId, commentText) => {
    if (!user) {
      return { success: false, error: 'Please log in to comment' };
    }

    try {
      const result = await createComment(postId, {
        author: {
          id: user.uid,
          name: user.displayName || 'Resident',
          avatar: user.photoURL || 'https://ui-avatars.com/api/?name=Resident&background=347433&color=fff&size=32'
        },
        content: commentText
      });
      return result;
    } catch (error) {
      console.error('Error creating comment:', error);
      return { success: false, error: error.message };
    }
  }, [user]);

  // Delete a comment
  const handleDeleteComment = useCallback(async (commentId, postId) => {
    if (!user) {
      return { success: false, error: 'Please log in' };
    }

    try {
      const result = await deleteComment(commentId, postId);
      if (result.success) {
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              engagement: { ...post.engagement, comments: Math.max((post.engagement?.comments || 0) - 1, 0) }
            };
          }
          return post;
        }));
      }
      return result;
    } catch (error) {
      console.error('Error deleting comment:', error);
      return { success: false, error: error.message };
    }
  }, [user]);

  // Toggle like on a comment
  const handleToggleCommentLike = useCallback(async (commentId) => {
    if (!user) {
      return { success: false, error: 'Please log in' };
    }

    try {
      const result = await toggleCommentLike(commentId, user.uid);
      return result;
    } catch (error) {
      console.error('Error toggling comment like:', error);
      return { success: false, error: error.message };
    }
  }, [user]);

  return {
    posts,
    loading,
    error,
    hasMore,
    isLoadingMore,
    loadMore,
    group,
    groupLoading,
    createPost: handleCreatePost,
    deletePost: handleDeletePost,
    toggleLike: handleToggleLike,
    createComment: handleCreateComment,
    deleteComment: handleDeleteComment,
    toggleCommentLike: handleToggleCommentLike,
    setPosts
  };
};

export default useCommunityFeed;