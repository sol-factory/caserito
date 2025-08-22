"use client";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createQueryString } from "@/helpers/url";

const MySearchBar = () => {
  const searchParams = useSearchParams();
  const searchText = searchParams.get("search");
  const [search, setSearch] = useState(searchText || "");
  const router = useRouter();
  const pathname = usePathname();
  const since = searchParams.get("since");
  const to = searchParams.get("to");
  useEffect(() => {
    if ((since || to) && pathname === "/washes") {
      router.push(
        `/washes?${createQueryString("", ["date", "view"], [String(+new Date()), "daily"], pathname)}`
      );
    }
    return () => {};
  }, [since, to]);

  useEffect(() => {
    setSearch(searchText || "");
  }, [searchText]);

  const show = !["/reports", "/stores", "/vehicle-kinds"].includes(pathname);

  if (!show) return null;

  return (
    <div className="relative flex-1 w-full">
      <Search className="absolute left-2.5 top-2 sm:top-[0.7rem] h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const searchInput = document.getElementById(
            "input-search"
          ) as HTMLInputElement;
          router.push(pathname + `?search=${searchInput.value}`);
        }}
      >
        <Input
          id="input-search"
          type="search"
          placeholder="Buscar..."
          value={search}
          className="w-full rounded-lg bg-background pl-9 sm:pl-10 !py-1.5 h-8 sm:h-11"
          onChange={(e) => {
            setSearch(e.target.value);
            if (!e.target.value) {
              router.push(pathname);
            }
          }}
        />
        <button type="submit" className="hidden"></button>
      </form>
    </div>
  );
};

export default MySearchBar;
