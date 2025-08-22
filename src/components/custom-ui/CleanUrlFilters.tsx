"use client";
import { X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const CleanUrlFilters = () => {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div
      className="flex items-center gap-1 text-sm group cursor-pointer text-muted-foreground ml-1"
      onClick={() => {
        router.push(`${pathname}`);
        localStorage.setItem(pathname, "");
      }}
    >
      <span className="hover:underline hover:text-gray-800 font-light text-xs sm:text-base">
        Borrar filtro
      </span>
      <X className="h-3 w-3 group-hover:text-red-500 " />
    </div>
  );
};

export default CleanUrlFilters;
