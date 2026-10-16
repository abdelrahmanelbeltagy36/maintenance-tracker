"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setError("الإيميل أو الباسورد غلط");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-white px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-2">تسجيل الدخول</h1>
        <p className="text-zinc-400 text-sm mb-8">ادخل لمتابعة الصيانة</p>

        <form onSubmit={handleLogin} className="space-y-4">
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

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 rounded-lg bg-white text-black font-medium hover:bg-zinc-200 disabled:opacity-50"
          >
            {loading ? "جاري الدخول..." : "دخول"}
          </button>
        </form>

        <p className="text-sm text-zinc-500 text-center mt-6">
          مش عندك حساب؟{" "}
          <Link href="/signup" className="text-white hover:underline">
            سجّل من هنا
          </Link>
        </p>
      </div>
    </main>
  );
}