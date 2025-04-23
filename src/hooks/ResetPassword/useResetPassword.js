"use client";

import { useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

const useResetPassword = (mobile) => {
  const [loading, setLoading] = useState(false);

  const resetPassword = async (password, confirmPassword) => {
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
        return true;
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

    return false;
  };

  return { resetPassword, loading };
};

export default useResetPassword;
