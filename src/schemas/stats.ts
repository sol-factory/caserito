import mongoose, { model, Schema } from "mongoose";

const StatsSchema = new Schema(
  {
    year: Number,
    month: Number,
    marketing: {
      reached_people: Number,
      clicks: Number,
      leads: Number, // contactos que dejaron datos
      avg_ctr: Number, // % de clicks
      avg_cpc: Number, // costo por click
      avg_cpl: Number, // costo por lead
      ad_spent: Number,
    },
    product: {
      companies_created: Number,
      companies_activated: Number, // que hicieron al menos 1 venta o cobraron algo
      total_users_invited: Number, // técnicos + socios + encargados
      linked_whatsapp: Number, // loguearon al menos 1 vez
      messages_sent: Number,
      pdfs_generated: Number,
    },
    subscriptions: {
      total_at_start: Number,
      created: Number,
      activated: Number, // contrataron por MP o PayPAL
      canceled: Number,
      total_at_end: Number,
      churn_rate: Number, // calculado con fórmula
      mrr_start: Number, // Monthly Recurring Revenue
      mrr_end: Number,
    },
    revenue: {
      collected: Number,
      refunds: Number,
      net: Number,
    },
  },
  { timestamps: true }
);

const StatsModel =
  (mongoose.models.Stats as any) || model("Stats", StatsSchema);
export default StatsModel;
