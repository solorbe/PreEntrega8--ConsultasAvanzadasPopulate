import { Router } from 'express';
import {
  createBooking,
  getBookingById,
  updateBooking,
  addServiceToBooking,
  getStatusReport
} from "../controllers/bookings.controller.js";

const router = Router();

// POST /api/bookings              -> crear una reserva
router.post('/', createBooking);

// GET /api/bookings/report/status -> cantidad de reservas por estado
// Buena práctica: las rutas FIJAS van antes que las que tienen parámetros. 
// Express prueba las rutas en el orden en que se registran; si existiera, por ejemplo, un GET '/:bid/:algo', se "comería" esta
// URL y tomaría "report" como si fuera un id de reserva.
router.get('/report/status', getStatusReport);

// GET /api/bookings/:bid          -> ver una reserva por id
router.get('/:bid', getBookingById);

// POST /api/bookings/:bid/services/:sid  -> agregar un servicio a la reserva
// La URL anida dos recursos: la reserva (:bid) y el servicio (:sid) que se le suma. 
// Ambos llegan en req.params.

router.put('/:bid', updateBooking);
router.post('/:bid/services/:sid', addServiceToBooking);


export default router;