"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleCheckBig } from "lucide-react";
import TutorialVideo from "../tutorials/TutorialVideo";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";

const Welcome = () => {
  const [showDialog, setShowDialog] = useState(false);
  const searchParams = useSearchParams();
  const show = searchParams.get("show");
  const pathname = usePathname();
  const router = useRouter();

  const closeDialog = () => {
    setShowDialog(false);
    router.push(pathname);
  };

  useEffect(() => {
    if (show === "welcome") {
      setShowDialog(true);
      const canvas = document.createElement("canvas");
      canvas.style.position = "fixed";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.pointerEvents = "none";
      canvas.style.zIndex = "900"; // 👈🏼 Menor que tu modal
      document.body.appendChild(canvas);

      const myConfetti = confetti.create(canvas, {
        resize: true,
        useWorker: true,
      });

      myConfetti({
        particleCount: 150,
        startVelocity: 30,
        spread: 360,
        origin: { x: 0.5, y: 0.3 },
        colors: ["#00bcd4", "#2196f3", "#ff9800", "#4caf50"],
      });
    }
  }, [show]);

  if (!showDialog) return <></>;

  return (
    <Dialog
      open={showDialog}
      onOpenChange={(open) => {
        if (!open) {
          closeDialog();
        }
      }}
    >
      <DialogContent className="max-w-sm flex flex-col items-center">
        <DialogTitle className="text-3xl">¡Felicitaciones! 🙌🏼</DialogTitle>

        <span className="mb-2 mt-2 block ">
          Ya diste tus primeros pasos con Aquapp...
        </span>
        <div className="w-full ml-10">
          <div className="flex items-center gap-2">
            <CircleCheckBig className="w-4 text-green-500" />
            <span>Creaste tu empresa</span>
          </div>
          <div className="flex items-center gap-2">
            <CircleCheckBig className="w-4 text-green-500" />
            <span>Creaste tu 1era sucursal</span>
          </div>
        </div>

        <span className="mt-5 block">
          <b className="underline">Siguiente paso</b>: configurar tus{" "}
          <b className="text-blue-600">Servicios</b>
        </span>
        <TutorialVideo
          videoId="jcY5ItMP5V8"
          custom_id={3}
          title={"Vió tutorial paso 3"}
        />
      </DialogContent>
    </Dialog>
  );
};

export default Welcome;
