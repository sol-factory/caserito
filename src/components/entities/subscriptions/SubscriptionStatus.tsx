"use client";
import { LoadingSpinner } from "@/components/custom-ui/Spinner";
import { Badge } from "@/components/ui/badge";
import api from "@/helpers/api";
import { notify } from "@/helpers/notify";
import { useStore } from "@/stores";
import { Edit } from "lucide-react";
import SendingLoader from "../templates/SendingLoader";

const SubscriptionStatus = ({ dbSub, status }) => {
  const loading = useStore((s) => s.loading);
  const update = useStore((s) => s.update);
  if (!status) return <></>;

  return (
    <div
      className="flex items-center gap-2 mt-1 cursor-pointer group"
      onClick={() => {
        update("edit_subscription", true);
        update("subscription", {
          ...dbSub,
          messages: dbSub.messages.limits.month.max,
          quotes: dbSub?.quotes?.limit?.max,
          files: dbSub?.files?.limit?.max,
        });
      }}
    >
      <Badge
        className={`${status.bg} ${status.color} hover:text-white w-fit rounded-full py-0`}
      >
        {status.text}
      </Badge>

      {status.text !== "Pausada" && (
        <div className="flex items-center gap-1 cursor-pointer group-hover:underline">
          <Edit className="w-3 h-3" strokeWidth={1} />
          <span className="text-xs font-extralight">Editar</span>
        </div>
      )}
      {dbSub.automatic && status.text === "Pausada" && (
        <div
          className="flex items-center gap-1 cursor-pointer group-hover:underline"
          onClick={async (e) => {
            e.stopPropagation();
            update("loading", "reactivating");
            const result = await api(
              {
                _id: dbSub?.subscription_id,
                amount:
                  dbSub?.amount +
                  dbSub?.messages?.amount +
                  dbSub?.quotes?.amount,
              },
              "subscription",
              "reactivate"
            );
            update("loading", "");

            if (!result.ok) {
              notify(result);
              return;
            }
            window.open(result.data, "_blank");
          }}
        >
          <span className="text-xs font-extralight">
            {loading === "reactivating" ? (
              <SendingLoader isSending />
            ) : (
              "Reactivar"
            )}
          </span>
        </div>
      )}
    </div>
  );
};

export default SubscriptionStatus;
