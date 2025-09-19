"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const r = useRouter();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onEmailPasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    setLoading(false);
    if (error) return setMsg(error.message);
    r.replace("/dashboard");
  }

  async function onMagicLink() {
    setLoading(true);
    setMsg(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: window.location.origin + "/dashboard",
      },
    });
    setLoading(false);
    if (error) return setMsg(error.message);
    setMsg("Te enviamos un enlace mágico a tu email ✉️");
  }

  return (
    <div className="grid place-items-center min-h-dvh px-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl shadow-lg bg-white p-8">
          <div className="text-center mb-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-white font-bold">
              CRM
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight">
              Ingresá a tu cuenta
            </h1>
          </div>

          <form onSubmit={onEmailPasswordLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="email"
                required
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 py-3 text-sm outline-none ring-0 focus:border-gray-900"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 py-3 text-sm outline-none ring-0 focus:border-gray-900"
              />
            </div>

            <button
              disabled={loading}
              className="w-full cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 text-white py-3 text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {loading && <Loader2 className="size-4 animate-spin" />} Ingresar
            </button>
          </form>

          {msg && (
            <p className="mt-4 text-center text-sm text-gray-600">{msg}</p>
          )}

          <p className="mt-6 text-center text-[11px] text-gray-400">
            Al continuar aceptás nuestros términos y políticas.
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          © {new Date().getFullYear()} Software Makers
        </p>
      </div>
    </div>
  );
}
