"use client";

import dynamic from "next/dynamic";
import React, { Suspense, useEffect } from "react";
import Loading from "../Loading/Loading";
const FooterCopyright = dynamic(() =>
  import("./FooterCopyright/FooterCopyright")
);
const FooterLinks = dynamic(() => import("./FooterLinks/FooterLinks"));

const Footer = () => {
  useEffect(() => {
    import("./FooterCopyright/FooterCopyright");
    import("./FooterLinks/FooterLinks");
  }, []);
  return (
    <Suspense fallback={<Loading />}>
      <footer className="bg-black text-white text-center py-6 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
          <FooterCopyright />
          <FooterLinks />
        </div>
      </footer>
    </Suspense>
  );
};

export default Footer;
