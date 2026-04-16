import Link from "next/link";

interface PaginationBarProps {
  page: number;
  totalPages: number;
}

export function PaginationBar({ page, totalPages }: PaginationBarProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-4 py-2"
    >
      {page > 1 ? (
        <Link
          href={`?page=${page - 1}`}
          className="rounded-md border border-border px-3 py-1.5 text-sm text-label hover:bg-muted"
        >
          Previous
        </Link>
      ) : (
        <span aria-disabled="true" className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground opacity-50 cursor-default">
          Previous
        </span>
      )}

      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>

      {page < totalPages ? (
        <Link
          href={`?page=${page + 1}`}
          className="rounded-md border border-border px-3 py-1.5 text-sm text-label hover:bg-muted"
        >
          Next
        </Link>
      ) : (
        <span aria-disabled="true" className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground opacity-50 cursor-default">
          Next
        </span>
      )}
    </nav>
  );
}
