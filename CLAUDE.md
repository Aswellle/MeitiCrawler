# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MediaCrawler is a multi-platform social media data crawling tool supporting Xiaohongshu (小红书), Douyin (抖音), Kuaishou (快手), Bilibili (B站), Weibo (微博), Tieba (贴吧), and Zhihu (知乎). It uses Playwright for browser automation and avoids JS reverse engineering by using live browser contexts to obtain signed API parameters.

## Commands

### Setup & Dependencies
```shell
# 1. Environment config (optional — database credentials, proxy keys)
cp .env.example .env      # Edit .env with your actual credentials

# 2. Install Python dependencies
uv sync                    # Install all Python dependencies (uses uv.lock)

# 3. Install pre-commit hooks
uv run pre-commit install

# 4. Install browser drivers (only for standard Playwright mode — see CDP mode below)
uv run playwright install

# Alternative: venv-based setup (not recommended)
python -m venv venv && pip install -r requirements.txt && playwright install
```

### Running the Crawler
```shell
# View available options
uv run main.py --help

# Keyword search crawling
uv run main.py --platform xhs --lt qrcode --type search

# Specific post detail crawling
uv run main.py --platform xhs --lt qrcode --type detail

# Creator homepage data crawling
uv run main.py --platform xhs --lt qrcode --type creator

# Platform codes: xhs (小红书), dy (抖音), ks (快手), bili (B站), wb (微博), tieba (贴吧), zhihu (知乎)
# Login types: qrcode, phone, cookie
```

### WebUI (Development)
```shell
# Terminal 1: FastAPI backend (port 8080)
uv run uvicorn api.main:app --port 8080 --reload

# Terminal 2: Vue frontend (port 5173, proxies /api to 8080)
cd webui && npm install && npm run dev
```

### WebUI (Production Build)
```shell
cd webui && npm install && npm run build   # Output to api/webui/
uv run uvicorn api.main:app --port 8080    # Serve both API and built frontend
```

### Testing
The project has two test directories:
```shell
uv run pytest tests/ -v                    # Newer integration tests (platform-level, API)
uv run pytest test/ -v                     # Legacy unit tests (cache, proxy, DB, utils)
uv run pytest tests/test_x.py -v           # Run a specific test file
```

### Linting & Code Quality
```shell
pre-commit run --all-files       # Run all pre-commit hooks (header checks, trailing whitespace, YAML validation, etc.)
uv run mypy .                    # Type checking (limited coverage)
uv run python tools/file_header_manager.py --check  # Check copyright headers
```

### Database Initialization
```shell
uv run main.py --init-db sqlite  # Initialize database tables (also supports: mysql, postgres)
```

### Choosing a Browser Mode

**CDP Mode (default, recommended).** Connects to the user's real Chrome via Chrome DevTools Protocol. No browser drivers needed. Prerequisites:
1. Chrome >= 144 installed
2. `ENABLE_CDP_MODE = True` and `CDP_CONNECT_EXISTING = True` in `config/base_config.py`
3. Chrome launched with remote debugging: `chrome://inspect/#remote-debugging` (port 9222) — or set `CDP_CONNECT_EXISTING = False` to let the tool auto-launch Chrome
4. On first run, Chrome shows a confirmation dialog — accept within 60 seconds

**Standard Playwright Mode.** Disabled by default. Set `ENABLE_CDP_MODE = False` to use it. Requires `playwright install` and loads `stealth.min.js` for anti-detection. Headless option available via `HEADLESS = True`.

### Changing the Platform / Crawl Config

All user-facing knobs are in `config/base_config.py`:
```
PLATFORM = "xhs"        # Switch platform: xhs | dy | ks | bili | wb | tieba | zhihu
KEYWORDS = "编程,AI"    # Comma-separated search keywords
CRAWLER_TYPE = "search" # search | detail | creator
LOGIN_TYPE = "qrcode"   # qrcode | phone | cookie
SAVE_DATA_OPTION = "jsonl"  # csv | db | json | jsonl | sqlite | excel | postgres | mongodb
```

## Project Architecture

### High-level Structure

```
MediaCrawler/
├── main.py                      # Entry point, CrawlerFactory routes platform codes to crawlers
├── var.py                       # ContextVars for cross-cutting state (keyword, crawler type, etc.)
│
├── base/                        # Abstract base classes defining the plugin contract
│   ├── base_crawler.py          # AbstractCrawler, AbstractLogin, AbstractStore, AbstractApiClient
│   └── __init__.py
│
├── media_platform/              # Platform-specific crawler implementations
│   ├── xhs/                     # Xiaohongshu (reference implementation; other platforms mirror this structure)
│   │   ├── core.py              # Crawler class (start, search, detail, creator flows)
│   │   ├── client.py            # API client (HTTP + Playwright Page for JS signatures)
│   │   ├── login.py             # Login flow (QR code, mobile, cookie)
│   │   ├── field.py             # Enums (search sort types, etc.)
│   │   ├── help.py              # URL parsing, helper functions
│   │   ├── extractor.py         # HTML data extraction
│   │   ├── playwright_sign.py   # JS-based signature generation via Playwright Page
│   │   ├── xhs_sign.py          # Alternative Python-based signature
│   │   └── exception.py         # Platform-specific exceptions
│   ├── douyin/
│   ├── kuaishou/
│   ├── bilibili/
│   ├── weibo/
│   ├── tieba/
│   └── zhihu/
│
├── config/                      # Configuration (Python globals, imported directly)
│   ├── base_config.py           # Global settings (platform, keywords, crawler type, CDP mode, etc.)
│   ├── db_config.py             # Database connection configs (MySQL, Redis, MongoDB, PostgreSQL, SQLite)
│   ├── xhs_config.py            # Per-platform configs (creator lists, specific note URLs, etc.)
│   └── ...                      # Other per-platform configs
│
├── store/                       # Data persistence layer (platform-per-platform)
│   ├── xhs/                     # Xiaohongshu store: XhsStoreFactory, data transformation, per-format implementations
│   │   ├── __init__.py          # Store factory + data transformation into DB dict format
│   │   ├── _store_impl.py       # Abstract store + per-format implementations (CSV, DB, JSON, JSONL, SQLite, MongoDB, Excel)
│   │   └── xhs_store_media.py   # Image/video storage implementations
│   ├── douyin/
│   └── ...                      # Each platform has its own store factory and implementations
│
├── database/                    # Database ORM and session management
│   ├── models.py                # SQLAlchemy models (one table class per platform's content type)
│   ├── db_session.py            # Async engine creation, table creation per DB type
│   ├── db.py                    # Init facade
│   └── mongodb_store_base.py    # MongoDB async store base
│
├── tools/                       # Shared utilities
│   ├── cdp_browser.py           # CDP (Chrome DevTools Protocol) browser manager — preferred launch mode
│   ├── browser_launcher.py      # Browser discovery and process management for CDP mode
│   ├── app_runner.py            # Async app runner with signal handling and graceful shutdown
│   ├── async_file_writer.py     # Async file output + word cloud generation
│   ├── crawler_util.py          # Browser cookie extraction, proxy formatting, user-agent rotation
│   ├── slider_util.py           # Slider CAPTCHA automation
│   ├── time_util.py             # Timestamp utilities
│   ├── user_hash.py             # User ID anonymization + nickname masking (privacy protection)
│   ├── file_header_manager.py   # Copyright header management (used by pre-commit)
│   ├── httpx_util.py            # Shared httpx client configuration
│   ├── easing.py                # Mouse movement easing functions for slider automation
│   └── utils.py                 # Re-exports from crawler_util, slider_util, time_util + logger setup
│
├── proxy/                       # IP proxy infrastructure
│   ├── base_proxy.py            # Abstract proxy provider
│   ├── proxy_ip_pool.py         # Proxy IP pool manager (auto-refresh, validation)
│   ├── proxy_mixin.py           # Mixin for proxy rotation across requests
│   ├── types.py                 # Proxy types
│   └── providers/               # Proxy service providers
│       ├── kuaidl_proxy.py      # KuaiDaiLi
│       ├── wandou_http_proxy.py # WanDou HTTP
│       └── jishu_http_proxy.py  # JiSu HTTP
│
├── cache/                       # Caching layer (Redis or local memory)
│   ├── abs_cache.py             # Abstract cache interface
│   ├── local_cache.py           # In-memory cache implementation
│   ├── redis_cache.py           # Redis cache implementation
│   └── cache_factory.py         # Cache factory
│
├── model/                       # Pydantic models for data validation
│   ├── m_xiaohongshu.py         # Xiaohongshu data models
│   ├── m_douyin.py
│   └── ...
│
├── constant/                    # Platform-specific constants
│
├── cmd_arg/                     # CLI argument parsing
│   ├── arg.py                   # typer-based CLI with platform, login_type, crawler_type options
│   └── __init__.py
│
├── api/                         # FastAPI backend for WebUI
│   ├── main.py                  # FastAPI app setup, CORS, startup event
│   ├── routers/                 # API route handlers
│   ├── schemas/                 # API request/response schemas
│   └── services/                # API business logic
│
├── webui/                       # Vue.js + Vite + Tailwind CSS frontend
│   ├── src/                     # Vue source
│   ├── vite.config.ts           # Vite config with /api proxy
│   └── package.json
│
├── libs/                        # JavaScript assets
│   ├── stealth.min.js           # Playwright stealth plugin (anti-detection)
│   ├── douyin.js                # Douyin signature JS expressions
│   └── zhihu.js                 # Zhihu signature JS expressions
│
├── recv_sms.py                  # SMS forwarding receiver — runs as a standalone callback endpoint
├── test/ tests/                 # Unit tests (test/: older cache/proxy/DB tests; tests/: newer integration tests)
└── pyproject.toml               # Project metadata, dependencies, [tool.uv.index] (Tsinghua PyPI mirror), tool config
```

### Key Architecture Decisions

1. **CDP Mode is the default** (`ENABLE_CDP_MODE = True`). Connects to the user's real Chrome browser via Chrome DevTools Protocol (port 9222), reusing existing cookies, extensions, and browsing context. This provides the best anti-detection. Falls back to standard Playwright mode automatically. See the "Choosing a Browser Mode" section above for setup steps.

2. **No JS reverse engineering**. The project avoids reverse-engineering encrypted API parameters by using a live Playwright browser page to execute JS expressions. The browser context provides the signed parameters directly from the real page environment.

3. **Plugin-per-platform architecture**. Each platform in `media_platform/` follows the same structure:
   - `core.py` — `XxxCrawler(AbstractCrawler)` orchestrating the crawling lifecycle
   - `client.py` — `XxxClient(AbstractApiClient)` making API calls with request signing
   - `login.py` — `XxxLogin(AbstractLogin)` handling authentication (QR code / phone / cookie)
   - JS signature logic lives either in `playwright_sign.py` (via Page) or `xxx_sign.py` (pure Python)
   - `field.py` — Enums (sort types, content types)
   - `help.py` — URL parsing utilities
   - `extractor.py` — HTML data extraction fallback

4. **Store pattern**. The `store/` directory mirrors `media_platform/` — each platform has a `StoreFactory` that returns format-specific store implementations based on `SAVE_DATA_OPTION`. Data is transformed from raw API dicts into the DB-friendly dict format in the store `__init__.py` before being persisted.

5. **Privacy by design**. User IDs are anonymized via `tools.user_hash.anonymize_user_id()`, nicknames are masked via `mask_nickname()`, and creator profile tables have been removed from the ORM to prevent storing personally identifiable information.

6. **Configuration is global**. `config/` modules expose Python module-level globals (e.g., `config.PLATFORM`, `config.KEYWORDS`). They're set once from `base_config.py` + env vars via `db_config.py`, and imported directly where needed. No DI container.

7. **ContextVars for per-request state**. `var.py` uses `ContextVar` for `request_keyword`, `crawler_type`, `source_keyword`, etc., allowing concurrent crawler tasks to maintain their own context.

8. **Chinese output on Windows**. `main.py` forces UTF-8 encoding on stdout/stderr to prevent encoding errors when printing Chinese characters in non-UTF-8 terminals.

9. **Resilience**. API calls use `tenacity` retry decorators throughout the client layer. The `app_runner` in `tools/app_runner.py` handles graceful shutdown on SIGINT/SIGTERM with configurable timeouts.

## Adding a New Platform

Each platform requires implementing the plugin contract in these files:

1. **`media_platform/{name}/`** — Crawler implementation:
   - `core.py` — Class extending `AbstractCrawler` with `start()`, `search()`, `launch_browser()`
   - `client.py` — Class extending `AbstractApiClient` with `request()`, `update_cookies()`
   - `login.py` — Class extending `AbstractLogin` with `login_by_qrcode()`, `login_by_mobile()`, `login_by_cookies()`
   - `field.py` — Platform-specific enums
   - `help.py` — URL parsing helpers
   - `extractor.py` — HTML data extraction (fallback when API fails)
   - `playwright_sign.py` and/or `{name}_sign.py` — Signature generation

2. **`store/{name}/`** — Persistence layer:
   - `__init__.py` — Data transformation functions + StoreFactory mapping format → store implementation
   - `_store_impl.py` — Per-format store classes implementing `AbstractStore`

3. **`database/models.py`** — Add SQLAlchemy ORM models for the platform's content types

4. **`model/m_{name}.py`** — Pydantic models for API response validation

5. **`config/{name}_config.py`** — Platform-specific settings (creator URLs, note URL lists, etc.)

6. **`constant/{name}.py`** — Platform-specific constants (API endpoints, regex patterns)

7. **Register in `main.py`** — Add entry to `CrawlerFactory.CRAWLERS` dict

## Data Storage

- **Path.** By default, data files are saved under the project root. Override with `SAVE_DATA_PATH` in `config/base_config.py`.
- **Formats.** Controlled by `SAVE_DATA_OPTION`: `csv`, `json`, `jsonl`, `excel`, `sqlite`, `db` (MySQL), `postgres`, `mongodb`.
- **Deduplication.** Only `db`/`sqlite`/`postgres` storage modes provide deduplication (via SQLAlchemy ORM unique indexes). File-based formats (csv/json/jsonl) append every crawl run.
- **Excel flush.** When using Excel mode, `save_data_to_excel` buffers in memory; `ExcelStoreBase.flush_all()` is called automatically at the end of `main.py`.
- **Media files.** Downloaded images/videos are stored in platform-specific subdirectories under `data/` (or `SAVE_DATA_PATH`).

### Configuration Flow

- `config/base_config.py` contains the primary user-facing settings (platform, keywords, login type, crawler type, CDP settings, data format, rate limits)
- It imports all per-platform config files (`xhs_config.py`, `dy_config.py`, etc.) which add platform-specific settings
- `config/db_config.py` reads database credentials from environment variables (falling back to defaults via `os.getenv`)
- `.env.example` documents all supported env vars (MySQL, Redis, MongoDB, PostgreSQL, proxy credentials)

### Data Flow

1. CLI args → parsed by `cmd_arg/arg.py` → set globals in `config` module
2. `main.py` → `CrawlerFactory.create_crawler(platform)` → platform `XxxCrawler().start()`
3. Crawler launches/connects to browser (CDP or standard Playwright)
4. If no valid login → `XxxLogin().begin()` (QR code / phone / cookie)
5. Based on `CRAWLER_TYPE`:
   - `search`: iterate keywords & pages → fetch note lists → get details → fetch comments
   - `detail`: fetch specific note IDs → get details → fetch comments
   - `creator`: enumerate creator URLs → list notes → get details → fetch comments
6. Each note/comment is transformed in the platform's store module (`store/{platform}/__init__.py`) and persisted via `StoreFactory` into the format chosen by `SAVE_DATA_OPTION`
7. Optionally: download media files (images/video), generate comment word clouds, flush Excel buffers
