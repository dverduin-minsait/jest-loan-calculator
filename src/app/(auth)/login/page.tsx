import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-8">
      <h1 className="text-2xl font-semibold text-foreground mb-6">Sign in</h1>
      <LoginForm />
      <p className="mt-4 text-sm text-muted-foreground text-center">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-blue-600 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
