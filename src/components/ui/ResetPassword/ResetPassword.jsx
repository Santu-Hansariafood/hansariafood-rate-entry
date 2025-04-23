"use client";

import { Suspense, useState } from "react";
import dynamic from "next/dynamic";
import useMobileFromStorage from "@/hooks/useMobileFromStorage";
import useResetPassword from "@/hooks/useResetPassword";
import Loading from "@/components/common/Loading/Loading";

const Title = dynamic(() => import("@/components/common/Title/Title"));
const InputBox = dynamic(() => import("@/components/common/InputBox/InputBox"));
const Button = dynamic(() => import("@/components/common/Button/Button"));

const ResetPassword = () => {
  const mobile = useMobileFromStorage();
  const { resetPassword, loading } = useResetPassword(mobile);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async () => {
    const success = await resetPassword(password, confirmPassword);
    if (success) {
      setPassword("");
      setConfirmPassword("");
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
