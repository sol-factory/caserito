"use client";
import { useQuery } from "@tanstack/react-query";

import { useStore } from "@/stores";
import { ENTITIES } from "@/config";
import api from "@/helpers/api";
import { DialogTitle } from "@/components/ui/dialog";

const CashflowsSubCategriesTable = () => {
  const update = useStore((s) => s.update);
  const selectedId = useStore((s) => s["cashflow-sub-category"]?._id);

  const { data: clasifications } = useQuery({
    queryKey: ["cashflow-sub-categories"],
    staleTime: 0,
    queryFn: async () => {
      const data = await api({}, "cashflow", "getSubCategories");
      return data;
    },
  });

  if (clasifications?.length === 0)
    return (
      <span className="block text-center text-muted-foreground py-2 text-sm">
        Ninguna clasificación creada
      </span>
    );

  return (
    <div className="flex flex-col">
      <DialogTitle className="font-semibold text-lg mb-3">
        Categorías de egresos{" "}
        <span className="font-extralight text-muted-foreground ml-1">
          ({clasifications?.length})
        </span>
      </DialogTitle>

      <div className="-mt-1 mb-2 max-h-[14rem] overflow-y-scroll no-scrollbar">
        {Array.isArray(clasifications) &&
          clasifications?.map((c, index) => (
            <div
              key={c._id}
              className={`cursor-pointer justify-between hover:bg-accent flex items-center gap-3 py-2 px-3 ${
                index > 0 ? "border-t-[0.5px]" : ""
              } ${selectedId === c._id ? "bg-accent" : ""}`}
              onClick={() => {
                if (selectedId === c._id) {
                  update("creating", true);
                  update(
                    "cashflow-sub-category",
                    ENTITIES["cashflow-sub-category"].new()
                  );
                } else {
                  update("creating", false);
                  update("cashflow-sub-category", c);
                }
              }}
            >
              <div className="flex flex-col text-xs">
                <span
                  className={`font-bold ${c.category.name === "Inversión" ? "text-sky-700" : "text-red-700"}`}
                >
                  {c.category.name.toUpperCase()}
                </span>
                <span className="font-light">{c.name}</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default CashflowsSubCategriesTable;
