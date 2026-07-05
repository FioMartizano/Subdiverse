import { useState , useEffect, useRef } from "react";
import { Link , useNavigate, useLocation } from "react-router-dom";
import { Bell, ArrowLeft } from "lucide-react";
import heroImg from "../assets/hero.png"; /*temporary, for logo*/

import { signOut } from "firebase/auth";
import { auth } from "../firebase"; 

export default function ResidentNavbar() {
  const [openOffices, setOpenOffices] = useState(false);
  const [openServices, setOpenServices] = useState(false);
  const [openReservation, setOpenReservation] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate(); //for logout function
  const location = useLocation(); //for back button function then logo if sa HOME page

//dropdown timer set for these:
  const closeOfficeTimer = useRef(null);
  const closeServicesTimer = useRef(null);
  const closeReservationTimer = useRef(null);
  const closeUserTimer = useRef(null);

  const notificationCount = 0; // Temporary

useEffect(() => {
  const handleScroll = () => {
    setScrolled(window.scrollY > 50);
  };

  window.addEventListener("scroll", handleScroll);

  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}, []);

const handleLogout = async () => {
  try {
    await signOut(auth);
    setOpenUser(false);
    navigate("/");
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

return (
  <nav
    className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      scrolled
        ? "bg-white/90 backdrop-blur-md shadow-md"
        : "bg-transparent"
    }`}
  >
  
      <div className="flex items-center justify-between px-12 py-2">

<div className="h-16 flex items-center">
  {location.pathname === "/resident-home" ? (
    <img
      src={heroImg}
      alt="Logo"
      className="h-16 w-auto object-contain"
    />
  ) : (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center gap-2 text-black font-semibold hover-secondary-text transition-colors duration-300"
    >
      <ArrowLeft size={28} />
      <span className="text-lg">Back</span>
    </button>
  )}
</div>

        {/*RESIDENT NAV*/}
        <div className="flex items-center gap-10">

          <Link
            to="/resident-home"
            className="text-black text-lg font-semibold hover-secondary-text transition-colors duration-300"
          >
            Home
          </Link>

          {/*DROPDOWN LIST (for Offices)*/}
          <div
              className="relative"
              onMouseEnter={() => {
                if (closeOfficeTimer.current) {
                  clearTimeout(closeOfficeTimer.current);
                }
              }}
              onMouseLeave={() => {
                closeOfficeTimer.current = setTimeout(() => {
                  setOpenOffices(false);
                }, 200);
              }}
            >
            <button
              onClick={() => setOpenOffices(!openOffices)}
              className="flex items-center gap-2 text-black text-lg font-semibold hover-secondary-text transition-colors duration-300"
            >
              Offices
              <span
                className={`transition-transform duration-300 ${
                  openOffices ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>

            {openOffices && (
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">

                <Link
                  to="/hoa"
                  onClick={() => setOpenOffices(false)}
                  className="block px-5 py-3 hover-secondary-bg hover:text-white transition"
                >
                  HOA
                </Link>

                <Link
                  to="/grievance"
                  onClick={() => setOpenOffices(false)}
                  className="block px-5 py-3 hover-secondary-bg hover:text-white transition"
                >
                  Grievance Committee
                </Link>

                <Link
                  to="/elderly"
                  onClick={() => setOpenOffices(false)}
                  className="block px-5 py-3 hover-secondary-bg hover:text-white transition"
                >
                  Elderly
                </Link>

                <Link
                  to="/healthcare"
                  onClick={() => setOpenOffices(false)}
                  className="block px-5 py-3 hover-secondary-bg hover:text-white transition"
                >
                  Healthcare
                </Link>

                <Link
                  to="/parishchurch"
                  onClick={() => setOpenOffices(false)}
                  className="block px-5 py-3 hover-secondary-bg hover:text-white transition"
                >
                  Parish Church
                </Link>

              </div>
            )}
          </div>

          <Link
            to="/community"
            className="text-black text-lg font-semibold hover-secondary-text transition-colors duration-300"
          >
            Community
          </Link>

          {/*DROPDOWN LIST for Services*/}
          <div
              className="relative"
              onMouseEnter={() => {
                if (closeServicesTimer.current) {
                  clearTimeout(closeServicesTimer.current);
                }
              }}
              onMouseLeave={() => {
                closeServicesTimer.current = setTimeout(() => {
                  setOpenServices(false);
                  setOpenReservation(false);
                }, 200);
              }}
            >
            <button
              onClick={() => setOpenServices(!openServices)}
              className="flex items-center gap-2 text-black text-lg font-semibold hover-secondary-text transition-colors duration-300"
            >
              Services
              <span
                className={`transition-transform duration-300 ${
                  openServices ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>

            {openServices && (
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-visible">

                  <div
                    className="relative"
                    onMouseEnter={() => {
                      if (closeReservationTimer.current) {
                        clearTimeout(closeReservationTimer.current);
                      }
                      setOpenReservation(true);
                    }}
                    onMouseLeave={() => {
                      closeReservationTimer.current = setTimeout(() => {
                        setOpenReservation(false);
                      }, 200);
                    }}
                  >

                  <Link
                    to="/reservation"
                    className="flex items-center justify-between px-5 py-3 hover-secondary-bg hover:text-white transition"
                  >
                    Reservation
                    <span>▶</span>
                  </Link>

                  {/*DROPDOWN LIST for Reservation*/}
                  {openReservation && (
                    <div className="absolute top-0 left-full ml-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">

                      <Link
                        to="/reservation/clubhouse"
                        className="block px-5 py-3 hover-secondary-bg hover:text-white transition"
                      >
                        Clubhouse
                      </Link>

                      <Link
                        to="/reservation/pool"
                        className="block px-5 py-3 hover-secondary-bg hover:text-white transition"
                      >
                        Swimming Pool
                      </Link>

                      <Link
                        to="/reservation/court"
                        className="block px-5 py-3 hover-secondary-bg hover:text-white transition"
                      >
                        Basketball Court
                      </Link>

                    </div>
                  )}
                </div>
                                <Link
                  to="/vehicleSticker"
                  onClick={() => setOpenServices(false)}
                  className="block px-5 py-3 hover-secondary-bg hover:text-white transition"
                >
                  Vehicle Sticker
                </Link>

                <Link
                  to="/parkingReservation"
                  onClick={() => setOpenServices(false)}
                  className="block px-5 py-3 hover-secondary-bg hover:text-white transition"
                >
                  Parking Reservation
                </Link>

                <Link
                  to="/monthlyDues"
                  onClick={() => setOpenServices(false)}
                  className="block px-5 py-3 hover-secondary-bg hover:text-white transition"
                >
                  Monthly Dues
                </Link>

              </div>
            )}
          </div>

          <Link
            to="/businesshub"
            className="text-black text-lg font-semibold hover-secondary-text transition-colors duration-300"
          >
            BusinessHub
          </Link>

          {/*NOTIFICATION*/}
          <button
            className="relative ml-4 w-10 h-10 rounded-full bg-black shadow-md flex items-center justify-center text-white hover-secondary-bg hover:text-white transition-all duration-300"
          >
            <Bell size={20} />

            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-semibold">
                {notificationCount}
              </span>
            )}
          </button>

          {/*ICON*/}
          <div
              className="relative"
              onMouseEnter={() => {
                if (closeUserTimer.current) {
                  clearTimeout(closeUserTimer.current);
                }
              }}
              onMouseLeave={() => {
                closeUserTimer.current = setTimeout(() => {
                  setOpenUser(false);
                }, 200);
              }}
            >
            <button
              onClick={() => setOpenUser(!openUser)}
              className="ml-2 w-10 h-10 rounded-full bg-black shadow-md flex items-center justify-center text-white hover-secondary-bg hover:text-white transition-all duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-5 h-5 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0115 0"
                />
              </svg>
            </button>

            {openUser && (
              <div className="absolute right-0 mt-3 w-44 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">

              <button
                onClick={handleLogout}
                className="block w-full text-left px-5 py-3 hover-secondary-bg hover:text-white transition"
              >
                Logout
              </button>

              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}