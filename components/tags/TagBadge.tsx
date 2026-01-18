import { X } from 'lucide-react'
import type { Tag } from '@/types'

interface TagBadgeProps {
  tag: Tag
  onRemove?: () => void
  size?: 'sm' | 'md'
}

export function TagBadge({ tag, onRemove, size = 'sm' }: TagBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full ${sizeClasses[size]}`}
      style={{
        backgroundColor: tag.color + '20',
        color: tag.color,
      }}
    >
      {tag.name}
      {onRemove && (
        <button
          onClick={onRemove}
          className="hover:bg-black/10 rounded-full p-0.5"
        >
          <X size={size === 'sm' ? 12 : 14} />
        </button>
      )}
    </span>
  )
}
