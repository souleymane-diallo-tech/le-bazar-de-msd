import { redirect } from "next/navigation";
import { getActor } from "@/modules/identity/session";

export const dynamic = "force-dynamic";
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const actor = await getActor();
  if (!actor) redirect("/connexion");
  return <>{children}</>;
}
