import { 
  Gauge, 
  Zap, 
  Activity, 
  Route,
  User
} from 'lucide-react'
import { useEffect } from 'react'

const BikeCard = ({ bike, assignment, onClickBike }) => {
  // Verifica se a bike está ativa (recebeu dados nos últimos 10 segundos)
  const isActive = () => {
    if (!bike.last_update) return false
    const lastUpdate = new Date(bike.last_update)
    const now = new Date()
    return (now - lastUpdate) < 10000
  }

  const active = isActive()

  // Retorna o nome da bike
  const getBikeName = () => {
    if (!bike.device) return 'Bike'
    const numbers = bike.device.match(/\d+/)
    if (numbers) return `Bike ${numbers[0]}`
    return bike.device
  }

  // Formata valores com fallback
  const formatValue = (value, decimals = 1, unit = '') => {
    if (value === undefined || value === null) return '--'
    return `${Number(value).toFixed(decimals)}${unit}`
  }

  return (
    <div className={`card-bike ${active ? 'ring-2 ring-primary-500/30' : ''}`}>
      {/* Header do Card */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div
            onClick={() => onClickBike?.(bike.device)}
            className="cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white truncate group-hover:text-primary-400 transition-colors">
                {getBikeName()}
              </h3>
              <User className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Nome do aluno vinculado */}
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`}></div>
            {assignment ? (
              <span className="text-xs text-primary-400 font-medium truncate">
                {assignment.student_name}
              </span>
            ) : (
              <span
                onClick={() => onClickBike?.(bike.device)}
                className="text-xs text-gray-500 hover:text-primary-400 cursor-pointer transition-colors"
              >
                Clique para vincular aluno
              </span>
            )}
          </div>
        </div>
        <Activity className={`w-6 h-6 ${active ? 'text-primary-500' : 'text-gray-600'}`} />
      </div>

      {/* 4 Métricas: Cadência, Potência, Velocidade, Distância */}
      <div className="grid grid-cols-2 gap-3">
        {/* Cadência */}
        <MetricBox
          icon={<Activity className="w-4 h-4" />}
          label="Cadência"
          value={formatValue(bike.instant_cadence, 0, ' rpm')}
          active={active}
        />

        {/* Potência */}
        <MetricBox
          icon={<Zap className="w-4 h-4" />}
          label="Potência"
          value={formatValue(bike.instant_power, 0, ' W')}
          active={active}
        />

        {/* Velocidade */}
        <MetricBox
          icon={<Gauge className="w-4 h-4" />}
          label="Velocidade"
          value={formatValue(bike.instant_speed, 1, ' km/h')}
          active={active}
        />

        {/* Distância */}
        <MetricBox
          icon={<Route className="w-4 h-4" />}
          label="Distância"
          value={formatValue(bike.total_distance ? bike.total_distance / 1000 : null, 2, ' km')}
          active={active}
        />
      </div>
    </div>
  )
}

// Componente para métricas principais
const MetricBox = ({ icon, label, value, active }) => (
  <div className="bg-dark-900/50 rounded-lg p-3 border border-dark-700">
    <div className="flex items-center gap-2 mb-1">
      <div className={`${active ? 'text-primary-500' : 'text-gray-600'}`}>
        {icon}
      </div>
      <span className="metric-label">{label}</span>
    </div>
    <div className={`text-xl font-bold ${active ? 'text-primary-400' : 'text-gray-600'}`}>
      {value}
    </div>
  </div>
)

export default BikeCard
