import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  BookOpen,
  BarChart3,
  CheckCircle2,
  CircleHelp,
  Gauge,
  ListChecks,
  Settings,
} from "lucide-react";

const steps = [
  {
    title: "先看总览",
    body: "总览页像驾驶舱。你先看当前本金、今日比赛、价值机会数量，再决定要不要深入看某一场。",
  },
  {
    title: "再看比赛",
    body: "比赛页会列出所有比赛。你可以搜索球队，也可以只看有价值机会或高风险的比赛。",
  },
  {
    title: "点进详情",
    body: "详情页会告诉你模型怎么看、市场赔率怎么看，以及两者之间有没有明显差距。",
  },
  {
    title: "记录和复盘",
    body: "如果你决定做一次娱乐预测，就去资金页记录胜平负、净胜球或比分。比赛结束后结算，再去复盘页看自己表现。",
  },
];

const terms = [
  {
    name: "模型概率",
    desc: "系统根据球队 ELO 强弱算出来的概率。它代表“我们自己的粗略判断”。",
  },
  {
    name: "市场概率",
    desc: "系统根据赔率反推出来的概率。它代表“市场大概怎么看”。",
  },
  {
    name: "价值差",
    desc: "模型概率减去赔率要求概率。大白话：如果模型比赔率更看好这个结果，这个差值就是正的。胜平负、净胜球和比分都可以看价值差。",
  },
  {
    name: "风险等级",
    desc: "低风险不是稳赢，高风险也不是一定输。它只是提醒你这笔预测应该更谨慎。",
  },
  {
    name: "预期进球",
    desc: "系统估算两队大概能进几个球。它不是最终比分，只是用来推算比分概率的基础。",
  },
  {
    name: "净胜球",
    desc: "看一队赢几个球，比如赢 1 球、赢 2 球以上。它比单纯胜平负更细。",
  },
];

export default function ManualPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-md border border-border bg-surface p-5">
        <div className="flex items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-accent text-background">
            <BookOpen size={22} />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-normal text-text">
              新手操作手册
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              这个工具不是让你盲目下注，而是帮你练习看比赛、看赔率、记录决策和复盘结果。先把它当成一个世界杯预测记账本。
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {steps.map((step, index) => (
          <div key={step.title} className="rounded-md border border-border bg-surface p-4">
            <p className="text-sm font-semibold text-accent">第 {index + 1} 步</p>
            <h2 className="mt-3 text-base font-semibold text-text">{step.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{step.body}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-md border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <CircleHelp className="h-5 w-5 text-accent" />
            <h2 className="text-base font-semibold text-text">几个关键词</h2>
          </div>
          <div className="mt-4 divide-y divide-border">
            {terms.map((term) => (
              <div key={term.name} className="py-4 first:pt-0 last:pb-0">
                <p className="font-medium text-text">{term.name}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{term.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-positive" />
            <h2 className="text-base font-semibold text-text">推荐使用流程</h2>
          </div>
          <div className="mt-5 grid gap-3">
            {[
              "打开总览，看今天有没有价值机会。",
              "进入比赛页，挑一场你熟悉的比赛。",
              "点进详情，看模型概率、市场概率和价值差。",
              "如果决定记录，就去资金页选择胜平负、净胜球或比分，填金额和备注。",
              "比赛结束后结算，然后看资金曲线有没有变化。",
              "积累几笔记录后，去复盘页看最佳预测、最差预测和自己更擅长哪类结果。",
            ].map((item) => (
              <div key={item} className="flex gap-3 rounded-md border border-border bg-panel p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-positive" />
                <p className="text-sm leading-6 text-muted">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-md border border-border bg-surface p-5">
        <div className="grid gap-4 md:grid-cols-5">
          <Link
            href="/"
            className="group rounded-md border border-border bg-panel p-4 transition hover:border-accent"
          >
            <Gauge className="h-5 w-5 text-accent" />
            <h2 className="mt-3 font-semibold text-text">去总览页</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              先看今天整体情况和最值得关注的机会。
            </p>
            <ArrowRight className="mt-4 h-4 w-4 text-muted transition group-hover:text-accent" />
          </Link>
          <Link
            href="/matches"
            className="group rounded-md border border-border bg-panel p-4 transition hover:border-accent"
          >
            <ListChecks className="h-5 w-5 text-accent" />
            <h2 className="mt-3 font-semibold text-text">去比赛页</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              看全部比赛，搜索球队，筛选价值机会。
            </p>
            <ArrowRight className="mt-4 h-4 w-4 text-muted transition group-hover:text-accent" />
          </Link>
          <Link
            href="/bankroll"
            className="group rounded-md border border-border bg-panel p-4 transition hover:border-accent"
          >
            <Banknote className="h-5 w-5 text-accent" />
            <h2 className="mt-3 font-semibold text-text">去资金页</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              记录一笔预测，之后结算赢、输或走水。
            </p>
            <ArrowRight className="mt-4 h-4 w-4 text-muted transition group-hover:text-accent" />
          </Link>
          <Link
            href="/review"
            className="group rounded-md border border-border bg-panel p-4 transition hover:border-accent"
          >
            <BarChart3 className="h-5 w-5 text-accent" />
            <h2 className="mt-3 font-semibold text-text">去复盘页</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              看最佳预测、最差预测，以及哪类判断更适合你。
            </p>
            <ArrowRight className="mt-4 h-4 w-4 text-muted transition group-hover:text-accent" />
          </Link>
          <Link
            href="/settings"
            className="group rounded-md border border-border bg-panel p-4 transition hover:border-accent"
          >
            <Settings className="h-5 w-5 text-accent" />
            <h2 className="mt-3 font-semibold text-text">去设置页</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              查看当前哪些数据是模拟、手动或未来接 API。
            </p>
            <ArrowRight className="mt-4 h-4 w-4 text-muted transition group-hover:text-accent" />
          </Link>
        </div>
      </section>
    </div>
  );
}
