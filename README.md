---
title: LexiFlow - Word Learning App
emoji: 🎯
colorFrom: indigo
colorTo: pink
sdk: static
app_file: src/app/page.tsx
pinned: false
license: mit
short_description: 游戏化沉浸式英语学习平台
---

# 🎯 LexiFlow - 游戏化沉浸式英语学习平台

LexiFlow 是一款基于 **Next.js 16 (App Router)** + **Supabase** + **Tailwind CSS** 构建的高端英语单词学习应用。它结合了 AI 词库解析、云端同步以及多样化的游戏挑战模式，旨在为学习者提供极致丝滑的沉浸式背词体验。

## ✨ 核心特性

### 🎮 多维挑战模式
- **记忆卡片 (Flashcards)**: 拟态翻转交互，配合高效 SRS (间隔重复) 算法。
- **拼写挑战 (Spelling)**: 强化拼音记忆，支持 TTS 实时发音引导。
- **语义选择 (Quiz)**: 高频核心词汇情境选择，快速扩充被动词汇。
- **极速配对 (Blitz)**: 刺激的限时配对游戏，锻炼反应速度与语义联想能力。

### 🤖 AI 词库解析器
- **智能提取**: 支持从任意粘贴的文本中提取单词及其释义，快速建立个人专属语料库。
- **多词书管理**: 内置《小初核心英语》、《高中核心英语》、《CET-4》、《TOEFL》等多梯度官方词书。

### ☁️ 全能云端同步
- **身份认证**: 集成 Supabase Auth，支持登录/注册及密码可见性切换。
- **跨端互联**: 自动同步学习进度、成就、AI 提取词汇以及个人笔记至云端。
- **数据恢复**: 支持一键拉取云端存档，确保学习记录永不丢失。

### � 深度进阶体系
- **RPG 等级系统**: 从“新手学徒”到“语言传奇”，基于 EXP 的多级称号体系。
- **动态统计**: 实时追踪学习准确率、周活跃度及掌握词数。
- **成就勋章**: 丰富的徽章奖励机制，记录每一个里程碑。

### � 高端视觉与交互
- **UI 设计**: 采用现代 Claymorphism (拟态) 风格，结合磨砂玻璃与灵动阴影。
- **动画特效**: 基于 Framer Motion 打造的丝滑过渡与反馈动画。
- **Toast 通知**: 自定义右上角滑入提示，取代干扰性的原生弹窗。
- **音效引擎**: 完整的交互音效与高品质 TTS 语音合成。

## 🚀 快速启动

### 环境要求
- **Node.js 20.0+**
- **Supabase 账户**（用于云端功能）

### 1. 克隆与安装
```bash
git clone https://github.com/renbooc/word-learning-app.git
cd word-learning-app
npm install
```

### 2. 环境配置
创建 `.env.local` 文件并配置您的 Supabase 连接：
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. 开发环境
```bash
npm run dev
```

## 🏗️ 技术架构

| 模块 | 技术选型 |
|:--- |:--- |
| **前端框架** | Next.js 16 (App Router) |
| **语言** | TypeScript |
| **样式** | Tailwind CSS 4.0 |
| **状态管理** | Zustand + Persist Middleware |
| **后端/数据库** | Supabase (Database, Auth) |
| **动画库** | Framer Motion (12.x+) |
| **图标** | Heroicons |

## 📁 目录结构

```text
src/
├── app/             # 路由与全局样式
├── components/
│   ├── ui/          # 高度定制的可复用组件 (Toast, ConfirmModal等)
│   ├── game/        # 四大核心游戏模式组件
│   ├── vocabulary/  # 词库管理与 AI 解析
│   └── layout/      # 视图切换与认证逻辑
├── stores/          # 全局状态管理 (gameStore)
├── lib/             # supabase 客户端及工具函数
├── types/           # 全局类型定义
└── data/            # 静态词书配置文件
```

## 🔒 隐私与安全
应用默认开启**强制登录访问限制**。所有用户数据均加密存储于 Supabase 云端，支持手动触发全站数据重置，确保隐私受控。

---

**Built with ❤️ by LexiFlow Team**