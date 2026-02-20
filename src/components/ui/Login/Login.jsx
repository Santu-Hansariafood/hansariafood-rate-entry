"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import useLoginForm from "@/hooks/Login/useLoginForm";
import Loading from "@/components/common/Loading/Loading";

const InputBox = dynamic(() => import("@/components/common/InputBox/InputBox"));
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
        className="flex min-h-screen items-center justify-center px-4 sm:px-6
          bg-gradient-to-br from-green-50 via-white to-green-100 
          dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 
          transition-colors duration-500"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-sm sm:max-w-md px-5 py-6 sm:px-8 sm:py-8 rounded-3xl shadow-xl 
            bg-white/80 dark:bg-gray-900/80 
            backdrop-blur-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="text-center mb-6 sm:mb-8">
            <Title text="Welcome Back" />
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              Sign in to continue
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="space-y-5 sm:space-y-6"
            aria-describedby="form-errors"
          >
            <div>
              <InputBox
                label="Mobile Number"
                name="mobile"
                type="number"
                maxLength={10}
                required
                placeholder="Enter your mobile number"
                value={mobile}
                onChange={handleMobileChange}
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
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <InputBox
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <Link
                  href="/forgot-password"
                  className="text-sm text-green-600 hover:underline dark:text-green-400"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>
            {error && (
              <motion.p
                id="error-message"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm font-medium"
                role="alert"
              >
                {error}
              </motion.p>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-green-500 text-white py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base
                hover:bg-green-600 shadow-lg hover:shadow-xl 
                transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-300"
            >
              Log In
            </motion.button>
          </form>
        </motion.div>
      </main>
    </Suspense>
  );
}
