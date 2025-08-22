import { getBooleanRoles } from "@/helpers/permissions";
import ClientRow from "./ClientRow";
import NoRecordsFound from "@/components/custom-ui/NoRecordsFound";

export default async function ClientsTable({ user, clients }) {
  return (
    <>
      {clients.length > 0 ? (
        <div
          className={`flex flex-col mt-5 overflow-hidden max-h-[55vh]  ${
            clients.length >= 3 ? "overflow-y-scroll no-scrollbar" : ""
          }`}
        >
          {clients?.map((c, index) => (
            <ClientRow
              key={c._id}
              c={c}
              companyName={user.company.name}
              isLastOne={index === clients.length - 1}
            />
          ))}
        </div>
      ) : (
        <NoRecordsFound text="No se encontró ningún cliente" />
      )}
    </>
  );
}
