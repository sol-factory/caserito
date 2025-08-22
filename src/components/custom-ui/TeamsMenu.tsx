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
import { ChevronsUpDown, MapPinHouse, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "../ui/badge";

import { notify } from "@/helpers/notify";
import api from "@/helpers/api";
import { useRouter } from "next/navigation";
import usePermissions from "@/hooks/use-permissions";

export const TeamsMenu = ({ user, company, memberships, id }) => {
  const { isOwner } = usePermissions();
  const update = useStore((s) => s.update);
  const openMenu = useStore((s) => s.openMenu);
  const router = useRouter();

  const canChangeStore = memberships?.length > 0;
  const canOpenMenu = canChangeStore || isOwner;

  return (
    <DropdownMenu
      open={openMenu === id}
      onOpenChange={(open) => {
        if (!open) {
          update("openMenu", "");
        }
      }}
    >
      <DropdownMenuTrigger
        asChild
        className={`${canChangeStore ? "" : "!cursor-auto"} w-full mb-2 !px-0 ml-1`}
        disabled={!canChangeStore}
        onClick={() => {
          if (canOpenMenu) {
            update("openMenu", id);
          }
        }}
      >
        <div
          className={`flex gap-3 rounded-md  py-1 px-1 ${canOpenMenu ? "!cursor-pointer" : ""}`}
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage
              src={user.company.logo_url}
              alt={user.company.name}
              className="w-8 object-contain"
            />
            <AvatarFallback className="rounded-lg">
              {user.company.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-left text-sm">
            <span className="truncate font-semibold text-nowrap max-w-28">
              {user.company.name}
            </span>
            <span className="truncate text-xs text-muted-foreground max-w-32">
              {user.store.name}
            </span>
          </div>
          {(canChangeStore || isOwner) && (
            <ChevronsUpDown className="ml-auto size-4 mt-1" />
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-auto min-w-64  rounded-lg"
        side="bottom"
        align="start"
        sideOffset={4}
      >
        <div className="flex items-center gap-3 pl-1.5 bg-white w-full py-1.5">
          <Avatar className="h-9 w-9 rounded-lg">
            <AvatarImage
              src={user.company.logo_url}
              alt={user.company.name}
              className="object-contain"
            />
            <AvatarFallback className="rounded-lg">
              {user.company.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-left text-sm">
            <span className="truncate font-semibold text-nowrap max-w-48">
              {user.company.name}
            </span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground pb-0">
          Sucursales
        </DropdownMenuLabel>
        <DropdownMenuItem
          key={user.store._id}
          className="flex justify-between pr-1 pb-2 hover:!bg-white"
          onClick={(e) => e.preventDefault()}
        >
          <div className="flex items-center gap-3">
            <MapPinHouse className="h-4 w-4" />{" "}
            <span className="truncate max-w-32">{user.store.name}</span>{" "}
          </div>
        </DropdownMenuItem>

        <DropdownMenuGroup className="pb-1">
          {memberships.map((m) => (
            <DropdownMenuItem
              key={m.store._id}
              className="flex justify-between pr-2 hover:!bg-white"
              onClick={(e) => e.preventDefault()}
            >
              <div className="flex items-center gap-3">
                <MapPinHouse className="h-4 w-4" />{" "}
                <span className="truncate max-w-32">{m.store.name}</span>{" "}
              </div>
              <Badge
                className="cursor-pointer"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const result = await api(
                    { data: m },
                    "user",
                    "changeLogin",
                    router
                  );
                  await notify(result);
                  update("openMenu", "");
                }}
              >
                Elegir
              </Badge>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        {isOwner && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex justify-between pr-1 pb-2 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                update("openDialog", "company");
                update("openDialogIndex", 0);
                update("creating", false);
                update("company", {
                  ...company,
                  phone: company?.phone_for_url,
                });
              }}
            >
              <div className="flex items-center gap-3">
                <Pencil className="h-4 w-4" />{" "}
                <span className="truncate max-w-48">Editar empresa</span>{" "}
              </div>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
