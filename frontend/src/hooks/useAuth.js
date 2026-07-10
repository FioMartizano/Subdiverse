// frontend/src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        try {
          // Get user profile from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || userData.fullName || '',
              photoURL: firebaseUser.photoURL || '',
              role: userData.role || 'resident',
              status: userData.status || 'pending',
              ...userData
            });
          } else {
            // User exists in Auth but not in Firestore
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL || '',
              role: 'unknown',
              status: 'unknown'
            });
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setError(err.message);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
            role: 'resident',
            status: 'pending'
          });
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Helper function to check if user is admin
  const isAdmin = user?.role === 'admin' || user?.role === 'officer';

  // Helper function to check if user is logged in and approved
  const isAuthenticated = user && user?.status !== 'pending';

  return { 
    user, 
    loading, 
    error,
    isAdmin,
    isAuthenticated
  };
};