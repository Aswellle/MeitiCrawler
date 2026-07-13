import { useState, useCallback, useEffect, useRef } from 'react'
import { Toaster } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Terminal, Database, Activity } from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomPanel } from '@/components/layout/BottomPanel'
import { CrawlerConfigPanel } from '@/components/config/CrawlerConfigPanel'
import { EnvironmentCheck, isEnvChecked } from '@/components/env/EnvironmentCheck'
import { LicenseDisclaimer, isLicenseAccepted } from '@/components/license/LicenseDisclaimer'
import { useLogWebSocket } from '@/hooks/useWebSocket'
import { useStatusWebSocket } from '@/hooks/useStatusWebSocket'
import { useCrawlerStore } from '@/store/crawlerStore'

export type TabId = 'console' | 'data' | 'stats'

function App() {
  const { t } = useTranslation()
  const [licenseAccepted, setLicenseAccepted] = useState(() => isLicenseAccepted())
  const [envChecked, setEnvChecked] = useState(() => isEnvChecked())
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('console')
  const [panelOpen, setPanelOpen] = useState(false)

  useLogWebSocket()
  useStatusWebSocket()

  const handleEnvCheckComplete = () => setEnvChecked(true)
  const handleLicenseAccept = () => { setLicenseAccepted(true); setShowDisclaimer(false) }
  const handleShowDisclaimer = () => setShowDisclaimer(true)

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab)
    if (!panelOpen) setPanelOpen(true)
  }, [panelOpen])

  const status = useCrawlerStore((s) => s.status)
  const isRunning = status === 'running'

  // Auto-open bottom panel when crawler starts running
  const prevStatusRef = useRef(status)
  useEffect(() => {
    const prev = prevStatusRef.current
    prevStatusRef.current = status
    if (prev !== 'running' && status === 'running') {
      setPanelOpen(true)
      setActiveTab('console')
    }
  }, [status])

  const tabs = [
    { id: 'console' as TabId, icon: isRunning
      ? <span className="w-3.5 h-3.5 flex items-center justify-center"><span className="w-2 h-2 bg-cyber-neon-green rounded-full shadow-glow-green-sm animate-pulse-fast" /></span>
      : <Terminal className="w-3.5 h-3.5" />, label: t('tab.console') },
    { id: 'data' as TabId, icon: <Database className="w-3.5 h-3.5" />, label: t('tab.data') },
    { id: 'stats' as TabId, icon: <Activity className="w-3.5 h-3.5" />, label: t('tab.stats') },
  ]

  return (
    <div className="flex flex-col h-screen cyber-grid overflow-hidden relative">
      {(!licenseAccepted || showDisclaimer) && (
        <LicenseDisclaimer onAccept={handleLicenseAccept} />
      )}
      {licenseAccepted && !showDisclaimer && !envChecked && (
        <EnvironmentCheck onCheckComplete={handleEnvCheckComplete} />
      )}

      <Sidebar onShowDisclaimer={handleShowDisclaimer} />

      {/* Main Body */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Config Panel */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4 pb-0">
            <CrawlerConfigPanel />
          </div>

          {/* Floating Tab Bar — always visible, triggers bottom panel */}
          {!panelOpen && (
            <div className="flex items-center gap-1 px-4 py-3 border-t border-cyber-border-subtle mt-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    flex items-center gap-1.5 px-4 py-2 text-xs font-mono rounded-md transition-all
                    ${activeTab === tab.id
                      ? 'bg-cyber-neon-cyan/15 text-cyber-neon-cyan border border-cyber-neon-cyan/30'
                      : 'text-cyber-text-muted hover:text-cyber-text-secondary border border-transparent hover:border-cyber-border-DEFAULT hover:bg-cyber-bg-tertiary/50'
                    }
                  `}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
              <div className="flex-1" />
              <span className="text-[10px] font-mono text-cyber-text-muted">
                {t('tab.openHint')}
              </span>
            </div>
          )}
        </div>

        {/* Bottom Panel */}
        <BottomPanel
          open={panelOpen}
          onToggle={() => setPanelOpen(!panelOpen)}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          className: 'glass-panel font-mono text-cyber-text-primary',
          style: { fontFamily: 'JetBrains Mono, monospace' },
        }}
      />
    </div>
  )
}

export default App
