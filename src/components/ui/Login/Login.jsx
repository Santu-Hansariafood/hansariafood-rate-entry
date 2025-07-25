"use client";

import dynamic from "next/dynamic";
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

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            aria-describedby="form-errors"
          >
            <div>
              <InputBox
                label="Mobile Number"
                name="mobile"
                type="number"
                maxLength={10}
                required
                readOnly={false}
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
                className="block text-sm font-semibold text-gray-700 mb-2"
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
              Log In
            </motion.button>
          </form>
        </motion.div>
      </main>
    </Suspense>
  );
}
