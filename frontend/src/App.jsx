import { useLocation } from "react-router-dom";
import AppRoutes from "./AppRoutes";

/* COMPONENTS */
import Footer from "./components/Footer";
import GuestNavbar from "./components/GuestNavbar";
import ResidentNavbar from "./components/ResidentNavbar";

function App() {
  const location = useLocation();

  const authPages = ["/login", "/signup"];
  const isAuthPage = authPages.includes(location.pathname);

  const residentPrefixes = [
    "/resident-home",
    "/reservation",
    "/businesshub",
    "/hoa",
    "/grievance",
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

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased">
      <GuestNavbar />

      <main className={`flex-grow ${isAuthPage ? "pt-0" : "pt-20"}`}>
        <AppRoutes />
      </main>

      <Footer />
    </div>
  );
}

export default App;