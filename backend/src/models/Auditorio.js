import { Schema, model } from 'mongoose'

const auditorioSchema = new Schema({
  cedula:      { type: String, required: [true, 'La cédula/código es obligatorio'], unique: true, trim: true },
  nombre:      { type: String, required: [true, 'El nombre es obligatorio'],        trim: true },
  ubicacion:   { type: String, required: [true, 'La ubicación es obligatoria'],     trim: true },
  capacidad:   { type: Number, required: [true, 'La capacidad es obligatoria'],     min: [1, 'La capacidad debe ser mayor a 0'] },
  descripcion: { type: String, trim: true, default: null }
}, { timestamps: true })

export default model('Auditorio', auditorioSchema)
