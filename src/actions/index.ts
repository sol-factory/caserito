"use server";
import { MongooseError } from "mongoose";
import connectDB from "@/lib/connectDB";
import { verifySession } from "@/helpers/auth";
import { ENTITIES, ENTITIES_KEYS } from "@/config";
import { ZodError } from "zod";
import { getRemainingDays } from "@/helpers/subscription";
import { ErrorModel } from "@/schemas/error";
import CompanyModel from "@/schemas/company";
import * as brand from "./brand";
import * as cashflow from "./cashflow";
import * as cashflowSubCategory from "./cashflow-sub-category";
import * as client from "./client";
import * as attachment from "./attachment";
import * as comment from "./comment";
import * as company from "./company";
import * as institution from "./institution";
import * as member from "./member";
import * as report from "./report";
import * as role from "./role";
import * as sale from "./sale";
import * as screen from "./screen";
import * as store from "./store";
import * as user from "./user";
import * as wallet from "./wallet";
import { SubscriptionModel } from "@/schemas/subscription";

const ACTIONS = {
  attachment,
  brand,
  cashflow,
  "cashflow-sub-category": cashflowSubCategory,
  client,
  comment,
  company,
  institution,
  member,
  report,
  role,
  sale,
  screen,
  store,
  user,
  wallet,
};

export const API_ROUTER = async (
  body,
  entity: ENTITIES_KEYS,
  action: string,
  fieldsIndex?: number
) => {
  let result;
  await connectDB();
  const user = await verifySession();
  if (
    action !== "login" &&
    action !== "getLoginCode" &&
    action !== "createEvent" &&
    entity !== "member"
  ) {
    if (!user) {
      return {
        ok: false,
        message: "Usuario sin autenticar",
        redirectTo: "/",
      };
    }
    if (
      action === "upsert" &&
      entity !== "company" &&
      user.email !== "mgesualdo14@gmail.com" &&
      user.email !== "ignaciogesualdo@gmail.com"
    ) {
      const company = await CompanyModel.findById(user.company._id, {
        trial_start_date: 1,
      });
      const remainingDays = getRemainingDays(company.trial_start_date);
      const activeStoreSub = await SubscriptionModel.exists({
        store_id: user.store._id,
        status: { $in: ["authorized", "ACTIVE"] },
      });

      if (!activeStoreSub) {
        if (remainingDays <= 0) {
          return {
            ok: false,
            message:
              "Necesita una suscripción activa en esta sucursal para utilizar la aplicación",
          };
        }
      }
    }
  }
  try {
    result = await ACTIONS[entity][action](body, user);
    return result;
  } catch (error) {
    console.log({ error });

    const errorData = {
      entity,
      action,
      body,
      error_type: error.name || "UnknownError",
      error_message: error.message,
      stack: error.stack,
      metadata: {
        keyPattern: error.keyPattern || null,
        keyValue: error.keyValue || null,
        issues: error instanceof ZodError ? error.issues : null,
      },
    };

    if (!!user) {
      errorData["user"] = user;
    }

    // Guardar el error en MongoDB
    try {
      await ErrorModel.create(errorData);
    } catch (dbError) {
      console.error("Error al guardar en la colección de errores:", dbError);
    }
    if (error instanceof MongooseError) {
      return { ok: false, message: error.message };
    }
    if (error instanceof ZodError) {
      return { ok: false, message: error.issues[0].message };
    }
    if (error.name === "MongoServerError" && error.code === 11000) {
      return {
        ok: false,
        message: `Ya existe el valor '${
          error.keyValue[Object.keys(error.keyPattern)[0]]
        }' para la entidad ${entity}`,
      };
    }
  }
};
