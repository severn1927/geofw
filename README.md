# 友擎GEO (geofw.cn)

[友擎GEO](https://geofw.cn)企业官网 - 专注AI搜索引擎优化(GEO)服务，使用 Astro + Tailwind CSS 构建，支持 Markdown 博客内容管理。

## 快速开始

### 环境要求

- Node.js 18+
- npm 9+

### 安装与运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 目录结构

```
geofw/
├── src/
│   ├── components/          # UI组件
│   │   ├── Header.astro     # 导航栏
│   │   ├── Footer.astro     # 页脚
│   │   ├── Hero.astro       # 首屏Banner
│   │   ├── About.astro      # 关于我们区块
│   │   ├── Services.astro   # 服务项目区块
│   │   ├── Advantages.astro # 优势展示区块
│   │   ├── Testimonials.astro # 客户评价区块
│   │   ├── Team.astro       # 团队展示区块
│   │   ├── Packages.astro   # 套餐定价区块
│   │   └── ContactCTA.astro # 联系引导区块
│   ├── layouts/
│   │   ├── Layout.astro     # 全局布局（含SEO meta）
│   │   └── BlogPost.astro   # 博客文章布局
│   ├── pages/
│   │   ├── index.astro      # 首页
│   │   ├── about.astro      # 关于我们
│   │   ├── services.astro   # 服务项目
│   │   ├── contact.astro    # 联系我们
│   │   ├── 404.astro        # 404页面
│   │   └── blog/
│   │       ├── index.astro  # 博客列表
│   │       └── [...slug].astro # 博客详情
│   ├── content/
│   │   ├── config.ts        # 内容集合配置
│   │   └── blog/            # Markdown博客文章
│   │       ├── what-is-geo.md
│   │       ├── ai-search-optimization.md
│   │       └── deepseek-geo-guide.md
│   ├── styles/
│   │   └── global.css       # 全局样式
│   └── assets/              # 静态资源
├── public/
│   ├── logo.svg             # Logo
│   ├── favicon.svg          # Favicon
│   └── robots.txt           # 搜索引擎爬虫规则
├── astro.config.mjs         # Astro配置
├── tailwind.config.mjs      # Tailwind配置
├── tsconfig.json            # TypeScript配置
└── package.json
```

## 发布博客

在 `src/content/blog/` 目录下创建 `.md` 文件即可发布新文章，格式如下：

```markdown
---
title: "文章标题"
description: "文章描述"
pubDate: 2026-04-28
author: "友擎GEO"
tags: ["标签1", "标签2"]
image: "/images/blog-xxx.jpg"
draft: false
---

文章内容...
```

## SEO特性

- 语义化HTML5结构
- 完整的TDK（Title、Description、Keywords）
- Open Graph和Twitter Card标签
- JSON-LD结构化数据（Organization、BlogPosting、BreadcrumbList）
- 自动生成sitemap.xml
- robots.txt配置
- Canonical URL

## 技术栈

- [Astro 5](https://astro.build) - 静态站生成器
- [Tailwind CSS 3](https://tailwindcss.com) - CSS框架
- [TypeScript](https://www.typescriptlang.org) - 类型安全
- [MDX](https://mdxjs.com) - Markdown增强
