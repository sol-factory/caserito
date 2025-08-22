import { cleanRegExp, cleanText } from "@/helpers/text";
import { revalidatePath } from "next/cache";
import TemplateModel, {
  MessageModel,
  WhatsappNumberModel,
} from "@/schemas/template";
import { getWorkplace, sendWspMessage, toObjectId } from "@/helpers/mdb";
import { SaleModel } from "@/schemas/sale";
import StoreModel from "@/schemas/store";
import { CONFIG } from "@/config/constanst";
import { ErrorModel } from "@/schemas/error";

export const upsert = async ({ data }, user) => {
  const { _id, stores } = data;

  if (!_id) {
    await TemplateModel.create({
      ...data,
      of: "Whatsapp",
      company_id: user.company._id,
      stores,
    });
  } else {
    await TemplateModel.findByIdAndUpdate(_id, data);
  }

  revalidatePath("/templates");
  return {
    ok: true,
    message: `Template ${_id ? "editado" : "creado"}`,
  };
};

export const remove = async (_id: string, user) => {
  await TemplateModel.findByIdAndUpdate(_id, {
    deleted: true,
    deleted_at: new Date(),
    deleted_by: user._id,
  });

  revalidatePath("/templates");
  return { ok: true, message: "Template eliminado" };
};

export const getItems = async (
  { screen, form, sale_id, client_id, searchText },
  user
) => {
  let pipeline = [];

  const matchStage = {
    ...getWorkplace(user, form === "store", true),
    deleted: false,
  };
  let messages = [];
  if (!!sale_id && screen === "Ventas") {
    const sale = await SaleModel.findById(sale_id, "messages");
    messages = sale?.messages || [];
  }

  if (!!searchText) {
    const regex = cleanRegExp(searchText);
    matchStage["name"] = regex;
  }

  if (!!screen && form !== "store") {
    matchStage["screens.name"] = screen;
  }

  pipeline = pipeline.concat({ $match: matchStage });

  pipeline = pipeline.concat([
    {
      $project: {
        _id: { $convert: { input: "$_id", to: "string" } },
        name: 1,
        content: 1,
        locked: 1,
      },
    },
  ]);

  const templates = await TemplateModel.aggregate(pipeline);

  const templates_ids = templates.map((t) => toObjectId(t._id));

  if (!!client_id && screen === "Clientes") {
    messages = await MessageModel.aggregate([
      {
        $match: {
          client_id: toObjectId(client_id),
          template_id: { $in: templates_ids },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
  }

  const [store] = await StoreModel.aggregate([
    {
      $match: { _id: toObjectId(user.store._id) },
    },
    {
      $project: {
        _id: { $toString: "$_id" },
        whatsapp: {
          _id: { $toString: "$whatsapp._id" },
          number: "$whatsapp.number",
        },
      },
    },
  ]);

  if (!!screen) {
    return {
      store,
      templates:
        sale_id || client_id
          ? templates.map((t) => {
              const msg = messages.find(
                (sm) => sm.template_id.toString() === t._id
              );

              return {
                ...t,
                sent_at: msg?.sent_at || msg?.createdAt,
                sender_email: msg?.sender_email,
              };
            })
          : templates,
    };
  } else {
    return templates;
  }
};

export const sendMessage = async (data, user) => {
  const { sale_id, formData, pathname } = data;

  let pdfBuffer;

  if (!!formData) {
    const pdf = formData.get("pdf");
    const arrayBuffer = await pdf.arrayBuffer();
    pdfBuffer = Buffer.from(arrayBuffer);
  }

  try {
    const result = await sendWspMessage({ data, user, pdfBuffer });
    revalidatePath(pathname);

    return result;
  } catch (error) {
    await ErrorModel.create({
      entity: !!sale_id ? "sale" : "client",
      action: "sendMessage",
      body: data,
      error_type: error.name || "UnknownError",
      error_message: error?.message,
      stack: error?.stack,
    });
    return { ok: false, message: "Error al enviar el mensaje", error };
  }
};

export const getWhatsappNumbers = async ({ filterId }, user) => {
  const whatsapp_numbers = await WhatsappNumberModel.aggregate([
    {
      $match: {
        store_id: user.store._id,
        active_session: true,
        deleted: false,
      },
    },
  ]);

  return whatsapp_numbers.map((w) => ({
    ...w,
    stores: Array.isArray(w.stores)
      ? w.stores.map((s) => ({ _id: s._id.toString(), name: s.name }))
      : null,
    _id: w._id.toString(),
    name: w.number,
    pre_name: `${CONFIG.blob_url}/whatsapp.png`,
  }));
};
