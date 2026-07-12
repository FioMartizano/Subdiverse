import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, AlertCircle, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendEmailVerification,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import loginImage from "../../assets/login.avif";

const googleProvider = new GoogleAuthProvider();

/*
 * Always show the Google account chooser instead of silently using
 * whichever Google account is already active in the browser.
 */
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Validation errors UI
const getFriendlyAuthError = (error) => {
  switch (error.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Incorrect email or password. Please try again.";
    case "auth/user-not-found":
      return "We couldn't find an account with that email.";
    case "auth/invalid-email":
      return "That email address doesn't look valid.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact the administrator.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "Network error. Please check your connection and try again.";
    default:
      return "Something went wrong while logging in. Please try again.";
  }
};

/*
 * GOOGLE LOGIN ERROR MESSAGES
 *
 * Google sign-in uses different errors from typed email/password login.
 * Keeping a separate mapper prevents Google errors from showing messages
 * such as "Incorrect email or password."
 */
const getFriendlyGoogleAuthError = (error) => {
  switch (error.code) {
    case "auth/popup-closed-by-user":
      return "Google sign-in was closed before it finished. Please try again.";

    case "auth/popup-blocked":
      return "The Google sign-in popup was blocked by your browser. Please allow popups and try again.";

    case "auth/cancelled-popup-request":
      return "Another Google sign-in request is already open. Please finish or close it first.";

    case "auth/account-exists-with-different-credential":
      return "This email is already registered using another sign-in method. Please log in using that method first.";

    case "auth/operation-not-allowed":
      return "Google sign-in is currently disabled. Please contact the administrator.";

    case "auth/unauthorized-domain":
      return "Google sign-in is not authorized for this website domain.";

    case "auth/network-request-failed":
      return "Network error. Please check your connection and try again.";

    case "auth/invalid-credential":
      return "Google could not verify this sign-in. Please choose the account again.";

    default:
      return "Google sign-in could not be completed. Please try again.";
  }
};

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();

  // Read the authenticated user's Firestore profile.
  // Firestore errors are allowed to reach the login catch block instead of
  // being incorrectly reported as a missing profile.
  const checkAccountStatus = async (userId) => {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      return { exists: false, status: null, role: null };
    }

    const data = userDocSnap.data();

    return {
      exists: true,
      status: String(data.status || "pending").toLowerCase(),
      role: String(data.role || "resident").toLowerCase(),
    };
  };

  // Route only active accounts to the correct dashboard.
  const routeUserByProfile = async (userId) => {
    const { exists, status, role } = await checkAccountStatus(userId);

    if (!exists) {
      return { success: false, reason: "no_profile" };
    }

    if (status === "pending") {
      return { success: false, reason: "pending" };
    }

    if (status === "rejected") {
      return { success: false, reason: "rejected" };
    }

    if (status !== "active") {
      return { success: false, reason: "inactive" };
    }

    if (role === "admin") {
      navigate("/admin-dashboard", { replace: true });
      return { success: true, role: "admin" };
    }

    if (role === "resident") {
      navigate("/resident-home", { replace: true });
      return { success: true, role: "resident" };
    }

    return { success: false, reason: "invalid_role" };
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!email.trim()) {
      errors.email = "Email address is required.";
    } else {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(email)) errors.email = "Please enter a valid email.";
    }

    if (!password) {
      errors.password = "Password is required.";
    }

    return errors;
  };

  // Update errors on field changes
  useEffect(() => {
    const errors = validateForm();
    setFieldErrors(errors);
  }, [email, password]);

  const isFormValid = Object.keys(fieldErrors).length === 0;

  const handleEmailChange = (e) => {
    setTouched((prev) => ({ ...prev, email: true }));
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setTouched((prev) => ({ ...prev, password: true }));
    setPassword(e.target.value);
  };

  // Email/Password Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setTouched({ email: true, password: true });
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const signedInUser = userCredential.user;

      /*
       * Password signup requires email ownership verification before
       * Firestore status and role checks are allowed to continue.
       */
      await signedInUser.reload();

      if (!signedInUser.emailVerified) {
        let verificationEmailSent = true;

        try {
          await sendEmailVerification(signedInUser);
        } catch (verificationError) {
          verificationEmailSent = false;
          console.error(
            "Could not resend verification email:",
            verificationError
          );
        }

        await signOut(auth);

        setSubmitError(
          verificationEmailSent
            ? "Your email is not verified yet. We sent another verification link. Check your inbox and spam folder before logging in again."
            : "Your email is not verified yet. We could not send another link right now. Check the verification email already sent during signup or try again later."
        );
        return;
      }

      const { success, reason } = await routeUserByProfile(signedInUser.uid);
      
      if (!success) {
        // Immediately sign out if profile check fails
        await signOut(auth);
        
        // Set appropriate error message
        if (reason === "pending") {
          setSubmitError(
            "Your account is pending approval. Please wait for admin verification before logging in."
          );
        } else if (reason === "rejected") {
          setSubmitError(
            "Your registration was not approved. Please contact the HOA office."
          );
        } else if (reason === "inactive") {
          setSubmitError(
            "Your account is currently inactive. Please contact the administrator."
          );
        } else if (reason === "no_profile") {
          setSubmitError(
            "User profile not found in our records. Please contact support."
          );
        } else {
          setSubmitError(
            "Unable to access this account because its role is invalid. Please contact support."
          );
        }
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error.code === "permission-denied") {
        await signOut(auth);
        setSubmitError(
          "Your account was authenticated, but Firestore denied access to your profile. Please check the published Firestore read rules."
        );
      } else {
        setSubmitError(getFriendlyAuthError(error));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Google Login
  const handleGoogleLogin = async () => {
    setSubmitError("");
    setIsGoogleLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;

      const isVerifiedGoogleAccount =
        googleUser.emailVerified &&
        googleUser.providerData.some(
          (provider) => provider.providerId === "google.com"
        );

      if (!isVerifiedGoogleAccount || !googleUser.email) {
        await signOut(auth);
        setSubmitError(
          "Google could not verify this account or email address. Please choose a valid Google account."
        );
        return;
      }

      const { success, reason } = await routeUserByProfile(googleUser.uid);

      if (!success) {
        // Immediately sign out
        await signOut(auth);
        
        // Clear any cached auth data
        try {
          localStorage.removeItem('firebase:authUser');
        } catch (e) {
          // Ignore if localStorage is not available
        }
        
        // Set appropriate error message
        if (reason === "pending") {
          setSubmitError(
            "Your account is pending approval. Please wait for admin verification before logging in."
          );
        } else if (reason === "rejected") {
          setSubmitError(
            "Your registration was not approved. Please contact the HOA office."
          );
        } else if (reason === "inactive") {
          setSubmitError(
            "Your account is currently inactive. Please contact the administrator."
          );
        } else if (reason === "no_profile") {
          setSubmitError(
            "This Google account has not completed registration yet. Go to Sign Up and choose Sign Up with Google."
          );
        } else {
          setSubmitError(
            "Unable to access this account because its role is invalid. Please contact support."
          );
        }
      }
    } catch (error) {
      console.error("Google login error:", {
        code: error.code,
        message: error.message,
        email: error.customData?.email,
      });

      if (
        error.code === "permission-denied" ||
        error.code === "firestore/permission-denied"
      ) {
        await signOut(auth);
        setSubmitError(
          "Google authentication succeeded, but Firestore denied access to the user profile. Please check the published Firestore read rules."
        );
      } else {
        // Google errors now use their own messages instead of
        // the email/password error translator.
        setSubmitError(getFriendlyGoogleAuthError(error));
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const getFieldStatus = (field) => {
    if (!touched[field]) return "default";
    if (fieldErrors[field]) return "error";
    return "default";
  };

  const inputClasses = (field, extra = "") => {
    const status = getFieldStatus(field);
    const base = `w-full border rounded-lg py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${extra}`;
    if (status === "error") return `${base} border-red-400 focus:ring-red-100 focus:border-red-500`;
    return `${base} border-gray-200 focus:ring-primary/20 focus:border-primary`;
  };

  const FieldError = ({ field }) => {
    if (!touched[field] || !fieldErrors[field]) return null;
    return <p className="text-xs text-red-500 font-medium mt-0.5">{fieldErrors[field]}</p>;
  };

  return (
    <div className="w-full h-screen min-h-screen bg-white grid grid-cols-1 md:grid-cols-12 overflow-hidden">
      {/* Left Side - Hero Image */}
      <div className="hidden md:block md:col-span-5 lg:col-span-5 p-4 bg-white h-full">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.005 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full rounded-[24px] bg-slate-900 border border-slate-100 p-12 flex flex-col justify-between relative overflow-hidden shadow-lg group"
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{
              backgroundImage: `url(${loginImage})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-white/40 text-3xl font-light select-none transition-transform duration-500 group-hover:rotate-45">
              ✳
            </span>
          </div>
          <div className="relative z-10 space-y-3 max-w-sm mb-6">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest bg-white/10 px-2.5 py-1 rounded-md text-white/90">
              Welcome Back,
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white drop-shadow-md">
              Log in to your resident portal dashboard
            </h2>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="col-span-1 md:col-span-7 lg:col-span-7 flex flex-col justify-center items-center px-6 py-12 sm:px-16 md:px-16 lg:px-24 bg-white h-full overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-md w-full mx-auto"
        >
          <div className="flex-shrink-0">
            <span className="text-primary text-3xl block mb-4 select-none">✳</span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-secondary font-heading">
              Login
            </h1>
            <p className="text-sm font-medium mt-2 mb-8 text-primary">
              Welcome! Please enter your details.
            </p>
          </div>

          {submitError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-5">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-600 font-medium">{submitError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-bold text-gray-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="example@gmail.com"
                  className={inputClasses("email", "pl-10 pr-4")}
                />
              </div>
              <FieldError field="email" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-bold text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Enter at least 8 characters"
                  className={inputClasses("password", "pl-10 pr-10")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <FieldError field="password" />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className={`w-full text-white font-semibold py-3 rounded-full shadow-sm transition-all duration-200 ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : !isFormValid
                    ? "bg-primary/40 cursor-not-allowed"
                    : "bg-primary hover:brightness-105 active:scale-[0.99] cursor-pointer"
                }`}
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>

              <p className="text-center text-xs text-gray-400 mt-5 tracking-wide">
                Don't have an account?{" "}
                <span
                  onClick={() => navigate("/signup")}
                  className="text-primary font-bold hover:underline cursor-pointer"
                >
                  Sign Up Now!
                </span>
              </p>
            </div>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
            className={`w-full flex items-center justify-center gap-3 border border-gray-200 rounded-full py-3 font-semibold text-sm transition-all duration-200 ${
              isGoogleLoading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50 active:scale-[0.99] cursor-pointer"
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.8z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.1C3.25 21.3 7.31 24 12 24z" />
              <path fill="#FBBC05" d="M5.27 14.3c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3v-3.1H1.27C.46 8.24 0 10.06 0 12s.46 3.76 1.27 5.4l4-3.1z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.6l4 3.1C6.22 6.86 8.87 4.75 12 4.75z" />
            </svg>
            {isGoogleLoading ? "Signing in..." : "Continue with Google"}
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;