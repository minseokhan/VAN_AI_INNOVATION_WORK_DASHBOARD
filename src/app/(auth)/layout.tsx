export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm rounded-md border border-slate-200 bg-white p-6">
        <p className="mb-6 text-lg font-semibold text-navy-900">VAN AI 혁신부</p>
        {children}
      </div>
    </main>
  );
}
