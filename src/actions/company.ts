import { revalidatePath } from "next/cache";
import { upsertBlob } from "@/helpers/blobs";
import CompanyModel from "@/schemas/company";
import StoreModel from "@/schemas/store";
import { MemberModel } from "@/schemas/member";
import { createJWTandSession, generateTokenPayload } from "@/helpers/auth";
import RoleModel from "@/schemas/role";
import TemplateModel from "@/schemas/template";
import { cleanRegExp, cleanText } from "@/helpers/text";
import WalletModel from "@/schemas/wallet";
import { UserModel } from "@/schemas/user";
import {
  abortTransaction,
  commitTransaction,
  getAquappExchangeRate,
  startTransaction,
} from "@/helpers/mdb";
import DiscountModel from "@/schemas/discount";
import { genTemplatePlaceholder } from "@/helpers/ui";
import { CONFIG, COUNTRIES } from "@/config/constanst";
import { getFullDate } from "@/helpers/date";
import { headers } from "next/headers";
import EventModel from "@/schemas/event";
import { addDays } from "date-fns";
import VehicleKindModel from "@/schemas/vehicle-kind";

export const upsert = async ({ data, form }, user) => {
  const { _id, country, formatted_number, phone } = data;

  const companyPhone = {
    country_code: country?.code,
    formatted_number,
    phone,
  };
  const h = await headers();
  const ip = h.get("x-forwarded-for");

  const foundMember = await MemberModel.findOne({
    "user.email": user.email,
    deleted: false,
  });
  if (!!foundMember && !_id) {
    const payload = generateTokenPayload(
      user,
      foundMember
        ? {
            company: foundMember.company,
            role: foundMember.role,
            store: !!_id ? user.store : foundMember.stores[0],
          }
        : null
    );

    await createJWTandSession(payload);
    return { ok: false, redirectTo: "/services" };
  }
  const logo = form.get("logo");

  let blob_id;
  let company, store, url;

  const session = await startTransaction();
  try {
    const userDB = await UserModel.findOne({ email: user.email });
    if (!_id) {
      const firstEvent = await EventModel.findOne({
        ip,
      });
      const sawCompTutorial = await EventModel.exists({
        name: "Tutorial paso 1",
        ip,
      });
      const sawIntro = await EventModel.exists({
        name: "Introducción Aquapp",
        ip,
      });
      const tutorials_clicked = [];
      if (sawIntro) {
        tutorials_clicked.push(1);
      }
      if (sawCompTutorial) {
        tutorials_clicked.push(2);
      }
      const province = data.province?.replace("Provincia de ", "");
      const newCompany = new CompanyModel({
        ...data,
        phone: companyPhone,
        creator: userDB.getBasicInfo(),
        country: country.code,
        city: data.city,
        province,
        lat: data.lat,
        lng: data.lng,
        full_creation_date: getFullDate(),
        created_from_ip: ip,
        "statistics.tutorials_clicked": tutorials_clicked,
        origin_event_name: firstEvent?.name,
        search_field: cleanText(`${data.name} ${phone} ${userDB.email}`),
      });

      company = await newCompany.save({ session });
      if (!!phone) {
        userDB.phone = companyPhone;
        await userDB.save({ session });
      }

      blob_id = company._id;

      const fullCountryData = COUNTRIES.find(
        (c) => c.code === data.country_code
      );

      const aquapp_rate = await getAquappExchangeRate(new Date());

      const currency = fullCountryData?.currency_code?.toLowerCase();

      const newStore = new StoreModel({
        name: data.address,
        address: data.address,
        city: data.city,
        province,
        country: data.country_name,
        country_code: data.country_code,
        location: {
          type: "Point",
          coordinates: [data.lng, data.lat], // [lng, lat] — ¡importante el orden!
        },
        lat: data.lat,
        lng: data.lng,
        currency,
        usd_exchange_rate: aquapp_rate,
        country_flag: fullCountryData.flag,
        company_id: company._id,
        activated: true,
      });
      store = await newStore.save({ session });

      await VehicleKindModel.insertMany(
        [
          {
            company_id: company._id,
            name: "Moto",
            classification_id: "motoneta",
            deleted: false,
          },
          {
            company_id: company._id,
            name: "Auto",
            classification_id: "auto-chico",
            deleted: false,
          },
          {
            company_id: company._id,
            name: "SUV",
            classification_id: "suv",
            deleted: false,
          },
          {
            company_id: company._id,
            name: "Camioneta",
            classification_id: "pick-up",
            deleted: false,
          },
        ],
        { session }
      );

      // Creamos templates de WHATSAPP
      const clientNamePlaceholder =
        genTemplatePlaceholder("Nombre del cliente");
      const vehicleDataPlaceholder =
        genTemplatePlaceholder("Datos del vehículo");
      const saleDatePlaceholder = genTemplatePlaceholder("Fecha de la venta");

      const companyNamePlaceholder = genTemplatePlaceholder(
        "Nombre de la empresa"
      );

      const saleDetailPlaceholder = genTemplatePlaceholder(
        "Detalle de la venta"
      );

      await TemplateModel.insertMany(
        [
          {
            of: "Whatsapp",
            name: "Iniciar conversación",
            content: `Hola *${clientNamePlaceholder}*,  `,
            company_id: company._id,
            stores: [store],
            screens: [
              CONFIG.screens.sales,
              CONFIG.screens.clients,
              CONFIG.screens.members,
            ],
          },
          {
            of: "Whatsapp",
            name: "Retirar vehículo",
            content: `Hola *${clientNamePlaceholder}*, queríamos avisarte que tu vehículo ${vehicleDataPlaceholder} ya está listo para ser retirado 🚗✨<br>
*Detalle de tu ticket*:<br>${saleDetailPlaceholder}<br>Te esperamos, *${companyNamePlaceholder}* 🙋🏻‍♂️`,
            company_id: company._id,
            stores: [store],
            screens: [CONFIG.screens.sales],
            locked: true,
          },
          {
            of: "Whatsapp",
            name: "Recordatorio turno",
            content: `Hola *${clientNamePlaceholder}*, recordá que ${saleDatePlaceholder} tenés turno para traer tu ${vehicleDataPlaceholder}.<br>
*Detalle de tu ticket*:<br>${saleDetailPlaceholder}<br>Te esperamos, *${companyNamePlaceholder}* 🙋🏻‍♂️`,
            company_id: company._id,
            stores: [store],
            screens: [CONFIG.screens.sales],
            locked: true,
          },
          {
            of: "Whatsapp",
            name: "Descuento cumpleaños",
            content: `🎉✨ ¡Feliz mes de tu cumpleaños, *${clientNamePlaceholder}*! 🎂🥳<br>
¡Tienes un 15% en este mes por tu cumple!<br>
En *${companyNamePlaceholder}*, queremos celebrarlo contigo. Por eso, te regalamos un 15% de descuento en tu próximo servicio durante este mes especial. 🚗💦<br>
👉 Para aprovechar este beneficio, ven a nuestro local o escríbenos respondiendo a este mensaje.<br>
¡Te esperamos para que empieces tu nuevo año con un auto impecable! 🎁`,
            company_id: company._id,
            stores: [store],
            screens: [CONFIG.screens.clients],
            locked: true,
          },
          {
            of: "Whatsapp",
            name: "Enviar presupuesto",
            content: `Hola *${clientNamePlaceholder}*, tal como acordamos acá te envío la cotización en PDF.<br>
Cualquier duda que tengas avisame y lo vemos 🙋🏻‍♂️.
`,
            company_id: company._id,
            stores: [store],
            screens: [CONFIG.screens.quotes],
            locked: true,
          },
        ],
        { session }
      );

      // Creamos Wallet y le asignamos la store inicial
      await WalletModel.insertMany(
        [
          {
            name: "Efectivo",
            company_id: company._id,
            currency,
            stores: [store],
          },
          {
            name: "Efectivo",
            company_id: company._id,
            currency: "usd",
            stores: [store],
          },
        ],
        { session }
      );

      // Insertamos un descuento por cumpleaños a modo de ejemplo
      const discount = new DiscountModel({
        name: "Cumpleaños",
        kind: "%",
        value: 15,
        stores: [store],
        company_id: company._id,
        locked: true,
      });
      await discount.save({ session });
      const variableDiscount = new DiscountModel({
        name: "De monto variable",
        kind: "$",
        value: 0,
        stores: [store],
        company_id: company._id,
        locked: true,
      });
      await discount.save({ session });
      await variableDiscount.save({ session });
    } else {
      company = await CompanyModel.findByIdAndUpdate(
        _id,
        {
          name: data.name,
          phone: companyPhone,
          fiscal_id: data.fiscal_id,
          fiscal_category: data.fiscal_category,
          search_field: cleanText(`${data.name} ${phone} ${userDB.email}`),
        },
        { new: true, session }
      );
      blob_id = _id;
    }

    const companyInfo = {
      _id: company._id,
      name: company.name,
      logo_url: company.logo_url,
      country: company.country,
      createdAt: company.createdAt,
    };

    if (logo?.size > 0) {
      url = await upsertBlob(logo, `/companies/${blob_id}`, true);
      company = await CompanyModel.findByIdAndUpdate(
        company._id,
        { logo_url: url },
        { new: true, session }
      );
      companyInfo["logo_url"] = url;
    }

    let member;
    if (!_id) {
      const newMember = new MemberModel({
        user: { email: user.email },
        company: companyInfo,
        role: await RoleModel.findOne({ name: "Socio" }),
        stores: [{ _id: store._id, name: store.name }],
      });
      member = await newMember.save({ session, new: true });
    } else {
      member = await MemberModel.findOneAndUpdate(
        { "user.email": user.email },
        { $set: { company: companyInfo } },
        { new: true, session }
      );
    }

    const payload = generateTokenPayload(
      user,
      member
        ? {
            company: member.company,
            role: member.role,
            store: !!_id ? user.store : member.stores[0],
          }
        : null
    );

    await createJWTandSession(payload);

    revalidatePath("/");
    await commitTransaction(session);
    return {
      ok: true,
      message: `Empresa ${_id ? "editada" : "creada"}`,
      redirectTo: !_id ? "/tutorials?show=welcome" : undefined,
      refresh: !!_id,
    };
  } catch (error) {
    await abortTransaction(session);
    throw error;
  }
};

export const remove = async (_id: string, user) => {
  await CompanyModel.findByIdAndUpdate(_id, {
    deleted: true,
    deleted_at: new Date(),
    deleted_by: user._id,
  });

  revalidatePath("/");
  return { ok: true, message: "Empresa eliminada" };
};

export const extendTrial = async (_id: string) => {
  const company = await CompanyModel.findById(_id);

  company.trial_start_date = addDays(new Date(), -7);
  await company.save();

  revalidatePath("/admin");
  return { ok: true, message: "7 días de prueba otorgados" };
};
export const activateManually = async (_id: string) => {
  const company = await CompanyModel.findById(_id);
  await CompanyModel.findByIdAndUpdate(_id, {
    $set: {
      "subscription.active": !company.subscription.active,
      "subscription.status": "authorized",
      "subscription.manually_activated": true,
    },
  });

  revalidatePath("/admin");
  return { ok: true, message: "Suscripción activada" };
};

export const getItems = async ({ filterId, searchText }) => {
  let pipeline = [];

  if (!!searchText) {
    const regex = cleanRegExp(searchText);
    pipeline = pipeline.concat({ $match: { name: regex } });
  } else {
    pipeline.push({ $limit: 5 });
  }

  pipeline.push({
    $project: {
      _id: { $convert: { input: "$_id", to: "string" } },
      name: 1,
      pre_name: "$logo_url",
    },
  });

  pipeline.push({ $sort: { name: 1 } });

  const companies = await CompanyModel.aggregate(pipeline);

  return companies;
};

export const updateStatistics = async (updateQuery, user) => {
  await CompanyModel.findByIdAndUpdate(user.company._id, updateQuery);
  return { ok: true };
};
