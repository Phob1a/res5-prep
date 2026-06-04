# RES5 备考工具(阶段0)

新加坡 RES5(CMFAS M5,MAS 监管,纯选择题)备考的纯静态网页工具。单人、免登录、数据存浏览器本地。

> ⚠️ 题目为照官方考纲(SCI 官方 27 项 Contents)自编的**模拟题**,非真题。默认 `draft`,需人工对照官方教材核验后升 `reviewed`。官方 PASS/FAIL 仅在 reviewed 题量达 110/40 时才显示。

## 本地运行

需通过 static server 打开(不要直接双击 `file://`,否则 fetch 加载 JSON 会被浏览器拦截):

```bash
cd res5-prep
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080
```

## 跑测试

```bash
cd res5-prep
npm test      # node --test,50 个单测
```

## 功能模块

- **模拟考**:official(reviewed 达 110/40,官方判分)/ full-length practice(题量够但含 draft,无官方判定)/ mini mock 三态
- **速记**:按官方考纲条目分章的知识卡,可翻面、标已掌握
- **知识点**:按官方考纲 27 项浏览结构化讲义(概述 + 分段 + 易考点 + MAS 出处);讲义/卡片均 draft,运行时按文件隔离校验,坏文件只告警跳过不影响刷题/模拟考
- **刷题**:选条目逐题做,即时对错 + 解析,错题自动入错题本
- **错题/弱项**:27 条目弱项仪表盘 + 学习进度导出/导入 JSON
- **导入**:JSON/CSV 扩充题库,统一校验(带行号/locator,不静默丢题),合并报告(added/updated/skipped/conflict,默认不覆盖冲突)。⚠️ 阶段0 导入的题**仅当前页面会话生效**(刷新即失);持久化到 localStorage 并纳入进度导出留待阶段1。要永久加题,目前直接往 `content/questions/<sNN>.json` 加条目。

## 内容生产(阶段1+)

题库/知识卡为 `content/` 下按 `syllabusItemId`(`s01`..`s27`)分文件的 JSON。逐条目补 draft 题 → 人工升 reviewed → reviewed 题量达 110/40 解锁官方完整模拟考。

设计与计划见 `../docs/superpowers/specs/2026-06-03-res5-exam-prep-design.md` 与 `../docs/superpowers/plans/2026-06-03-res5-prep-phase0.md`。
