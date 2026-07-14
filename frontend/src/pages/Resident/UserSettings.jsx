import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  CalendarDays,
  Camera,
  Car,
  Check,
  ChevronRight,
  Clock3,
  Eye,
  EyeOff,
  FileText,
  Home,
  KeyRound,
  Mail,
  MapPin,
  ParkingCircle,
  Phone,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";

const INITIAL_PROFILE = {
  firstName: "Fiona",
  middleName: "Gregorio",
  lastName: "Martizano",
  suffix: "",
  contactNumber: "+639284934204",
  emergencyContactNumber: "+639127482349",
  email: "artizaano@gmail.com",
  residentCategory: "owner",
  block: "Block 71",
  lot: "Lot 5",
  street: "Timothy Street",
  phase: "Phase D",
  verificationStatus: "pending",
};

const SAMPLE_NOTIFICATIONS = [
  {
    id: 1,
    type: "reservation",
    title: "Reservation approved",
    message:
      "Your basketball court reservation for July 18, 2026 from 7:00 PM to 8:00 PM has been approved.",
    time: "10 minutes ago",
    isRead: false,
  },
  {
    id: 2,
    type: "parking",
    title: "Parking request received",
    message:
      "Your visitor parking request has been submitted and is currently pending review.",
    time: "1 hour ago",
    isRead: false,
  },
  {
    id: 3,
    type: "sticker",
    title: "Visit the HOA office",
    message:
      "Your vehicle sticker application is ready for office verification. Please bring the original vehicle documents.",
    time: "Yesterday",
    isRead: false,
  },
  {
    id: 4,
    type: "announcement",
    title: "Scheduled water interruption",
    message:
      "Water service will be temporarily unavailable on July 17 from 9:00 AM to 1:00 PM.",
    time: "Yesterday",
    isRead: true,
  },
  {
    id: 5,
    type: "dues",
    title: "Monthly dues reminder",
    message:
      "Your monthly HOA dues for July are due on July 20, 2026.",
    time: "2 days ago",
    isRead: true,
  },
];

const SAMPLE_SERVICES = [
  {
    id: 1,
    type: "reservation",
    title: "Basketball Court Reservation",
    reference: "RES-2026-0012",
    date: "July 18, 2026",
    detail: "7:00 PM - 8:00 PM",
    status: "approved",
  },
  {
    id: 2,
    type: "parking",
    title: "Parking Reservation",
    reference: "PRK-2026-0008",
    date: "July 20, 2026",
    detail: "Visitor parking slot",
    status: "pending",
  },
  {
    id: 3,
    type: "sticker",
    title: "Vehicle Sticker Application",
    reference: "STK-2026-0004",
    date: "Submitted July 14, 2026",
    detail: "Toyota Vios • ABC 1234",
    status: "for-office-verification",
  },
];

const SETTINGS_TABS = [
  { id: "account", label: "Account", Icon: User },
  { id: "notifications", label: "Notifications", Icon: Bell },
  { id: "residential", label: "Residential", Icon: Home },
  { id: "services", label: "My Services", Icon: FileText },
  { id: "password", label: "Password", Icon: KeyRound },
];

const STATUS_STYLES = {
  pending: {
    label: "Pending",
    className: "bg-pending-bg text-pending-text",
  },
  approved: {
    label: "Approved",
    className: "bg-approved-bg text-approved-text",
  },
  rejected: {
    label: "Rejected",
    className: "bg-rejected-bg text-rejected-text",
  },
  completed: {
    label: "Completed",
    className: "bg-accent text-primary",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-slate-100 text-slate-600",
  },
  "for-office-verification": {
    label: "For Office Verification",
    className: "bg-pending-bg text-pending-text",
  },
};

const SERVICE_ICONS = {
  reservation: CalendarDays,
  parking: ParkingCircle,
  sticker: Car,
};

const NOTIFICATION_ICONS = {
  reservation: CalendarDays,
  parking: ParkingCircle,
  sticker: Car,
  announcement: Bell,
  dues: FileText,
};

function SettingsField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  readOnly = false,
  note = "",
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold text-slate-700">
        {label}

        {note && (
          <span className="text-[10px] font-normal text-slate-400">{note}</span>
        )}
      </span>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`h-11 w-full rounded-lg border px-3.5 text-sm outline-none transition ${
          readOnly
            ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-500"
            : "border-slate-200 bg-white text-slate-800 focus:border-primary focus:ring-3 focus:ring-primary/10"
        }`}
      />
    </label>
  );
}

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || {
    label: status,
    className: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${style.className}`}
    >
      {style.label}
    </span>
  );
}

function ContentHeader({ title, description }) {
  return (
    <div className="border-b border-slate-100 pb-6">
      <h2 className="text-xl font-bold text-slate-900 md:text-2xl">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
        {description}
      </p>
    </div>
  );
}

function UserSettings() {
  const [activeTab, setActiveTab] = useState("account");

  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [savedProfile, setSavedProfile] = useState(INITIAL_PROFILE);

  const [notifications, setNotifications] = useState(
    SAMPLE_NOTIFICATIONS
  );

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");

  const fullName = useMemo(
    () =>
      [
        profile.firstName,
        profile.middleName,
        profile.lastName,
        profile.suffix,
      ]
        .filter(Boolean)
        .join(" "),
    [profile]
  );

  const initials = useMemo(
    () => `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`,
    [profile.firstName, profile.lastName]
  );

  const profileHasChanges =
    JSON.stringify(profile) !== JSON.stringify(savedProfile);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfile((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const showMessage = (text) => {
    setMessage(text);

    window.setTimeout(() => {
      setMessage("");
    }, 2500);
  };

  const saveProfile = () => {
    setSavedProfile(profile);
    showMessage("Account changes saved locally.");
  };

  const discardProfile = () => {
    setProfile(savedProfile);
    setMessage("");
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        isRead: true,
      }))
    );
  };

  const unreadNotificationCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  return (
    <div className="min-h-screen bg-[#f7f8fa] px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:px-8 lg:pt-36">
      <div className="mx-auto max-w-6xl">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 lg:mb-10"
        >
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Settings
            </h1>
            <span className="hidden h-px w-16 bg-slate-300 sm:block" />
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Manage your resident profile and account preferences.
          </p>
        </motion.header>

        <div className="grid items-start gap-6 lg:grid-cols-[185px_minmax(0,1fr)] lg:gap-8">
          {/* SETTINGS SIDEBAR */}
          <aside className="lg:sticky lg:top-28">
            <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
              {SETTINGS_TABS.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMessage("");
                    }}
                    className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-semibold transition lg:w-full ${
                      isActive
                        ? "bg-accent text-primary"
                        : "text-slate-500 hover:bg-white hover:text-slate-900"
                    }`}
                  >
                    <tab.Icon size={15} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* SETTINGS CONTENT */}
          <main className="min-w-0">
            <AnimatePresence mode="wait">
              {activeTab === "account" && (
                <motion.section
                  key="account"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 lg:p-10"
                >
                  <ContentHeader
                    title="Account"
                    description="Update your personal information and the details displayed on your resident profile."
                  />

                  <div className="py-7">
                    <p className="mb-3 text-xs font-semibold text-slate-700">
                      Profile photo
                    </p>

                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                        {initials}
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="flex items-center gap-2 rounded-lg border border-primary/20 bg-accent px-3.5 py-2 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white"
                        >
                          <Camera size={14} />
                          Upload
                        </button>

                        <button
                          type="button"
                          className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-x-6 gap-y-5 border-t border-slate-100 pt-7 md:grid-cols-2">
                    <SettingsField
                      label="First name"
                      name="firstName"
                      value={profile.firstName}
                      onChange={handleProfileChange}
                    />

                    <SettingsField
                      label="Middle name"
                      name="middleName"
                      value={profile.middleName}
                      onChange={handleProfileChange}
                    />

                    <SettingsField
                      label="Last name"
                      name="lastName"
                      value={profile.lastName}
                      onChange={handleProfileChange}
                    />

                    <SettingsField
                      label="Suffix"
                      name="suffix"
                      value={profile.suffix}
                      onChange={handleProfileChange}
                      placeholder="Jr., Sr., III"
                    />

                    <SettingsField
                      label="Contact number"
                      name="contactNumber"
                      value={profile.contactNumber}
                      onChange={handleProfileChange}
                    />

                    <SettingsField
                      label="Emergency contact"
                      name="emergencyContactNumber"
                      value={profile.emergencyContactNumber}
                      onChange={handleProfileChange}
                    />

                    <div className="md:col-span-2">
                      <SettingsField
                        label="Email address"
                        name="email"
                        value={profile.email}
                        onChange={handleProfileChange}
                        readOnly
                        note="Used for login and notifications"
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col-reverse gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      {message && (
                        <p className="flex items-center gap-2 text-xs font-semibold text-approved">
                          <Check size={15} />
                          {message}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={discardProfile}
                        disabled={!profileHasChanges}
                        className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={saveProfile}
                        disabled={!profileHasChanges}
                        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Save size={14} />
                        Save changes
                      </button>
                    </div>
                  </div>
                </motion.section>
              )}

              {activeTab === "notifications" && (
                <motion.section
                  key="notifications"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 lg:p-10"
                >
                  <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 md:text-2xl">
                        Notifications
                      </h2>
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
                        View updates about reservations, parking, vehicle
                        stickers, payments, and community announcements.
                      </p>
                    </div>

                    {unreadNotificationCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsAsRead}
                        className="w-fit text-xs font-semibold text-primary hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-500">
                      {unreadNotificationCount} unread{" "}
                      {unreadNotificationCount === 1
                        ? "notification"
                        : "notifications"}
                    </p>

                    <span className="rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-primary">
                      All notifications
                    </span>
                  </div>

                  <div className="mt-4 divide-y divide-slate-100 border-y border-slate-100">
                    {notifications.map((notification) => {
                      const NotificationIcon =
                        NOTIFICATION_ICONS[notification.type] || Bell;

                      return (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() =>
                            markNotificationAsRead(notification.id)
                          }
                          className={`flex w-full gap-4 px-2 py-5 text-left transition hover:bg-slate-50 ${
                            notification.isRead ? "" : "bg-accent/40"
                          }`}
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                              notification.isRead
                                ? "bg-slate-100 text-slate-500"
                                : "bg-primary text-white"
                            }`}
                          >
                            <NotificationIcon size={17} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p
                                  className={`text-sm ${
                                    notification.isRead
                                      ? "font-semibold text-slate-700"
                                      : "font-bold text-slate-900"
                                  }`}
                                >
                                  {notification.title}
                                </p>

                                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                                  {notification.message}
                                </p>
                              </div>

                              {!notification.isRead && (
                                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-secondary" />
                              )}
                            </div>

                            <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                              <Clock3 size={12} />
                              {notification.time}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {notifications.length === 0 && (
                    <div className="py-16 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <Bell size={20} />
                      </div>
                      <p className="mt-4 text-sm font-semibold text-slate-700">
                        No notifications yet
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        New service and community updates will appear here.
                      </p>
                    </div>
                  )}
                </motion.section>
              )}

              {activeTab === "residential" && (
                <motion.section
                  key="residential"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 lg:p-10"
                >
                  <ContentHeader
                    title="Residential information"
                    description="Review the residential details submitted during account registration."
                  />

                  <div className="mt-7 flex items-start gap-3 rounded-xl border border-primary/15 bg-accent p-4">
                    <ShieldCheck
                      size={18}
                      className="mt-0.5 shrink-0 text-primary"
                    />

                    <p className="text-xs leading-relaxed text-primary">
                      Residential details are read-only because they may be used
                      for HOA verification. Changes can require administrator
                      review.
                    </p>
                  </div>

                  <div className="mt-7 grid gap-x-6 gap-y-5 md:grid-cols-2">
                    <SettingsField
                      label="Resident category"
                      name="residentCategory"
                      value={
                        profile.residentCategory.charAt(0).toUpperCase() +
                        profile.residentCategory.slice(1)
                      }
                      onChange={handleProfileChange}
                      readOnly
                    />

                    <SettingsField
                      label="Verification status"
                      name="verificationStatus"
                      value="Pending Verification"
                      onChange={handleProfileChange}
                      readOnly
                    />

                    <SettingsField
                      label="Block"
                      name="block"
                      value={profile.block}
                      onChange={handleProfileChange}
                      readOnly
                    />

                    <SettingsField
                      label="Lot"
                      name="lot"
                      value={profile.lot}
                      onChange={handleProfileChange}
                      readOnly
                    />

                    <SettingsField
                      label="Street"
                      name="street"
                      value={profile.street}
                      onChange={handleProfileChange}
                      readOnly
                    />

                    <SettingsField
                      label="Phase"
                      name="phase"
                      value={profile.phase}
                      onChange={handleProfileChange}
                      readOnly
                    />
                  </div>

                  <div className="mt-7 flex items-start gap-3 border-t border-slate-100 pt-6">
                    <MapPin size={18} className="mt-0.5 shrink-0 text-secondary" />

                    <div>
                      <p className="text-xs font-semibold text-slate-700">
                        Registered address
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {profile.block}, {profile.lot}, {profile.street},{" "}
                        {profile.phase}, Windward Hills Subdivision
                      </p>
                    </div>
                  </div>
                </motion.section>
              )}

              {activeTab === "services" && (
                <motion.section
                  key="services"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 lg:p-10"
                >
                  <ContentHeader
                    title="My services"
                    description="Track the current status of services and applications you have submitted."
                  />

                  <div className="mt-7 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <CalendarDays size={18} className="text-primary" />
                      <p className="mt-3 text-xl font-bold text-slate-900">1</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Reservation
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <ParkingCircle size={18} className="text-primary" />
                      <p className="mt-3 text-xl font-bold text-slate-900">1</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Parking request
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <Car size={18} className="text-primary" />
                      <p className="mt-3 text-xl font-bold text-slate-900">1</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Sticker application
                      </p>
                    </div>
                  </div>

                  <div className="mt-7 divide-y divide-slate-100 border-y border-slate-100">
                    {SAMPLE_SERVICES.map((service) => {
                      const ServiceIcon =
                        SERVICE_ICONS[service.type] || FileText;

                      return (
                        <article
                          key={service.id}
                          className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex min-w-0 gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                              <ServiceIcon size={18} />
                            </div>

                            <div className="min-w-0">
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                {service.reference}
                              </p>
                              <h3 className="mt-1 truncate text-sm font-semibold text-slate-800">
                                {service.title}
                              </h3>
                              <p className="mt-1 text-xs text-slate-500">
                                {service.date} • {service.detail}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-4 sm:justify-end">
                            <StatusBadge status={service.status} />

                            <button
                              type="button"
                              className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                            >
                              Details
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </motion.section>
              )}

              {activeTab === "password" && (
                <motion.section
                  key="password"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 lg:p-10"
                >
                  <ContentHeader
                    title="Password"
                    description="Update the password used to access your Subdiverse account."
                  />

                  <div className="mt-7 max-w-xl space-y-5">
                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold text-slate-700">
                        Current password
                      </span>

                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          name="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter current password"
                          className="h-11 w-full rounded-lg border border-slate-200 px-3.5 pr-11 text-sm outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/10"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword((current) => !current)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        >
                          {showCurrentPassword ? (
                            <EyeOff size={17} />
                          ) : (
                            <Eye size={17} />
                          )}
                        </button>
                      </div>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold text-slate-700">
                        New password
                      </span>

                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter new password"
                          className="h-11 w-full rounded-lg border border-slate-200 px-3.5 pr-11 text-sm outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/10"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowNewPassword((current) => !current)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        >
                          {showNewPassword ? (
                            <EyeOff size={17} />
                          ) : (
                            <Eye size={17} />
                          )}
                        </button>
                      </div>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold text-slate-700">
                        Confirm new password
                      </span>

                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          placeholder="Re-enter new password"
                          className="h-11 w-full rounded-lg border border-slate-200 px-3.5 pr-11 text-sm outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/10"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword((current) => !current)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={17} />
                          ) : (
                            <Eye size={17} />
                          )}
                        </button>
                      </div>
                    </label>

                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                      <Mail size={17} className="shrink-0 text-slate-400" />
                      <p className="text-xs leading-relaxed text-slate-500">
                        Password and email changes are UI-only until Firebase
                        Authentication is connected.
                      </p>
                    </div>

                    <div className="flex justify-end border-t border-slate-100 pt-6">
                      <button
                        type="button"
                        className="rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-white transition hover:brightness-95"
                      >
                        Update password
                      </button>
                    </div>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

export default UserSettings;