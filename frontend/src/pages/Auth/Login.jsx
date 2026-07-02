import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Image } from "lucide-react";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (

    <div className="w-full h-screen min-h-screen bg-white grid grid-cols-1 md:grid-cols-12 overflow-hidden">

        {/* Left Column*/}
      <div className="hidden md:block md:col-span-5 lg:col-span-5 p-4 bg-white h-full">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}

          className="w-full h-full rounded-[24px] bg-gray-50 border border-gray-100 p-10 flex flex-col justify-between relative overflow-hidden"
        >

          <div className="relative z-10 flex items-center justify-between">
            <span className="text-gray-400 text-4xl font-light select-none">✳</span>
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-[0.15]">
            <Image className="w-16 h-16 text-gray-900 stroke-[1.25]" />
            <span className="text-xs font-mono tracking-widest uppercase mt-2 text-gray-900">
              Image Container Placeholder
            </span>
          </div>

          <div className="relative z-10 text-gray-800 space-y-2 max-w-sm">
            <p className="text-sm font-medium text-gray-400 tracking-wide">Windward Hills Subdivision</p>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight leading-tight text-gray-900">
              Get access to your community portal and manage your account with ease.
            </h2>
          </div>
        </motion.div>
      </div>

      {/* Right Column*/}
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

            {/* Password*/}
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
                className="w-full bg-primary hover:brightness-105 active:scale-[0.99] text-white font-semibold py-3 rounded-full shadow-sm transition-all duration-200 cursor-pointer"
              >
                Login
              </button>
              
              <p className="text-center text-xs text-gray-400 mt-5 tracking-wide">
                Don't have an account?{" "}
                <span className="text-primary font-bold hover:underline cursor-pointer">
                  Contact Administration
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