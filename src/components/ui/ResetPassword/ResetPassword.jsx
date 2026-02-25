"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import useMobileFromStorage from "@/hooks/ResetPassword/useMobileFromStorage";
import useResetPassword from "@/hooks/ResetPassword/useResetPassword";
import Loading from "@/components/common/Loading/Loading";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

const Title = dynamic(() => import("@/components/common/Title/Title"));
const InputBox = dynamic(() => import("@/components/common/InputBox/InputBox"));
const Button = dynamic(() => import("@/components/common/Button/Button"));

const ResetPassword = () => {
  const mobile = useMobileFromStorage();
  const { resetPassword, loading } = useResetPassword(mobile);

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordExpiresAt, setPasswordExpiresAt] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState(null);
  const [expiryLoading, setExpiryLoading] = useState(false);

  const loadPasswordExpiry = useCallback(async () => {
    if (!mobile) return;
    try {
      setExpiryLoading(true);
      const res = await axiosInstance.get("/auth/register");
      const users = Array.isArray(res.data?.users) ? res.data.users : [];
      const user = users.find((u) => String(u.mobile) === String(mobile));
      setUserName(typeof user?.name === "string" ? user.name : "");
      const lastResetRaw = user?.passwordLastReset;
      if (!lastResetRaw) {
        setPasswordExpiresAt(null);
        setDaysRemaining(null);
        return;
      }

      const lastReset = new Date(lastResetRaw);
      if (Number.isNaN(lastReset.getTime())) {
        setPasswordExpiresAt(null);
        setDaysRemaining(null);
        return;
      }

      const expiryMs = 30 * 24 * 60 * 60 * 1000;
      const expiresAt = new Date(lastReset.getTime() + expiryMs);
      const now = Date.now();
      const remainingMs = expiresAt.getTime() - now;
      const remainingDays = Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));

      setPasswordExpiresAt(expiresAt);
      setDaysRemaining(remainingDays);
    } catch {
      setUserName("");
      setPasswordExpiresAt(null);
      setDaysRemaining(null);
    } finally {
      setExpiryLoading(false);
    }
  }, [mobile]);

  useEffect(() => {
    loadPasswordExpiry();
  }, [loadPasswordExpiry]);

  const handleSubmit = async () => {
    const success = await resetPassword(password, confirmPassword);
    if (success) {
      setPassword("");
      setConfirmPassword("");
      loadPasswordExpiry();
    }
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-6">
          <Title text="Reset Password" />
          <InputBox
            label="Name"
            value={userName || "Guest"}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
          />
          <p className="text-[10px] text-gray-500 -mt-3">
            Mobile: {mobile || "-"}
          </p>
          <InputBox
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-[10px] text-gray-500 mt-1">
            Password policy: minimum 8 characters with letters, numbers, and special characters.
          </p>
          <p className="text-[10px] text-gray-500 mt-1">
            {expiryLoading
              ? "Checking password expiry..."
              : passwordExpiresAt
              ? `Your password expires at: ${passwordExpiresAt.toLocaleDateString()}${
                  typeof daysRemaining === "number"
                    ? ` (${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining)`
                    : ""
                }`
              : "Your password expiry date is not available."}
          </p>
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
