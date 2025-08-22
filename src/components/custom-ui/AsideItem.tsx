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
        {!["Tutoriales", "Plantillas"].includes(text) && icon}
        {text === "Tutoriales" && (
          <Image
            src={`${CONFIG.blob_url}/youtube.png`}
            className="w-5"
            width={17}
            height={17}
            alt="Image"
          />
        )}
        {text === "Plantillas" && (
          <Image
            src={`${CONFIG.blob_url}/whatsapp.png`}
            className="w-[1.45rem]  -ml-0.5"
            width={20}
            height={20}
            alt="Image"
          />
        )}

        <span>{text}</span>
      </div>
      {text === "Suscripción" && sub && sub?.active && (
        <>
          <div className="flex items-center gap-1 mb-1 pl-10">
            <Image
              src={`${CONFIG.blob_url}/whatsapp.png`}
              alt=""
              width={16}
              height={16}
              className="w-3.5 cursor-pointer -ml-0.5"
            />
            <Progress
              value={(sub?.messages_count / sub?.messages) * 100}
              className="!w-12 bg-gray-50 !h-2.5 ring-[0.5px] ring-gray-300"
            />
            <span className="text-[0.65rem]">
              {sub?.messages_count} / {sub?.messages}
            </span>
          </div>
          <div className="flex items-center gap-1 mb-1 pl-10">
            <Image
              src={`${CONFIG.blob_url}/pdf2.png`}
              alt=""
              width={14}
              height={14}
              className="w-3.5 cursor-pointer -ml-0.5"
            />
            <Progress
              value={(sub?.quotes_count / sub?.quotes) * 100}
              className="!w-12 bg-gray-50 !h-2.5 ring-[0.5px] ring-gray-300"
            />
            <span className="text-[0.65rem]">
              {sub?.quotes_count} / {sub?.quotes}
            </span>
          </div>
          <div className="flex items-center gap-1 mb-1 pl-10">
            <Image
              src={`${CONFIG.blob_url}/attachment.png`}
              alt=""
              width={14}
              height={14}
              className="w-3.5 cursor-pointer -ml-0.5"
            />
            <Progress
              value={(sub?.files_count / sub?.files) * 100}
              className="!w-12 bg-gray-50 !h-2.5 ring-[0.5px] ring-gray-300"
            />
            <span className="text-[0.65rem]">
              {sub?.files_count} / {sub?.files}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default AsideItem;
