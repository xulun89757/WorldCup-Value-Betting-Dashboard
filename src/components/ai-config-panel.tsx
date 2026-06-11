"use client";

import { useEffect, useState } from "react";
import { Brain, KeyRound } from "lucide-react";

type ConfigStatus = {
  aiProvider: string;
  aiApiKeyConfigured: boolean;
  aiModel: string;
};

export function AiConfigPanel() {
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null);

  useEffect(() => {
    fetch("/api/config/status")
      .then((response) => response.json())
      .then((data: ConfigStatus) => setConfigStatus(data))
      .catch(() => setConfigStatus(null));
  }, []);

  return (
    <section className="rounded-md border border-border bg-surface">
      <div className="border-b border-border p-5">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-accent" />
          <h2 className="text-base font-semibold text-text">AI 分析配置</h2>
        </div>
        <p className="mt-1 text-sm leading-6 text-muted">
          配置 DeepSeek 或其他兼容接口后，比赛详情页可以生成大白话分析。
        </p>
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-3">
        <div className="rounded-md border border-border bg-panel p-4">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-accent" />
            <h3 className="font-semibold text-text">Key 状态</h3>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted">
            {configStatus?.aiApiKeyConfigured
              ? "已检测到 AI API Key。"
              : "还没有检测到 AI API Key，暂时不能生成 AI 分析。"}
          </p>
        </div>

        <div className="rounded-md border border-border bg-panel p-4">
          <h3 className="font-semibold text-text">当前服务商</h3>
          <p className="mt-3 text-sm leading-6 text-muted">
            {configStatus?.aiProvider === "deepseek" ? "DeepSeek" : "OpenAI"}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted">
            接口地址只保存在服务端环境变量里，页面不会展示。
          </p>
        </div>

        <div className="rounded-md border border-border bg-panel p-4">
          <h3 className="font-semibold text-text">当前模型</h3>
          <p className="mt-3 text-sm leading-6 text-muted">
            {configStatus?.aiModel ?? "deepseek-v4-flash"}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted">
            默认使用轻量模型，适合生成解释文字。以后可以在 .env.local 里改。
          </p>
        </div>
      </div>
    </section>
  );
}
