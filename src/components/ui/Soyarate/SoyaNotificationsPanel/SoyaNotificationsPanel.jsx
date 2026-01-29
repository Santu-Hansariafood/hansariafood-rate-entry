"use client";

import Loading from "@/components/common/Loading/Loading";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const NotificationsPanel = dynamic(
  () => import("@/components/common/NotificationsPanel/NotificationsPanel"),
  { ssr: false }
);

export default function DDGSNotificationsPanel({ notifications = [] }) {
  return (
    <Suspense fallback={<Loading />}>
      <NotificationsPanel notifications={notifications} />
    </Suspense>
  );
}
