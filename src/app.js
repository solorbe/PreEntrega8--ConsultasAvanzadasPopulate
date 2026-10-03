
import express from "express";
import { engine } from 'express-handlebars';
import servicesRouter from "./routes/services.router.js";
import bookingsRouter from "./routes/bookings.router.js";
import viewsRouter from "./routes/views.router.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(express.json()); //midlleware para parsear el body de las peticiones entrantes en formato JSON

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API del Sistema de Turnos y Reservas"
  });
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use('/api/services', servicesRouter);
app.use('/api/bookings', bookingsRouter);
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './src/views');
app.use('/', viewsRouter);
// carpeta public
app.use(express.static(__dirname + '/public'));
console.log('Carpeta public: ', __dirname + '/public');

export default app;

