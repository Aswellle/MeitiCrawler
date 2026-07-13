import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Save, Check, Copy, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCrawlerStore } from '@/store/crawlerStore'
import type { CrawlerConfig } from '@/types/crawler'

const SAVED_CONFIGS_KEY = 'mediacrawler_saved_configs'

interface SavedConfig {
  name: string
  config: CrawlerConfig
  timestamp: number
}

function getSavedConfigs(): SavedConfig[] {
  try {
    const stored = localStorage.getItem(SAVED_CONFIGS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveConfigToStore(name: string, config: CrawlerConfig) {
  const configs = getSavedConfigs()
  // Remove existing with same name
  const filtered = configs.filter(c => c.name !== name)
  filtered.push({ name, config: { ...config }, timestamp: Date.now() })
  localStorage.setItem(SAVED_CONFIGS_KEY, JSON.stringify(filtered))
}

function deleteConfigFromStore(name: string) {
  const configs = getSavedConfigs()
  localStorage.setItem(SAVED_CONFIGS_KEY, JSON.stringify(configs.filter(c => c.name !== name)))
}

export function ConfigPresets() {
  const { t } = useTranslation('config')
  const config = useCrawlerStore((state) => state.config)
  const updateConfig = useCrawlerStore((state) => state.updateConfig)
  const [showPanel, setShowPanel] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>(() => getSavedConfigs())
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

  const refreshConfigs = useCallback(() => {
    setSavedConfigs(getSavedConfigs())
  }, [])

  const handleSave = () => {
    if (!saveName.trim()) return
    saveConfigToStore(saveName.trim(), config)
    setSaveName('')
    setSaved(true)
    refreshConfigs()
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLoad = (saved: SavedConfig) => {
    updateConfig(saved.config)
    setShowPanel(false)
  }

  const handleDelete = (name: string) => {
    deleteConfigFromStore(name)
    refreshConfigs()
  }

  const handleCopyConfig = () => {
    const json = JSON.stringify(config, null, 2)
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleExportConfig = () => {
    const json = JSON.stringify(config, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `crawler-config-${config.platform}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const status = useCrawlerStore((state) => state.status)
  const isDisabled = status === 'running' || status === 'stopping'

  return (
    <div className="relative">
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        disabled={isDisabled}
        onClick={() => setShowPanel(!showPanel)}
        className="h-8 text-xs font-mono"
      >
        <Save className="w-3.5 h-3.5 mr-1" />
        {t('presets.label')}
      </Button>

      {showPanel && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setShowPanel(false)} />

          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 z-50 rounded-lg border border-cyber-border-DEFAULT bg-cyber-bg-panel shadow-cyber-card">
            <div className="p-3 space-y-3">
              <h3 className="text-xs font-mono font-semibold text-cyber-neon-cyan">
                {t('presets.saveConfig')}
              </h3>

              {/* Save Current Config */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  placeholder={t('presets.namePlaceholder')}
                  className="flex-1 h-8 rounded-md border border-cyber-border-DEFAULT bg-cyber-bg-tertiary px-2 text-xs font-mono text-cyber-text-primary placeholder:text-cyber-text-muted focus-visible:outline-none focus-visible:border-cyber-neon-cyan/50"
                />
                <Button
                  variant="glow"
                  size="sm"
                  disabled={!saveName.trim()}
                  onClick={handleSave}
                  className="h-8 text-xs font-mono"
                >
                  {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyConfig}
                  className="flex-1 h-7 text-[10px] font-mono"
                >
                  {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  {t('presets.copy')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportConfig}
                  className="flex-1 h-7 text-[10px] font-mono"
                >
                  <Download className="w-3 h-3 mr-1" />
                  {t('presets.export')}
                </Button>
              </div>

              {/* Saved Configs List */}
              {savedConfigs.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-cyber-border-subtle">
                  <h4 className="text-[10px] font-mono text-cyber-text-muted">
                    {t('presets.savedList')}
                  </h4>
                  {savedConfigs.map((saved) => (
                    <div
                      key={saved.name}
                      className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-cyber-bg-tertiary group transition-colors"
                    >
                      <button
                        onClick={() => handleLoad(saved)}
                        className="flex-1 text-left min-w-0"
                      >
                        <div className="text-xs font-mono text-cyber-text-primary truncate">
                          {saved.name}
                        </div>
                        <div className="text-[9px] font-mono text-cyber-text-muted">
                          {saved.config.platform} · {saved.config.crawler_type}
                        </div>
                      </button>
                      <button
                        onClick={() => handleDelete(saved.name)}
                        className="opacity-0 group-hover:opacity-100 text-cyber-text-muted hover:text-cyber-neon-pink transition-all text-xs font-mono px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {savedConfigs.length === 0 && (
                <p className="text-[10px] text-cyber-text-muted font-mono text-center py-2">
                  {t('presets.noSaved')}
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
