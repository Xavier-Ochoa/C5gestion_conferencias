import express from 'express'
import cors from 'cors'
import authRoutes          from './routes/auth_routes.js'
import auditorioRoutes     from './routes/auditorio_routes.js'
import conferencistaRoutes from './routes/conferencista_routes.js'
import reservaRoutes       from './routes/reserva_routes.js'

const app = express()

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.options('*', cors())

app.use(express.json())

app.get('/', (_, res) => res.send('🎤 API – Sistema de Gestión de Conferencias'))

app.use('/api/auth',           authRoutes)
app.use('/api/auditorios',     auditorioRoutes)
app.use('/api/conferencistas', conferencistaRoutes)
app.use('/api/reservas',       reservaRoutes)

app.use((req, res) => res.status(404).json({ msg: 'Endpoint no encontrado' }))
app.use((err, req, res, next) => res.status(500).json({ msg: 'Error interno del servidor' }))

export default app
