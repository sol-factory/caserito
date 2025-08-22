import mongoose from "mongoose";

const errorSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now }, // Marca de tiempo del error
  origin: String,
  entity: { type: String, required: true }, // Entidad afectada (por ejemplo, usuarios, productos, etc.)
  action: { type: String }, // Acción ejecutada (por ejemplo, "upsert", "delete")
  body: { type: mongoose.Schema.Types.Mixed }, // Usuario relacionado (opcional)
  user: { type: mongoose.Schema.Types.Mixed }, // Usuario relacionado (opcional)
  error_type: { type: String }, // Tipo de error (MongooseError, ZodError, etc.)
  error_message: { type: String }, // Mensaje del error
  stack: { type: String }, // Stack trace del error (opcional, para depuración)
  metadata: { type: mongoose.Schema.Types.Mixed }, // Información adicional sobre el error
});

const ErrorModel =
  (mongoose.models.Error as any) || mongoose.model("Error", errorSchema);

export { ErrorModel };
