import { useState, useEffect, useRef} from "react";
import { Link } from "react-router-dom";
import heroImg from "../assets/hero.png"; /*temporary, for logo*/

export default function GuestNavbar() {
  const [openOffices, setOpenOffices] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef(null);
  const closeUserTimer = useRef(null);

  useEffect(() => {
  const handleScroll = () => {
    setScrolled(window.scrollY > 50);
  };

  window.addEventListener("scroll", handleScroll);

  return () => window.removeEventListener("scroll", handleScroll);
}, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      scrolled
      ? "bg-white/90 backdrop-blur-md shadow-md"
      : "bg-transparent"
  }`}
>
      <div className="flex items-center justify-between px-12 py-2">

        {/*Logo natin here*/}
        <Link to="/">
          <img src={heroImg} /*temporary muna*/ alt="Logo" className="h-16 w-auto object-contain"/>
        </Link>

        {/*GUEST NAV*/}
        <div className="flex items-center gap-10">
          <Link
            to="/"
            className="text-black text-lg font-semibold hover-secondary-text transition-colors duration-300"
          >
            Home
          </Link>

          <Link
            to="/about"
            className="text-black text-lg font-semibold hover-secondary-text transition-colors duration-300"
          >
            About Us
          </Link>

    {/*DROPDOWN LIST, updated: will be closed automatically na*/}
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
            to="/guest_offices?section=hoa"
            onClick={() => setOpenOffices(false)}
            className="block px-5 py-3 hover-secondary-bg hover:text-white transition"
          >
            HOA
          </Link>

          <Link
            to="/guest_offices?section=grievance"
            onClick={() => setOpenOffices(false)}
            className="block px-5 py-3 hover-secondary-bg hover:text-white transition"
          >
            Grievance Committee
          </Link>

          <Link
            to="/guest_offices?section=elderly"
            onClick={() => setOpenOffices(false)}
            className="block px-5 py-3 hover-secondary-bg hover:text-white transition"
          >
            Elderly
          </Link>

          <Link
            to="/guest_offices?section=healthcare"
            onClick={() => setOpenOffices(false)}
            className="block px-5 py-3 hover-secondary-bg hover:text-white transition"
          >
            Healthcare
          </Link>

          <Link
            to="/guest_offices?section=parish"
            onClick={() => setOpenOffices(false)}
            className="block px-5 py-3 hover-secondary-bg hover:text-white transition"
          >
            Parish Church
          </Link>
        </div>
      )}
    </div>

    <Link
      to="/contact"
      className="text-black text-lg font-semibold hover-secondary-text transition-colors duration-300"
    >
      Contact Us
    </Link>

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
              className="ml-6 w-10 h-10 rounded-full bg-black flex items-center justify-center hover-secondary-bg transition-all duration-300"
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
                <Link
                  to="/login"
                  onClick={() => setOpenUser(false)}
                  className="block px-5 py-3 hover-secondary-bg hover:text-white transition"
                >
                  Log In
                </Link>

                <Link
                  to="/signup"
                  onClick={() => setOpenUser(false)}
                  className="block px-5 py-3 hover-secondary-bg hover:text-white transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}