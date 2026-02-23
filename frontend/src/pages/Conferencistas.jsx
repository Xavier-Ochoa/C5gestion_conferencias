import { useState, useEffect } from 'react'
import { Layout, Modal, Alert } from '../components/UI'
import { useAuth } from '../context/AuthContext'
import { getConferencistas, crearConferencista, editarConferencista, borrarConferencista } from '../services/api'

const GENEROS = ['masculino', 'femenino', 'otro']
const VACIO = { nombre: '', apellido: '', cedula: '', genero: 'masculino', ciudad: '', direccion: '', fecha_nacimiento: '', telefono: '', email: '', empresa: '' }

export default function Conferencistas() {
  const { usuario } = useAuth()
  const [conferencistas, setConferencistas] = useState([])
  const [cargando, setCargando]   = useState(true)
  const [modal, setModal]         = useState(null)
  const [sel, setSel]             = useState(null)
  const [form, setForm]           = useState(VACIO)
  const [alerta, setAlerta]       = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [busqueda, setBusqueda]   = useState('')

  const cargar = async () => {
    try { const { data } = await getConferencistas(); setConferencistas(data.conferencistas || []) }
    catch { setAlerta({ tipo: 'error', msg: 'Error al cargar conferencistas' }) }
    finally { setCargando(false) }
  }
  useEffect(() => { cargar() }, [])

  const abrirCrear  = () => { setForm(VACIO); setModal('crear') }
  const abrirEditar = (c) => {
    setSel(c); setModal('editar')
    setForm({ nombre: c.nombre, apellido: c.apellido, cedula: c.cedula, genero: c.genero, ciudad: c.ciudad, direccion: c.direccion || '', fecha_nacimiento: c.fecha_nacimiento ? c.fecha_nacimiento.slice(0,10) : '', telefono: c.telefono, email: c.email, empresa: c.empresa || '' })
  }
  const abrirEliminar = (c) => { setSel(c); setModal('eliminar') }
  const cerrar = () => { setModal(null); setSel(null) }

  const handleGuardar = async (e) => {
    e.preventDefault(); setGuardando(true)
    try {
      if (modal === 'crear') await crearConferencista(form)
      else await editarConferencista(sel._id, form)
      setAlerta({ tipo: 'success', msg: modal === 'crear' ? 'Conferencista creado correctamente' : 'Conferencista actualizado correctamente' })
      cerrar(); cargar()
    } catch (err) { setAlerta({ tipo: 'error', msg: err.response?.data?.msg || 'Error al guardar' }) }
    finally { setGuardando(false) }
  }

  const handleEliminar = async () => {
    setGuardando(true)
    try { await borrarConferencista(sel._id); setAlerta({ tipo: 'success', msg: 'Conferencista eliminado correctamente' }); cerrar(); cargar() }
    catch { setAlerta({ tipo: 'error', msg: 'Error al eliminar conferencista' }) }
    finally { setGuardando(false) }
  }

  const filtrados = conferencistas.filter(c => `${c.nombre} ${c.apellido} ${c.cedula} ${c.email} ${c.empresa || ''}`.toLowerCase().includes(busqueda.toLowerCase()))
  const badgeGenero = (g) => ({ masculino: 'bg-blue-500/15 text-blue-400', femenino: 'bg-pink-500/15 text-pink-400', otro: 'bg-dark-600 text-dark-300' }[g] || '')

  return (
    <Layout>
      <div className="p-8 fade-in">
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-dark-300 text-sm mb-1">Bienvenido — <span className="text-conf-300">{usuario?.nombre} {usuario?.apellido}</span></p>
            <h1 className="font-display font-bold text-3xl text-white">Conferencistas</h1>
            <p className="text-dark-300 text-sm mt-1">{conferencistas.length} conferencista{conferencistas.length !== 1 ? 's' : ''} registrado{conferencistas.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={abrirCrear} className="btn-primary flex items-center gap-2"><span className="text-lg leading-none">+</span> Nuevo conferencista</button>
        </div>

        {alerta && <div className="mb-6"><Alert tipo={alerta.tipo} mensaje={alerta.msg} onClose={() => setAlerta(null)} /></div>}
        <div className="mb-5"><input type="text" placeholder="Buscar por nombre, cédula, email o empresa..." className="input-field max-w-sm" value={busqueda} onChange={e => setBusqueda(e.target.value)} /></div>

        <div className="card overflow-hidden">
          {cargando ? <div className="p-12 text-center text-dark-300">Cargando...</div>
          : filtrados.length === 0 ? <div className="p-12 text-center text-dark-300">No hay conferencistas registrados</div>
          : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-dark-600/60">
                  <tr>{['Cédula','Nombre','Apellido','Género','Ciudad','Teléfono','Empresa','Acciones'].map(h => <th key={h} className="table-header">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {filtrados.map(c => (
                    <tr key={c._id} className="table-row">
                      <td className="table-cell font-mono text-conf-300 text-xs font-semibold">{c.cedula}</td>
                      <td className="table-cell font-medium text-white">{c.nombre}</td>
                      <td className="table-cell">{c.apellido}</td>
                      <td className="table-cell"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeGenero(c.genero)}`}>{c.genero}</span></td>
                      <td className="table-cell">{c.ciudad}</td>
                      <td className="table-cell">{c.telefono}</td>
                      <td className="table-cell text-dark-300 text-xs">{c.empresa || '—'}</td>
                      <td className="table-cell">
                        <div className="flex gap-2">
                          <button onClick={() => abrirEditar(c)} className="btn-edit text-xs">Editar</button>
                          <button onClick={() => abrirEliminar(c)} className="btn-danger text-xs">Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {(modal === 'crear' || modal === 'editar') && (
        <Modal titulo={modal === 'crear' ? 'Nuevo conferencista' : 'Editar conferencista'} onClose={cerrar}>
          <form onSubmit={handleGuardar} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium text-dark-300 mb-1.5">Nombre *</label><input className="input-field" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="María" required /></div>
              <div><label className="block text-xs font-medium text-dark-300 mb-1.5">Apellido *</label><input className="input-field" value={form.apellido} onChange={e => setForm({...form, apellido: e.target.value})} placeholder="López" required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium text-dark-300 mb-1.5">Cédula *</label><input className="input-field" value={form.cedula} onChange={e => setForm({...form, cedula: e.target.value})} placeholder="1234567890" required /></div>
              <div><label className="block text-xs font-medium text-dark-300 mb-1.5">Teléfono *</label><input className="input-field" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} placeholder="0991234567" required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium text-dark-300 mb-1.5">Género *</label>
                <select className="input-field" value={form.genero} onChange={e => setForm({...form, genero: e.target.value})}>
                  {GENEROS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div><label className="block text-xs font-medium text-dark-300 mb-1.5">Fecha de nacimiento</label><input type="date" className="input-field" value={form.fecha_nacimiento} onChange={e => setForm({...form, fecha_nacimiento: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium text-dark-300 mb-1.5">Ciudad *</label><input className="input-field" value={form.ciudad} onChange={e => setForm({...form, ciudad: e.target.value})} placeholder="Quito" required /></div>
              <div><label className="block text-xs font-medium text-dark-300 mb-1.5">Empresa</label><input className="input-field" value={form.empresa} onChange={e => setForm({...form, empresa: e.target.value})} placeholder="Tech Corp" /></div>
            </div>
            <div><label className="block text-xs font-medium text-dark-300 mb-1.5">Email *</label><input type="email" className="input-field" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="correo@empresa.com" required /></div>
            <div><label className="block text-xs font-medium text-dark-300 mb-1.5">Dirección</label><input className="input-field" value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} placeholder="Av. Principal 123" /></div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1" disabled={guardando}>{guardando ? 'Guardando...' : modal === 'crear' ? 'Crear conferencista' : 'Guardar cambios'}</button>
              <button type="button" onClick={cerrar} className="btn-secondary">Cancelar</button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'eliminar' && (
        <Modal titulo="Eliminar conferencista" onClose={cerrar}>
          <p className="text-zinc-300 mb-2">¿Estás seguro de eliminar al conferencista:</p>
          <p className="text-white font-semibold mb-6">"{sel?.nombre} {sel?.apellido}"</p>
          <Alert tipo="error" mensaje="Esta acción no se puede deshacer." />
          <div className="flex gap-3 mt-5">
            <button onClick={handleEliminar} className="btn-danger flex-1 py-2.5" disabled={guardando}>{guardando ? 'Eliminando...' : 'Sí, eliminar'}</button>
            <button onClick={cerrar} className="btn-secondary flex-1">Cancelar</button>
          </div>
        </Modal>
      )}
    </Layout>
  )
}
