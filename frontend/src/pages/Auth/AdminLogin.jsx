import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  AlertCircle,
  Mail,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { auth, db } from "../../firebase";
import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
} from "firebase/firestore";

import loginImage from "../../assets/login.avif";

function AdminLogin() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [submitError, setSubmitError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Converts Firebase authentication errors
  // into simpler messages for the admin.
  const getFriendlyAuthError = (error) => {
    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
        return "Incorrect email or password. Please try again.";

      case "auth/user-not-found":
        return "We couldn't find an administrator account with that email.";

      case "auth/invalid-email":
        return "Please enter a valid email address.";

      case "auth/user-disabled":
        return "This administrator account has been disabled.";

      case "auth/too-many-requests":
        return "Too many failed login attempts. Please try again later.";

      case "auth/network-request-failed":
        return "Network error. Please check your internet connection.";

      default:
        return "Something went wrong while logging in. Please try again.";
    }
  };

  // Validate admin login form.
  const validateForm = () => {
    const errors = {};

    if (!email.trim()) {
      errors.email = "Email address is required.";
    } else {
      const emailRegex =
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

      if (!emailRegex.test(email)) {
        errors.email = "Please enter a valid email.";
      }
    }

    if (!password) {
      errors.password = "Password is required.";
    }

    return errors;
  };

  // Update validation errors whenever
  // the email or password changes.
  useEffect(() => {
    const errors = validateForm();
    setFieldErrors(errors);
  }, [email, password]);

  const isFormValid =
    Object.keys(fieldErrors).length === 0;

  const handleEmailChange = (e) => {
    setTouched((prev) => ({
      ...prev,
      email: true,
    }));

    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setTouched((prev) => ({
      ...prev,
      password: true,
    }));

    setPassword(e.target.value);
  };

  // Checks the authenticated user's
  // Firestore profile for the admin role.
  const checkAdminProfile = async (uid) => {
    const userDocRef = doc(
      db,
      "users",
      uid
    );

    const userDocSnap = await getDoc(
      userDocRef
    );

    if (!userDocSnap.exists()) {
      return {
        success: false,
        reason: "no_profile",
      };
    }

    const data = userDocSnap.data();

    const role = String(
      data.role || ""
    ).toLowerCase();

    const accountStatus = String(
      data.accountStatus ||
        data.status ||
        "active"
    ).toLowerCase();

    // Only users with the admin role
    // can enter the Admin Portal.
    if (role !== "admin") {
      return {
        success: false,
        reason: "not_admin",
      };
    }

    // Prevent inactive admin accounts
    // from accessing the dashboard.
    if (accountStatus !== "active") {
      return {
        success: false,
        reason: "inactive",
      };
    }

    return {
      success: true,
      role,
      accountStatus,
    };
  };

  // Admin Email/Password Login
  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitError("");

    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setTouched({
        email: true,
        password: true,
      });

      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      // Authenticate using Firebase.
      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      const adminUser =
        userCredential.user;

      // Read the administrator's
      // Firestore profile.
      const profileResult =
        await checkAdminProfile(
          adminUser.uid
        );

      if (!profileResult.success) {
        // Immediately sign out anyone
        // who is not an authorized admin.
        await signOut(auth);

        switch (profileResult.reason) {
          case "not_admin":
            setSubmitError(
              "You are not authorized to access the Admin Portal."
            );
            break;

          case "no_profile":
            setSubmitError(
              "Administrator profile not found. Please contact the system administrator."
            );
            break;

          case "inactive":
            setSubmitError(
              "This administrator account is currently inactive."
            );
            break;

          default:
            setSubmitError(
              "Unable to access the Admin Portal."
            );
        }

        return;
      }

      // Successful admin login.
      navigate(
        "/admin-dashboard",
        {
          replace: true,
        }
      );
    } catch (error) {
      console.error(
        "Admin login error:",
        error
      );

      if (
        error.code ===
          "permission-denied" ||
        error.code ===
          "firestore/permission-denied"
      ) {
        await signOut(auth);

        setSubmitError(
          "Your account was authenticated, but Firestore denied access to your admin profile."
        );

        return;
      }

      setSubmitError(
        getFriendlyAuthError(error)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldStatus = (field) => {
    if (!touched[field]) {
      return "default";
    }

    if (fieldErrors[field]) {
      return "error";
    }

    return "default";
  };

  const inputClasses = (
    field,
    extra = ""
  ) => {
    const status =
      getFieldStatus(field);

    const base = `
      w-full
      border
      rounded-lg
      py-2.5
      text-sm
      text-gray-900
      placeholder-gray-400
      focus:outline-none
      focus:ring-2
      transition-all
      duration-200
      ${extra}
    `;

    if (status === "error") {
      return `
        ${base}
        border-red-400
        focus:ring-red-100
        focus:border-red-500
      `;
    }

    return `
      ${base}
      border-gray-200
      focus:ring-primary/20
      focus:border-primary
    `;
  };

  const FieldError = ({ field }) => {
    if (
      !touched[field] ||
      !fieldErrors[field]
    ) {
      return null;
    }

    return (
      <p className="text-xs text-red-500 font-medium mt-0.5">
        {fieldErrors[field]}
      </p>
    );
  };

  return (
    <div className="w-full h-screen min-h-screen bg-white grid grid-cols-1 md:grid-cols-12 overflow-hidden">

      {/* Left Side - Admin Hero Image */}
      <div className="hidden md:block md:col-span-5 lg:col-span-5 p-4 bg-white h-full">
        <motion.div
          initial={{
            opacity: 0,
            x: -30,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="w-full h-full rounded-[24px] bg-slate-900 border border-slate-100 p-12 flex flex-col justify-between relative overflow-hidden shadow-lg group"
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{
              backgroundImage: `url(${loginImage})`,
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />

          <div className="relative z-10">
            <ShieldCheck className="w-9 h-9 text-white/80" />
          </div>

          <div className="relative z-10 space-y-3 max-w-sm mb-6">

            <span className="inline-block text-xs font-semibold uppercase tracking-widest bg-white/10 px-2.5 py-1 rounded-md text-white/90">
              Subdiverse Administration
            </span>

            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white drop-shadow-md">
              Manage your community through the Admin Portal
            </h2>

            <p className="text-sm text-white/70 leading-relaxed">
              Authorized administrators only.
              Sign in to manage residents,
              community services, and system
              operations.
            </p>

          </div>
        </motion.div>
      </div>

      {/* Right Side - Admin Login Form */}
      <div className="col-span-1 md:col-span-7 lg:col-span-7 flex flex-col justify-center items-center px-6 py-12 sm:px-16 md:px-16 lg:px-24 bg-white h-full overflow-hidden">

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
          className="max-w-md w-full mx-auto"
        >

          {/* Header */}
          <div>
            <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-secondary font-heading">
              Admin Login
            </h1>

            <p className="text-sm font-medium mt-2 mb-8 text-gray-500">
              Enter your administrator credentials to continue.
            </p>
          </div>

          {/* Login Error */}
          {submitError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-5">

              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />

              <p className="text-xs text-red-600 font-medium">
                {submitError}
              </p>

            </div>
          )}

          {/* Login Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 w-full"
          >

            {/* Email */}
            <div className="flex flex-col gap-1.5">

              <label
                htmlFor="admin-email"
                className="text-xs font-bold text-gray-700"
              >
                Email
              </label>

              <div className="relative">

                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={
                    handleEmailChange
                  }
                  placeholder="admin@gmail.com"
                  className={inputClasses(
                    "email",
                    "pl-10 pr-4"
                  )}
                />

              </div>

              <FieldError field="email" />

            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">

              <label
                htmlFor="admin-password"
                className="text-xs font-bold text-gray-700"
              >
                Password
              </label>

              <div className="relative">

                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                <input
                  id="admin-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={
                    handlePasswordChange
                  }
                  placeholder="Enter your password"
                  className={inputClasses(
                    "password",
                    "pl-10 pr-10"
                  )}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>

              </div>

              <FieldError field="password" />

            </div>

            {/* Login Button */}
            <div className="pt-2">

              <button
                type="submit"
                disabled={
                  isLoading ||
                  !isFormValid
                }
                className={`
                  w-full
                  text-white
                  font-semibold
                  py-3
                  rounded-full
                  shadow-sm
                  transition-all
                  duration-200
                  ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : !isFormValid
                        ? "bg-primary/40 cursor-not-allowed"
                        : "bg-primary hover:brightness-105 active:scale-[0.99] cursor-pointer"
                  }
                `}
              >
                {isLoading
                  ? "Logging in..."
                  : "Login to Admin Portal"}
              </button>

            </div>

          </form>

          {/* Back to Website */}
          <div className="text-center mt-7">

            <button
              type="button"
              onClick={() =>
                navigate("/")
              }
              className="text-xs font-semibold text-gray-400 hover:text-primary transition-colors cursor-pointer"
            >
              ← Back to Subdiverse
            </button>

          </div>

        </motion.div>
      </div>

    </div>
  );
}

export default AdminLogin;