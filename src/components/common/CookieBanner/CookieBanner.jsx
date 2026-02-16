"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import policy from "@/data/cookiePolicy.json";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("cookieConsent");
      setVisible(consent !== "accepted");
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const handleAccept = () => {
    try {
      localStorage.setItem("cookieConsent", "accepted");
    } catch {}
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 inset-x-0 z-40 px-4"
        >
          <div className="max-w-3xl mx-auto rounded-2xl bg-gray-900 text-white shadow-2xl border border-gray-700 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1 text-sm">
              <p className="font-semibold text-sm">{policy.title}</p>
              <p className="text-xs text-gray-300 mt-1">{policy.description}</p>
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <button
                onClick={handleAccept}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-xs font-semibold"
              >
                {policy.acceptLabel}
              </button>
              <a
                href={policy.policyUrl}
                className="px-4 py-2 rounded-xl border border-gray-600 text-xs font-semibold text-gray-200 hover:bg-gray-800"
              >
                {policy.policyLinkLabel}
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
