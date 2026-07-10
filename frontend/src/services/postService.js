// frontend/src/services/postService.js
import { db } from '../firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  increment,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';

const POSTS_PER_PAGE = 10;

export const createPost = async (postData) => {
  try {
    const docRef = await addDoc(collection(db, 'posts'), {
      ...postData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating post:', error);
    return { success: false, error: error.message };
  }
};

export const subscribeToPosts = (callback, lastDoc = null) => {
  let q = query(
    collection(db, 'posts'),
    orderBy('metadata.isPinned', 'desc'),
    orderBy('createdAt', 'desc'),
    limit(POSTS_PER_PAGE)
  );

  if (lastDoc) {
    q = query(
      collection(db, 'posts'),
      orderBy('metadata.isPinned', 'desc'),
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(POSTS_PER_PAGE)
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
      hasMore: posts.length === POSTS_PER_PAGE
    });
  }, (error) => {
    console.error('Error fetching posts:', error);
    callback({ error: error.message });
  });
};

export const getPostById = async (postId) => {
  try {
    const docRef = doc(db, 'posts', postId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: 'Post not found' };
    }
  } catch (error) {
    console.error('Error getting post:', error);
    return { success: false, error: error.message };
  }
};

export const updatePost = async (postId, updates) => {
  try {
    const docRef = doc(db, 'posts', postId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating post:', error);
    return { success: false, error: error.message };
  }
};

export const deletePost = async (postId) => {
  try {
    const docRef = doc(db, 'posts', postId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting post:', error);
    return { success: false, error: error.message };
  }
};

export const toggleLike = async (postId, userId) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const likeRef = doc(db, 'likes', `${postId}_${userId}`);
    const likeDoc = await getDoc(likeRef);

    const batch = writeBatch(db);

    if (likeDoc.exists()) {
      batch.delete(likeRef);
      batch.update(postRef, {
        'engagement.likes': increment(-1)
      });
    } else {
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

export const checkUserLiked = async (postId, userId) => {
  try {
    const likeRef = doc(db, 'likes', `${postId}_${userId}`);
    const likeDoc = await getDoc(likeRef);
    return likeDoc.exists();
  } catch (error) {
    console.error('Error checking like status:', error);
    return false;
  }
};

export const togglePin = async (postId, isPinned) => {
  try {
    const docRef = doc(db, 'posts', postId);
    await updateDoc(docRef, {
      'metadata.isPinned': isPinned,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error toggling pin:', error);
    return { success: false, error: error.message };
  }
};


