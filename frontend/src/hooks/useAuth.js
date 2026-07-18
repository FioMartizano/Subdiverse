// frontend/src/hooks/useAuth.js

import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setLoading(true);
        setError(null);

        if (!firebaseUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        try {
          const userDocRef = doc(
            db,
            "users",
            firebaseUser.uid
          );

          const userDocSnap =
            await getDoc(userDocRef);

          if (!userDocSnap.exists()) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName:
                firebaseUser.displayName || "",
              photoURL:
                firebaseUser.photoURL || "",
              role: "unknown",
              accountStatus: "unknown",
            });

            return;
          }

          const userData =
            userDocSnap.data();

          const accountStatus = String(
            userData.accountStatus ||
            userData.status ||
            "pending"
          ).toLowerCase();

          setUser({
            ...userData,

            uid: firebaseUser.uid,

            email:
              firebaseUser.email ||
              userData.email ||
              "",

            displayName:
              firebaseUser.displayName ||
              userData.fullName ||
              "",

            photoURL:
              firebaseUser.photoURL ||
              "",

            role: String(
              userData.role ||
              "resident"
            ).toLowerCase(),

            accountStatus,
          });

        } catch (err) {
          console.error(
            "Error fetching user profile:",
            err
          );

          setError(err.message);

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName:
              firebaseUser.displayName || "",
            photoURL:
              firebaseUser.photoURL || "",
            role: "resident",
            accountStatus: "unknown",
          });

        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const isAdmin =
    user?.role === "admin" ||
    user?.role === "officer";

  const isAuthenticated =
    Boolean(user) &&
    user.accountStatus === "active";

  return {
    user,
    loading,
    error,
    isAdmin,
    isAuthenticated,
  };
};