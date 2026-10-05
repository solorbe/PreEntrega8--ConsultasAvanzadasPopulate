import mongoose from 'mongoose';

// Plugin de paginación. Le agrega al model un método estático ServiceModel.paginate(filtro, opciones) que hace el find + skip/limit + countDocuments 
// devuelve los documentos de la página junto con la metadata (totalPages, hasNextPage, etc.).
import mongoosePaginate from 'mongoose-paginate-v2';

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

// Los plugins se aplican sobre el SCHEMA y ANTES de crear el model con mongoose.model(...): si se aplican después, el model ya se construyó sin el método paginate.
serviceSchema.plugin(mongoosePaginate);

// El nombre del model ("Service") es el que Mongoose usa para inferir
// el nombre de la colección en MongoDB (la pluraliza y pone en
// minúsculas: "services"), que es el mismo nombre que ya usábamos con
// FileSystem.
export const ServiceModel = mongoose.model('Service', serviceSchema);
