import { NextResponse } from "next/server";
import type { ResearchRequest, ResearchResponse } from "@/types/research";

type OpenAiResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
      type?: string;
    }>;
  }>;
  error?: {
    message?: string;
  };
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

function getAiConfig() {
  const provider =
    process.env.AI_PROVIDER ??
    (process.env.DEEPSEEK_API_KEY ||
    process.env.AI_MODEL?.startsWith("deepseek") ||
    process.env.OPENAI_MODEL?.startsWith("deepseek")
      ? "deepseek"
      : "openai");

  if (provider === "deepseek") {
    return {
      provider,
      apiKey:
        process.env.AI_API_KEY ??
        process.env.DEEPSEEK_API_KEY ??
        process.env.OPENAI_API_KEY,
      model:
        process.env.AI_MODEL ??
        process.env.DEEPSEEK_MODEL ??
        process.env.OPENAI_MODEL ??
        "deepseek-v4-flash",
      baseUrl: process.env.AI_BASE_URL ?? "https://api.deepseek.com",
    };
  }

  return {
    provider,
    apiKey: process.env.AI_API_KEY ?? process.env.OPENAI_API_KEY,
    model: process.env.AI_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-5-mini",
    baseUrl: process.env.AI_BASE_URL ?? "https://api.openai.com/v1",
  };
}

function getOutputText(data: OpenAiResponse) {
  if (data.output_text) {
    return data.output_text;
  }

  return (
    data.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text)
      .filter(Boolean)
      .join("\n") ?? ""
  );
}

function formatProbability(value: number | null) {
  if (value == null || !Number.isFinite(value)) {
    return "未填写";
  }

  return `${(value * 100).toFixed(1)}%`;
}

function formatOdds(value: number | null) {
  if (value == null || !Number.isFinite(value) || value <= 1) {
    return "未填写";
  }

  return value.toFixed(2);
}

function truncate(value: string, length = 500) {
  return value.length > length ? `${value.slice(0, length)}...` : value;
}

function formatMemory(payload: ResearchRequest) {
  const profiles = payload.memory?.teamProfiles ?? [];
  const records = payload.memory?.researchRecords ?? [];

  const profileRows =
    profiles.length === 0
      ? "暂无球队档案"
      : profiles
          .map(
            (profile) => `
- ${profile.teamName}
  评分/排名：${profile.rating || "未填写"}
  近况：${truncate(profile.recentForm || "未填写", 260)}
  伤停：${truncate(profile.injuries || "未填写", 220)}
  战意：${truncate(profile.motivation || "未填写", 220)}
  备注：${truncate(profile.notes || "未填写", 220)}
  更新时间：${profile.updatedAt}`,
          )
          .join("\n");

  const recordRows =
    records.length === 0
      ? "暂无历史研究记录"
      : records
          .map(
            (record) => `
- ${record.homeTeam} vs ${record.awayTeam}（${record.createdAt}）
  赛事：${record.competition || "未填写"}
  赔率：${record.oddsSummary || "未填写"}
  概率：${record.probabilitySummary || "未填写"}
  当时备注：${truncate(record.notes || "未填写", 180)}
  当时 AI 结论摘要：${truncate(record.analysisText || "未填写", 320)}`,
          )
          .join("\n");

  return `
已保存球队档案：
${profileRows}

历史研究记录：
${recordRows}
`;
}

function buildPrompt(payload: ResearchRequest) {
  return `
你是一个谨慎、重视风控的足球赛前研究助手。你的任务是帮用户整理下注前信息，并给出纪律化决策建议。

重要原则：
- 你不能保证盈利。
- 你不能把不完整信息包装成确定结论。
- 你必须同时考虑赔率是否划算，而不是只看谁更可能赢。
- 如果信息不足、赔率太低、价值差不够或风险太高，要明确建议观望或放弃。
- 如果建议下注，也只能建议小额、可承受亏损范围内，不允许鼓励加注、追单、梭哈。
- 你需要参考历史研究档案，但不能盲信旧档案。若旧档案和本场新输入冲突，以本场新输入为准，并指出冲突。

比赛信息：
- 主队：${payload.homeTeam}
- 客队：${payload.awayTeam}
- 赛事/阶段：${payload.competition || "未填写"}
- 开赛时间：${payload.startTime || "未填写"}

当前赔率：
- 主胜：${formatOdds(payload.homeOdds)}
- 平局：${formatOdds(payload.drawOdds)}
- 客胜：${formatOdds(payload.awayOdds)}

用户填写的模型/主观概率：
- 主胜：${formatProbability(payload.homeModelProbability)}
- 平局：${formatProbability(payload.drawModelProbability)}
- 客胜：${formatProbability(payload.awayModelProbability)}

球队实力资料：
- 主队排名/ELO/评分：${payload.homeRating || "未填写"}
- 客队排名/ELO/评分：${payload.awayRating || "未填写"}

赛前信息：
- 近况：${payload.recentForm || "未填写"}
- 伤停/轮换：${payload.injuries || "未填写"}
- 战意/赛程背景：${payload.motivation || "未填写"}
- 场地/主客/中立场：${payload.venue || "未填写"}
- 赔率变化：${payload.oddsMovement || "未填写"}
- 资金计划：${payload.bankrollPlan || "未填写"}
- 风险偏好：${payload.riskPreference || "保守"}
- 其他备注：${payload.notes || "未填写"}

研究档案记忆：
${formatMemory(payload)}

请按下面结构输出中文分析：

1. 赛前结论
用一句话给出动作：下注 / 小注 / 观望 / 放弃。不要模棱两可。

2. 赔率是否值得
必须解释赔率隐含概率、用户概率和价值差。如果用户没有填写概率，要明确说无法严格判断价值差。

3. 主要支持理由
列出 2-4 条真正支持这个方向的原因。

4. 最大风险
列出 2-4 条可能导致判断失败的原因。

5. 建议赔率底线
如果当前不值得，给出需要等到什么赔率附近才值得重新评估。若数据不足，请说“暂不设底线”。

6. 资金纪律
给出保守的资金建议。必须允许“不下注”。

7. 复盘记录
告诉用户这场赛后应该记录哪些信息，方便以后验证模型。

8. 使用了哪些历史档案
简短说明你参考了哪些球队档案或历史研究。如果没有可用档案，就说明“暂无可参考历史档案”。
`;
}

export async function POST(request: Request) {
  const aiConfig = getAiConfig();
  const { apiKey, model, provider, baseUrl } = aiConfig;

  if (!apiKey) {
    const body: ResearchResponse = {
      ok: false,
      message:
        provider === "deepseek"
          ? "缺少 DeepSeek API Key。请在环境变量里配置 AI_API_KEY 或 DEEPSEEK_API_KEY。"
          : "缺少 OpenAI API Key。请在环境变量里配置 AI_API_KEY 或 OPENAI_API_KEY。",
    };

    return NextResponse.json(body, { status: 400 });
  }

  const payload = (await request.json()) as ResearchRequest;

  if (!payload.homeTeam?.trim() || !payload.awayTeam?.trim()) {
    const body: ResearchResponse = {
      ok: false,
      message: "请至少填写主队和客队。",
    };

    return NextResponse.json(body, { status: 400 });
  }

  if (provider === "deepseek") {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "你是一个谨慎的足球赛前研究助手，只做概率、赔率和风险分析，不保证盈利。",
          },
          {
            role: "user",
            content: buildPrompt(payload),
          },
        ],
        stream: false,
      }),
    });

    const data = (await response.json()) as ChatCompletionResponse;

    if (!response.ok) {
      const body: ResearchResponse = {
        ok: false,
        message:
          data.error?.message ?? `DeepSeek API 返回错误：${response.status}`,
      };

      return NextResponse.json(body, { status: response.status });
    }

    const body: ResearchResponse = {
      ok: true,
      provider,
      model,
      analysisText:
        data.choices?.[0]?.message?.content ??
        "AI 已返回结果，但没有解析到可显示的文字。请稍后再试一次。",
    };

    return NextResponse.json(body);
  }

  const response = await fetch(`${baseUrl}/responses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      reasoning: { effort: "low" },
      max_output_tokens: 1200,
      instructions:
        "你是一个谨慎的足球赛前研究助手，只做概率、赔率和风险分析，不保证盈利。",
      input: buildPrompt(payload),
    }),
  });

  const data = (await response.json()) as OpenAiResponse;

  if (!response.ok) {
    const body: ResearchResponse = {
      ok: false,
      message: data.error?.message ?? `OpenAI API 返回错误：${response.status}`,
    };

    return NextResponse.json(body, { status: response.status });
  }

  const body: ResearchResponse = {
    ok: true,
    provider,
    model,
    analysisText:
      getOutputText(data) ||
      "AI 已返回结果，但没有解析到可显示的文字。请稍后再试一次。",
  };

  return NextResponse.json(body);
}
