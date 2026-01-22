"use client";

import { motion } from "framer-motion";
import { Send, Phone, Lock, CheckCircle, Mail } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Title from "@/components/common/Title/Title";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { useRouter } from "next/navigation";

const ForgotPassword = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resolvedEmail, setResolvedEmail] = useState("");

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!identifier) {
      toast.error("Please enter your email or mobile number.");
      return;
    }

    try {
      setIsLoading(true);
      const payload = identifier.includes("@") 
        ? { email: identifier } 
        : { mobile: identifier };

      const res = await axiosInstance.post("/auth/forgot-password", payload);

      if (res.status === 200) {
        toast.success(res.data.message);
        if (res.data.email) setResolvedEmail(res.data.email);
        setStep(2);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      setIsLoading(true);
      const payload = identifier.includes("@") 
        ? { email: identifier, otp, newPassword } 
        : { mobile: identifier, otp, newPassword };

      const res = await axiosInstance.post("/auth/reset-password", payload);

      if (res.status === 200) {
        toast.success("Password reset successfully! Redirecting to login...");
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800 p-4"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl rounded-3xl p-8 backdrop-blur-md"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Title text={step === 1 ? "Forgot Password" : "Reset Password"} className="dark:text-white" />
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
          {step === 1 
            ? "Enter your registered Email or Mobile to receive an OTP." 
            : `Enter the OTP sent to ${resolvedEmail || identifier} and your new password.`}
        </p>

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                Email or Mobile Number
              </label>
              <div className="relative">
                <div className="absolute left-4 top-3.5 text-gray-400 dark:text-gray-500">
                  {identifier.includes("@") ? <Mail size={20} /> : <Phone size={20} />}
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g., user@example.com or 9876543210"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 pl-14 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-green-500"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={isLoading}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors duration-200 disabled:opacity-70"
            >
              <Send size={18} />
              {isLoading ? "Sending OTP..." : "Send OTP"}
            </motion.button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
             <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                OTP
              </label>
              <div className="relative">
                <CheckCircle
                  className="absolute left-4 top-3.5 text-gray-400 dark:text-gray-500"
                  size={20}
                />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 pl-14 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-green-500 tracking-widest"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                New Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-3.5 text-gray-400 dark:text-gray-500"
                  size={20}
                />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 pl-14 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-green-500"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={isLoading}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors duration-200 disabled:opacity-70"
            >
              <CheckCircle size={18} />
              {isLoading ? "Resetting..." : "Reset Password"}
            </motion.button>
            
             <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline"
            >
              Back to Request OTP
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Remembered your password?{" "}
          <Link
            href="/login"
            className="text-green-600 dark:text-green-400 font-semibold hover:underline"
          >
            Log In
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default ForgotPassword;
