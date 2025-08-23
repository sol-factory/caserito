"use client";
import ServiceRow from "./ServiceRow";
import TutorialBadge from "@/components/custom-ui/TutorialBadge";
import { useStore } from "@/stores";
import { ArrowDown, Clock } from "lucide-react";

export default function ServicesTable({ services }) {
  const current_store = useStore((s) => s.current_store);
  return (
    <>
      {services.length > 0 ? (
        <div
          className={`flex flex-col mt-5 ${
            services.length >= 3 ? "overflow-y-scroll no-scrollbar" : ""
          }`}
        >
          {services?.map((s) => (
            <ServiceRow
              key={s._id}
              s={s}
              allow_multi_currency={current_store?.allow_multi_currency}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center mt-5">
          <div className="flex flex-col items-center">
            <span className="text-center"> Video más importante de Aquapp</span>
            <span className="text-muted-foreground font-extralight text-[12px]">
              <span className="font-normal underline">Duración </span>
              : <Clock
                className="inline-block w-3 ml-0.5"
                strokeWidth={1}
              />{" "}
              4:23 minutos
            </span>
          </div>
          <div className="mb-5 mt-2 animate-bounce-slow">
            <ArrowDown />
          </div>
        </div>
      )}
    </>
  );
}
