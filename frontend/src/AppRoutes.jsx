import { Routes, Route } from "react-router-dom";

/*Login and SignUp*/
import Login from "./pages/Auth/Login";
import SignUp from "./pages/Auth/SignUp";

/*GUEST PAGES*/
import GuestHomePage from "./pages/Guest/GuestHomePage";
import AboutUs from "./pages/Guest/AboutUs";
import OfficesAll from "./pages/Guest/Offices/OfficesAll";
import Contact from "./pages/Guest/Contact";


/*RESIDENT PAGES*/
import BusinessHub from "./pages/Resident/BusinessHub";

/*RESIDENT / OFFICES*/
import HOA from "./pages/Resident/ResiOffices/HOA";

import Grievance from "./pages/Resident/ResiOffices/Grievance";
import GrievanceComplaint from "./pages/Resident/ResiOffices/GrievanceComplaint"

import Elderly from "./pages/Resident/ResiOffices/Elderly";
import Healthcare from "./pages/Resident/ResiOffices/Healthcare";
import ParishChurch from "./pages/Resident/ResiOffices/ParishChurch";

/*SERVICES*/
import ResidentHomePage from "./pages/Resident/ResidentHomePage";
import VehicleSticker from "./pages/Resident/VehicleSticker";
import ParkingReservation from "./pages/Resident/ParkingReservation";


/*SERVICES / RESIDENT / RESERVATION*/
import ReservationHome from "./pages/Resident/Reservation/ReservationHome";
import BasketballCourt from "./pages/Resident/Reservation/BasketballCourt";
import Clubhouse from "./pages/Resident/Reservation/Clubhouse";
import SwimmingPool from "./pages/Resident/Reservation/SwimmingPool";


/* PENDING PAGES */
/*RESIDENT PAGES*/
/*
import Community from "./pages/Resident/Community";
import MonthlyDues from "./pages/Resident/MonthlyDues";
*/



function AppRoutes() {
  return (
    <Routes>

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<SignUp />} />

      {/* GUEST ROUTING */}

        <Route path="/" element={<GuestHomePage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/guest_offices" element={<OfficesAll />} />
        <Route path="/contact" element={<Contact />} />


        {/*RESIDENT ROUTING*/}

        <Route path="/resident-home" element={<ResidentHomePage />} />

        {/*<Route path="/community" element={<Community />} />*/}

        <Route path="/businesshub" element={<BusinessHub />} />

        {/*RESIDENT / OFFICES*/}
        <Route path="/hoa" element={<HOA />} />

        <Route path="/grievance" element={<Grievance />} />
          <Route path="/grievanceComplaint" element={<GrievanceComplaint />} />

        <Route path="/elderly" element={<Elderly />} />
        <Route path="/healthcare" element={<Healthcare />} />
        <Route path="/parishchurch" element={<ParishChurch />} />


        {/*SERVICES*/}
        <Route path="/reservation" element={<ReservationHome />} />
        <Route path="/vehicleSticker" element={<VehicleSticker />} />
        <Route path="/parkingReservation" element={<ParkingReservation />} />
      {/*<Route path="/monthlyDues" element={<MonthlyDues />} />*/}


        {/*SERVICES / RESIDENT / RESERVATION*/}
        <Route path="/reservation/clubhouse" element={<Clubhouse />} />
        <Route path="/reservation/pool" element={<SwimmingPool />} />
        <Route path="/reservation/court" element={<BasketballCourt />} />

    </Routes>
  );
}


export default AppRoutes;