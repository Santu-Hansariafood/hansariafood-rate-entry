"use client";

import { Suspense, useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
const Title = dynamic(() => import("@/components/common/Title/Title"));
const InputBox = dynamic(() => import("@/components/common/InputBox/InputBox"));
const Button = dynamic(() => import("@/components/common/Button/Button"));

const ResetPassword = () => {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedMobile = localStorage.getItem("mobile");
    if (storedMobile) {
      setMobile(storedMobile);
    } else {
      toast.error("No mobile number found in local storage", {
        position: "top-center",
      });
    }
  }, []);

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      toast.warning("Please enter both password fields", {
        position: "top-center",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match", {
        position: "top-center",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.put("/auth/register", {
        mobile,
        password,
      });

      if (response.status === 200) {
        toast.success("Password changed successfully", {
          position: "top-center",
          autoClose: 3000,
        });
        setPassword("");
        setConfirmPassword("");
      } else {
        toast.error("Something went wrong", {
          position: "top-center",
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating password", {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-6">
          <Title text="Reset Password" />
          <InputBox
            label="Mobile Number"
            value={mobile}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
          />

          <InputBox
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <InputBox
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <div className="flex justify-center">
            <Button
              text="Update Password"
              isLoading={loading}
              onClick={handleSubmit}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default ResetPassword;
