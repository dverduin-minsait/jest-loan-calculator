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
          className="rounded-md border px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          Previous
        </Link>
      ) : (
        <span aria-disabled="true" className="rounded-md border px-3 py-1.5 text-sm text-gray-300 cursor-default">
          Previous
        </span>
      )}

      <span className="text-sm text-gray-600">
        Page {page} of {totalPages}
      </span>

      {page < totalPages ? (
        <Link
          href={`?page=${page + 1}`}
          className="rounded-md border px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          Next
        </Link>
      ) : (
        <span aria-disabled="true" className="rounded-md border px-3 py-1.5 text-sm text-gray-300 cursor-default">
          Next
        </span>
      )}
    </nav>
  );
}
