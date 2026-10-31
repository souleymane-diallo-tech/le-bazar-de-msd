export const inputClass =
  "mt-1 min-h-11 w-full rounded-lg border border-border bg-white px-3 py-2";
export function Field({
  name,
  label,
  value,
  type = "text",
  required = true,
}: {
  name: string;
  label: string;
  value?: string | number;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={value}
        required={required}
        min={type === "number" ? 0 : undefined}
        maxLength={type === "number" ? undefined : 300}
        className={inputClass}
      />
    </label>
  );
}
export function Hidden({
  name,
  value,
}: {
  name: string;
  value: string | number;
}) {
  return <input type="hidden" name={name} value={value} />;
}
export function Active({ value = true }: { value?: boolean }) {
  return (
    <label className="flex min-h-11 items-center gap-2 text-sm">
      <input
        type="checkbox"
        name="active"
        defaultChecked={value}
        className="size-5"
      />
      Actif
    </label>
  );
}
