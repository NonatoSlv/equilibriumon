import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatItem {
  label: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
    period: string
  }
  icon?: React.ReactNode
  color?: 'blue' | 'green' | 'red' | 'purple' | 'yellow'
}

interface StatsGridProps {
  stats: StatItem[]
  columns?: 2 | 3 | 4 | 5
}

export default function StatsGrid({ stats, columns = 4 }: StatsGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
  }[columns]

  const colorConfig = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-400',
      icon: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-700 dark:text-green-400',
      icon: 'text-green-600'
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-700 dark:text-red-400',
      icon: 'text-red-600'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-800',
      text: 'text-purple-700 dark:text-purple-400',
      icon: 'text-purple-600'
    },
    yellow: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-700 dark:text-yellow-400',
      icon: 'text-yellow-600'
    }
  }

  return (
    <div className={`grid ${gridCols} gap-6`}>
      {stats.map((stat, index) => {
        const config = colorConfig[stat.color || 'blue']
        
        return (
          <div
            key={index}
            className={`
              ${config.bg} ${config.border}
              border rounded-xl p-6 transition-all duration-200 hover:shadow-md
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {stat.icon && (
                    <div className={config.icon}>
                      {stat.icon}
                    </div>
                  )}
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                </div>
                
                <p className={`text-2xl font-bold tracking-tight ${config.text}`}>
                  {typeof stat.value === 'number' 
                    ? stat.value.toLocaleString('pt-BR')
                    : stat.value
                  }
                </p>
                
                {stat.change && (
                  <div className="flex items-center gap-1 mt-2">
                    {stat.change.type === 'increase' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      stat.change.type === 'increase' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {Math.abs(stat.change.value)}%
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {stat.change.period}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}