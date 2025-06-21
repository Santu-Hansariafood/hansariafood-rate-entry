"use client";

import { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import Loading from "@/components/common/Loading/Loading";
import LazyWrapper from "@/components/common/LazyWrapper/LazyWrapper";

// Lazy load components for better performance
const Welcome = lazy(() => import("@/components/ui/Welcome/Welcome"));
const ViewRate = lazy(() => import("@/components/common/ViewRate/ViewRate"));
const RateEntryList = lazy(() => import("@/components/ui/RateEntryList/RateEntryList"));
const RateCalendar = lazy(() => import("@/components/common/RateCalendar/RateCalendar"));

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-6 space-y-8"
      >
        {/* Welcome Section - Load immediately */}
        <Suspense fallback={<Loading />}>
          <section role="region" aria-label="Welcome Section" className="mb-8">
            <Welcome />
          </section>
        </Suspense>

        {/* View Rate Section - Lazy load */}
        <LazyWrapper>
          <Suspense fallback={<Loading />}>
            <section role="region" aria-label="View Rate Section" className="mb-8">
              <ViewRate />
            </section>
          </Suspense>
        </LazyWrapper>

        {/* Rate Entry List - Lazy load */}
        <LazyWrapper>
          <Suspense fallback={<Loading />}>
            <section role="region" aria-label="Rate Entry List" className="mb-8">
              <RateEntryList />
            </section>
          </Suspense>
        </LazyWrapper>

        {/* Rate Calendar - Lazy load */}
        <LazyWrapper>
          <Suspense fallback={<Loading />}>
            <section role="region" aria-label="Rate Calendar">
              <RateCalendar />
            </section>
          </Suspense>
        </LazyWrapper>
      </motion.div>
    </div>
  );
};

export default Dashboard;