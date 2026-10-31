import React from "react";
import { motion } from "framer-motion";

const FooterCopyright = () => {
  return (
    <motion.p
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="text-center text-xs tracking-wide text-gray-400 sm:text-sm"
    >
      Developed by
      <a
        href="https://www.hansariafood.com"
        target="_blank"
        rel="noopener noreferrer"
        className="
          ml-1 font-semibold
          bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent
          transition-all duration-300
          hover:drop-shadow-[0_0_8px_rgba(52,211,153,0.55)]
        "
      >
        Hansaria Food Private Limited
      </a>
      <span className="ml-2 text-gray-500">
        © 2025 - {new Date().getFullYear()}
      </span>
    </motion.p>
  );
};

export default FooterCopyright;
