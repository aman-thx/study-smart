import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AddAssignmentForm({ courseId, onAssignmentAdded }) {
  const [name, setName] = useState('')
  const [maxScore, setMaxScore] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const maxScoreNum = parseFloat(maxScore)
    
    if (maxScoreNum <= 0) {
      setError('Max score must be greater than 0')
      setLoading(false)
      return
    }
    
    try {
      const { data, error } = await supabase
        .from('assignments')
        .insert([
          {
            course_id: courseId,
            name: name,
            max_grade: maxScoreNum,
            weight: maxScoreNum,
            due_date: dueDate || null,
            completed: false,
            grade: null
          }
        ])
        .select()
      
      if (error) throw error
      
      setName('')
      setMaxScore('')
      setDueDate('')
      setShowForm(false)
      setError('')
      if (onAssignmentAdded) onAssignmentAdded(data[0])
      
    } catch (error) {
      console.error('Error adding assignment:', error)
      setError(error.message || 'Failed to add assignment')
    } finally {
      setLoading(false)
    }
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition flex items-center justify-center gap-1"
      >
        <span className="text-lg">+</span> Add Assignment
      </button>
    )
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
      <h4 className="font-medium text-gray-700 mb-3">New Assignment</h4>
      
      {error && (
        <div className="mb-3 p-2 bg-red-100 text-red-700 text-sm rounded">
          ⚠️ {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Assignment name (e.g., Midterm Exam)"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Points Possible
          </label>
          <input
            type="number"
            value={maxScore}
            onChange={(e) => setMaxScore(e.target.value)}
            placeholder="e.g., 20, 30, 50"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            required
            min="1"
            step="0.1"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Due Date (optional)</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-3 py-1.5 text-sm rounded hover:bg-blue-700 transition disabled:bg-blue-300 flex-1"
          >
            {loading ? 'Adding...' : 'Save Assignment'}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="bg-gray-200 text-gray-700 px-3 py-1.5 text-sm rounded hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}