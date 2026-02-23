import { Router } from 'express'
import { listarConferencistas, detalleConferencista, crearConferencista, actualizarConferencista, eliminarConferencista } from '../controllers/conferencista_controller.js'
import { verificarTokenJWT } from '../middlewares/JWT.js'
const r = Router()
r.get('/',     verificarTokenJWT, listarConferencistas)
r.get('/:id',  verificarTokenJWT, detalleConferencista)
r.post('/',    verificarTokenJWT, crearConferencista)
r.put('/:id',  verificarTokenJWT, actualizarConferencista)
r.delete('/:id', verificarTokenJWT, eliminarConferencista)
export default r
