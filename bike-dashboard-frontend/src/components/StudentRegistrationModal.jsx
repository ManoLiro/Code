import { useState, useEffect } from 'react'
import { X, UserPlus, Trash2, Edit2, Save, XCircle } from 'lucide-react'

const API_URL = 'http://localhost:8000'

const formatCPF = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

const StudentRegistrationModal = ({ isOpen, onClose, onStudentsChanged }) => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingCpf, setEditingCpf] = useState(null)
  const [form, setForm] = useState({ name: '', cpf: '', weight: '', height: '' })
  const [editForm, setEditForm] = useState({ name: '', weight: '', height: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchStudents()
      setError('')
    }
  }, [isOpen])

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API_URL}/api/students`)
      const data = await res.json()
      setStudents(data.students || [])
    } catch {
      setError('Erro ao carregar alunos')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const cpfDigits = form.cpf.replace(/\D/g, '')
    if (cpfDigits.length !== 11) {
      setError('CPF deve ter 11 dígitos')
      return
    }
    if (!form.name.trim()) {
      setError('Nome é obrigatório')
      return
    }
    if (!form.weight || parseFloat(form.weight) <= 0) {
      setError('Peso inválido')
      return
    }
    if (!form.height || parseFloat(form.height) <= 0) {
      setError('Altura inválida')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cpf: cpfDigits,
          name: form.name.trim(),
          weight: parseFloat(form.weight),
          height: parseFloat(form.height),
        }),
      })
      if (res.status === 409) {
        setError('CPF já cadastrado')
        setLoading(false)
        return
      }
      if (!res.ok) throw new Error()
      setForm({ name: '', cpf: '', weight: '', height: '' })
      await fetchStudents()
      onStudentsChanged?.()
    } catch {
      setError('Erro ao cadastrar aluno')
    }
    setLoading(false)
  }

  const handleDelete = async (cpf) => {
    if (!confirm('Deseja realmente excluir este aluno?')) return
    try {
      await fetch(`${API_URL}/api/students/${cpf}`, { method: 'DELETE' })
      await fetchStudents()
      onStudentsChanged?.()
    } catch {
      setError('Erro ao excluir aluno')
    }
  }

  const startEditing = (student) => {
    setEditingCpf(student.cpf)
    setEditForm({ name: student.name, weight: student.weight, height: student.height })
  }

  const handleUpdate = async (cpf) => {
    try {
      const res = await fetch(`${API_URL}/api/students/${cpf}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name.trim(),
          weight: parseFloat(editForm.weight),
          height: parseFloat(editForm.height),
        }),
      })
      if (!res.ok) throw new Error()
      setEditingCpf(null)
      await fetchStudents()
      onStudentsChanged?.()
    } catch {
      setError('Erro ao atualizar aluno')
    }
  }

  const displayCPF = (cpf) => formatCPF(cpf)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-dark-800 border border-dark-600 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Cadastro de Alunos</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-dark-700 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-5 border-b border-dark-700">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs text-gray-400 mb-1 block">Nome do Aluno</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
                placeholder="Nome completo"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs text-gray-400 mb-1 block">CPF</label>
              <input
                type="text"
                value={form.cpf}
                onChange={(e) => setForm({ ...form, cpf: formatCPF(e.target.value) })}
                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
                placeholder="70.0"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Altura (cm)</label>
              <input
                type="number"
                step="1"
                value={form.height}
                onChange={(e) => setForm({ ...form, height: e.target.value })}
                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
                placeholder="170"
              />
            </div>
          </div>

          {error && (
            <div className="mt-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-3 w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
          >
            {loading ? 'Cadastrando...' : 'Cadastrar Aluno'}
          </button>
        </form>

        {/* Lista de alunos */}
        <div className="flex-1 overflow-y-auto p-5">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">
            Alunos Cadastrados ({students.length})
          </h3>
          {students.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">Nenhum aluno cadastrado</p>
          ) : (
            <div className="space-y-2">
              {students.map((s) => (
                <div
                  key={s.cpf}
                  className="flex items-center justify-between bg-dark-900/50 border border-dark-700 rounded-lg px-4 py-3"
                >
                  {editingCpf === s.cpf ? (
                    <div className="flex-1 grid grid-cols-3 gap-2 mr-3">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="bg-dark-800 border border-dark-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-primary-500"
                      />
                      <input
                        type="number"
                        step="0.1"
                        value={editForm.weight}
                        onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                        className="bg-dark-800 border border-dark-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-primary-500"
                      />
                      <input
                        type="number"
                        step="1"
                        value={editForm.height}
                        onChange={(e) => setEditForm({ ...editForm, height: e.target.value })}
                        className="bg-dark-800 border border-dark-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{s.name}</div>
                      <div className="text-xs text-gray-500">
                        CPF: {displayCPF(s.cpf)} · {s.weight}kg · {s.height}cm
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    {editingCpf === s.cpf ? (
                      <>
                        <button
                          onClick={() => handleUpdate(s.cpf)}
                          className="p-1.5 hover:bg-green-500/20 rounded transition-colors"
                          title="Salvar"
                        >
                          <Save className="w-4 h-4 text-green-400" />
                        </button>
                        <button
                          onClick={() => setEditingCpf(null)}
                          className="p-1.5 hover:bg-gray-500/20 rounded transition-colors"
                          title="Cancelar"
                        >
                          <XCircle className="w-4 h-4 text-gray-400" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(s)}
                          className="p-1.5 hover:bg-primary-500/20 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4 text-primary-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.cpf)}
                          className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentRegistrationModal
