"use client";

import api from "@/helpers/api";
import { notify } from "@/helpers/notify";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const LogoutBtn = ({ user }) => {
  const router = useRouter();
  useEffect(() => {
    setTimeout(() => {
      const body = document.querySelector("body") as HTMLBodyElement;
      if (!!body) {
        body.style.pointerEvents = "auto";
      }
    }, 150);
  }, []);
  return (
    <div
      onClick={async () => {
        const result = await api({}, "user", "logout");
        await notify(result);
        router.push(result.redirectTo);
      }}
      className=" mt-10 text-gray-100 cursor-pointer font-extralight bottom-[6rem] z-[1000] hover:underline"
    >
      Cerrar sesión
    </div>
  );
};

export default LogoutBtn;
