import { useState, useEffect } from 'react'
import { Layout, Modal, Alert } from '../components/UI'
import { useAuth } from '../context/AuthContext'
import { getReservas, getAuditorios, getConferencistas, crearReserva, editarReserva, borrarReserva } from '../services/api'

const VACIO = { codigo: '', descripcion: '', auditorio: '', conferencista: '' }

export default function Reservas() {
  const { usuario } = useAuth()
  const [reservas, setReservas]               = useState([])
  const [auditorios, setAuditorios]           = useState([])
  const [conferencistas, setConferencistas]   = useState([])
  const [cargando, setCargando]               = useState(true)
  const [modal, setModal]                     = useState(null)
  const [sel, setSel]                         = useState(null)
  const [form, setForm]                       = useState(VACIO)
  const [alerta, setAlerta]                   = useState(null)
  const [guardando, setGuardando]             = useState(false)
  const [busqueda, setBusqueda]               = useState('')
  const [vistaAgrupada, setVistaAgrupada]     = useState(false)

  const cargar = async () => {
    try {
      const [rRes, aRes, cRes] = await Promise.all([getReservas(), getAuditorios(), getConferencistas()])
      setReservas(rRes.data.reservas || [])
      setAuditorios(aRes.data.auditorios || [])
      setConferencistas(cRes.data.conferencistas || [])
    } catch { setAlerta({ tipo: 'error', msg: 'Error al cargar datos' }) }
    finally { setCargando(false) }
  }
  useEffect(() => { cargar() }, [])

  const abrirCrear  = () => { setForm(VACIO); setModal('crear') }
  const abrirEditar = (r) => {
    setSel(r); setModal('editar')
    setForm({ codigo: r.codigo, descripcion: r.descripcion || '', auditorio: r.auditorio?._id || r.auditorio, conferencista: r.conferencista?._id || r.conferencista })
  }
  const abrirEliminar = (r) => { setSel(r); setModal('eliminar') }
  const cerrar = () => { setModal(null); setSel(null) }

  const handleGuardar = async (e) => {
    e.preventDefault(); setGuardando(true)
    try {
      if (modal === 'crear') await crearReserva(form)
      else await editarReserva(sel._id, form)
      setAlerta({ tipo: 'success', msg: modal === 'crear' ? 'Reserva creada correctamente' : 'Reserva actualizada correctamente' })
      cerrar(); cargar()
    } catch (err) { setAlerta({ tipo: 'error', msg: err.response?.data?.msg || 'Error al guardar' }) }
    finally { setGuardando(false) }
  }

  const handleEliminar = async () => {
    setGuardando(true)
    try { await borrarReserva(sel._id); setAlerta({ tipo: 'success', msg: 'Reserva eliminada correctamente' }); cerrar(); cargar() }
    catch { setAlerta({ tipo: 'error', msg: 'Error al eliminar reserva' }) }
    finally { setGuardando(false) }
  }

  const filtradas = reservas.filter(r => {
    const c   = `${r.conferencista?.nombre || ''} ${r.conferencista?.apellido || ''}`
    const aud = r.auditorio?.nombre || ''
    return `${r.codigo} ${c} ${aud}`.toLowerCase().includes(busqueda.toLowerCase())
  })

  // Agrupar por conferencista
  const agrupadas = filtradas.reduce((acc, r) => {
    const key    = r.conferencista?._id || 'sin'
    const nombre = r.conferencista ? `${r.conferencista.nombre} ${r.conferencista.apellido}` : 'Sin conferencista'
    if (!acc[key]) acc[key] = { nombre, empresa: r.conferencista?.empresa, reservas: [] }
    acc[key].reservas.push(r)
    return acc
  }, {})

  return (
    <Layout>
      <div className="p-8 fade-in">
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-dark-300 text-sm mb-1">Bienvenido — <span className="text-conf-300">{usuario?.nombre} {usuario?.apellido}</span></p>
            <h1 className="font-display font-bold text-3xl text-white">Reservas</h1>
            <p className="text-dark-300 text-sm mt-1">{reservas.length} reserva{reservas.length !== 1 ? 's' : ''} registrada{reservas.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={abrirCrear} className="btn-primary flex items-center gap-2"><span className="text-lg leading-none">+</span> Nueva reserva</button>
        </div>

        {alerta && <div className="mb-6"><Alert tipo={alerta.tipo} mensaje={alerta.msg} onClose={() => setAlerta(null)} /></div>}

        <div className="flex items-center gap-4 mb-5 flex-wrap">
          <input type="text" placeholder="Buscar por código, conferencista o auditorio..." className="input-field max-w-sm" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          <div className="flex items-center gap-2 bg-dark-800 border border-dark-600/60 rounded-xl p-1">
            <button onClick={() => setVistaAgrupada(false)} className={`text-xs px-3 py-1.5 rounded-lg transition-all ${!vistaAgrupada ? 'bg-conf-500 text-white' : 'text-dark-300 hover:text-white'}`}>Lista</button>
            <button onClick={() => setVistaAgrupada(true)}  className={`text-xs px-3 py-1.5 rounded-lg transition-all ${vistaAgrupada  ? 'bg-conf-500 text-white' : 'text-dark-300 hover:text-white'}`}>Por conferencista</button>
          </div>
        </div>

        {cargando ? (
          <div className="card p-12 text-center text-dark-300">Cargando...</div>
        ) : filtradas.length === 0 ? (
          <div className="card p-12 text-center text-dark-300">No hay reservas registradas</div>
        ) : vistaAgrupada ? (
          <div className="space-y-6">
            {Object.values(agrupadas).map(({ nombre, empresa, reservas: rs }) => (
              <div key={nombre} className="card overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 bg-dark-700/40 border-b border-dark-600/60">
                  <div className="w-8 h-8 rounded-full bg-conf-500/20 border border-conf-400/30 flex items-center justify-center text-conf-300 text-xs font-bold">{nombre[0]}</div>
                  <div>
                    <p className="text-white font-semibold text-sm">{nombre}</p>
                    {empresa && <p className="text-dark-300 text-xs">{empresa}</p>}
                  </div>
                  <span className="ml-auto text-xs bg-conf-500/15 text-conf-300 px-2.5 py-1 rounded-full border border-conf-500/20 font-medium">{rs.length} reserva{rs.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-dark-600/40">
                      <tr>{['Código','Auditorio','Ubicación','Descripción','Acciones'].map(h => <th key={h} className="table-header">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {rs.map(r => (
                        <tr key={r._id} className="table-row">
                          <td className="table-cell font-mono text-conf-300 text-xs font-semibold">{r.codigo}</td>
                          <td className="table-cell text-white">{r.auditorio?.nombre}</td>
                          <td className="table-cell text-dark-300 text-xs">{r.auditorio?.ubicacion}</td>
                          <td className="table-cell text-dark-300 text-xs max-w-xs truncate">{r.descripcion || '—'}</td>
                          <td className="table-cell">
                            <div className="flex gap-2">
                              <button onClick={() => abrirEditar(r)} className="btn-edit text-xs">Editar</button>
                              <button onClick={() => abrirEliminar(r)} className="btn-danger text-xs">Eliminar</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-dark-600/60">
                  <tr>{['Código','Conferencista','Auditorio','Ubicación','Descripción','Acciones'].map(h => <th key={h} className="table-header">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {filtradas.map(r => (
                    <tr key={r._id} className="table-row">
                      <td className="table-cell font-mono text-conf-300 text-xs font-semibold">{r.codigo}</td>
                      <td className="table-cell font-medium text-white">{r.conferencista?.nombre} {r.conferencista?.apellido}</td>
                      <td className="table-cell">{r.auditorio?.nombre}</td>
                      <td className="table-cell text-dark-300 text-xs">{r.auditorio?.ubicacion}</td>
                      <td className="table-cell text-dark-300 text-xs max-w-xs truncate">{r.descripcion || '—'}</td>
                      <td className="table-cell">
                        <div className="flex gap-2">
                          <button onClick={() => abrirEditar(r)} className="btn-edit text-xs">Editar</button>
                          <button onClick={() => abrirEliminar(r)} className="btn-danger text-xs">Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {(modal === 'crear' || modal === 'editar') && (
        <Modal titulo={modal === 'crear' ? 'Nueva reserva' : 'Editar reserva'} onClose={cerrar}>
          <form onSubmit={handleGuardar} className="space-y-4">
            <div><label className="block text-xs font-medium text-dark-300 mb-1.5">Código *</label><input className="input-field" value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} placeholder="RES-001" required /></div>
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1.5">Conferencista *</label>
              <select className="input-field" value={form.conferencista} onChange={e => setForm({...form, conferencista: e.target.value})} required>
                <option value="">— Selecciona un conferencista —</option>
                {conferencistas.map(c => <option key={c._id} value={c._id}>{c.nombre} {c.apellido}{c.empresa ? ` — ${c.empresa}` : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1.5">Auditorio *</label>
              <select className="input-field" value={form.auditorio} onChange={e => setForm({...form, auditorio: e.target.value})} required>
                <option value="">— Selecciona un auditorio —</option>
                {auditorios.map(a => <option key={a._id} value={a._id}>{a.nombre} — {a.ubicacion} ({a.capacidad} personas)</option>)}
              </select>
            </div>
            <div><label className="block text-xs font-medium text-dark-300 mb-1.5">Descripción</label><textarea className="input-field resize-none" rows={2} value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} placeholder="Tema o descripción de la conferencia..." /></div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1" disabled={guardando}>{guardando ? 'Guardando...' : modal === 'crear' ? 'Crear reserva' : 'Guardar cambios'}</button>
              <button type="button" onClick={cerrar} className="btn-secondary">Cancelar</button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'eliminar' && (
        <Modal titulo="Eliminar reserva" onClose={cerrar}>
          <p className="text-zinc-300 mb-2">¿Estás seguro de eliminar la reserva:</p>
          <p className="text-white font-semibold mb-6">"{sel?.codigo}"</p>
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
