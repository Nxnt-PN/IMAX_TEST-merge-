export default function Pagination({ page = 1, limit = 10, total = 0, totalPages = 1, onPageChange, onLimitChange, pageSizeOptions = [10, 20, 50, 100] }) {
  const safeTotalPages = Math.max(1, Number(totalPages) || 1)
  const safePage = Math.min(Math.max(1, Number(page) || 1), safeTotalPages)
  const start = total > 0 ? ((safePage - 1) * limit) + 1 : 0
  const end = Math.min(safePage * limit, total)
  const pageNumbers = Array.from(
    { length: Math.min(3, safeTotalPages) },
    (_, index) => Math.max(1, Math.min(safePage - 1, safeTotalPages - 2)) + index,
  ).filter((value, index, list) => value <= safeTotalPages && list.indexOf(value) === index)

  return (
    <div className="d-flex justify-content-between align-items-center mt-3">
      <div className="d-flex flex-row align-items-center">
        <div className="row-per-page me-2 d-flex justify-content-center align-items-center text-muted">
        <span className="user-select-none me-2">Row Per Page</span>
        <select
          value={limit}
          onChange={(event) => onLimitChange?.(Number(event.target.value))}
          className="form-select w-auto"
        >
          {pageSizeOptions.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        </div>
        <div className="text-muted user-select-none">Showing {start}-{end} of {total}</div>
      </div>
      <nav>
        <ul className="pagination mb-0">
          <li className={`page-item ${safePage <= 1 ? 'disabled' : ''}`}>
            <button type="button" className="page-link" onClick={() => onPageChange?.(safePage - 1)}>&lt;</button>
          </li>
          {pageNumbers.map((pageNumber) => (
            <li key={pageNumber} className={`page-item ${pageNumber === safePage ? 'active' : ''}`}>
              <button type="button" className="page-link" onClick={() => onPageChange?.(pageNumber)}>
                {pageNumber}
              </button>
            </li>
          ))}
          <li className={`page-item ${safePage >= safeTotalPages ? 'disabled' : ''}`}>
            <button type="button" className="page-link" onClick={() => onPageChange?.(safePage + 1)}>&gt;</button>
          </li>
        </ul>
      </nav>
    </div>
  )
}
