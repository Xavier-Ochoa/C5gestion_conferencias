import { Router } from 'express'
import { listarAuditorios, detalleAuditorio, crearAuditorio, actualizarAuditorio, eliminarAuditorio } from '../controllers/auditorio_controller.js'
import { verificarTokenJWT } from '../middlewares/JWT.js'
const r = Router()
r.get('/',     verificarTokenJWT, listarAuditorios)
r.get('/:id',  verificarTokenJWT, detalleAuditorio)
r.post('/',    verificarTokenJWT, crearAuditorio)
r.put('/:id',  verificarTokenJWT, actualizarAuditorio)
r.delete('/:id', verificarTokenJWT, eliminarAuditorio)
export default r
