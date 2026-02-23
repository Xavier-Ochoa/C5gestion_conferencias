import Conferencista from '../models/Conferencista.js'

const errHandler = (e, res) => {
  if (e.name === 'ValidationError') return res.status(400).json({ msg: 'Error de validación', errores: Object.values(e.errors).map(x => x.message) })
  if (e.code === 11000) return res.status(400).json({ msg: `Ya existe un registro con este ${Object.keys(e.keyPattern)[0]}` })
  res.status(500).json({ msg: `Error en el servidor: ${e.message}` })
}

export const listarConferencistas = async (req, res) => {
  try {
    const conferencistas = await Conferencista.find().select('-__v')
    res.status(200).json({ msg: 'Conferencistas listados correctamente', total: conferencistas.length, conferencistas })
  } catch (e) { res.status(500).json({ msg: `Error en el servidor: ${e.message}` }) }
}

export const detalleConferencista = async (req, res) => {
  try {
    const { id } = req.params
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).json({ msg: 'ID inválido' })
    const conferencista = await Conferencista.findById(id).select('-__v')
    if (!conferencista) return res.status(404).json({ msg: 'Conferencista no encontrado' })
    res.status(200).json({ msg: 'Conferencista encontrado', conferencista })
  } catch (e) { res.status(500).json({ msg: `Error en el servidor: ${e.message}` }) }
}

export const crearConferencista = async (req, res) => {
  try {
    const faltantes = ['nombre','apellido','cedula','genero','ciudad','telefono','email'].filter(c => !req.body[c])
    if (faltantes.length) return res.status(400).json({ msg: `Faltan campos obligatorios: ${faltantes.join(', ')}` })
    if (await Conferencista.findOne({ cedula: req.body.cedula })) return res.status(400).json({ msg: 'Ya existe un conferencista con esta cédula' })
    if (await Conferencista.findOne({ email: req.body.email?.toLowerCase() })) return res.status(400).json({ msg: 'Ya existe un conferencista con este email' })
    const conferencista = await new Conferencista(req.body).save()
    res.status(201).json({ msg: 'Conferencista creado correctamente', conferencista })
  } catch (e) { errHandler(e, res) }
}

export const actualizarConferencista = async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body || {}
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).json({ msg: 'ID inválido' })
    if (!Object.keys(data).length) return res.status(400).json({ msg: 'Debes enviar al menos un campo' })
    if (data.cedula) {
      const existe = await Conferencista.findOne({ cedula: data.cedula, _id: { $ne: id } })
      if (existe) return res.status(400).json({ msg: 'Ya existe otro conferencista con esta cédula' })
    }
    if (data.email) {
      const existe = await Conferencista.findOne({ email: data.email.toLowerCase(), _id: { $ne: id } })
      if (existe) return res.status(400).json({ msg: 'Ya existe otro conferencista con este email' })
    }
    const conferencista = await Conferencista.findByIdAndUpdate(id, data, { new: true, runValidators: true }).select('-__v')
    if (!conferencista) return res.status(404).json({ msg: 'Conferencista no encontrado' })
    res.status(200).json({ msg: 'Conferencista actualizado correctamente', conferencista })
  } catch (e) { errHandler(e, res) }
}

export const eliminarConferencista = async (req, res) => {
  try {
    const { id } = req.params
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).json({ msg: 'ID inválido' })
    const conferencista = await Conferencista.findByIdAndDelete(id)
    if (!conferencista) return res.status(404).json({ msg: 'Conferencista no encontrado' })
    res.status(200).json({ msg: 'Conferencista eliminado correctamente', conferencista })
  } catch (e) { res.status(500).json({ msg: `Error en el servidor: ${e.message}` }) }
}
