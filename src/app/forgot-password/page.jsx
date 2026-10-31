import dynamic from "next/dynamic";
import React from "react";
const ForgotPassword = dynamic(
  () => import("@/components/ui/Forgot-Password/Forgot-Password"),
);

export const metadata = {
  title: "Forgot Password",
  description:
    "Reset your Hansaria Food account password using your registered mobile number.",
  robots: {
    index: false,
    follow: false,
  },
};

const page = () => {
  return (
    <section role="region" aria-label="Forgot Password">
      <ForgotPassword />
    </section>
  );
};

export default page;
