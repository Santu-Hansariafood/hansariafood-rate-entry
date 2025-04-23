"use client";

import { useState, useCallback } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

export default function useLoginForm() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [mobileError, setMobileError] = useState("");

  const router = useRouter();
  const { setMobile: setGlobalMobile } = useUser();

  const validateMobile = useCallback((value) => /^[6-9]\d{9}$/.test(value), []);

  const handleMobileChange = useCallback((e) => {
    const value = e.target.value;
    if (/^\d{0,10}$/.test(value)) {
      setMobile(value);
      setMobileError("");
    }
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
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
        localStorage.setItem("user", JSON.stringify({ mobile }));
        setGlobalMobile(mobile);
        router.push("/dashboard");
      }
    },
    [mobile, password, router, setGlobalMobile, validateMobile]
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
