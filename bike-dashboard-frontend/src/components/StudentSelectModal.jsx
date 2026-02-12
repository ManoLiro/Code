import { useState, useEffect } from 'react'
import { X, User, UserPlus, Search, AlertCircle } from 'lucide-react'

const API_URL = 'http://localhost:8000'

const formatCPF = (cpf) => {
  const d = cpf.replace(/\D/g, '')
  if (d.length !== 11) return cpf
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

const StudentSelectModal = ({ isOpen, onClose, device, currentAssignment, onOpenRegister }) => {
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchStudents()
      setSearch('')
      setError('')
    }
  }, [isOpen])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/students`)
      const data = await res.json()
      setStudents(data.students || [])
    } catch {
      setError('Erro ao carregar alunos')
    }
    setLoading(false)
  }

  const handleAssign = async (cpf) => {
    try {
      const res = await fetch(`${API_URL}/api/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device, student_cpf: cpf }),
      })
      if (!res.ok) throw new Error()
      onClose()
    } catch {
      setError('Erro ao vincular aluno')
    }
  }

  const handleUnassign = async () => {
    try {
      await fetch(`${API_URL}/api/assignments/${encodeURIComponent(device)}`, { method: 'DELETE' })
      onClose()
    } catch {
      setError('Erro ao desvincular aluno')
    }
  }

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.cpf.includes(search.replace(/\D/g, ''))
  )

  const bikeName = (() => {
    if (!device) return 'Bike'
    const nums = device.match(/\d+/)
    return nums ? `Bike ${nums[0]}` : device
  })()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-dark-800 border border-dark-600 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-dark-700">
          <div>
            <h2 className="text-lg font-bold text-white">Selecionar Aluno</h2>
            <p className="text-xs text-gray-400 mt-0.5">{bikeName} — {device}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-dark-700 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Aluno atual */}
        {currentAssignment && (
          <div className="mx-5 mt-4 p-3 bg-primary-500/10 border border-primary-500/30 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-primary-400">{currentAssignment.student_name}</div>
              <div className="text-xs text-gray-400">CPF: {formatCPF(currentAssignment.student_cpf)}</div>
            </div>
            <button
              onClick={handleUnassign}
              className="text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 px-2 py-1 rounded transition-colors"
            >
              Desvincular
            </button>
          </div>
        )}

        {/* Busca */}
        <div className="px-5 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-dark-900 border border-dark-600 rounded-lg pl-9 pr-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
              placeholder="Buscar por nome ou CPF..."
            />
          </div>
        </div>

        {error && (
          <div className="mx-5 mt-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {/* Lista */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
              <p className="text-gray-300 text-sm font-semibold mb-1">Nenhum aluno cadastrado</p>
              <p className="text-gray-500 text-xs mb-4">
                Cadastre alunos antes de vinculá-los às bikes
              </p>
              <button
                onClick={() => {
                  onClose()
                  onOpenRegister?.()
                }}
                className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-lg px-4 py-2 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Cadastrar Aluno
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">Nenhum aluno encontrado</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((s) => {
                const isCurrentStudent = currentAssignment?.student_cpf === s.cpf
                return (
                  <button
                    key={s.cpf}
                    onClick={() => handleAssign(s.cpf)}
                    disabled={isCurrentStudent}
                    className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-all
                      ${isCurrentStudent
                        ? 'bg-primary-500/10 border border-primary-500/30 cursor-default'
                        : 'bg-dark-900/50 border border-dark-700 hover:border-primary-500/50 hover:bg-dark-700/50 cursor-pointer'
                      }`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isCurrentStudent ? 'bg-primary-500' : 'bg-dark-700'}`}>
                      <User className={`w-4 h-4 ${isCurrentStudent ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold truncate ${isCurrentStudent ? 'text-primary-400' : 'text-white'}`}>
                        {s.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        CPF: {formatCPF(s.cpf)} · {s.weight}kg · {s.height}cm
                      </div>
                    </div>
                    {isCurrentStudent && (
                      <span className="text-xs text-primary-400 font-semibold shrink-0">Vinculado</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentSelectModal
