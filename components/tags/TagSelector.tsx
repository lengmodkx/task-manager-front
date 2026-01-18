'use client'

import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import type { Tag } from '@/types'

interface TagSelectorProps {
  tags: Tag[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export function TagSelector({ tags, selectedIds, onChange }: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = (tagId: string) => {
    if (selectedIds.includes(tagId)) {
      onChange(selectedIds.filter((id) => id !== tagId))
    } else {
      onChange([...selectedIds, tagId])
    }
  }

  const selectedTags = tags.filter((t) => selectedIds.includes(t.id))

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-left flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
      >
        <span className="flex flex-wrap gap-1">
          {selectedTags.length > 0 ? (
            selectedTags.map((tag) => (
              <span
                key={tag.id}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: tag.color + '20',
                  color: tag.color,
                }}
              >
                {tag.name}
              </span>
            ))
          ) : (
            <span className="text-gray-400 dark:text-gray-500">选择标签</span>
          )}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform text-gray-500 dark:text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
            {tags.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">暂无标签</div>
            ) : (
              <>
                {/* System tags */}
                {tags.filter((t) => t.type === 'system').length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50">
                      系统标签
                    </div>
                    {tags
                      .filter((t) => t.type === 'system')
                      .map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggle(tag.id)}
                          className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <span
                            className="text-sm px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: tag.color + '20',
                              color: tag.color,
                            }}
                          >
                            {tag.name}
                          </span>
                          {selectedIds.includes(tag.id) && (
                            <Check size={16} className="text-blue-500 dark:text-blue-400" />
                          )}
                        </button>
                      ))}
                  </div>
                )}

                {/* Personal tags */}
                {tags.filter((t) => t.type === 'personal').length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50">
                      个人标签
                    </div>
                    {tags
                      .filter((t) => t.type === 'personal')
                      .map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggle(tag.id)}
                          className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <span
                            className="text-sm px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: tag.color + '20',
                              color: tag.color,
                            }}
                          >
                            {tag.name}
                          </span>
                          {selectedIds.includes(tag.id) && (
                            <Check size={16} className="text-blue-500 dark:text-blue-400" />
                          )}
                        </button>
                      ))}
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
