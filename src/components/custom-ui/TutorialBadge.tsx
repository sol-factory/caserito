"use client";
import { CONFIG } from "@/config/constanst";
import Image from "next/image";
import { Badge } from "../ui/badge";
import { cn } from "@/helpers/ui";
import { addEvent } from "@/helpers/api";
import { useStore } from "@/stores";
import usePermissions from "@/hooks/use-permissions";

const TutorialBadge = ({
  url,
  step = null,
  title = null,
  className = null,
  titleFont = null,
  tiny = null,
  custom_id,
  onlyOwners = false,
}: {
  url: string;
  step?: number;
  title?: string;
  titleFont?: string;
  custom_id: number;
  className?: string;
  tiny?: boolean;
  onlyOwners?: boolean;
}) => {
  const { isOwner } = usePermissions();
  const update = useStore((s) => s.update);
  const mainText = step ? `Tutorial ${step}` : title;
  if (onlyOwners && !isOwner) return <></>;
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-light gap-2 hover:bg-accent cursor-pointer rounded-full w-fit",
        className,
        tiny && "!text-[10px] py-0 px-2 gap-1"
      )}
      onClick={async () => {
        const videoId = url.split("/").pop();

        update("tutorial", { videoId: videoId });
        update("openDialog", "tutorial");
        await addEvent(navigator.userAgent, "aquapp", mainText, {
          isTutorial: true,
          tutorial_custom_id: custom_id,
        });
      }}
    >
      <Image
        src={`${CONFIG.blob_url}/youtube.png`}
        alt="Logo de Youtube"
        width={tiny ? 12 : 16}
        height={tiny ? 12 : 16}
      />{" "}
      <span>
        <span>
          <b className={`font-bold ${titleFont}`}>{mainText}</b>{" "}
          <span>{step ? ":" : ""}</span>
        </span>
      </span>
      {step ? title : ""}
    </Badge>
  );
};

export default TutorialBadge;
