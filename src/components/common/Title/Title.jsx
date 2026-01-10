"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

const Title = ({ text }) => {
  const textRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (textRef.current) {
      setWidth(textRef.current.offsetWidth);
    }
  }, [text]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="w-full flex flex-col items-center justify-center text-center py-8"
    >
      <h2
        ref={textRef}
        className="
          font-heading
          text-3xl sm:text-4xl md:text-5xl
          font-semibold
          tracking-tight
          text-gray-900 dark:text-white
          leading-tight
          inline-block
        "
      >
        {text}
      </h2>

      <motion.span
        initial={{ width: 0, opacity: 0 }}
        whileInView={{ width, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
        className="
          mt-3 h-[3px]
          rounded-full
          bg-gradient-to-r from-emerald-500 via-green-600 to-lime-500
          shadow-[0_0_8px_rgba(34,197,94,0.35)]
        "
      />
    </motion.div>
  );
};

export default Title;
