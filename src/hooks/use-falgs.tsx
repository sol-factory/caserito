import { COUNTRIES } from "@/config/constanst";
import { useStore } from "@/stores";

const useFlags = () => {
  const current_store = useStore((s) => s.current_store);

  const country = COUNTRIES.find((c) => c.code === current_store?.country_code);
  const getFlag = (currency?: string) => {
    if (currency === "usd") {
      return "🇺🇸";
    }
    return country?.flag || "🇦🇷"; // Default to Argentina flag if country not found
  };

  return { getFlag, country };
};

export default useFlags;
