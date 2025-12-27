# 蜘蛛纸牌游戏

一个使用 Vue 3 + TypeScript 开发的完整蜘蛛纸牌游戏，包含所有核心游戏功能和优雅的UI界面。

## 功能特性

### 核心功能
- ✅ 完整的游戏逻辑（洗牌、发牌、移动验证）
- ✅ 拖拽移动卡片
- ✅ 自动完成检测（完整序列自动移动到完成区）
- ✅ 发牌功能（从发牌堆向每列发牌）
- ✅ 游戏胜利检测

### 用户体验功能
- ✅ 撤销功能（支持最多50步）
- ✅ 提示系统（高亮可移动的牌）
- ✅ 双击自动移动
- ✅ 动画效果
- ✅ 游戏统计（计时器、步数、分数）

### 游戏设置
- ✅ 难度选择（单花色、双花色、四花色）
- ✅ 自动完成开关

## 技术栈

- **框架**: Vue 3 + Composition API
- **语言**: TypeScript
- **构建工具**: Vite
- **样式**: CSS3 + 动画

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 项目结构

```
src/
├── components/          # Vue组件
│   ├── Card.vue        # 单张牌组件
│   ├── GameBoard.vue   # 游戏主面板
│   ├── GameHeader.vue  # 游戏头部（分数、计时器等）
│   ├── GameControls.vue # 游戏控制面板
│   ├── TableauPile.vue # 牌堆列组件
│   ├── StockPile.vue   # 发牌堆组件
│   └── FoundationPile.vue # 完成区组件
├── composables/        # 组合式函数
│   ├── useGame.ts      # 游戏核心逻辑
│   └── useDrag.ts      # 拖拽功能
├── types/              # TypeScript类型定义
│   └── index.ts
├── utils/              # 工具函数
│   └── cardUtils.ts    # 卡片相关工具函数
├── App.vue             # 根组件
└── main.ts             # 入口文件
```

## 游戏规则

### 移动规则
- 可以移动单张牌
- 可以移动同花色降序序列（K→Q→J...→A）
- 空列只能放置K或K开始的序列

### 发牌规则
- 点击发牌堆，向每列发一张牌（共10张）
- 发牌堆为空时游戏继续

### 完成规则
- 同花色从K到A的完整序列自动移到完成区
- 8套完整序列完成后游戏胜利

## 开发说明

项目使用 Composition API 开发，逻辑清晰，易于维护。每个重要函数都添加了注释说明。

## 许可证

MIT
