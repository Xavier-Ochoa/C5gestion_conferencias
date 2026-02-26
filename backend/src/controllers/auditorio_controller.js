import Auditorio from '../models/Auditorio.js'

const errHandler = (e, res) => {
  if (e.name === 'ValidationError') return res.status(400).json({ msg: 'Error de validación', errores: Object.values(e.errors).map(x => x.message) })
  if (e.code === 11000) return res.status(400).json({ msg: `Ya existe un registro con este ${Object.keys(e.keyPattern)[0]}` })
  res.status(500).json({ msg: `Error en el servidor: ${e.message}` })
}

export const listarAuditorios = async (req, res) => {
  try {
    const auditorios = await Auditorio.find().select('-__v')
    res.status(200).json({ msg: 'Auditorios listados correctamente', total: auditorios.length, auditorios })
  } catch (e) { res.status(500).json({ msg: `Error en el servidor: ${e.message}` }) }
}

export const detalleAuditorio = async (req, res) => {
  try {
    const { id } = req.params
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).json({ msg: 'ID inválido' })
    const auditorio = await Auditorio.findById(id).select('-__v')
    if (!auditorio) return res.status(404).json({ msg: 'Auditorio no encontrado' })
    res.status(200).json({ msg: 'Auditorio encontrado', auditorio })
  } catch (e) { res.status(500).json({ msg: `Error en el servidor: ${e.message}` }) }
}

export const crearAuditorio = async (req, res) => {
  try {
    const faltantes = ['cedula','nombre','ubicacion','capacidad'].filter(c => !req.body[c])
    if (faltantes.length) return res.status(400).json({ msg: `Faltan campos obligatorios: ${faltantes.join(', ')}` })
    if (await Auditorio.findOne({ cedula: req.body.cedula })) return res.status(400).json({ msg: 'Ya existe un auditorio con esta cédula/código' })
    const auditorio = await new Auditorio(req.body).save()
    res.status(201).json({ msg: 'Auditorio creado correctamente', auditorio })
  } catch (e) { errHandler(e, res) }
}

export const actualizarAuditorio = async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body || {}
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).json({ msg: 'ID inválido' })
    if (!Object.keys(data).length) return res.status(400).json({ msg: 'Debes enviar al menos un campo' })
    if (data.cedula) {
      const existe = await Auditorio.findOne({ cedula: data.cedula, _id: { $ne: id } })
      if (existe) return res.status(400).json({ msg: 'Ya existe otro auditorio con esta cédula/código' })
    }
    const auditorio = await Auditorio.findByIdAndUpdate(id, data, { new: true, runValidators: true }).select('-__v')
    if (!auditorio) return res.status(404).json({ msg: 'Auditorio no encontrado' })
    res.status(200).json({ msg: 'Auditorio actualizado correctamente', auditorio })
  } catch (e) { errHandler(e, res) }
}

export const eliminarAuditorio = async (req, res) => {
  try {
    const { id } = req.params
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).json({ msg: 'ID inválido' })
    const auditorio = await Auditorio.findByIdAndDelete(id)
    if (!auditorio) return res.status(404).json({ msg: 'Auditorio no encontrado' })
    res.status(200).json({ msg: 'Auditorio eliminado correctamente', auditorio })
  } catch (e) { res.status(500).json({ msg: `Error en el servidor: ${e.message}` }) }
}
