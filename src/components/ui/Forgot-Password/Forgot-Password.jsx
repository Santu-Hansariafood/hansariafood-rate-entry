"use client";

import { motion } from "framer-motion";
import { Send, Phone } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Title from "@/components/common/Title/Title";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

const ForgotPassword = () => {
  const [mobile, setMobile] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!mobile) {
      toast.error("Please enter your mobile number.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await axiosInstance.patch("/auth/register", { mobile });

      if (
        res?.data &&
        res.status === 200 &&
        res.data.message?.includes("Details sent")
      ) {
        toast.success(
          `Hello ${res.data.name}, password sent to your WhatsApp number.`
        );
        setMobile("");
      } else {
        toast.error("Unexpected response from server.");
        console.warn("Unexpected WhatsApp response:", res.data);
      }
    } catch (error) {
      const detail = error.response?.data;
      console.error("Frontend Error:", detail);

      if (detail?.message) {
        toast.error(detail.message);
      } else {
        toast.error("Something went wrong.");
      }
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
        <Title text="Forgot Password" className="dark:text-white" />
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
          Send password to your registered WhatsApp number
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              Registered Mobile Number
            </label>
            <div className="relative">
              <Phone
                className="absolute left-4 top-3.5 text-gray-400 dark:text-gray-500"
                size={20}
              />
              <input
                type="tel"
                maxLength={10}
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter your mobile number"
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
            {isLoading ? "Sending..." : "Send Password"}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Remembered your password?{" "}
          <Link
            href="/"
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
