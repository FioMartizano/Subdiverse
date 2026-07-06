import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import heroImg from "../assets/hero.png"; /*temporary, for logo*/

export default function GuestNavbar() {
  const [openOffices, setOpenOffices] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const closeTimer = useRef(null);
  const closeUserTimer = useRef(null);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
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

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-md"
          : "bg-transparent"
      }`}>
        <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 py-2">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img 
              src={heroImg} 
              alt="Logo" 
              className="h-12 sm:h-14 md:h-16 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-10">
            <Link
              to="/"
              className="text-black text-base lg:text-lg font-semibold hover-secondary-text transition-colors duration-300"
            >
              Home
            </Link>

            <Link
              to="/about"
              className="text-black text-base lg:text-lg font-semibold hover-secondary-text transition-colors duration-300"
            >
              About Us
            </Link>

            {/* Offices Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => {
                if (closeTimer.current) {
                  clearTimeout(closeTimer.current);
                }
              }}
              onMouseLeave={() => {
                closeTimer.current = setTimeout(() => {
                  setOpenOffices(false);
                }, 200);
              }}
            >
              <button
                onClick={() => setOpenOffices(!openOffices)}
                className="flex items-center gap-2 text-black text-base lg:text-lg font-semibold hover-secondary-text transition-colors duration-300"
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
                    to="/guest_offices?section=hoa"
                    onClick={() => setOpenOffices(false)}
                    className="block px-4 lg:px-5 py-3 hover-secondary-bg hover:text-white transition text-sm lg:text-base"
                  >
                    HOA
                  </Link>

                  <Link
                    to="/guest_offices?section=grievance"
                    onClick={() => setOpenOffices(false)}
                    className="block px-4 lg:px-5 py-3 hover-secondary-bg hover:text-white transition text-sm lg:text-base"
                  >
                    Grievance Committee
                  </Link>

                  <Link
                    to="/guest_offices?section=elderly"
                    onClick={() => setOpenOffices(false)}
                    className="block px-4 lg:px-5 py-3 hover-secondary-bg hover:text-white transition text-sm lg:text-base"
                  >
                    Elderly
                  </Link>

                  <Link
                    to="/guest_offices?section=healthcare"
                    onClick={() => setOpenOffices(false)}
                    className="block px-4 lg:px-5 py-3 hover-secondary-bg hover:text-white transition text-sm lg:text-base"
                  >
                    Healthcare
                  </Link>

                  <Link
                    to="/guest_offices?section=parish"
                    onClick={() => setOpenOffices(false)}
                    className="block px-4 lg:px-5 py-3 hover-secondary-bg hover:text-white transition text-sm lg:text-base"
                  >
                    Parish Church
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/contact"
              className="text-black text-base lg:text-lg font-semibold hover-secondary-text transition-colors duration-300"
            >
              Contact Us
            </Link>

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
                className="ml-2 w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-black shadow-md flex items-center justify-center text-white hover-secondary-bg hover:text-white transition-all duration-300"
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
                <div className="absolute right-0 mt-3 w-40 lg:w-44 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                  <Link
                    to="/login"
                    onClick={() => setOpenUser(false)}
                    className="block px-4 lg:px-5 py-3 hover-secondary-bg hover:text-white transition text-sm lg:text-base"
                  >
                    Log In
                  </Link>

                  <Link
                    to="/signup"
                    onClick={() => setOpenUser(false)}
                    className="block px-4 lg:px-5 py-3 hover-secondary-bg hover:text-white transition text-sm lg:text-base"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Hamburger Menu Button - Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 sm:w-7 sm:h-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 sm:w-7 sm:h-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
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
            <div className="flex flex-col px-6 py-6 gap-4">
              {/* Close button inside menu */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="self-end p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="flex flex-col gap-4 mt-4">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-semibold hover-secondary-text transition-colors py-2 border-b border-gray-100"
                >
                  Home
                </Link>

                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-semibold hover-secondary-text transition-colors py-2 border-b border-gray-100"
                >
                  About Us
                </Link>

                {/* Offices Accordion */}
                <div className="border-b border-gray-100 py-2">
                  <button
                    onClick={() => setOpenOffices(!openOffices)}
                    className="flex justify-between items-center w-full text-lg font-semibold"
                  >
                    <span>Offices</span>
                    <span className={`transition-transform duration-300 ${
                      openOffices ? "rotate-180" : ""
                    }`}>
                      ▼
                    </span>
                  </button>

                  {openOffices && (
                    <div className="ml-4 mt-3 flex flex-col gap-3">
                      <Link
                        to="/guest_offices?section=hoa"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setOpenOffices(false);
                        }}
                        className="text-base hover-secondary-text transition-colors"
                      >
                        HOA
                      </Link>

                      <Link
                        to="/guest_offices?section=grievance"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setOpenOffices(false);
                        }}
                        className="text-base hover-secondary-text transition-colors"
                      >
                        Grievance Committee
                      </Link>

                      <Link
                        to="/guest_offices?section=elderly"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setOpenOffices(false);
                        }}
                        className="text-base hover-secondary-text transition-colors"
                      >
                        Elderly
                      </Link>

                      <Link
                        to="/guest_offices?section=healthcare"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setOpenOffices(false);
                        }}
                        className="text-base hover-secondary-text transition-colors"
                      >
                        Healthcare
                      </Link>

                      <Link
                        to="/guest_offices?section=parish"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setOpenOffices(false);
                        }}
                        className="text-base hover-secondary-text transition-colors"
                      >
                        Parish Church
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-semibold hover-secondary-text transition-colors py-2 border-b border-gray-100"
                >
                  Contact Us
                </Link>

                <hr className="my-2" />

                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-semibold hover-secondary-text transition-colors py-2"
                >
                  Log In
                </Link>

                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-semibold hover-secondary-text transition-colors py-2"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add animation keyframes */}
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