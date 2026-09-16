const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-navy-500 focus:ring-2 focus:ring-navy-100 focus:outline-none";

export const primaryButtonClass =
  "w-full rounded-md bg-navy-700 px-4 py-2 text-sm font-medium text-white hover:bg-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-500 disabled:opacity-60";

export function FormField({
  id,
  label,
  error,
  ...props
}: { id: string; label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-slate-600">
        {label}
      </label>
      <input id={id} name={id} className={inputClass} aria-invalid={!!error} {...props} />
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}
