import * as React from 'react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, id, ...props }, ref) => {
    return (
      <label htmlFor={id} className="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          ref={ref}
          id={id}
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          {...props}
        />
        <div
          aria-hidden="true"
          className={cn(
            'h-4 w-4 shrink-0 rounded-sm border border-cyber-border-DEFAULT bg-cyber-bg-tertiary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber-neon-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-cyber-bg-primary disabled:cursor-not-allowed disabled:opacity-50 peer-checked:bg-cyber-neon-cyan/20 peer-checked:border-cyber-neon-cyan peer-checked:shadow-glow-cyan-sm flex items-center justify-center transition-all',
            className
          )}
        >
          <Check className={cn('h-3 w-3 text-cyber-neon-cyan transition-opacity', checked ? 'opacity-100' : 'opacity-0')} />
        </div>
      </label>
    )
  }
)

export { Checkbox }
