"use client";

import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";

const AuthWrapper = dynamic(
  () => import("@/components/AuthWrapper/AuthWrapper"),
  { loading: () => <Loading /> },
);
const GroupManager = dynamic(
  () => import("@/components/ui/GroupManager/GroupManager"),
  { loading: () => <Loading /> },
);

export default function GroupPage() {
  return (
    <AuthWrapper>
      <GroupManager />
    </AuthWrapper>
  );
}
