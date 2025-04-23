"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import useLoginForm from "@/hooks/Login/useLoginForm";
import Loading from "@/components/common/Loading/Loading";

const Title = dynamic(() => import("@/components/common/Title/Title"));

export default function Login() {
  const {
    mobile,
    password,
    showPassword,
    error,
    mobileError,
    setPassword,
    setShowPassword,
    handleSubmit,
    handleMobileChange,
  } = useLoginForm();

  return (
    <Suspense fallback={<Loading />}>
      <main
        className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-green-100"
        role="main"
        aria-label="Login Page"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-8 shadow-2xl rounded-3xl bg-white/90 backdrop-blur-sm"
        >
          <div className="text-center mb-8">
            <Title text="Welcome Back" />
            <p className="text-gray-600">Please sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" aria-describedby="form-errors">
            <div>
              <label htmlFor="mobile" className="block text-sm font-semibold text-gray-700 mb-2">
                Mobile Number
              </label>
              <input
                id="mobile"
                type="text"
                value={mobile}
                onChange={handleMobileChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 outline-none"
                placeholder="Enter your mobile number"
                maxLength={10}
                autoComplete="tel"
                aria-invalid={!!mobileError}
                aria-describedby={mobileError ? "mobile-error" : undefined}
                inputMode="numeric"
              />
              {mobileError && (
                <motion.p
                  id="mobile-error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-sm mt-1"
                  role="alert"
                >
                  {mobileError}
                </motion.p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 outline-none pr-12"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  aria-describedby={error ? "error-message" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                id="error-message"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm font-medium"
                role="alert"
                aria-live="polite"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors duration-200 shadow-lg hover:shadow-xl"
              aria-label="Sign in to your account"
            >
              Sign In
            </motion.button>
          </form>
        </motion.div>
      </main>
    </Suspense>
  );
}
