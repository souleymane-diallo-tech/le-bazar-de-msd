"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          password: data.get("password"),
          rememberMe: false,
        }),
      });
      if (!response.ok) {
        setError(
          response.status === 429
            ? "Trop de tentatives. Réessayez dans une minute."
            : response.status >= 500
              ? "Connexion indisponible. Réessayez plus tard."
              : "Adresse e-mail ou mot de passe incorrect.",
        );
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("La connexion a échoué. Vérifiez votre réseau.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-semibold">
          Adresse e-mail
        </label>
        <input
          className="min-h-12 w-full rounded-lg border border-border bg-white px-3"
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          maxLength={254}
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-semibold">
          Mot de passe
        </label>
        <input
          className="min-h-12 w-full rounded-lg border border-border bg-white px-3"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={128}
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-800">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}
