"use client";

import { Switch } from "@/components/ui/switch";
import { CONFIG } from "@/config/constanst";
import { addEvent } from "@/helpers/api";
import { customNotify, notify } from "@/helpers/notify";
import { useStore } from "@/stores";
import Image from "next/image";
import { useId } from "react";
import toast from "react-hot-toast";

export default function SendingMode({}) {
  const id = useId();
  const sendingMode = useStore((s) => s.sendingMode);
  const wspNumber = useStore((s) => s.current_store.whatsapp_number);
  const update = useStore((s) => s.update);

  return (
    <div>
      <div className="relative inline-grid h-4 text-[10px] grid-cols-[1fr_1fr] items-center font-medium -mr-1">
        <Switch
          id={id}
          checked={sendingMode === "hand" || !wspNumber}
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (sendingMode === "hand" && !wspNumber) {
              const message = (
                <div className="flex items-start justify-center w-full relative gap-3">
                  <span className="text-xl">🧐</span>
                  <div className="flex flex-col">
                    <span>
                      Para activar el envío instantáneo debes vincular un número
                      de WhatsApp desde la pestaña de{" "}
                      <b className="underline">Plantillas</b>.
                    </span>
                    <div
                      className="flex items-center gap-1 group mt-3 cursor-pointer"
                      onClick={async () => {
                        update("tutorial", { videoId: "t3qd2KJTlTc" });
                        update("openDialog", "tutorial");
                        await addEvent(
                          navigator.userAgent,
                          "aquapp",
                          "Click LINK Whatsapp Toast",
                          {
                            isTutorial: true,
                            tutorial_custom_id: 10,
                          }
                        );
                        toast.dismiss();
                      }}
                    >
                      <Image
                        src={`${CONFIG.blob_url}/youtube.png`}
                        alt="Logo de Youtube"
                        width={12}
                        height={12}
                      />{" "}
                      <span className="group-hover:underline">
                        Ver tutorial
                      </span>
                    </div>
                  </div>
                </div>
              );
              await customNotify({ content: message }, 5000);
              return;
            }
            update(
              "sendingMode",
              sendingMode === "automatic" ? "hand" : "automatic"
            );
          }}
          className="peer data-[state=checked]:bg-gray-200 data-[state=unchecked]:bg-gray-200 absolute inset-0 h-[inherit] w-auto [&_span]:h-full [&_span]:w-1/2 [&_span]:transition-transform [&_span]:duration-300 [&_span]:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] [&_span]:data-[state=checked]:translate-x-full [&_span]:data-[state=checked]:rtl:-translate-x-full"
        />
        <span className="peer-data-[state=checked]:text-muted-foreground/70 pointer-events-none relative ms-0.5 flex min-w-6 items-center justify-center text-center">
          ⚡️
        </span>
        <span className="peer-data-[state=unchecked]:text-muted-foreground/70 pointer-events-none relative me-0.5 flex min-w-6 items-center justify-center text-center">
          ✋🏼
        </span>
      </div>
    </div>
  );
}
