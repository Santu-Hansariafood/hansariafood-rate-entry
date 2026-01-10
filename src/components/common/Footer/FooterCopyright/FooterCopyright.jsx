import React from "react";
import { motion } from "framer-motion";

const FooterCopyright = () => {
  return (
    <motion.p
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="text-sm text-gray-300"
    >
      Developed by
      <a
        href="https://www.hansariafood.com"
        target="_blank"
        rel="noopener noreferrer"
        className="
          ml-1 font-semibold
          text-emerald-400 hover:text-emerald-300
          transition-all duration-300
          hover:drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]
        "
      >
        Hansaria Food Private Limited
      </a>
      <span className="ml-1 text-gray-400">
        © 2025 - {new Date().getFullYear()}
      </span>
    </motion.p>
  );
};

export default FooterCopyright;
