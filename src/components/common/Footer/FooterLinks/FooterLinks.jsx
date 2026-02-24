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
      className="flex flex-col items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm"
    >
      <a
        href="https://hansariafood.shop"
        target="_blank"
        rel="noopener noreferrer"
        className="
          flex items-center gap-1
          text-gray-300 hover:text-emerald-400
          transition-all duration-300
          hover:translate-x-1
        "
      >
        Click to Generate Bill and Bids
        <ExternalLink size={14} />
      </a>
      <div className="flex flex-wrap items-center justify-center gap-2 text-gray-300">
        <a
          href="/privacy-policy"
          className="hover:text-emerald-400 transition-colors duration-300"
        >
          Privacy Policy
        </a>
        <span className="text-gray-500">|</span>
        <a
          href="/terms-and-conditions"
          className="hover:text-emerald-400 transition-colors duration-300"
        >
          Terms &amp; Conditions
        </a>
        <span className="text-gray-500">|</span>
        <a
          href="/broker-commission-policy"
          className="hover:text-emerald-400 transition-colors duration-300"
        >
          Broker Commission Policy
        </a>
      </div>
    </motion.div>
  );
};

export default FooterLinks;
