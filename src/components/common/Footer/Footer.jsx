"use client";

import dynamic from "next/dynamic";
import React, { Suspense, useEffect } from "react";
import { motion } from "framer-motion";
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
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true }}
        className="
          relative bg-gradient-to-br from-black via-gray-950 to-black
          text-white py-8 px-4 mt-10
          border-t border-emerald-500/30
        "
      >
        {/* Glow Line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />

        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <FooterCopyright />
          <FooterLinks />
        </div>
      </motion.footer>
    </Suspense>
  );
};

export default Footer;
