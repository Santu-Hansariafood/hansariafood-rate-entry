"use client";

import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";

const NotificationList = dynamic(
  () => import("@/components/NotificationList/NotificationList"),
  { loading: () => <Loading /> },
);

export default function RateViewLayout({
  children,
  header,
  pagination,
  notifications,
}) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="min-w-0 flex-1 space-y-4">
        {header}
        {pagination}
        {children}
      </div>
      <aside className="w-full shrink-0 lg:w-[300px]">
        <NotificationList notifications={notifications} />
      </aside>
    </div>
  );
}
