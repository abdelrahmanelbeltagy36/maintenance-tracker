"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

type Machine = { id: string; name: string; location: string | null };
type Log = {
  id: string;
  log_date: string;
  issue: string;
  action_taken: string | null;
  technician: string | null;
};

export default function MachinePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [machine, setMachine] = useState<Machine | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [issue, setIssue] = useState("");
  const [action, setAction] = useState("");
  const [technician, setTechnician] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      await Promise.all([fetchMachine(), fetchLogs()]);
      setLoading(false);
    }
    load();
  }, [id]);

  async function fetchMachine() {
    const { data } = await supabase
      .from("machines")
      .select("id, name, location")
      .eq("id", id)
      .single();
    setMachine(data);
  }

  async function fetchLogs() {
    const { data } = await supabase
      .from("maintenance_logs")
      .select("id, log_date, issue, action_taken, technician")
      .eq("machine_id", id)
      .order("log_date", { ascending: false });
    setLogs(data ?? []);
  }

  async function addLog(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("maintenance_logs").insert({
      machine_id: id,
      user_id: user.id,
      issue,
      action_taken: action || null,
      technician: technician || null,
    });

    setIssue("");
    setAction("");
    setTechnician("");
    fetchLogs();
  }

  async function deleteLog(logId: string) {
    if (!confirm("متأكد إنك عايز تحذف السجل ده؟")) return;
    await supabase.from("maintenance_logs").delete().eq("id", logId);
    fetchLogs();
  }

  async function deleteMachine() {
    if (!confirm("متأكد إنك عايز تحذف المعدة وكل سجلاتها؟")) return;
    await supabase.from("machines").delete().eq("id", id);
    router.push("/dashboard");
    router.refresh();
  }

  if (loading) {
    return <main className="min-h-screen bg-zinc-950 text-white p-6">جاري التحميل...</main>;
  }

  if (!machine) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white p-6">
        <p>المعدة مش موجودة.</p>
        <Link href="/dashboard" className="text-zinc-400 hover:text-white">← رجوع</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white">
          ← رجوع للمعدات
        </Link>

        <div className="flex items-start justify-between mt-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold">{machine.name}</h1>
            {machine.location && <p className="text-zinc-400 mt-1">{machine.location}</p>}
          </div>
          <button
            onClick={deleteMachine}
            className="text-sm text-red-400 hover:text-red-300"
          >
            حذف المعدة
          </button>
        </div>

        <form onSubmit={addLog} className="grid gap-3 mb-10">
          <input
            placeholder="العطل"
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            required
            className="rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-3 focus:outline-none focus:border-zinc-600"
          />
          <input
            placeholder="الإجراء اللي اتعمل"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-3 focus:outline-none focus:border-zinc-600"
          />
          <input
            placeholder="الفني"
            value={technician}
            onChange={(e) => setTechnician(e.target.value)}
            className="rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-3 focus:outline-none focus:border-zinc-600"
          />
          <button
            type="submit"
            className="rounded-lg bg-white text-black font-medium px-4 py-3 hover:bg-zinc-200"
          >
            إضافة سجل صيانة
          </button>
        </form>

        <div className="space-y-3">
          {logs.length === 0 && <p className="text-zinc-500">مفيش سجلات صيانة لسه.</p>}
          {logs.map((log) => (
            <div key={log.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <div className="flex justify-between text-sm text-zinc-500 mb-2">
                <span>{log.log_date}</span>
                {log.technician && <span>{log.technician}</span>}
              </div>
              <p className="font-semibold">{log.issue}</p>
              {log.action_taken && (
                <p className="text-sm text-zinc-400 mt-1">الإجراء: {log.action_taken}</p>
              )}
              <button
                onClick={() => deleteLog(log.id)}
                className="text-xs text-red-400 hover:text-red-300 mt-3"
              >
                حذف السجل
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}