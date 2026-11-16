import React from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";

export const metadata = {
  title: "Login | Hansaria Food Private Limited",
  description:
    "Access your Hansaria Food account to manage commodity rates, sauda entries, and brokerage services.",
  alternates: {
    canonical: "/",
    languages: {
      "en-IN": "/",
      "x-default": "/",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

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
