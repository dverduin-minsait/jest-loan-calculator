"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";

interface NavbarProps {
  user: { id: string; name: string; email: string };
}

export function Navbar({ user }: NavbarProps) {
  return (
    <nav aria-label="Main navigation" className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-lg font-semibold text-gray-900 dark:text-slate-100"
          >
            LoanCalc
          </Link>
          <Link
            href="/loans"
            className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 transition-colors"
          >
            My Loans
          </Link>
          <Link
            href="/loans/new"
            className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 transition-colors"
          >
            New Loan
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <span className="text-sm text-gray-600 dark:text-slate-400">{user.name}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
