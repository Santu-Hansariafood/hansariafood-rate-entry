"use client";

import { signIn } from "next-auth/react";
import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useUser } from "@/context/UserContext";
import Loading from "@/components/common/Loading/Loading";

const Title = dynamic(() => import("@/components/common/Title/Title"));

export default function Login() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const router = useRouter();
  const { setMobile: setGlobalMobile } = useUser();

  const validateMobile = (value) => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(value);
  };

  const handleMobileChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,10}$/.test(value)) {
      setMobile(value);
      setMobileError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateMobile(mobile)) {
      setMobileError("Enter a valid 10-digit mobile number");
      return;
    }

    const result = await signIn("credentials", {
      mobile,
      password,
      apiKey: process.env.NEXT_PUBLIC_API_KEY,
      redirect: false,
    });

    if (result.error) {
      setError("Invalid credentials");
    } else {
      setGlobalMobile(mobile);
      router.push("/dashboard");
    }
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mobile Number
              </label>
              <input
                type="text"
                value={mobile}
                onChange={handleMobileChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 outline-none"
                placeholder="Enter your mobile number"
                maxLength={10}
              />
              {mobileError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-sm mt-1"
                >
                  {mobileError}
                </motion.p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 outline-none"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm font-medium"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Sign In
            </motion.button>
          </form>
        </motion.div>
      </div>
    </Suspense>
  );
}
