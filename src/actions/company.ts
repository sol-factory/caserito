import { revalidatePath } from "next/cache";
import CompanyModel from "@/schemas/company";
import StoreModel from "@/schemas/store";
import { MemberModel } from "@/schemas/member";
import { createJWTandSession, generateTokenPayload } from "@/helpers/auth";
import RoleModel from "@/schemas/role";
import { cleanRegExp, cleanText } from "@/helpers/text";
import WalletModel from "@/schemas/wallet";
import { UserModel } from "@/schemas/user";
import {
  abortTransaction,
  commitTransaction,
  startTransaction,
} from "@/helpers/mdb";
import { getFullDate } from "@/helpers/date";
import { headers } from "next/headers";
import { addDays } from "date-fns";

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
      const newCompany = new CompanyModel({
        ...data,
        phone: companyPhone,
        creator: userDB.getBasicInfo(),
        country: country.code,
        city: data.city,
        lat: data.lat,
        lng: data.lng,
        full_creation_date: getFullDate(),
        created_from_ip: ip,
        search_field: cleanText(`${data.name} ${phone} ${userDB.email}`),
      });

      company = await newCompany.save({ session });
      if (!!phone) {
        userDB.phone = companyPhone;
        await userDB.save({ session });
      }

      blob_id = company._id;

      const aquapp_rate = 1;

      const newStore = new StoreModel({
        name: data.address,
        address: data.address,
        city: data.city,
        country: data.country_name,
        country_code: data.country_code,
        location: {
          type: "Point",
          coordinates: [data.lng, data.lat], // [lng, lat] — ¡importante el orden!
        },
        lat: data.lat,
        lng: data.lng,
        usd_exchange_rate: aquapp_rate,
        company_id: company._id,
        activated: true,
      });
      store = await newStore.save({ session });

      // Creamos Wallet y le asignamos la store inicial
      await WalletModel.insertMany(
        [
          {
            name: "Efectivo",
            company_id: company._id,
            currency: "ars",
            stores: [store],
          },
        ],
        { session }
      );
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
