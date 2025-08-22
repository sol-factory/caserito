import { sendWspMessage } from "@/helpers/mdb";
import { formatPhoneToSendMessage, validatePhone } from "@/helpers/phones";
import { parseWhatsappMessage } from "@/helpers/ui";
import connectDB from "@/lib/connectDB";
import CompanyModel from "@/schemas/company";
import { ErrorModel } from "@/schemas/error";
import { SaleModel } from "@/schemas/sale";
import StoreModel from "@/schemas/store";
import TemplateModel from "@/schemas/template";
import { addHours } from "date-fns";

export async function GET(request) {
  console.log("Cron ejecutado a las:", new Date().toISOString());
  await connectDB();

  const now = new Date();
  const isSunday = now.getDay() === 0;
  const isEarly = now.getHours() < 9;
  const reminderOffset = isSunday && isEarly ? 18 : 21;

  const tomorrow = addHours(new Date(), reminderOffset);

  const sales = await SaleModel.find(
    {
      "full_date.year": tomorrow.getFullYear(),
      "full_date.month": tomorrow.getMonth() + 1,
      "full_date.day": tomorrow.getDate(),
      "full_date.hour": tomorrow.getHours(),
      reminded: { $ne: true },
      should_be_reminded: true,
      deleted: false,
    },
    "client.firstname client.lastname client.phone client.country_code vehicle date amount gathered_amount services discounts _id company_id store_id client_id"
  ).lean();

  const templateName = "Recordatorio turno";
  const companiesMap = new Map();
  const storesMap = new Map();
  const templatesMap = new Map();

  for (const s of sales) {
    let company = companiesMap.get(s.company_id.toString());
    try {
      // 🔁 Cache de empresa
      if (!company) {
        company = await CompanyModel.findById(s.company_id, "name statistics");
        companiesMap.set(s.company_id.toString(), company);
      }

      // 🔁 Cache de sucursal
      let store = storesMap.get(s.store_id.toString());
      if (!store) {
        store = await StoreModel.findById(s.store_id, "address whatsapp");
        storesMap.set(s.store_id.toString(), store);
      }

      // 🔁 Cache de template
      const templateKey = `${s.company_id.toString()}-${templateName}`;
      let t = templatesMap.get(templateKey);
      if (!t) {
        t = await TemplateModel.findOne({
          name: templateName,
          company_id: s.company_id,
        });
        if (!t) continue; // fallback si no hay template
        templatesMap.set(templateKey, t);
      }

      const c = s.client;

      const message = parseWhatsappMessage(t.content, {
        clientName: c?.firstname,
        vehicle: s?.vehicle,
        sale_date: s?.date,
        storeName: store.name,
        storeAddress: store.address,
        companyName: company.name,
        services: s.services,
        discounts: s.discounts,
        gatheredAmount: s.gathered_amount,
        saleAmount: s.amount,
        saleId: s._id.toString(),
        isOwner: true,
      });

      const phone: any = validatePhone({
        number: c.phone,
        countryCode: c.country_code,
      });

      if (!phone?.isValid) continue;

      const phoneNumber = formatPhoneToSendMessage(phone);

      const result = await sendWspMessage({
        data: {
          template_id: t._id.toString(),
          template_name: t.name,
          phoneNumber,
          message,
          wspNumberId: store?.whatsapp?._id,
          sale_id: s._id.toString(),
          client_id: s.client_id.toString(),
          notInRAMTimeout: 6000,
        },
        user: { email: "info@aquapp.lat", company, store },
        pdfBuffer: null,
      });

      console.log("Response from ACTION: ", { result });

      if (result.ok) {
        // Actualizar venta
        await SaleModel.updateOne(
          { _id: s._id },
          { $set: { reminded: true, reminded_at: new Date() } }
        );

        // Actualizar contador de wsp automáticos
        await CompanyModel.updateOne(
          { _id: s.company_id },
          { $inc: { "statistics.automatic_wsp": 1 } }
        );
      } else {
        await ErrorModel.create({
          entity: "sales",
          action: "reminder",
          body: { company: company.name, sale_id: s._id },
          error_type: "error al enviar recordatorio",
          error_message: result.message,
          metadata: result,
        });
      }
    } catch (error) {
      console.error(`Error al enviar recordatorio a ${s.client.phone}:`, error);
      await ErrorModel.create({
        entity: "sales",
        action: "reminder",
        body: { company: company.name, sale_id: s._id, error },
        error_type: "error al enviar recordatorio",
        error_message: error.message,
        metadata: s,
      });
    }
  }

  return new Response("Cron ejecutado correctamente ✅");
}
