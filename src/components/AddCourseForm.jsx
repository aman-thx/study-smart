import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function AddCourseForm({ onCourseAdded }) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [credits, setCredits] = useState(3)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert([
          {
            user_id: user.id,
            name: name,
            code: code,
            credits: credits,
            semester: 'Spring 2026',
            year: 2026
          }
        ])
        .select()
      
      if (error) throw error
      
      setName('')
      setCode('')
      setCredits(3)
      setShowForm(false)
      
      if (onCourseAdded) {
        onCourseAdded(data[0])
      }
      
    } catch (error) {
      console.error('Error adding course:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
      >
        <span className="text-lg">+</span> Add Course
      </button>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Add New Course</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          ⚠️ {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Course Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="e.g., Introduction to Computer Science"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Course Code (optional)
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="e.g., CS101"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Credits
          </label>
          <input
            type="number"
            value={credits}
            onChange={(e) => setCredits(parseInt(e.target.value))}
            min="1"
            max="6"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300 flex-1"
          >
            {loading ? 'Adding...' : 'Save Course'}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}