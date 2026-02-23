import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import CourseDetailsModal from './CourseDetailsModal'

export default function CourseCard({ course, onDelete, onUpdate }) {
  const [deleting, setDeleting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [stats, setStats] = useState({ earned: 0, allocated: 0, percentage: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function fetchCourseStats() {
      try {
        const { data, error } = await supabase
          .from('assignments')
          .select('max_grade, grade')
          .eq('course_id', course.id)
        
        if (!error && data && isMounted) {
          const totalAllocated = data.reduce((sum, a) => sum + (a.max_grade || 0), 0)
          const totalEarned = data.reduce((sum, a) => sum + (a.grade || 0), 0)
          const percentage = totalAllocated > 0 ? (totalEarned / totalAllocated) * 100 : 0
          
          setStats({
            earned: totalEarned,
            allocated: totalAllocated,
            percentage: percentage
          })
        }
      } catch (error) {
        console.error('Error fetching course stats:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchCourseStats()

    return () => {
      isMounted = false
    }
  }, [course.id])

  const handleDelete = async () => {
    if (!confirm(`Delete ${course.name} and all its assignments?`)) return
    
    setDeleting(true)
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', course.id)
    
    if (!error && onDelete) {
      onDelete(course.id)
    }
    setDeleting(false)
  }

  const getGradeColor = () => {
    if (stats.percentage >= 90) return 'text-green-600'
    if (stats.percentage >= 80) return 'text-blue-600'
    if (stats.percentage >= 70) return 'text-yellow-600'
    if (stats.percentage >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow hover:shadow-md transition border border-gray-200">
        <div className="p-5">
          {/* Header with Delete */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg text-gray-800">{course.name}</h3>
              {course.code && (
                <p className="text-sm text-gray-500">{course.code}</p>
              )}
            </div>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-red-400 hover:text-red-600 transition"
            >
              <span className="text-xl">×</span>
            </button>
          </div>
          
          {/* Credits and Grade Preview */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <span className="font-medium">{course.credits}</span>
                <span>credits</span>
              </div>
            </div>
            
            {/* Grade Preview */}
            {!loading && stats.allocated > 0 && (
              <div className={`text-right ${getGradeColor()}`}>
                <span className="text-2xl font-bold">{stats.percentage.toFixed(1)}%</span>
                <p className="text-xs text-gray-500">
                  {stats.earned.toFixed(1)} / {stats.allocated} pts
                </p>
              </div>
            )}
          </div>

          {/* Mini Progress Bar */}
          {!loading && stats.allocated > 0 && (
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`rounded-full h-1.5 ${
                  stats.percentage >= 90 ? 'bg-green-600' :
                  stats.percentage >= 80 ? 'bg-blue-600' :
                  stats.percentage >= 70 ? 'bg-yellow-600' :
                  stats.percentage >= 60 ? 'bg-orange-600' : 'bg-red-600'
                }`}
                style={{ width: `${Math.min(stats.percentage, 100)}%` }}
              ></div>
            </div>
          )}

          {/* Show Details Button */}
          <div className="mt-3">
            <button
              onClick={() => setShowModal(true)}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
            >
              ▶ Show Details
            </button>
          </div>
        </div>
      </div>

      {/* Modal Popup */}
      <CourseDetailsModal
        course={course}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onUpdate={onUpdate}
      />
    </>
  )
}