import { Activity, Wifi, WifiOff } from 'lucide-react'

const Header = ({ totalBikes, activeBikes, isConnected }) => {
  return (
    <header className="bg-dark-900/80 backdrop-blur-md border-b border-dark-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo e Título */}
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
