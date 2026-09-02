import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const BANNER_DISMISS_KEY = 'mediacrawler_site_banner_dismissed'

export function isBannerDismissed(): boolean {
  return localStorage.getItem(BANNER_DISMISS_KEY) === 'true'
}

export function clearBannerDismissed(): void {
  localStorage.removeItem(BANNER_DISMISS_KEY)
}

interface SiteBannerProps {
  className?: string
}

export function SiteBanner({ className }: SiteBannerProps) {
  const { t } = useTranslation('common')
  const [dismissed, setDismissed] = useState(() => isBannerDismissed())

  useEffect(() => {
    if (dismissed) {
      localStorage.setItem(BANNER_DISMISS_KEY, 'true')
    }
  }, [dismissed])

  if (dismissed) return null

  return (
    <div
      role="region"
      aria-label={t('banner.regionLabel')}
      className={cn(
        'relative flex items-center justify-center gap-3 px-4 py-2',
        'font-mono text-xs leading-relaxed',
        'bg-gradient-to-r from-cyber-neon-cyan/10 via-cyber-neon-pink/10 to-cyber-neon-cyan/10',
        'border-b border-cyber-neon-cyan/30',
        className
      )}
    >
      {/* Decorative glow line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyber-neon-cyan/60 to-transparent" />

      <span className="flex items-center gap-1.5 text-cyber-neon-cyan shrink-0">
        <Sparkles className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{t('banner.badge')}</span>
      </span>

      <p className="text-cyber-text-secondary text-center">
        <span className="text-cyber-text-primary font-medium">{t('banner.intro')}</span>
        <span className="mx-1.5 text-cyber-text-muted">—</span>
        <span>{t('banner.purpose')}</span>
      </p>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label={t('banner.dismiss')}
        className={cn(
          'shrink-0 p-1 rounded-md transition-all',
          'text-cyber-text-muted hover:text-cyber-neon-pink',
          'hover:bg-cyber-neon-pink/10 focus-visible:outline-none',
          'focus-visible:ring-2 focus-visible:ring-cyber-neon-cyan'
        )}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
