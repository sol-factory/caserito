import { cleanText } from "@/helpers/text";
import { revalidatePath } from "next/cache";
import { MemberModel } from "@/schemas/member";
import { UserModel } from "@/schemas/user";
import {
  abortTransaction,
  commitTransaction,
  startTransaction,
  toObjectId,
} from "@/helpers/mdb";
import CompanyModel from "@/schemas/company";

export const upsert = async (payload, user) => {
  const { data } = payload;

  const {
    _id,
    firstname,
    lastname,
    email,
    role,
    stores,
    country,
    phone,
    formatted_number,
    pay_cycle,
    fixed_salary,
    payment_type,
    sales_percentage,
  } = data;

  const isTechnician = role.name === "Técnico";
  const permissions = {
    quote: {
      can_view: data.can_view_quote || !isTechnician,
      can_view_amount: data.can_view_amount_quote || !isTechnician,
    },
    cashflow: {
      can_view: data.can_view_cashflow || !isTechnician,
    },
    client: {
      can_view: data.can_view_client || !isTechnician,
      can_edit: data.can_edit_client || !isTechnician,
      can_view_phone: data.can_view_phone_client || !isTechnician,
    },
    service: {
      can_view: data.can_view_service || !isTechnician,
      can_view_amount: data.can_view_amount_service || !isTechnician,
    },
    sale: {
      can_view_amount: data.can_view_amount_sale || !isTechnician,
    },
  };

  const userPhone = {
    country_code: country?.code,
    formatted_number,
    phone,
  };

  const userData = {
    _id: "",
    firstname,
    lastname,
    email,
    phone: userPhone,
  };

  const session = await startTransaction();

  const inCurrentStore = stores.some((s) => s._id === user?.store?._id);
  const userMember = await MemberModel.findOne(
    {
      "company._id": toObjectId(user.company._id),
      "user.email": user.email,
      deleted: false,
    },
    { _id: 1, user: 1 }
  );

  const alreadyExists = await MemberModel.findOne({
    "company._id": toObjectId(user.company._id),
    "user.email": email,
    deleted: false,
  });
  if (!!alreadyExists && !_id) {
    return {
      ok: false,
      message: "No puedes crear 2 integrantes con el mismo correo",
    };
  }
  const memberBeingUpdated = await MemberModel.findById(_id, {
    _id: 1,
    user: 1,
    role: 1,
  });

  if (!inCurrentStore && _id === userMember?._id?.toString()) {
    return {
      ok: false,
      message: "No puedes quitarte de la sucursal en la que estás logueado",
    };
  }

  if (
    _id &&
    memberBeingUpdated.user.email !== email &&
    memberBeingUpdated?.role?.name === "Socio"
  ) {
    return {
      ok: false,
      message: "No puedes cambiar el email de un socio",
    };
  }

  const newRoleNotOwner =
    role.name !== "Socio" && memberBeingUpdated?.role?.name === "Socio";

  const ownersCount = await MemberModel.countDocuments({
    "company._id": toObjectId(user.company._id),
    deleted: false,
    "role.name": "Socio",
  });

  if (ownersCount === 1 && newRoleNotOwner && !!_id) {
    return {
      ok: false,
      message: "La empresa debe tener al menos un integrante con rol de Socio",
    };
  }

  const member_data = {
    user: { _id, firstname, lastname, email, phone: userPhone },
    company: user.company,
    stores,
    payment_scheme: {
      payment_type,
      pay_cycle,
      fixed_salary: payment_type?._id?.includes("fixed") ? fixed_salary : 0,
      sales_percentage: payment_type?._id !== "fixed" ? sales_percentage : 0,
    },
    role,
    search_field: cleanText(`${email}`),
    permissions,
  };

  try {
    let userDB = await UserModel.findOne({ email });
    if (!!userDB) {
      const userBasicInfo = userDB.getBasicInfo();
      const finalUserData = {
        firstname: userBasicInfo.firstname || userData.firstname,
        lastname: userBasicInfo.lastname || userData.lastname,
        email,
        phone: userData.phone || userBasicInfo.phone,
      };
      userDB.firstname = finalUserData.firstname;
      userDB.lastname = finalUserData.lastname;
      userDB.phone = finalUserData.phone;
      await userDB.save({ session });
      const { firstname, lastname } = finalUserData;
      member_data.search_field = cleanText(`${firstname} ${lastname} ${email}`);
    } else {
      delete userData._id;
      const newUser = new UserModel(userData);
      userDB = await newUser.save({ session });
    }

    member_data.user["_id"] = userDB._id;
    if (!_id) {
      const newMember = new MemberModel(member_data);
      await newMember.save({ session });
      await CompanyModel.findByIdAndUpdate(
        user.company._id,
        {
          $inc: {
            "statistics.members": 1,
          },
          $set: {
            "statistics.last_interaction": "Creación integrante",
          },
        },
        { session }
      );
    } else {
      await MemberModel.findByIdAndUpdate(_id, member_data, { session });
    }
    await commitTransaction(session);
    revalidatePath("/members");

    return { ok: true, message: `Integrante ${_id ? "editado" : "creado"}` };
  } catch (error) {
    await abortTransaction(session);
    throw error;
  }
};

export const remove = async (_id: string, user) => {
  const session = await startTransaction();
  const memberToRemove = await MemberModel.findById(_id, "role");
  const ownersCount = await MemberModel.countDocuments({
    company: user.company._id,
    deleted: false,
    "role.name": "Socios",
  });

  const isCompanyCreator = await CompanyModel.findOne({
    "creator.email": memberToRemove.user.email,
  });

  if (isCompanyCreator) {
    return {
      ok: false,
      message: "El creador de la empresa no puede ser eliminado",
    };
  }

  if (memberToRemove._id.toString() === _id) {
    return { ok: false, message: "No puedes eliminarte a vos mismo" };
  }

  if (ownersCount === 1 && memberToRemove.role.name === "Socio") {
    return {
      ok: false,
      message: "La empresa debe tener al menos un integrante con rol de Socio",
    };
  }

  try {
    await MemberModel.findByIdAndUpdate(
      _id,
      {
        deleted: true,
        deleted_at: new Date(),
        deleted_by: user._id,
      },
      { session }
    );
    await CompanyModel.findByIdAndUpdate(
      user.company._id,
      {
        $inc: {
          "statistics.members": -1,
        },
      },
      { session }
    );

    revalidatePath("/members");
    await commitTransaction(session);
    return { ok: true, message: "Integrante eliminado" };
  } catch (error) {
    await abortTransaction(session);
    throw error;
  }
};

export const getItems = async (_, user) => {
  const members = await MemberModel.find({
    "company._id": user.company._id,
    deleted: false,
  });

  return members.map((m) => ({
    _id: m._id.toString(),
    name: m.user.email,
    detail: m.role.name,
  }));
};
export const getWorkers = async (_, user) => {
  const workers = await MemberModel.find({
    "company._id": user.company._id,
    "stores._id": user.store._id,
    "payment_scheme.sales_percentage": { $gt: 0 },
    deleted: false,
  });

  return workers.map((m) => ({
    _id: m._id.toString(),
    name: `${m.user.firstname} ${m.user.lastname}`,
    sales_percentage: m.payment_scheme.sales_percentage,
    member_name: `${m.user.firstname} ${m.user.lastname}`,
    member_email: m.user.email,
  }));
};
