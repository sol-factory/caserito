/* eslint-disable @next/next/no-img-element */
"use client";
import DeleteIcon from "@/components/custom-ui/DeleteIcon";
import { TableCell, TableRow } from "@/components/ui/table";
import { useStore } from "@/stores";
import Image from "next/image";

const InstitutionRow = ({ i }) => {
  const update = useStore((s) => s.update);
  return (
    <TableRow
      className="hover:cursor-pointer"
      onClick={async () => {
        update("institution", i);
        update("openDialog", "institution");
        update("openDialogIndex", 0);
        update("creating", false);
      }}
    >
      <TableCell className="font-medium !max-w-8">
        {" "}
        <Image
          src={i.logo_url}
          alt="Logo marca"
          width={30}
          height={30}
          objectFit="cover"
        />
      </TableCell>

      <TableCell className="font-medium w-48">{i.name}</TableCell>
      <TableCell>
        <DeleteIcon
          onClick={(e) => {
            e.stopPropagation();
            update("deletion_id", i._id);
            update("deletion_entity", "institution");
            update("openSecondaryDialog", "delete");
          }}
        />
      </TableCell>
    </TableRow>
  );
};

export default InstitutionRow;
