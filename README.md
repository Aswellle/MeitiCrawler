# 🔥 MediaCrawler - 自媒体平台爬虫 🕷️

<div align="center">

[![GitHub Stars](https://img.shields.io/github/stars/Aswellle/MeitiCrawler?style=social)](https://github.com/Aswellle/MeitiCrawler/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/Aswellle/MeitiCrawler?style=social)](https://github.com/Aswellle/MeitiCrawler/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/Aswellle/MeitiCrawler)](https://github.com/Aswellle/MeitiCrawler/issues)
[![License](https://img.shields.io/badge/license-Non--Commercial%20Learning%201.1-blue)](LICENSE)
[![中文](https://img.shields.io/badge/🇨🇳_中文-当前-blue)](README.md)
[![English](https://img.shields.io/badge/🇺🇸_English-Available-green)](README_en.md)
[![Español](https://img.shields.io/badge/🇪🇸_Español-Available-green)](README_es.md)

</div>

---

> ### 🔗 项目来源与 Fork 声明
>
> **本仓库是 [NanmiCoder/MediaCrawler](https://github.com/NanmiCoder/MediaCrawler) 的 Fork 分支。**
>
> 原始项目由 **[NanmiCoder（程序员阿江-Relakkes）](https://github.com/NanmiCoder)** 创建并维护，是一个高星标量的多平台自媒体数据采集开源项目。
>
> 本 Fork 由 **Aswellle** 在原始项目基础上进行 UI/UX 改造与功能增强，旨在保留原始项目优秀架构的同时，提供更现代化的 Web 操作界面与更好的使用体验。
>
> **原始项目的版权、许可证及免责声明归 NanmiCoder/relakkes 所有，本 Fork 在此基础上附加的改动由 Aswellle 负责。** 详见下方 [免责声明](#免责声明) 章节。

---

> **⚠️ 免责声明（概要）**
>
> 本仓库所有内容仅供学习与研究目的使用，禁止用于商业用途。任何人或组织不得将本仓库内容用于非法用途或侵犯他人合法权益。对于因使用本仓库内容而引起的任何法律责任，相应责任方按贡献划分承担。
>
> 本仓库基于 [NON-COMMERCIAL LEARNING LICENSE 1.1](LICENSE) 授权，原始版权归 relakkes@gmail.com 所有。
>
> 👉 [点击跳转至完整免责声明](#免责声明)

---

## 📝 分支贡献

本 Fork 在原始项目基础上进行了以下主要改动：

- **WebUI 全面重新设计** — 对 `webui/` 前端进行 UI/UX 改造，提供更直观、现代化的操作界面
- **交互体验优化** — 改进爬虫配置、状态监控、日志查看等核心使用流程
- **功能增强与问题修复** — 在保留原始架构的基础上进行多项改进

> 本分支的所有提交与改动记录可通过 [GitHub Compare View](https://github.com/NanmiCoder/MediaCrawler/compare...Aswellle:MeitiCrawler:main) 查看。

---

## 📖 项目简介

一个功能强大的**多平台自媒体数据采集工具**，支持小红书、抖音、快手、B站、微博、贴吧、知乎等主流平台的公开信息抓取。

### 🔧 技术原理

- **核心技术**：基于 [Playwright](https://playwright.dev/) 浏览器自动化框架登录保存登录态
- **无需JS逆向**：利用保留登录态的浏览器上下文环境，通过 JS 表达式获取签名参数
- **优势特点**：无需逆向复杂的加密算法，大幅降低技术门槛


## ✨ 功能特性

| 平台   | 关键词搜索 | 指定帖子ID爬取 | 二级评论 | 指定创作者主页 | 登录态缓存 | IP代理池 | 生成评论词云图 |
| ------ | ---------- | -------------- | -------- | -------------- | ---------- | -------- | -------------- |
| 小红书 | ✅          | ✅              | ✅        | ✅              | ✅          | ✅        | ✅              |
| 抖音   | ✅          | ✅              | ✅        | ✅              | ✅          | ✅        | ✅              |
| 快手   | ✅          | ✅              | ✅        | ✅              | ✅          | ✅        | ✅              |
| B 站   | ✅          | ✅              | ✅        | ✅              | ✅          | ✅        | ✅              |
| 微博   | ✅          | ✅              | ✅        | ✅              | ✅          | ✅        | ✅              |
| 贴吧   | ✅          | ✅              | ✅        | ✅              | ✅          | ✅        | ✅              |
| 知乎   | ✅          | ✅              | ✅        | ✅              | ✅          | ✅        | ✅              |


## 🚀 快速开始

## 📋 前置依赖

### 🚀 uv 安装（推荐）

在进行下一步操作之前，请确保电脑上已经安装了 uv：

- **安装地址**：[uv 官方安装指南](https://docs.astral.sh/uv/getting-started/installation)
- **验证安装**：终端输入命令 `uv --version`，如果正常显示版本号，证明已经安装成功
- **推荐理由**：uv 是目前最强的 Python 包管理工具，速度快、依赖解析准确

### 🟢 Node.js 安装

项目依赖 Node.js，请前往官网下载安装：

- **下载地址**：https://nodejs.org/en/download/
- **版本要求**：>= 16.0.0

### 📦 Python 包安装

```shell
# 进入项目目录
cd MediaCrawler

# 使用 uv sync 命令来保证 python 版本和相关依赖包的一致性
uv sync
```

### 🌐 浏览器驱动安装（可选）

> 如果使用默认的 CDP 模式（连接已有 Chrome 浏览器），**无需安装浏览器驱动**。仅在使用标准 Playwright 模式时需要安装。

```shell
# 仅在标准 Playwright 模式下需要安装浏览器驱动
uv run playwright install
```

### 🌍 Chrome 浏览器配置（推荐）

项目默认使用 CDP 模式连接用户已有的 Chrome 浏览器，可以复用浏览器已有的登录状态、Cookie、扩展等，**大幅降低平台风控检测风险**。

使用前需要：

1. **安装最新版 Chrome 浏览器**（版本 >= 144），[下载地址](https://www.google.com/chrome/)
2. **开启远程调试功能**：在 Chrome 地址栏输入 `chrome://inspect/#remote-debugging`，勾选 **"Allow remote debugging for this browser instance"**
3. 页面显示 `Server running at: 127.0.0.1:9222` 表示已就绪

> 💡 **提示**：运行爬虫后，Chrome 浏览器会弹出确认对话框，点击"接受"即可。程序会等待用户确认，60秒内操作完成即可。
>
> 如果不想使用 CDP 模式，可以在 `config/base_config.py` 中设置 `ENABLE_CDP_MODE = False` 切换为标准 Playwright 模式。

## 🚀 运行爬虫程序

```shell
# 在 config/base_config.py 查看配置项目功能，写的有中文注释

# 从配置文件中读取关键词搜索相关的帖子并爬取帖子信息与评论
uv run main.py --platform xhs --lt qrcode --type search

# 从配置文件中读取指定的帖子ID列表获取指定帖子的信息与评论信息
uv run main.py --platform xhs --lt qrcode --type detail

# 打开对应APP扫二维码登录

# 其他平台爬虫使用示例，执行下面的命令查看
uv run main.py --help
```

<details>
<summary>🖥️ <strong>WebUI 可视化操作界面</summary>

MediaCrawler 提供了基于 Web 的可视化操作界面，无需命令行也能轻松使用爬虫功能。

#### 开发调试（推荐）

开发时需要同时启动后端 API 服务和前端 Vite 开发服务器：

```shell
# 终端 1：启动 API 服务器（默认端口 8080）
uv run uvicorn api.main:app --port 8080 --reload

# 终端 2：启动前端开发服务器
cd webui
npm install
npm run dev        # 默认在 5173 端口启动，并代理 /api 到 8080
```

启动成功后，访问 `http://localhost:5173/` 即可打开 WebUI 界面。

> 首次打开会进行环境检测（调用 `/api/env/check`），请确保后端服务已启动。如果检测失败，可点击「跳过检测」临时跳过。

#### 构建生产资源

如果希望通过 API 服务器直接提供 WebUI 静态资源，需要先构建前端：

```shell
cd webui
npm install
npm run build      # 产物输出到 api/webui/
```

构建完成后，只需启动 API 服务器：

```shell
uv run uvicorn api.main:app --port 8080 --reload
```

然后访问 `http://localhost:8080` 即可。

#### WebUI 功能特性

- 可视化配置爬虫参数（平台、登录方式、爬取类型等）
- 实时查看爬虫运行状态和日志
- 数据预览和导出

#### 界面预览

<img src="docs/static/images/img_8.png" alt="WebUI 界面预览">

</details>

<details>
<summary>🔗 <strong>使用 Python 原生 venv 管理环境（不推荐）</summary>

#### 创建并激活 Python 虚拟环境

> 如果是爬取抖音和知乎，需要提前安装 nodejs 环境，版本大于等于：`16` 即可

```shell
# 进入项目根目录
cd MediaCrawler

# 创建虚拟环境
# requirements.txt 中的库基于 python 3.11
# 如果是其他 python 版本，可能 requirements.txt 中的库不兼容，需自行解决
python -m venv venv

# macOS & Linux 激活虚拟环境
source venv/bin/activate

# Windows 激活虚拟环境
venv\Scripts\activate
```

#### 安装依赖库

```shell
pip install -r requirements.txt
```

#### 安装 playwright 浏览器驱动

```shell
playwright install
```

#### 运行爬虫程序（原生环境）

```shell
# 项目默认是没有开启评论爬取模式，如需评论请在 config/base_config.py 中的 ENABLE_GET_COMMENTS 变量修改
# 一些其他支持项，也可以在 config/base_config.py 查看功能，写的有中文注释

# 从配置文件中读取关键词搜索相关的帖子并爬取帖子信息与评论
python main.py --platform xhs --lt qrcode --type search

# 从配置文件中读取指定的帖子ID列表获取指定帖子的信息与评论信息
python main.py --platform xhs --lt qrcode --type detail

# 打开对应APP扫二维码登录

# 其他平台爬虫使用示例，执行下面的命令查看
python main.py --help
```

</details>


## 💾 数据保存

MediaCrawler 支持多种数据存储方式，包括 CSV、JSON、JSONL、Excel、SQLite 和 MySQL 数据库。

📖 **详细使用说明请查看：[数据存储指南](docs/data_storage_guide.md)**


## 📚 参考

- **原始项目仓库**：[NanmiCoder/MediaCrawler](https://github.com/NanmiCoder/MediaCrawler)
- **小红书签名仓库**：[Cloxl 的 xhs 签名仓库](https://github.com/Cloxl/xhshow)
- **小红书客户端**：[ReaJason 的 xhs 仓库](https://github.com/ReaJason/xhs)
- **短信转发**：[SmsForwarder 参考仓库](https://github.com/pppscn/SmsForwarder)
- **内网穿透工具**：[ngrok 官方文档](https://ngrok.com/docs/)


---

# 免责声明

本仓库包含两份免责声明：
1. **原始项目免责声明** — 由 NanmiCoder/relakkes 提供，适用于原始项目代码
2. **Fork 分支免责声明** — 由 Aswellle 提供，适用于本 Fork 的改动部分

---

## 一、原始项目免责声明

> 以下免责声明文本保留自 [NanmiCoder/MediaCrawler](https://github.com/NanmiCoder/MediaCrawler) 原始项目。
> 原始版权归 relakkes@gmail.com 所有，许可证为 [NON-COMMERCIAL LEARNING LICENSE 1.1](LICENSE)。

<div id="disclaimer">

### 1. 项目目的与性质
本项目（以下简称"本项目"）是作为一个技术研究与学习工具而创建的，旨在探索和学习网络数据采集技术。本项目专注于自媒体平台的数据爬取技术研究，旨在提供给学习者和研究者作为技术交流之用。

### 2. 法律合规性声明
本项目开发者（以下简称"开发者"）郑重提醒用户在下载、安装和使用本项目时，严格遵守中华人民共和国相关法律法规，包括但不限于《中华人民共和国网络安全法》、《中华人民共和国反间谍法》等所有适用的国家法律和政策。用户应自行承担一切因使用本项目而可能引起的法律责任。

### 3. 使用目的限制
本项目严禁用于任何非法目的或非学习、非研究的商业行为。本项目不得用于任何形式的非法侵入他人计算机系统，不得用于任何侵犯他人知识产权或其他合法权益的行为。用户应保证其使用本项目的目的纯属个人学习和技术研究，不得用于任何形式的非法活动。

### 4. 免责声明
开发者已尽最大努力确保本项目的正当性及安全性，但不对用户使用本项目可能引起的任何形式的直接或间接损失承担责任。包括但不限于由于使用本项目而导致的任何数据丢失、设备损坏、法律诉讼等。

### 5. 知识产权声明
本项目的知识产权归开发者所有。本项目受到著作权法和国际著作权条约以及其他知识产权法律和条约的保护。用户在遵守本声明及相关法律法规的前提下，可以下载和使用本项目。

### 6. 最终解释权
关于本项目的最终解释权归开发者所有。开发者保留随时更改或更新本免责声明的权利，恕不另行通知。

</div>

---

## 二、Fork 分支免责声明

> 本 Fork 由 **Aswellle**（[https://github.com/Aswellle/MeitiCrawler](https://github.com/Aswellle/MeitiCrawler)）维护。

### 1. 分支性质
本仓库是 [NanmiCoder/MediaCrawler](https://github.com/NanmiCoder/MediaCrawler) 的独立 Fork 分支。本 Fork 在原始项目基础上进行了 UI/UX 改造与功能增强（详见上方 [分支贡献](#-分支贡献) 章节）。

### 2. 责任划分
- **原始项目代码**（爬虫核心逻辑、平台爬取实现、存储层、代理/缓存基础设施等）的版权与责任归原始作者 NanmiCoder/relakkes 所有。
- **本 Fork 改动部分**（WebUI 重新设计、交互体验优化、以及本分支提交的所有新增/修改代码）由 Aswellle 享有相应权利并承担相应责任。
- 使用本 Fork 的用户应知晓：本分支的改动未经原始作者审核，原始作者不对本 Fork 的改动部分承担任何责任。

### 3. 使用须知
- 本 Fork **仅供学习与研究使用**，严禁用于商业用途或任何非法目的。
- 本 Fork 基于原始项目的 [NON-COMMERCIAL LEARNING LICENSE 1.1](LICENSE) 授权，使用该许可证的条款对 Fork 整体继续有效。
- 对于因使用本 Fork（含原始代码及改动部分）而引起的任何法律责任或损失，Aswellle 仅对本人所改动部分承担相应责任，且不承担任何直接或间接损失的赔偿责任。
- 如本 Fork 的改动涉及对原始项目架构的修改，相关风险由使用者自行评估。

### 4. 知识产权声明
本 Fork 中新增/修改的代码版权归 Aswellle 所有，原始项目代码版权仍归 relakkes@gmail.com 所有。使用本 Fork 即表示您知悉并同意本免责声明及原始项目许可证的所有条款。

### 5. 反馈与问题
- 如发现问题源于**原始项目代码**，建议向 [NanmiCoder/MediaCrawler](https://github.com/NanmiCoder/MediaCrawler/issues) 反馈。
- 如发现问题源于**本 Fork 的改动**（WebUI、交互体验等），请在本仓库的 [Issues](https://github.com/Aswellle/MeitiCrawler/issues) 反馈。
