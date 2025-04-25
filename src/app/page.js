"use client";

import React from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";

const Login = dynamic(() => import("@/components/ui/Login/Login"), {
  loading: () => <Loading />,
});

const Page = () => {
  return (
    <section role="region" aria-label="Login Section">
      <Login />
    </section>
  );
};

export default Page;
