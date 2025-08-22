import { UserCog } from "lucide-react";

const Workers = ({ workers, shortName = false }) => {
  return (
    <div className="mt-2.5">
      {Array.isArray(workers) &&
        workers.map((w) => {
          let name = w.member_name || w.member_email;
          if (shortName) {
            name = name.split(" ")[0] || w.member_email.split("@")[0];
          }
          return (
            <div key={w._id} className="flex items-center gap-1 -mt-1">
              {!shortName && (
                <div>
                  <UserCog className="w-3.5 h-3.5" strokeWidth={1} />{" "}
                </div>
              )}
              <span
                className="text-orange-600 text-[0.7rem] font-extralight  text-nowrap truncate"
                translate="no"
              >
                {name}{" "}
                {w.percentage_to_pay && (
                  <span className="text-blue-600 font-extralight text-[0.65rem] ml-0.5">
                    ({w.percentage_to_pay}%)
                  </span>
                )}
              </span>
            </div>
          );
        })}
    </div>
  );
};

export default Workers;
