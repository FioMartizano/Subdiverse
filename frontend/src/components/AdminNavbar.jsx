import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

import logo from "../assets/wwhs-logo.png";

import {LayoutDashboard,Users,Megaphone,CalendarDays,Car,ParkingCircle,AlertTriangle,UsersRound,Store,ClipboardList,LogOut,Menu,X,} from "lucide-react";

export default function AdminNavbar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin-dashboard" },
    { name: "Users", icon: Users, path: "/admin/users" },
    { name: "Announcements", icon: Megaphone, path: "/admin/announcements" },
    { name: "Reservations", icon: CalendarDays, path: "/admin/reservations" },
    { name: "Vehicle Stickers", icon: Car, path: "/admin/vehicle-stickers" },
    { name: "Parking", icon: ParkingCircle, path: "/admin/parking" },
    { name: "Grievances", icon: AlertTriangle, path: "/admin/grievances" },
    { name: "Community Groups", icon: UsersRound, path: "/admin/community-groups" },
    { name: "Business Hub", icon: Store, path: "/admin/business-hub" },
    { name: "Logs", icon: ClipboardList, path: "/admin/logs" },
  ];

  return (
    <>
      {/*HAMBURGER*/}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-[70] p-3 rounded-xl bg-[var(--color-admin-sidebar)] text-[var(--color-secondary)] shadow-xl"
      >
        <Menu size={24} />
      </button>

      {/*
        SIDEBAR
        `peer` lets App.jsx's <main> react to this element's hover state
        via lg:peer-hover:ml-64, so content shifts over on expand instead
        of the sidebar (fixed, z-50) floating on top of it.
      */}
      <aside className="hidden lg:block peer fixed top-0 left-0 h-screen w-20 hover:w-64 bg-[var(--color-admin-sidebar)] transition-all duration-300 overflow-hidden group z-50 border-r border-white/10 shadow-xl">
        <div className="h-full flex flex-col">

          {/*logo*/}
          <div className="px-3 py-6 border-b border-white/10">
            <div className="flex items-center justify-center group-hover:justify-start gap-3 transition-all duration-300">

              <img
                src={logo}
                alt="WWHS Logo"
                className="w-11 h-11 object-contain flex-shrink-0"
              />

              <div className="opacity-0 w-0 overflow-hidden group-hover:w-auto group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
                <h1 className="text-[var(--color-white)] font-bold text-lg">
                  Windward Hills
                </h1>

                <p className="text-xs text-[var(--color-secondary)]">
                  Admin Portal
                </p>
              </div>

            </div>
          </div>

          {/* NAVIGATION */}
          <nav className="flex-1 px-3 py-4 flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive
                        ? "bg-[var(--color-admin-hover)] border-l-4 border-[var(--color-secondary)]"
                        : "hover:bg-[var(--color-admin-hover)]"
                    }`
                  }
                >
                  <Icon size={24} className="text-[var(--color-secondary)] min-w-[24px]" />

                  <span className="text-[var(--color-white)] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300">
                    {item.name}
                  </span>
                </NavLink>
              );
            })}
          </nav>

          {/* LOGOUT */}
          <div className="border-t border-white/10 p-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-red-500/10 transition-all duration-300"
            >
              <LogOut size={24} className="text-[var(--color-secondary)] min-w-[24px]" />

              <span className="text-[var(--color-white)] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300">
                Logout
              </span>
            </button>
          </div>

        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-[80] lg:hidden"
            onClick={() => setMobileOpen(false)}
          />

          <aside className="fixed top-0 left-0 h-screen w-72 bg-[var(--color-admin-sidebar)] z-[90] shadow-2xl lg:hidden">
            <div className="h-full flex flex-col">

              {/* HEADER */}
              <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">

                <div className="flex items-center gap-3">
                  <img
                    src={logo}
                    alt="WWHS Logo"
                    className="w-11 h-11 object-contain"
                  />

                  <div>
                    <h1 className="text-white font-bold">
                      Windward Hills
                    </h1>

                    <p className="text-xs text-[var(--color-secondary)]">
                      Admin Portal
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-white"
                >
                  <X size={24} />
                </button>

              </div>

              {/* NAVIGATION */}
              <nav className="flex-1 p-4 flex flex-col gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                          isActive
                            ? "bg-[var(--color-admin-hover)] border-l-4 border-[var(--color-secondary)]"
                            : "hover:bg-[var(--color-admin-hover)]"
                        }`
                      }
                    >
                      <Icon size={24} className="text-[var(--color-secondary)]" />

                      <span className="text-white font-medium">
                        {item.name}
                      </span>
                    </NavLink>
                  );
                })}
              </nav>

              {/* LOGOUT */}
              <div className="border-t border-white/10 p-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-red-500/10 transition-all duration-300"
                >
                  <LogOut size={24} className="text-[var(--color-secondary)]" />

                  <span className="text-white font-medium">
                    Logout
                  </span>
                </button>
              </div>

            </div>
          </aside>
        </>
      )}
    </>
  );
}