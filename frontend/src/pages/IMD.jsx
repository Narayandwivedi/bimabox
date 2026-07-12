import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'
import { enforceMobileNumberFormat } from '../utils/contactValidation'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const IMD = () => {
  const [imds, setImds] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editMobile, setEditMobile] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [newName, setNewName] = useState('')
  const [newMobile, setNewMobile] = useState('')
  const [newEmail, setNewEmail] = useState('')

  useEffect(() => {
    fetchImds()
  }, [])

  const fetchImds = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API_URL}/api/imd`, { withCredentials: true })
      if (res.data.success) setImds(res.data.data)
    } catch {
      toast.error('Failed to load IMDs')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    const name = newName.trim()
    if (!name) return
    try {
      const res = await axios.post(`${API_URL}/api/imd`, { name, mobile: newMobile, email: newEmail }, { withCredentials: true })
      if (res.data.success) {
        setImds(prev => {
          const exists = prev.find(r => r._id === res.data.data._id)
          return exists ? prev.map(r => r._id === res.data.data._id ? res.data.data : r) : [...prev, res.data.data].sort((a, b) => a.name.localeCompare(b.name))
        })
        setNewName('')
        setNewMobile('')
        setNewEmail('')
        toast.success('Agent name added')
      }
    } catch {
      toast.error('Failed to add Agent name')
    }
  }

  const handleRename = async (id) => {
    const name = editName.trim()
    if (!name) return
    try {
      const res = await axios.put(`${API_URL}/api/imd/${id}`, { name, mobile: editMobile, email: editEmail }, { withCredentials: true })
      if (res.data.success) {
        setImds(prev => prev.map(r => r._id === id ? res.data.data : r))
        setEditingId(null)
        setEditName('')
        setEditMobile('')
        setEditEmail('')
        toast.success('Agent name renamed')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to rename Agent name')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this Agent name?')) return
    try {
      await axios.delete(`${API_URL}/api/imd/${id}`, { withCredentials: true })
      setImds(prev => prev.filter(r => r._id !== id))
      toast.success('Agent name deleted')
    } catch {
      toast.error('Failed to delete Agent name')
    }
  }

  const startEditing = (ref) => {
    setEditingId(ref._id)
    setEditName(ref.name)
    setEditMobile(ref.mobile || '')
    setEditEmail(ref.email || '')
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditName('')
    setEditMobile('')
    setEditEmail('')
  }

  return (
    <div className='min-h-screen bg-[radial-gradient(circle_at_top,_#f0f9ff,_#f8fafc_45%,_#ffffff_100%)]'>
      <main className='px-2 pt-3 pb-32 lg:px-8 lg:pt-4'>
        <section className='w-full'>
          <div className='max-w-7xl mx-auto'>
            <div className='rounded-[32px] border border-slate-200 bg-white p-4 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.25)] md:p-5 lg:p-6'>
              <h1 className='text-xl font-black text-slate-900 mb-6'>Agent name</h1>

              <div className='flex flex-wrap gap-2 mb-6'>
                <input
                  type='text'
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  placeholder='Agent Name'
                  className='flex-1 min-w-[140px] px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm'
                />
                <input
                  type='text'
                  value={newMobile}
                  onChange={(e) => setNewMobile(enforceMobileNumberFormat(e.target.value))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  placeholder='Mobile (optional)'
                  maxLength={10}
                  className='flex-1 min-w-[140px] px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm'
                />
                <input
                  type='email'
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  placeholder='Email (optional)'
                  className='flex-1 min-w-[160px] px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm'
                />
                <button
                  onClick={handleAdd}
                  disabled={!newName.trim()}
                  className='px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-bold text-sm hover:shadow-lg transition disabled:opacity-50 cursor-pointer'
                >
                  Add
                </button>
              </div>

              {loading ? (
                <div className='text-center py-12'>
                  <div className='animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto'></div>
                </div>
              ) : imds.length === 0 ? (
                <div className='text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200'>
                  <p className='text-sm font-bold text-slate-500'>No Agent names yet.</p>
                </div>
              ) : (
                <div className='space-y-2'>
                  {imds.map((ref) => (
                    <div key={ref._id} className='flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:border-indigo-200 transition'>
                      {editingId === ref._id ? (
                        <div className='flex items-center gap-2 flex-1 flex-wrap'>
                          <input
                            type='text'
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleRename(ref._id)}
                            className='flex-1 min-w-[120px] px-3 py-1.5 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white'
                            autoFocus
                          />
                          <input
                            type='text'
                            value={editMobile}
                            onChange={(e) => setEditMobile(enforceMobileNumberFormat(e.target.value))}
                            onKeyDown={(e) => e.key === 'Enter' && handleRename(ref._id)}
                            placeholder='Mobile'
                            maxLength={10}
                            className='w-[130px] px-3 py-1.5 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white'
                          />
                          <input
                            type='email'
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleRename(ref._id)}
                            placeholder='Email'
                            className='w-[160px] px-3 py-1.5 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white'
                          />
                          <button onClick={() => handleRename(ref._id)} className='px-3 py-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition cursor-pointer'>Save</button>
                          <button onClick={cancelEditing} className='px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer'>Cancel</button>
                        </div>
                      ) : (
                        <>
                          <div className='min-w-0 flex-1'>
                            <span className='text-sm font-semibold text-slate-700'>{ref.name}</span>
                            {(ref.mobile || ref.email) && (
                              <div className='text-xs text-slate-400 mt-0.5'>
                                {ref.mobile && <span>{ref.mobile.replace(/(\d{5})(\d{5})/, '$1 $2')}</span>}
                                {ref.mobile && ref.email && <span className='mx-1.5'>|</span>}
                                {ref.email && <span>{ref.email}</span>}
                              </div>
                            )}
                          </div>
                          <div className='flex gap-1 flex-shrink-0 ml-2'>
                            <button onClick={() => startEditing(ref)} className='p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer' title='Edit'>
                              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                              </svg>
                            </button>
                            <button onClick={() => handleDelete(ref._id)} className='p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer' title='Delete'>
                              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                              </svg>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default IMD
