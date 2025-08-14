"use client";

import React from "react";
import { motion } from "framer-motion";

const Title = ({ text }) => {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full flex items-center justify-center"
    >
      <h2
        className="
          text-3xl sm:text-4xl font-extrabold font-serif 
          text-center tracking-tight py-6 
          text-gray-900 dark:text-white
        "
        style={{
          textShadow: "0 1px 2px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.3)",
        }}
      >
        {text}
      </h2>
    </motion.div>
  );
};

export default Title;
