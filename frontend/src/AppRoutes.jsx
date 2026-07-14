import { Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollOnTop";

/*Login and SignUp*/
import Login from "./pages/Auth/Login";
import SignUp from "./pages/Auth/SignUp";

/*GUEST PAGES*/
import GuestHomePage from "./pages/Guest/GuestHomePage";
import AboutUs from "./pages/Guest/AboutUs";
import OfficesAll from "./pages/Guest/Offices/OfficesAll";
import Contact from "./pages/Guest/Contact";


/*RESIDENT PAGES*/
import ResidentHomePage from "./pages/Resident/ResidentHomePage";
import BusinessHub from "./pages/Resident/BusinessHub";

import UserSettings from "./pages/Resident/UserSettings";

/*RESIDENT / OFFICES*/
import HOA from "./pages/Resident/ResiOffices/HOA";

import Grievance from "./pages/Resident/ResiOffices/Grievance";
import GrievanceComplaint from "./pages/Resident/ResiOffices/GrievanceComplaint"

import Elderly from "./pages/Resident/ResiOffices/Elderly";
import Healthcare from "./pages/Resident/ResiOffices/Healthcare";
import ParishChurch from "./pages/Resident/ResiOffices/ParishChurch";

/*SERVICES*/

import ReservationHome from "./pages/Resident/Reservation/ReservationHome";
import VehicleSticker from "./pages/Resident/VehicleSticker";
import ParkingReservation from "./pages/Resident/ParkingReservation";


/*SERVICES / RESIDENT / RESERVATION*/
import Clubhouse from "./pages/Resident/Reservation/Clubhouse";
import ClubhouseReservationForm from "./pages/Resident/Reservation/ClubhouseReservationForm";

import SwimmingPool from "./pages/Resident/Reservation/SwimmingPool";
import PoolReservationForm from "./pages/Resident/Reservation/PoolReservationForm";

//BBALL COURT FLOW
import BasketballCourt from "./pages/Resident/Reservation/BasketballCourt";
import BballReservationForm from "./pages/Resident/Reservation/BballReservationForm";


import Community from "./pages/Resident/Community";
import { Rotate3D } from "lucide-react";




/* PENDING PAGES */
/*RESIDENT PAGES*/
/*
import Community from "./pages/Resident/Community";
import MonthlyDues from "./pages/Resident/MonthlyDues";
*/



function AppRoutes() {
  return (
    <>
      <ScrollToTop />
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

        <Route path="/community" element={<Community />} />

        <Route path="/businesshub" element={<BusinessHub />} />

        <Route path="/userSettings" element={<UserSettings />} />

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
        <Route path="/reservation/clubhouse/reserve" element={<ClubhouseReservationForm />} />
      


        <Route path="/reservation/pool" element={<SwimmingPool />} />
        <Route path ="/reservation/pool/reserve" element={<PoolReservationForm />} />
        
        <Route path="/reservation/court" element={<BasketballCourt />} />
        <Route path="/reservation/court/reserve" element={<BballReservationForm />} />


        

      </Routes>
    </>
  );
}


export default AppRoutes;