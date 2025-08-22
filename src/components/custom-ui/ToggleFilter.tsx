"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CONFIG } from "@/config/constanst";
import { createQueryString, removeQueryString } from "@/helpers/url";
import { useStore } from "@/stores";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function ToggleFilter({
  param = null,
  entity = null,
  field = null,
}) {
  const fieldValue = useStore((s) => s[entity][field]);
  const update = useStore((s) => s.update);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const filterValue = searchParams.get("finished");

  return (
    <div className="relative flex w-full h-9 items-start gap-2 rounded-lg border border-input px-3 py-2 shadow-sm shadow-black/5">
      <Checkbox
        id="checkbox-14"
        className="order-1 after:absolute after:inset-0"
        checked={filterValue === "true" || fieldValue}
        aria-describedby="checkbox-14-description"
        onCheckedChange={(value) => {
          if (param) {
            if (value) {
              router.push(
                pathname +
                  "?" +
                  createQueryString(searchParams, "finished", "true", pathname)
              );
            } else {
              router.push(
                pathname +
                  "?" +
                  removeQueryString("finished", searchParams, pathname)
              );
            }
          } else {
            update(entity, { [field]: !fieldValue });
          }
        }}
      />
      <div className="flex grow items-center gap-3 w-5 lg:w-32">
        <Image
          src={`${CONFIG.blob_url}/race.png`}
          alt="Logo de Whatsapp"
          width={18}
          height={18}
        />
        <div className="gap-2 hidden lg:grid">
          <Label htmlFor="checkbox-14" className="font-normal">
            Finalizadas
          </Label>
        </div>
      </div>
    </div>
  );
}
