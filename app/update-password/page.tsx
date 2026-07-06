"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      alert("Mot de passe mis à jour avec succès !");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center font-sans bg-festara-sand p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-festara-navy font-serif mb-4 text-center">
          Nouveau mot de passe
        </h2>
        <p className="text-gray-500 mb-8 text-center text-sm">
          Veuillez saisir votre nouveau mot de passe ci-dessous.
        </p>

        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-festara-navy mb-2">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-festara-gold focus:border-festara-gold"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

          <button
            disabled={loading}
            className="w-full py-3 bg-festara-navy text-white rounded-lg hover:bg-festara-ink font-bold transition-colors"
          >
            {loading ? "Mise à jour..." : "Enregistrer le mot de passe"}
          </button>
        </form>
      </div>
    </main>
  );
}
