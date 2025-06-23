"use client";

import React from "react";
import { motion } from "framer-motion";

const Title = ({ text }) => {
  return (
    <motion.h2
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="text-3xl sm:text-4xl font-extrabold mb-6 text-center bg-gradient-to-r from-green-500 via-green-600 to-green-500 text-transparent bg-clip-text drop-shadow-[2px_2px_1px_rgba(0,0,0,0.3)]"
    >
      {text}
    </motion.h2>
  );
};

export default Title;
