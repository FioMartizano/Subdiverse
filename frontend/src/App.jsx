import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import AppRoutes from "./AppRoutes";
import Footer from "./components/Footer";
import GuestNavbar from "./components/GuestNavbar";
import ResidentNavbar from "./components/ResidentNavbar";
import AdminNavbar from "./components/AdminNavbar";

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const residentPrefixes = [
    "/resident-home",
    "/reservation",
    "/businesshub",
    "/hoa",
    "/grievance",
    "/grievanceComplaint",
    "/elderly",
    "/healthcare",
    "/parishchurch",
    "/community",
    "/community/feed", 
    "/vehicleSticker",
    "/parkingReservation",
    "/monthlyDues",
    "/userSettings",
  ];

<<<<<<< HEAD
  const adminPrefixes = [
  "/admin-dashboard",
  "/admin/users",
  "/admin/reservations",
  "/admin/vehicle-stickers",
  "/admin/parking",
  "/admin/announcements",
  "/admin/grievances",
  "/admin/community-groups",
  "/admin/business-hub",
  "/admin/logs"
];
  
  const isResident = residentPrefixes.some((prefix) => 
    location.pathname === prefix || location.pathname.startsWith(prefix + "/")
  );

  const isAdmin = adminPrefixes.some((prefix) =>
    location.pathname === prefix || location.pathname.startsWith(prefix + "/")
  );

  // Auth state listener to check for pending accounts 
=======
  const isResident = residentPrefixes.some(
    (prefix) =>
      location.pathname === prefix ||
      location.pathname.startsWith(prefix + "/")
  );

  /*
   * Global authentication/account-status listener.
   *
   * users.accountStatus controls whether the user can access the portal.
   * The old users.status field is kept only as a temporary fallback for
   * existing Firestore records created before the migration.
   */
>>>>>>> 5a7e11d94e79994449990a118b12042f61797243
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        /*
         * No authenticated Firebase user:
         * only redirect if they are trying to access a resident route.
         */
        if (!firebaseUser) {
          if (isResident) {
            navigate("/login", { replace: true });
          }
          return;
        }

        try {
          const userDocRef = doc(
            db,
            "users",
            firebaseUser.uid
          );

          const userDocSnap = await getDoc(
            userDocRef
          );

          /*
           * Firebase Auth account exists but the matching
           * Firestore user profile does not.
           */
          if (!userDocSnap.exists()) {
            await signOut(auth);

            if (
              location.pathname !== "/login" &&
              location.pathname !== "/signup"
            ) {
              navigate("/login", {
                replace: true,
              });
            }

            return;
          }

          const userData =
            userDocSnap.data();

          /*
           * New field: accountStatus
           * Old field: status (temporary compatibility fallback)
           */
          const accountStatus = String(
            userData.accountStatus ||
            userData.status ||
            "pending"
          ).toLowerCase();

          const role = String(
            userData.role ||
            "resident"
          ).toLowerCase();

          /*
           * Only ACTIVE accounts may stay signed in.
           *
           * pending, rejected, frozen, suspended, archived,
           * or any unknown status is blocked.
           */
          if (accountStatus !== "active") {
            await signOut(auth);

            if (
              location.pathname !== "/login" &&
              location.pathname !== "/signup"
            ) {
              navigate("/login", {
                replace: true,
              });
            }

            return;
          }

          /*
           * Active users who are still on a guest/auth route
           * are sent to their correct dashboard.
           */
          const isOnGuestRoute =
            location.pathname === "/" ||
            location.pathname === "/login" ||
            location.pathname === "/signup";

          if (isOnGuestRoute) {
            if (role === "admin") {
              navigate(
                "/admin-dashboard",
                { replace: true }
              );
            } else if (role === "resident") {
              navigate(
                "/resident-home",
                { replace: true }
              );
            }
          }
        } catch (error) {
          console.error(
            "Auth state check error:",
            error
          );

          /*
           * Avoid keeping a half-authenticated session
           * if the global profile check genuinely fails.
           */
          try {
            await signOut(auth);
          } catch (signOutError) {
            console.error(
              "Could not sign out after auth check error:",
              signOutError
            );
          }

          if (
            location.pathname !== "/login" &&
            location.pathname !== "/signup"
          ) {
            navigate("/login", {
              replace: true,
            });
          }
        }
      }
    );

    return () => unsubscribe();
  }, [
    navigate,
    location.pathname,
    isResident,
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased">
<<<<<<< HEAD
      {isAdmin ? (<AdminNavbar />) : isResident ? (<ResidentNavbar />) : (<GuestNavbar />)}
      
      <main className={`flex-grow pt-0 ${isAdmin ? "ml-20" : ""}`}>
=======
      {isResident ? (
        <ResidentNavbar />
      ) : (
        <GuestNavbar />
      )}

      <main className="flex-grow pt-0">
>>>>>>> 5a7e11d94e79994449990a118b12042f61797243
        <AppRoutes />
      </main>

      {!isAdmin && <Footer />}
    </div>
  );  
}

export default App;