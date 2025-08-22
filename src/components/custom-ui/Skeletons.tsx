import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

export function TableSkeletonComponent({
  rows = 3,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <>
      {[...Array(rows)].map((_, rowIndex) => (
        <TableRow key={rowIndex} className="border-t">
          {[...Array(columns)].map((_, colIndex) => (
            <TableCell key={colIndex} className="px-4 py-2 w-48">
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
export function DropdownSkeletonComponent({ count = 3 }: { count?: number }) {
  return (
    <>
      {[...Array(count)].map((_, colIndex) => (
        <Skeleton className="h-8 w-full mt-1" key={colIndex} />
      ))}
    </>
  );
}
