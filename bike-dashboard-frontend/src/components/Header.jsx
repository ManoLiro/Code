import { Activity, Wifi, WifiOff, UserPlus, RotateCcw } from 'lucide-react'

const Header = ({ totalBikes, activeBikes, isConnected, onOpenStudentModal, onResetAssignments }) => {
  const handleReset = () => {
    if (confirm('Deseja realmente desvincular todos os alunos das bikes?\nIsso é útil ao trocar de turma.')) {
      onResetAssignments?.()
    }
  }

  return (
    <header className="bg-dark-900/80 backdrop-blur-md border-b border-dark-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo, Título e Botões */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Abitah <span className="text-primary-500">Bikes</span>
                </h1>
                <p className="text-xs text-gray-400">Dashboard em Tempo Real</p>
              </div>
            </div>

            {/* Botões Navbar */}
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={onOpenStudentModal}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-800 border border-dark-700 hover:border-primary-500/50 hover:bg-dark-700 transition-all text-sm"
                title="Cadastrar Alunos"
              >
                <UserPlus className="w-4 h-4 text-primary-400" />
                <span className="text-gray-300 hidden sm:inline">Alunos</span>
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-800 border border-dark-700 hover:border-red-500/50 hover:bg-dark-700 transition-all text-sm"
                title="Resetar todos os vínculos (trocar turma)"
              >
                <RotateCcw className="w-4 h-4 text-red-400" />
                <span className="text-gray-300 hidden sm:inline">Resetar Vínculos</span>
              </button>
            </div>
          </div>

          {/* Status e Métricas */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-400">
                {activeBikes}/{totalBikes}
              </div>
              <div className="text-xs text-gray-400">Bikes Ativas</div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-800 border border-dark-700">
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-green-400 animate-pulse" />
                  <span className="text-xs text-green-400 font-medium">Conectado</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-red-400 font-medium">Desconectado</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
