import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DiscountRow from "./DiscountRow";

export default async function DiscountsTable({ discounts }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Sucursales</TableHead>
          <TableHead className="w-20 text-center">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {discounts.map((d) => (
          <DiscountRow key={d._id} d={d} />
        ))}
      </TableBody>
    </Table>
  );
}
