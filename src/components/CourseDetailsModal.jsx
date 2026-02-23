import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import AddAssignmentForm from './AddAssignmentForm'

export default function CourseDetailsModal({ course, isOpen, onClose, onUpdate }) {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [validationError, setValidationError] = useState('')
  const [editingGrade, setEditingGrade] = useState({ id: null, value: '' })

  useEffect(() => {
    if (isOpen && course) {
      fetchAssignments()
    }
  }, [isOpen, course])

  async function fetchAssignments() {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('course_id', course.id)
        .order('created_at', { ascending: true })

      if (!error) {
        setAssignments(data || [])
      }
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const validateGrade = (grade, maxScore) => {
    if (grade === '') return { valid: true }
    const num = parseFloat(grade)
    if (isNaN(num)) return { valid: true }
    if (num < 0) return { valid: false, error: 'Score cannot be negative' }
    if (num > maxScore)
      return { valid: false, error: `Score cannot exceed ${maxScore} points` }
    return { valid: true }
  }

  const updateGrade = async (assignmentId, gradeValue, maxScore) => {
    const validation = validateGrade(gradeValue, maxScore)

    if (!validation.valid) {
      setValidationError(validation.error)
      setTimeout(() => setValidationError(''), 3000)
      return
    }

    const earnedScore = gradeValue === '' ? null : parseFloat(gradeValue)

    const { error } = await supabase
      .from('assignments')
      .update({ grade: earnedScore })
      .eq('id', assignmentId)

    if (!error) {
      setAssignments(prev =>
        prev.map(a =>
          a.id === assignmentId ? { ...a, grade: earnedScore } : a
        )
      )
      if (onUpdate) onUpdate()
    }
  }

  const toggleComplete = async (assignment) => {
    const newCompleted = !assignment.completed

    const { error } = await supabase
      .from('assignments')
      .update({ completed: newCompleted })
      .eq('id', assignment.id)

    if (!error) {
      setAssignments(prev =>
        prev.map(a =>
          a.id === assignment.id ? { ...a, completed: newCompleted } : a
        )
      )
      if (onUpdate) onUpdate()
    }
  }

  const handleAssignmentAdded = (newAssignment) => {
    setAssignments(prev => [...prev, newAssignment])
    if (onUpdate) onUpdate()
  }

  const totalAllocated = assignments.reduce((sum, a) => sum + (a.max_grade || 0), 0)
  const totalEarned = assignments.reduce((sum, a) => sum + (a.grade || 0), 0)
  const remainingAllocation = Math.max(0, 100 - totalAllocated)
  const coursePercentage = totalAllocated > 0 ? (totalEarned / totalAllocated) * 100 : 0
  const courseFullyAllocated = totalAllocated >= 100

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{course.name}</h2>
              {course.code && (
                <p className="text-sm text-gray-500">{course.code} • {course.credits} credits</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <span className="text-3xl">&times;</span>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {validationError && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded-lg">
                ⚠️ {validationError}
              </div>
            )}

            {/* Course Summary */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Course Grade:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {coursePercentage.toFixed(1)}%
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                <div
                  className="bg-blue-600 rounded-full h-3 transition-all duration-300"
                  style={{ width: `${coursePercentage}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs text-center">
                <div className="bg-white p-2 rounded">
                  <span className="block font-bold text-blue-600">{totalEarned.toFixed(1)}</span>
                  <span className="text-gray-500">Points Earned</span>
                </div>
                <div className="bg-white p-2 rounded">
                  <span className="block font-bold text-indigo-600">{totalAllocated}</span>
                  <span className="text-gray-500">Points Allocated</span>
                </div>
                <div className="bg-white p-2 rounded">
                  <span className="block font-bold text-amber-600">{remainingAllocation}</span>
                  <span className="text-gray-500">Remaining</span>
                </div>
              </div>
            </div>

            {/* Assignments List */}
            {loading ? (
              <p className="text-sm text-gray-500">Loading assignments...</p>
            ) : assignments.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No assignments yet</p>
            ) : (
              <div className="space-y-3 mb-4">
                {assignments.map(assignment => (
                  <div key={assignment.id} className="border border-gray-200 rounded-lg p-3 bg-white">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={assignment.completed}
                        onChange={() => toggleComplete(assignment)}
                        className="mt-1 w-4 h-4 text-blue-600"
                      />

                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className={`font-medium ${
                            assignment.completed ? 'line-through text-gray-400' : 'text-gray-800'
                          }`}>
                            {assignment.name}
                          </span>
                          <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded">
                            {assignment.max_grade} pts
                          </span>
                        </div>

                        {assignment.completed && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex items-center border rounded-lg overflow-hidden">
                              <input
                                type="number"
                                value={editingGrade.id === assignment.id ? editingGrade.value : (assignment.grade ?? '')}
                                onChange={(e) => setEditingGrade({ 
                                  id: assignment.id, 
                                  value: e.target.value 
                                })}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    updateGrade(
                                      assignment.id,
                                      editingGrade.value,
                                      assignment.max_grade
                                    )
                                    setEditingGrade({ id: null, value: '' })
                                  }
                                }}
                                onBlur={() => {
                                  if (editingGrade.id === assignment.id) {
                                    updateGrade(
                                      assignment.id,
                                      editingGrade.value,
                                      assignment.max_grade
                                    )
                                    setEditingGrade({ id: null, value: '' })
                                  }
                                }}
                                className="w-20 px-2 py-1 text-sm border-none focus:ring-0"
                                placeholder="Score"
                                min="0"
                                max={assignment.max_grade}
                                step="0.1"
                              />
                              <span className="px-2 py-1 bg-gray-100 text-sm text-gray-600">
                                / {assignment.max_grade}
                              </span>
                            </div>
                            
                            {editingGrade.id === assignment.id && (
                              <button
                                onClick={() => {
                                  updateGrade(
                                    assignment.id,
                                    editingGrade.value,
                                    assignment.max_grade
                                  )
                                  setEditingGrade({ id: null, value: '' })
                                }}
                                className="bg-green-500 text-white px-3 py-1 text-sm rounded hover:bg-green-600 transition"
                              >
                                OK
                              </button>
                            )}
                            
                            {assignment.grade !== null && editingGrade.id !== assignment.id && (
                              <span className="text-xs text-gray-500">
                                {((assignment.grade / assignment.max_grade) * 100).toFixed(0)}%
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Assignment */}
            {courseFullyAllocated ? (
              <div className="mt-4">
                <button
                  disabled
                  className="w-full py-2 border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400 rounded-lg cursor-not-allowed flex items-center justify-center gap-1"
                >
                  <span className="text-lg">+</span> Add Assignment
                </button>
                <p className="text-xs text-amber-600 mt-1 text-center">
                  Course fully allocated (100/100 points assigned)
                </p>
              </div>
            ) : (
              <AddAssignmentForm
                courseId={course.id}
                remainingAllocation={remainingAllocation}
                onAssignmentAdded={handleAssignmentAdded}
              />
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-gray-50 rounded-b-lg">
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}