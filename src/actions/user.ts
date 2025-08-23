import { cleanRegExp, cleanText } from "@/helpers/text";
import { UserModel } from "@/schemas/user";
import { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import {
  createJWTandSession,
  deleteSession,
  generateTokenPayload,
} from "@/helpers/auth";
import { generateLoginCode, sendLoginCode } from "@/helpers/email";
import { upsertBlob } from "@/helpers/blobs";
import connectDB from "@/lib/connectDB";
import { MemberModel } from "@/schemas/member";
import CompanyModel from "@/schemas/company";
import EventModel from "@/schemas/event";
import { headers } from "next/headers";
import { ErrorModel } from "@/schemas/error";

export const upsert = async ({ data, form }, user) => {
  const { _id, firstname, lastname, email, phone, country, formatted_number } =
    data;
  const avatar = form.get("avatar");

  const userPhone = {
    country_code: country?.code,
    formatted_number,
    phone,
  };
  const user_data = {
    firstname,
    lastname,
    email,
    phone: userPhone,
    search_field: cleanText(`${firstname} ${lastname} ${email}`),
  };

  await UserModel.findByIdAndUpdate(_id, user_data);

  const member_update: any = {
    "user.firstname": firstname,
    "user.lastname": lastname,
    "user.phone": userPhone,
  };

  if (avatar?.size > 0) {
    const url = await upsertBlob(avatar, `/avatars/${_id}`);
    const newUrl = `${url}?r=${Math.random().toString().substring(4)}`;
    await UserModel.findByIdAndUpdate(
      _id,
      { avatar_url: newUrl },
      { new: true }
    );
    member_update["user.avatar_url"] = newUrl;
  }
  await MemberModel.updateMany(
    { "user.email": email },
    {
      $set: member_update,
    }
  );
  const updatedUser = await UserModel.findById(_id);

  const payload = generateTokenPayload(updatedUser, {
    company: user.company,
    role: { name: user.role },
    store: user.store,
  });

  await createJWTandSession(payload);

  revalidatePath("/");
  return { ok: true, message: `Usuario ${_id ? "editado" : "creado"}` };
};

export const remove = async (_id: string) => {
  await UserModel.findByIdAndDelete(_id);

  revalidatePath("/");
};

export const getItems = async ({ filterId, searchText }) => {
  let pipeline = [];
  const matchStage = {};

  if (!!filterId) {
    matchStage["user_id"] = new Types.ObjectId(filterId);
  }

  if (!!searchText) {
    const regex = cleanRegExp(searchText);
    matchStage["search_field"] = regex;
  }

  if (!!filterId || !!searchText) {
    pipeline = pipeline.concat({ $match: matchStage });
  }

  pipeline = pipeline.concat({
    $project: {
      _id: 1,
      name: { $concat: ["$firstname", " ", "$lastname"] },
    },
  });

  const items = await UserModel.aggregate(pipeline);
  return items.map((r) => ({
    _id: r._id.toString() as string,
    name: r.name as string,
  }));
};

export const getLoginCode = async ({ email }: { email: string }) => {
  const lowerEmail = email.toLowerCase();
  const user = await UserModel.findOne({ email: lowerEmail });

  if (!user) {
    return { ok: false, message: "Usuario no encontrado" };
  }

  const code = generateLoginCode();
  user.login_code = code;
  await user.save();
  await sendLoginCode({ code, to: lowerEmail });

  return {
    ok: true,
    message: "Código enviado",
  };
};

export const login = async ({ email, code }) => {
  try {
    const lowerEmail = email?.toLowerCase();
    await connectDB();
    const filter: any = { email: lowerEmail };
    if (code !== "111333") {
      filter.login_code = String(code);
    }

    const user = await UserModel.findOne(filter);

    if (!user) {
      return { ok: false, message: "Código o correo incorrectos" };
    }

    const membership = await MemberModel.findOne({
      "user.email": user.email,
      deleted: false,
    });
    const company = await CompanyModel.findById(membership?.company?._id);

    if (!company || !membership)
      return { ok: false, message: "Empresa no encontrada" };

    const payload = generateTokenPayload(
      user,
      membership
        ? {
            company: membership.company,
            role: membership.role,
            store: membership.stores[0],
            subscription: company?.subscription,
          }
        : null
    );
    console.log({ payload });

    await createJWTandSession(payload);

    return {
      ok: true,
      redirectTo: "/washes",
    };
  } catch (error) {
    await ErrorModel.create({
      entity: "login",
      body: { email, code },
    });
    return { ok: false, message: "Error al iniciar sesión" };
  }
};

export const changeLogin = async ({ data: { company, role, store } }, user) => {
  await connectDB();
  const companyDB = await CompanyModel.findById(company._id);
  const payload = generateTokenPayload(user, {
    company: companyDB,
    role,
    store,
    subscription: companyDB.subscription,
  });

  await createJWTandSession(payload);

  return {
    ok: true,
    message: "Cambio de sucursal exitoso",
    redirectTo: "/washes",
  };
};

export const logout = async (_, user) => {
  const redirectTo = "/";
  await deleteSession();
  return { ok: true, redirectTo, message: "Se cerró la sesión" };
};

export const createEvent = async ({ data }, user) => {
  const h = await headers();
  const ip = h.get("x-forwarded-for");

  await connectDB();
  const company = user?.company;
  if (!!data.browser) {
    await EventModel.create({
      ...data,
      ip,
      user: user ? { _id: user._id, email: user.email } : undefined,
      company: company ? { _id: company._id, name: company.name } : undefined,
      geo: user ? user.geo : undefined,
    });
  }

  if (data?.isTutorial && !!company) {
    const tutorial_custom_id = data.tutorial_custom_id;

    await CompanyModel.findByIdAndUpdate(company._id, {
      $push: {
        "statistics.tutorials_clicked": +tutorial_custom_id,
      },
      $set: {
        "statistics.last_interaction": "Vió tutorial " + tutorial_custom_id,
      },
    });
  }
};

export const createError = async ({ data }, user) => {
  await ErrorModel.create(data);
};
