"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function SignupPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("الباسورد لازم يكون 6 حروف على الأقل");
      return;
    }
    if (password !== confirmPassword) {
      setError("الباسورد مش متطابق");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-white px-6">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold mb-4">تم إنشاء الحساب ✅</h1>
          <p className="text-zinc-400 text-sm mb-8">
            لو فيه تأكيد إيميل، اتأكد من الإيميل الأول. وبعدها ادخل من صفحة الدخول.
          </p>
          <Link href="/login" className="text-zinc-400 hover:text-white">
            ← صفحة الدخول
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-white px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-2">إنشاء حساب</h1>
        <p className="text-zinc-400 text-sm mb-8">سجّل عشان تبدأ تتابع معداتك</p>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="email"
            placeholder="الإيميل"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-3 focus:outline-none focus:border-zinc-600"
          />
          <input
            type="password"
            placeholder="الباسورد"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-3 focus:outline-none focus:border-zinc-600"
          />
          <input
            type="password"
            placeholder="أكد الباسورد"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-3 focus:outline-none focus:border-zinc-600"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 rounded-lg bg-white text-black font-medium hover:bg-zinc-200 disabled:opacity-50"
          >
            {loading ? "جاري الإنشاء..." : "إنشاء حساب"}
          </button>
        </form>

        <p className="text-sm text-zinc-500 mt-6 text-center">
          عندك حساب؟{" "}
          <Link href="/login" className="text-white hover:underline">
            ادخل من هنا
          </Link>
        </p>
      </div>
    </main>
  );
}