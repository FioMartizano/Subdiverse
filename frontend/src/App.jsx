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
    location.pathname === prefix ||
    location.pathname.startsWith(prefix + "/")
  );

  const isAdmin = adminPrefixes.some((prefix) =>
    location.pathname === prefix ||
    location.pathname.startsWith(prefix + "/")
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        /*
         * No authenticated Firebase user:
         * only redirect if they are trying to access a resident route. ADD: OR ADMIN
         */
        if (!firebaseUser) {
          if (isResident || isAdmin) {
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
    isAdmin,
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased">
      {isAdmin ? (<AdminNavbar />) : isResident ? (<ResidentNavbar />) : (<GuestNavbar />)}

     
      <main className={`flex-grow pt-0 transition-all duration-300 ${isAdmin ? "lg:ml-20 lg:peer-hover:ml-64" : ""}`}>
        <AppRoutes />
      </main>

      {!isAdmin && <Footer />}
    </div>
  );
}

export default App;