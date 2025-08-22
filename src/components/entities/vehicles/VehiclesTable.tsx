"use client";
import { useStore } from "@/stores";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DeleteIcon from "@/components/custom-ui/DeleteIcon";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

import { ENTITIES } from "@/config";
import Image from "next/image";
import { CONFIG } from "@/config/constanst";
import { toSlug } from "@/helpers/text";
import api from "@/helpers/api";
import usePermissions from "@/hooks/use-permissions";

const VehiclesTable = ({ isOwner }) => {
  const { can_edit_client } = usePermissions();
  const userId = useStore((s) => s.client._id);
  const update = useStore((s) => s.update);

  const { data, refetch, isPending } = useQuery({
    queryKey: ["vehicle", userId],
    queryFn: async () => {
      const data = await api(userId, "vehicle", "getByUserId");

      return data || [];
    },
    enabled: true,
  });

  if (data?.length === 0)
    return (
      <div>
        <span className="block text-center text-muted-foreground mt-10 text-sm">
          Este cliente no posee ningún vehículo
        </span>
        <div className="flex justify-center items-center mt-7 ml-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              update("vehicle", {
                ...ENTITIES.vehicle.new(),
                user_id: userId,
                canCreate: true,
              });
              update("openDialog", "vehicle");
              update("openDialogIndex", 0);
              update("creating", true);
            }}
          >
            Nuevo vehículo
          </Button>
        </div>
      </div>
    );

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Marca y modelo</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data?.map((v) => (
            <TableRow
              key={v._id}
              onClick={() => {
                if (!can_edit_client) return;
                update("vehicle", {
                  ...v,
                  vehicle_kind: {
                    ...v.kind,
                    pre_name: `${CONFIG.blob_url}/vehicles/${v.kind.classification_id}.png`,
                  },
                  brand: {
                    ...v.brand,
                    pre_name: `${CONFIG.blob_url}${v.brand.blob_path}`,
                  },
                  insurance: v.insurance?._id
                    ? {
                        ...v.insurance,
                        pre_name: `${CONFIG.blob_url}/institutions/${v.insurance._id}.png`,
                      }
                    : null,
                  canUpdate: true,
                });
                update("openDialog", "vehicle");
                update("openDialogIndex", 0);
                update("creating", false);
              }}
              className="hover:cursor-pointer"
            >
              <TableCell className="font-medium w-full">
                <div className="flex items-center  gap-3">
                  <Image
                    src={`${CONFIG.blob_url}/brands/${toSlug(
                      v.brand.name
                    )}.png`}
                    alt="Logo marca"
                    width={32}
                    height={32}
                    objectFit="cover"
                  />
                  <div className="flex flex-col">
                    <span>{v.kind?.name || ""}</span>
                    <span className=" text-xs font-extralight text-muted-foreground">
                      {v.model}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="w-40">
                {isOwner && (
                  <DeleteIcon
                    onClick={(e) => {
                      e.stopPropagation();
                      update("deletion_id", v._id);
                      update("deletion_entity", "vehicle");
                      update("openSecondaryDialog", "delete");
                    }}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {can_edit_client && (
        <div className="flex justify-end items-center mt-7 ml-2">
          <Button
            size="sm"
            className="text-md hover:underline text-sm"
            onClick={() => {
              update("vehicle", { user_id: userId, ...ENTITIES.vehicle.new() });
              update("openDialog", "vehicle");
              update("openDialogIndex", 0);
              update("creating", true);
            }}
          >
            Nuevo vehículo
          </Button>
        </div>
      )}
    </div>
  );
};

export default VehiclesTable;
