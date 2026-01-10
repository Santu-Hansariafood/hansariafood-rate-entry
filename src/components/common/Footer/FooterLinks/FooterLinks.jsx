import React from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

const FooterLinks = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="flex items-center gap-6 text-sm"
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
    </motion.div>
  );
};

export default FooterLinks;
