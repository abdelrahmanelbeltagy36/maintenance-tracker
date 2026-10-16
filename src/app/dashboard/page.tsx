"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

type Machine = {
  id: string;
  name: string;
  location: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      await fetchMachines();
      setLoading(false);
    }
    load();
  }, []);

  async function fetchMachines() {
    const { data } = await supabase
      .from("machines")
      .select("id, name, location")
      .order("created_at", { ascending: false });
    setMachines(data ?? []);
  }

  async function addMachine(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("machines").insert({
      name,
      location: location || null,
      user_id: user.id,
    });

    setName("");
    setLocation("");
    fetchMachines();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return <main className="min-h-screen bg-zinc-950 text-white p-6">جاري التحميل...</main>;
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-bold">المعدات</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-zinc-400 hover:text-white"
          >
            تسجيل خروج
          </button>
        </div>

        <form onSubmit={addMachine} className="grid gap-3 sm:grid-cols-3 mb-10">
          <input
            placeholder="اسم المعدة"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-3 focus:outline-none focus:border-zinc-600"
          />
          <input
            placeholder="المكان (اختياري)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-3 focus:outline-none focus:border-zinc-600"
          />
          <button
            type="submit"
            className="rounded-lg bg-white text-black font-medium px-4 py-3 hover:bg-zinc-200"
          >
            إضافة معدة
          </button>
        </form>

        <div className="space-y-3">
          {machines.length === 0 && (
            <p className="text-zinc-500">مفيش معدات لسه. ضيف أول واحدة فوق.</p>
          )}
          {machines.map((m) => (
            <Link
              key={m.id}
              href={`/machines/${m.id}`}
              className="block rounded-xl border border-zinc-800 bg-zinc-900 p-5 hover:border-zinc-600"
            >
              <h2 className="font-semibold">{m.name}</h2>
              {m.location && (
                <p className="text-sm text-zinc-400 mt-1">{m.location}</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}