# V0.3 Odds API Research

## 目标

V0.3 的目标是让赔率不再主要依赖 mock 或手动填写。

需要支持：

- 胜平负赔率
- 大小球赔率
- 让球 / 净胜球相关赔率
- 正确比分赔率
- bookmaker 名称
- 赔率更新时间
- 赔率来源
- API 不支持时保留手动填写

---

## 候选 API

## 1. The Odds API

官网：

https://the-odds-api.com/

文档：

https://the-odds-api.com/liveapi/guides/v4/

优点：

- 文档清楚
- 接入简单
- 有免费额度
- 支持 decimal odds
- 支持多个 bookmaker
- 支持常见 market：
  - h2h
  - spreads
  - totals
  - outrights

限制：

- 文档明确的核心 market 主要是 h2h、spreads、totals、outrights
- 正确比分和净胜球这种细盘口不一定稳定覆盖
- 世界杯是否处于 active sports 列表，需要实际 API Key 测试

适合用途：

- V0.3 第一版赔率接入
- 胜平负
- 大小球
- 部分让球

不适合作为唯一来源：

- 正确比分赔率
- 小众净胜球盘口

---

## 2. API-Football

官网：

https://www.api-football.com/

价格页：

https://www.api-football.com/pricing

优点：

- 专门做足球
- 免费版有 100 requests / day
- 免费计划列出包含：
  - Fixtures
  - Livescore
  - Pre-match Odds
  - In-play Odds
  - Predictions
- 赔率和足球比赛数据在同一个生态里

限制：

- 文档页面较重，自动化读取不如 The Odds API 顺畅
- 需要实际 API Key 测试 World Cup coverage 和可用 bookmaker
- 如果以后继续用 Football Data 做赛程，会涉及跨 API 匹配比赛

适合用途：

- 足球专项赔率
- 后续如果想把赛程、赔率、预测都迁到同一个足球 API
- 可能更适合查正确比分和细分盘口，但需要实测

---

## 3. Sportmonks

官网：

https://www.sportmonks.com/football-api/

初步判断：

- 足球数据能力强
- 更偏完整体育数据平台
- 对个人学习项目可能偏重
- 价格和权限需要进一步确认

暂不作为 V0.3 首选。

---

# 推荐方案

## V0.3 首选：The Odds API

原因：

- 接入最简单
- 免费额度适合 MVP
- 官方文档清楚
- h2h / totals / spreads 正好覆盖 V0.3 最重要部分

V0.3 先做：

- 胜平负赔率自动同步
- 大小球赔率自动同步
- 让球赔率自动同步
- 多 bookmaker 展示
- 选择一个默认 bookmaker
- 记录赔率更新时间

继续手动保留：

- 正确比分赔率
- 净胜球细盘口赔率

---

# V0.3 实施计划

## V0.3.1 API 选型

- [x] 调研 The Odds API
- [x] 调研 API-Football
- [x] 确认 V0.3 首选 The Odds API
- [x] 保留 API-Football 作为备选

## V0.3.2 赔率数据结构

新增 Odds 类型：

- matchId
- provider
- sportKey
- bookmakerKey
- bookmakerTitle
- marketKey
- marketLabel
- outcomeName
- outcomeLabel
- price
- point
- lastUpdate
- source

支持 market：

- h2h
- totals
- spreads

## V0.3.3 The Odds API 接入

需要环境变量：

- THE_ODDS_API_KEY
- THE_ODDS_API_SPORT
- THE_ODDS_API_REGIONS
- THE_ODDS_API_MARKETS
- THE_ODDS_API_BOOKMAKER

默认建议：

- THE_ODDS_API_SPORT=soccer_fifa_world_cup
- THE_ODDS_API_REGIONS=eu
- THE_ODDS_API_MARKETS=h2h,totals,spreads

注意：

世界杯 sport key 需要用 `/v4/sports?all=true` 实测确认。

## V0.3.4 页面接入

- 设置页增加 Odds API Key 状态
- 设置页增加同步赔率按钮
- 比赛详情页显示 API 赔率
- 资金页优先使用 API 赔率
- API 没有的盘口继续手动填写

---

# 结论

V0.3 使用 The Odds API 作为第一版赔率来源。

理由：

- 最快接入
- 文档最清楚
- 免费额度足够 MVP 测试
- 适合先把胜平负、大/小球、让球的价值差跑通

正确比分和净胜球细盘口暂时继续手动填写，等 V0.3 稳定后，再评估是否增加 API-Football 作为补充赔率源。
