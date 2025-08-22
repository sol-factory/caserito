import mongoose, { model, Schema } from "mongoose";

const SubscriptionPlanSchema = new Schema(
  {
    provider: String,
    unit_amount: Number,
    currency: String,
    frequency: Number,
    paypal_plan_id: String,
    mp_plan_id: String,
    stores: Number,
    messages: Number,
    kind: String,

    countries: [String],
  },
  { timestamps: true }
);

const dateNowType = { type: Date, default: Date.now };
const countType = { type: Number, default: 0 };

const SubscriptionPaymentSchema = new Schema(
  {
    provider: String,
    payment_id: String,
    amount: Number,
    currency: String,
    init_point: String,
    status: String,
    details: Schema.Types.Mixed,
    is_manual: { type: Boolean, default: false },
    subscription_id: { type: Schema.Types.ObjectId, ref: "Subscription" },
    store_id: { type: Schema.Types.ObjectId, ref: "Store" },
  },
  { timestamps: true }
);

const SubscriptionSchema = new Schema(
  {
    provider: String,
    amount: Number,
    stores: Number,
    quotes: {
      base_price: Number,
      amount: Number,
      limit: {
        start_date: dateNowType,
        max: Number,
        count: countType,
      },
    },
    files: {
      base_price: Number,
      amount: Number,
      limit: {
        start_date: dateNowType,
        max: Number,
        count: countType,
      },
    },
    messages: {
      base_price: Number,
      amount: Number,
      limits: {
        minute: {
          start_date: dateNowType,
          count: countType,
          max: { type: Number, default: 3 },
        },
        hour: {
          start_date: dateNowType,
          count: countType,
          max: { type: Number, default: 5 },
        },
        day: {
          start_date: dateNowType,
          count: countType,
          max: { type: Number, default: 10 },
        },
        month: {
          start_date: Date,
          count: countType,
          max: { type: Number, default: 25 },
        },
      },
    },
    lockedUntil: Date,
    last_price_update: Date,
    active: { type: Boolean, default: false },
    automatic: { type: Boolean, default: true },
    status: String,
    company_id: { type: Schema.Types.ObjectId, ref: "Company" },
    store_id: { type: Schema.Types.ObjectId, ref: "Store" },
    company_name: String,
    payer_email: String,
    subscription_id: String,
    payer: Schema.Types.Mixed,
    details: Schema.Types.Mixed,
    full_creation_date: {
      day: Number,
      month: Number,
      week: Number,
      year: Number,
    },
    full_cancellation_date: {
      day: Number,
      month: Number,
      week: Number,
      year: Number,
    },
  },
  { timestamps: true }
);

const SubscriptionModel =
  (mongoose.models.Subscription as any) ||
  model("Subscription", SubscriptionSchema);
const SubscriptionPaymentModel =
  (mongoose.models.SubscriptionPayment as any) ||
  model(
    "SubscriptionPayment",
    SubscriptionPaymentSchema,
    "subscriptions-payments"
  );

const SubscriptionPlanModel =
  (mongoose.models.SubscriptionPlan as any) ||
  model("SubscriptionPlan", SubscriptionPlanSchema, "subscriptions-plans");

export { SubscriptionPlanModel, SubscriptionModel, SubscriptionPaymentModel };
