import {
  collection,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';

import { db } from '../firebase';

// ============================================================
// CREATE REPORT
// ============================================================

export const createReport = async ({
  targetType,
  targetId,
  reportedBy,
  reason,
  description = ''
}) => {
  try {
    await addDoc(collection(db, 'reports'), {
      targetType,
      targetId,
      reportedBy,
      reason,
      description,
      status: 'pending',
      action: null,
      createdAt: serverTimestamp(),
      resolvedAt: null,
      resolvedBy: null
    });

    return {
      success: true
    };

  } catch (error) {
    console.error('Error creating report:', error);

    return {
      success: false,
      error: error.message
    };
  }
};