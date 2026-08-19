import { loginAction } from "../_actions/auth";

interface Props {
  searchParams: Promise<{ error?: string; next?: string }>;
}

export default async function AdminLoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const next = params.next || "/admin";
  const hasError = params.error === "1";

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm bg-[#101314] rounded-xl shadow-lg p-8 border border-white/10">
        <h1 className="text-xl font-bold text-white mb-1">Greentek Admin</h1>
        <p className="text-sm text-white/50 mb-6">
          Sign in to manage site content.
        </p>

        {hasError && (
          <p className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            Incorrect username or password.
          </p>
        )}

        <form action={loginAction} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">
              Username
            </label>
            <input
              name="username"
              required
              autoComplete="username"
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-[#c5eb02] text-black text-sm font-semibold py-2.5 hover:bg-[#c5eb02]/80 transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
