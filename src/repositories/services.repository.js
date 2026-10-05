
// ServiceRepository: puente entre el SERVICE (reglas de negocio) y el DAO (persistencia). 
// No aplica ninguna regla de negocio: solo delega.



//import { ServiceFsDao } from "../dao/services.dao.js";
import { ServiceMongoDao } from '../dao/mongo/services.mongo.dao.js';

export class ServiceRepository {
  constructor(dao = new ServiceMongoDao()) {
    this.dao = dao;
  }

  async getAll() {
    return this.dao.getAll();
  }

  async getPaginated(filter, options) {
    return this.dao.getPaginated(filter, options);
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

  async delete(id) {
    return this.dao.delete(id);
  }
}