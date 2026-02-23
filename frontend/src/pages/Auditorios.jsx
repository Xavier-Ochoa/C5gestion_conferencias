import { useState, useEffect } from 'react'
import { Layout, Modal, Alert } from '../components/UI'
import { useAuth } from '../context/AuthContext'
import { getAuditorios, crearAuditorio, editarAuditorio, borrarAuditorio } from '../services/api'

const VACIO = { cedula: '', nombre: '', ubicacion: '', capacidad: '', descripcion: '' }

export default function Auditorios() {
  const { usuario } = useAuth()
  const [auditorios, setAuditorios] = useState([])
  const [cargando, setCargando]     = useState(true)
  const [modal, setModal]           = useState(null)
  const [sel, setSel]               = useState(null)
  const [form, setForm]             = useState(VACIO)
  const [alerta, setAlerta]         = useState(null)
  const [guardando, setGuardando]   = useState(false)
  const [busqueda, setBusqueda]     = useState('')

  const cargar = async () => {
    try { const { data } = await getAuditorios(); setAuditorios(data.auditorios || []) }
    catch { setAlerta({ tipo: 'error', msg: 'Error al cargar auditorios' }) }
    finally { setCargando(false) }
  }
  useEffect(() => { cargar() }, [])

  const abrirCrear  = () => { setForm(VACIO); setModal('crear') }
  const abrirEditar = (a) => {
    setSel(a); setModal('editar')
    setForm({ cedula: a.cedula, nombre: a.nombre, ubicacion: a.ubicacion, capacidad: a.capacidad, descripcion: a.descripcion || '' })
  }
  const abrirEliminar = (a) => { setSel(a); setModal('eliminar') }
  const cerrar = () => { setModal(null); setSel(null) }

  const handleGuardar = async (e) => {
    e.preventDefault(); setGuardando(true)
    try {
      const payload = { ...form, capacidad: Number(form.capacidad) }
      if (modal === 'crear') await crearAuditorio(payload)
      else await editarAuditorio(sel._id, payload)
      setAlerta({ tipo: 'success', msg: modal === 'crear' ? 'Auditorio creado correctamente' : 'Auditorio actualizado correctamente' })
      cerrar(); cargar()
    } catch (err) { setAlerta({ tipo: 'error', msg: err.response?.data?.msg || 'Error al guardar' }) }
    finally { setGuardando(false) }
  }

  const handleEliminar = async () => {
    setGuardando(true)
    try { await borrarAuditorio(sel._id); setAlerta({ tipo: 'success', msg: 'Auditorio eliminado correctamente' }); cerrar(); cargar() }
    catch { setAlerta({ tipo: 'error', msg: 'Error al eliminar auditorio' }) }
    finally { setGuardando(false) }
  }

  const filtrados = auditorios.filter(a => `${a.cedula} ${a.nombre} ${a.ubicacion}`.toLowerCase().includes(busqueda.toLowerCase()))

  return (
    <Layout>
      <div className="p-8 fade-in">
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-dark-300 text-sm mb-1">Bienvenido — <span className="text-conf-300">{usuario?.nombre} {usuario?.apellido}</span></p>
            <h1 className="font-display font-bold text-3xl text-white">Auditorios</h1>
            <p className="text-dark-300 text-sm mt-1">{auditorios.length} auditorio{auditorios.length !== 1 ? 's' : ''} registrado{auditorios.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={abrirCrear} className="btn-primary flex items-center gap-2"><span className="text-lg leading-none">+</span> Nuevo auditorio</button>
        </div>

        {alerta && <div className="mb-6"><Alert tipo={alerta.tipo} mensaje={alerta.msg} onClose={() => setAlerta(null)} /></div>}
        <div className="mb-5"><input type="text" placeholder="Buscar por código, nombre o ubicación..." className="input-field max-w-sm" value={busqueda} onChange={e => setBusqueda(e.target.value)} /></div>

        <div className="card overflow-hidden">
          {cargando ? <div className="p-12 text-center text-dark-300">Cargando...</div>
          : filtrados.length === 0 ? <div className="p-12 text-center text-dark-300">No hay auditorios registrados</div>
          : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-dark-600/60">
                  <tr>{['Código','Nombre','Ubicación','Capacidad','Descripción','Acciones'].map(h => <th key={h} className="table-header">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {filtrados.map(a => (
                    <tr key={a._id} className="table-row">
                      <td className="table-cell font-mono text-conf-300 text-xs font-semibold">{a.cedula}</td>
                      <td className="table-cell font-medium text-white">{a.nombre}</td>
                      <td className="table-cell">{a.ubicacion}</td>
                      <td className="table-cell"><span className="bg-conf-500/10 text-conf-300 text-xs px-2 py-0.5 rounded-full border border-conf-500/20">{a.capacidad} personas</span></td>
                      <td className="table-cell text-dark-300 text-xs max-w-xs truncate">{a.descripcion || '—'}</td>
                      <td className="table-cell">
                        <div className="flex gap-2">
                          <button onClick={() => abrirEditar(a)} className="btn-edit text-xs">Editar</button>
                          <button onClick={() => abrirEliminar(a)} className="btn-danger text-xs">Eliminar</button>
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
        <Modal titulo={modal === 'crear' ? 'Nuevo auditorio' : 'Editar auditorio'} onClose={cerrar}>
          <form onSubmit={handleGuardar} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium text-dark-300 mb-1.5">Código/Cédula *</label><input className="input-field" value={form.cedula} onChange={e => setForm({...form, cedula: e.target.value})} placeholder="AUD-001" required /></div>
              <div><label className="block text-xs font-medium text-dark-300 mb-1.5">Capacidad *</label><input type="number" min="1" className="input-field" value={form.capacidad} onChange={e => setForm({...form, capacidad: e.target.value})} placeholder="200" required /></div>
            </div>
            <div><label className="block text-xs font-medium text-dark-300 mb-1.5">Nombre *</label><input className="input-field" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Auditorio Principal" required /></div>
            <div><label className="block text-xs font-medium text-dark-300 mb-1.5">Ubicación *</label><input className="input-field" value={form.ubicacion} onChange={e => setForm({...form, ubicacion: e.target.value})} placeholder="Bloque A, Piso 2" required /></div>
            <div><label className="block text-xs font-medium text-dark-300 mb-1.5">Descripción</label><textarea className="input-field resize-none" rows={2} value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} placeholder="Descripción del auditorio..." /></div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1" disabled={guardando}>{guardando ? 'Guardando...' : modal === 'crear' ? 'Crear auditorio' : 'Guardar cambios'}</button>
              <button type="button" onClick={cerrar} className="btn-secondary">Cancelar</button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'eliminar' && (
        <Modal titulo="Eliminar auditorio" onClose={cerrar}>
          <p className="text-zinc-300 mb-2">¿Estás seguro de eliminar el auditorio:</p>
          <p className="text-white font-semibold mb-6">"{sel?.nombre}"</p>
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
