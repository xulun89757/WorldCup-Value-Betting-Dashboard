import { NextResponse } from "next/server";
import type {
  AiMatchAnalysisRequest,
  AiMatchAnalysisResponse,
} from "@/types/ai-analysis";
import { formatPercent, formatSignedPercent } from "@/lib/utils";

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

function buildPrompt({ analysis, scorePrediction }: AiMatchAnalysisRequest) {
  const bestSelection = [...analysis.selections].sort(
    (a, b) => b.valueEdge - a.valueEdge,
  )[0];
  const oddsSource =
    analysis.match.oddsMeta?.source === "api"
      ? `API 赔率，来源 ${analysis.match.oddsMeta.bookmakerTitle ?? "未知公司"}`
      : "模拟赔率";

  const selectionRows = analysis.selections
    .map(
      (selection) =>
        `${selection.label}: 赔率 ${selection.odds.toFixed(2)}，模型概率 ${formatPercent(selection.modelProbability)}，市场要求概率 ${formatPercent(selection.marketProbability)}，价值差 ${formatSignedPercent(selection.valueEdge)}，风险 ${selection.riskLevel}`,
    )
    .join("\n");

  const topScores = scorePrediction.topScores
    .slice(0, 5)
    .map(
      (score) =>
        `${score.homeGoals}-${score.awayGoals} ${formatPercent(score.probability)}`,
    )
    .join("，");

  return `
请用中文给新手解释这场世界杯预测，不要写成投注建议，不要保证结果。

比赛：${analysis.match.homeTeam} vs ${analysis.match.awayTeam}
阶段：${analysis.match.stage}
开赛时间：${analysis.match.startTime}
赔率来源：${oddsSource}
ELO：${analysis.match.homeTeam} ${analysis.match.homeElo} / ${analysis.match.awayTeam} ${analysis.match.awayElo}

胜平负数据：
${selectionRows}

当前价值差最高的选项：${bestSelection.label}
价值差：${formatSignedPercent(bestSelection.valueEdge)}
建议金额区间：${bestSelection.suggestedStake.min.toFixed(2)} 到 ${bestSelection.suggestedStake.max.toFixed(2)}

比分模型：
预期进球：${analysis.match.homeTeam} ${scorePrediction.expectedGoals.home.toFixed(2)} / ${analysis.match.awayTeam} ${scorePrediction.expectedGoals.away.toFixed(2)}
最可能比分：${topScores}
大于 2.5 球：${formatPercent(scorePrediction.totals.over25)}
小于 2.5 球：${formatPercent(scorePrediction.totals.under25)}

请按下面结构输出，短一点，适合零代码、零模型基础的新手：
1. 先看结论
2. 为什么模型这样看
3. 赔率值不值得
4. 最大风险
5. 下一步怎么做

重要限制：
- 必须提醒这是娱乐和学习用，不是保证盈利。
- 不要鼓励加大金额。
- 如果价值差不高，要明确说可以跳过。
- 用大白话，不要用术语堆砌。
`;
}

export async function POST(request: Request) {
  const aiConfig = getAiConfig();
  const { apiKey, model, provider, baseUrl } = aiConfig;

  if (!apiKey) {
    const body: AiMatchAnalysisResponse = {
      ok: false,
      message:
        provider === "deepseek"
          ? "缺少 DeepSeek API Key。请在 .env.local 中配置 AI_API_KEY 或 DEEPSEEK_API_KEY 后重启服务。"
          : "缺少 OpenAI API Key。请在 .env.local 中配置 AI_API_KEY 或 OPENAI_API_KEY 后重启服务。",
    };

    return NextResponse.json(body, { status: 400 });
  }

  const payload = (await request.json()) as AiMatchAnalysisRequest;

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
              "你是一个谨慎的足球数据解释助手。你只解释模型、赔率和风险，不提供保证盈利的投注建议。",
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
      const body: AiMatchAnalysisResponse = {
        ok: false,
        message:
          data.error?.message ?? `DeepSeek API 返回错误：${response.status}`,
      };

      return NextResponse.json(body, { status: response.status });
    }

    const body: AiMatchAnalysisResponse = {
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
      max_output_tokens: 900,
      instructions:
        "你是一个谨慎的足球数据解释助手。你只解释模型、赔率和风险，不提供保证盈利的投注建议。",
      input: buildPrompt(payload),
    }),
  });

  const data = (await response.json()) as OpenAiResponse;

  if (!response.ok) {
    const body: AiMatchAnalysisResponse = {
      ok: false,
      message: data.error?.message ?? `OpenAI API 返回错误：${response.status}`,
    };

    return NextResponse.json(body, { status: response.status });
  }

  const analysisText = getOutputText(data);
  const body: AiMatchAnalysisResponse = {
    ok: true,
    provider,
    model,
    analysisText:
      analysisText ||
      "AI 已返回结果，但没有解析到可显示的文字。请稍后再试一次。",
  };

  return NextResponse.json(body);
}
