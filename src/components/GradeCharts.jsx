import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function GradeCharts({ courses, refreshTrigger }) {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('bar')

  // Letter grade function matching your scale
  const getLetterGrade = (percentage) => {
    if (percentage >= 90) return 'A+'
    if (percentage >= 85) return 'A'
    if (percentage >= 80) return 'A-'
    if (percentage >= 75) return 'B+'
    if (percentage >= 70) return 'B'
    if (percentage >= 65) return 'B-'
    if (percentage >= 60) return 'C+'
    if (percentage >= 50) return 'C'
    if (percentage >= 45) return 'C-'
    if (percentage >= 40) return 'D'
    return 'F'
  }

  useEffect(() => {
    let isMounted = true

    async function fetchGradeData() {
      if (!courses || courses.length === 0) {
        if (isMounted) {
          setChartData([])
          setLoading(false)
        }
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
              grade: getLetterGrade(percentage)
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
    if (percentage >= 90) return '#22c55e' // green
    if (percentage >= 80) return '#3b82f6' // blue
    if (percentage >= 70) return '#eab308' // yellow
    if (percentage >= 60) return '#f97316' // orange
    if (percentage >= 50) return '#f97316' // orange
    if (percentage >= 45) return '#ef4444' // red
    if (percentage >= 40) return '#ef4444' // red
    return '#ef4444' // red
  }

  const getPieChartData = () => {
    const distribution = {
      'A+': { count: 0, color: '#22c55e', label: 'A+ (90-100]' },
      'A': { count: 0, color: '#22c55e', label: 'A [85-90)' },
      'A-': { count: 0, color: '#22c55e', label: 'A- [80-85)' },
      'B+': { count: 0, color: '#3b82f6', label: 'B+ [75-80)' },
      'B': { count: 0, color: '#3b82f6', label: 'B [70-75)' },
      'B-': { count: 0, color: '#3b82f6', label: 'B- [65-70)' },
      'C+': { count: 0, color: '#eab308', label: 'C+ [60-65)' },
      'C': { count: 0, color: '#f97316', label: 'C [50-60)' },
      'C-': { count: 0, color: '#ef4444', label: 'C- [45-50)' },
      'D': { count: 0, color: '#ef4444', label: 'D [40-45)' },
      'F': { count: 0, color: '#ef4444', label: 'F [0-40)' }
    }

    chartData.forEach(item => {
      const grade = getLetterGrade(item.percentage)
      if (distribution[grade]) {
        distribution[grade].count++
      }
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

  if (!courses || courses.length === 0) {
    return null
  }

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
        <p className="text-gray-500">Add assignments to courses to see charts</p>
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
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">{item.percentage.toFixed(1)}%</span>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                    item.percentage >= 90 ? 'bg-green-100 text-green-700' :
                    item.percentage >= 80 ? 'bg-blue-100 text-blue-700' :
                    item.percentage >= 70 ? 'bg-yellow-100 text-yellow-700' :
                    item.percentage >= 60 ? 'bg-orange-100 text-orange-700' :
                    item.percentage >= 50 ? 'bg-orange-100 text-orange-700' :
                    item.percentage >= 45 ? 'bg-red-100 text-red-600' :
                    item.percentage >= 40 ? 'bg-red-100 text-red-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {item.grade}
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="h-4 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${item.percentage}%`,
                    backgroundColor: getColorForPercentage(item.percentage)
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
          <div className="flex-1 space-y-2 max-h-64 overflow-y-auto">
            {Object.entries(pieData).map(([grade, data]) => (
              data.count > 0 && (
                <div key={grade} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: data.color }}></div>
                    <span className="text-sm text-gray-700">{data.label}</span>
                  </div>
                  <div className="text-sm font-medium">
                    <span className="text-gray-900">{data.count}</span>
                    <span className="text-gray-500 ml-1">({data.percentage}%)</span>
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
              <span>A+, A, A- (80-100%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>B+, B, B- (65-79%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>C+ (60-64%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span>C, C- (45-59%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>D, F (0-44%)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}