import { RegisterForm } from "@/components/auth/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-8">
      <h1 className="text-2xl font-semibold text-foreground mb-6">
        Create account
      </h1>
      <RegisterForm />
      <p className="mt-4 text-sm text-muted-foreground text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
