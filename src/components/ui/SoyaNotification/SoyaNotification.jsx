import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

export default function SoyaNotification({ data }) {
  if (!data) return null;

  const { companyName, location, date, rate, commodity } = data;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `*${companyName}*\nLocation: ${location}\nDate: ${date}\nCommodity: ${commodity}\nRate: ${rate}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto my-4"
    >
      <div className="relative w-full aspect-[3/1] bg-gradient-to-r from-green-800 to-green-600 rounded-xl shadow-lg overflow-hidden flex flex-col justify-center px-8 text-white group">
        <button
            onClick={handleCopy}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-all z-10"
            title="Copy Notification Text"
        >
            {copied ? <Check className="w-5 h-5 text-green-300" /> : <Copy className="w-5 h-5 text-white" />}
        </button>

        <div className="absolute -bottom-8 -right-8 p-4 opacity-10 pointer-events-none">
          <svg
            width="200"
            height="200"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>

        <h3 className="text-xl md:text-3xl font-bold mb-1 md:mb-2 truncate pr-16">
          {companyName}
        </h3>
        
        <div className="flex flex-col">
            <div className="text-sm md:text-xl font-medium opacity-90">
                {location} • {date}
            </div>
            <div className="text-sm md:text-lg opacity-80">
                {commodity}
            </div>
        </div>

        <div className="mt-auto pt-2 md:pt-4 flex items-end justify-between relative z-10">
          <div className="text-xs md:text-sm font-light uppercase tracking-wider opacity-75">
            Rate Update
          </div>
          <div className="text-3xl md:text-5xl font-bold tracking-tight">
            ₹{rate}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
