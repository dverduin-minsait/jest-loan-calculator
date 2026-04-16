"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";

interface NavbarProps {
  user: { id: string; name: string; email: string };
}

export function Navbar({ user }: NavbarProps) {
  return (
    <nav aria-label="Main navigation" className="bg-card border-b border-border px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-lg font-semibold text-foreground"
          >
            LoanCalc
          </Link>
          <Link
            href="/loans"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            My Loans
          </Link>
          <Link
            href="/loans/new"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            New Loan
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <span className="text-sm text-muted-foreground">{user.name}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
