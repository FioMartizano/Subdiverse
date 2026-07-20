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
          // ==========================================
          // GET MAIN USER PROFILE
          // ==========================================

          const userDocRef = doc(
            db,
            "users",
            firebaseUser.uid
          );

          const userDocSnap = await getDoc(userDocRef);

          // ==========================================
          // GET OFFICER PROFILE
          // ==========================================

          const officerDocRef = doc(
            db,
            "officerProfiles",
            firebaseUser.uid
          );

          const officerDocSnap = await getDoc(
            officerDocRef
          );

          const officerProfile =
            officerDocSnap.exists()
              ? officerDocSnap.data()
              : null;

          console.log(
            "OFFICER CHECK:",
            {
              uid: firebaseUser.uid,
              officerExists: officerDocSnap.exists(),
              officerProfile: officerProfile,
            }
          );

          // ==========================================
          // USER PROFILE DOES NOT EXIST
          // ==========================================

          if (!userDocSnap.exists()) {
            setUser({
              uid: firebaseUser.uid,

              email:
                firebaseUser.email || "",

              displayName:
                firebaseUser.displayName || "",

              photoURL:
                firebaseUser.photoURL || "",

              role: "unknown",

              accountStatus: "unknown",

              isOfficer:
                officerProfile?.status === "active",

              officerProfile,
            });

            setLoading(false);
            return;
          }

          // ==========================================
          // USER PROFILE EXISTS
          // ==========================================

          const userData =
            userDocSnap.data();

          const accountStatus =
            String(
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

            // The user remains a resident/admin
            role:
              String(
                userData.role ||
                "resident"
              ).toLowerCase(),

            accountStatus,

            // Additional officer access
            isOfficer:
              officerProfile?.status === "active",

            officerProfile,
          });

        } catch (err) {
          console.error(
            "Error fetching user profile:",
            err
          );

          setError(err.message);

          setUser({
            uid: firebaseUser.uid,

            email:
              firebaseUser.email || "",

            displayName:
              firebaseUser.displayName || "",

            photoURL:
              firebaseUser.photoURL || "",

            role: "resident",

            accountStatus: "unknown",

            isOfficer: false,

            officerProfile: null,
          });

        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const isAdmin =
    user?.role === "admin";

  const isOfficer =
    user?.isOfficer === true;

  const isAuthenticated =
    Boolean(user) &&
    user.accountStatus === "active";

  return {
    user,
    loading,
    error,
    isAdmin,
    isOfficer,
    isAuthenticated,
  };
};