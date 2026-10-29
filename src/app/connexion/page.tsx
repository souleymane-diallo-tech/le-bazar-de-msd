import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main
      id="contenu"
      className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12"
    >
      <Link href="/" className="mb-10 text-sm underline underline-offset-4">
        ← Retour à la boutique
      </Link>
      <span className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Le Bazar de MSD
      </span>
      <h1 className="editorial text-4xl">Espace équipe</h1>
      <p className="mb-8 mt-3 text-muted-foreground">
        Connectez-vous avec votre compte administrateur.
      </p>
      <LoginForm />
      <p className="mt-7 text-sm text-muted-foreground">
        Accès réservé à l’équipe. Pour récupérer votre accès, contactez le
        responsable technique.
      </p>
    </main>
  );
}
