import { LockKeyhole } from "lucide-react";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const hasError = params?.error === "1";
  const nextPath = params?.next?.startsWith("/") ? params.next : "/";

  return (
    <div className="mx-auto max-w-md">
      <section className="rounded-md border border-border bg-surface">
        <div className="border-b border-border p-5">
          <div className="flex items-center gap-2">
            <LockKeyhole className="h-5 w-5 text-accent" />
            <h1 className="text-lg font-semibold text-text">访问门禁</h1>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">
            这个网站是私人工具。输入访问密码后，才能使用页面和 API。
          </p>
        </div>

        <form action="/api/auth/login" method="post" className="space-y-4 p-5">
          <input type="hidden" name="next" value={nextPath} />

          <label className="block">
            <span className="text-sm font-medium text-text">访问密码</span>
            <input
              autoFocus
              className="mt-2 h-11 w-full rounded-md border border-border bg-panel px-3 text-sm text-text outline-none transition placeholder:text-muted focus:border-accent"
              name="password"
              placeholder="请输入访问密码"
              type="password"
            />
          </label>

          {hasError ? (
            <p className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
              密码不对，请再试一次。
            </p>
          ) : null}

          <button
            className="h-11 w-full rounded-md bg-accent px-4 text-sm font-semibold text-background transition hover:bg-accent/90"
            type="submit"
          >
            进入网站
          </button>
        </form>
      </section>
    </div>
  );
}
