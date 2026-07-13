import { useTranslation } from 'react-i18next'
import { Activity, Globe, FileText, MessageSquare, Clock, ArrowUp } from 'lucide-react'
import { useCrawlerStore } from '@/store/crawlerStore'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  color: 'cyan' | 'pink' | 'green' | 'orange' | 'purple'
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorMap = {
    cyan: 'border-cyber-neon-cyan/30 bg-cyber-neon-cyan/5 text-cyber-neon-cyan',
    pink: 'border-cyber-neon-pink/30 bg-cyber-neon-pink/5 text-cyber-neon-pink',
    green: 'border-cyber-neon-green/30 bg-cyber-neon-green/5 text-cyber-neon-green',
    orange: 'border-cyber-neon-orange/30 bg-cyber-neon-orange/5 text-cyber-neon-orange',
    purple: 'border-cyber-neon-purple/30 bg-cyber-neon-purple/5 text-cyber-neon-purple',
  }

  return (
    <div className={`flex items-center gap-3 rounded-lg border p-3 ${colorMap[color]}`}>
      <div className="flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="text-[10px] font-mono opacity-70 truncate">{label}</div>
        <div className="text-sm font-mono font-bold truncate">{value}</div>
      </div>
    </div>
  )
}

export function StatusDashboard() {
  const { t } = useTranslation()
  const platform = useCrawlerStore((state) => state.platform)
  const crawlerType = useCrawlerStore((state) => state.crawlerType)
  const startedAt = useCrawlerStore((state) => state.startedAt)
  const logs = useCrawlerStore((state) => state.logs)
  const config = useCrawlerStore((state) => state.config)

  // Parse platform label
  const platformLabels: Record<string, string> = {
    xhs: 'Xiaohongshu',
    dy: 'Douyin',
    ks: 'Kuaishou',
    bili: 'Bilibili',
    wb: 'Weibo',
    tieba: 'Tieba',
    zhihu: 'Zhihu',
  }

  // Calculate elapsed time
  const elapsedText = startedAt
    ? (() => {
        const start = new Date(startedAt).getTime()
        const now = Date.now()
        const diff = Math.floor((now - start) / 1000)
        const m = Math.floor(diff / 60)
        const s = diff % 60
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      })()
    : '--:--'

  // Count log levels
  const successCount = logs.filter(l => l.level === 'success').length
  const errorCount = logs.filter(l => l.level === 'error').length
  const warnCount = logs.filter(l => l.level === 'warning').length

  return (
    <div className="rounded-lg border border-cyber-border-subtle bg-cyber-bg-secondary/50 p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyber-neon-cyan" />
          <span className="text-xs font-mono font-semibold text-cyber-neon-cyan tracking-wider">
            {t('status.active')}
          </span>
          {platform && (
            <span className="text-xs font-mono text-cyber-text-secondary">
              {platformLabels[platform] || platform}
            </span>
          )}
          {crawlerType && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyber-neon-cyan/10 text-cyber-neon-cyan border border-cyber-neon-cyan/20">
              {crawlerType}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-cyber-neon-green rounded-full shadow-glow-green-sm animate-pulse-fast" />
          <span className="text-[10px] font-mono text-cyber-neon-green">{elapsedText}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        <StatCard
          icon={<Globe className="w-4 h-4" />}
          label="爬取模式"
          value={crawlerType === 'search' ? `搜索: ${config.keywords || '-'}` : crawlerType || '-'}
          color="cyan"
        />
        <StatCard
          icon={<Clock className="w-4 h-4" />}
          label="运行时长"
          value={elapsedText}
          color="purple"
        />
        <StatCard
          icon={<FileText className="w-4 h-4" />}
          label="日志总数"
          value={logs.length}
          color="green"
        />
        <StatCard
          icon={<ArrowUp className="w-4 h-4" />}
          label="成功"
          value={successCount}
          color="green"
        />
        <StatCard
          icon={<MessageSquare className="w-4 h-4" />}
          label="警告/错误"
          value={warnCount + errorCount}
          color={errorCount > 0 ? 'pink' : 'orange'}
        />
      </div>
    </div>
  )
}
