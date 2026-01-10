"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Suspense } from "react";
import Loading from "../../Loading/Loading";

export default function Logo() {
  const { data: session } = useSession();

  return (
    <Suspense fallback={<Loading />}>
      <Link href={session ? "/dashboard" : "/"}>
        <motion.div
          whileHover={{
            scale: 1.06,
            filter: "drop-shadow(0 0 10px rgba(34,197,94,0.45))",
          }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className="cursor-pointer select-none"
        >
          <Image
            src="/logo/logo1.png"
            alt="Company Logo"
            width={120}
            height={60}
            priority
            className="transition-all duration-300"
          />
        </motion.div>
      </Link>
    </Suspense>
  );
}
