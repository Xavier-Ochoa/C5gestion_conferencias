import { Router } from 'express'
import { registro, login, perfil } from '../controllers/auth_controller.js'
import { verificarTokenJWT } from '../middlewares/JWT.js'
const r = Router()
r.post('/registro', registro)
r.post('/login', login)
r.get('/perfil', verificarTokenJWT, perfil)
export default r
