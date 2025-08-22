"use client";

import { CONFIG } from "@/config/constanst";
import Image from "next/image";

const WhatsappNumberRow = ({ w, userEmail }) => {
  return (
    <div className="flex items-start px-2 justify-between py-2 border-b-violet-50 text-sm rounded-sm shadow w-full">
      <div className="flex flex-col w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Image
              src={`${CONFIG.blob_url}/whatsapp.png`}
              alt=""
              width={60}
              height={60}
              className="w-4 cursor-pointer rounded-sm "
            />
            <span translate="no" className="font-medium">
              {w?.number}
            </span>
          </div>
          <div
            className={`w-2 h-2 rounded-full transition-all duration-500 animate-pulse 
        ${w?.active_session ? "bg-green-400 shadow-green animate-glow" : "bg-red-400 shadow-red animate-glow"}`}
          ></div>
        </div>
        {Array.isArray(w.stores) && (
          <div className="flex items-center text-[0.6rem] -mt-0.5">
            <span className="font-medium underline">Sucursales</span>:
            <div className="flex items-center gap-1 ml-1">
              {w.stores.length > 0 ? (
                w.stores.map((s, index) => (
                  <span
                    key={s._id}
                    className="text-blue-600 font-extralight text-[0.6rem]"
                  >
                    {s.name}
                    {index < w.stores.length - 1 ? "," : ""}
                  </span>
                ))
              ) : (
                <span className="text-muted-foreground font-extralight text-[0.6rem] text-red-600 w-full leading-3">
                  aún sin asignar
                </span>
              )}
            </div>
          </div>
        )}

        {(!w.stores || w.stores?.length === 0) && (
          <span className="text-muted-foreground font-extralight text-[0.6rem] w-full leading-3 mt-2">
            Para asignar este número a 1 o más sucursales debes ir a la pestaña{" "}
            <b>Sucursales</b>.
          </span>
        )}
      </div>
    </div>
  );
};

export default WhatsappNumberRow;
