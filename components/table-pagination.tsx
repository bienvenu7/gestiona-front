"use client"

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface TablePaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: TablePaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3">
      <p className="text-sm text-muted-foreground">
        {"Affichage de "}<span className="font-medium text-foreground">{startItem}</span>{" \u00e0 "}
        <span className="font-medium text-foreground">{endItem}</span>{" sur "}
        <span className="font-medium text-foreground">{totalItems}</span>{" r\u00e9sultats"}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-input bg-card text-foreground transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
          aria-label="Premi\u00e8re page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-input bg-card text-foreground transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
          aria-label="Page pr\u00e9c\u00e9dente"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((page) => {
            if (totalPages <= 5) return true
            if (page === 1 || page === totalPages) return true
            if (Math.abs(page - currentPage) <= 1) return true
            return false
          })
          .reduce<(number | "ellipsis")[]>((acc, page, idx, arr) => {
            if (idx > 0) {
              const prev = arr[idx - 1]
              if (page - prev > 1) {
                acc.push("ellipsis")
              }
            }
            acc.push(page)
            return acc
          }, [])
          .map((item, idx) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${idx}`}
                className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground"
              >
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                className={`flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors ${
                  currentPage === item
                    ? "btn-gradient"
                    : "border border-input bg-card text-foreground hover:bg-accent"
                }`}
              >
                {item}
              </button>
            ),
          )}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-input bg-card text-foreground transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
          aria-label="Page suivante"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-input bg-card text-foreground transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
          aria-label="Derni\u00e8re page"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
