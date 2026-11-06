import mongoose from "mongoose";

export const ESTADOS = ["recibido", "preparando", "listo"];

// Cada renglón guarda una referencia al platillo (su _id) y una copia del nombre y el precio de ESE momento:
// si mañana sube el precio, el pedido de hoy no cambia.
const esquemaLinea = new mongoose.Schema(
  {
    platillo: { type: mongoose.Schema.Types.ObjectId, ref: "Platillo", required: true },
    nombre: String,
    precio: Number,
    cantidad: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const esquemaPedido = new mongoose.Schema(
  {
    lineas: { type: [esquemaLinea], validate: [(v) => v.length > 0, "El pedido necesita al menos un platillo"] },
    subtotal: { type: Number, required: true, min: 0 },
    propina: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    estado: { type: String, enum: ESTADOS, default: "recibido" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false, transform: (doc, ret) => { delete ret._id; return ret; } },
  }
);

export const Pedido = mongoose.model("Pedido", esquemaPedido);
