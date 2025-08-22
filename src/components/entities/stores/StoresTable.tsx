import StoreRow from "./StoreRow";
import NoRecordsFound from "@/components/custom-ui/NoRecordsFound";

export default async function StoresTable({ stores }) {
  return (
    <>
      {stores.length > 0 ? (
        <div
          className={`flex flex-col mt-5 ${
            stores.length > 5 ? "overflow-y-scroll no-scrollbar" : ""
          }`}
        >
          {stores?.map((s) => <StoreRow key={s._id} s={s} />)}
        </div>
      ) : (
        <NoRecordsFound text="No se encontró ninguna sucursal" />
      )}
    </>
  );
}
