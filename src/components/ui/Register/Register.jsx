"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import { User, Phone, Lock } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

import useRegisterForm from "@/hooks/Register/useRegisterForm";
import Loading from "@/components/common/Loading/Loading";

export default function Register() {
  const { form, errors, loading, handleChange, handleSubmit } =
    useRegisterForm();

  return (
    <Suspense fallback={<Loading />}>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Create Account
            </h2>
            <p className="text-gray-600">
              Join us and get started with your journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-sm mt-1"
                >
                  {errors.name}
                </motion.p>
              )}
            </motion.div>

            {/* Mobile Number */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="mobile"
                  type="tel"
                  value={form.mobile}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    errors.mobile ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your mobile number"
                />
              </div>
              {errors.mobile && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-sm mt-1"
                >
                  {errors.mobile}
                </motion.p>
              )}
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Create a strong password"
                />
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-sm mt-1"
                >
                  {errors.password}
                </motion.p>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl text-white font-semibold shadow-lg transition-all duration-200 ${
                loading
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 hover:shadow-xl"
              }`}
            >
              {loading ? <Loading /> : "Create Account"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </Suspense>
  );
}
