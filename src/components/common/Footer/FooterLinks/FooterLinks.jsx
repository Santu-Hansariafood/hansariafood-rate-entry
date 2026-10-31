import React from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

const FooterLinks = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="flex w-full flex-col items-center justify-center gap-5 text-xs sm:text-sm"
    >
      <a
        href="https://bid.hansariafood.in"
        target="_blank"
        rel="noopener noreferrer"
        className="
          group inline-flex items-center gap-2 rounded-full
          border border-emerald-500/30 bg-emerald-500/10
          px-5 py-2.5 font-medium text-emerald-300
          backdrop-blur-sm shadow-[0_0_0_1px_rgba(16,185,129,0.08)]
          transition-all duration-300
          hover:border-emerald-400/60 hover:bg-emerald-500/20 hover:text-emerald-200
          hover:shadow-[0_8px_30px_-8px_rgba(16,185,129,0.6)]
        "
      >
        Click to Generate Bill and Bids
        <ExternalLink
          size={14}
          className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </a>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-gray-400">
        <a
          href="/privacy-policy"
          className="relative transition-colors duration-300 hover:text-emerald-400"
        >
          Privacy Policy
        </a>
        <span className="h-3 w-px bg-white/15" />
        <a
          href="/terms-and-conditions"
          className="relative transition-colors duration-300 hover:text-emerald-400"
        >
          Terms &amp; Conditions
        </a>
        <span className="h-3 w-px bg-white/15" />
        <a
          href="/broker-commission-policy"
          className="relative transition-colors duration-300 hover:text-emerald-400"
        >
          Broker Commission Policy
        </a>
      </div>
    </motion.div>
  );
};

export default FooterLinks;
