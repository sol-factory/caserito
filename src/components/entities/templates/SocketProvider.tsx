"use client";
import { notify } from "@/helpers/notify";
import { getSocket } from "@/helpers/socket";
import { useStore } from "@/stores";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

const SocketContext = createContext(null);

export const SocketProvider = ({ children, user, store, member, company }) => {
  const [socket, setSocket] = useState(null);
  const router = useRouter();
  const update = useStore((s) => s.update);
  const pathname = usePathname();

  useEffect(() => {
    const socketInstance = getSocket();

    socketInstance.on("disconnected", (result) => {
      if (pathname === "/templates") {
        router.push("/templates");
      }
    });
    socketInstance.on("mensaje-enviado", (result) => {
      if (!!result) {
        notify(result);
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    update("logged_user", user);
    update("user_member", member);
    update("current_store", store);
    update("current_company", company);
  }, [pathname, user, member, store, company]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
