interface PaginationProps {
  page: number
  lastPage: number
  onPageChange: (page: number) => void
}

export default function Pagination({ page, lastPage, onPageChange }: PaginationProps) {
  if (lastPage <= 1) return null
  return (
    <div className="pagination">
      <button
        className="btn btn-outline"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        ← Предишна
      </button>
      <span className="pagination-info">{page} / {lastPage}</span>
      <button
        className="btn btn-outline"
        disabled={page === lastPage}
        onClick={() => onPageChange(page + 1)}
      >
        Следваща →
      </button>
    </div>
  )
}
