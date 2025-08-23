"use client";

import { CONFIG } from "@/config/constanst";
import useSubscription from "@/hooks/use-subscription";
import { useStore } from "@/stores";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";
import { Progress } from "../ui/progress";
import usePermissions from "@/hooks/use-permissions";

interface Props {
  text: string;
  icon: ReactNode;
  href: string;
  showText?: boolean;
}

const AsideItem = ({ text, href, icon }: Props) => {
  const { can_view_quote, can_view_service, can_view_cashflow } =
    usePermissions();
  const globalSearchText = useStore((s) => s.globalSearchText);
  const sub = useSubscription();

  const update = useStore((s) => s.update);
  const path = usePathname();

  const router = useRouter();

  const currentPath = path.split("?")[0];
  const isSelected = currentPath === `/${href}`;

  const hide =
    (text === "Cotizaciones" && !can_view_quote) ||
    (text === "Servicios" && !can_view_service) ||
    (text === "Caja" && !can_view_cashflow);

  if (hide) return <></>;

  return (
    <div className="flex flex-col w-full">
      <div
        onClick={() => {
          let finalHref = `/${href}`;
          const lastHref = localStorage.getItem(`/${href}`);
          finalHref = lastHref ? `/${href}?${lastHref}` : finalHref;

          router.push(finalHref);
          update("sheetOpen", false);
          if (!!globalSearchText) {
            update("globalSearchText", "");
            const search_input = document.getElementById(
              "input-search"
            ) as HTMLInputElement;
            search_input.value = "";
          }
        }}
        className={`group gap-3 flex min-h-8 h-auto w-full cursor-pointer rounded-lg shrink-0 hover:bg-gray-100 items-center md:h-auto md:w-full px-2 md:text-sm ${
          isSelected ? " bg-gray-100" : ""
        } ${text === "Tutoriales" ? "mt-auto" : ""}`}
      >
        <span>{text}</span>
      </div>
    </div>
  );
};

export default AsideItem;
