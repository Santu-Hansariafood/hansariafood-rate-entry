import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

export default function Logo() {
  const { data: session } = useSession();
  return (
    <Link href={session ? "/dashboard" : "/"}>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Image
          src="/logo/logo.png"
          alt="Company Logo"
          width={120}
          height={60}
          priority
          className="transition-all duration-300"
        />
      </motion.div>
    </Link>
  );
}
