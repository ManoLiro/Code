import BikeCard from './BikeCard'

const BikeGrid = ({ bikes, assignments, onClickBike }) => {
  const bikeArray = Object.values(bikes)

  if (bikeArray.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mb-4">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h3 className="text-xl font-semibold text-gray-300 mb-2">
          Aguardando dados das bicicletas...
        </h3>
        <p className="text-gray-500 text-sm">
          As bikes começarão a aparecer assim que enviarem dados
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      {bikeArray.map((bike) => (
        <BikeCard
          key={bike.device}
          bike={bike}
          assignment={assignments?.[bike.device] || null}
          onClickBike={onClickBike}
        />
      ))}
    </div>
  )
}

export default BikeGrid
