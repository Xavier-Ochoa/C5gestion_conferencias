// ================================================
// SERVIDOR — Express, CORS, rutas y manejo de errores
// ================================================

import express from 'express'
import cors from 'cors'

// TODO: Importar rutas aquí cuando se creen
// import ejemploRoutes from './routes/ejemplo_routes.js'

const app = express()

// ── Middlewares globales ──────────────────────────
app.use(cors())
app.use(express.json())

// ── Ruta de prueba (verificar que el servidor funciona) ──
app.get('/', (req, res) => {
  res.json({ msg: '✅ Servidor funcionando correctamente' })
})

// ── Rutas de la API ───────────────────────────────
// TODO: Registrar rutas aquí cuando se creen
// app.use('/api/ejemplo', ejemploRoutes)

// ── Manejo de rutas no encontradas (404) ──────────
app.use((req, res) => {
  res.status(404).json({ msg: 'Ruta no encontrada' })
})

// ── Manejo global de errores (500) ────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message)
  res.status(500).json({ msg: 'Error interno del servidor' })
})

export default app
