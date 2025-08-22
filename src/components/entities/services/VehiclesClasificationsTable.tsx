"use client";
import { useQuery } from "@tanstack/react-query";

import { useStore } from "@/stores";
import Image from "next/image";
import DeleteIcon from "@/components/custom-ui/DeleteIcon";
import { ENTITIES } from "@/config";
import { ImageIcon } from "lucide-react";
import api from "@/helpers/api";
import SendingLoader from "../templates/SendingLoader";

const VehiclesClasificationsTable = () => {
  const update = useStore((s) => s.update);
  const selectedId = useStore((s) => s["vehicle-kind"]._id);

  const { data: clasifications, isPending } = useQuery({
    queryKey: ["clasifications"],
    staleTime: 0,
    queryFn: async () => {
      const data = await api({}, "vehicle-kind", "getItems");
      return data;
    },
  });

  if (isPending && !clasifications) {
    return (
      <div className="flex w-full items-center justify-center h-10">
        <SendingLoader isSending={true} />
      </div>
    );
  }
  if (clasifications?.length === 0)
    return (
      <span className="block text-center font-light text-muted-foreground pt-3 pb-6 text-sm">
        Ninguna clasificación creada
      </span>
    );

  return (
    <div className="-mt-1 mb-2">
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
                update("vehicle-kind", ENTITIES["vehicle-kind"].new());
              } else {
                update("creating", false);
                update("vehicle-kind", c);
              }
            }}
          >
            <div className="flex items-center gap-2">
              <div className="w-7">
                {c.classification_id ? (
                  <Image width={20} height={16} alt={c} src={c.pre_name} />
                ) : (
                  <ImageIcon size={20} className="w-5" strokeWidth={1} />
                )}
              </div>
              <span>{c.name}</span>
            </div>
            <DeleteIcon
              tiny
              onClick={(e) => {
                e.stopPropagation();
                update("deletion_id", c._id);
                update("deletion_entity", "vehicle-kind");
                update("openSecondaryDialog", "delete");
                update("deletion_query_refetch", ["vehicle-kind"]);
              }}
            />
          </div>
        ))}
    </div>
  );
};

export default VehiclesClasificationsTable;
