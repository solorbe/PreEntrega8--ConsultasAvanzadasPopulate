import { Router } from 'express';
import { ServiceRepository } from '../repositories/services.repository.js';
import {BookingRepository} from '../repositories/bookings.repository.js';
const serviceRepository = new ServiceRepository();
const bookingRepository = new BookingRepository();
const router = Router();
router.get('/services', async (req, res) => {
  const services = await serviceRepository.getAll();
  res.render('services', {services});
});
router.get('/bookings', async (req, res) => {
  const bookings = await bookingRepository.getAll();
  res.render('bookings', {bookings});
});


router.get('/messages', async (req, res) => {
  res.render('socket');
});

export default router;
