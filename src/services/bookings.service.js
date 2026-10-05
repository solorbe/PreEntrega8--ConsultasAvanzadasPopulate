// Vive TODA la regla de negocio de reservas que antes estaba
// metida dentro de BookingManager:
//
//   - validar que el servicio exista antes de agregarlo a una reserva
//     (para eso este service COMPONE al services.service: un service
//     puede apoyarse en otro);
//   - la regla de "quantity": si el servicio ya está en la reserva se
//     incrementa su cantidad; si no, se agrega { service, quantity: 1 };
//   - devolver resultados de DOMINIO: la reserva, o un error de dominio
//     como { error: 'SERVICE_NOT_FOUND' } / { error: 'BOOKING_NOT_FOUND' }.
//     El controller después traduce esos resultados a códigos HTTP.
//
// El BookingManager queda como PERSISTENCIA PURA: leer/escribir el JSON
// y CRUD sobre él. No sabe nada de servicios ni de reglas.
//
// Este service NO conoce req ni res.
// ---------------------------------------------------------------------

import { BookingRepository } from '../repositories/bookings.repository.js';
import { ServiceRepository } from '../repositories/services.repository.js';
import { AppError } from '../utils/AppError.js';


class BookingsService {
  constructor(
    bookingRepository = new BookingRepository(),
    serviceRepository = new ServiceRepository()
  ) {
    this.bookingRepository = bookingRepository;
    this.serviceRepository = serviceRepository;
  }

// Devuelve la reserva con ese id. Si no existe, AppError 404.
  async getBookingById(id) {
    const booking = await this.bookingRepository.getById(id);

    if (!booking) {
      throw new AppError('Reserva no encontrada', 404);
    }

    return booking;
  }

  // Crea una reserva nueva. Se arman los valores por defecto.
  // el schema de BookingModel le pone 'pending' por defecto.
  async createBooking(data) {
    const newBooking = {
      clientName: data.clientName ?? 'Anónimo',
      clientEmail: data.clientEmail,
      date: data.date,
      time: data.time,
      // La reserva arranca SIN servicios; se agregan después con // addServiceToBooking.
      services: [],
    };

    return this.bookingRepository.create(newBooking);
  }

  // Agrega el servicio :sid a la reserva :bid.
  async addServiceToBooking(bid, sid) {
    // 1) Regla de negocio: no se puede agregar un servicio que no
    //    existe. Se lo preguntamos al serviceRepository.
    console.log('BookingsService.addServiceToBooking: bid=', bid, 'sid=', sid);
    const servicio = await this.serviceRepository.getById(sid);
    if (!servicio) {
      throw new AppError('Servicio no encontrado', 404);
    }

    // 2) La reserva tiene que existir.
    const booking = await this.bookingRepository.getById(bid);
    if (!booking) {
      throw new AppError('Reserva no encontrada', 404);
    }
    // 3) Regla de "quantity".
    //    En booking.services NO guardamos el objeto completo del servicio, solo su REFERENCIA (el ObjectId) + una cantidad.
    //    Motivos:
    //      - Sin duplicación: nombre/precio/duración viven solo en la
    //        colección "services". Si cambia el precio, no hay copias
    //        viejas.
    //      - Sin inconsistencias: una única fuente de verdad.
    //
    //    Si el servicio YA está en la reserva, incrementamos su quantity en vez de hacer un segundo push del mismo id: así la
    //    lista tiene una entrada por servicio + un contador, más fácil de leer y de mostrar que varias entradas repetidas.
    //    s.service ahora es un ObjectId de Mongo (no un number), así que comparamos convirtiendo ambos lados a string.
    
    const item = booking.services.find((s) => String(s.service) === String(sid));
    if (item) {
      item.quantity += 1;
    } else {
      // Mongoose castea automáticamente el string sid a ObjectId al guardar, gracias al tipo declarado en el schema.
      booking.services.push({ service: sid, quantity: 1 });
    }

    // 4) Persistimos el cambio: le pedimos al repository que guarde la nueva lista de servicios de esta reserva. 
    // El repository/dao solo escribe; la regla de cómo quedó la lista ya la aplicamos.
    return this.bookingRepository.update(bid, { services: booking.services });
  }
  async updateBooking(bid, data) {
    return this.bookingRepository.update(bid, data);
  }

  async getStatusReport() {
    return this.bookingRepository.countByStatus();
  }
}

// Instancia única compartida por todos los que importen este módulo.
export const bookingsService = new BookingsService();
