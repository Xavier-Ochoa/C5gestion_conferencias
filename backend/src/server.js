import express from 'express'
import cors from 'cors'
import session from 'express-session'
import dotenv from 'dotenv'
import authRoutes          from './routes/auth_routes.js'
import auditorioRoutes     from './routes/auditorio_routes.js'
import conferencistaRoutes from './routes/conferencista_routes.js'
import reservaRoutes       from './routes/reserva_routes.js'

dotenv.config()
const app = express()
app.use(express.json())

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5501',
  process.env.URL_FRONTEND,
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error(`CORS bloqueado para: ${origin}`))
  },
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true
}))

app.use(session({
  secret: process.env.SESSION_SECRET || 'secreto_conferencias',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true, maxAge: 24*60*60*1000 }
}))

app.get('/', (_, res) => res.send('🎤 API – Sistema de Gestión de Conferencias'))
app.use('/api/auth',           authRoutes)
app.use('/api/auditorios',     auditorioRoutes)
app.use('/api/conferencistas', conferencistaRoutes)
app.use('/api/reservas',       reservaRoutes)

app.use((req, res) => res.status(404).json({ msg: 'Endpoint no encontrado' }))
app.use((err, req, res, next) => res.status(500).json({ msg: 'Error interno del servidor' }))

export default app
