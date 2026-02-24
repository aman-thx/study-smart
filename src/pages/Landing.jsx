import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 max-w-6xl mx-auto">
        <div className="text-2xl font-bold text-blue-600">🎓 StudySmart</div>
        <div>
          <Link to="/login" className="mr-4 text-gray-600 hover:text-gray-900">
            Login
          </Link>
          <Link 
            to="/signup" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center py-20 px-4">
        <h1 className="text-5xl font-bold mb-6">
          Take Control of Your Grades
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Track courses, calculate GPA, and visualize your academic progress — all in one place.
        </p>
        <Link 
          to="/signup"
          className="bg-blue-600 text-white text-lg px-8 py-3 rounded-lg hover:bg-blue-700 inline-block"
        >
          Get Started — It's Free
        </Link>
        
        {/* Stats */}
        <div className="flex justify-center gap-12 mt-16">
          <div>
            <div className="text-3xl font-bold">100<span className="text-blue-600">%</span></div>
            <div className="text-gray-600">Point-based grading</div>
          </div>
          <div>
            <div className="text-3xl font-bold">4.0</div>
            <div className="text-gray-600">GPA scale</div>
          </div>
          <div>
            <div className="text-3xl font-bold">📊</div>
            <div className="text-gray-600">Visual analytics</div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Why Students Love StudySmart</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            emoji="📚"
            title="Course Management"
            description="Add all your courses with custom names, codes, and credit hours. Keep everything organized in one place."
          />
          <FeatureCard 
            emoji="✅"
            title="Assignment Tracking"
            description="Track assignments, due dates, and points. Mark complete and enter grades as you go."
          />
          <FeatureCard 
            emoji="📊"
            title="GPA Calculator"
            description="Automatic GPA calculation on a standard 4.0 scale. Weighted by credit hours for accuracy."
          />
          <FeatureCard 
            emoji="📈"
            title="Grade Visualization"
            description="See your progress with beautiful bar charts and pie charts. Know where you stand at a glance."
          />
          <FeatureCard 
            emoji="🎯"
            title="100-Point System"
            description="Each course follows a clear 100-point allocation model. No confusing percentages or weights."
          />
          <FeatureCard 
            emoji="🔐"
            title="Secure & Private"
            description="Your data is protected with Supabase authentication. Only you can see your grades."
          />
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-blue-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Add Your Courses</h3>
              <p className="text-gray-600">Enter your courses with names, codes, and credit hours.</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">Track Assignments</h3>
              <p className="text-gray-600">Add assignments with point values and due dates.</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Watch Your GPA Grow</h3>
              <p className="text-gray-600">Enter grades and see your GPA update in real-time.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-8">Trusted by Students</h2>
        <div className="bg-white p-8 rounded-xl shadow">
          <p className="text-lg text-gray-700 italic mb-4">
            "StudySmart helped me keep track of all my courses this semester. The grade visualizer is so satisfying to watch as I complete assignments!"
          </p>
          <p className="font-semibold">— Software Engineering student</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-600 border-t">
        <p>© 2026 StudySmart. Built for students, by a student.</p>
      </footer>
    </div>
  )
}

function FeatureCard({ emoji, title, description }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
      <div className="text-4xl mb-4">{emoji}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
