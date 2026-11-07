import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export const ROLES = ["cliente", "dueno"];

// La contraseña nunca se guarda tal cual: se guarda su «hash» (una huella que no se puede revertir).
// select: false hace que las consultas normales no la traigan; para el login se pide a propósito.
const esquemaUsuario = new mongoose.Schema(
  {
    nombre: { type: String, trim: true, default: "" },
    email: { type: String, required: [true, "Falta el correo"], unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, "Correo inválido"] },
    hash: { type: String, required: true, select: false },
    rol: { type: String, enum: ROLES, default: "cliente" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false, transform: (doc, ret) => { delete ret._id; delete ret.hash; return ret; } },
  }
);

esquemaUsuario.statics.registrar = async function ({ nombre, email, password, rol = "cliente" }) {
  if (typeof password !== "string" || password.length < 8) throw Object.assign(new Error("La contraseña necesita al menos 8 caracteres"), { status: 400 });
  return this.create({ nombre, email, rol, hash: await bcrypt.hash(password, 10) });
};

esquemaUsuario.methods.comparar = function (password) {
  return bcrypt.compare(String(password ?? ""), this.hash);
};

export const Usuario = mongoose.model("Usuario", esquemaUsuario);
