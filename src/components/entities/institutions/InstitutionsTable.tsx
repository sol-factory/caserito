import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import InstitutionRow from "./IntitutionRow";

export default async function InstitutionsTable({ institutions }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8"></TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead className="w-20 text-center">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {institutions.map((i) => (
          <InstitutionRow key={i._id} i={i} />
        ))}
      </TableBody>
    </Table>
  );
}
