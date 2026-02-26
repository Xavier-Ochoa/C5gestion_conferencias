import { Schema, model } from 'mongoose'

const reservaSchema = new Schema({
  codigo:        { type: String, required: [true, 'El código es obligatorio'], unique: true, trim: true },
  descripcion:   { type: String, trim: true, default: null },
  auditorio:     { type: Schema.Types.ObjectId, ref: 'Auditorio',     required: [true, 'El auditorio es obligatorio'] },
  conferencista: { type: Schema.Types.ObjectId, ref: 'Conferencista', required: [true, 'El conferencista es obligatorio'] }
}, { timestamps: true })

export default model('Reserva', reservaSchema)
