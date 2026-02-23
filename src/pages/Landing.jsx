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
          Your AI Study Assistant
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Never miss a deadline. Know your grade in real-time. 
          Study smarter with AI-powered insights.
        </p>
        <Link 
          to="/signup"
          className="bg-blue-600 text-white text-lg px-8 py-3 rounded-lg hover:bg-blue-700 inline-block"
        >
          Get Started - It's Free
        </Link>
        
        {/* Stats */}
        <div className="flex justify-center gap-12 mt-16">
          <div>
            <div className="text-3xl font-bold">500+</div>
            <div className="text-gray-600">Active Students</div>
          </div>
          <div>
            <div className="text-3xl font-bold">10k+</div>
            <div className="text-gray-600">Deadlines Tracked</div>
          </div>
          <div>
            <div className="text-3xl font-bold">4.8⭐</div>
            <div className="text-gray-600">User Rating</div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Why Students Love StudySmart</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            emoji="📊"
            title="Grade Tracker"
            description="See all your courses and current grades in one place. Know exactly where you stand."
          />
          <FeatureCard 
            emoji="🤖"
            title="AI Insights"
            description="Get personalized study recommendations and grade predictions."
          />
          <FeatureCard 
            emoji="📅"
            title="Smart Calendar"
            description="Never miss a deadline with intelligent prioritization."
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-600">
        © 2026 StudySmart. Built for students, by a student.
      </footer>
    </div>
  )
}

function FeatureCard({ emoji, title, description }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow text-center">
      <div className="text-4xl mb-4">{emoji}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}