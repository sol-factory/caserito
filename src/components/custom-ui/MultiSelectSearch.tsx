import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Input } from "../ui/input";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useStore } from "@/stores";

const MultiSelectSearch = ({
  singular,
  fastDebounce = false,
  placeholder = "",
}) => {
  const update = useStore((s) => s.update);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (search.length < 3 && search.length > 0) return;
    const handler = setTimeout(
      () => {
        update("searchText", search);
      },
      fastDebounce ? 300 : 500
    ); // Debounce de 300ms

    return () => clearTimeout(handler);
  }, [search, update]);

  return (
    <div className="relative flex-1 w-full">
      <MagnifyingGlassIcon className="absolute left-1.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <form
        className="flex items-center justify-end w-full"
        onSubmit={(e) => {
          e.preventDefault();
          update("searchText", search);
        }}
      >
        <Input
          onKeyDown={(e) => e.stopPropagation()}
          type="text"
          autoComplete="off"
          spellCheck="false"
          onChange={(e) => setSearch(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          value={search}
          id="my-input"
          autoFocus
          className="focus-visible:ring-0 border-0 outline-none pl-8 shadow-none placeholder:text-gray-400 font-light"
          placeholder={placeholder || `Buscar ${singular}...`}
        />

        {!!search && (
          <X
            size={16}
            className="text-muted-foreground cursor-pointer mr-3"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              update("searchText", "");
              setSearch("");
            }}
          />
        )}
      </form>
    </div>
  );
};

export default MultiSelectSearch;
