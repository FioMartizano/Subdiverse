import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Bell, ArrowLeft, X, Menu, Settings } from "lucide-react";
import heroImg from "../assets/hero.png"; /*temporary, for logo*/

import { signOut } from "firebase/auth";
import { auth } from "../firebase"; 

export default function ResidentNavbar() {
  const [openOffices, setOpenOffices] = useState(false);
  const [openServices, setOpenServices] = useState(false);
  const [openReservation, setOpenReservation] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileOfficesOpen, setMobileOfficesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileReservationOpen, setMobileReservationOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Dropdown timers
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

  // Close mobile menu when window resizes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setOpenUser(false);
      setMobileMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-md shadow-md"
            : "bg-transparent"
        }`}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 py-2">
          {/* Left Section - Logo or Back Button */}
          <div className="h-12 sm:h-14 md:h-16 flex items-center flex-shrink-0">
            {location.pathname === "/resident-home" ? (
              <img
                src={heroImg}
                alt="Logo"
                className="h-12 sm:h-14 md:h-16 w-auto object-contain"
              />
            ) : (
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 sm:gap-2 text-black font-semibold hover-secondary-text transition-colors duration-300"
              >
                <ArrowLeft size={24} className="sm:w-6 sm:h-6 md:w-7 md:h-7" />
                <span className="text-base sm:text-lg">Back</span>
              </button>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 lg:gap-10">
            <Link
              to="/resident-home"
              className="text-black text-base lg:text-lg font-semibold hover-secondary-text transition-colors duration-300 whitespace-nowrap"
            >
              Home
            </Link>

            {/* Offices Dropdown */}
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
                className="flex items-center gap-1 lg:gap-2 text-black text-base lg:text-lg font-semibold hover-secondary-text transition-colors duration-300 whitespace-nowrap"
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
                <div className="absolute right-0 mt-3 w-56 lg:w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                  <Link
                    to="/hoa"
                    onClick={() => setOpenOffices(false)}
                    className="block px-4 lg:px-5 py-3 hover-secondary-bg hover:text-white transition text-sm lg:text-base"
                  >
                    HOA
                  </Link>

                  <Link
                    to="/grievance"
                    onClick={() => setOpenOffices(false)}
                    className="block px-4 lg:px-5 py-3 hover-secondary-bg hover:text-white transition text-sm lg:text-base"
                  >
                    Grievance Committee
                  </Link>

                  <Link
                    to="/elderly"
                    onClick={() => setOpenOffices(false)}
                    className="block px-4 lg:px-5 py-3 hover-secondary-bg hover:text-white transition text-sm lg:text-base"
                  >
                    Elderly
                  </Link>

                  <Link
                    to="/healthcare"
                    onClick={() => setOpenOffices(false)}
                    className="block px-4 lg:px-5 py-3 hover-secondary-bg hover:text-white transition text-sm lg:text-base"
                  >
                    Healthcare
                  </Link>

                  <Link
                    to="/parishchurch"
                    onClick={() => setOpenOffices(false)}
                    className="block px-4 lg:px-5 py-3 hover-secondary-bg hover:text-white transition text-sm lg:text-base"
                  >
                    Parish Church
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/community"
              className="text-black text-base lg:text-lg font-semibold hover-secondary-text transition-colors duration-300 whitespace-nowrap"
            >
              Community
            </Link>

            {/* Services Dropdown */}
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
                className="flex items-center gap-1 lg:gap-2 text-black text-base lg:text-lg font-semibold hover-secondary-text transition-colors duration-300 whitespace-nowrap"
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
                <div className="absolute right-0 mt-3 w-56 lg:w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-visible">
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
                      className="flex items-center justify-between px-4 lg:px-5 py-3 hover-secondary-bg hover:text-white transition text-sm lg:text-base"
                    >
                      Reservation
                      <span>▶</span>
                    </Link>

                    {openReservation && (
                      <div className="absolute top-0 left-full ml-1 w-48 lg:w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                        <Link
                          to="/reservation/clubhouse"
                          className="block px-4 lg:px-5 py-3 hover-secondary-bg hover:text-white transition text-sm lg:text-base"
                        >
                          Clubhouse
                        </Link>

                        <Link
                          to="/reservation/pool"
                          className="block px-4 lg:px-5 py-3 hover-secondary-bg hover:text-white transition text-sm lg:text-base"
                        >
                          Swimming Pool
                        </Link>

                        <Link
                          to="/reservation/court"
                          className="block px-4 lg:px-5 py-3 hover-secondary-bg hover:text-white transition text-sm lg:text-base"
                        >
                          Basketball Court
                        </Link>
                      </div>
                    )}
                  </div>

                  <Link
                    to="/vehicleSticker"
                    onClick={() => setOpenServices(false)}
                    className="block px-4 lg:px-5 py-3 hover-secondary-bg hover:text-white transition text-sm lg:text-base"
                  >
                    Vehicle Sticker
                  </Link>

                  <Link
                    to="/parkingReservation"
                    onClick={() => setOpenServices(false)}
                    className="block px-4 lg:px-5 py-3 hover-secondary-bg hover:text-white transition text-sm lg:text-base"
                  >
                    Parking Reservation
                  </Link>

                  <Link
                    to="/monthlyDues"
                    onClick={() => setOpenServices(false)}
                    className="block px-4 lg:px-5 py-3 hover-secondary-bg hover:text-white transition text-sm lg:text-base"
                  >
                    Monthly Dues
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/businesshub"
              className="text-black text-base lg:text-lg font-semibold hover-secondary-text transition-colors duration-300 whitespace-nowrap"
            >
              BusinessHub
            </Link>

            {/* Notification */}
            <button
              className="relative w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-black shadow-md flex items-center justify-center text-white hover-secondary-bg hover:text-white transition-all duration-300 flex-shrink-0"
            >
              <Bell size={18} className="lg:w-5 lg:h-5" />

              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-red-500 text-white text-[8px] lg:text-[10px] flex items-center justify-center font-semibold">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* User Icon */}
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
                className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-black shadow-md flex items-center justify-center text-white hover-secondary-bg hover:text-white transition-all duration-300 flex-shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-4 h-4 lg:w-5 lg:h-5 text-white"
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
                <div className="absolute right-0 mt-3 w-48 lg:w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                  <Link
                    to="/userSettings"
                    onClick={() => setOpenUser(false)}
                    className="flex items-center gap-3 px-4 lg:px-5 py-3 hover-secondary-bg hover:text-white transition text-sm lg:text-base"
                  >
                    <Settings size={17} />
                    User Settings
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 lg:px-5 py-3 hover-secondary-bg hover:text-white transition text-sm lg:text-base border-t border-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X size={24} className="sm:w-6 sm:h-6" />
            ) : (
              <Menu size={24} className="sm:w-6 sm:h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute top-0 right-0 h-full w-4/5 max-w-sm bg-white shadow-2xl overflow-y-auto animate-slide-in">
            <div className="flex flex-col px-6 py-6 gap-2">
              {/* Close button */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="self-end p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>

              <div className="flex flex-col gap-3 mt-4">
                <Link
                  to="/resident-home"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-semibold hover-secondary-text transition-colors py-2 border-b border-gray-100"
                >
                  Home
                </Link>

                {/* Offices Accordion */}
                <div className="border-b border-gray-100 py-2">
                  <button
                    onClick={() => setMobileOfficesOpen(!mobileOfficesOpen)}
                    className="flex justify-between items-center w-full text-lg font-semibold"
                  >
                    <span>Offices</span>
                    <span className={`transition-transform duration-300 ${
                      mobileOfficesOpen ? "rotate-180" : ""
                    }`}>
                      ▼
                    </span>
                  </button>

                  {mobileOfficesOpen && (
                    <div className="ml-4 mt-3 flex flex-col gap-3">
                      <Link
                        to="/hoa"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setMobileOfficesOpen(false);
                        }}
                        className="text-base hover-secondary-text transition-colors"
                      >
                        HOA
                      </Link>

                      <Link
                        to="/grievance"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setMobileOfficesOpen(false);
                        }}
                        className="text-base hover-secondary-text transition-colors"
                      >
                        Grievance Committee
                      </Link>

                      <Link
                        to="/elderly"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setMobileOfficesOpen(false);
                        }}
                        className="text-base hover-secondary-text transition-colors"
                      >
                        Elderly
                      </Link>

                      <Link
                        to="/healthcare"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setMobileOfficesOpen(false);
                        }}
                        className="text-base hover-secondary-text transition-colors"
                      >
                        Healthcare
                      </Link>

                      <Link
                        to="/parishchurch"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setMobileOfficesOpen(false);
                        }}
                        className="text-base hover-secondary-text transition-colors"
                      >
                        Parish Church
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  to="/community"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-semibold hover-secondary-text transition-colors py-2 border-b border-gray-100"
                >
                  Community
                </Link>

                {/* Services Accordion */}
                <div className="border-b border-gray-100 py-2">
                  <button
                    onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                    className="flex justify-between items-center w-full text-lg font-semibold"
                  >
                    <span>Services</span>
                    <span className={`transition-transform duration-300 ${
                      mobileServicesOpen ? "rotate-180" : ""
                    }`}>
                      ▼
                    </span>
                  </button>

                  {mobileServicesOpen && (
                    <div className="ml-4 mt-3 flex flex-col gap-3">
                      {/* Reservation Sub-accordion */}
                      <div>
                        <button
                          onClick={() => setMobileReservationOpen(!mobileReservationOpen)}
                          className="flex justify-between items-center w-full text-base hover-secondary-text transition-colors"
                        >
                          <span>Reservation</span>
                          <span className={`transition-transform duration-300 ${
                            mobileReservationOpen ? "rotate-180" : ""
                          }`}>
                            ▼
                          </span>
                        </button>

                        {mobileReservationOpen && (
                          <div className="ml-4 mt-2 flex flex-col gap-2">
                            <Link
                              to="/reservation/clubhouse"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setMobileServicesOpen(false);
                                setMobileReservationOpen(false);
                              }}
                              className="text-sm hover-secondary-text transition-colors"
                            >
                              Clubhouse
                            </Link>

                            <Link
                              to="/reservation/pool"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setMobileServicesOpen(false);
                                setMobileReservationOpen(false);
                              }}
                              className="text-sm hover-secondary-text transition-colors"
                            >
                              Swimming Pool
                            </Link>

                            <Link
                              to="/reservation/court"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setMobileServicesOpen(false);
                                setMobileReservationOpen(false);
                              }}
                              className="text-sm hover-secondary-text transition-colors"
                            >
                              Basketball Court
                            </Link>
                          </div>
                        )}
                      </div>

                      <Link
                        to="/vehicleSticker"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setMobileServicesOpen(false);
                        }}
                        className="text-base hover-secondary-text transition-colors"
                      >
                        Vehicle Sticker
                      </Link>

                      <Link
                        to="/parkingReservation"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setMobileServicesOpen(false);
                        }}
                        className="text-base hover-secondary-text transition-colors"
                      >
                        Parking Reservation
                      </Link>

                      <Link
                        to="/monthlyDues"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setMobileServicesOpen(false);
                        }}
                        className="text-base hover-secondary-text transition-colors"
                      >
                        Monthly Dues
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  to="/businesshub"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-semibold hover-secondary-text transition-colors py-2 border-b border-gray-100"
                >
                  BusinessHub
                </Link>

                <hr className="my-2" />

                <Link
                  to="/userSettings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-lg font-semibold hover-secondary-text transition-colors py-2"
                >
                  <Settings size={20} />
                  User Settings
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-lg font-semibold hover-secondary-text transition-colors py-2 text-left"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animation styles */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}