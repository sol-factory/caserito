"use client";

import api from "@/helpers/api";
import { useStore } from "@/stores";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";

const useSubscription = () => {
  const update = useStore((s) => s.update);
  const pathname = usePathname();
  const { data } = useQuery({
    queryKey: ["subscription", pathname],
    queryFn: async () => {
      const data = await api({}, "subscription", "getSubscriptionInfo");

      update("subscription", data.data);
      return data.data || [];
    },
    enabled: true,
  });

  return data;
};

export default useSubscription;
