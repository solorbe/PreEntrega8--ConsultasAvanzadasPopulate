// ---------------------------------------------------------------------
// Conexión a MongoDB Atlas usando Mongoose.

// connectDB() se llama UNA sola vez, al arrancar el servidor (ver
// src/server.js), antes de levantar Express: si la base no está
// disponible, no tiene sentido aceptar peticiones HTTP que después
// van a fallar al intentar leer/escribir datos.
// ---------------------------------------------------------------------

import mongoose from 'mongoose';
import { config } from './env.config.js';

export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ Conexión a MongoDB establecida correctamente');
  } catch (error) {
    console.error('❌ No se pudo conectar a MongoDB:', error.message);
    // Igual que con las variables de entorno faltantes: si no hay base
    // de datos, la app no puede funcionar, así que cortamos el proceso
    // en vez de dejarlo arrancado a medias.
    process.exit(1);
  }
};
