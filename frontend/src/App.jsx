import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import AppRoutes from "./AppRoutes";
import Footer from "./components/Footer";
import GuestNavbar from "./components/GuestNavbar";
import ResidentNavbar from "./components/ResidentNavbar";

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
    "/vehicleSticker",
    "/parkingReservation",
    "/monthlyDues"
  ];
  
  const isResident = residentPrefixes.some((prefix) => 
    location.pathname === prefix || location.pathname.startsWith(prefix + "/")
  );

  // Auth state listener to check for pending accounts 
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {

        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (!userDocSnap.exists()) {

            await signOut(auth);
            if (!location.pathname.includes("/login") && !location.pathname.includes("/signup")) {
              navigate("/login");
            }
            return;
          }
          
          const userData = userDocSnap.data();
          const status = userData.status || 'pending';
          
          if (status === 'pending') {

            await signOut(auth);

            if (!location.pathname.includes("/login") && !location.pathname.includes("/signup")) {
              navigate("/login");
            }
            return;
          }

          if (status === 'approved') {
            const role = userData.role || 'resident';
            const isOnGuestRoute = location.pathname === "/" || 
                                   location.pathname === "/login" || 
                                   location.pathname === "/signup";
            
            if (isOnGuestRoute) {
              if (role === 'admin') {
                navigate("/admin-dashboard");
              } else if (role === 'resident') {
                navigate("/resident-home");
              }
            }
          }
        } catch (error) {
          console.error("Auth state check error:", error);

          await signOut(auth);
          if (!location.pathname.includes("/login") && !location.pathname.includes("/signup")) {
            navigate("/login");
          }
        }
      }
    });
    
    return () => unsubscribe();
  }, [navigate, location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased">
      {isResident ? <ResidentNavbar /> : <GuestNavbar />}
      
      <main className="flex-grow pt-0">
        <AppRoutes />
      </main>

      <Footer />
    </div>
  );
}

export default App;