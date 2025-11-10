interface ChartData {
  label: string
  value: number
  color?: string
}

interface SimpleChartProps {
  data: ChartData[]
  type?: 'bar' | 'line'
  height?: number
  showValues?: boolean
}

export default function SimpleChart({ 
  data, 
  type = 'bar', 
  height = 200,
  showValues = true 
}: SimpleChartProps) {
  const maxValue = Math.max(...data.map(d => d.value))
  
  if (type === 'bar') {
    return (
      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0
          const color = item.color || `hsl(${(index * 137.5) % 360}, 70%, 50%)`
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {item.label}
                </span>
                {showValues && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {item.value.toLocaleString('pt-BR')}
                  </span>
                )}
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: color
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Line chart (simplified)
  return (
    <div className="relative" style={{ height }}>
      <svg width="100%" height="100%" className="overflow-visible">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(y => (
          <line
            key={y}
            x1="0"
            y1={`${y}%`}
            x2="100%"
            y2={`${y}%`}
            stroke="currentColor"
            strokeWidth="1"
            className="text-gray-200 dark:text-gray-700"
            opacity="0.5"
          />
        ))}
        
        {/* Data points and lines */}
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 100
          const y = 100 - (maxValue > 0 ? (item.value / maxValue) * 100 : 0)
          const nextItem = data[index + 1]
          
          return (
            <g key={index}>
              {/* Line to next point */}
              {nextItem && (
                <line
                  x1={`${x}%`}
                  y1={`${y}%`}
                  x2={`${((index + 1) / (data.length - 1)) * 100}%`}
                  y2={`${100 - (maxValue > 0 ? (nextItem.value / maxValue) * 100 : 0)}%`}
                  stroke={item.color || '#6366f1'}
                  strokeWidth="2"
                  className="transition-all duration-300"
                />
              )}
              
              {/* Data point */}
              <circle
                cx={`${x}%`}
                cy={`${y}%`}
                r="4"
                fill={item.color || '#6366f1'}
                className="transition-all duration-300 hover:r-6"
              />
              
              {/* Label */}
              <text
                x={`${x}%`}
                y="100%"
                dy="20"
                textAnchor="middle"
                className="text-xs fill-gray-600 dark:fill-gray-400"
              >
                {item.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}