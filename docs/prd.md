# WorldCup Value Betting Dashboard

## 项目目标

开发一个世界杯比赛分析与资金管理网页。

系统通过：

- ELO Rating
- Market Odds
- Value Edge Calculation
- AI Analysis（未来版本）

帮助用户发现：

> 模型概率高于市场概率的价值机会（Value Opportunities）

项目目标不是预测所有比赛结果，而是建立一个：

- 世界杯比赛分析工具
- 娱乐性资金管理工具
- AI 开发学习项目
- 视频内容创作项目

帮助用户使用有限预算（500~1000元）参与世界杯预测与复盘。

---

# 产品路线图

## V0.1（当前开发目标）

目标：

使用 Mock Data 完成可运行 MVP。

包含：

- Dashboard
- Match Analysis
- Value Opportunities
- Bankroll Management
- Explain Why（静态分析）
- ELO Probability
- Implied Probability
- Value Edge

不包含：

- Football Data API
- Odds API
- OpenAI API
- 数据库
- 用户系统
- 自动下注
- 支付功能

---

## V0.2

接入 Football Data API

实现：

- 自动获取赛程
- 自动获取比赛状态
- 自动获取比分

---

## V0.3

接入 Odds API

实现：

- 实时赔率
- 市场隐含概率
- Value Edge 自动更新

---

## V0.4

接入 OpenAI API

实现：

- GPT Analysis
- Explain Why
- 风险分析
- 自动推荐文案

---

## V0.5

内容创作者模式

实现：

- AI每日推荐卡片
- AI复盘卡片
- 一键生成短视频素材图

---

# 核心分析流程

比赛数据
↓
ELO评分

赔率数据
↓
隐含概率计算

ELO概率
+
赔率隐含概率
↓
Value Edge

Value Edge
+
比赛背景信息
↓
Explain Why

Explain Why
↓
风险等级
↓
建议金额
↓
最终决策卡片

---

# MVP核心功能

## Dashboard

显示：

- 当前本金
- 当前盈亏
- ROI
- 今日比赛数量
- 今日价值机会数量
- 当前连胜
- 当前连败

---

## Match Analysis

每场比赛显示：

### Team Strength

- Home ELO
- Away ELO
- ELO Difference

### Market View

- Home Odds
- Draw Odds
- Away Odds

### Implied Probability

自动计算：

- Home %
- Draw %
- Away %

### Model Probability

根据ELO计算：

- Home %
- Draw %
- Away %

### Value Edge

ValueEdge = ModelProbability - MarketProbability

### Risk Factors

展示风险因素：

- 热门球队过热
- 淘汰赛保守策略
- 实力接近
- 赔率过低
- 风险较高

### Explain Why

V0.1使用静态分析。

示例：

法国ELO领先67分。

模型胜率52%。

市场隐含概率43%。

存在约9%的价值差。

建议小额参与。

---

## Value Opportunities

自动排序：

Top Value Bets Today

字段：

- Match
- Selection
- Model Probability
- Market Probability
- Value Edge

规则：

- 对每场比赛的 Home / Draw / Away 三个选项分别计算 Value Edge
- 只展示 Value Edge > 0 的选项
- 默认按 Value Edge 降序排序
- 如果 Value Edge 相同，优先展示 Risk Level 更低的选项
- V0.1 不自动下注，只提供分析和记录入口

空状态：

- 如果当天没有 Value Edge > 0 的选项，显示 No Value Opportunities Today

---

## Bankroll Management

模式：

世界杯挑战赛

初始本金：

500元

规则：

- 允许亏损全部本金
- 目标尽可能坚持到世界杯结束
- 记录所有决策

世界杯结束后统计：

- ROI
- 命中率
- 最大回撤
- 最大连胜
- 最大连败
- 最佳决策
- 最差决策
- 剩余本金

---

# 技术栈

## Frontend

- Next.js 15
- TypeScript
- TailwindCSS
- shadcn/ui
- Recharts

## Backend

- Next.js API Routes

## Storage

### V0.1

- localStorage

### Future

- SQLite
- PostgreSQL

## Data Source

### V0.1

- Local Mock Data

### V0.2

- Football Data API

### V0.3

- Odds API

## AI

### V0.4

- OpenAI API

---

# 系统架构

src/

app/
├── page.tsx
├── matches/[id]/page.tsx
├── bankroll/page.tsx

components/
├── DashboardCard.tsx
├── MatchCard.tsx
├── ProbabilityChart.tsx
├── ValueEdgeChart.tsx
├── ExplainWhyCard.tsx
├── BankrollCard.tsx

data/
├── matches.json
├── bankroll.json
├── bets.json

lib/
├── elo.ts
├── odds.ts
├── value-edge.ts
├── bankroll.ts

types/
├── match.ts
├── bankroll.ts
├── bet.ts

---

# 核心服务

## elo.ts

负责：

- calculateExpectedScore()
- calculateMatchProbabilities()

---

## odds.ts

负责：

- calculateImpliedProbability()
- normalizeProbability()

---

## value-edge.ts

负责：

- calculateValueEdge()
- calculateRiskLevel()

---

# Mock Data Specification

## matches.json

字段：

- id
- homeTeam
- awayTeam
- homeElo
- awayElo
- homeOdds
- drawOdds
- awayOdds
- startTime
- stage
- status
- homeScore
- awayScore
- riskFactors

要求：

- V0.1 至少准备 8-12 场 mock matches
- 覆盖强队 vs 弱队、强强对话、实力接近、热门球队过热、平局价值机会、无价值机会等场景
- odds 使用十进制赔率
- startTime 使用 ISO string
- status 可选值：scheduled、live、finished
- homeScore / awayScore 在 scheduled 时可以为 null

---

## bankroll.json

字段：

- initialBankroll
- currentBankroll
- totalProfit
- roi
- maxDrawdown
- winningStreak
- losingStreak

---

## bets.json

字段：

- id
- matchId
- selection
- stake
- odds
- status
- result
- profit
- placedAt
- settledAt
- notes

说明：

- selection 可选值：home、draw、away
- status 可选值：pending、settled
- result 可选值：win、loss、void、pending
- pending bet 的 profit 为 0
- win profit = stake * (odds - 1)
- loss profit = -stake
- void profit = 0

---

# 计算规则

## Market Probability

公式：

raw = 1 / odds

归一化后得到：

Market Probability

---

## ELO Probability

公式：

ExpectedScore =

1 / (1 + 10^((OpponentELO - TeamELO) / 400))

V0.1 三结果转换规则：

1. 计算 homeExpected：

homeExpected = 1 / (1 + 10^((awayElo - homeElo) / 400))

2. 计算 eloDiff：

eloDiff = abs(homeElo - awayElo)

3. 计算 drawProbability：

drawProbability = clamp(0.18, 0.30, 0.28 - eloDiff / 2000)

说明：

- ELO 越接近，平局概率越高
- ELO 差距越大，平局概率越低
- clamp(min, max, value) 表示把 value 限制在 min 和 max 之间

4. 分配剩余概率：

remaining = 1 - drawProbability

homeWinProbability = remaining * homeExpected

awayWinProbability = remaining * (1 - homeExpected)

最终得到：

- Home Win Probability
- Draw Probability
- Away Win Probability

注意：

- V0.1 该公式用于产品演示和学习，不作为真实预测模型
- 后续版本可以引入进球期望、主客场修正、伤停信息、赛制阶段修正

---

## Value Edge

公式：

Value Edge =

Model Probability
-
Market Probability

计算范围：

- 每场比赛同时计算 home、draw、away 三个选项
- Value Edge 使用小数保存，例如 0.09 表示 9%
- 页面展示时转为百分比，例如 +9.0%

---

# 风险等级

## Low

Value Edge >= 8%，且没有高风险标签

---

## Medium

Value Edge 3% ~ 8%，或存在 1 个普通风险标签

---

## High

Value Edge < 3%，或存在高风险标签

---

## 风险标签

普通风险标签：

- 热门球队过热
- 实力接近
- 淘汰赛保守策略
- 平局波动较高

高风险标签：

- 赔率过低
- 赔率异常波动
- 阵容信息不完整
- 模型优势很小

V0.1 可以从 mock data 的 riskFactors 字段读取标签，不需要自动判断全部风险。

---

# Bankroll 计算规则

## Current Bankroll

currentBankroll = initialBankroll + sum(settled bet profit)

---

## Total Profit

totalProfit = currentBankroll - initialBankroll

---

## ROI

roi = totalProfit / totalSettledStake

如果 totalSettledStake = 0，则 ROI = 0

---

## Win Rate

winRate = wonSettledBets / settledBets

如果 settledBets = 0，则 Win Rate = 0

---

## Max Drawdown

按照 bet settledAt 时间排序，计算 bankroll peak 到后续 low 的最大下降比例。

---

## Suggested Stake

V0.1 使用娱乐模式固定建议：

- Low Risk：本金的 3% - 5%
- Medium Risk：本金的 1% - 3%
- High Risk：不建议参与，或最多本金的 1%

页面只显示建议金额，不自动执行。

---

# Explain Why

## V0.1

Explain Why 使用静态分析。

根据：

- ELO
- Odds
- Value Edge

生成固定模板说明。

---

## V0.4

Explain Why 使用 OpenAI API。

输入：

- Match Info
- ELO Ratings
- Odds
- Market Probability
- Model Probability
- Value Edge

输出：

1. Match Summary
2. Risk Factors
3. Value Assessment
4. Suggested Stake
5. Final Recommendation

要求：

- 不保证盈利
- 不使用绝对性措辞
- 必须说明风险

---

# 开发顺序

## Step 1

项目结构

Mock Data

ELO Service

---

## Step 2

Dashboard

---

## Step 3

Match Analysis

---

## Step 4

Bankroll Management

---

## Step 5

Value Opportunities

---

## Step 6

Explain Why

---

## Step 7

Football Data API

---

## Step 8

Odds API

---

## Step 9

OpenAI Integration

---

# Codex Development Rules

V0.1 必须：

- 使用 Mock Data
- 使用 localStorage
- 不接外部 API
- 不接 OpenAI
- 不接数据库

优先保证：

- 页面可运行
- 计算正确
- 结构清晰

其次再优化：

- UI
- 动画
- 样式

禁止：

- 自动下注
- 支付功能
- 第三方赌博平台集成
- 不必要的复杂依赖
