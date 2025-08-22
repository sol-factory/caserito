"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Cake, Image as ImageIcn, X } from "lucide-react";
import { CONFIG } from "@/config/constanst";
import Image from "next/image";
import { useStore } from "@/stores";
import { focusAfter } from "@/helpers/ui";

const MOTORBIKES = [
  {
    pre_name: `${CONFIG.blob_url}/vehicles/motoneta.png`,
    _id: "motoneta",
  },
  { pre_name: `${CONFIG.blob_url}/vehicles/moto.png`, _id: "moto" },
];

const CARS = [
  {
    pre_name: `${CONFIG.blob_url}/vehicles/auto-chico.png`,
    _id: "auto-chico",
  },
  { pre_name: `${CONFIG.blob_url}/vehicles/suv.png`, _id: "suv" },
];

const BANS = [
  {
    pre_name: `${CONFIG.blob_url}/vehicles/combi.png`,
    _id: "combi",
    width: 50,
    height: 40,
  },
  {
    pre_name: `${CONFIG.blob_url}/vehicles/pick-up.png`,
    _id: "pick-up",
    width: 50,
    height: 40,
  },
];

const TRUCKS = [
  {
    pre_name: `${CONFIG.blob_url}/vehicles/camion.png`,
    _id: "camion",
    width: 50,
    height: 40,
  },
  {
    pre_name: `${CONFIG.blob_url}/vehicles/camion-grande.png`,
    _id: "camion-grande",
    width: 50,
    height: 40,
  },
];

export default function DropdownVehicles() {
  const selected_id = useStore((s) => s["vehicle-kind"].classification_id);
  const update = useStore((s) => s.update);

  const handleMonthSelection = (vc: string) => {
    update("vehicle-kind", { classification_id: selected_id === vc ? "" : vc });
    focusAfter("kind_name", 200);
  };
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="w-full px-2 outline-none !ring-0"
          >
            {!selected_id && (
              <ImageIcn size={16} strokeWidth={1} aria-hidden="true" />
            )}
            {!!selected_id && (
              <Image
                width={30}
                height={23}
                alt={selected_id}
                src={`${CONFIG.blob_url}/vehicles/${selected_id}.png?h=as`}
              />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full" side="bottom" align="start">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="">
              Imagen representativa
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="flex flex-col gap-2 w-auto">
              <div className="flex gap-2">
                {MOTORBIKES.map(({ pre_name, _id }) => (
                  <DropdownMenuItem
                    className={`cursor-pointer w-20 text-3xl ${
                      _id === selected_id ? "bg-accent" : ""
                    }`}
                    key={pre_name}
                    onClick={() => handleMonthSelection(_id)}
                  >
                    <Image
                      className="mx-auto mt-auto"
                      width={50}
                      height={30}
                      alt={_id}
                      src={pre_name + "?h=as"}
                    />
                  </DropdownMenuItem>
                ))}
              </div>
              <div className="flex  gap-2">
                {CARS.map(({ pre_name, _id }) => (
                  <DropdownMenuItem
                    className={`cursor-pointer w-20 text-3xl ${
                      _id === selected_id ? "bg-accent" : ""
                    }`}
                    key={pre_name}
                    onClick={() => handleMonthSelection(_id)}
                  >
                    <Image
                      className="mx-auto mt-auto"
                      width={50}
                      height={30}
                      alt={_id}
                      src={pre_name + "?h=as"}
                    />
                  </DropdownMenuItem>
                ))}
              </div>
              <div className="flex  gap-2">
                {BANS.map(({ pre_name, _id }) => (
                  <DropdownMenuItem
                    className={`cursor-pointer w-20 text-3xl ${
                      _id === selected_id ? "bg-accent" : ""
                    }`}
                    key={pre_name}
                    onClick={() => handleMonthSelection(_id)}
                  >
                    <Image
                      className="mx-auto mt-auto"
                      width={50}
                      height={20}
                      alt={_id}
                      src={pre_name + "?h=as"}
                    />
                  </DropdownMenuItem>
                ))}
              </div>
              <div className="flex  gap-2">
                {TRUCKS.map(({ pre_name, _id }) => (
                  <DropdownMenuItem
                    className={`cursor-pointer w-20 text-3xl ${
                      _id === selected_id ? "bg-accent" : ""
                    }`}
                    key={pre_name}
                    onClick={() => handleMonthSelection(_id)}
                  >
                    <Image
                      className="mx-auto mt-auto"
                      width={50}
                      height={20}
                      alt={_id}
                      src={pre_name + "?h=as"}
                    />
                  </DropdownMenuItem>
                ))}
              </div>
            </div>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
