
import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  clientEmail: { type: String },
  date: { type: Date },
  time: { type: String },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  },
  services: [
    {
      service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
      quantity: { type: Number, default: 1 },
    },
  ],
},
{ timestamps: true }
);

// El hook pre('save') se ejecuta justo antes de guardar un documento.
// Acá lo usamos para mantener updatedAt siempre al día.
//
// IMPORTANTE: esta función NO puede ser arrow function. Mongoose llama
// a este hook con un `this` que apunta al documento que se está por
// guardar; una arrow function no tiene su propio `this` (usa el del
// contexto donde fue definida), así que `this.updatedAt` no
// funcionaría. Con `function` normal, Mongoose puede "bindear" el
// `this` correcto.
  bookingSchema.pre('save', async function () {
      this.updatedAt = new Date();
  });

export const BookingModel = mongoose.model('Booking', bookingSchema);
