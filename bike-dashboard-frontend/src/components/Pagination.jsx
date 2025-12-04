import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalBikes, 
  startIndex, 
  endIndex 
}) => {
  const goToFirstPage = () => onPageChange(1)
  const goToPreviousPage = () => onPageChange(Math.max(1, currentPage - 1))
  const goToNextPage = () => onPageChange(Math.min(totalPages, currentPage + 1))
  const goToLastPage = () => onPageChange(totalPages)

  return (
    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-4">
      {/* Informação de página */}
      <div className="text-sm text-gray-400">
        Mostrando <span className="text-primary-400 font-semibold">{startIndex}</span> a{' '}
        <span className="text-primary-400 font-semibold">{endIndex}</span> de{' '}
        <span className="text-primary-400 font-semibold">{totalBikes}</span> bikes
      </div>

      {/* Controles de navegação */}
      <div className="flex items-center gap-2">
        {/* Primeira página */}
        <button
          onClick={goToFirstPage}
          disabled={currentPage === 1}
          className="p-2 rounded-lg bg-dark-700 border border-dark-600 hover:bg-dark-600 hover:border-primary-500/50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-dark-700 disabled:hover:border-dark-600 transition-all duration-200"
          title="Primeira página"
        >
          <ChevronsLeft className="w-5 h-5 text-gray-300" />
        </button>

        {/* Página anterior */}
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          className="p-2 rounded-lg bg-dark-700 border border-dark-600 hover:bg-dark-600 hover:border-primary-500/50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-dark-700 disabled:hover:border-dark-600 transition-all duration-200"
          title="Página anterior"
        >
          <ChevronLeft className="w-5 h-5 text-gray-300" />
        </button>

        {/* Indicador de página */}
        <div className="px-4 py-2 bg-dark-900/50 border border-dark-700 rounded-lg">
          <span className="text-primary-400 font-bold">{currentPage}</span>
          <span className="text-gray-500 mx-1">/</span>
          <span className="text-gray-300">{totalPages}</span>
        </div>

        {/* Próxima página */}
        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg bg-dark-700 border border-dark-600 hover:bg-dark-600 hover:border-primary-500/50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-dark-700 disabled:hover:border-dark-600 transition-all duration-200"
          title="Próxima página"
        >
          <ChevronRight className="w-5 h-5 text-gray-300" />
        </button>

        {/* Última página */}
        <button
          onClick={goToLastPage}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg bg-dark-700 border border-dark-600 hover:bg-dark-600 hover:border-primary-500/50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-dark-700 disabled:hover:border-dark-600 transition-all duration-200"
          title="Última página"
        >
          <ChevronsRight className="w-5 h-5 text-gray-300" />
        </button>
      </div>

      {/* Navegação rápida por números (opcional, para muitas páginas) */}
      {totalPages <= 7 && (
        <div className="hidden lg:flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-10 h-10 rounded-lg font-semibold transition-all duration-200 ${
                currentPage === pageNum
                  ? 'bg-primary-500 text-white border-2 border-primary-400'
                  : 'bg-dark-700 text-gray-300 border border-dark-600 hover:bg-dark-600 hover:border-primary-500/50'
              }`}
            >
              {pageNum}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default Pagination
