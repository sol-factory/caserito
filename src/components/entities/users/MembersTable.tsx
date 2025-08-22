import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import StoresList from "../stores/StoresList";
import DropdownRow from "@/components/custom-ui/DropdownRow";
import AttachmentsCounter from "../attachments/AttachmentsCounter";

export default async function MembersTable({ members, user }) {
  return (
    <div
      className={`flex flex-col mt-5 w-full ${
        members.length > 5 ? "overflow-y-scroll no-scrollbar" : ""
      }`}
    >
      {members?.map((m) => (
        <DropdownRow
          entity="member"
          item={m}
          key={m._id}
          companyName={m.company.name}
        >
          <div className="flex py-3 cursor-pointer border-b-violet-50 text-sm">
            <div className="w-10 p-0 hidden sm:flex">
              <Image
                src={!!m.avatar_url ? m.avatar_url : "/no-user.png"}
                alt="Avatar"
                width={30}
                height={30}
                className="w-8 h-8 overflow-hidden rounded  object-cover"
              />
            </div>
            <div className="font-medium w-52">
              <div className="flex flex-col">
                {m.firstname && (
                  <span>
                    {m.firstname} {m.lastname}
                  </span>
                )}

                <span className="text-[12px] text-gray-400 font-normal">
                  {m.email}
                </span>
                <AttachmentsCounter
                  count={m.attachments_count}
                  className="mt-[3px]"
                />
              </div>
            </div>

            <div className="w-32">
              <Badge variant="outline">{m.role.name}</Badge>
            </div>

            <StoresList stores={m.stores} />
          </div>
        </DropdownRow>
      ))}
    </div>
  );
}
