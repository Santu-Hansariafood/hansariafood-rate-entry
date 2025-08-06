"use client";

import { useState, useCallback } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { validationPatterns } from "@/utils/validationPatterns/validationPatterns";

export default function useLoginForm() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [mobileError, setMobileError] = useState("");

  const router = useRouter();
  const { setMobile: setGlobalMobile } = useUser();

  const handleMobileChange = useCallback((e) => {
    const value = e.target.value;

    if (/^\d{0,10}$/.test(value)) {
      setMobile(value);

      if (value && !validationPatterns.mobile.test(value)) {
        setMobileError("Enter a valid 10-digit mobile number");
      } else {
        setMobileError("");
      }
    }
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!validationPatterns.mobile.test(mobile)) {
        setMobileError("Enter a valid 10-digit mobile number");
        return;
      }

      if (!validationPatterns.password.test(password)) {
        setError("Password must be at least 6 characters long");
        return;
      }

      setError("");
      setMobileError("");

      const result = await signIn("credentials", {
        mobile,
        password,
        apiKey: process.env.NEXT_PUBLIC_API_KEY,
        redirect: false,
      });

      if (result.error) {
        setError("Invalid credentials");
      } else {
        localStorage.setItem("user", JSON.stringify({ mobile }));
        setGlobalMobile(mobile);
        router.push("/dashboard");
      }
    },
    [mobile, password, router, setGlobalMobile]
  );

  return {
    mobile,
    password,
    showPassword,
    error,
    mobileError,
    setPassword,
    setShowPassword,
    handleSubmit,
    handleMobileChange,
  };
}
