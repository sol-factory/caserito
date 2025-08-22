"use client";

import { CONFIG } from "@/config/constanst";
import { addEvent } from "@/helpers/api";
import Image from "next/image";
import VideoDuration from "./VideoDuration";
import { useStore } from "@/stores";
import { getDurationAsText } from "./TutorialsAccordion";

const TutorialsTable = ({ tutorials, showStep = true }) => {
  const update = useStore((s) => s.update);
  return (
    <div
      className={`flex flex-col mt-3 ${
        tutorials.length > 5 ? "overflow-y-scroll no-scrollbar" : ""
      }`}
    >
      {Array.isArray(tutorials) &&
        tutorials?.map((t, index) => (
          <div
            key={t._id}
            onClick={async (e) => {
              e.stopPropagation();
              const videoId = t.url.split("/").pop();

              update("tutorial", { videoId: videoId });
              update("openDialog", "tutorial");

              await addEvent(
                navigator.userAgent,
                "aquapp",
                `Tutorial paso ${t.step || 0}`,
                {
                  isTutorial: true,
                  tutorial_custom_id: t.custom_id,
                }
              );
            }}
            className={`flex h-auto !px-2 justify-between py-3 cursor-pointer hover:bg-accent text-sm ${index !== tutorials.length - 1 ? "border-b-[0.5px]" : ""}`}
          >
            <div className="flex">
              <div className="flex flex-col items-center mt-1 mr-3">
                <Image
                  src={`${CONFIG.blob_url}/youtube.png`}
                  className="w-5 "
                  width={17}
                  height={17}
                  alt="Image"
                />
                <span className="text-[10px] sm:hidden font-extralight text-muted-foreground">
                  {getDurationAsText([t])}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row w-full sm:w-72 md:w-96">
                {t.step && showStep && (
                  <span className="mr-2">
                    <b className="underline">Paso {t.step}</b>:
                  </span>
                )}
                <span>{t.title}</span>
              </div>
            </div>
            <VideoDuration duration={t.duration} />
          </div>
        ))}
    </div>
  );
};

export default TutorialsTable;
