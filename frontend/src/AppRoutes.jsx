import { Routes, Route } from "react-router-dom";

/*GUEST PAGES*/
import GuestHomePage from "./pages/Guest/GuestHomePage";
import AboutUs from "./pages/Guest/AboutUs";

/*try*/
import ReservationHome from "./pages/Resident/Reservation/ReservationHome";
import BasketballCourt from "./pages/Resident/Reservation/BasketballCourt";
import Clubhouse from "./pages/Resident/Reservation/Clubhouse";

import GuestHOA from "./pages/Guest/Offices/GuestHOA";

/*
import Contact from "./pages/Guest/Contact";
import Login from "./pages/Guest/Login";
import SignUp from "./pages/Guest/SignUp";
*/


/*GUEST/OFFICES*/
/*
import GuestHOA from "./pages/Guest/Offices/GuestHOA";
import GuestGrievance from "./pages/Guest/Offices/GuestGrievance";
import GuestElderly from "./pages/Guest/Offices/GuestElderly";
import GuestHealthcare from "./pages/Guest/Offices/GuestHealthcare";
import GuestParishChurch from "./pages/Guest/Offices/GuestParishChurch";
*/


/*RESIDENT PAGES*/
/*
import ResidentHomePage from "./pages/Resident/ResidentHomePage";
import Community from "./pages/Resident/Community";
import BusinessHub from "./pages/Resident/BusinessHub";
import VehicleSticker from "./pages/Resident/VehicleSticker";
import ParkingReservation from "./pages/Resident/ParkingReservation";
import MonthlyDues from "./pages/Resident/MonthlyDues";
*/


/*RESIDENT/OFFICES*/
/*
import HOA from "./pages/Resident/ResiOffices/HOA";
import Grievance from "./pages/Resident/ResiOffices/Grievance";
import Elderly from "./pages/Resident/ResiOffices/Elderly";
import Healthcare from "./pages/Resident/ResiOffices/Healthcare";
import ParishChurch from "./pages/Resident/ResiOffices/ParishChurch";
*/


/*RESIDENT/RESERVATION*/
/*
import ReservationHome from "./pages/Resident/Reservation/ReservationHome";
import Clubhouse from "./pages/Resident/Reservation/Clubhouse";
import SwimmingPool from "./pages/Resident/Reservation/SwimmingPool";
import BasketballCourt from "./pages/Resident/Reservation/BasketballCourt";
*/


function AppRoutes() {
  return (
    <Routes>

      {/* GUEST ROUTING */}

      <Route path="/" element={<GuestHomePage />} />

      <Route path="/about" element={<AboutUs />} />

      {/*try*/}
      <Route path="/reservation" element={<ReservationHome />} />
      <Route path="/reservation/court" element={<BasketballCourt />} />
      <Route path="/reservation/clubhouse" element={<Clubhouse />} />

      <Route path="/guest_hoa" element={<GuestHOA />} />


      {/*
      <Route path="/guest_hoa" element={<GuestHOA />} />
      <Route path="/guest_grievance" element={<GuestGrievance />} />
      <Route path="/guest_elderly" element={<GuestElderly />} />
      <Route path="/guest_healthcare" element={<GuestHealthcare />} />
      <Route path="/guest_parishchurch" element={<GuestParishChurch />} />

      <Route path="/contact" element={<Contact />} />

      <Route path="/login" element={<Login />} />

      <Route path="/signup" element={<SignUp />} />
      */}



      {/* RESIDENT ROUTING */}

      {/*
      <Route path="/resident-home" element={<ResidentHomePage />} />

      <Route path="/hoa" element={<HOA />} />

      <Route path="/grievance" element={<Grievance />} />

      <Route path="/elderly" element={<Elderly />} />

      <Route path="/healthcare" element={<Healthcare />} />

      <Route path="/parishchurch" element={<ParishChurch />} />


      <Route path="/community" element={<Community />} />

      <Route path="/businesshub" element={<BusinessHub />} />


      <Route path="/reservation" element={<ReservationHome />} />

      <Route path="/reservation/clubhouse" element={<Clubhouse />} />

      <Route path="/reservation/pool" element={<SwimmingPool />} />

      <Route path="/reservation/court" element={<BasketballCourt />} />


      <Route path="/vehicleSticker" element={<VehicleSticker />} />

      <Route path="/parkingReservation" element={<ParkingReservation />} />

      <Route path="/monthlyDues" element={<MonthlyDues />} />
      */}


    </Routes>
  );
}


export default AppRoutes;