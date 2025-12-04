import { 
  Gauge, 
  Zap, 
  Activity, 
  Timer, 
  TrendingUp,
  Route,
  Heart,
  Clock
} from 'lucide-react'

const BikeCard = ({ bike }) => {
  // Verifica se a bike está ativa (recebeu dados nos últimos 10 segundos)
  const isActive = () => {
    if (!bike.last_update) return false
    const lastUpdate = new Date(bike.last_update)
    const now = new Date()
    return (now - lastUpdate) < 10000
  }

  const active = isActive()

  // Formata valores com fallback
  const formatValue = (value, decimals = 1, unit = '') => {
    if (value === undefined || value === null) return '--'
    return `${Number(value).toFixed(decimals)}${unit}`
  }

  const formatTime = (seconds) => {
    if (!seconds) return '--'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={`card-bike ${active ? 'ring-2 ring-primary-500/30' : ''}`}>
      {/* Header do Card */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white truncate">
            {bike.device || 'Bike'}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`}></div>
            <span className={`text-xs ${active ? 'text-green-400' : 'text-gray-500'}`}>
              {active ? 'Ativa' : 'Inativa'}
            </span>
          </div>
        </div>
        <Activity className={`w-6 h-6 ${active ? 'text-primary-500' : 'text-gray-600'}`} />
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Velocidade */}
        <MetricBox
          icon={<Gauge className="w-4 h-4" />}
          label="Velocidade"
          value={formatValue(bike.instant_speed, 1, ' km/h')}
          active={active}
        />

        {/* Potência */}
        <MetricBox
          icon={<Zap className="w-4 h-4" />}
          label="Potência"
          value={formatValue(bike.instant_power, 0, ' W')}
          active={active}
        />

        {/* Cadência */}
        <MetricBox
          icon={<TrendingUp className="w-4 h-4" />}
          label="Cadência"
          value={formatValue(bike.instant_cadence, 0, ' rpm')}
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

      {/* Métricas Secundárias */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-dark-700">
        {bike.heart_rate && (
          <SmallMetric
            icon={<Heart className="w-3 h-3" />}
            value={bike.heart_rate}
            unit="bpm"
            active={active}
          />
        )}
        
        {bike.elapsed_time && (
          <SmallMetric
            icon={<Clock className="w-3 h-3" />}
            value={formatTime(bike.elapsed_time)}
            unit=""
            active={active}
          />
        )}

        {bike.total_energy && (
          <SmallMetric
            icon={<Zap className="w-3 h-3" />}
            value={bike.total_energy}
            unit="kcal"
            active={active}
          />
        )}
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

// Componente para métricas pequenas
const SmallMetric = ({ icon, value, unit, active }) => (
  <div className="flex items-center gap-1 text-xs">
    <div className={`${active ? 'text-primary-500' : 'text-gray-600'}`}>
      {icon}
    </div>
    <span className={`font-semibold ${active ? 'text-gray-300' : 'text-gray-600'}`}>
      {value} <span className="text-gray-500">{unit}</span>
    </span>
  </div>
)

export default BikeCard
