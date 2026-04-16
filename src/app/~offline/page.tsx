import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-4">
      <div className="bg-card rounded-xl border border-border shadow-sm p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">📡</div>
        <h1 className="text-xl font-semibold text-foreground mb-2">
          You&apos;re offline
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          This page isn&apos;t available without a connection. Your loan data
          and calculations are still accessible from pages you&apos;ve visited
          before.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
