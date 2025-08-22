"use client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PlusCircle, Shapes } from "lucide-react";

import { useStore } from "@/stores";
import MyVideo from "./MyVideo";
import YouTube from "react-youtube";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useEffect } from "react";

const ICONS = {
  plus: <PlusCircle className="h-3.5 w-3.5" />,
  shapes: <Shapes className="h-3.5 w-3.5" />,
};

export function MyTutorialDialog() {
  const openDialog = useStore((s) => s.openDialog);

  const videoId = useStore((s) => s.tutorial.videoId);
  const update = useStore((s) => s.update);

  const closeDialog = () => {
    update("openDialog", "");
    update("tutorial", { videoId: "" });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeDialog();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!openDialog || openDialog !== "tutorial") return <></>;

  return (
    <dialog
      open={videoId && openDialog === "tutorial"}
      className="fixed -top-20 inset-0 z-[1000] bg-transparent flex items-center justify-center"
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-md"
        onClick={closeDialog} // Cerrar al hacer clic en el fondo
      />

      <div className="relative z-[1001] rounded-lg shadow-lg">
        <YouTube
          videoId={videoId}
          onReady={(e) => {
            e.target.playVideo();
          }}
          opts={{ player: { autoplay: 1, playsinline: 1 } }}
          iframeClassName="shadow-xl rounded-md w-[19.8rem] h-[11.1rem] max-w-full sm:w-[30rem] sm:h-[16.9rem] md:w-[40rem] md:h-[22.5rem] lg:w-[49rem] lg:h-[27.55rem]"
        />
      </div>
    </dialog>
  );
}
