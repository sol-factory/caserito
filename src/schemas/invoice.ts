import mongoose, { Schema, model } from "mongoose";

const InvoiceSchema = new Schema(
  {
    CantReg: Number,
    PtoVta: Number,
    CbteTipo: Number,
    Concepto: String,
    FchServDesde: String,
    FchServHasta: String,
    CbtesAsoc: [
      {
        Tipo: Number,
        PtoVta: Number,
        Nro: Number,
      },
    ],
    FchVtoPago: String,
    DocTipo: String, // Documento del cliente
    DocNro: String, // Documento del cliente
    CbteDesde: Number,
    CbteHasta: Number,
    CbteFch: String,
    ImpTotal: Number,
    ImpTotConc: Number,
    ImpNeto: Number,
    ImpOpEx: Number,
    ImpIVA: Number,
    ImpTrib: Number,
    MonId: String,
    MonCotiz: Number,
    Iva: [
      // (Opcional) Alícuotas asociadas al comprobante
      {
        Id: Number, // Id del tipo de IVA (5 para 21%)(ver tipos disponibles)
        BaseImp: Number, // Base imponible
        Importe: Number, // Importe
      },
    ],
    CAE: String,
    CAEFchVto: String,
    cuit: String, // CUIT a nombre de la cual emitimos la factura, la CUIT de nuestro cliente digamos
    sale_point: Number,
    voucher_type: Number, // Tipo de comprobante
    annulled: { type: Boolean, default: false },
    credit_note: Number,
    credit_note_CAE: String,
    client_address: String,
    client_name: String,
    mp_payment_id: Number, // ID de Payment de Mercado Pago
    cashflow_id: {
      type: Schema.Types.ObjectId,
      ref: "Cashflow",
    },
    company_id: {
      type: Schema.Types.ObjectId,
      ref: "Company",
    },
    store_id: {
      type: Schema.Types.ObjectId,
      ref: "Store",
    },
    client_id: {
      type: Schema.Types.ObjectId,
      ref: "Client",
    }, // Cliente de nuestro cliente
    full_creation_date: {
      day: Number,
      week: Number,
      month: Number,
      year: Number,
    },
    full_invoice_date: {
      day: Number,
      week: Number,
      month: Number,
      year: Number,
    },
  },
  { timestamps: true }
);

const InvoiceModel =
  (mongoose.models.Invoice as any) || model("Invoice", InvoiceSchema);

export { InvoiceModel };
