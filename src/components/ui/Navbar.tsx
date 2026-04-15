"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

interface NavbarProps {
  user: { id: string; name: string; email: string };
}

export function Navbar({ user }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-lg font-semibold text-gray-900"
          >
            LoanCalc
          </Link>
          <Link
            href="/loans"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            My Loans
          </Link>
          <Link
            href="/loans/new"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            New Loan
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user.name}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
