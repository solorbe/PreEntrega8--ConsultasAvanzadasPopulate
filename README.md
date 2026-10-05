# PreEntrega8-ConsultasAvanzadasPopulate

Es una **API REST modular** de un Sistema de Turnos y Reservas, construida con **Express**.
La API está organizada en cada una con una única responsabilidad como se comenta en la sección "Flujo de una petición" más abajo.

Hoy expone dos recursos
`services` (servicios ofrecidos, con **CRUD completo**) y
`bookings` (reservas, que se relacionan con servicios guardando **solo la referencia** al `id`)

## Requisitos

- Node.js, por el soporte de `--watch` y ESM estable.
- git.
- una cuenta de **MongoDB Atlas**

## Instalación paso a paso

```bash
git clone
npm install express dotenv mongoose handlebars socket.io zod mongoose-paginate-v2
completar .env.example .env   # completar PORT=8080 y MONGO_URI
npm run dev
```

## Dependencias del proyecto

- **`express`**: framework que provee el servidor HTTP, el router y los middlewares (`express.json()`, logger propio, etc.) usados para armar la API.
- **`dotenv`**: lee el archivo `.env` de la raíz del proyecto y carga cada variable definida ahí dentro de `process.env`, el objeto donde Node guarda las variables de entorno del proceso. Todo lo que dotenv carga llega como **string**, aunque en el `.env` parezca un número.
- **`mongoose`**: ODM (Object-Document Mapper) para MongoDB. Permite definir "models" con un schema fijo y después usar esos models para leer/escribir en MongoDB con una API basada en promesas, en vez de escribir queries con el driver nativo a mano.
- **`fs`** (más precisamente `fs/promises`) es un módulo **nativo** de Node.js: no aparece en `package.json` ni requiere instalación, ya viene incluido en el runtime.
- **`handlebars`**: motor de plantillas para renderizar HTML dinámico. Se usa en la carpeta `views/` y se integra con Express a través de `app.engine('handlebars', ...)` en `src/app.js`.
- **`socket.io`**: permite comunicación bidireccional en tiempo real entre el servidor y los clientes web. Se integra con Express a través de `io.attach(server)` en `src/server.js`.
- **`mongoose-paginate-v2`**: plugin de Mongoose que agrega un método `Model.paginate()` para paginar resultados de consultas a MongoDB.

## Flujo de una petición

```
Cliente -> Ruta -> Controller -> Service -> Repository -> DAO -> MongoDB
```

- **Router**: reconoce el método + path y llama a la función del controller.
- **Controller**: lee `req.params` / `req.query` / `req.body`, valida el *formato* del request (si faltan campos obligatorios → `400`), llama al **service** y traduce lo que devuelve a status + cuerpo. Va todo en `try/catch` → ante un error inesperado responde `500`. **No** toca el FileSystem ni aplica reglas de negocio.
- **Service**: aplica las reglas de negocio (por ejemplo: "no se puede agregar a una reserva un servicio que no existe", la regla de `quantity`, el filtro por categoría). No conoce `req` ni `res`: recibe y devuelve datos de dominio (un objeto, `null`, o un error de dominio como `{ error: 'SERVICE_NOT_FOUND' }`)
- **repository** puente hacia el DAO (recibe el DAO por constructor, con un valor por defecto). No aplica reglas de negocio, solo delega.
- **dao** | Persistencia en mongoDB. Implementa los métodos CRUD y de búsqueda, usando el model de Mongoose correspondiente.

## Cómo probar con Postman

Con el servidor corriendo (por defecto en `http://localhost:8080`, salvo que haya cambiado `PORT` en tu `.env`):

| Método | URL | Body (raw JSON) | Respuesta esperada |
|---|---|---|---|
| GET | `http://localhost:8080/api/services` | — | `200` · `{ status:'success', payload:[...] }` |
| GET | `http://localhost:8080/api/services/1` | — | `200` o `404` si no existe |
| POST | `http://localhost:8080/api/services` | `{ "name":"Masajes","duration":60,"price":8000,"category":"estetica" }` | `201` · servicio creado |
| POST | `http://localhost:8080/api/services` | `{ "name":"Incompleto" }` | `400` · faltan campos |
| PUT | `http://localhost:8080/api/services/1` | `{ "price":6000 }` | `200` o `404` |
| DELETE | `http://localhost:8080/api/services/1` | — | `200` o `404` |
| POST | `http://localhost:8080/api/bookings` | `{ "client":"Ana","date":"2026-09-01" }` | `201` · reserva con `services:[]` |
| GET | `http://localhost:8080/api/bookings/1` | — | `200` o `404` |
| POST | `http://localhost:8080/api/bookings/1/services/2` | — | `200` · agrega `{ service:2, quantity:1 }` |
| POST | `http://localhost:8080/api/bookings/1/services/2` (otra vez) | — | `200` · ahora `quantity:2` |
| POST | `http://localhost:8080/api/bookings/1/services/999` | — | `404` · servicio no existe |

Para agregar un servicio a una reserva, ese servicio tiene que existir primero (`POST /api/services`).
También están disponibles `GET /` (estado del servidor)

## Dónde se guardan los datos

Ahora los datos viven en **MongoDB Atlas** en dos colecciones: `services` y `bookings`.
Se pueden very editar a mano desde la pestaña **Collections** del cluster en Atlas.

Los archivos `src/data/services.json` y `src/data/bookings.json` quedan en el repo como referencia histórica.

## Consultas avanzadas, validación y populate

`GET /api/services`: filtros, paginación y orden

Parámetros opcionales de la query string:
| Parámetro | Ejemplo | Efecto |
|---|---|---|
| `category` | `consulta` | Solo servicios de esa categoría |
| `available` | `true` / `false` | Solo disponibles / no disponibles |
| `page` | `2` | Número de página (default `1`) |
| `limit` | `5` | Servicios por página (default `10`) |
| `sort` | `asc` / `desc` | Orden por precio ascendente / descendente |

⚠️ **El shape de la respuesta cambió.**
Antes el `payload` era el array completo.
Ahora `payload` es el array **de la página pedida**, y alrededor viene la metadata de paginación:

 ```json
 {
   "status": "success",
   "payload": [ { "_id": "...", "name": "...", "price": 9000 } ],
   "totalPages": 2, "page": 1,
   "hasPrevPage": false, "hasNextPage": true,
   "prevPage": null, "nextPage": 2,
   "prevLink": null, "nextLink": "/api/services?page=2&limit=2"
 }
```

Las vistas (`/services`) y los sockets (`/realtime-services`) **no cambian**: siguen usando `getServices()`, con la lista completa.

## Validación con Zod

`POST /api/services` y `POST /api/bookings` pasan primero por el middleware `validateBody(schema)`.
Si el body no cumple el schema de Zod, se responde `400` **sin llegar al controller ni a la base**:

```json
{
  "status": "error",
  "message": "Datos inválidos",
  "errors": ["price: Invalid input: expected number, received string"]
}
```

Zod **no convierte tipos**: `"price": "8000"` (string) es inválido;
tiene que ser `8000` (número). Los services quedan solo con las reglas de negocio (por ejemplo, precio no negativo).

## Populate

En la base, cada reserva sigue guardando solo `{ service: <ObjectId>,
quantity }`
Al leerla, el DAO hace `.populate('services.service')` y Mongoose reemplaza cada `ObjectId` por el documento completo del
servicio (algo parecido a un `JOIN` de SQL).

Cómo probar la API con Postman

Cada recurso trae un `_id` de MongoDB (un `ObjectId`). 
Con el servidor corriendo http://localhost:8082/api/bookings/report/status
``` JSON
{
    "status": "success",
    "payload": [
        {
            "_id": "completado",
            "total": 1
        },
        {
            "_id": "confirmado",
            "total": 1
        },
        {
            "_id": "pending",
            "total": 12
        }
    ]
}
```
## Estructura del proyecto

```bash
src/
  app.js                    
  server.js                 
  config/
    env.config.js           # Carga y valida variables de entorno 
  routes/
    services.router.js      
    bookings.router.js    
    views.router.js  
  controllers/
    services.controller.js  # Solo HTTP: lee req, valida formato, llama al service, elige el status
    bookings.controller.js  # Solo HTTP: mapea los resultados de dominio del service a 200/201/404/500
  middlewares/
    validate.middleware.js      # validateBody(schema): safeParse de Zod -> 400 con errors o next()
  validations/
    service.validation.js       # Schema de Zod para crear un servicio
    booking.validation.js       # Schema de Zod para crear una reserva
  services/
    services.service.js     # Reglas de negocio de services (incl. filtro por categoría)
    bookings.service.js     # Reglas de negocio de bookings: valida el servicio (compone services.service) y aplica la regla de quantity; devuelve resultados de dominio
  dao/
    booking.dao.js      
    services.dao.js      
  data/
    services.json          
    bookings.json          
  repositories/
    booking.repository.js   
    services.repository.js 
  utils
    AppError.js 
  views/
    layouts/
      main.handlebars
    bookings.handlebars
    services.handlebars
    socket.handlebars
  public/
    socket.js               # cliente de Socket.IO
    
```