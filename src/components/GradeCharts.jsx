import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function GradeCharts({ courses, refreshTrigger }) {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('bar')

  useEffect(() => {
    let isMounted = true

    async function fetchGradeData() {
      if (!courses || courses.length === 0) {
        if (isMounted) setLoading(false)
        return
      }

      try {
        const data = []
        
        for (const course of courses) {
          const { data: assignments, error } = await supabase
            .from('assignments')
            .select('max_grade, grade')
            .eq('course_id', course.id)
          
          if (!error && assignments && isMounted) {
            const totalAllocated = assignments.reduce((sum, a) => sum + (a.max_grade || 0), 0)
            const totalEarned = assignments.reduce((sum, a) => sum + (a.grade || 0), 0)
            const percentage = totalAllocated > 0 ? (totalEarned / totalAllocated) * 100 : 0
            
            data.push({
              name: course.name || course.code || `Course ${course.id.slice(0, 4)}`,
              percentage: percentage,
              credits: course.credits,
              earned: totalEarned,
              allocated: totalAllocated,
              color: getColorForPercentage(percentage)
            })
          }
        }
        
        if (isMounted) {
          setChartData(data)
        }
      } catch (error) {
        console.error('Error fetching chart data:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchGradeData()

    return () => {
      isMounted = false
    }
  }, [courses, refreshTrigger])

  const getColorForPercentage = (percentage) => {
    if (percentage >= 90) return '#22c55e'
    if (percentage >= 80) return '#3b82f6'
    if (percentage >= 70) return '#eab308'
    if (percentage >= 60) return '#f97316'
    return '#ef4444'
  }

  const getPieChartData = () => {
    const distribution = {
      A: { count: 0, color: '#22c55e', label: 'A (90-100%)' },
      B: { count: 0, color: '#3b82f6', label: 'B (80-89%)' },
      C: { count: 0, color: '#eab308', label: 'C (70-79%)' },
      D: { count: 0, color: '#f97316', label: 'D (60-69%)' },
      F: { count: 0, color: '#ef4444', label: 'F (0-59%)' }
    }

    chartData.forEach(item => {
      if (item.percentage >= 90) distribution.A.count++
      else if (item.percentage >= 80) distribution.B.count++
      else if (item.percentage >= 70) distribution.C.count++
      else if (item.percentage >= 60) distribution.D.count++
      else distribution.F.count++
    })

    return distribution
  }

  const calculatePieSegments = () => {
    const distribution = getPieChartData()
    const total = chartData.length
    if (total === 0) return []

    let currentAngle = 0
    const segments = []

    Object.entries(distribution).forEach(([grade, data]) => {
      if (data.count > 0) {
        const angle = (data.count / total) * 360
        const startAngle = currentAngle
        const endAngle = currentAngle + angle
        
        const startRad = (startAngle - 90) * Math.PI / 180
        const endRad = (endAngle - 90) * Math.PI / 180
        
        const x1 = 50 + 40 * Math.cos(startRad)
        const y1 = 50 + 40 * Math.sin(startRad)
        const x2 = 50 + 40 * Math.cos(endRad)
        const y2 = 50 + 40 * Math.sin(endRad)
        
        const largeArcFlag = angle > 180 ? 1 : 0
        
        segments.push({
          path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`,
          color: data.color,
          grade,
          count: data.count,
          label: data.label,
          percentage: ((data.count / total) * 100).toFixed(1)
        })
        
        currentAngle += angle
      }
    })

    return segments
  }

  const pieSegments = calculatePieSegments()
  const pieData = getPieChartData()

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6 text-center">
        <p className="text-gray-500">Add courses and grades to see charts</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      {/* Header with View Toggle */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Grade Visualization</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('bar')}
            className={`px-3 py-1 text-sm rounded transition ${
              viewMode === 'bar' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Bar Chart
          </button>
          <button
            onClick={() => setViewMode('pie')}
            className={`px-3 py-1 text-sm rounded transition ${
              viewMode === 'pie' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Pie Chart
          </button>
        </div>
      </div>

      {/* Chart View */}
      {viewMode === 'bar' ? (
        <div className="space-y-4">
          {chartData.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{item.name}</span>
                <span className="text-gray-600">{item.percentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="h-4 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${item.percentage}%`,
                    backgroundColor: item.color
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{item.earned.toFixed(1)} / {item.allocated} pts</span>
                <span>{item.credits} credits</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* SVG Pie Chart */}
          <div className="w-64 h-64">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {pieSegments.map((segment, index) => (
                <path
                  key={index}
                  d={segment.path}
                  fill={segment.color}
                  stroke="white"
                  strokeWidth="1"
                >
                  <title>{segment.label}: {segment.count} courses ({segment.percentage}%)</title>
                </path>
              ))}
              <circle cx="50" cy="50" r="20" fill="white" className="opacity-90" />
              <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" className="text-xs font-bold">
                {chartData.length}
              </text>
              <text x="50" y="62" textAnchor="middle" dominantBaseline="middle" className="text-[8px] text-gray-500">
                courses
              </text>
            </svg>
          </div>

          {/* Pie Chart Legend */}
          <div className="flex-1 space-y-2">
            {Object.entries(pieData).map(([grade, data]) => (
              data.count > 0 && (
                <div key={grade} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: data.color }}></div>
                    <span className="text-sm text-gray-700">{data.label}</span>
                  </div>
                  <div className="text-sm font-medium">
                    <span className="text-gray-900">{data.count}</span>
                    <span className="text-gray-500 ml-1">({((data.count / chartData.length) * 100).toFixed(1)}%)</span>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Legend (for bar chart) */}
      {viewMode === 'bar' && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>A (90-100%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>B (80-89%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>C (70-79%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span>D (60-69%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>F (0-59%)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}