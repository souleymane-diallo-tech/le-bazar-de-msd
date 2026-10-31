"use client";
import { useActionState } from "react";
import { adminAction } from "@/app/(admin)/admin/actions";
import { Button } from "@/components/ui/button";
export function AdminForm({
  action,
  children,
  submit = "Enregistrer",
}: {
  action: string;
  children?: React.ReactNode;
  submit?: string;
}) {
  const [state, formAction, pending] = useActionState(adminAction, {
    message: "",
    ok: false,
  });
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="action" value={action} />
      {children}
      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement…" : submit}
      </Button>
      {state.message && (
        <p
          role={state.ok ? "status" : "alert"}
          className={state.ok ? "text-sm text-primary" : "text-sm text-red-800"}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
