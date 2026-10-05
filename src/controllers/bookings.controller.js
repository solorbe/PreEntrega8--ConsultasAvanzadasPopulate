import { bookingsService } from '../services/bookings.service.js';

// POST /api/bookings
// Crea una reserva nueva. El body puede traer client y date; si no vienen, las capas de abajo ponen valores por defecto.
export const createBooking = async (req, res) => {
  try {
    const newBooking = await bookingsService.createBooking(req.body);

    // 201 Created: se creó un recurso nuevo. Nace con services: [].
    res.status(201).json({ status: 'success', payload: newBooking });
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ status: 'error', message: error.message });
  }
};

// GET /api/bookings/:bid
// Devuelve una reserva puntual por id.
export const getBookingById = async (req, res) => {
  try {
    const booking = await bookingsService.getBookingById(req.params.bid);
    res.status(200).json({ status: 'success', payload: booking });
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ status: 'error', message: error.message });
  }
};

// POST /api/bookings/:bid/services/:sid
// Agrega el servicio :sid a la reserva :bid. Si el servicio ya estaba en la reserva, incrementa su quantity (esa regla vive en el service).
export const addServiceToBooking = async (req, res) => {
  try {
    const { bid, sid } = req.params;
    const updatedBooking = await bookingsService.addServiceToBooking(bid, sid);
    res.status(200).json({ status: 'success', payload: updatedBooking });
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ status: 'error', message: error.message });
  }
};

// GET /api/bookings/report/status
// Cantidad de reservas por estado, calculada con un aggregate de MongoDB. payload: [{ _id: 'pending', total: 3 }, ...]
export const getStatusReport = async (req, res) => {
  try {
    const report = await bookingsService.getStatusReport();
    res.status(200).json({ status: 'success', payload: report });
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ status: 'error', message: error.message });
  }
};


export const updateBooking = async (req, res) => {
  try {
    const { bid } = req.params;
    const updatedBooking = await bookingService.updateBooking(bid, req.body);
    res.status(200).json({ status: 'success', payload: updatedBooking });
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ status: 'error', message: error.message });
  }
};
