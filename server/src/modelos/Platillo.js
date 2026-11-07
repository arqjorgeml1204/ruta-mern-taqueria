import mongoose from "mongoose";

// Esquema: las reglas de cómo es cada documento de la colección «platillos».
const esquemaPlatillo = new mongoose.Schema(
  {
    nombre: { type: String, required: [true, "El platillo necesita nombre"], trim: true, unique: true },
    descripcion: { type: String, default: "" },
    precio: { type: Number, required: true, min: [0, "El precio no puede ser negativo"] },
    categoria: { type: String, enum: ["platos", "bebidas", "postres"], required: true },
    emoji: { type: String, default: "🍽️" },
    foto: { type: String, default: "" }, // módulo 6: ruta de la foto subida por el dueño (/uploads/…)
    disponible: { type: Boolean, default: true },
  },
  {
    timestamps: true, // createdAt y updatedAt automáticos
    // al convertir a JSON: «id» en lugar de «_id» (así la app de React no cambia) y sin «__v»
    toJSON: { virtuals: true, versionKey: false, transform: (doc, ret) => { delete ret._id; return ret; } },
  }
);

export const Platillo = mongoose.model("Platillo", esquemaPlatillo);
