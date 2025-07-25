import dynamic from "next/dynamic";
import React from "react";
const ForgotPassword = dynamic(() =>
  import("@/components/ui/Forgot-Password/Forgot-Password")
);

const page = () => {
  return (
    <section role="region" aria-label="Forgot Password">
      <ForgotPassword />
    </section>
  );
};

export default page;
