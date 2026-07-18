// frontend/src/services/communityFeedService.js
import { db } from '../firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  increment,
  runTransaction,
  getDocs
} from 'firebase/firestore';

const POSTS_PER_PAGE = 10;
/**
 * Create a post in a community group
 */
export const createCommunityPost = async (postData) => {
  try {
    const docRef = await addDoc(collection(db, 'posts'), {
      ...postData,
      source: 'community',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating post:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get posts for a specific group with real-time updates
 */
export const subscribeToCommunityPosts = (groupId, callback, pageSize = POSTS_PER_PAGE, lastDoc = null) => {
  let q = query(
    collection(db, 'posts'),
    where('groupId', '==', groupId),
    where('source', '==', 'community'),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  if (lastDoc) {
    q = query(
      collection(db, 'posts'),
      where('groupId', '==', groupId),
      where('source', '==', 'community'),
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(pageSize)
    );
  }

  return onSnapshot(q, (snapshot) => {
    const posts = [];
    let lastVisible = null;
    
    snapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data()
      });
      lastVisible = doc;
    });

    callback({
      posts,
      lastVisible,
      hasMore: posts.length === pageSize
    });
  }, (error) => {
    console.error('Error fetching posts:', error);
    callback({ error: error.message });
  });
};

/**
 * Delete a post
 */
export const deleteCommunityPost = async (postId) => {
  try {
    const docRef = doc(db, 'posts', postId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting post:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================
// LIKE OPERATIONS
// ============================================================

/**
 * Toggle like on a post
 */
export const toggleCommunityPostLike = async (postId, userId) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const likeRef = doc(db, 'likes', `${postId}_${userId}`);
    const likeDoc = await getDoc(likeRef);

    const batch = writeBatch(db);

    if (likeDoc.exists()) {
      // Unlike: Remove like document and decrement count
      batch.delete(likeRef);
      batch.update(postRef, {
        'engagement.likes': increment(-1)
      });
    } else {
      // Like: Add like document and increment count
      batch.set(likeRef, {
        postId,
        userId,
        createdAt: serverTimestamp()
      });
      batch.update(postRef, {
        'engagement.likes': increment(1)
      });
    }

    await batch.commit();
    return { success: true, isLiked: !likeDoc.exists() };
  } catch (error) {
    console.error('Error toggling like:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if user has liked a post
 */
export const checkUserLikedPost = async (postId, userId) => {
  try {
    const likeRef = doc(db, 'likes', `${postId}_${userId}`);
    const likeDoc = await getDoc(likeRef);
    return likeDoc.exists();
  } catch (error) {
    console.error('Error checking like status:', error);
    return false;
  }
};

// ============================================================
// COMMENT OPERATIONS
// ============================================================

/**
 * Create a comment on a post
 */
export const createComment = async (postId, commentData) => {
  try {
    const commentRef = await addDoc(collection(db, 'comments'), {
      postId,
      ...commentData,
      likes: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Update post comment count
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      'engagement.comments': increment(1)
    });
    
    return { success: true, id: commentRef.id };
  } catch (error) {
    console.error('Error creating comment:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get comments for a post with real-time updates
 */
  export const subscribeToComments = (postId, callback) => {
    const q = query(
      collection(db, 'comments'),
      where('postId', '==', postId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const comments = [];

        snapshot.forEach((doc) => {
          comments.push({
            id: doc.id,
            ...doc.data()
          });
        });

        // Sort oldest → newest in JavaScript
        comments.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return aTime - bTime;
        });

        callback(comments);
      },
      (error) => {
        console.error("Error fetching comments:", error);
        callback([]);
      }
    );
  };

/**
 * Toggle like on a comment
 */
  export const toggleCommentLike = async (commentId, userId) => {
    try {
      const commentRef = doc(db, 'comments', commentId);
      const likeRef = doc(db, 'commentLikes', `${commentId}_${userId}`);
      const likeDoc = await getDoc(likeRef);

      const batch = writeBatch(db);

      if (likeDoc.exists()) {
        batch.delete(likeRef);
        batch.update(commentRef, {
          likes: increment(-1)
        });
      } else {
        batch.set(likeRef, {
          commentId,
          userId,
          createdAt: serverTimestamp()
        });
        batch.update(commentRef, {
          likes: increment(1)
        });
      }

      await batch.commit();
      return { success: true, isLiked: !likeDoc.exists() };
    } catch (error) {
      console.error('Error toggling comment like:', error);
      return { success: false, error: error.message };
    }
  };

/**
 * Delete a comment
 */
export const deleteComment = async (commentId, postId) => {
  try {
    const commentRef = doc(db, 'comments', commentId);
    await deleteDoc(commentRef);
    
    // Update post comment count
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      'engagement.comments': increment(-1)
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting comment:', error);
    return { success: false, error: error.message };
  }
};