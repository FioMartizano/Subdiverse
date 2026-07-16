// frontend/src/services/groupService.js
import { db } from '../firebase';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  increment,
  writeBatch,
  runTransaction
} from 'firebase/firestore';

const GROUPS_PER_PAGE = 6;

// ============================================================
// GROUP CRUD OPERATIONS
// ============================================================

/**
 * Create a new community group
 */
export const createGroup = async (groupData) => {
  try {
    // Create the group document
    const groupRef = await addDoc(collection(db, 'communityGroups'), {
      name: groupData.name,
      description: groupData.description || '',
      createdBy: groupData.createdBy,
      createdByName: groupData.createdByName,
      status: 'active',
      memberCount: 1,
      reportedCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Add creator as a member
    await setDoc(doc(db, 'communityGroups', groupRef.id, 'members', groupData.createdBy), {
      userId: groupData.createdBy,
      userName: groupData.createdByName,
      status: 'active',
      joinedAt: serverTimestamp()
    });
    
    return { success: true, id: groupRef.id };
  } catch (error) {
    console.error('Error creating group:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all active groups with real-time updates
 */
export const subscribeToGroups = (callback, pageSize = GROUPS_PER_PAGE, lastDoc = null) => {
  let q = query(
    collection(db, 'communityGroups'),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  if (lastDoc) {
    q = query(
      collection(db, 'communityGroups'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(pageSize)
    );
  }

  return onSnapshot(q, (snapshot) => {
    const groups = [];
    let lastVisible = null;
    
    snapshot.forEach((doc) => {
      groups.push({
        id: doc.id,
        ...doc.data()
      });
      lastVisible = doc;
    });

    callback({
      groups,
      lastVisible,
      hasMore: groups.length === pageSize
    });
  }, (error) => {
    console.error('Error fetching groups:', error);
    callback({ error: error.message });
  });
};

/**
 * Get a single group by ID
 */
export const getGroupById = async (groupId) => {
  try {
    const docRef = doc(db, 'communityGroups', groupId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: 'Group not found' };
    }
  } catch (error) {
    console.error('Error getting group:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update a group
 */
export const updateGroup = async (groupId, updates) => {
  try {
    const docRef = doc(db, 'communityGroups', groupId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating group:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete (archive) a group - soft delete
 */
export const deleteGroup = async (groupId) => {
  try {
    const docRef = doc(db, 'communityGroups', groupId);
    await updateDoc(docRef, {
      status: 'archived',
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error deleting group:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================
// GROUP MEMBERS OPERATIONS
// ============================================================

/**
 * Join a group (add user to members subcollection)
 */
export const joinGroup = async (groupId, userId, userName) => {
  try {
    const result = await runTransaction(db, async (transaction) => {
      const groupRef = doc(db, 'communityGroups', groupId);
      const groupSnap = await transaction.get(groupRef);
      
      if (!groupSnap.exists()) {
        throw new Error('Group not found');
      }
      
      const groupData = groupSnap.data();
      
      if (groupData.status !== 'active') {
        throw new Error('Group is not active');
      }
      
      const memberRef = doc(db, 'communityGroups', groupId, 'members', userId);
      const memberSnap = await transaction.get(memberRef);
      
      if (memberSnap.exists()) {
        throw new Error('Already a member of this group');
      }
      
      transaction.set(memberRef, {
        userId: userId,
        userName: userName,
        status: 'active',
        joinedAt: serverTimestamp()
      });
      
      transaction.update(groupRef, {
        memberCount: increment(1)
      });
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error joining group:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Leave a group (update member status to 'left')
 */
export const leaveGroup = async (groupId, userId) => {
  try {
    const result = await runTransaction(db, async (transaction) => {
      const groupRef = doc(db, 'communityGroups', groupId);
      const groupSnap = await transaction.get(groupRef);
      
      if (!groupSnap.exists()) {
        throw new Error('Group not found');
      }
      
      const memberRef = doc(db, 'communityGroups', groupId, 'members', userId);
      const memberSnap = await transaction.get(memberRef);
      
      if (!memberSnap.exists()) {
        throw new Error('You are not a member of this group');
      }
      
      const memberData = memberSnap.data();
      
      if (memberData.status === 'left') {
        throw new Error('You have already left this group');
      }
      
      transaction.update(memberRef, {
        status: 'left',
        leftAt: serverTimestamp()
      });
      
      transaction.update(groupRef, {
        memberCount: increment(-1)
      });
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error leaving group:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if a user is a member of a group
 */
export const isMember = async (groupId, userId) => {
  try {
    const memberRef = doc(db, 'communityGroups', groupId, 'members', userId);
    const memberSnap = await getDoc(memberRef);
    
    if (memberSnap.exists()) {
      const data = memberSnap.data();
      return data.status === 'active';
    }
    return false;
  } catch (error) {
    console.error('Error checking membership:', error);
    return false;
  }
};

/**
 * Get members of a group with real-time updates
 */
export const subscribeToGroupMembers = (groupId, callback) => {
  const q = query(
    collection(db, 'communityGroups', groupId, 'members'),
    where('status', '==', 'active'),
    orderBy('joinedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const members = [];
    snapshot.forEach((doc) => {
      members.push({
        id: doc.id,
        ...doc.data()
      });
    });
    callback(members);
  }, (error) => {
    console.error('Error fetching members:', error);
    callback([]);
  });
};

// ============================================================
// GROUP REPORTS OPERATIONS
// ============================================================

/**
 * Report a group
 */
export const reportGroup = async (groupId, reportedBy, reporterName, reason, description) => {
  try {
    const result = await runTransaction(db, async (transaction) => {
      const groupRef = doc(db, 'communityGroups', groupId);
      const groupSnap = await transaction.get(groupRef);
      
      if (!groupSnap.exists()) {
        throw new Error('Group not found');
      }
      
      const groupData = groupSnap.data();
      
      if (groupData.createdBy === reportedBy) {
        throw new Error('You cannot report your own group');
      }
      
      const reportRef = doc(db, 'communityGroups', groupId, 'reports', reportedBy);
      const reportSnap = await transaction.get(reportRef);
      
      if (reportSnap.exists()) {
        throw new Error('You have already reported this group');
      }
      
      transaction.set(reportRef, {
        reportedBy: reportedBy,
        reporterName: reporterName,
        reason: reason,
        description: description || '',
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      transaction.update(groupRef, {
        reportedCount: increment(1)
      });
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error reporting group:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if a user has reported a group
 */
export const hasReportedGroup = async (groupId, userId) => {
  try {
    const reportRef = doc(db, 'communityGroups', groupId, 'reports', userId);
    const reportSnap = await getDoc(reportRef);
    return reportSnap.exists();
  } catch (error) {
    console.error('Error checking report status:', error);
    return false;
  }
};

/**
 * Get reports for a group (admin only)
 */
export const subscribeToGroupReports = (groupId, callback) => {
  const q = query(
    collection(db, 'communityGroups', groupId, 'reports'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const reports = [];
    snapshot.forEach((doc) => {
      reports.push({
        id: doc.id,
        ...doc.data()
      });
    });
    callback(reports);
  }, (error) => {
    console.error('Error fetching reports:', error);
    callback([]);
  });
};

// ============================================================
// SEARCH GROUPS
// ============================================================

/**
 * Search groups by name
 */
export const searchGroups = (searchTerm, callback) => {
  if (!searchTerm || searchTerm.trim() === '') {
    return subscribeToGroups(callback);
  }
  
  const q = query(
    collection(db, 'communityGroups'),
    where('status', '==', 'active')
  );

  return onSnapshot(q, (snapshot) => {
    const groups = [];
    const term = searchTerm.toLowerCase().trim();
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const nameMatch = data.name?.toLowerCase().includes(term);
      const descMatch = data.description?.toLowerCase().includes(term);
      
      if (nameMatch || descMatch) {
        groups.push({
          id: doc.id,
          ...data
        });
      }
    });
    
    groups.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });
    
    callback({
      groups,
      lastVisible: null,
      hasMore: false
    });
  }, (error) => {
    console.error('Error searching groups:', error);
    callback({ error: error.message });
  });
};