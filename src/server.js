//pone en marcha el servidor físico para que escuche las peticiones en un puerto.
//node server.js
//     ↓
// server.js
//     ↓
// importa app.js
//     ↓
// app.js configura Express
//     ↓
// vuelve a server.js
//     ↓
// app.listen()
//     ↓
// servidor iniciado

import dotenv from "dotenv";
import app from "./app.js";
import { config } from "./config/env.config.js";
import { connectDB } from './config/database.config.js';
import { Server } from "socket.io";

dotenv.config();

const PORT = config.port;

const httpServer = app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

const startServer = async () => {
  await connectDB();
};

startServer();

const io = new Server(httpServer);

app.set('io', io);
// const logs = []; 
// io.on('connection', (socket) => {

// socket.on("message2", data => {
//     console.log(`Mensaje recibido: ${data} de ${socket.id}`)
//     logs.push({ socketid: socket.id, message: data })
//     io.emit("log", { logs })
// })

io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);
    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });
});


