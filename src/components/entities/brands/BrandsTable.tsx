import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BrandRow from "./BrandRow";

export default async function BrandsTable({ brands }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-6">Logo</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead className="w-20 text-center">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {brands.map((b) => (
          <BrandRow key={b._id} b={b} />
        ))}
      </TableBody>
    </Table>
  );
}
