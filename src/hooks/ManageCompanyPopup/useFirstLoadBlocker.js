"use client";

import { useEffect, useState } from "react";

export function useFirstLoadBlocker(deps = []) {
  const [firstLoading, setFirstLoading] = useState(true);

  useEffect(() => {
    const allReady = deps.every((d) => d);
    if (allReady) {
      setFirstLoading(false);
    }
  }, [deps]);

  return firstLoading;
}
