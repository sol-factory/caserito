import { focusAfter } from "@/helpers/ui";
import { useStore } from "@/stores";
import { useSearchParams } from "next/navigation";
import React, { useEffect } from "react";

const useCheckParam = () => {
  const update = useStore((s) => s.update);
  const searchParams = useSearchParams();
  const emailFromParams = searchParams.get("email");
  const codeFromParams = searchParams.get("code");

  useEffect(() => {
    if (!!emailFromParams && codeFromParams === "letmein") {
      update("login", { email: emailFromParams, code: "111333" });
      focusAfter("already-has-code", 0, true);
      focusAfter("login-btn", 15, true);
    }
  }, [emailFromParams]);
  return null;
};

export default useCheckParam;
