"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/stores";
import { ChevronsUpDown, CreditCard, LogOut, UserPen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MyFormDialog } from "@/components/custom-ui/MyFormDialog";
import { getFirstLetters } from "@/helpers/text";
import FreeTrialState from "./FreeTrialState";
import { useRouter } from "next/navigation";
import { getBooleanRoles } from "@/helpers/permissions";
import { notify } from "@/helpers/notify";
import { CONFIG, COUNTRIES } from "@/config/constanst";
import ResetSalesMenuItem from "../sales/ResetSalesMenuItem";
import useSubscription from "@/hooks/use-subscription";
import api from "@/helpers/api";
import Image from "next/image";
import { UAParser } from "ua-parser-js";
import usePermissions from "@/hooks/use-permissions";

const DEVICES = {
  mobile: "Celular",
  table: "Tablet",
};

const UserMenu = ({ user }) => {
  const sub = useSubscription();
  const update = useStore((s) => s.update);
  const router = useRouter();

  const { isOwner } = usePermissions();
  const activeSub = !!sub?.active;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="h-[2.75rem] sm:shadow-sm ">
        <div className="flex  ml-auto !place-self-end items-center gap-2 bg-white rounded-md sm:px-2 cursor-pointer">
          <Avatar className="w-8 h-8 rounded-lg">
            <AvatarImage
              src={user.avatar_url}
              alt={user.firstname}
              className="object-contain"
            />
            <AvatarFallback className="rounded-lg">
              {getFirstLetters([user.firstname, user.lastname, user.email])}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left text-sm leading-tight hidden sm:grid">
            <span className="truncate font-semibold">
              {user.firstname} {user.lastname}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          </div>
          <ChevronsUpDown className="hidden sm:flex ml-auto size-4" />
        </div>
      </DropdownMenuTrigger>
      <MyFormDialog form="user" hidden />
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side={true ? "bottom" : "right"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage
                src={user.avatar_url}
                alt={user.firstname}
                className="object-contain"
              />
              <AvatarFallback className="rounded-lg">
                {getFirstLetters([user.firstname, user.lastname, user.email])}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user.firstname}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="gap-3 cursor-pointer"
            onClick={() => {
              const country = COUNTRIES.find(
                (c) =>
                  c.code === (user?.phone?.country_code || user?.geo?.country)
              );

              update("openDialog", "user");
              update("openDialogIndex", 0);
              update("user", {
                ...user,
                country,
                phone: user.phone.phone,
                formatted_number: user.phone.formatted_number,
              });
              update("creating", false);
            }}
          >
            <UserPen />
            Perfil
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {isOwner && !activeSub && (
          <DropdownMenuItem
            className="gap-3 cursor-pointer"
            onClick={() => {
              router.push("/subscription");
              update("openMenu", "");
            }}
          >
            <CreditCard />
            <div className="flex flex-col">
              <span>Contratar suscripción</span>
              <FreeTrialState
                trial_start_date={sub?.trial_start_date}
                activeSub={!!sub?.active}
              />
            </div>
          </DropdownMenuItem>
        )}
        {isOwner && !activeSub && <ResetSalesMenuItem />}

        <DropdownMenuItem
          className="gap-3 cursor-pointer"
          onClick={async () => {
            const parser = new UAParser(navigator.userAgent);
            const { browser, device } = parser.getResult();

            window.open(
              `https://api.whatsapp.com/send/?phone=+5492215929233&text=${encodeURI(`Hola Martín, tengo una consulta sobre Aquapp 💧. 
${user.firstname ? `\nMi nombre es *${user.firstname} ${user.lastname || ""}*` : ""}
Estoy usando la app con este correo: ${user.email}.
Tengo el rol de *${user.role}* en la empresa *${user.company.name}*.

Estoy usando este dispositivo: *${DEVICES[device.type] || "Computadora"} ${device.vendor} ${device.model}*.
Mi navegador es: *${browser.name}* versión *${browser.version}*.

Espero tu respuesta 🙋🏻‍♂️
`)}`,
              "_blank"
            );
          }}
        >
          <Image
            src={`${CONFIG.blob_url}/whatsapp.png`}
            className="w-6"
            width={22}
            height={22}
            alt="Image"
          />
          Necesito ayuda
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-3 cursor-pointer hover:!text-red-600"
          onClick={async () => {
            update("loading", ""); // Por lo de no setear el loading a "" al iniciar sesión
            update("login", { email: "", code: "" });
            const result = await api(null, "user", "logout", router);
            if (result) {
              notify(result);
            }
          }}
        >
          <LogOut />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
