import { useLocation } from "react-router-dom";
import AppRoutes from "./AppRoutes";

/* COMPONENTS */
import Footer from "./components/Footer";
import GuestNavbar from "./components/GuestNavbar";
import ResidentNavbar from "./components/ResidentNavbar";

function App() {
  const location = useLocation();

  const residentPages = [
    "/resident-home",
    "/hoa",
    "/grievance",
    "/elderly",
    "/healthcare",
    "/parishchurch",
    "/community",
    "/businesshub",
    "/reservation",
    "/vehicleSticker",
    "/parkingReservation",
    "/monthlyDues",
  ];

  const isResident =
    residentPages.some((path) => location.pathname.startsWith(path));

  return (
    <div className="min-h-screen flex flex-col">
      {isResident ? <ResidentNavbar /> : <GuestNavbar />}

      <main className="flex-grow pt-20">
        <AppRoutes />
      </main>

      <Footer />
    </div>
  );
}

export default App;