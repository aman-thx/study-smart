import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function GPASummary({ courses, refreshTrigger }) {
  const [courseStats, setCourseStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [gpa, setGpa] = useState(0)
  const [totalCredits, setTotalCredits] = useState(0)
  const [lastUpdated, setLastUpdated] = useState(null)

  // GPA conversion scale (common 4.0 scale)
  const percentageToGPA = (percentage) => {
    if (percentage >= 93) return 4.0
    if (percentage >= 90) return 3.7
    if (percentage >= 87) return 3.3
    if (percentage >= 83) return 3.0
    if (percentage >= 80) return 2.7
    if (percentage >= 77) return 2.3
    if (percentage >= 73) return 2.0
    if (percentage >= 70) return 1.7
    if (percentage >= 67) return 1.3
    if (percentage >= 63) return 1.0
    if (percentage >= 60) return 0.7
    return 0.0
  }

  useEffect(() => {
    let isMounted = true

    async function fetchAllCourseStats() {
      if (!courses || courses.length === 0) {
        if (isMounted) setLoading(false)
        return
      }

      try {
        const stats = []
        let totalPoints = 0
        let totalCreditsSum = 0

        for (const course of courses) {
          const { data, error } = await supabase
            .from('assignments')
            .select('max_grade, grade')
            .eq('course_id', course.id)
          
          if (!error && data && isMounted) {
            const totalAllocated = data.reduce((sum, a) => sum + (a.max_grade || 0), 0)
            const totalEarned = data.reduce((sum, a) => sum + (a.grade || 0), 0)
            const percentage = totalAllocated > 0 ? (totalEarned / totalAllocated) * 100 : 0
            
            const courseGPA = percentageToGPA(percentage)
            
            stats.push({
              courseId: course.id,
              courseName: course.name,
              credits: course.credits,
              percentage: percentage,
              gpa: courseGPA,
              earned: totalEarned,
              allocated: totalAllocated
            })

            // Calculate weighted GPA
            if (course.credits > 0 && percentage > 0) {
              totalPoints += courseGPA * course.credits
              totalCreditsSum += course.credits
            }
          }
        }

        if (isMounted) {
          setCourseStats(stats)
          setTotalCredits(totalCreditsSum)
          setLastUpdated(new Date())
          
          // Calculate overall GPA
          if (totalCreditsSum > 0) {
            setGpa(totalPoints / totalCreditsSum)
          } else {
            setGpa(0)
          }
        }

      } catch (error) {
        console.error('Error fetching course stats:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchAllCourseStats()

    return () => {
      isMounted = false
    }
  }, [courses, refreshTrigger])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6 text-center">
        <p className="text-gray-500">Add courses to see your GPA</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      {/* GPA Summary Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 -m-6 mb-6 p-6 rounded-t-lg text-white">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <p className="text-blue-100 text-sm">Overall GPA</p>
            <p className="text-4xl font-bold">{gpa.toFixed(2)}</p>
          </div>
          <div className="flex gap-8 mt-4 md:mt-0">
            <div className="text-center">
              <p className="text-blue-100 text-sm">Total Credits</p>
              <p className="text-2xl font-bold">{totalCredits}</p>
            </div>
            <div className="text-center">
              <p className="text-blue-100 text-sm">Courses</p>
              <p className="text-2xl font-bold">{courses.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Breakdown */}
      <h3 className="font-semibold text-gray-800 mb-3">Course Breakdown</h3>
      <div className="space-y-3">
        {courseStats.map((stat, index) => (
          <div key={index} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="font-medium text-gray-800">{stat.courseName}</span>
                <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded">
                  {stat.credits} {stat.credits === 1 ? 'credit' : 'credits'}
                </span>
              </div>
              <div className="text-right">
                <span className={`font-bold ${
                  stat.percentage >= 90 ? 'text-green-600' :
                  stat.percentage >= 80 ? 'text-blue-600' :
                  stat.percentage >= 70 ? 'text-yellow-600' :
                  stat.percentage >= 60 ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {stat.percentage.toFixed(1)}%
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  (GPA: {stat.gpa.toFixed(2)})
                </span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`rounded-full h-1.5 ${
                  stat.percentage >= 90 ? 'bg-green-600' :
                  stat.percentage >= 80 ? 'bg-blue-600' :
                  stat.percentage >= 70 ? 'bg-yellow-600' :
                  stat.percentage >= 60 ? 'bg-orange-600' : 'bg-red-600'
                }`}
                style={{ width: `${Math.min(stat.percentage, 100)}%` }}
              ></div>
            </div>
            
            {/* Points */}
            {stat.allocated > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {stat.earned.toFixed(1)} / {stat.allocated} points earned
              </p>
            )}
          </div>
        ))}
      </div>

      {/* GPA Legend and Last Updated */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
        <p className="text-xs text-gray-500">Based on standard 4.0 GPA scale</p>
        {lastUpdated && (
          <p className="text-xs text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  )
}