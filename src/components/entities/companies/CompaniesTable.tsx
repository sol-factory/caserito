import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CompanyRow from "./CompanyRow";

export default async function CompaniesTable({ companies }) {
  return (
    <div
      className={`relative flex flex-col mt-5 overflow-hidden  ${
        companies.length > 5 ? "overflow-y-scroll no-scrollbar" : ""
      }`}
    >
      {companies?.map((c, index) => (
        <CompanyRow
          key={c._id}
          c={c}
          isLastOne={index === companies.length - 1}
        />
      ))}
    </div>
  );
}
