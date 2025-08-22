/* eslint-disable @next/next/no-img-element */
"use client";
import DeleteIcon from "@/components/custom-ui/DeleteIcon";
import { TableCell, TableRow } from "@/components/ui/table";
import { useStore } from "@/stores";
import Image from "next/image";

const BrandRow = ({ b }) => {
  const update = useStore((s) => s.update);
  return (
    <TableRow
      key={b._id}
      className="hover:cursor-pointer"
      onClick={async () => {
        update("brand", b);
        update("openDialog", "brand");
        update("creating", false);
      }}
    >
      <TableCell className="font-medium !max-w-8">
        {" "}
        <Image
          src={b.logo_url}
          alt="Logo marca"
          width={30}
          height={30}
          objectFit="cover"
        />
      </TableCell>

      <TableCell className="font-medium w-48">{b.name}</TableCell>
      <TableCell>
        <DeleteIcon
          onClick={(e) => {
            e.stopPropagation();
            update("deletion_id", b._id);
            update("deletion_entity", "brand");
            update("openSecondaryDialog", "delete");
          }}
        />
      </TableCell>
    </TableRow>
  );
};

export default BrandRow;
