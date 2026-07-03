import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Image } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import loginImage from "../../assets/login.avif";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // --- STEP 2: ADD A LOADING STATE ---
  const [isLoading, setIsLoading] = useState(false);

  // 2. INITIALIZE THE NAVIGATE FUNCTION
  const navigate = useNavigate();

  // --- STEP 3: REPLACE THE SUBMIT ACTION ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      // Log in using Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userId = userCredential.user.uid;

      // Fetch their user profile document from Firestore
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const { role, status, rejectionReason } = userData;

        // Direct the user based on their Role and Status
        if (role === "admin") {
          // 3. REDIRECT THE ADMIN
          navigate("/admin-dashboard");
        } else if (role === "resident") {
          if (status === "active") {
            // 3. REDIRECT THE RESIDENT TO RESIDENT HOME
            navigate("/resident-home");
          } else if (status === "pending") {
            navigate("/waiting-room");
          } else if (status === "rejected") {
            alert(`Your registration was rejected. Reason: ${rejectionReason || "Please contact the administrator."}`);
          }
        }
      } else {
        alert("User profile not found in our records.");
      }

    } catch (error) {
      console.error(error);
      alert("Login failed: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen min-h-screen bg-white grid grid-cols-1 md:grid-cols-12 overflow-hidden">

      <div className="hidden md:block md:col-span-5 lg:col-span-5 p-4 bg-white h-full">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.005 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full rounded-[24px] bg-slate-900 border border-slate-100 p-12 flex flex-col justify-between relative overflow-hidden shadow-lg group"
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{
              backgroundImage: `url(${loginImage})`,
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>

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

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-bold text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-bold text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter at least 8 characters"
                  className="w-full border border-gray-200 rounded-lg pl-4 pr-10 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full text-white font-semibold py-3 rounded-full shadow-sm transition-all duration-200 cursor-pointer ${isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:brightness-105 active:scale-[0.99]"
                  }`}
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>

              <p className="text-center text-xs text-gray-400 mt-5 tracking-wide">
                Don't have an account?{" "}
                <span className="text-primary font-bold hover:underline cursor-pointer">
                  Sign Up Now!
                </span>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;