import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Terminal, Database, Activity, X,
} from 'lucide-react'
import { Terminal as TerminalPanel } from '@/components/console/Terminal'
import { DataExplorer } from '@/components/data/DataExplorer'
import { StatsOverview } from '@/components/stats/StatsOverview'
import { useCrawlerStore } from '@/store/crawlerStore'
import type { TabId } from '@/App'

interface BottomPanelProps {
  open: boolean
  onToggle: () => void
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

interface TabEntry {
  id: TabId
  icon: React.ReactNode
  labelKey: string
}

export function BottomPanel({ open, onToggle, activeTab, onTabChange }: BottomPanelProps) {
  const { t } = useTranslation()
  const status = useCrawlerStore((state) => state.status)
  const isRunning = status === 'running'
  const [panelHeight, setPanelHeight] = useState(50) // percentage
  const isDragging = useRef(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const tabs: TabEntry[] = [
    {
      id: 'console',
      icon: isRunning
        ? <span className="w-3.5 h-3.5 flex items-center justify-center"><span className="w-2 h-2 bg-cyber-neon-green rounded-full shadow-glow-green-sm animate-pulse-fast" /></span>
        : <Terminal className="w-3.5 h-3.5" />,
      labelKey: 'tab.console',
    },
    { id: 'data', icon: <Database className="w-3.5 h-3.5" />, labelKey: 'tab.data' },
    { id: 'stats', icon: <Activity className="w-3.5 h-3.5" />, labelKey: 'tab.stats' },
  ]

  // Handle drag resize
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isDragging.current = true
    document.body.style.cursor = 'row-resize'
    document.body.style.userSelect = 'none'
  }, [])

  useEffect(() => {
    if (!open) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return
      const viewportH = window.innerHeight
      const newHeightPx = viewportH - e.clientY
      const newHeightPercent = Math.round((newHeightPx / viewportH) * 100)
      setPanelHeight(Math.max(15, Math.min(85, newHeightPercent)))
    }

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div
      ref={panelRef}
      className="flex-shrink-0 flex flex-col border-t border-cyber-border-DEFAULT bg-cyber-bg-primary"
      style={{ height: `${panelHeight}vh` }}
    >
      {/* Drag Handle */}
      <div
        onMouseDown={handleMouseDown}
        className="flex-shrink-0 h-5 flex items-center justify-center cursor-row-resize hover:bg-cyber-neon-cyan/5 group transition-colors"
      >
        <div className="w-10 h-1 rounded-full bg-cyber-border-default group-hover:bg-cyber-neon-cyan/50 transition-colors" />
      </div>

      {/* Tab Bar with buttons */}
      <div className="flex-shrink-0 flex items-center justify-between px-3 border-b border-cyber-border-subtle bg-cyber-bg-secondary/30">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-2 text-xs font-mono rounded-t-md transition-all -mb-px border border-b-0
                  ${isActive
                    ? 'bg-cyber-bg-panel border-cyber-border-DEFAULT text-cyber-neon-cyan'
                    : 'border-transparent text-cyber-text-muted hover:text-cyber-text-secondary hover:bg-cyber-bg-tertiary/50'
                  }
                `}
              >
                {tab.icon}
                {t(tab.labelKey)}
              </button>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onToggle}
            className="flex items-center gap-1 px-2 py-1.5 text-xs font-mono text-cyber-text-muted hover:text-cyber-neon-pink hover:bg-cyber-neon-pink/5 rounded transition-all"
            title="关闭面板"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'console' && (
          <div className="h-full p-3">
            <TerminalPanel />
          </div>
        )}
        {activeTab === 'data' && (
          <div className="h-full p-3 overflow-y-auto">
            <DataExplorer />
          </div>
        )}
        {activeTab === 'stats' && (
          <div className="h-full p-3 overflow-y-auto">
            <StatsOverview />
          </div>
        )}
      </div>
    </div>
  )
}
