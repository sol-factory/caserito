"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import api from "@/helpers/api";

const MembershipItem = ({ member, current = false }) => {
  return (
    <div
      className={`flex items-center w-full gap-2 px-1 py-1.5 text-left text-sm ${
        !current ? "cursor-pointer" : ""
      }`}
      onClick={async (e) => {
        e.preventDefault();
        if (!current) {
          await api({ data: member }, "user", "changeLogin");
        }
      }}
    >
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarImage src={member.company.logo_url} alt={member.company.name} />
        <AvatarFallback className="rounded-lg">
          {member.company.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col text-left text-sm leading-tight w-full">
        <span
          className={`truncate font-semibold ${
            current ? "max-w-20" : "max-w-28"
          }`}
        >
          {member.company.name}
        </span>
        <span
          className={`truncate text-xs text-muted-foreground ${
            current ? "max-w-20" : "max-w-28"
          }`}
        >
          {member.store.name}
        </span>
      </div>
      {current && <Badge variant="outline">Actual</Badge>}
    </div>
  );
};

export default MembershipItem;
