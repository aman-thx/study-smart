import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AddCourseForm from '../components/AddCourseForm'
import CourseCard from '../components/CourseCard'
import GPASummary from '../components/GPASummary'
import GradeCharts from '../components/GradeCharts'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshGPA, setRefreshGPA] = useState(0)
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
    if (!user) return

    let isMounted = true

    async function fetchCourses() {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        
        if (!error && isMounted) {
          setCourses(data)
        }
      } catch (error) {
        console.error('Error fetching courses:', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchCourses()

    return () => {
      isMounted = false
    }
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const handleCourseAdded = (newCourse) => {
    setCourses(prevCourses => [newCourse, ...prevCourses])
  }

  const handleCourseDeleted = (courseId) => {
    setCourses(prevCourses => prevCourses.filter(c => c.id !== courseId))
    setRefreshGPA(prev => prev + 1)
  }

  const handleCalculateGPA = () => {
    setIsCalculating(true)
    setRefreshGPA(prev => prev + 1)
    
    setTimeout(() => {
      setIsCalculating(false)
    }, 500)
  }

  const handleDataUpdate = () => {
    setRefreshGPA(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">🎓 StudySmart</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700 hidden sm:inline">
                Welcome, <span className="font-semibold">{user?.user_metadata?.full_name || 'Student'}</span>
              </span>
              <button
                onClick={handleSignOut}
                className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition font-medium text-sm sm:text-base"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Calculate Button */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Your Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Track your courses, grades, and GPA
            </p>
          </div>
          
          {/* CALCULATE GPA BUTTON */}
          <button
            onClick={handleCalculateGPA}
            disabled={isCalculating || courses.length === 0}
            className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition ${
              isCalculating
                ? 'bg-green-100 text-green-700 cursor-wait'
                : courses.length === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isCalculating ? (
              <>
                <svg className="animate-spin h-5 w-5 text-green-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Calculating...</span>
              </>
            ) : (
              <>
                <span>📊</span>
                <span>Calculate GPA</span>
              </>
            )}
          </button>
        </div>

        {/* GPA Summary */}
        <GPASummary 
          courses={courses} 
          refreshTrigger={refreshGPA} 
        />

        {/* Grade Charts */}
        <GradeCharts 
          courses={courses} 
          refreshTrigger={refreshGPA} 
        />

        {/* Add Course Form */}
        <div className="mb-8">
          <AddCourseForm onCourseAdded={handleCourseAdded} />
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No courses yet</h3>
            <p className="text-gray-600 mb-6">Add your first course to get started</p>
            <button 
              onClick={() => {
                const addButton = document.querySelector('button[class*="Add Course"]')
                if (addButton) addButton.click()
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Add Your First Course
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map(course => (
              <CourseCard 
                key={course.id}
                course={course} 
                onDelete={handleCourseDeleted}
                onUpdate={handleDataUpdate}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}