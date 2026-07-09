import { useLocation } from "react-router-dom";
import AppRoutes from "./AppRoutes";

import Footer from "./components/Footer";
import GuestNavbar from "./components/GuestNavbar";
import ResidentNavbar from "./components/ResidentNavbar";

function App() {
  const location = useLocation();

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