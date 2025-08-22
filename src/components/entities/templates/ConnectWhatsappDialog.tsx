"use client";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { useSocket } from "./SocketProvider";
import { useStore } from "@/stores";
import { CONFIG } from "@/config/constanst";
import WhatsappNumbersTable from "./WhatsappNumbersTable";
import api from "@/helpers/api";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { notify } from "@/helpers/notify";
import SendingLoader from "./SendingLoader";

export default function ConnectWhatsappDialog({ companyId, user }) {
  const socket = useSocket();
  const update = useStore((s) => s.update);
  const openDialog = useStore((s) => s.openDialog);
  const [qrCode, setQrCode] = useState(null);
  const [wspNumberId, setWspNumberId] = useState("");
  const connectingWsp = useStore((s) => s.connectingWsp);

  const { data: whatsapp_numbers, refetch } = useQuery({
    queryKey: ["whatsapp_numbers", user.store?._id],
    staleTime: 0,
    queryFn: async () => {
      const data = await api(
        { filterId: user.store._id },
        "template",
        "getWhatsappNumbers"
      );
      return data;
    },
    enabled: !!user.store?._id,
  });

  const connectToWhatsapp = (e?: any) => {
    e.preventDefault();
    e.stopPropagation();
    update("connectingWsp", true);

    const connectBody = {
      companyId,
      storeId: user.store._id,
      companyName: user.company.name,
    };

    if (socket.connected) {
      socket.emit("nueva-conexion", connectBody);
    } else {
      socket.once("connect", () => {
        console.log("Socket reconectado, enviando evento...");
        socket.emit("nueva-conexion", connectBody);
      });
      socket.connect(); // Forzar reconexión si es necesario
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("connected", (result) => {
        if (!!result) {
          notify(result);
        }
        refetch().then(() => {
          update("connectingWsp", false);
          setQrCode("");
        });
      });

      socket.on("wspNumberId", ({ wspNumberId }) => {
        setWspNumberId(wspNumberId);
      });

      socket.on("qr", (qr) => {
        setQrCode(qr);
      });

      return () => {
        socket.off("qr");
        socket.off("connected");
      };
    }
  }, [socket]);

  return (
    <Dialog
      open={openDialog === "qr"}
      onOpenChange={(open) => {
        if (!open) {
          socket.emit("cancelar-qr", { wspNumberId });
          update("openDialog", "");
        }
      }}
    >
      <DialogTrigger asChild onClick={() => update("openDialog", "qr")}>
        <Button variant="secondary" className="px-2">
          <div className="w-5 h-5">
            <Image
              src={`${CONFIG.blob_url}/whatsapp.png`}
              alt="Logo Whatsapp"
              width={20}
              height={20}
              className="w-full"
            />
          </div>
          <span className="hidden md:inline-flex">Números vinculados</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:w-72 flex flex-col outline-none">
        <DialogTitle className="flex items-center gap-1 font-semibold text-lg">
          Número vinculado
        </DialogTitle>
        <WhatsappNumbersTable whatsapp_numbers={whatsapp_numbers} user={user} />
        {!qrCode && whatsapp_numbers?.length === 0 && (
          <Button
            onClick={connectToWhatsapp}
            variant="default"
            className="mb-0 !block"
          >
            <h1>Vincular número de Whatsapp</h1>
          </Button>
        )}
        {!!qrCode && (
          <div className="flex flex-col items-center justify-center">
            <DialogTitle className="font-semibold !text-md text-center">
              Vinculando nuevo número
            </DialogTitle>
            <span className="!text-xs font-extralight text-muted-foreground mt-1">
              Abrí tu Whatsapp y escaneá el QR
            </span>
            <div className="relative">
              <Image
                className="w-60 h-60"
                src={qrCode}
                width={250}
                height={250}
                alt="qr-whatsapp"
              />

              <Image
                src={`${CONFIG.blob_url}/whatsapp.png`}
                alt="Logo de Whatsapp"
                width={40}
                height={40}
                className="absolute top-[40%] left-[43%] w-10 h-10"
              />
            </div>
          </div>
        )}
        {!qrCode && connectingWsp && (
          <div className="h-60 w-60 flex items-center justify-center">
            <SendingLoader isSending={true} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
