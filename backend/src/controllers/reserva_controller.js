import Reserva from '../models/Reserva.js'
import Auditorio from '../models/Auditorio.js'
import Conferencista from '../models/Conferencista.js'

const pop = q => q.populate('auditorio', '-__v').populate('conferencista', '-__v').select('-__v')
const errHandler = (e, res) => {
  if (e.name === 'ValidationError') return res.status(400).json({ msg: 'Error de validación', errores: Object.values(e.errors).map(x => x.message) })
  if (e.code === 11000) return res.status(400).json({ msg: `Ya existe un registro con este ${Object.keys(e.keyPattern)[0]}` })
  res.status(500).json({ msg: `Error en el servidor: ${e.message}` })
}

export const listarReservas = async (req, res) => {
  try {
    const reservas = await pop(Reserva.find())
    res.status(200).json({ msg: 'Reservas listadas correctamente', total: reservas.length, reservas })
  } catch (e) { res.status(500).json({ msg: `Error en el servidor: ${e.message}` }) }
}

export const detalleReserva = async (req, res) => {
  try {
    const { id } = req.params
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).json({ msg: 'ID inválido' })
    const reserva = await pop(Reserva.findById(id))
    if (!reserva) return res.status(404).json({ msg: 'Reserva no encontrada' })
    res.status(200).json({ msg: 'Reserva encontrada', reserva })
  } catch (e) { res.status(500).json({ msg: `Error en el servidor: ${e.message}` }) }
}

export const crearReserva = async (req, res) => {
  try {
    const { codigo, descripcion, auditorio, conferencista } = req.body
    const faltantes = ['codigo','auditorio','conferencista'].filter(c => !req.body[c])
    if (faltantes.length) return res.status(400).json({ msg: `Faltan campos obligatorios: ${faltantes.join(', ')}` })
    if (await Reserva.findOne({ codigo: codigo.trim() })) return res.status(400).json({ msg: 'Ya existe una reserva con este código' })
    if (!auditorio.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).json({ msg: 'ID de auditorio inválido' })
    if (!await Auditorio.findById(auditorio)) return res.status(404).json({ msg: 'El auditorio indicado no existe' })
    if (!conferencista.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).json({ msg: 'ID de conferencista inválido' })
    if (!await Conferencista.findById(conferencista)) return res.status(404).json({ msg: 'El conferencista indicado no existe' })
    const nueva = await new Reserva({ codigo: codigo.trim(), descripcion: descripcion || null, auditorio, conferencista }).save()
    const reserva = await pop(Reserva.findById(nueva._id))
    res.status(201).json({ msg: 'Reserva creada correctamente', reserva })
  } catch (e) { errHandler(e, res) }
}

export const actualizarReserva = async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body || {}
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).json({ msg: 'ID inválido' })
    if (!Object.keys(data).length) return res.status(400).json({ msg: 'Debes enviar al menos un campo' })
    if (data.codigo) {
      const existe = await Reserva.findOne({ codigo: data.codigo.trim(), _id: { $ne: id } })
      if (existe) return res.status(400).json({ msg: 'Ya existe otra reserva con este código' })
      data.codigo = data.codigo.trim()
    }
    if (data.auditorio) {
      if (!data.auditorio.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).json({ msg: 'ID de auditorio inválido' })
      if (!await Auditorio.findById(data.auditorio)) return res.status(404).json({ msg: 'El auditorio indicado no existe' })
    }
    if (data.conferencista) {
      if (!data.conferencista.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).json({ msg: 'ID de conferencista inválido' })
      if (!await Conferencista.findById(data.conferencista)) return res.status(404).json({ msg: 'El conferencista indicado no existe' })
    }
    const reserva = await pop(Reserva.findByIdAndUpdate(id, data, { new: true, runValidators: true }))
    if (!reserva) return res.status(404).json({ msg: 'Reserva no encontrada' })
    res.status(200).json({ msg: 'Reserva actualizada correctamente', reserva })
  } catch (e) { errHandler(e, res) }
}

export const eliminarReserva = async (req, res) => {
  try {
    const { id } = req.params
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).json({ msg: 'ID inválido' })
    const reserva = await pop(Reserva.findByIdAndDelete(id))
    if (!reserva) return res.status(404).json({ msg: 'Reserva no encontrada' })
    res.status(200).json({ msg: 'Reserva eliminada correctamente', reserva })
  } catch (e) { res.status(500).json({ msg: `Error en el servidor: ${e.message}` }) }
}
