// ================================================
// ENTRADA PRINCIPAL — Conectar DB y arrancar server
// ================================================

import 'dotenv/config'
import mongoose from 'mongoose'
import app from './server.js'

const PORT = process.env.PORT || 3000

const conectarDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('✅ Conectado a MongoDB')
}

conectarDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
    })
  })
  .catch((error) => {
    console.error('❌ Error al conectar a MongoDB:', error.message)
    process.exit(1)
  })
