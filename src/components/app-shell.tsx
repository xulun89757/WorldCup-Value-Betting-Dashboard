import Link from "next/link";
import {
  Banknote,
  BookOpen,
  CalendarDays,
  Goal,
  LayoutDashboard,
  LogOut,
  RotateCcw,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/", label: "总览", icon: LayoutDashboard },
  { href: "/matches", label: "比赛", icon: CalendarDays },
  { href: "/bankroll", label: "资金", icon: Banknote },
  { href: "/review", label: "复盘", icon: RotateCcw },
  { href: "/manual", label: "手册", icon: BookOpen },
  { href: "/settings", label: "设置", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const isPasswordGateEnabled = Boolean(process.env.APP_PASSWORD?.trim());

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-accent text-background">
              <Goal size={19} strokeWidth={2.4} />
            </span>
            <div>
              <p className="text-sm font-semibold leading-tight text-text">
                世界杯价值预测面板
              </p>
              <p className="text-xs text-muted">模拟数据 · 娱乐模式</p>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex h-9 items-center gap-2 rounded-md border border-border bg-panel px-3 text-sm text-muted transition hover:border-accent hover:text-text"
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
            {isPasswordGateEnabled ? (
              <form action="/api/auth/logout" method="post">
                <button
                  className="flex h-9 items-center gap-2 rounded-md border border-border bg-panel px-3 text-sm text-muted transition hover:border-accent hover:text-text"
                  title="退出门禁"
                  type="submit"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">退出</span>
                </button>
              </form>
            ) : null}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
