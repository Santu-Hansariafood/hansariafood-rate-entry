"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          onClick={scrollToTop}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 z-50 
            bg-white dark:bg-gray-800 
            border border-gray-300 dark:border-gray-600 
            rounded-full p-3 shadow-lg hover:shadow-xl 
            transition-all"
        >
          <Image
            src="/logo/logo1.png"
            alt="Scroll to top"
            width={32}
            height={32}
            className="rounded-full scale-125 hover:scale-150 transition-transform duration-300"
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;
