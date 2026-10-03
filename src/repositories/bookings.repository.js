// ---------------------------------------------------------------------
// BookingRepository: puente entre el SERVICE y el DAO de "bookings".
// Mismo patrón que ServiceRepository 

//import { BookingFsDao } from '../dao/bookings.dao.js';
import { BookingMongoDao } from '../dao/mongo/bookings.mongo.dao.js';


export class BookingRepository {
  // mismo swap que en ServiceRepository 
  constructor(dao = new BookingMongoDao()) {
    this.dao = dao;
  }

  async getAll() {
    return this.dao.getAll();
  }

  async getById(id) {
    return this.dao.getById(id);
  }

  async create(data) {
    return this.dao.create(data);
  }

  async update(id, data) {
    return this.dao.update(id, data);
  }
}
