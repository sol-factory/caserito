import connectDB from "@/lib/connectDB";
import { ErrorModel } from "@/schemas/error";

const SUBDOMAIN = process.env.KOMMO_SUBDOMAIN;
const API_KEY = process.env.KOMMO_API_KEY;

const BASE_URL = `https://${SUBDOMAIN}.kommo.com/api`;

const headers = {
  accept: "application/json",
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

export const getLeadById = async (lead_id) => {
  const res = await fetch(`${BASE_URL}/v4/leads/${lead_id}?with=contacts`, {
    headers,
  });
  const lead = await res.json();
  return lead;
};

export const getContactByLeadId = async (lead_id) => {
  if (!lead_id) return;
  await connectDB();
  const lead = await getLeadById(lead_id);
  try {
    if (!!lead) {
      const kommo_contact_id = lead._embedded?.contacts[0]?.id;
      if (kommo_contact_id) {
        const res2 = await fetch(
          `${BASE_URL}/v4/contacts/${kommo_contact_id}`,
          {
            headers,
          }
        );
        const contact = await res2.json();
        const phoneField = contact?.custom_fields_values?.find(
          (cf) => cf.field_id === 268250
        );
        return {
          ...contact,
          phone: phoneField ? phoneField.values[0]?.value : undefined,
        };
      } else {
        return null;
      }
    } else {
      return null;
    }
  } catch (error) {
    await ErrorModel.create({ entity: "Lead", metadata: { lead } });
    return null;
  }
};

export const launchSalesBot = async ({ lead_id }) => {
  const res = await fetch(`${BASE_URL}/v2/salesbot/run`, {
    method: "POST",
    headers: {
      ...headers,
    },
    body: JSON.stringify([
      {
        bot_id: 5448,
        entity_type: 2,
        entity_id: lead_id,
      },
    ]),
  });

  const result = await res.json();
};
export const updateLead = async ({ lead_id, body }) => {
  const res = await fetch(`${BASE_URL}/v4/leads/${lead_id}`, {
    method: "PATCH",
    headers: {
      ...headers,
    },
    body: JSON.stringify(body),
  });

  const result = await res.json();
};

export const createCustomField = async ({ body }) => {
  const res = await fetch(`${BASE_URL}/v4/leads/custom_fields`, {
    method: "POST",
    headers: {
      ...headers,
    },
    body: JSON.stringify(body),
  });

  const result = await res.json();
};

export const updateLeadCustomField = async ({
  lead_id,
  field,
  value,
}: {
  lead_id: number;
  field: "creo-empresa" | "clicks-enlaces-wsp" | "estado-suscripcion";
  value: boolean | number | string;
}) => {
  if (!lead_id) return null;

  const fields_ids = {
    "creo-empresa": 682444,
    "clicks-enlaces-wsp": 682726,
    "estado-suscripcion": 684872,
  };

  const field_id = fields_ids[field];
  let finalValue = value;

  if (field === "clicks-enlaces-wsp") {
    const lead = await getLeadById(lead_id);
    if (Array.isArray(lead.custom_fields_values)) {
      const field = lead.custom_fields_values.find(
        (f) => f.field_id === field_id
      );
      const clicks = !!field ? field.values[0].value : 0;
      finalValue = +clicks + 1;
    }
  }

  const res = await fetch(`${BASE_URL}/v4/leads/${lead_id}`, {
    method: "PATCH",
    headers: {
      ...headers,
    },
    body: JSON.stringify({
      custom_fields_values: [
        { field_id: fields_ids[field], values: [{ value: finalValue }] },
      ],
    }),
  });

  const result = await res.json();
};
