import { Router } from 'express'
import { listarReservas, detalleReserva, crearReserva, actualizarReserva, eliminarReserva } from '../controllers/reserva_controller.js'
import { verificarTokenJWT } from '../middlewares/JWT.js'
const r = Router()
r.get('/',     verificarTokenJWT, listarReservas)
r.get('/:id',  verificarTokenJWT, detalleReserva)
r.post('/',    verificarTokenJWT, crearReserva)
r.put('/:id',  verificarTokenJWT, actualizarReserva)
r.delete('/:id', verificarTokenJWT, eliminarReserva)
export default r
