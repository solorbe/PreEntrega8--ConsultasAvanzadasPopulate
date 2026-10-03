import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    duration: { type: Number, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    available: { type: Boolean, default: true },
    delete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// El nombre del model ("Service") es el que Mongoose usa para inferir
// el nombre de la colección en MongoDB (la pluraliza y pone en
// minúsculas: "services"), que es el mismo nombre que ya usábamos con
// FileSystem.
export const ServiceModel = mongoose.model('Service', serviceSchema);
