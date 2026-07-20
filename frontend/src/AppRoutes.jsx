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
import GetStarted from "./components/GetStartedCards";  


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
import CommunityFeed from './pages/Resident/CommunityFeed';

import { Rotate3D } from "lucide-react";

/*ADMIN PAGES*/
import AdminDashboard from "./pages/Admin/Dashboard";
import AdminUsers from "./pages/Admin/Users";
import AdminAnnouncements from "./pages/Admin/Announcements";
import AdminReservations from "./pages/Admin/Reservations";
import AdminVehicleStickers from "./pages/Admin/VehicleStickers";
import AdminParking from "./pages/Admin/Parking";
import AdminCommunityGroups from "./pages/Admin/CommunityGroups";
import AdminGrievances from "./pages/Admin/Grievances";
import AdminBusinessHub from "./pages/Admin/BusinessHub";
import AdminLogs from "./pages/Admin/Logs";


/* PENDING PAGES */
/*RESIDENT PAGES*/
/*
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

        <Route path="/community/feed/:groupId" element={<CommunityFeed />} />

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

        {/*ADMIN ROUTING*/}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/announcements" element={<AdminAnnouncements />} />
        <Route path="/admin/reservations" element={<AdminReservations />} />
        <Route path="/admin/vehicle-stickers" element={<AdminVehicleStickers />} />
        <Route path="/admin/parking" element={<AdminParking />} />
        <Route path="/admin/grievances" element={<AdminGrievances />} />
        <Route path="/admin/community-groups" element={<AdminCommunityGroups />} />
        <Route path="/admin/business-hub" element={<AdminBusinessHub />} />
        <Route path="/admin/logs" element={<AdminLogs />} />
        
        

      </Routes>
    </>
  );
}


export default AppRoutes;