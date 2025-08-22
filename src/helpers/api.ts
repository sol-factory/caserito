import { API_ROUTER } from "@/actions";
import { ENTITIES_KEYS } from "@/config";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { UAParser } from "ua-parser-js";

const api = async (
  body,
  entity: ENTITIES_KEYS,
  action: string,
  router?: AppRouterInstance,
  fieldsIndex: number = 0
) => {
  const result = await API_ROUTER(body, entity, action, fieldsIndex);
  if (!!result?.redirectTo) {
    router?.push(result.redirectTo);
  }
  if (!!result?.refresh) {
    router?.refresh();
  }
  return result;
};

export const addEvent = async (
  userAgent,
  origin: "ig" | "aquapp" | "yt" | "fb" | "wsp",
  name,
  metadata = null
) => {
  const parser = new UAParser(userAgent);
  const { browser, device, os, engine } = parser.getResult();

  let data = {
    browser: { ...browser },
    device: { ...device },
    os: { ...os },
    engine: { ...engine },
    origin,
    name,
  };

  if (metadata) {
    data = { ...data, ...metadata };
  }

  const result = await API_ROUTER(
    {
      data,
    },
    "user",
    "createEvent"
  );
};

export default api;
