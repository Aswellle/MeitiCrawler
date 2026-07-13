import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  FolderOpen, HardDrive, FileJson, FileSpreadsheet, BarChart3, RefreshCw
} from 'lucide-react'
import { dataApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { formatFileSize } from '@/lib/utils'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  color: 'cyan' | 'pink' | 'green' | 'orange' | 'purple'
}

function StatCard({ icon, label, value, sub, color }: StatCardProps) {
  const colorMap = {
    cyan: 'border-cyber-neon-cyan/30 bg-cyber-neon-cyan/5 text-cyber-neon-cyan',
    pink: 'border-cyber-neon-pink/30 bg-cyber-neon-pink/5 text-cyber-neon-pink',
    green: 'border-cyber-neon-green/30 bg-cyber-neon-green/5 text-cyber-neon-green',
    orange: 'border-cyber-neon-orange/30 bg-cyber-neon-orange/5 text-cyber-neon-orange',
    purple: 'border-cyber-neon-purple/30 bg-cyber-neon-purple/5 text-cyber-neon-purple',
  }
  return (
    <div className={`rounded-lg border p-4 ${colorMap[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 rounded bg-black/20">{icon}</div>
      </div>
      <div className="text-2xl font-mono font-bold">{value}</div>
      <div className="text-xs font-mono opacity-70 mt-1">{label}</div>
      {sub && <div className="text-[10px] font-mono opacity-50 mt-0.5">{sub}</div>}
    </div>
  )
}

export function StatsOverview() {
  const { t } = useTranslation('data')
  const { t: tCommon } = useTranslation()

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dataStats'],
    queryFn: async () => {
      const { data } = await dataApi.getStats()
      return data
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-cyber-text-muted font-mono animate-pulse">
          {t('explorer.loading')}
        </div>
      </div>
    )
  }

  const hasData = data && data.total_files > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-cyber-neon-cyan" />
          <h2 className="text-sm font-mono font-bold text-cyber-neon-cyan tracking-wider">
            {t('stats.title')}
          </h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="h-8 text-xs font-mono"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isRefetching ? 'animate-spin' : ''}`} />
          {t('explorer.rescan')}
        </Button>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FolderOpen className="w-16 h-16 text-cyber-neon-cyan/20 mb-4" />
          <h3 className="text-lg font-mono font-medium text-cyber-neon-cyan mb-2">
            {t('explorer.noData')}
          </h3>
          <p className="text-sm text-cyber-text-muted max-w-md font-mono">
            {t('explorer.noDataHint')}
          </p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<FolderOpen className="w-5 h-5" />}
              label={t('stats.totalFiles')}
              value={data.total_files}
              color="cyan"
            />
            <StatCard
              icon={<HardDrive className="w-5 h-5" />}
              label={t('stats.totalSize')}
              value={formatFileSize(data.total_size)}
              color="purple"
            />
            <StatCard
              icon={<FileJson className="w-5 h-5" />}
              label={t('stats.byType')}
              value={Object.entries(data.by_type || {}).map(([k, v]) => `${k}: ${v}`).join(', ') || '-'}
              color="green"
            />
            <StatCard
              icon={<FileSpreadsheet className="w-5 h-5" />}
              label={t('stats.byPlatform')}
              value={Object.keys(data.by_platform || {}).length || 0}
              sub={Object.entries(data.by_platform || {}).map(([k, v]) => `${k}: ${v}`).join(', ')}
              color="orange"
            />
          </div>

          {/* Platform Breakdown */}
          {Object.keys(data.by_platform || {}).length > 0 && (
            <div>
              <h3 className="text-xs font-mono font-semibold text-cyber-text-secondary mb-3 tracking-wider uppercase">
                {t('stats.platformBreakdown')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(data.by_platform as Record<string, number>).map(([platform, count]) => {
                  const platformNames: Record<string, string> = {
                    xhs: '小红书', dy: '抖音', ks: '快手', bili: 'B站',
                    wb: '微博', tieba: '贴吧', zhihu: '知乎',
                  }
                  return (
                    <div
                      key={platform}
                      className="flex items-center justify-between rounded-lg border border-cyber-border-subtle bg-cyber-bg-tertiary/30 p-3"
                    >
                      <span className="text-xs font-mono text-cyber-text-primary">
                        {platformNames[platform] || platform}
                      </span>
                      <span className="text-sm font-mono font-bold text-cyber-neon-cyan">
                        {count} {tCommon('unit.files')}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
