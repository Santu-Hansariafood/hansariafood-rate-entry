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
          relative overflow-hidden mt-10
          bg-gradient-to-b from-neutral-950 via-black to-neutral-950
          text-white
        "
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[36rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_60%)]" />

        <div className="relative container mx-auto px-4 py-10 md:px-8">
          <div className="flex flex-col items-center gap-6">
            <FooterLinks />
            <div className="h-px w-full max-w-3xl bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <FooterCopyright />
          </div>
        </div>
      </motion.footer>
    </Suspense>
  );
};

export default Footer;
