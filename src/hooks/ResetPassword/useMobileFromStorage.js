"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const useMobileFromStorage = () => {
  const [mobile, setMobile] = useState("");

  useEffect(() => {
    const storedMobile = localStorage.getItem("mobile");
    if (storedMobile) {
      setMobile(storedMobile);
    } else {
      toast.error("No mobile number found in local storage", {
        position: "top-center",
      });
    }
  }, []);

  return mobile;
};

export default useMobileFromStorage;
