import type { ComponentType, ReactNode, KeyboardEvent } from 'react'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Database, Globe, KeyRound, MessageSquare, Play, Square, X, Settings2, Chrome, QrCode, Smartphone, Cookie } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { useCrawlerStore } from '@/store/crawlerStore'
import { usePlatforms, useConfigOptions, useStartCrawler, useStopCrawler } from '@/hooks/useCrawler'
import { ParsedIdList } from './ParsedIdList'
import { ConfigPresets } from './ConfigPresets'

type SectionProps = {
  title: string
  description: string
  icon: ComponentType<{ className?: string }>
  children: ReactNode
  className?: string
}

function Section({ title, description, icon: Icon, children, className = '' }: SectionProps) {
  return (
    <section className={`rounded-lg glass-panel float-panel overflow-hidden ${className}`}>
      <header className="px-4 py-3 border-b border-cyber-border-subtle/50 flex items-center gap-3 bg-cyber-bg-tertiary/30">
        <div className="h-8 w-8 rounded-md bg-cyber-bg-tertiary border border-cyber-border-subtle flex items-center justify-center flex-shrink-0">
          <Icon className="h-4 w-4 text-cyber-neon-cyan" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-mono font-bold text-cyber-text-primary tracking-wide">
            {title}
          </div>
          <div className="text-sm text-cyber-text-muted leading-snug truncate">
            {description}
          </div>
        </div>
      </header>
      <div className="p-4 space-y-4">
        {children}
      </div>
    </section>
  )
}

type FieldProps = {
  label: string
  hint?: string
  children: ReactNode
}

function Field({ label, hint, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <div className="space-y-0.5">
        <Label className="text-sm text-cyber-text-secondary font-mono font-medium">
          {label}
        </Label>
        {hint ? (
          <p className="text-sm text-cyber-text-muted leading-snug">
            {hint}
          </p>
        ) : null}
      </div>
      {children}
    </div>
  )
}

type KeywordInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

function KeywordInput({ value, onChange, placeholder, disabled }: KeywordInputProps) {
  const [inputValue, setInputValue] = useState('')

  // 将逗号分隔的字符串转换为数组
  const keywords = value ? value.split(',').map((k) => k.trim()).filter(Boolean) : []

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const trimmed = inputValue.trim()
      if (trimmed && !keywords.includes(trimmed)) {
        const newKeywords = [...keywords, trimmed]
        onChange(newKeywords.join(','))
        setInputValue('')
      }
    }
  }

  const removeKeyword = (keywordToRemove: string) => {
    const newKeywords = keywords.filter((k) => k !== keywordToRemove)
    onChange(newKeywords.join(','))
  }

  return (
    <div className="space-y-2">
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="h-10 text-sm"
      />
      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {keywords.map((keyword) => (
            <span
              key={keyword}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-cyber-neon-cyan/10 border border-cyber-neon-cyan/30 text-cyber-neon-cyan text-sm font-mono"
            >
              {keyword}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeKeyword(keyword)}
                  className="hover:text-cyber-neon-pink transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export function CrawlerConfigPanel() {
  const { t } = useTranslation('config')
  const config = useCrawlerStore((state) => state.config)
  const updateConfig = useCrawlerStore((state) => state.updateConfig)
  const status = useCrawlerStore((state) => state.status)

  const { data: platforms } = usePlatforms()
  const { data: options } = useConfigOptions()
  const { mutate: startCrawler, isPending: isStarting } = useStartCrawler()
  const { mutate: stopCrawler, isPending: isStopping } = useStopCrawler()

  const isDisabled = status === 'running' || status === 'stopping'
  const isRunning = status === 'running'
  const isBusy = isStarting || isStopping || status === 'stopping'

  // ===== Per-platform login recommendations =====
  // Best login method for each platform
  const platformLoginDefaults: Record<string, string> = {
    xhs: 'qrcode',    // 小红书：扫码登录最稳定
    dy: 'qrcode',     // 抖音：扫码登录
    ks: 'qrcode',     // 快手：扫码登录
    bili: 'qrcode',   // B站：扫码登录
    wb: 'cookie',     // 微博：Cookie登录最方便
    tieba: 'cookie',  // 贴吧：Cookie登录
    zhihu: 'cookie',  // 知乎：Cookie登录
  }

  // All supported login methods per platform
  const platformLoginMethods: Record<string, string[]> = {
    xhs: ['qrcode', 'cookie'],
    dy: ['qrcode', 'phone', 'cookie'],
    ks: ['qrcode', 'cookie'],
    bili: ['qrcode', 'phone', 'cookie'],
    wb: ['cookie'],
    tieba: ['cookie'],
    zhihu: ['cookie'],
  }

  // Auto-select recommended login method when platform changes
  useEffect(() => {
    const recommended = platformLoginDefaults[config.platform]
    const allowed = platformLoginMethods[config.platform] || []
    // If current login type isn't allowed for this platform, switch to recommended
    if (!allowed.includes(config.login_type) && recommended) {
      updateConfig({ login_type: recommended })
    }
  }, [config.platform])

  // ===== Login guidance text per method+platform =====
  const getLoginGuidance = (): { icon: React.ReactNode; title: string; steps: string[]; color: string } | null => {
    if (config.login_type === 'qrcode') {
      return {
        icon: <QrCode className="w-4 h-4" />,
        title: t('loginGuide.qrcode.title'),
        steps: [
          t('loginGuide.qrcode.step1'),
          t('loginGuide.qrcode.step2'),
          t('loginGuide.qrcode.step3'),
        ],
        color: 'border-cyber-neon-cyan/30 bg-cyber-neon-cyan/5 text-cyber-neon-cyan',
      }
    }
    if (config.login_type === 'phone') {
      return {
        icon: <Smartphone className="w-4 h-4" />,
        title: t('loginGuide.phone.title'),
        steps: [
          t('loginGuide.phone.step1'),
          t('loginGuide.phone.step2'),
          t('loginGuide.phone.step3'),
        ],
        color: 'border-cyber-neon-purple/30 bg-cyber-neon-purple/5 text-cyber-neon-purple',
      }
    }
    if (config.login_type === 'cookie') {
      const platformCookieGuides: Record<string, { steps: string[] }> = {
        xhs: {
          steps: [
            t('loginGuide.cookie.commonStep1'),
            t('loginGuide.cookie.xhsStep2'),
            t('loginGuide.cookie.commonStep3'),
            t('loginGuide.cookie.commonStep4'),
          ],
        },
        dy: {
          steps: [
            t('loginGuide.cookie.commonStep1'),
            t('loginGuide.cookie.dyStep2'),
            t('loginGuide.cookie.commonStep3'),
            t('loginGuide.cookie.commonStep4'),
          ],
        },
        wb: {
          steps: [
            t('loginGuide.cookie.commonStep1'),
            t('loginGuide.cookie.wbStep2'),
            t('loginGuide.cookie.commonStep3'),
            t('loginGuide.cookie.commonStep4'),
          ],
        },
      }
      const guide = platformCookieGuides[config.platform] || {
        steps: [
          t('loginGuide.cookie.commonStep1'),
          t('loginGuide.cookie.defaultStep2'),
          t('loginGuide.cookie.commonStep3'),
          t('loginGuide.cookie.commonStep4'),
        ],
      }
      return {
        icon: <Cookie className="w-4 h-4" />,
        title: t('loginGuide.cookie.title'),
        steps: guide.steps,
        color: 'border-cyber-neon-orange/30 bg-cyber-neon-orange/5 text-cyber-neon-orange',
      }
    }
    return null
  }

  const loginGuide = getLoginGuidance()

  // Extract URLs from mixed text (e.g., Douyin share text with Chinese + URL)
  const extractUrls = (text: string): string => {
    if (!text.trim()) return text
    // Match http/https URLs in text
    const urlRegex = /https?:\/\/[^\s一-鿿]+/g
    const urls = text.match(urlRegex)
    if (urls && urls.length > 0) {
      return urls.join('\n')
    }
    // Also try to extract douyin short links (v.douyin.com/xxx)
    const shortLinkRegex = /v\.douyin\.com\/[a-zA-Z0-9_-]+/g
    const shorts = text.match(shortLinkRegex)
    if (shorts && shorts.length > 0) {
      return shorts.map(s => `https://${s}`).join('\n')
    }
    // If no URLs found, return as-is (might be a plain ID)
    return text.trim()
  }

  const handleStart = () => {
    // Clean specified_ids and creator_ids: extract pure URLs from mixed text
    const cleanConfig = {
      ...config,
      specified_ids: extractUrls(config.specified_ids),
      creator_ids: extractUrls(config.creator_ids),
    }
    startCrawler(cleanConfig)
  }

  const handleStop = () => {
    stopCrawler()
  }

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Row 1: Three Config Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Column 1: Target & Mode Section */}
        <Section
          title={t('section.targetMatrix.title')}
          description={t('section.targetMatrix.description')}
          icon={Globe}
        >
          <Field label={t('field.platform')}>
            <Select
              value={config.platform}
              onValueChange={(value) => updateConfig({ platform: value })}
              disabled={isDisabled}
            >
              <SelectTrigger className="h-10 text-sm">
                <SelectValue placeholder={t('field.platformPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {platforms?.map((platform) => (
                  <SelectItem key={platform.value} value={platform.value}>
                    {platform.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t('field.crawlType')}>
              <Select
                value={config.crawler_type}
                onValueChange={(value) => updateConfig({ crawler_type: value })}
                disabled={isDisabled}
              >
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder={t('field.crawlTypePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {options?.crawler_types.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label={t('field.startPage')}>
              <Input
                type="number"
                min={1}
                value={config.start_page}
                onChange={(e) => updateConfig({ start_page: parseInt(e.target.value) || 1 })}
                disabled={isDisabled}
                className="h-10 text-sm"
              />
            </Field>
          </div>

          {/* 根据爬虫类型显示不同的输入框 */}
          {config.crawler_type === 'search' && (
            <Field label={t('field.keywords')} hint={t('field.keywordsHint')}>
              <KeywordInput
                placeholder={t('field.keywordsPlaceholder')}
                value={config.keywords}
                onChange={(keywords) => updateConfig({ keywords })}
                disabled={isDisabled}
              />
            </Field>
          )}

          {config.crawler_type === 'detail' && (
            <Field label={t('field.specifiedIds')} hint={t('field.specifiedIdsHint')}>
              <textarea
                value={config.specified_ids}
                onChange={(e) => updateConfig({ specified_ids: e.target.value })}
                disabled={isDisabled}
                placeholder={t(`field.specifiedIdsPlaceholder.${config.platform}`, t('field.specifiedIdsPlaceholder.default'))}
                className="min-h-[60px] w-full rounded-md border border-cyber-border-DEFAULT bg-cyber-bg-tertiary px-3 py-2 text-sm font-mono text-cyber-text-primary placeholder:text-cyber-text-muted focus-visible:outline-none focus-visible:border-cyber-neon-cyan/50 focus-visible:shadow-cyber-soft disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none"
              />
              <ParsedIdList
                value={config.specified_ids}
                platform={config.platform}
                type="detail"
                disabled={isDisabled}
              />
              {config.platform === 'xhs' && (
                <div className="mt-2 rounded-lg border border-cyber-neon-orange/30 bg-cyber-neon-orange/5 p-3 text-sm leading-snug text-cyber-neon-orange font-mono">
                  {t('warning.xhsToken')}
                </div>
              )}
            </Field>
          )}

          {config.crawler_type === 'creator' && (
            <Field label={t('field.creatorIds')} hint={t('field.creatorIdsHint')}>
              <textarea
                value={config.creator_ids}
                onChange={(e) => updateConfig({ creator_ids: e.target.value })}
                disabled={isDisabled}
                placeholder={t(`field.creatorIdsPlaceholder.${config.platform}`, t('field.creatorIdsPlaceholder.default'))}
                className="min-h-[60px] w-full rounded-md border border-cyber-border-DEFAULT bg-cyber-bg-tertiary px-3 py-2 text-sm font-mono text-cyber-text-primary placeholder:text-cyber-text-muted focus-visible:outline-none focus-visible:border-cyber-neon-cyan/50 focus-visible:shadow-cyber-soft disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none"
              />
              <ParsedIdList
                value={config.creator_ids}
                platform={config.platform}
                type="creator"
                disabled={isDisabled}
              />
              {config.platform === 'xhs' && (
                <div className="mt-2 rounded-lg border border-cyber-neon-orange/30 bg-cyber-neon-orange/5 p-2 text-[11px] leading-snug text-cyber-neon-orange font-mono">
                  {t('warning.xhsToken')}
                </div>
              )}
            </Field>
          )}
        </Section>

        {/* Column 2: Authentication Section */}
        <Section
          title={t('section.authMatrix.title')}
          description={t('section.authMatrix.description')}
          icon={KeyRound}
        >
          <Field label={t('field.loginMethod')}>
            <Select
              value={config.login_type}
              onValueChange={(value) => updateConfig({ login_type: value })}
              disabled={isDisabled}
            >
              <SelectTrigger className="h-10 text-sm">
                <SelectValue placeholder={t('field.loginMethodPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {options?.login_types
                  .filter((opt) => {
                    const allowed = platformLoginMethods[config.platform]
                    return !allowed || allowed.includes(opt.value)
                  })
                  .map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Login Guidance - shows contextual help based on selected method */}
          {loginGuide && (
            <div className={`rounded-lg border-2 p-4 space-y-3 ${loginGuide.color}`}>
              <div className="flex items-center gap-2 text-sm font-mono font-bold">
                {loginGuide.icon}
                {loginGuide.title}
              </div>
              <ol className="space-y-1.5 text-sm font-mono leading-relaxed opacity-90">
                {loginGuide.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="flex-shrink-0 font-bold min-w-[1.2em]">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Cookie textarea - only when cookie login is selected */}
          {config.login_type === 'cookie' ? (
            <Field label={t('field.cookies')} hint={t('field.cookiesHint')}>
              <textarea
                value={config.cookies}
                onChange={(e) => updateConfig({ cookies: e.target.value })}
                disabled={isDisabled}
                placeholder={t('field.cookiesPlaceholder')}
                className="min-h-[80px] w-full rounded-md border border-cyber-border-DEFAULT bg-cyber-bg-tertiary px-3 py-2 text-sm font-mono text-cyber-text-primary placeholder:text-cyber-text-muted focus-visible:outline-none focus-visible:border-cyber-neon-cyan/50 focus-visible:shadow-cyber-soft disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none"
              />
            </Field>
          ) : null}

          {config.login_type === 'cookie' && (config.platform === 'xhs' || config.platform === 'dy') ? (
            <div className="rounded-lg border border-cyber-neon-orange/30 bg-cyber-neon-orange/5 p-3 text-sm leading-snug text-cyber-neon-orange font-mono">
              {t('warning.cookieSlider')}
            </div>
          ) : null}
        </Section>

        {/* Column 3: Output & Runtime Section */}
        <Section
          title={t('section.outputConfig.title')}
          description={t('section.outputConfig.description')}
          icon={Database}
        >
          <Field label={t('field.saveFormat')}>
            <Select
              value={config.save_option}
              onValueChange={(value) => updateConfig({ save_option: value })}
              disabled={isDisabled}
            >
              <SelectTrigger className="h-10 text-sm">
                <SelectValue placeholder={t('field.saveFormatPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {options?.save_options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-lg border border-cyber-border-subtle bg-cyber-bg-tertiary/30 p-2.5 hover:border-cyber-border-DEFAULT transition-colors">
              <Checkbox
                checked={config.enable_comments}
                onCheckedChange={(checked) => {
                  const isChecked = checked === true
                  updateConfig({
                    enable_comments: isChecked,
                    enable_sub_comments: isChecked ? config.enable_sub_comments : false,
                  })
                }}
                disabled={isDisabled}
              />
              <div className="flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-cyber-text-secondary" />
                <p className="text-sm font-mono text-cyber-text-primary">{t('field.commentExtraction')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-cyber-border-subtle bg-cyber-bg-tertiary/30 p-2.5 hover:border-cyber-border-DEFAULT transition-colors">
              <Checkbox
                checked={config.enable_sub_comments}
                onCheckedChange={(checked) => updateConfig({ enable_sub_comments: checked === true })}
                disabled={isDisabled || !config.enable_comments}
              />
              <p className="text-sm font-mono text-cyber-text-primary">{t('field.subComments')}</p>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-cyber-border-subtle bg-cyber-bg-tertiary/30 p-2.5 hover:border-cyber-border-DEFAULT transition-colors">
              <Checkbox
                checked={config.headless}
                onCheckedChange={(checked) => updateConfig({ headless: checked === true })}
                disabled={isDisabled}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-mono text-cyber-text-primary">{t('field.headlessMode')}</p>
                <p className="text-[11px] text-cyber-text-muted leading-snug">
                  {t('field.headlessModeHint')}
                </p>
              </div>
            </div>
          </div>

          {/* Advanced: Max Notes & Comments - only show when relevant */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-cyber-border-subtle">
            <Field label={t('field.maxNotes')}>
              <Input
                type="number"
                min={1}
                max={10000}
                placeholder={t('field.maxNotesPlaceholder')}
                value={config.max_notes_count ?? ''}
                onChange={(e) => updateConfig({
                  max_notes_count: e.target.value ? parseInt(e.target.value) || 15 : null
                })}
                disabled={isDisabled}
                className="h-10 text-sm"
              />
            </Field>
            <Field label={t('field.maxComments')}>
              <Input
                type="number"
                min={1}
                max={10000}
                placeholder={t('field.maxCommentsPlaceholder')}
                value={config.max_comments_count ?? ''}
                onChange={(e) => updateConfig({
                  max_comments_count: e.target.value ? parseInt(e.target.value) || 10 : null
                })}
                disabled={isDisabled || !config.enable_comments}
                className="h-10 text-sm"
              />
            </Field>
          </div>
        </Section>
      </div>

      {/* Row 2: CDP Prerequisites + Auto-launch toggle */}
      <div className="w-full">
        <div className="rounded-lg border-2 border-cyber-neon-cyan/30 bg-cyber-neon-cyan/[0.08] p-4">
          <div className="flex items-start gap-3">
            <Chrome className="w-6 h-6 text-cyber-neon-cyan flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-3 text-sm font-mono text-cyber-text-secondary">
              <p className="font-bold text-cyber-neon-cyan text-base">{t('prerequisites.title')}</p>
              <p className="text-cyber-text-primary">{t('prerequisites.cdpRequired')}</p>
              <ol className="space-y-1.5 list-decimal list-inside text-cyber-text-primary leading-relaxed">
                <li>{t('prerequisites.step1')}</li>
                <li className="break-all">{t('prerequisites.step2')}</li>
                <li>{t('prerequisites.step3')}</li>
                <li>{t('prerequisites.step4')}</li>
              </ol>

              {/* Auto-launch toggle */}
              <div className="flex items-center gap-3 rounded-lg border border-cyber-neon-cyan/20 bg-cyber-bg-tertiary/50 p-3 mt-3 hover:border-cyber-neon-cyan/40 transition-colors">
                <Checkbox
                  checked={config.cdp_auto_launch}
                  onCheckedChange={(checked) => updateConfig({ cdp_auto_launch: checked === true })}
                  disabled={isDisabled}
                  id="cdp-auto-launch"
                />
                <label htmlFor="cdp-auto-launch" className="flex-1 cursor-pointer">
                  <p className="text-sm font-mono font-semibold text-cyber-neon-cyan">
                    🚀 {t('prerequisites.autoLaunch')}
                  </p>
                  <p className="text-xs text-cyber-text-muted mt-0.5">
                    {t('prerequisites.autoLaunchHint')}
                  </p>
                </label>
              </div>

              <p className="text-cyber-neon-cyan/70 text-sm pt-2 border-t border-cyber-neon-cyan/10 mt-3">
                ⓘ {t('prerequisites.note')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Action Bar - Config Presets + Start/Stop */}
      <div className="w-full space-y-2">
        {/* Top bar: Config presets on the right */}
        <div className="flex items-center justify-end gap-2">
          <ConfigPresets />
          <Button
            variant="ghost"
            size="sm"
            disabled={isDisabled}
            onClick={() => updateConfig({
              platform: 'bili',
              login_type: 'qrcode',
              crawler_type: 'search',
              keywords: '',
              specified_ids: '',
              creator_ids: '',
              start_page: 1,
              enable_comments: true,
              enable_sub_comments: false,
              save_option: 'json',
              cookies: '',
              headless: false,
              max_notes_count: null,
              max_comments_count: null,
              cdp_auto_launch: false,
            })}
            className="h-8 text-sm font-mono text-cyber-text-muted hover:text-cyber-neon-cyan"
          >
            <Settings2 className="w-3.5 h-3.5 mr-1" />
            {t('button.reset')}
          </Button>
        </div>

        {/* Start/Stop Button */}
        {isRunning ? (
          <Button
            onClick={handleStop}
            disabled={isBusy}
            className="w-full h-12 bg-cyber-neon-pink text-white font-mono font-bold text-sm tracking-wider hover:bg-cyber-neon-pink/90 hover:shadow-glow-pink-sm transition-all"
          >
            <Square className="w-4 h-4" />
            {isStopping ? t('button.stopping') : t('button.terminate')}
          </Button>
        ) : (
          <Button
            onClick={handleStart}
            disabled={isBusy}
            className="w-full h-12 bg-cyber-neon-cyan text-cyber-bg-primary font-mono font-bold text-sm tracking-wider hover:bg-cyber-neon-cyan/90 hover:shadow-glow-cyan-sm transition-all"
          >
            <Play className="w-4 h-4" />
            {isStarting ? t('button.initiating') : t('button.initiateScan')}
          </Button>
        )}
      </div>
    </div>
  )
}
