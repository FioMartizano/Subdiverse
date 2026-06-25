import { useState } from "react";
import { Link } from "react-router-dom";
import heroImg from "../assets/hero.png"; /*temporary, for logo*/

export default function GuestNavbar() {
  const [openOffices, setOpenOffices] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-transparent">
      <div className="flex items-center justify-between px-12 py-2">

        {/*Logo natin here*/}
        <Link to="/">
          <img src={heroImg} /*temporary muna*/ alt="Logo" className="h-16 w-auto object-contain"/> </Link>

        {/*GUEST NAV*/}
        <div className="flex items-center gap-10">
          <Link to="/" className="text-black text-lg font-semibold hover:text-[#347433] transition-colors duration-300"> Home </Link>

          <Link to="/about" className="text-black text-lg font-semibold hover:text-[#347433] transition-colors duration-300"> About Us</Link>

          {/*DROPDOWN LIST*/}
          <div className="relative">
            <button onClick={() => setOpenOffices(!openOffices)} className="flex items-center gap-2 text-black text-lg font-semibold hover:text-[#347433] transition-colors duration-300"> Offices
              <span className={`transition-transform duration-300 ${ openOffices ? "rotate-180" : ""}`}>▼</span>
            </button>

            {openOffices && (
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                <Link to="/HOA" onClick={() => setOpenOffices(false)}className="block px-5 py-3 hover:bg-[#347433] hover:text-white transition">HOA</Link>

                <Link to="/GrievanceCommittee" onClick={() => setOpenOffices(false)} className="block px-5 py-3 hover:bg-[#347433] hover:text-white transition">Grievance Committee</Link>

                <Link to="/Elderly" onClick={() => setOpenOffices(false)}className="block px-5 py-3 hover:bg-[#347433] hover:text-white transition">Elderly</Link>

                <Link to="/Healthcare" onClick={() => setOpenOffices(false)} className="block px-5 py-3 hover:bg-[#347433] hover:text-white transition">Healthcare</Link>

                <Link to="/ParishChurch" onClick={() => setOpenOffices(false)}className="block px-5 py-3 hover:bg-[#347433] hover:text-white transition">Parish Church</Link>

              </div>
            )}
          </div>

          <Link to="/Contact" className="text-black text-lg font-semibold hover:text-[#347433] transition-colors duration-300">Contact Us</Link>

          {/*ICON*/}
          <button className="ml-6 w-10 h-10 rounded-full bg-black flex items-center justify-center hover:bg-[#347433] transition-all duration-300">
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

        </div>
      </div>
    </nav>
  );
}